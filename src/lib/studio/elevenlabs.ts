import { ELEVENLABS_DEFAULT_MODEL } from "./config";

const BASE_URL = "https://api.elevenlabs.io/v1";

export type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
};

export type StudioVoice = {
  id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  previewUrl: string | null;
};

export async function listVoices(apiKey: string): Promise<Response | StudioVoice[]> {
  const response = await fetch(`${BASE_URL}/voices`, { headers: { "xi-api-key": apiKey }, cache: "no-store" });
  if (!response.ok) return response;

  const data = (await response.json()) as {
    voices?: Array<{
      voice_id: string;
      name: string;
      category?: string;
      labels?: Record<string, string>;
      preview_url?: string | null;
    }>;
  };

  return (data.voices ?? []).map((v) => ({
    id: v.voice_id,
    name: v.name,
    category: v.category ?? "premade",
    labels: v.labels ?? {},
    previewUrl: v.preview_url ?? null,
  }));
}

/** Returns the raw upstream response; on success its body is audio/mpeg. */
export function synthesize(apiKey: string, voiceId: string, text: string, settings: VoiceSettings) {
  return fetch(`${BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: ELEVENLABS_DEFAULT_MODEL, voice_settings: settings }),
  });
}

/** Instant voice clone from one or more audio samples. */
export function cloneVoice(apiKey: string, name: string, description: string | undefined, samples: File[]) {
  const form = new FormData();
  form.append("name", name);
  if (description) form.append("description", description);
  for (const sample of samples) form.append("files", sample, sample.name);

  return fetch(`${BASE_URL}/voices/add`, { method: "POST", headers: { "xi-api-key": apiKey }, body: form });
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.2,
  use_speaker_boost: true,
};

function clamp01(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
}

export function parseVoiceSettings(value: unknown): VoiceSettings {
  const record = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  return {
    stability: clamp01(record.stability, DEFAULT_VOICE_SETTINGS.stability),
    similarity_boost: clamp01(record.similarity_boost, DEFAULT_VOICE_SETTINGS.similarity_boost),
    style: clamp01(record.style, DEFAULT_VOICE_SETTINGS.style),
    use_speaker_boost:
      typeof record.use_speaker_boost === "boolean" ? record.use_speaker_boost : DEFAULT_VOICE_SETTINGS.use_speaker_boost,
  };
}
