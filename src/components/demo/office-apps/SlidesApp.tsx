"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Presentation, Sparkles, Upload } from "lucide-react";

type Deck = { name: string; slides: Array<{ title: string; body: string }> };

const TEMPLATES = [
  { emoji: "📊", label: "Informe mensual de resultados", category: "Informes", cards: 7, tint: "from-[#0f1730] to-[#1a2440]" },
  { emoji: "🤝", label: "Propuesta comercial", category: "Ventas", cards: 7, tint: "from-primary/40 to-cyan/20" },
  { emoji: "📅", label: "Reunión de equipo", category: "Reuniones", cards: 6, tint: "from-[#102a2a] to-[#163a3a]" },
  { emoji: "🧑‍💼", label: "Plan de proyecto", category: "Proyectos", cards: 8, tint: "from-primary/30 to-[#0f1730]" },
];

function buildDeck(tema: string): Deck {
  const topic = tema.trim() || "Propuesta de catering corporativo";
  return {
    name: topic,
    slides: [
      { title: "Portada", body: topic },
      { title: "El problema / la oportunidad", body: "Tu equipo necesita coffee breaks sin complicarse logísticamente." },
      { title: "Nuestra propuesta", body: "Menú a medida, montaje incluido, atención en el lugar." },
      { title: "Precios y siguiente paso", body: "Cotización personalizada — escríbenos para coordinar fecha." },
    ],
  };
}

/**
 * Faithful recreation of "Diapositivas IA" (slides.ia.nom.pe) — same
 * templates row and "Mis presentaciones" layout as the real app.
 */
export function SlidesApp() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [creating, setCreating] = useState(false);
  const [tema, setTema] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [openDeck, setOpenDeck] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  function generate(topicOverride?: string) {
    setStatus("loading");
    setTimeout(() => {
      const deck = buildDeck(topicOverride ?? tema);
      setDecks((prev) => [deck, ...prev]);
      setTema("");
      setCreating(false);
      setStatus("idle");
    }, 1000);
  }

  const active = openDeck !== null ? decks[openDeck] : null;

  return (
    <div className="bg-background-elevated">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-cyan">
          <Presentation className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">Diapositivas IA</p>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="focus-ring flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted">
            <Upload className="h-3.5 w-3.5" /> Cargar diapositivas
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="focus-ring flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
          >
            <Sparkles className="h-3.5 w-3.5" /> Crear nueva
          </button>
        </div>
      </div>

      <div className="p-5">
        {active ? (
          <div>
            <button type="button" onClick={() => setOpenDeck(null)} className="focus-ring text-xs text-muted hover:text-cyan">
              ← Volver a mis presentaciones
            </button>
            <div className="mt-3 rounded-xl border border-cyan/30 bg-background p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan">{active.slides[slideIndex].title}</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-foreground">{active.slides[slideIndex].body}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                disabled={slideIndex === 0}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted">
                Diapositiva {slideIndex + 1} / {active.slides.length}
              </span>
              <button
                type="button"
                onClick={() => setSlideIndex((i) => Math.min(active.slides.length - 1, i + 1))}
                disabled={slideIndex === active.slides.length - 1}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-foreground">Empezar con una plantilla</p>
              <span className="text-xs text-muted">Ver todas (12) →</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => generate(tpl.label)}
                  className="focus-ring overflow-hidden rounded-xl border border-border text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className={`flex h-24 items-center bg-gradient-to-br p-3 ${tpl.tint}`}>
                    <p className="text-sm font-semibold leading-snug text-white">{tpl.label}</p>
                  </div>
                  <div className="bg-background px-3 py-2.5">
                    <p className="truncate text-xs font-medium text-foreground">
                      {tpl.emoji} {tpl.label}
                    </p>
                    <p className="text-[11px] text-muted">
                      {tpl.category} · {tpl.cards} tarjetas
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-8 text-base font-semibold text-foreground">Mis presentaciones</p>

            {decks.length === 0 && !creating ? (
              <>
                <p className="mt-1 text-sm text-muted">Todavía no hay presentaciones. Cree la primera con iA.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="focus-ring flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center"
                  >
                    <Sparkles className="h-5 w-5 text-cyan" />
                    <span className="text-sm font-medium text-cyan">Crear con iA</span>
                  </button>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center">
                    <Upload className="h-5 w-5 text-muted" />
                    <span className="text-sm font-medium text-foreground">Cargar PPTX o PDF</span>
                    <span className="text-[11px] text-muted">de Canva, PowerPoint o Google Slides</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {decks.map((deck, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setOpenDeck(i);
                      setSlideIndex(0);
                    }}
                    className="focus-ring rounded-xl border border-border bg-background px-4 py-3 text-left"
                  >
                    <p className="truncate text-sm font-medium text-foreground">{deck.name}</p>
                    <p className="text-xs text-muted">{deck.slides.length} diapositivas (ejemplo)</p>
                  </button>
                ))}
              </div>
            )}

            {creating ? (
              <div className="mt-4 rounded-xl border border-cyan/30 bg-background p-4">
                <label className="text-xs font-medium text-muted">Tema de la presentación</label>
                <input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ej. Propuesta de catering corporativo"
                  className="focus-ring mt-1 w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => generate()}
                  disabled={status === "loading"}
                  className="focus-ring mt-3 w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {status === "loading" ? "Generando (ejemplo)…" : "Generar diapositivas (ejemplo)"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
