"use client";

import { useState } from "react";

type Slide = { title: string; text: string };

const DEFAULT_SLIDE_COUNT = 3;

function buildSlides(count: number, titulo: string, texto: string): Slide[] {
  const base = titulo.trim() || "5 errores que *frenan* tus ventas";
  const slides: Slide[] = [{ title: base, text: texto.trim() || "" }];
  const fillers = [
    "No tener un agente iA respondiendo 24/7.",
    "Tardar horas en contestar un WhatsApp.",
    "No hacer seguimiento a los leads que preguntan y no compran.",
    "No tener un catálogo claro con precios.",
    "No medir qué contenido realmente vende.",
  ];
  for (let i = 1; i < count; i += 1) {
    slides.push({ title: `Lámina ${i + 1}`, text: fillers[(i - 1) % fillers.length] });
  }
  return slides;
}

/**
 * Faithful recreation of "Carrusel Studio" (carruseles.ia.nom.pe) — same
 * toolbar/panel layout as the real app. "Exportar…" builds example slides
 * instead of a real PNG/PDF export.
 */
export function CarruselStudioApp() {
  const [red, setRed] = useState("Instagram");
  const [formato, setFormato] = useState("4:5 · Vertical 1080×1350");
  const [dividirEn, setDividirEn] = useState(DEFAULT_SLIDE_COUNT);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [oscurecer, setOscurecer] = useState(30);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      const generated = buildSlides(Math.max(1, Math.min(8, dividirEn)), titulo, texto);
      setSlides(generated);
      setActiveSlide(0);
      setExporting(false);
    }, 900);
  }

  const previewTitle = slides ? slides[activeSlide].title : titulo || "Arrastra tus imágenes aquí";
  const previewText = slides ? slides[activeSlide].text : texto;

  return (
    <div className="bg-background-elevated">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <p className="text-sm font-semibold text-foreground">
          Carrusel <span className="text-cyan">Studio</span>
        </p>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          Red
          <select
            value={red}
            onChange={(e) => setRed(e.target.value)}
            className="focus-ring rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          >
            <option>Instagram</option>
            <option>Facebook</option>
            <option>LinkedIn</option>
            <option>TikTok</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          Formato
          <select
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            className="focus-ring rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          >
            <option>4:5 · Vertical 1080×1350</option>
            <option>1:1 · Cuadrado 1080×1080</option>
            <option>9:16 · Vertical 1080×1920</option>
          </select>
        </label>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Motor PNG listo
        </span>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">Café Aurora</span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border px-5 py-2.5">
        <button type="button" className="focus-ring rounded-lg border border-border px-3 py-1.5 text-xs text-muted">
          Descargar
        </button>
        <button type="button" className="focus-ring rounded-lg border border-border px-3 py-1.5 text-xs text-muted">
          Vista previa
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="focus-ring rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {exporting ? "Exportando…" : "Exportar…"}
        </button>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[13rem_1fr_15rem]">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Láminas</p>
          <button type="button" className="focus-ring w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted">
            + Subir imágenes
          </button>
          <button type="button" className="focus-ring w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted">
            + Lámina de texto
          </button>
          <button type="button" className="focus-ring w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted">
            + Panorámica dividida
          </button>
          <label className="block pt-2 text-xs text-muted">
            Dividir en
            <input
              type="number"
              min={1}
              max={8}
              value={dividirEn}
              onChange={(e) => setDividirEn(Number(e.target.value) || 1)}
              className="focus-ring mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground"
            />
          </label>
        </div>

        <div>
          <div
            className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-6 text-center"
            style={{ filter: slides ? `brightness(${1 - oscurecer / 200})` : undefined }}
          >
            {slides ? (
              <>
                <p className="text-lg font-semibold text-foreground">{previewTitle}</p>
                {previewText ? <p className="mt-2 text-sm text-muted">{previewText}</p> : null}
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">Arrastra tus imágenes aquí</p>
                <p className="mt-1 text-xs text-muted">o haz clic para seleccionarlas. Cada imagen será una lámina del carrusel.</p>
              </>
            )}
          </div>
          {slides ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`focus-ring rounded-lg border px-2.5 py-1 text-[11px] ${
                    activeSlide === i ? "border-cyan/60 bg-primary/10 text-cyan" : "border-border text-muted"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-background p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Lámina</p>
          <div>
            <label className="text-xs text-muted">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 5 errores que *frenan* tus ventas"
              className="focus-ring mt-1 w-full rounded-lg border border-border bg-background-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Texto</label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={2}
              placeholder="Texto de apoyo (opcional)"
              className="focus-ring mt-1 w-full resize-none rounded-lg border border-border bg-background-elevated px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Oscurecer imagen</label>
            <input
              type="range"
              min={0}
              max={80}
              value={oscurecer}
              onChange={(e) => setOscurecer(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
