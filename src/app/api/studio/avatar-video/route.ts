import { ASPECT_RATIOS, providerKey, type AspectRatio } from "@/lib/studio/config";
import { parseVoiceSettings, synthesize } from "@/lib/studio/elevenlabs";
import { asString, guardStudio, readJson, studioError, upstreamError, withNetworkErrors } from "@/lib/studio/guard";
import { createAvatarVideo, getAvatarVideoStatus, uploadAudioAsset, type AvatarScene } from "@/lib/studio/heygen";

export const runtime = "nodejs";
// ElevenLabs renders every scene before HeyGen is called.
export const maxDuration = 300;

const MAX_SCENES = 20;
const MAX_SCENE_LENGTH = 1500;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Starts an avatar video. Body:
 *   { avatarId, avatarKind, scenes: string[], aspectRatio, background,
 *     voice: { provider: "elevenlabs", voiceId, settings } | { provider: "heygen", voiceId } }
 */
async function handlePost(request: Request) {
  const heygenKey = guardStudio(request, "heygen");
  if (typeof heygenKey !== "string") return heygenKey;

  const body = await readJson(request);
  const avatarId = asString(body?.avatarId, 128);
  const avatarKind = body?.avatarKind === "talking_photo" ? "talking_photo" : "avatar";
  const aspectRatio = ASPECT_RATIOS.includes(body?.aspectRatio as AspectRatio)
    ? (body?.aspectRatio as AspectRatio)
    : "16:9";
  const background = typeof body?.background === "string" && HEX_COLOR.test(body.background) ? body.background : "#0a0e1c";
  const title = asString(body?.title, 120);

  const texts = Array.isArray(body?.scenes)
    ? body.scenes.map((s) => asString(s, MAX_SCENE_LENGTH)).filter((s): s is string => Boolean(s))
    : [];
  const voice = (typeof body?.voice === "object" && body.voice !== null ? body.voice : {}) as Record<string, unknown>;
  const voiceId = asString(voice.voiceId, 128);

  if (!avatarId || !voiceId || texts.length === 0 || texts.length > MAX_SCENES) {
    return studioError("invalid_payload", 422);
  }

  let scenes: AvatarScene[];
  if (voice.provider === "elevenlabs") {
    const elevenKey = providerKey("elevenlabs");
    if (!elevenKey) return studioError("elevenlabs_not_configured", 503);
    const settings = parseVoiceSettings(voice.settings);

    scenes = [];
    for (const text of texts) {
      const audio = await synthesize(elevenKey, voiceId, text, settings);
      if (!audio.ok) return upstreamError("elevenlabs", audio);
      const audioUrl = await uploadAudioAsset(heygenKey, await audio.arrayBuffer());
      if (audioUrl instanceof Response) return upstreamError("heygen", audioUrl);
      scenes.push({ voice: "audio", audioUrl });
    }
  } else {
    scenes = texts.map((text) => ({ voice: "heygen", text, heygenVoiceId: voiceId }));
  }

  const videoId = await createAvatarVideo(heygenKey, { avatarId, kind: avatarKind, scenes, aspectRatio, background, title });
  if (videoId instanceof Response) return upstreamError("heygen", videoId);
  return Response.json({ videoId });
}

async function handleGet(request: Request) {
  const apiKey = guardStudio(request, "heygen");
  if (typeof apiKey !== "string") return apiKey;

  const videoId = asString(new URL(request.url).searchParams.get("id"), 128);
  if (!videoId) return studioError("missing_id", 422);

  const status = await getAvatarVideoStatus(apiKey, videoId);
  if (status instanceof Response) return upstreamError("heygen", status);
  return Response.json(status);
}

export const POST = withNetworkErrors("heygen", handlePost);
export const GET = withNetworkErrors("heygen", handleGet);
