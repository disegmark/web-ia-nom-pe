import { parseVoiceSettings, synthesize } from "@/lib/studio/elevenlabs";
import { asString, guardStudio, readJson, studioError, upstreamError, withNetworkErrors } from "@/lib/studio/guard";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEXT_LENGTH = 5000;

async function handlePost(request: Request) {
  const apiKey = guardStudio(request, "elevenlabs");
  if (typeof apiKey !== "string") return apiKey;

  const body = await readJson(request);
  const text = asString(body?.text, MAX_TEXT_LENGTH);
  const voiceId = asString(body?.voiceId, 64);
  if (!text || !voiceId) return studioError("invalid_payload", 422);

  const response = await synthesize(apiKey, voiceId, text, parseVoiceSettings(body?.settings));
  if (!response.ok || !response.body) return upstreamError("elevenlabs", response);

  return new Response(response.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}

export const POST = withNetworkErrors("elevenlabs", handlePost);
