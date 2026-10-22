"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Download, Film, ImagePlus, Link2, Plus, RotateCw, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButton, AspectPicker, aspectClass, Field, INPUT_CLASSES, Notice, Panel } from "./StudioUI";
import { SequencePlayer } from "./SequencePlayer";
import {
  errorMessage,
  extractLastFrame,
  imageFileToDataUrl,
  loadStored,
  pollFalJob,
  saveStored,
  useStudio,
  type AspectRatio,
  type FalJob,
  type FalState,
} from "./studio-client";

type SceneStatus = "idle" | "queued" | "running" | "completed" | "failed";

type Scene = {
  id: string;
  title: string;
  prompt: string;
  narration: string;
  status: SceneStatus;
  videoUrl: string | null;
  error: string | null;
};

type Project = {
  title: string;
  modelId: string;
  aspectRatio: AspectRatio;
  duration: number;
  continuity: boolean;
  referenceImage: string | null;
  negativePrompt: string;
  scenes: Scene[];
  mergedUrl: string | null;
};

const PROJECT_KEY = "studio:long-video";
const MAX_SCENES = 24;
const PARALLEL_JOBS = 3;

function newScene(partial: Partial<Scene> = {}): Scene {
  return {
    id: crypto.randomUUID(),
    title: "",
    prompt: "",
    narration: "",
    status: "idle",
    videoUrl: null,
    error: null,
    ...partial,
  };
}

const EMPTY_PROJECT: Project = {
  title: "",
  modelId: "pixverse",
  aspectRatio: "16:9",
  duration: 5,
  continuity: true,
  referenceImage: null,
  negativePrompt: "blurry, distorted face, extra fingers, watermark, text, low quality",
  scenes: [newScene({ title: "Escena 1" })],
  mergedUrl: null,
};

function formatLength(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

export function LongVideoStudio() {
  const { api, status } = useStudio();
  const [project, setProject] = useState<Project>(EMPTY_PROJECT);
  const [restored, setRestored] = useState(false);

  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState("");
  const [sceneCount, setSceneCount] = useState(6);
  const [planning, setPlanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef({ cancelled: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved project once on mount
    setProject((p) => {
      const saved = loadStored<Project | null>(PROJECT_KEY, null);
      // Jobs that were in flight when the tab closed can't be resumed — mark them for retry.
      return saved
        ? {
            ...p,
            ...saved,
            scenes: saved.scenes.map((s) =>
              s.status === "queued" || s.status === "running" ? { ...s, status: "idle" as const } : s,
            ),
          }
        : p;
    });
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) saveStored(PROJECT_KEY, project);
  }, [project, restored]);

  const models = status.videoModels;
  const model = models.find((m) => m.id === project.modelId) ?? models[0];
  const durations = model?.durations ?? [5];
  const duration = durations.includes(project.duration) ? project.duration : durations[0];
  const totalSeconds = project.scenes.length * duration;
  const finished = project.scenes.filter((s) => s.status === "completed" && s.videoUrl);

  function update(patch: Partial<Project>) {
    setProject((p) => ({ ...p, ...patch }));
  }

  function updateScene(id: string, patch: Partial<Scene>) {
    setProject((p) => ({
      ...p,
      // Any scene change invalidates the stitched file.
      mergedUrl: null,
      scenes: p.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function moveScene(index: number, delta: number) {
    setProject((p) => {
      const scenes = [...p.scenes];
      const target = index + delta;
      if (target < 0 || target >= scenes.length) return p;
      [scenes[index], scenes[target]] = [scenes[target], scenes[index]];
      return { ...p, scenes, mergedUrl: null };
    });
  }

  async function planStoryboard() {
    setPlanning(true);
    setError(null);
    try {
      const data = (await (
        await api("/api/studio/storyboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, style: style || undefined, sceneCount }),
        })
      ).json()) as { title: string; scenes: Array<{ title: string; prompt: string; narration: string }> };
      update({ title: data.title, scenes: data.scenes.map((s) => newScene(s)), mergedUrl: null });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPlanning(false);
    }
  }

  function promptFor(scene: Scene) {
    // Audio-native models (Veo) speak the narration as in-scene dialogue.
    return model?.audio && scene.narration.trim() ? `${scene.prompt}\nDialogue: "${scene.narration.trim()}"` : scene.prompt;
  }

  async function renderScene(scene: Scene, startFrame: string | null): Promise<string> {
    updateScene(scene.id, { status: "queued", error: null, videoUrl: null });
    const job = (await (
      await api("/api/studio/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model?.id,
          prompt: promptFor(scene),
          duration,
          aspectRatio: project.aspectRatio,
          imageUrl: startFrame ?? undefined,
          negativePrompt: project.negativePrompt || undefined,
        }),
      })
    ).json()) as FalJob;

    const url = await pollFalJob(
      api,
      job,
      (state: FalState) => {
        if (state.state === "queued" || state.state === "running") updateScene(scene.id, { status: state.state });
      },
      cancelRef.current,
    );
    updateScene(scene.id, { status: "completed", videoUrl: url });
    return url;
  }

  async function renderSafely(scene: Scene, startFrame: string | null): Promise<string | null> {
    try {
      return await renderScene(scene, startFrame);
    } catch (e) {
      updateScene(scene.id, { status: "failed", error: errorMessage(e) });
      return null;
    }
  }

  /**
   * Continuity on: scenes render in order and each one starts from the last
   * frame of the previous clip, so the result reads as one long take.
   * Continuity off: scenes render in parallel (all from the reference image, if any).
   */
  async function renderAll(onlyMissing: boolean) {
    cancelRef.current = { cancelled: false };
    setRunning(true);
    setError(null);
    const scenes = project.scenes.filter((s) => s.prompt.trim());

    try {
      if (project.continuity) {
        let previousUrl: string | null = null;
        for (const scene of scenes) {
          if (cancelRef.current.cancelled) break;
          if (onlyMissing && scene.status === "completed" && scene.videoUrl) {
            previousUrl = scene.videoUrl;
            continue;
          }
          const frame = previousUrl ? await extractLastFrame(previousUrl) : null;
          previousUrl = await renderSafely(scene, frame ?? project.referenceImage);
          if (!previousUrl) break; // a broken link would break the chain — stop and let the user retry
        }
      } else {
        const queue = scenes.filter((s) => !(onlyMissing && s.status === "completed" && s.videoUrl));
        const workers = Array.from({ length: PARALLEL_JOBS }, async () => {
          for (let scene = queue.shift(); scene && !cancelRef.current.cancelled; scene = queue.shift()) {
            await renderSafely(scene, project.referenceImage);
          }
        });
        await Promise.all(workers);
      }
    } finally {
      setRunning(false);
    }
  }

  async function retryScene(index: number) {
    const scene = project.scenes[index];
    cancelRef.current = { cancelled: false };
    setRunning(true);
    try {
      const previous = project.scenes[index - 1];
      const frame =
        project.continuity && previous?.videoUrl ? await extractLastFrame(previous.videoUrl) : null;
      await renderSafely(scene, frame ?? project.referenceImage);
    } finally {
      setRunning(false);
    }
  }

  async function merge() {
    setMerging(true);
    setError(null);
    try {
      const job = (await (
        await api("/api/studio/video/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: finished.map((s) => s.videoUrl) }),
        })
      ).json()) as FalJob;
      const url = await pollFalJob(api, job, () => undefined);
      update({ mergedUrl: url });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setMerging(false);
    }
  }

  async function setReference(file: File) {
    try {
      update({ referenceImage: await imageFileToDataUrl(file) });
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (!status.providers.fal) {
    return <Notice>Para generar video configura FAL_KEY (fal.ai) en el servidor.</Notice>;
  }

  return (
    <div className="space-y-6">
      {status.providers.anthropic ? (
        <Panel title="1 · De la idea al guion visual">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Field label="Idea del video">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={4}
                maxLength={3000}
                placeholder="Ej. Un barista limeño abre su cafetería al amanecer, prepara un espresso perfecto y lo sirve a su primera clienta mientras la ciudad despierta."
                className={INPUT_CLASSES}
              />
            </Field>
            <div className="space-y-4">
              <Field label="Estilo visual (opcional)">
                <input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  maxLength={300}
                  placeholder="Cinematográfico, luz dorada, 35 mm"
                  className={INPUT_CLASSES}
                />
              </Field>
              <Field label={`Escenas: ${sceneCount} · ≈ ${formatLength(sceneCount * duration)}`}>
                <input
                  type="range"
                  min={2}
                  max={MAX_SCENES}
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full accent-[var(--cyan)]"
                />
              </Field>
            </div>
          </div>
          <div className="mt-4">
            <ActionButton busy={planning} disabled={!idea.trim() || running} onClick={() => void planStoryboard()}>
              <Wand2 className="h-4 w-4" />
              Crear guion con iA
            </ActionButton>
          </div>
        </Panel>
      ) : null}

      <Panel title={`${status.providers.anthropic ? "2" : "1"} · Ajustes del video`}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Modelo de video">
              <div className="grid gap-2 sm:grid-cols-3">
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => update({ modelId: m.id })}
                    aria-pressed={model?.id === m.id}
                    className={cn(
                      "focus-ring rounded-xl border p-3 text-left transition-colors",
                      model?.id === m.id ? "border-cyan/60 bg-primary/10" : "border-border hover:border-cyan/40",
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">{m.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted">{m.description}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Formato">
              <AspectPicker value={project.aspectRatio} onChange={(aspectRatio) => update({ aspectRatio })} />
            </Field>
            <Field label="Duración por escena">
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update({ duration: d })}
                    aria-pressed={duration === d}
                    className={cn(
                      "focus-ring rounded-full border px-3 py-1.5 text-xs font-medium",
                      duration === d ? "border-cyan/60 bg-primary/10 text-cyan" : "border-border text-muted hover:text-cyan",
                    )}
                  >
                    {d} s
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="space-y-4">
            <Field
              label="Personaje o imagen de referencia (opcional)"
              hint="Fija el rostro/producto en la primera escena. Puedes usar una captura de tu avatar."
            >
              <div className="flex items-center gap-3">
                <label className="focus-ring flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted hover:border-cyan/50 hover:text-cyan">
                  <ImagePlus className="h-4 w-4" />
                  Subir imagen
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void setReference(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {project.referenceImage ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border">
                    <Image src={project.referenceImage} alt="Referencia" fill unoptimized className="object-cover" />
                    <button
                      type="button"
                      aria-label="Quitar imagen de referencia"
                      onClick={() => update({ referenceImage: null })}
                      className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
              </div>
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
              <input
                type="checkbox"
                checked={project.continuity}
                onChange={(e) => update({ continuity: e.target.checked })}
                className="mt-0.5 accent-[var(--cyan)]"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Link2 className="h-4 w-4 text-cyan" /> Continuidad entre escenas
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  Cada escena arranca desde el último fotograma de la anterior, para un plano largo sin cortes. Se
                  genera en orden (más lento). Desactívalo para generar en paralelo.
                </span>
              </span>
            </label>
            <Field label="Evitar (prompt negativo)">
              <input
                value={project.negativePrompt}
                onChange={(e) => update({ negativePrompt: e.target.value })}
                maxLength={500}
                className={INPUT_CLASSES}
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Field label="Título del proyecto">
              <input
                value={project.title}
                onChange={(e) => update({ title: e.target.value })}
                maxLength={120}
                placeholder="Mi video largo"
                className={INPUT_CLASSES}
              />
            </Field>
          </div>
          <p className="text-sm text-muted">
            {project.scenes.length} escenas · ≈ <span className="text-foreground">{formatLength(totalSeconds)}</span>
          </p>
        </div>

        <ol className="space-y-3">
          {project.scenes.map((scene, index) => (
            <li key={scene.id} className="rounded-xl border border-border p-3 sm:p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-cyan">{index + 1}</span>
                    <input
                      value={scene.title}
                      onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                      placeholder={`Escena ${index + 1}`}
                      className={cn(INPUT_CLASSES, "py-1.5")}
                    />
                    <div className="flex shrink-0">
                      <button
                        type="button"
                        aria-label="Subir escena"
                        disabled={index === 0 || running}
                        onClick={() => moveScene(index, -1)}
                        className="focus-ring rounded-full p-1.5 text-muted hover:text-cyan disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Bajar escena"
                        disabled={index === project.scenes.length - 1 || running}
                        onClick={() => moveScene(index, 1)}
                        className="focus-ring rounded-full p-1.5 text-muted hover:text-cyan disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar escena"
                        disabled={project.scenes.length === 1 || running}
                        onClick={() =>
                          setProject((p) => ({ ...p, mergedUrl: null, scenes: p.scenes.filter((s) => s.id !== scene.id) }))
                        }
                        className="focus-ring rounded-full p-1.5 text-muted hover:text-sign-signal disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={scene.prompt}
                    onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
                    rows={3}
                    maxLength={2000}
                    placeholder="Describe la toma: sujeto, acción, lugar, luz, cámara…"
                    className={INPUT_CLASSES}
                  />
                  <input
                    value={scene.narration}
                    onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
                    maxLength={400}
                    placeholder={model?.audio ? "Diálogo / locución (Veo lo genera con voz)" : "Locución (opcional, para la pestaña Voces)"}
                    className={cn(INPUT_CLASSES, "py-1.5")}
                  />
                </div>

                <div>
                  <div
                    className={cn(
                      "mx-auto w-full overflow-hidden rounded-lg bg-secondary",
                      aspectClass(project.aspectRatio),
                      "max-h-56",
                    )}
                  >
                    {scene.videoUrl ? (
                      <video src={scene.videoUrl} controls muted playsInline className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted">
                        {scene.status === "queued"
                          ? "En cola…"
                          : scene.status === "running"
                            ? "Generando…"
                            : scene.status === "failed"
                              ? scene.error
                              : "Sin generar"}
                      </div>
                    )}
                  </div>
                  {(scene.status === "failed" || scene.status === "completed") && !running ? (
                    <button
                      type="button"
                      onClick={() => void retryScene(index)}
                      className="focus-ring mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-border py-1.5 text-xs text-muted hover:text-cyan"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      {scene.status === "failed" ? "Reintentar" : "Regenerar"}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap gap-3">
          <ActionButton
            variant="secondary"
            disabled={project.scenes.length >= MAX_SCENES || running}
            onClick={() =>
              setProject((p) => ({
                ...p,
                mergedUrl: null,
                scenes: [...p.scenes, newScene({ title: `Escena ${p.scenes.length + 1}` })],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Añadir escena
          </ActionButton>
          {running ? (
            <ActionButton variant="secondary" onClick={() => (cancelRef.current.cancelled = true)}>
              Detener
            </ActionButton>
          ) : (
            <>
              <ActionButton
                disabled={!project.scenes.some((s) => s.prompt.trim())}
                onClick={() => void renderAll(false)}
              >
                <Sparkles className="h-4 w-4" />
                Generar todas las escenas
              </ActionButton>
              {finished.length > 0 && finished.length < project.scenes.length ? (
                <ActionButton variant="secondary" onClick={() => void renderAll(true)}>
                  Generar solo las pendientes
                </ActionButton>
              ) : null}
            </>
          )}
        </div>
        {running ? (
          <p className="mt-3 text-xs text-muted">
            Cada escena tarda de 1 a 5 minutos según el modelo. Puedes seguir editando las demás mientras tanto.
          </p>
        ) : null}
        {error ? (
          <div className="mt-4">
            <Notice>{error}</Notice>
          </div>
        ) : null}
      </Panel>

      {finished.length > 0 ? (
        <Panel title="Película completa">
          <SequencePlayer
            aspectRatio={project.aspectRatio}
            clips={finished.map((s, i) => ({ id: s.id, url: s.videoUrl as string, title: s.title || `Escena ${i + 1}` }))}
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ActionButton busy={merging} disabled={finished.length < 2 || running} onClick={() => void merge()}>
              <Film className="h-4 w-4" />
              Unir en un solo archivo MP4
            </ActionButton>
            {project.mergedUrl ? (
              <a
                href={project.mergedUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-cyan/50 px-5 py-2.5 text-sm text-cyan hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
                Descargar video final ({formatLength(finished.length * duration)})
              </a>
            ) : null}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
