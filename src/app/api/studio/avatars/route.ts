import { createTalkingPhoto, listAvatars } from "@/lib/studio/heygen";
import { guardStudio, studioError, upstreamError, withNetworkErrors } from "@/lib/studio/guard";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

type HeygenVoice = { voice_id: string; name: string; language?: string; gender?: string; preview_audio?: string };

async function handleGet(request: Request) {
  const apiKey = guardStudio(request, "heygen");
  if (typeof apiKey !== "string") return apiKey;

  const [avatars, voicesResponse] = await Promise.all([
    listAvatars(apiKey),
    fetch("https://api.heygen.com/v2/voices", { headers: { "X-Api-Key": apiKey }, cache: "no-store" }),
  ]);
  if (avatars instanceof Response) return upstreamError("heygen", avatars);

  // HeyGen's own voices are the fallback when ElevenLabs isn't configured.
  let voices: Array<{ id: string; name: string; language: string; previewUrl: string | null }> = [];
  if (voicesResponse.ok) {
    const { data } = (await voicesResponse.json()) as { data?: { voices?: HeygenVoice[] } };
    voices = (data?.voices ?? []).map((v) => ({
      id: v.voice_id,
      name: v.name,
      language: v.language ?? "",
      previewUrl: v.preview_audio ?? null,
    }));
  }

  return Response.json({ avatars, voices });
}

/** Creates a hyper-realistic avatar from a single portrait photo (multipart `photo`). */
async function handlePost(request: Request) {
  const apiKey = guardStudio(request, "heygen");
  if (typeof apiKey !== "string") return apiKey;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return studioError("invalid_form", 400);
  }

  const photo = form.get("photo");
  if (!(photo instanceof File) || !["image/jpeg", "image/png"].includes(photo.type)) {
    return studioError("invalid_photo", 422);
  }
  if (photo.size > MAX_PHOTO_BYTES) return studioError("photo_too_large", 413);

  const result = await createTalkingPhoto(apiKey, photo);
  if (result instanceof Response) return upstreamError("heygen", result);
  return Response.json({ avatarId: result });
}

export const GET = withNetworkErrors("heygen", handleGet);
export const POST = withNetworkErrors("heygen", handlePost);
