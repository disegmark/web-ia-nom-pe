"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, Check, PlayCircle, RotateCcw, Send } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SignHeading, SignWord } from "@/components/signage/Signage";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { INDUSTRY_CASES } from "@/data/industry-cases";
import { CHANNELS, CURRENT_TOOLS, GOALS, MAX_GOALS, SECTORS, type Choice } from "@/data/solution-finder";

const STEP_TITLES = ["¿En qué rubro está tu negocio?", "¿Qué quieres que haga tu sistema?", "¿Por dónde te escriben tus clientes?", "¿Qué herramientas ya usas?"];
const STEP_LABELS = ["Rubro", "Objetivos", "Canales", "Herramientas"];
const STEP_HINTS = ["Elige una opción.", `Elige hasta ${MAX_GOALS}, en orden de prioridad.`, "Puedes elegir varios.", "Puedes elegir varias."];

const SYSTEM_NAMES: Record<string, string> = {
  atender: "Agente de atención 24/7",
  agendar: "Recepcionista virtual con agenda",
  vender: "Agente de ventas con pedidos y stock",
  inscribir: "Asistente de inscripciones y asesorías",
  captar: "Agente comercial que califica prospectos",
  conocimiento: "Asistente con tu base de conocimiento",
  marketing: "Sistema de marketing con IA",
};

const label = (list: Choice[], id: string) => list.find((c) => c.id === id)?.label ?? id;
const unique = (items: string[]) => [...new Set(items)];
const listJoin = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`);

function recommend(sector: string | null, goals: string[], channels: string[], tools: string[]) {
  const sectorChoice = SECTORS.find((s) => s.id === sector);
  const primary = GOALS.find((g) => g.id === goals[0]);
  let caseId = sectorChoice?.caseId ?? primary?.caseId ?? "consultorio";
  // Within health, a knowledge-first goal is closer to the clinic case than the appointments one.
  if (sector === "salud" && goals.includes("conocimiento") && !goals.includes("agendar")) caseId = "salud-femenina";
  const reference = INDUSTRY_CASES.find((c) => c.id === caseId) ?? INDUSTRY_CASES[0];
  const chosen = GOALS.filter((g) => goals.includes(g.id));
  const integrations = tools.filter((t) => t !== "ninguna").map((t) => label(CURRENT_TOOLS, t));
  return {
    name: primary ? SYSTEM_NAMES[primary.id] : "Sistema agéntico a medida",
    reference,
    agentTools: unique(chosen.flatMap((g) => g.tools)),
    modules: unique(["Conversaciones en tiempo real", ...chosen.flatMap((g) => g.modules), "Panel y configuración"]),
    channels: channels.map((c) => label(CHANNELS, c)),
    integrations,
    sectorLabel: sectorChoice?.label ?? "tu negocio",
  };
}

function OptionCard({
  choice,
  selected,
  disabled,
  onClick,
  order,
}: {
  choice: Choice;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  order?: number;
}) {
  const Icon = choice.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "focus-ring group relative flex min-h-[72px] w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-[border-color,background-color,box-shadow,transform,opacity] duration-200 sm:p-4",
        selected
          ? "border-cyan bg-cyan/[0.09] shadow-[0_0_24px_-8px_rgba(56,211,255,0.7)]"
          : "border-[#24436b] bg-[#081224] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:border-cyan/50 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#0b1a33]",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors",
          selected ? "bg-cyan/20 text-cyan" : "bg-[#0e2140] text-[#7fb8e6] group-hover:text-cyan",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{choice.label}</span>
        {choice.detail ? <span className="mt-0.5 block text-xs leading-snug text-muted">{choice.detail}</span> : null}
      </span>
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold transition-colors",
          selected ? "border-cyan bg-cyan text-background" : "border-[#2c4a72] text-transparent",
        )}
        aria-hidden="true"
      >
        {selected ? order ?? <Check className="h-3.5 w-3.5" /> : null}
      </span>
    </button>
  );
}

function PreviewGroup({ title, items, empty, tone = "cyan" }: { title: string; items: string[]; empty: string; tone?: "cyan" | "amber" | "violet" }) {
  const colors = {
    cyan: "border-cyan/35 bg-cyan/10 text-[#aee9ff]",
    amber: "border-sign-amber/35 bg-sign-amber/10 text-sign-amber",
    violet: "border-[#a855f7]/40 bg-[#a855f7]/10 text-[#d8b4fe]",
  }[tone];
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f9cc4]">{title}</p>
      <div className="mt-1.5 flex min-h-[30px] flex-wrap gap-1.5">
        <AnimatePresence initial={false}>
          {items.length ? (
            items.map((item) => (
              <motion.span
                key={item}
                layout
                initial={{ opacity: 0, transform: "scale(0.9)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.9)" }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className={cn("rounded-full border px-2.5 py-1 text-[11px]", colors)}
              >
                {item}
              </motion.span>
            ))
          ) : (
            <motion.span key="empty" className="rounded-full border border-dashed border-[#2c4a72] px-2.5 py-1 text-[11px] text-[#5f7aa0]">
              {empty}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Guided finder: four questions build a live preview of the system, then recommend one based on a real case. */
export function SolutionFinder() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);

  const rec = recommend(sector, goals, channels, tools);
  const SectorIcon = SECTORS.find((s) => s.id === sector)?.icon ?? Bot;
  const canContinue = [sector !== null, goals.length > 0, channels.length > 0, tools.length > 0][step] ?? false;
  const done = step === 4;

  function pickSector(id: string) {
    setSector(id);
    // Single-choice step: move on by itself, with a beat to see the selection land.
    setTimeout(() => setStep(1), reduce ? 0 : 280);
  }

  function toggle(list: string[], set: (v: string[]) => void, id: string, max = Infinity, exclusive?: string) {
    if (exclusive && id === exclusive) return set(list.includes(id) ? [] : [id]);
    const base = exclusive ? list.filter((x) => x !== exclusive) : list;
    if (base.includes(id)) return set(base.filter((x) => x !== id));
    if (base.length >= max) return;
    set([...base, id]);
  }

  function reset() {
    setStep(0);
    setSector(null);
    setGoals([]);
    setChannels([]);
    setTools([]);
  }

  const summary = [
    "Hola, quiero evaluar una solución con iA Connexion.",
    `Rubro: ${rec.sectorLabel}`,
    `Sistema sugerido: ${rec.name} (referencia: caso de ${rec.reference.title})`,
    `Objetivos: ${goals.map((g) => label(GOALS, g)).join(", ") || "Por definir"}`,
    `Canales: ${rec.channels.join(", ") || "Por definir"}`,
    `Herramientas actuales: ${rec.integrations.join(", ") || "Ninguna aún"}`,
  ].join("\n");

  function showCase() {
    window.dispatchEvent(new CustomEvent("ia:show-case", { detail: rec.reference.id }));
    document.getElementById("casos")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const options = (() => {
    if (step === 0) return SECTORS.map((s) => <OptionCard key={s.id} choice={s} selected={sector === s.id} onClick={() => pickSector(s.id)} />);
    if (step === 1)
      return GOALS.map((g) => {
        const index = goals.indexOf(g.id);
        return (
          <OptionCard
            key={g.id}
            choice={g}
            selected={index >= 0}
            order={index >= 0 ? index + 1 : undefined}
            disabled={index < 0 && goals.length >= MAX_GOALS}
            onClick={() => toggle(goals, setGoals, g.id, MAX_GOALS)}
          />
        );
      });
    if (step === 2) return CHANNELS.map((c) => <OptionCard key={c.id} choice={c} selected={channels.includes(c.id)} onClick={() => toggle(channels, setChannels, c.id)} />);
    return CURRENT_TOOLS.map((t) => (
      <OptionCard key={t.id} choice={t} selected={tools.includes(t.id)} onClick={() => toggle(tools, setTools, t.id, Infinity, "ninguna")} />
    ));
  })();

  return (
    <section id="encuentra" className="border-t border-border py-20 sm:py-28">
      <Container>
        <SignHeading
          title={
            <>
              Encuentra <SignWord>por dónde empezar</SignWord>
            </>
          }
          description="Responde cuatro preguntas y arma tu sistema agéntico en vivo. Te recomendamos una solución basada en los casos que ya implementamos. No es una cotización automática: cada solución se valida según tus procesos, datos y permisos."
          className="max-w-3xl"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
          {/* Questions / result */}
          <div className="rounded-2xl border border-[#153d6b] bg-[linear-gradient(160deg,#0a1830,#050c1b)] p-5 sm:p-7">
            <ol className="grid grid-cols-4 gap-2" aria-label="Progreso">
              {STEP_LABELS.map((stepLabel, k) => (
                <li key={stepLabel}>
                  <button
                    type="button"
                    disabled={k > step || done}
                    onClick={() => setStep(k)}
                    className="focus-ring w-full rounded-md text-left disabled:cursor-default"
                    aria-current={k === step ? "step" : undefined}
                  >
                    <span className={cn("block h-1 rounded-full transition-colors duration-300", k < step || done ? "bg-cyan" : k === step ? "bg-cyan/60" : "bg-[#1c3453]")} />
                    <span className={cn("mt-1.5 block text-[10px] font-medium sm:text-[11px]", k <= step || done ? "text-foreground/80" : "text-muted/60")}>
                      {k + 1}. {stepLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <AnimatePresence mode="wait" initial={false}>
              {!done ? (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, transform: reduce ? "none" : "translateX(16px)" }}
                  animate={{ opacity: 1, transform: "translateX(0px)" }}
                  exit={{ opacity: 0, transform: reduce ? "none" : "translateX(-16px)" }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="mt-6"
                >
                  <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{STEP_TITLES[step]}</h3>
                  <p className="mt-1 text-xs text-muted">{STEP_HINTS[step]}</p>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">{options}</div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#1c3453] pt-5">
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0}
                      className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:invisible"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Atrás
                    </button>
                    {step > 0 ? (
                      <button
                        type="button"
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canContinue}
                        className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(47,93,250,0.9)] transition-[filter,opacity] duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                      >
                        {step === 3 ? "Ver mi recomendación" : "Continuar"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Toca una opción para continuar</span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, transform: reduce ? "none" : "translateY(10px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="mt-6"
                  aria-live="polite"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#50e7b3]">Tu recomendación</p>
                  <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{rec.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a8bad4]">
                    Para {rec.sectorLabel.toLowerCase()}, que atienda por {listJoin(rec.channels) || "tus canales"}
                    {rec.integrations.length ? ` y se conecte con ${listJoin(rec.integrations)}` : ""}.
                  </p>

                  <div className="mt-5 rounded-xl border p-4" style={{ borderColor: `${rec.reference.color}66`, background: `${rec.reference.color}10` }}>
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <rec.reference.icon className="h-4 w-4" style={{ color: rec.reference.color }} aria-hidden="true" />
                      Basado en un caso real: {rec.reference.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#a8bad4]">{rec.reference.summary}</p>
                    <button
                      type="button"
                      onClick={showCase}
                      className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-[filter] duration-200 hover:brightness-125"
                      style={{ borderColor: rec.reference.color, color: rec.reference.color }}
                    >
                      <PlayCircle className="h-4 w-4" aria-hidden="true" /> Ver este caso en acción
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Qué haría tu agente</p>
                      <ul className="mt-2 grid gap-1.5">
                        {rec.agentTools.map((t) => (
                          <li key={t} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden="true" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Tu panel de control</p>
                      <ul className="mt-2 grid gap-1.5">
                        {rec.modules.map((m) => (
                          <li key={m} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sign-amber" aria-hidden="true" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-muted">
                    {rec.integrations.length
                      ? "Evaluaremos la conexión con las herramientas que ya usas según sus permisos y APIs disponibles."
                      : "El primer paso sería mapear tu proceso y definir las herramientas que necesitas."}{" "}
                    Esta es una orientación inicial, no una cotización.
                  </p>

                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => router.push(`/contacto?need=${encodeURIComponent(summary)}`)}
                      className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" /> Enviar esta solución
                    </button>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[#25d366]/60 px-5 py-3 text-sm font-semibold text-[#25d366] transition-colors hover:bg-[#25d366]/10"
                    >
                      Conversar por WhatsApp <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[#24436b] px-5 py-3 text-sm text-foreground transition-colors hover:border-cyan/50"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> Empezar de nuevo
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live preview of the system being assembled */}
          <aside className="lg:sticky lg:top-28" style={{ perspective: "1000px" }} aria-label="Vista previa de tu sistema">
            <div className="rounded-2xl border border-[#1c3b63] bg-[radial-gradient(ellipse_at_50%_0%,#0b2451_0%,#071124_60%,#050914_100%)] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] lg:[transform:rotateY(-6deg)]">
              <p className="flex items-center justify-between text-sm font-semibold text-foreground">
                Tu sistema agéntico
                <span className="flex items-center gap-1.5 text-[10px] font-normal text-[#50e7b3]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#50e7b3]" aria-hidden="true" />
                  {done ? "Listo" : "Armándose"}
                </span>
              </p>
              <div className="mt-4 grid gap-4">
                <PreviewGroup title="Canales" items={channels.map((c) => label(CHANNELS, c))} empty="Paso 3" tone="violet" />
                <div className="flex items-center gap-3 rounded-xl border border-cyan/30 bg-cyan/[0.06] p-3">
                  <motion.span
                    key={sector ?? "none"}
                    initial={reduce ? false : { transform: "scale(0.8)", opacity: 0.4 }}
                    animate={{ transform: "scale(1)", opacity: 1 }}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-cyan/70 bg-[#071632] text-cyan shadow-[0_0_24px_-4px_rgba(56,211,255,0.7)]"
                  >
                    <SectorIcon className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-[#7f9cc4]">Agente iA</span>
                    <span className="block truncate text-sm font-semibold text-foreground">{goals.length ? rec.name : sector ? rec.sectorLabel : "Elige tu rubro"}</span>
                  </span>
                </div>
                <PreviewGroup title="Herramientas del agente" items={rec.agentTools} empty="Paso 2" />
                <PreviewGroup title="Panel de control" items={goals.length ? rec.modules : []} empty="Paso 2" tone="amber" />
                <PreviewGroup title="Integraciones" items={tools.includes("ninguna") ? ["Por definir contigo"] : rec.integrations} empty="Paso 4" tone="violet" />
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
