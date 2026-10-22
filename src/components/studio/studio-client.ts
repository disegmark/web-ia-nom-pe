"use client";

import { createContext, useContext } from "react";

export type ProviderMap = { heygen: boolean; elevenlabs: boolean; fal: boolean; anthropic: boolean };

export type VideoModelInfo = {
  id: string;
  label: string;
  description: string;
  durations: number[];
  audio: boolean;
};

export type StudioStatus = {
  enabled: boolean;
  authorized: boolean;
  providers: ProviderMap;
  videoModels: VideoModelInfo[];
};

export type AspectRatio = "16:9" | "9:16" | "1:1";
export const ASPECT_RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1"];

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "La clave de acceso del estudio no es válida.",
  studio_not_configured: "El estudio no está habilitado en este servidor (falta STUDIO_ACCESS_KEY).",
  rate_limited: "Demasiadas solicitudes seguidas. Espera unos minutos.",
  heygen_not_configured: "Falta configurar HEYGEN_API_KEY en el servidor.",
  elevenlabs_not_configured: "Falta configurar ELEVENLABS_API_KEY en el servidor.",
  fal_not_configured: "Falta configurar FAL_KEY en el servidor.",
  anthropic_not_configured: "Falta configurar ANTHROPIC_API_KEY en el servidor.",
  invalid_payload: "Revisa los campos: falta información o algo es demasiado largo.",
  invalid_photo: "La foto debe ser JPG o PNG.",
  photo_too_large: "La foto supera los 10 MB.",
  invalid_samples: "Sube entre 1 y 5 muestras de audio.",
  sample_too_large: "Cada muestra de audio debe pesar menos de 10 MB.",
  heygen_upstream_error: "HeyGen rechazó la solicitud.",
  elevenlabs_upstream_error: "ElevenLabs rechazó la solicitud.",
  fal_upstream_error: "El proveedor de video rechazó la solicitud.",
  anthropic_upstream_error: "No se pudo generar el guion.",
  heygen_unreachable: "No se pudo conectar con HeyGen.",
  elevenlabs_unreachable: "No se pudo conectar con ElevenLabs.",
  fal_unreachable: "No se pudo conectar con el proveedor de video.",
};

export class StudioError extends Error {}

export type StudioFetch = (path: string, init?: RequestInit) => Promise<Response>;

/** fetch() bound to the studio access key; throws StudioError with a readable message on failure. */
export function createStudioFetch(accessKey: string): StudioFetch {
  return async (path, init = {}) => {
    const headers = new Headers(init.headers);
    headers.set("x-studio-key", accessKey);
    const response = await fetch(path, { ...init, headers });
    if (response.ok) return response;

    const body = (await response.json().catch(() => ({}))) as { error?: string; detail?: string };
    const message = (body.error && ERROR_MESSAGES[body.error]) || "Algo falló. Intenta de nuevo.";
    throw new StudioError(body.detail ? `${message} (${body.detail})` : message);
  };
}

export function errorMessage(error: unknown): string {
  return error instanceof StudioError ? error.message : "No se pudo conectar con el servidor.";
}

export const StudioContext = createContext<{ api: StudioFetch; status: StudioStatus } | null>(null);

export function useStudio() {
  const value = useContext(StudioContext);
  if (!value) throw new Error("useStudio must be used inside <StudioContext>");
  return value;
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type FalJob = { requestId: string; statusUrl: string; responseUrl: string };
export type FalState =
  | { state: "queued"; position: number | null }
  | { state: "running"; position: null }
  | { state: "completed"; videoUrl: string }
  | { state: "failed"; error: string };

/** Polls a fal queue job until it completes; `onUpdate` receives intermediate states. */
export async function pollFalJob(
  api: StudioFetch,
  job: FalJob,
  onUpdate: (state: FalState) => void,
  signal?: { cancelled: boolean },
): Promise<string> {
  const query = new URLSearchParams({ status: job.statusUrl, response: job.responseUrl });
  for (;;) {
    if (signal?.cancelled) throw new StudioError("Cancelado.");
    const state = (await (await api(`/api/studio/video?${query}`)).json()) as FalState;
    onUpdate(state);
    if (state.state === "completed") return state.videoUrl;
    if (state.state === "failed") throw new StudioError(`El modelo falló: ${state.error}`);
    await wait(5000);
  }
}

/** Loads a local image, downsizes it and returns a JPEG data URI (keeps request bodies small). */
export function imageFileToDataUrl(file: File, maxSide = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new StudioError("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

/**
 * Grabs the last frame of a finished clip so the next scene starts exactly
 * where this one ended. Returns null if the host blocks cross-origin reads.
 */
export function extractLastFrame(videoUrl: string, maxSide = 1280): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";
    let settled = false;
    const done = (value: string | null) => {
      if (settled) return;
      settled = true;
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };
    video.onloadedmetadata = () => {
      video.currentTime = Math.max(0, video.duration - 0.08);
    };
    video.onseeked = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        done(null);
      }
    };
    video.onerror = () => done(null);
    setTimeout(() => done(null), 30000);
    video.src = videoUrl;
  });
}

export function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the studio still works, it just won't remember.
  }
}
