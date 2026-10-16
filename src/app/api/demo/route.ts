import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool, ToolResultBlockParam, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { DEMO_SYSTEM_PROMPT } from "@/lib/demo-knowledge";

export const runtime = "nodejs";

const MODEL = "claude-opus-5";
const MAX_TURNS = 10;
const MAX_MESSAGE_LENGTH = 500;
const MAX_TOOL_STEPS = 3;

// Public, unauthenticated endpoint — keep it cheap and abuse-resistant.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 15;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Demo-only tools. Both are pure simulations — no calendar, no email, no
 * real meeting provider. They exist so the demo can show what an agent
 * *doing* something (not just talking) looks like, without touching any
 * real system.
 */
const DEMO_TOOLS: Tool[] = [
  {
    name: "schedule_appointment",
    description:
      "Agenda una cita/reserva de ejemplo en Café Aurora. Simulación únicamente — no escribe en ningún calendario real.",
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Motivo breve, ej. 'Reserva de mesa para 4'" },
        fecha: { type: "string", description: "Fecha en formato legible, ej. 'Viernes 5 de septiembre'" },
        hora: { type: "string", description: "Hora, ej. '7:00 p.m.'" },
        nombre: { type: "string", description: "Nombre de quien reserva, si lo dio" },
      },
      required: ["motivo", "fecha", "hora"],
    },
  },
  {
    name: "create_meeting",
    description:
      "Genera un enlace de reunión de ejemplo para simular una videollamada agendada. Simulación únicamente — no crea una reunión real de Google Meet ni de ningún otro proveedor.",
    input_schema: {
      type: "object",
      properties: {
        tema: { type: "string", description: "Tema de la reunión" },
        fecha: { type: "string", description: "Fecha, si se mencionó" },
        hora: { type: "string", description: "Hora, si se mencionó" },
      },
      required: ["tema"],
    },
  },
];

type AppointmentResult = {
  id: string;
  motivo: string;
  fecha: string;
  hora: string;
  nombre: string | null;
};

type MeetingResult = {
  tema: string;
  fecha: string | null;
  hora: string | null;
  codigo: string;
  enlace: string;
};

function randomCode(length: number): string {
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
}

function runTool(name: string, input: Record<string, unknown>): AppointmentResult | MeetingResult | { error: string } {
  if (name === "schedule_appointment") {
    return {
      id: `DEMO-${randomCode(6)}`,
      motivo: String(input.motivo ?? ""),
      fecha: String(input.fecha ?? ""),
      hora: String(input.hora ?? ""),
      nombre: input.nombre ? String(input.nombre) : null,
    };
  }
  if (name === "create_meeting") {
    const codigo = randomCode(6).toLowerCase();
    return {
      tema: String(input.tema ?? ""),
      fecha: input.fecha ? String(input.fecha) : null,
      hora: input.hora ? String(input.hora) : null,
      codigo,
      enlace: `/demo/meet/${codigo}`,
    };
  }
  return { error: "unknown_tool" };
}

// In-memory sliding-window counter per IP. Best-effort only (resets on
// deploy, not shared across instances) — there's no shared store in this
// deployment, and this is a low-stakes marketing demo, not a security boundary.
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(key, recent);

  if (requestLog.size > 5000) {
    for (const [entryKey, timestamps] of requestLog) {
      if (timestamps.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) requestLog.delete(entryKey);
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isValidHistory(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TURNS) return false;
  if (value.at(-1)?.role !== "user") return false;

  return value.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const record = entry as Record<string, unknown>;
    return (
      (record.role === "user" || record.role === "assistant") &&
      typeof record.content === "string" &&
      record.content.trim().length > 0 &&
      record.content.length <= MAX_MESSAGE_LENGTH
    );
  });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "chat_not_configured" }, { status: 503 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = (payload as { messages?: unknown })?.messages;
  if (!isValidHistory(messages)) {
    return Response.json({ error: "invalid_payload" }, { status: 422 });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }

      try {
        const conversation: MessageParam[] = messages;

        for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
          const stream = client.messages.stream({
            model: MODEL,
            max_tokens: 512,
            system: DEMO_SYSTEM_PROMPT,
            tools: DEMO_TOOLS,
            output_config: { effort: "low" },
            messages: conversation,
          });

          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              emit({ type: "text", delta: event.delta.text });
            }
          }

          const final = await stream.finalMessage();
          conversation.push({ role: "assistant", content: final.content });

          const toolUses = final.content.filter((block): block is ToolUseBlock => block.type === "tool_use");
          if (final.stop_reason !== "tool_use" || toolUses.length === 0) break;

          const toolResults: ToolResultBlockParam[] = toolUses.map((toolUse) => {
            const result = runTool(toolUse.name, (toolUse.input as Record<string, unknown>) ?? {});
            emit({ type: "action", action: toolUse.name, data: result });
            return { type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result) };
          });
          conversation.push({ role: "user", content: toolResults });
        }
      } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) {
          console.error("[demo] invalid ANTHROPIC_API_KEY", error);
        } else if (error instanceof Anthropic.RateLimitError) {
          console.error("[demo] rate limited upstream", error);
        } else if (error instanceof Anthropic.APIError) {
          console.error(`[demo] API error ${error.status}`, error.message);
        } else {
          console.error("[demo] streaming failed", error);
        }
        emit({ type: "text", delta: "\n\nTuve un problema para responder. Intenta de nuevo en unos segundos." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
