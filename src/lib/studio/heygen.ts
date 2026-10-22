import { HEYGEN_DIMENSIONS, type AspectRatio } from "./config";

const API_URL = "https://api.heygen.com";
const UPLOAD_URL = "https://upload.heygen.com";

export type StudioAvatar = {
  id: string;
  name: string;
  kind: "avatar" | "talking_photo";
  previewImage: string | null;
  previewVideo: string | null;
};

type HeygenEnvelope<T> = { data?: T; error?: unknown; message?: string };

export async function listAvatars(apiKey: string): Promise<Response | StudioAvatar[]> {
  const response = await fetch(`${API_URL}/v2/avatars`, { headers: { "X-Api-Key": apiKey }, cache: "no-store" });
  if (!response.ok) return response;

  const { data } = (await response.json()) as HeygenEnvelope<{
    avatars?: Array<{ avatar_id: string; avatar_name: string; preview_image_url?: string; preview_video_url?: string }>;
    talking_photos?: Array<{ talking_photo_id: string; talking_photo_name: string; preview_image_url?: string }>;
  }>;

  const photos: StudioAvatar[] = (data?.talking_photos ?? []).map((p) => ({
    id: p.talking_photo_id,
    name: p.talking_photo_name || "Avatar desde foto",
    kind: "talking_photo",
    previewImage: p.preview_image_url ?? null,
    previewVideo: null,
  }));
  const avatars: StudioAvatar[] = (data?.avatars ?? []).map((a) => ({
    id: a.avatar_id,
    name: a.avatar_name,
    kind: "avatar",
    previewImage: a.preview_image_url ?? null,
    previewVideo: a.preview_video_url ?? null,
  }));

  // Custom photo avatars first: they're the ones the user created.
  return [...photos, ...avatars];
}

/** Turns a portrait photo into a HeyGen talking-photo avatar. */
export async function createTalkingPhoto(apiKey: string, photo: File): Promise<Response | string> {
  const response = await fetch(`${UPLOAD_URL}/v1/talking_photo`, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": photo.type },
    body: await photo.arrayBuffer(),
  });
  if (!response.ok) return response;
  const { data } = (await response.json()) as HeygenEnvelope<{ talking_photo_id?: string }>;
  return data?.talking_photo_id ?? new Response("missing talking_photo_id", { status: 502 });
}

/** Uploads audio (e.g. an ElevenLabs render) so HeyGen can lip-sync to it. */
export async function uploadAudioAsset(apiKey: string, audio: ArrayBuffer): Promise<Response | string> {
  const response = await fetch(`${UPLOAD_URL}/v1/asset`, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": "audio/mpeg" },
    body: audio,
  });
  if (!response.ok) return response;
  const { data } = (await response.json()) as HeygenEnvelope<{ url?: string }>;
  return data?.url ?? new Response("missing asset url", { status: 502 });
}

export type AvatarScene =
  | { voice: "heygen"; text: string; heygenVoiceId: string }
  | { voice: "audio"; audioUrl: string };

export async function createAvatarVideo(
  apiKey: string,
  options: {
    avatarId: string;
    kind: StudioAvatar["kind"];
    scenes: AvatarScene[];
    aspectRatio: AspectRatio;
    background: string;
    title?: string;
  },
): Promise<Response | string> {
  const character =
    options.kind === "talking_photo"
      ? { type: "talking_photo", talking_photo_id: options.avatarId }
      : { type: "avatar", avatar_id: options.avatarId, avatar_style: "normal" };

  const response = await fetch(`${API_URL}/v2/video/generate`, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(options.title ? { title: options.title } : {}),
      dimension: HEYGEN_DIMENSIONS[options.aspectRatio],
      // One video_input per scene: HeyGen renders them back to back, which is
      // how long avatar videos stay under the per-input script limit.
      video_inputs: options.scenes.map((scene) => ({
        character,
        voice:
          scene.voice === "heygen"
            ? { type: "text", input_text: scene.text, voice_id: scene.heygenVoiceId }
            : { type: "audio", audio_url: scene.audioUrl },
        background: { type: "color", value: options.background },
      })),
    }),
  });
  if (!response.ok) return response;
  const { data } = (await response.json()) as HeygenEnvelope<{ video_id?: string }>;
  return data?.video_id ?? new Response("missing video_id", { status: 502 });
}

export type AvatarVideoStatus = {
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  error: string | null;
};

export async function getAvatarVideoStatus(apiKey: string, videoId: string): Promise<Response | AvatarVideoStatus> {
  const response = await fetch(`${API_URL}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`, {
    headers: { "X-Api-Key": apiKey },
    cache: "no-store",
  });
  if (!response.ok) return response;

  const { data } = (await response.json()) as HeygenEnvelope<{
    status?: string;
    video_url?: string;
    thumbnail_url?: string;
    duration?: number;
    error?: { message?: string } | string | null;
  }>;

  const raw = data?.status ?? "pending";
  const status: AvatarVideoStatus["status"] =
    raw === "completed" || raw === "failed" || raw === "processing" ? raw : "pending";
  const error = typeof data?.error === "string" ? data.error : (data?.error?.message ?? null);

  return {
    status,
    videoUrl: data?.video_url ?? null,
    thumbnailUrl: data?.thumbnail_url ?? null,
    duration: data?.duration ?? null,
    error,
  };
}
