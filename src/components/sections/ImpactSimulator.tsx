"use client";

import { useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Scenario = {
  label: string;
  /** tiempo recuperado, capacidad, tareas repetitivas (baja), seguimiento */
  metrics: [number, number, number, number];
  before: [number, number, number, number];
  after: [number, number, number, number];
};

const SCENARIOS: Record<string, Scenario> = {
  ecommerce: { label: "E-commerce", metrics: [32, 45, 40, 60], before: [85, 75, 80, 45], after: [55, 42, 35, 78] },
  servicios: { label: "Servicios", metrics: [28, 38, 35, 55], before: [75, 65, 70, 50], after: [48, 40, 38, 75] },
  restaurantes: { label: "Restaurantes", metrics: [30, 42, 38, 58], before: [80, 75, 70, 48], after: [52, 43, 35, 76] },
  marketing: { label: "Marketing", metrics: [35, 48, 45, 62], before: [78, 72, 85, 50], after: [45, 40, 40, 82] },
  oficina: { label: "Oficina", metrics: [38, 40, 48, 55], before: [90, 80, 85, 45], after: [48, 50, 35, 72] },
  ventas: { label: "Ventas / CRM", metrics: [25, 36, 30, 65], before: [65, 70, 68, 42], after: [50, 45, 50, 80] },
  soporte: { label: "Soporte", metrics: [34, 52, 42, 60], before: [85, 80, 75, 40], after: [50, 38, 40, 78] },
  integraciones: { label: "Integraciones", metrics: [30, 40, 50, 58], before: [80, 75, 85, 45], after: [50, 40, 35, 75] },
};

const METRIC_LABELS = ["Tiempo operativo recuperado", "Capacidad de atención", "Tareas repetitivas", "Seguimiento registrado"];
const BAR_LABELS = ["Gestión manual", "Tiempo de respuesta", "Trabajo repetitivo", "Seguimiento"];
const DEFAULTS = { hours: 20, rate: 40, team: 5 };

const fmt = (n: number) => n.toLocaleString("es-PE", { maximumFractionDigits: 1 });

/** Escenarios ilustrativos y editables; no son resultados medidos. */
export function ImpactSimulator() {
  const [key, setKey] = useState("ecommerce");
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [team, setTeam] = useState(DEFAULTS.team);
  const [copied, setCopied] = useState(false);

  const sc = SCENARIOS[key];
  const weekly = (hours * team * rate) / 100;
  const annual = Math.round(weekly * 52);

  const summary =
    `iA Connexion · escenario ilustrativo de crecimiento (${sc.label})\n` +
    `Indicadores de ejemplo: +${sc.metrics[0]}% tiempo operativo potencial recuperado; +${sc.metrics[1]}% capacidad de atención; −${sc.metrics[2]}% tareas repetitivas; +${sc.metrics[3]}% seguimiento registrado.\n` +
    `Equipo: ${team} personas; dedicación repetitiva: ${hours} h/persona/semana; automatización estimada: ${rate}%. Tiempo potencial: ${fmt(weekly)} h/semana (≈ ${annual.toLocaleString("es-PE")} h/año).\n` +
    `Datos configurables de demostración, no resultados medidos ni garantías.`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia el resumen:", summary);
    }
  }

  function reset() {
    setHours(DEFAULTS.hours);
    setRate(DEFAULTS.rate);
    setTeam(DEFAULTS.team);
  }

  const sliders = [
    { id: "g-hours", label: "Horas semanales dedicadas a tareas repetitivas", value: hours, set: setHours, min: 5, max: 60, step: 5, show: `${hours} h` },
    { id: "g-auto", label: "Porcentaje estimado de tareas automatizables", value: rate, set: setRate, min: 10, max: 80, step: 5, show: `${rate}%` },
    { id: "g-team", label: "Personas del equipo", value: team, set: setTeam, min: 1, max: 50, step: 1, show: String(team) },
  ];

  return (
    <section aria-label="Simulador de impacto ilustrativo" className="plate mt-14 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-cyan">PANEL DE CRECIMIENTO · DEMO</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Visualiza el impacto potencial de automatizar
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Indicadores editables para mostrar escenarios de crecimiento. No son resultados reales ni estadísticas verificadas de iA Connexion.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full border border-[#28557b] bg-[#0b2039] px-3 py-2 text-[9px] text-[#c6e3ff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffbf4d] shadow-[0_0_10px_#ffbf4d]" aria-hidden="true" />
          SIMULADOR INTERACTIVO
        </span>
      </div>

      <div role="group" aria-label="Rubro del escenario" className="mt-5 flex flex-wrap gap-2">
        {Object.entries(SCENARIOS).map(([k, s]) => (
          <button
            key={k}
            type="button"
            onClick={() => setKey(k)}
            aria-pressed={k === key}
            className={cn(
              "focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              k === key ? "border-cyan bg-cyan/10 text-cyan" : "border-border text-muted hover:border-cyan/60 hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {METRIC_LABELS.map((label, i) => (
          <article key={label} className="min-w-0 rounded-xl border border-[#1b3a61] bg-[linear-gradient(145deg,#0b1d36,#071122)] p-3.5">
            <p className="text-[10px] leading-snug text-[#a9c0de]">{label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#58eaff] tabular-nums sm:text-3xl">
              {i === 2 ? "−" : "+"}
              {sc.metrics[i]}%
            </p>
            <p className="mt-0.5 text-[9px] text-[#829cbd]">Escenario de ejemplo</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#1a3454]">
              <span
                className="block h-full origin-left rounded-full bg-gradient-to-r from-[#187aff] to-[#4af0ff] transition-transform duration-500"
                style={{ transform: `scaleX(${sc.metrics[i] / 100})` }}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 rounded-xl border border-[#1b3b61] bg-[#071326] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground">Comparación operativa estimada</p>
              <p className="mt-1 text-[9px] leading-relaxed text-[#8ea8ca]">Antes de automatizar vs. escenario con automatización</p>
            </div>
            <span className="whitespace-nowrap rounded border border-[#2a4e78] px-2 py-1.5 text-[8px] tracking-[0.1em] text-[#b6dcff]">
              {sc.label.toUpperCase()}
            </span>
          </div>
          <div
            role="img"
            aria-label={`Gráfico comparativo ilustrativo (${sc.label}): ${BAR_LABELS.map((l, i) => `${l} ${sc.before[i]} antes, ${sc.after[i]} con automatización`).join("; ")}`}
            className="mt-4 grid h-56 grid-cols-[32px_minmax(0,1fr)]"
          >
            <div aria-hidden="true" className="flex flex-col justify-between pb-8 pr-2 text-right text-[8px] text-[#718bae]">
              {["100%", "75%", "50%", "25%", "0%"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="relative border-b border-[#274469]">
              {[0, 25, 50, 75, 100].map((t) => (
                <div key={t} aria-hidden="true" className="absolute inset-x-0 border-t border-dashed border-[#24405f]" style={{ top: `${t}%` }} />
              ))}
              <div className="absolute inset-0 grid grid-cols-4 gap-2 px-1 sm:gap-2.5">
                {BAR_LABELS.map((label, i) => (
                  <div key={label} className="relative flex items-end justify-center gap-1 pb-8">
                    {(
                      [
                        [sc.before[i], "bg-gradient-to-b from-[#8b9db9] to-[#334c70]"],
                        [sc.after[i], "bg-gradient-to-b from-[#50efff] to-[#1675ff] shadow-[0_0_13px_rgba(22,138,255,0.3)]"],
                      ] as const
                    ).map(([v, cls], j) => (
                      <div
                        key={j}
                        className={cn("relative z-10 min-h-1 w-[27%] max-w-7 rounded-t transition-[height] duration-500", cls)}
                        style={{ height: `${v}%` }}
                      >
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-[#dcecff] tabular-nums">{v}</span>
                      </div>
                    ))}
                    <small className="absolute inset-x-0 bottom-1 px-0.5 text-center text-[8px] leading-tight text-[#8fa8c8] max-sm:text-[7px]">{label}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-[#8ea8c9]">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#7188a8]" />Proceso actual (índice 100 de referencia)</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#2aaaff]" />Escenario ilustrativo</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-[#1b3b61] bg-[#071326] p-4">
          <p className="text-xs font-semibold text-foreground">Adapta el escenario</p>
          <p className="mt-1 text-[9px] text-[#8ea8ca]">Modifica los valores para tu presentación</p>
          {sliders.map((s) => (
            <div key={s.id}>
              <label htmlFor={s.id} className="mb-1.5 mt-4 flex justify-between gap-3 text-[10px] leading-snug text-[#a8bfdc]">
                {s.label}
                <b className="whitespace-nowrap text-[#55eaff]">{s.show}</b>
              </label>
              <input
                id={s.id}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#35dfff]"
              />
            </div>
          ))}
          <div className="mt-5 rounded-lg border border-[#1f4d72] bg-[linear-gradient(110deg,#0b2a47,#0a1a31)] p-3" aria-live="polite">
            <span className="block text-[9px] text-[#9db8d7]">Tiempo potencial recuperado</span>
            <b className="my-1 block font-display text-2xl text-[#5ceaff]">{fmt(weekly)} h/semana</b>
            <small className="text-[9px] leading-snug text-[#8fa8ca]">≈ {annual.toLocaleString("es-PE")} h/año en todo el equipo</small>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2b4e75] bg-[#0b1d35] px-3 py-2.5 text-[11px] font-bold text-[#d7eaff] transition-colors hover:border-cyan"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restablecer
            </button>
            <button
              type="button"
              onClick={copy}
              className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#278bff] bg-gradient-to-r from-[#1459ef] to-[#078dff] px-3 py-2.5 text-[11px] font-bold text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? "Copiado" : "Copiar resumen"}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-[#8098b8]">
        <b className="text-[#bdd8f5]">Transparencia:</b> cifras de demostración configurables, no datos históricos ni promesas de rendimiento. El cálculo de horas representa horas potencialmente liberadas según los valores elegidos; no descuenta revisión, supervisión, excepciones ni tiempo de implementación.
      </p>
    </section>
  );
}
