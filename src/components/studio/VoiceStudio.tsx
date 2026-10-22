"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Mic, Play, Upload } from "lucide-react";
import { ActionButton, Field, INPUT_CLASSES, Notice, Panel, Slider } from "./StudioUI";
import { errorMessage, useStudio } from "./studio-client";

export type Voice = {
  id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  previewUrl: string | null;
};

export type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.2,
  use_speaker_boost: true,
};

/** Loads the ElevenLabs voice library (shared with the avatar studio). */
export function useVoices() {
  const { api, status } = useStudio();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!status.providers.elevenlabs) return;
    try {
      const data = (await (await api("/api/studio/voices")).json()) as { voices: Voice[] };
      setVoices(data.voices);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [api, status.providers.elevenlabs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch of the voice library
    void reload();
  }, [reload]);

  return { voices, error, reload };
}

export function voiceLabel(voice: Voice) {
  const traits = [voice.labels.gender, voice.labels.accent, voice.labels.age].filter(Boolean).join(" · ");
  const custom = voice.category === "cloned" || voice.category === "generated" ? " ★" : "";
  return `${voice.name}${custom}${traits ? ` — ${traits}` : ""}`;
}

type Render = { id: string; text: string; voice: string; url: string };

export function VoiceStudio() {
  const { api, status } = useStudio();
  const { voices, error: voicesError, reload } = useVoices();
  const [voiceId, setVoiceId] = useState("");
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renders, setRenders] = useState<Render[]>([]);

  const [cloneName, setCloneName] = useState("");
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const [cloning, setCloning] = useState(false);
  const [cloneMessage, setCloneMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const selectedVoice = voiceId || voices[0]?.id || "";

  // Blob URLs live as long as the tab; free them when the studio unmounts.
  const rendersRef = useRef(renders);
  useEffect(() => {
    rendersRef.current = renders;
  }, [renders]);
  useEffect(() => () => rendersRef.current.forEach((r) => URL.revokeObjectURL(r.url)), []);

  if (!status.providers.elevenlabs) {
    return <Notice>Para generar voces configura ELEVENLABS_API_KEY en el servidor.</Notice>;
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const response = await api("/api/studio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice, settings }),
      });
      const url = URL.createObjectURL(await response.blob());
      const voice = voices.find((v) => v.id === selectedVoice)?.name ?? "Voz";
      setRenders((prev) => [{ id: crypto.randomUUID(), text, voice, url }, ...prev].slice(0, 12));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function clone() {
    setCloning(true);
    setCloneMessage(null);
    try {
      const form = new FormData();
      form.append("name", cloneName);
      cloneFiles.forEach((file) => form.append("samples", file));
      const { voiceId: newId } = (await (await api("/api/studio/voices", { method: "POST", body: form })).json()) as {
        voiceId: string;
      };
      await reload();
      setVoiceId(newId);
      setCloneName("");
      setCloneFiles([]);
      setCloneMessage({ tone: "info", text: "Voz clonada y seleccionada. Ya puedes usarla aquí y en tus avatares." });
    } catch (e) {
      setCloneMessage({ tone: "error", text: errorMessage(e) });
    } finally {
      setCloning(false);
    }
  }

  const preview = voices.find((v) => v.id === selectedVoice)?.previewUrl;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Texto a voz">
        <div className="space-y-4">
          <Field label="Voz">
            <div className="flex gap-2">
              <select value={selectedVoice} onChange={(e) => setVoiceId(e.target.value)} className={INPUT_CLASSES}>
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {voiceLabel(v)}
                  </option>
                ))}
              </select>
              {preview ? (
                <button
                  type="button"
                  aria-label="Escuchar muestra de la voz"
                  onClick={() => void new Audio(preview).play()}
                  className="focus-ring shrink-0 rounded-xl border border-border px-3 text-muted hover:text-cyan"
                >
                  <Play className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </Field>
          {voicesError ? <Notice>{voicesError}</Notice> : null}

          <Field label="Texto" hint={`${text.length}/5000 caracteres · admite español, inglés y 25+ idiomas`}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
              rows={7}
              placeholder="Hola, soy tu avatar. Hoy te cuento cómo la inteligencia artificial puede trabajar por tu negocio las 24 horas…"
              className={INPUT_CLASSES}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Slider
              label="Estabilidad"
              value={settings.stability}
              onChange={(stability) => setSettings((s) => ({ ...s, stability }))}
              hint="Baja = más expresiva"
            />
            <Slider
              label="Similitud"
              value={settings.similarity_boost}
              onChange={(similarity_boost) => setSettings((s) => ({ ...s, similarity_boost }))}
              hint="Fidelidad al timbre"
            />
            <Slider
              label="Estilo"
              value={settings.style}
              onChange={(style) => setSettings((s) => ({ ...s, style }))}
              hint="Exagera la emoción"
            />
          </div>

          {error ? <Notice>{error}</Notice> : null}
          <ActionButton busy={busy} disabled={!text.trim() || !selectedVoice} onClick={() => void generate()}>
            <Mic className="h-4 w-4" />
            Generar voz
          </ActionButton>
        </div>

        {renders.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {renders.map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-3">
                <p className="mb-2 line-clamp-2 text-sm text-muted">
                  <span className="text-foreground">{r.voice}:</span> {r.text}
                </p>
                <div className="flex items-center gap-2">
                  <audio controls src={r.url} className="h-9 w-full" />
                  <a
                    href={r.url}
                    download={`voz-${r.id.slice(0, 8)}.mp3`}
                    aria-label="Descargar audio"
                    className="focus-ring rounded-full p-2 text-muted hover:text-cyan"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <Panel title="Clonar una voz">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Sube de 1 a 5 grabaciones limpias (idealmente 1–3 minutos en total, sin música ni ruido). Solo clona voces
          propias o con autorización expresa de la persona.
        </p>
        <div className="space-y-4">
          <Field label="Nombre de la voz">
            <input
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              maxLength={80}
              placeholder="Ej. Voz de Ana — marca"
              className={INPUT_CLASSES}
            />
          </Field>
          <Field label="Muestras de audio" hint={cloneFiles.map((f) => f.name).join(", ") || "MP3, WAV o M4A"}>
            <span className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted hover:border-cyan/50 hover:text-cyan">
              <Upload className="h-4 w-4" />
              Elegir archivos
              <input
                type="file"
                accept="audio/*"
                multiple
                className="sr-only"
                onChange={(e) => setCloneFiles(Array.from(e.target.files ?? []).slice(0, 5))}
              />
            </span>
          </Field>
          {cloneMessage ? <Notice tone={cloneMessage.tone}>{cloneMessage.text}</Notice> : null}
          <ActionButton
            variant="secondary"
            busy={cloning}
            disabled={!cloneName.trim() || cloneFiles.length === 0}
            onClick={() => void clone()}
          >
            Clonar voz
          </ActionButton>
        </div>
      </Panel>
    </div>
  );
}
