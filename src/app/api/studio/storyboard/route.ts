import Anthropic from "@anthropic-ai/sdk";
import type { Tool, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { asString, guardStudio, readJson, studioError } from "@/lib/studio/guard";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = "claude-opus-5-5";
const MAX_IDEA_LENGTH = 3000;
const MAX_SCENES = 24;

const STORYBOARD_SYSTEM_PROMPT = `Eres director de fotografía y guionista de videos generados con IA (PixVerse, Kling, Veo).
Conviertes una idea en un guion visual dividido en escenas consecutivas que, unidas, forman un solo video largo y coherente.

Reglas para cada escena:
- "prompt" en inglés (los modelos de video rinden mejor), 40–90 palabras, autocontenido: describe sujeto, acción, entorno, iluminación, lente y movimiento de cámara.
- Repite en cada prompt los rasgos fijos del personaje principal (edad, rostro, cabello, ropa) y del lugar para mantener continuidad entre escenas.
- Una sola acción principal por escena; la siguiente escena continúa justo donde terminó la anterior.
- Estilo fotorrealista y cinematográfico salvo que la idea pida otra cosa.
- "title" y "narration" en español. "narration" es opcional: una frase corta de locución o diálogo para esa escena.`;

const STORYBOARD_TOOL: Tool = {
  name: "save_storyboard",
  description: "Guarda el guion visual escena por escena.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Título del video, en español" },
      scenes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            prompt: { type: "string" },
            narration: { type: "string" },
          },
          required: ["title", "prompt"],
        },
      },
    },
    required: ["title", "scenes"],
  },
};

type Storyboard = { title: string; scenes: Array<{ title: string; prompt: string; narration?: string }> };

/** Body: { idea, sceneCount, style? } → { title, scenes[] } */
export async function POST(request: Request) {
  const apiKey = guardStudio(request, "anthropic");
  if (typeof apiKey !== "string") return apiKey;

  const body = await readJson(request);
  const idea = asString(body?.idea, MAX_IDEA_LENGTH);
  const style = asString(body?.style, 300);
  const sceneCount =
    typeof body?.sceneCount === "number" ? Math.min(MAX_SCENES, Math.max(2, Math.round(body.sceneCount))) : 6;
  if (!idea) return studioError("invalid_payload", 422);

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: STORYBOARD_SYSTEM_PROMPT,
      tools: [STORYBOARD_TOOL],
      tool_choice: { type: "tool", name: STORYBOARD_TOOL.name },
      messages: [
        {
          role: "user",
          content: `Idea: ${idea}\n${style ? `Estilo visual: ${style}\n` : ""}Divide el video en exactamente ${sceneCount} escenas.`,
        },
      ],
    });

    const toolUse = message.content.find((block): block is ToolUseBlock => block.type === "tool_use");
    const storyboard = toolUse?.input as Storyboard | undefined;
    if (!storyboard || !Array.isArray(storyboard.scenes) || storyboard.scenes.length === 0) {
      return studioError("storyboard_empty", 502);
    }

    return Response.json({
      title: String(storyboard.title ?? ""),
      scenes: storyboard.scenes.slice(0, MAX_SCENES).map((s) => ({
        title: String(s.title ?? ""),
        prompt: String(s.prompt ?? ""),
        narration: s.narration ? String(s.narration) : "",
      })),
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[studio:storyboard] API error ${error.status}`, error.message);
    } else {
      console.error("[studio:storyboard] failed", error);
    }
    return studioError("anthropic_upstream_error", 502);
  }
}
