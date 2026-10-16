"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bot, Database, MessageCircle, Workflow, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "support", title: "Atender clientes", detail: "Consultas, seguimiento y atención inicial", icon: MessageCircle },
  { id: "operations", title: "Automatizar procesos", detail: "Tareas repetitivas y coordinación interna", icon: Workflow },
  { id: "knowledge", title: "Usar mi información", detail: "Documentos, datos y conocimiento interno", icon: Database },
  { id: "agents", title: "Crear agentes de IA", detail: "Asistentes conectados a herramientas", icon: Bot },
];

const SYSTEMS = [
  { id: "crm", label: "CRM o ventas" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "web", label: "Sitio web" },
  { id: "sheets", label: "Hojas de cálculo" },
  { id: "erp", label: "ERP o sistema interno" },
  { id: "none", label: "Todavía ninguno" },
];

const SCALE = [
  { id: "solo", label: "Trabajo individual" },
  { id: "small", label: "Equipo pequeño" },
  { id: "growing", label: "Empresa en crecimiento" },
  { id: "large", label: "Operación con varias áreas" },
];

export function SolutionFinder() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [systems, setSystems] = useState<string[]>([]);
  const [scale, setScale] = useState("");
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const recommendation = useMemo(() => {
    const selected = GOALS.find((item) => item.id === goal);
    const hasSystems = systems.some((item) => item !== "none");
    const title = goal === "support"
      ? "Agente de atención conectado"
      : goal === "operations"
        ? "Automatización de procesos"
        : goal === "knowledge"
          ? "Asistente de conocimiento"
          : "Sistema agéntico a medida";
    const detail = goal === "support"
      ? "Un agente que clasifique consultas, consulte información autorizada y prepare respuestas con reglas de escalamiento."
      : goal === "operations"
        ? "Un flujo que conecte el evento inicial, las reglas de negocio, las herramientas y las notificaciones."
        : goal === "knowledge"
          ? "Una solución que recupere información de tus fuentes autorizadas y responda con contexto verificable."
          : "Un agente con objetivo definido, herramientas permitidas, límites de actuación y supervisión.";
    return { title, detail, selected, integrationNote: hasSystems ? "Podemos evaluar la conexión con las herramientas que ya utilizas." : "El primer paso sería mapear el proceso y definir las herramientas necesarias." };
  }, [goal, systems]);

  function toggleSystem(id: string) {
    setSystems((current) => id === "none" ? (current.includes("none") ? [] : ["none"]) : current.includes(id) ? current.filter((item) => item !== id) : [...current.filter((item) => item !== "none"), id]);
  }

  function reset() {
    setGoal("");
    setSystems([]);
    setScale("");
    setStep(0);
    setShowResult(false);
  }

  function continueToContact() {
    const summary = [
      "Hola, quiero evaluar una solución con iA Connexion.",
      `Objetivo: ${recommendation.title}`,
      `Sistemas: ${systems.length ? SYSTEMS.filter((item) => systems.includes(item.id)).map((item) => item.label).join(", ") : "Por definir"}`,
      `Tamaño de operación: ${SCALE.find((item) => item.id === scale)?.label ?? "Por definir"}`,
    ].join("\n");
    router.push(`/contacto?need=${encodeURIComponent(summary)}`);
  }

  return (
    <section className="solution-finder mt-16 overflow-hidden rounded-2xl border border-cyan/20 bg-background-elevated/60">
      <div className="border-b border-border p-5 sm:p-7">
        <p className="font-mono text-[10px] tracking-[.2em] text-cyan">SOLUTION FINDER / INTERACTIVO</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground sm:text-2xl">Encuentra por dónde empezar</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Responde tres preguntas y obtén una orientación inicial. No es una cotización automática: cada solución se valida según tus procesos, datos y permisos.</p>
        {!showResult && <div className="mt-5 flex gap-2" aria-label={`Paso ${step + 1} de 3`}>{[0, 1, 2].map((n) => <span key={n} className={cn("h-1 flex-1 rounded-full", n <= step ? "bg-cyan" : "bg-border")} />)}</div>}
      </div>

      <div className="p-5 sm:p-7">
        {!showResult ? (
          <>
            {step === 0 && <fieldset><legend className="text-base font-semibold text-foreground">¿Qué te gustaría mejorar primero?</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{GOALS.map((item) => { const ItemIcon = item.icon; return <button key={item.id} type="button" onClick={() => setGoal(item.id)} aria-pressed={goal === item.id} className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-all", goal === item.id ? "border-cyan/50 bg-cyan/[.06]" : "border-border hover:border-cyan/25")}><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", goal === item.id ? "bg-cyan/10 text-cyan" : "bg-background text-muted")}><ItemIcon className="h-5 w-5" /></span><span><span className="block text-sm font-semibold text-foreground">{item.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted">{item.detail}</span></span></button>; })}</div></fieldset>}
            {step === 1 && <fieldset><legend className="text-base font-semibold text-foreground">¿Qué herramientas ya utilizas?</legend><p className="mt-1 text-sm text-muted">Puedes seleccionar varias.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{SYSTEMS.map((item) => <button key={item.id} type="button" onClick={() => toggleSystem(item.id)} aria-pressed={systems.includes(item.id)} className={cn("flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors", systems.includes(item.id) ? "border-cyan/45 bg-cyan/[.06] text-cyan" : "border-border text-foreground hover:border-cyan/25")}>{item.label}<span className={cn("h-4 w-4 rounded border", systems.includes(item.id) ? "border-cyan bg-cyan shadow-[inset_0_0_0_3px_#0a0e1c]" : "border-muted/40")} /></button>)}</div></fieldset>}
            {step === 2 && <fieldset><legend className="text-base font-semibold text-foreground">¿Cómo es tu operación?</legend><div className="mt-4 grid gap-2 sm:grid-cols-2">{SCALE.map((item) => <button key={item.id} type="button" onClick={() => setScale(item.id)} aria-pressed={scale === item.id} className={cn("rounded-xl border px-4 py-4 text-left text-sm transition-colors", scale === item.id ? "border-cyan/45 bg-cyan/[.06] text-cyan" : "border-border text-foreground hover:border-cyan/25")}>{item.label}</button>)}</div></fieldset>}
            <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
              <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground disabled:opacity-30"><ArrowLeft className="h-4 w-4" /> Atrás</button>
              <button type="button" disabled={(step === 0 && !goal) || (step === 1 && systems.length === 0) || (step === 2 && !scale)} onClick={() => step < 2 ? setStep((value) => value + 1) : setShowResult(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35">{step === 2 ? "Ver orientación" : "Continuar"} <ArrowRight className="h-4 w-4" /></button>
            </div>
          </>
        ) : (
          <div aria-live="polite">
            <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sign-led/20 bg-sign-led/10 text-sign-led"><Zap className="h-5 w-5" /></span><div><p className="font-mono text-[10px] tracking-[.16em] text-sign-led">ORIENTACIÓN INICIAL</p><h4 className="mt-1 font-display text-xl font-semibold text-foreground">{recommendation.title}</h4><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{recommendation.detail}</p></div></div>
            <div className="mt-5 rounded-xl border border-border bg-background p-4"><p className="text-sm leading-relaxed text-foreground">{recommendation.integrationNote}</p><p className="mt-2 text-xs text-muted">Operación: {SCALE.find((item) => item.id === scale)?.label}. Las integraciones y el alcance se definen después de una revisión técnica.</p></div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={continueToContact} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">Conversar sobre esta solución <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={reset} className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-cyan/30">Empezar de nuevo</button></div>
          </div>
        )}
      </div>
    </section>
  );
}
