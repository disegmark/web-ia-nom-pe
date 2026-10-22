import { cloneVoice, listVoices } from "@/lib/studio/elevenlabs";
import { asString, guardStudio, studioError, upstreamError, withNetworkErrors } from "@/lib/studio/guard";

export const runtime = "nodejs";

const MAX_SAMPLES = 5;
const MAX_SAMPLE_BYTES = 10 * 1024 * 1024;

async function handleGet(request: Request) {
  const apiKey = guardStudio(request, "elevenlabs");
  if (typeof apiKey !== "string") return apiKey;

  const voices = await listVoices(apiKey);
  if (voices instanceof Response) return upstreamError("elevenlabs", voices);
  return Response.json({ voices });
}

/** Instant voice clone: multipart form with `name` and 1–5 `samples` audio files. */
async function handlePost(request: Request) {
  const apiKey = guardStudio(request, "elevenlabs");
  if (typeof apiKey !== "string") return apiKey;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return studioError("invalid_form", 400);
  }

  const name = asString(form.get("name"), 80);
  const description = asString(form.get("description"), 300);
  const samples = form
    .getAll("samples")
    .filter((s): s is File => s instanceof File && s.type.startsWith("audio/") && s.size > 0);

  if (!name) return studioError("missing_name", 422);
  if (samples.length === 0 || samples.length > MAX_SAMPLES) return studioError("invalid_samples", 422);
  if (samples.some((s) => s.size > MAX_SAMPLE_BYTES)) return studioError("sample_too_large", 413);

  const response = await cloneVoice(apiKey, name, description, samples);
  if (!response.ok) return upstreamError("elevenlabs", response);

  const data = (await response.json()) as { voice_id?: string };
  return Response.json({ voiceId: data.voice_id });
}

export const GET = withNetworkErrors("elevenlabs", handleGet);
export const POST = withNetworkErrors("elevenlabs", handlePost);
