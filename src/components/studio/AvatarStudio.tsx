"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Clapperboard, Download, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButton, AspectPicker, aspectClass, Field, INPUT_CLASSES, Notice, Panel, Slider } from "./StudioUI";
import { DEFAULT_VOICE_SETTINGS, useVoices, voiceLabel, type VoiceSettings } from "./VoiceStudio";
import { errorMessage, loadStored, saveStored, useStudio, wait, type AspectRatio } from "./studio-client";

type Avatar = {
  id: string;
  name: string;
  kind: "avatar" | "talking_photo";
  previewImage: string | null;
  previewVideo: string | null;
};

type HeygenVoice = { id: string; name: string; language: string; previewUrl: string | null };

type AvatarJob = {
  videoId: string;
  title: string;
  aspectRatio: AspectRatio;
  createdAt: number;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl: string | null;
  error: string | null;
};

const JOBS_KEY = "studio:avatar-jobs";
const AVATARS_PER_PAGE = 24;

/** Blank lines split the script into scenes — each becomes a HeyGen video_input. */
function splitScript(script: string): string[] {
  return script
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AvatarStudio() {
  const { api, status } = useStudio();
  const { voices: elevenVoices } = useVoices();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [heygenVoices, setHeygenVoices] = useState<HeygenVoice[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [visible, setVisible] = useState(AVATARS_PER_PAGE);

  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const useEleven = status.providers.elevenlabs;
  const [voiceId, setVoiceId] = useState("");
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [script, setScript] = useState("");
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [background, setBackground] = useState("#0a0e1c");

  const [jobs, setJobs] = useState<AvatarJob[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadAvatars = useCallback(async () => {
    try {
      const data = (await (await api("/api/studio/avatars")).json()) as { avatars: Avatar[]; voices: HeygenVoice[] };
      setAvatars(data.avatars);
      setHeygenVoices(data.voices);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch + restore saved jobs
    setJobs(loadStored<AvatarJob[]>(JOBS_KEY, []));
    void loadAvatars();
  }, [loadAvatars]);

  // Poll every unfinished render until HeyGen reports completed/failed.
  const pendingIds = jobs.filter((j) => j.status === "pending" || j.status === "processing").map((j) => j.videoId);
  const pendingKey = pendingIds.join(",");
  useEffect(() => {
    if (!pendingKey) return;
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        await wait(8000);
        for (const id of pendingKey.split(",")) {
          if (cancelled) return;
          try {
            const s = (await (await api(`/api/studio/avatar-video?id=${encodeURIComponent(id)}`)).json()) as Pick<
              AvatarJob,
              "status" | "videoUrl" | "error"
            >;
            setJobs((prev) => {
              const next = prev.map((j) => (j.videoId === id ? { ...j, ...s } : j));
              saveStored(JOBS_KEY, next);
              return next;
            });
          } catch {
            // Transient network/API hiccup — retry on the next tick.
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, pendingKey]);

  async function uploadPhoto(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const { avatarId: newId } = (await (await api("/api/studio/avatars", { method: "POST", body: form })).json()) as {
        avatarId: string;
      };
      setAvatarId(newId);
      await loadAvatars();
    } catch (e) {
      setUploadError(errorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  const scenes = splitScript(script);
  const voiceOptions = useEleven
    ? elevenVoices.map((v) => ({ id: v.id, label: voiceLabel(v) }))
    : heygenVoices.map((v) => ({ id: v.id, label: `${v.name}${v.language ? ` — ${v.language}` : ""}` }));
  const selectedVoice = voiceId || voiceOptions[0]?.id || "";
  const selectedAvatar = avatars.find((a) => a.id === avatarId);

  async function generate() {
    if (!selectedAvatar) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { videoId } = (await (
        await api("/api/studio/avatar-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatarId: selectedAvatar.id,
            avatarKind: selectedAvatar.kind,
            scenes,
            aspectRatio,
            background,
            title: title || undefined,
            voice: useEleven
              ? { provider: "elevenlabs", voiceId: selectedVoice, settings }
              : { provider: "heygen", voiceId: selectedVoice },
          }),
        })
      ).json()) as { videoId: string };

      const job: AvatarJob = {
        videoId,
        title: title || `${selectedAvatar.name} · ${new Date().toLocaleString("es-PE")}`,
        aspectRatio,
        createdAt: Date.now(),
        status: "pending",
        videoUrl: null,
        error: null,
      };
      setJobs((prev) => {
        const next = [job, ...prev].slice(0, 30);
        saveStored(JOBS_KEY, next);
        return next;
      });
    } catch (e) {
      setSubmitError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!status.providers.heygen) {
    return <Notice>Para crear avatares configura HEYGEN_API_KEY en el servidor.</Notice>;
  }

  const filtered = avatars.filter((a) => a.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <Panel title="1 · Elige o crea tu avatar">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setVisible(AVATARS_PER_PAGE);
            }}
            placeholder="Buscar avatar…"
            className={INPUT_CLASSES}
          />
          <label
            className={cn(
              "focus-ring flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyan/50 px-4 py-2.5 text-sm text-cyan hover:bg-primary/10",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <Camera className="h-4 w-4" />
            {uploading ? "Creando avatar…" : "Crear desde una foto"}
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPhoto(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="mb-4 text-xs text-muted">
          Para un avatar desde foto usa un retrato frontal, bien iluminado, rostro visible y boca cerrada. Usa solo tu
          imagen o la de alguien que te haya dado su consentimiento.
        </p>
        {uploadError ? <Notice>{uploadError}</Notice> : null}
        {loadError ? <Notice>{loadError}</Notice> : null}

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {filtered.slice(0, visible).map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setAvatarId(a.id)}
                aria-pressed={avatarId === a.id}
                className={cn(
                  "focus-ring group block w-full overflow-hidden rounded-xl border text-left transition-colors",
                  avatarId === a.id ? "border-cyan shadow-[0_0_24px_-6px_var(--cyan)]" : "border-border hover:border-cyan/40",
                )}
              >
                <span className="relative block aspect-[3/4] bg-secondary">
                  {a.previewImage ? (
                    <Image src={a.previewImage} alt="" fill sizes="160px" unoptimized className="object-cover" />
                  ) : (
                    <UserRound className="absolute inset-0 m-auto h-8 w-8 text-muted" />
                  )}
                  {a.kind === "talking_photo" ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-cyan">
                      Foto
                    </span>
                  ) : null}
                </span>
                <span className="block truncate px-2 py-1.5 text-xs text-muted group-hover:text-foreground">{a.name}</span>
              </button>
            </li>
          ))}
        </ul>
        {filtered.length > visible ? (
          <div className="mt-4 text-center">
            <ActionButton variant="secondary" onClick={() => setVisible((v) => v + AVATARS_PER_PAGE)}>
              Ver más avatares ({filtered.length - visible})
            </ActionButton>
          </div>
        ) : null}
      </Panel>

      <Panel title="2 · Guion y voz">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <Field label="Título (opcional)">
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={INPUT_CLASSES} />
            </Field>
            <Field
              label="Guion"
              hint={`${scenes.length} escena(s) · deja una línea en blanco para separar escenas (hasta 20, 1500 caracteres c/u) y crear videos largos`}
            >
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={10}
                placeholder={"Hola, soy Valeria y hoy te presento nuestro nuevo servicio…\n\nEn primer lugar…"}
                className={INPUT_CLASSES}
              />
            </Field>
          </div>
          <div className="space-y-4">
            <Field label={useEleven ? "Voz (ElevenLabs)" : "Voz (HeyGen)"}>
              <select value={selectedVoice} onChange={(e) => setVoiceId(e.target.value)} className={INPUT_CLASSES}>
                {voiceOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>
            {useEleven ? (
              <>
                <Slider
                  label="Estabilidad"
                  value={settings.stability}
                  onChange={(stability) => setSettings((s) => ({ ...s, stability }))}
                />
                <Slider
                  label="Estilo"
                  value={settings.style}
                  onChange={(style) => setSettings((s) => ({ ...s, style }))}
                />
              </>
            ) : null}
            <Field label="Formato">
              <AspectPicker value={aspectRatio} onChange={setAspectRatio} />
            </Field>
            <Field label="Color de fondo">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-transparent"
              />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ActionButton
            busy={submitting}
            disabled={!selectedAvatar || scenes.length === 0 || scenes.length > 20 || !selectedVoice}
            onClick={() => void generate()}
          >
            <Clapperboard className="h-4 w-4" />
            Generar video con avatar
          </ActionButton>
          {!selectedAvatar ? <span className="text-sm text-muted">Selecciona un avatar primero.</span> : null}
          {submitting && useEleven ? (
            <span className="text-sm text-muted">Generando la voz de cada escena con ElevenLabs…</span>
          ) : null}
        </div>
        {submitError ? (
          <div className="mt-4">
            <Notice>{submitError}</Notice>
          </div>
        ) : null}
      </Panel>

      {jobs.length > 0 ? (
        <Panel title="3 · Tus videos">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.videoId} className="rounded-xl border border-border p-3">
                <div className={cn("mx-auto w-full overflow-hidden rounded-lg bg-secondary", aspectClass(job.aspectRatio))}>
                  {job.videoUrl ? (
                    <video src={job.videoUrl} controls className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
                      {job.status === "failed"
                        ? `Falló: ${job.error ?? "error desconocido"}`
                        : "Renderizando… (suele tardar varios minutos)"}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-foreground">{job.title}</p>
                  {job.videoUrl ? (
                    <a
                      href={job.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      aria-label="Descargar video"
                      className="focus-ring rounded-full p-1.5 text-muted hover:text-cyan"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
