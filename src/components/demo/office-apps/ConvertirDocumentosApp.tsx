"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  "Word → PDF",
  "PDF → Word",
  "Excel → PDF",
  "PDF → Excel",
  "PowerPoint → PDF",
  "PDF → PowerPoint",
  "PDF → JPG",
  "JPG → PDF",
  "Unir PDF",
];

/**
 * Faithful recreation of "Convertidor de formatos" (convertir.ia.nom.pe) —
 * same shortcut grid, dropzone and tips copy as the real app.
 */
export function ConvertirDocumentosApp() {
  const [tab, setTab] = useState<"Convertir" | "Historial" | "API">("Convertir");
  const [shortcut, setShortcut] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState<"idle" | "picked" | "converting" | "done">("idle");
  const [progress, setProgress] = useState(0);

  function pick() {
    setFilename("menu-carta.docx");
    setStatus("picked");
    if (!shortcut) setShortcut("Word → PDF");
  }

  function convert() {
    setStatus("converting");
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / 1200) * 100));
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

  const outExt = shortcut?.split(" → ")[1]?.toLowerCase() ?? "pdf";

  return (
    <div className="bg-background-elevated">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-cyan">
          <ArrowLeftRight className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">
          Convertidor de <span className="text-cyan">formatos</span>
        </p>
        <div className="ml-4 flex gap-1 rounded-lg border border-border p-0.5">
          {(["Convertir", "Historial", "API"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors",
                tab === t ? "bg-primary/15 text-cyan" : "text-muted hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">Café Aurora</span>
      </div>

      <div className="px-5 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-foreground">Convertir archivos</h2>
        <p className="mt-1.5 text-sm text-muted">
          Word, Excel, PowerPoint, PDF e imágenes. Sin límites y sin subir nada a otras plataformas (ejemplo).
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SHORTCUTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShortcut(s)}
              className={cn(
                "focus-ring rounded-lg border px-3 py-3 text-center text-sm font-medium transition-colors",
                shortcut === s ? "border-cyan/60 bg-primary/10 text-cyan" : "border-border text-foreground hover:border-cyan/30",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {status === "idle" ? (
          <button
            type="button"
            onClick={pick}
            className="mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background px-6 py-10 text-center"
          >
            <p className="text-base font-medium text-foreground">Arrastra tus archivos aquí</p>
            <p className="text-xs text-muted">DOCX, DOC, ODT, RTF, TXT · XLSX, XLS, ODS, CSV · PPTX, PPT, ODP · PDF · JPG, PNG, WEBP</p>
            <span className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">Elegir archivos</span>
          </button>
        ) : (
          <div className="mt-5 rounded-2xl border border-border bg-background p-5">
            <p className="truncate text-sm font-medium text-foreground">{filename}</p>
            <p className="mt-1 text-xs text-muted">Conversión: {shortcut}</p>

            {status === "picked" ? (
              <button type="button" onClick={convert} className="focus-ring mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
                Convertir (ejemplo)
              </button>
            ) : null}

            {status === "converting" ? (
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-[width]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted">Convirtiendo (ejemplo)… {progress}%</p>
              </div>
            ) : null}

            {status === "done" ? (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-cyan/30 bg-background-elevated px-3 py-2.5">
                <div>
                  <p className="text-sm text-foreground">{filename.replace(/\.[^.]+$/, "")}.{outExt}</p>
                  <p className="text-[11px] text-muted">Listo — simulado, no se procesó ningún archivo real.</p>
                </div>
                <button type="button" onClick={reset} className="text-xs font-medium text-cyan underline underline-offset-2">
                  Probar de nuevo
                </button>
              </div>
            ) : null}
          </div>
        )}

        <p className="mt-5 text-xs leading-relaxed text-muted">
          <span className="font-medium text-foreground">Consejos:</span> un PDF con varias páginas convertido a
          JPG/PNG se descarga como ZIP (una imagen por página). PDF → Word funciona mejor con PDF generados desde un
          programa; los PDF escaneados (fotos de papel) salen como imagen. Los archivos se borran del servidor apenas
          termina la descarga.
        </p>
      </div>
    </div>
  );
}
