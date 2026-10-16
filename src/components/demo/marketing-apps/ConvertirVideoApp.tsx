"use client";

import { useState } from "react";
import { ArrowLeftRight, FileText, LayoutGrid, Plus } from "lucide-react";

const SIDEBAR = [
  { label: "Convertir", icon: ArrowLeftRight, active: true },
  { label: "Mis archivos", icon: FileText, active: false },
  { label: "Herramientas", icon: LayoutGrid, active: false },
];

/**
 * Faithful recreation of the "mkt" Convertir video tool (convertidor.ia.nom.pe)
 * — same light card, sidebar and dropzone as the real app. Converts a
 * typed-in filename instead of a real upload.
 */
export function ConvertirVideoApp() {
  const [filename, setFilename] = useState("");
  const [formato, setFormato] = useState("MP4");
  const [status, setStatus] = useState<"idle" | "picked" | "converting" | "done">("idle");
  const [progress, setProgress] = useState(0);

  function pick() {
    setFilename("video-evento.mp4");
    setStatus("picked");
  }

  function convert() {
    setStatus("converting");
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / 1300) * 100));
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
    <div className="bg-[#f4f6fb] text-[#1a1f2e]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
        <p className="text-sm font-bold text-[#2f5dfa]">mkt</p>
        <button type="button" className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#1a1f2e]">
          Cerrar sesión
        </button>
      </div>

      <div className="grid gap-0 lg:grid-cols-[8rem_1fr]">
        <div className="flex justify-center gap-6 border-b border-black/10 px-4 py-4 lg:flex-col lg:gap-4 lg:border-b-0 lg:border-r lg:py-6 lg:text-center">
          {SIDEBAR.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-1 text-xs ${item.active ? "text-[#2f5dfa]" : "text-black/50"}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="px-6 py-10 text-center sm:px-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1730]">Convertir video</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-black/60">
            Convierte archivos de video entre formatos sin esfuerzo. Soporte para MP4, MOV, AVI, WEBM y más.
          </p>

          {status === "idle" ? (
            <button
              type="button"
              onClick={pick}
              className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-[#2f5dfa] to-[#38d3ff] px-6 py-14 text-white"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Plus className="h-7 w-7" />
              </span>
              <span className="text-lg font-semibold">Carga o arrastra y suelta tu archivo</span>
              <span className="text-xs text-white/80">El archivo puede pesar hasta 2 GB (ejemplo)</span>
            </button>
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-black/10 bg-white p-6 text-left">
              <p className="truncate text-sm font-medium text-[#0f1730]">{filename}</p>

              {status === "picked" ? (
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs text-black/60">
                    Formato de salida
                    <select
                      value={formato}
                      onChange={(e) => setFormato(e.target.value)}
                      className="mt-1 block rounded-lg border border-black/15 px-2 py-1.5 text-sm text-[#0f1730]"
                    >
                      <option>MP4</option>
                      <option>WebM</option>
                      <option>MOV</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={convert}
                    className="ml-auto rounded-full bg-[#2f5dfa] px-4 py-2 text-sm font-medium text-white"
                  >
                    Convertir (ejemplo)
                  </button>
                </div>
              ) : null}

              {status === "converting" ? (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-[#2f5dfa] transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-black/60">Convirtiendo (ejemplo)… {progress}%</p>
                </div>
              ) : null}

              {status === "done" ? (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-[#f4f6fb] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-[#0f1730]">
                      {filename.replace(/\.[^.]+$/, "")}-convertido.{formato.toLowerCase()}
                    </p>
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
    </div>
  );
}
