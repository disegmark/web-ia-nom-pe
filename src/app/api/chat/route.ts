import Anthropic from "@anthropic-ai/sdk";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-knowledge";

export const runtime = "nodejs";

const MODEL = "claude-opus-5";
const MAX_TURNS = 12;
const MAX_MESSAGE_LENGTH = 2000;

type ChatMessage = { role: "user" | "assistant"; content: string };

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

  let stream: ReturnType<typeof client.messages.stream>;
  try {
    stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages,
    });
  } catch (error) {
    console.error("[chat] failed to start stream", error);
    return Response.json({ error: "upstream_error" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) {
          console.error("[chat] invalid ANTHROPIC_API_KEY", error);
        } else if (error instanceof Anthropic.RateLimitError) {
          console.error("[chat] rate limited", error);
        } else if (error instanceof Anthropic.APIError) {
          console.error(`[chat] API error ${error.status}`, error.message);
        } else {
          console.error("[chat] streaming failed", error);
        }
        controller.enqueue(
          encoder.encode("\n\nTuve un problema para responder. Escríbenos por WhatsApp y te ayudamos directamente."),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
