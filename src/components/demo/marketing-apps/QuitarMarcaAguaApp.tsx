"use client";

import { useState } from "react";
import { Droplets } from "lucide-react";

/**
 * Faithful recreation of the "mkt" Quitar marca de agua tool (marca.ia.nom.pe)
 * — same light card and dropzone copy as the real app.
 */
export function QuitarMarcaAguaApp() {
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState<"idle" | "picked" | "processing" | "done">("idle");
  const [progress, setProgress] = useState(0);

  function pick() {
    setFilename("promo-instagram.mp4");
    setStatus("picked");
  }

  function process() {
    setStatus("processing");
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / 1400) * 100));
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
      else setStatus("done");
    };
    requestAnimationFrame(tick);
  }

  function reset() {
    setFilename("");
    setStatus("idle");
    setProgress(0);
  }

  return (
    <div className="bg-[#f4f6fb] px-6 py-6 text-[#1a1f2e] sm:px-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f5dfa]/10 text-[#2f5dfa]">
              <Droplets className="h-4 w-4" />
            </span>
            <p className="text-sm font-bold text-[#0f1730]">
              <span className="text-[#2f5dfa]">mkt</span> Quitar marca de agua
            </p>
          </div>
          <button type="button" className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#1a1f2e]">
            Salir
          </button>
        </div>

        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-[#0f1730] sm:text-3xl">
          Elimina marcas de agua de tus videos
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-black/60">
          Sube hasta 30 videos, revisa la previa de los primeros 5 segundos y exporta el video completo en alta
          definición. Se conserva el audio.
        </p>

        {status === "idle" ? (
          <button
            type="button"
            onClick={pick}
            className="mx-auto mt-6 flex w-full flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-[#2f5dfa] to-[#38d3ff] px-6 py-12 text-white"
          >
            <span className="text-lg font-semibold">Suelta tus videos aquí o haz clic</span>
            <span className="text-xs text-white/80">MP4, MOV, AVI, MKV, WebM · hasta 1024 MB cada uno · máximo 30 por lote</span>
          </button>
        ) : (
          <div className="mt-6 rounded-xl border border-black/10 bg-[#f4f6fb] p-5">
            <p className="truncate text-sm font-medium text-[#0f1730]">{filename}</p>

            {status === "picked" ? (
              <button
                type="button"
                onClick={process}
                className="mt-4 w-full rounded-full bg-[#2f5dfa] px-4 py-2.5 text-sm font-medium text-white"
              >
                Quitar marca de agua (ejemplo)
              </button>
            ) : null}

            {status === "processing" ? (
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-[#2f5dfa] transition-[width]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-black/60">Procesando (ejemplo)… {progress}%</p>
              </div>
            ) : null}

            {status === "done" ? (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-[#0f1730]">{filename.replace(/\.[^.]+$/, "")}-sin-marca-hd.mp4</p>
                  <p className="text-[11px] text-black/50">Listo — simulado, no se procesó ningún archivo real.</p>
                </div>
                <button type="button" onClick={reset} className="text-xs font-medium text-[#2f5dfa] underline underline-offset-2">
                  Probar de nuevo
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
