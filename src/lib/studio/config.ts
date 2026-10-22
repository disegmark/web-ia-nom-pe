/**
 * Server-only configuration for the creative studio (/studio).
 *
 * The studio orchestrates third-party generative providers — it never runs
 * models itself:
 *   - HeyGen     → hyper-realistic talking avatars (stock or from a photo)
 *   - ElevenLabs → text-to-speech and instant voice cloning
 *   - fal.ai     → text/image-to-video models (PixVerse, Kling, Veo) and the
 *                  ffmpeg merge used to stitch scenes into one long video
 *   - Anthropic  → turns an idea into a scene-by-scene storyboard
 *
 * Every key is server-only. Never expose them with NEXT_PUBLIC_.
 */

export const STUDIO_PROVIDERS = ["heygen", "elevenlabs", "fal", "anthropic"] as const;
export type StudioProvider = (typeof STUDIO_PROVIDERS)[number];

const PROVIDER_ENV: Record<StudioProvider, string> = {
  heygen: "HEYGEN_API_KEY",
  elevenlabs: "ELEVENLABS_API_KEY",
  fal: "FAL_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

export function providerKey(provider: StudioProvider): string | undefined {
  const value = process.env[PROVIDER_ENV[provider]];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function providerStatus(): Record<StudioProvider, boolean> {
  return Object.fromEntries(STUDIO_PROVIDERS.map((p) => [p, Boolean(providerKey(p))])) as Record<
    StudioProvider,
    boolean
  >;
}

export const ELEVENLABS_DEFAULT_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

/** Aspect ratios the studio exposes; each provider maps them to its own format. */
export const ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export type SceneInput = {
  prompt: string;
  /** Seconds requested; snapped to what the model supports. */
  duration: number;
  aspectRatio: AspectRatio;
  /** Public URL or data: URI of a start frame (character reference or previous scene). */
  imageUrl?: string;
  negativePrompt?: string;
};

export type VideoModel = {
  id: string;
  label: string;
  description: string;
  durations: number[];
  /** Whether the model also generates synced audio (dialogue / ambience). */
  audio: boolean;
  textEndpoint: string;
  imageEndpoint: string;
  buildInput: (scene: SceneInput) => Record<string, unknown>;
};

function snap(value: number, allowed: number[]): number {
  return allowed.reduce((best, d) => (Math.abs(d - value) < Math.abs(best - value) ? d : best), allowed[0]);
}

/**
 * fal.ai model catalog. Endpoint ids are versioned by fal — when a newer
 * version ships, update the endpoint strings here (input shapes rarely change
 * within a model family).
 */
export const VIDEO_MODELS: VideoModel[] = [
  {
    id: "pixverse",
    label: "PixVerse v5",
    description: "Rápido y cinematográfico, ideal para clips sociales.",
    durations: [5, 8],
    audio: false,
    textEndpoint: "fal-ai/pixverse/v5/text-to-video",
    imageEndpoint: "fal-ai/pixverse/v5/image-to-video",
    buildInput: (scene) => ({
      prompt: scene.prompt,
      duration: String(snap(scene.duration, [5, 8])),
      aspect_ratio: scene.aspectRatio,
      resolution: "720p",
      ...(scene.negativePrompt ? { negative_prompt: scene.negativePrompt } : {}),
      ...(scene.imageUrl ? { image_url: scene.imageUrl } : {}),
    }),
  },
  {
    id: "kling",
    label: "Kling 2.1 Master",
    description: "Movimiento humano muy realista, escenas de hasta 10 s.",
    durations: [5, 10],
    audio: false,
    textEndpoint: "fal-ai/kling-video/v2.1/master/text-to-video",
    imageEndpoint: "fal-ai/kling-video/v2.1/master/image-to-video",
    buildInput: (scene) => ({
      prompt: scene.prompt,
      duration: String(snap(scene.duration, [5, 10])),
      aspect_ratio: scene.aspectRatio,
      ...(scene.negativePrompt ? { negative_prompt: scene.negativePrompt } : {}),
      ...(scene.imageUrl ? { image_url: scene.imageUrl } : {}),
    }),
  },
  {
    id: "veo",
    label: "Google Veo 3",
    description: "Calidad tipo Flow con audio y diálogos sincronizados.",
    durations: [8],
    audio: true,
    textEndpoint: "fal-ai/veo3",
    imageEndpoint: "fal-ai/veo3/image-to-video",
    buildInput: (scene) => ({
      prompt: scene.prompt,
      duration: "8s",
      // Veo image-to-video infers the ratio from the frame; text-to-video has no 1:1.
      ...(scene.imageUrl
        ? { image_url: scene.imageUrl }
        : { aspect_ratio: scene.aspectRatio === "1:1" ? "16:9" : scene.aspectRatio }),
      generate_audio: true,
      ...(scene.negativePrompt ? { negative_prompt: scene.negativePrompt } : {}),
    }),
  },
];

export const MERGE_VIDEOS_ENDPOINT = "fal-ai/ffmpeg-api/merge-videos";

export function findVideoModel(id: unknown): VideoModel | undefined {
  return VIDEO_MODELS.find((m) => m.id === id);
}

export const HEYGEN_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1": { width: 1080, height: 1080 },
};
