"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { BrainCircuit, Database, Pause, Play, Target, User, Workflow, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToRgb } from "@/components/illustrations/orbit3d";

type Step = {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  color: string;
  /** What the information is called as it leaves this stage (shown next to the travelling packet). */
  tagOut: string;
  status: string;
  title: string;
  copy: string;
  outcome: string;
  outcopy: string;
};

// Illustrative flow: the lights stand for information travelling through a connected system.
const STEPS: Step[] = [
  {
    key: "personas",
    label: "Personas",
    hint: "Interacción humana + IA",
    icon: User,
    color: "#35ddff",
    tagOut: "Solicitud",
    status: "recibiendo una necesidad",
    title: "Personas generan una solicitud",
    copy: "El flujo comienza con una necesidad, pregunta o evento que inicia el proceso.",
    outcome: "Detectar una necesidad",
    outcopy: "Una consulta, formulario o evento inicia el recorrido de información.",
  },
  {
    key: "datos",
    label: "Datos",
    hint: "Información estructurada y no estructurada",
    icon: Database,
    color: "#ffb943",
    tagOut: "Contexto validado",
    status: "organizando la información",
    title: "Los datos se estructuran y validan",
    copy: "La información se reúne, valida y prepara según las reglas y permisos definidos.",
    outcome: "Información contextualizada",
    outcopy: "Los datos disponibles se ordenan para que el agente pueda trabajar con contexto.",
  },
  {
    key: "herramientas",
    label: "Herramientas",
    hint: "Aplicaciones, APIs y servicios externos",
    icon: Wrench,
    color: "#ff4e8b",
    tagOut: "Conexiones listas",
    status: "preparando las conexiones",
    title: "Las herramientas aportan capacidades",
    copy: "Aplicaciones, APIs y servicios externos pueden aportar información o recibir acciones autorizadas.",
    outcome: "Conexiones disponibles",
    outcopy: "Los conectores habilitados enlazan las herramientas que forman parte del proceso.",
  },
  {
    key: "agentes",
    label: "Agentes",
    hint: "",
    icon: BrainCircuit,
    color: "#35ddff",
    tagOut: "Decisión",
    status: "analizando el contexto",
    title: "Los agentes interpretan y coordinan",
    copy: "Los agentes clasifican la tarea, aplican instrucciones y deciden el siguiente paso dentro de sus límites.",
    outcome: "Decisión dentro de reglas",
    outcopy: "La IA prepara el siguiente paso; las acciones sensibles pueden requerir revisión humana.",
  },
  {
    key: "automatizacion",
    label: "Automatización",
    hint: "",
    icon: Workflow,
    color: "#48c9ff",
    tagOut: "Acción ejecutada",
    status: "ejecutando el flujo",
    title: "La automatización coordina los pasos",
    copy: "Las reglas de orquestación conectan tareas, gestionan estados y contemplan excepciones.",
    outcome: "Proceso coordinado",
    outcopy: "Los pasos se ejecutan en secuencia cuando existen integraciones, permisos y condiciones válidas.",
  },
  {
    key: "resultados",
    label: "Resultados",
    hint: "",
    icon: Target,
    color: "#43f0b2",
    tagOut: "",
    status: "registrando el resultado",
    title: "El resultado queda listo para seguimiento",
    copy: "El proceso puede generar una respuesta, actualizar un registro o preparar una tarea y dejar trazabilidad.",
    outcome: "Resultado y trazabilidad",
    outcopy: "Los resultados reales dependen de los sistemas conectados, la validación y el alcance implementado.",
  },
];

const LAST = STEPS.length - 1;
const COLOR_RGB = STEPS.map((s) => hexToRgb(s.color));
const DWELL_MS = 1700;
const LAST_DWELL_MS = 3000;
const TRAVEL_MS = 850;
const MANUAL_HOLD_MS = 12000;

type P2 = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number; cx: number; cy: number };
type Leg = { p0: P2; c1?: P2; c2?: P2; p3: P2 };
type Effect = { kind: "ring" | "burst"; x: number; y: number; start: number; rgb: string; max: number };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function pointOn(leg: Leg, t: number): P2 {
  if (!leg.c1 || !leg.c2) return { x: leg.p0.x + (leg.p3.x - leg.p0.x) * t, y: leg.p0.y + (leg.p3.y - leg.p0.y) * t };
  const v = 1 - t;
  const a = v * v * v;
  const b = 3 * v * v * t;
  const c = 3 * v * t * t;
  const d = t * t * t;
  return {
    x: a * leg.p0.x + b * leg.c1.x + c * leg.c2.x + d * leg.p3.x,
    y: a * leg.p0.y + b * leg.c1.y + c * leg.c2.y + d * leg.p3.y,
  };
}

function rectOf(el: HTMLElement, root: HTMLElement): Rect {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

/** Leg from one stage to the next: edge to edge along a row, or bottom to top (curved) across rows. */
function legBetween(a: Rect, b: Rect): Leg {
  if (Math.abs(a.cy - b.cy) < Math.min(a.h, b.h) * 0.6) {
    const dir = b.cx > a.cx ? 1 : -1;
    return { p0: { x: dir > 0 ? a.x + a.w : a.x, y: a.cy }, p3: { x: dir > 0 ? b.x : b.x + b.w, y: b.cy } };
  }
  const p0 = { x: a.cx, y: a.y + a.h };
  const p3 = { x: b.cx, y: b.y };
  const k = (p3.y - p0.y) * 0.55;
  return { p0, p3, c1: { x: p0.x, y: p0.y + k }, c2: { x: p3.x, y: p3.y - k } };
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** The "placa" that connects everything: a packet of information travels through the six stages of a connected system. */
export function ConnectivityPlate() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [paused, setPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const unitRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const indexRef = useRef(0);
  const cycleRef = useRef(1);
  const pausedRef = useRef(false);
  const manualUntilRef = useRef(0);
  const holdingRef = useRef(false);
  const phaseRef = useRef<{ kind: "dwell" | "travel"; start: number }>({ kind: "dwell", start: 0 });
  const requestRef = useRef<{ stage: number } | null>(null);
  const effectsRef = useRef<Effect[]>([]);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 90, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 90, damping: 18 });

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function choose(stage: number, timeStamp: number) {
    manualUntilRef.current = timeStamp + MANUAL_HOLD_MS;
    holdingRef.current = true;
    requestRef.current = { stage };
  }

  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
  }

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    if (reduce) pausedRef.current = true;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      width = root.offsetWidth;
      height = root.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const measure = () => {
      const rects = unitRefs.current.map((el) => (el ? rectOf(el, root) : null));
      if (rects.some((r) => r === null)) return null;
      const list = rects as Rect[];
      const legs = list.slice(0, -1).map((r, i) => legBetween(r, list[i + 1]));
      // Where information enters a stage: end of the previous leg; the first stage takes it from its near edge.
      const entry = list.map((r, i): P2 => {
        if (i > 0) return legs[i - 1].p3;
        const sameRow = Math.abs(r.cy - list[1].cy) < r.h * 0.6;
        return sameRow ? { x: r.x, y: r.cy } : { x: r.cx, y: r.y };
      });
      return { list, legs, entry };
    };

    const arrive = (stage: number, now: number, entry: P2, rect: Rect) => {
      const rgb = COLOR_RGB[stage];
      effectsRef.current.push({ kind: "ring", x: entry.x, y: entry.y, start: now, rgb, max: 46 });
      if (stage === LAST) effectsRef.current.push({ kind: "burst", x: rect.cx, y: rect.cy, start: now, rgb, max: 90 });
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const m = measure();
      if (!m) return;
      const { list, legs, entry } = m;
      const stage = indexRef.current;
      const phase = phaseRef.current;
      const elapsed = now - phase.start;
      const travelT = phase.kind === "travel" ? Math.min(1, elapsed / TRAVEL_MS) : 0;
      const t = ease(travelT);

      const trace = (leg: Leg, upTo: number, steps = 28) => {
        ctx.beginPath();
        for (let k = 0; k <= steps; k++) {
          const p = pointOn(leg, (upTo * k) / steps);
          if (k === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      };

      // Base wiring between stages (marching dashes), with the already-travelled legs lit.
      legs.forEach((leg, i) => {
        ctx.setLineDash([3, 6]);
        ctx.lineDashOffset = reduce ? 0 : -now / 80;
        ctx.strokeStyle = "rgba(120, 160, 215, 0.28)";
        ctx.lineWidth = 1.2;
        trace(leg, 1);
        ctx.stroke();
        ctx.setLineDash([]);

        const done = i < stage || (i === stage && phase.kind === "travel");
        const upTo = i < stage ? 1 : t;
        if (done && upTo > 0) {
          const g = ctx.createLinearGradient(leg.p0.x, leg.p0.y, leg.p3.x, leg.p3.y);
          g.addColorStop(0, `rgba(${COLOR_RGB[i]}, 0.95)`);
          g.addColorStop(1, `rgba(${COLOR_RGB[i + 1]}, 0.95)`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 6;
          ctx.globalAlpha = 0.16;
          trace(leg, upTo);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 2;
          trace(leg, upTo);
          ctx.stroke();
        }
      });

      // The packet: only visible while it travels (inside a stage it is "absorbed" and the stage lights up).
      const label = labelRef.current;
      if (phase.kind === "travel" && stage < LAST) {
        const leg = legs[stage];
        const rgb0 = COLOR_RGB[stage];
        const rgb1 = COLOR_RGB[stage + 1];
        const mix = rgb0.split(",").map((v, k) => Math.round(Number(v) + (Number(rgb1.split(",")[k]) - Number(v)) * t));
        const rgb = mix.join(", ");
        for (let k = 9; k >= 0; k--) {
          const tt = Math.max(0, t - k * 0.035);
          const p = pointOn(leg, tt);
          const a = (1 - k / 10) * 0.55;
          ctx.fillStyle = `rgba(${rgb}, ${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 + (1 - k / 10) * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        const head = pointOn(leg, t);
        const halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22);
        halo.addColorStop(0, `rgba(${rgb}, 0.65)`);
        halo.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(244, 252, 255, 0.98)";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4.4, 0, Math.PI * 2);
        ctx.fill();
        if (label) {
          label.textContent = STEPS[stage].tagOut;
          label.style.transform = `translate3d(${head.x + 12}px, ${head.y - 30}px, 0)`;
          label.style.opacity = String(Math.min(1, Math.min(travelT * 5, (1 - travelT) * 5)));
          label.style.borderColor = `rgba(${rgb}, 0.7)`;
          label.style.color = `rgb(${rgb})`;
        }
      } else if (label) {
        label.style.opacity = "0";
      }

      // Idle pulse on the lit stage so it reads as "working", not just highlighted.
      if (!reduce && phase.kind === "dwell") {
        const r = list[stage];
        const pulse = (now / 900) % 1;
        ctx.strokeStyle = `rgba(${COLOR_RGB[stage]}, ${0.35 * (1 - pulse)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(r.x - pulse * 9, r.y - pulse * 9, r.w + pulse * 18, r.h + pulse * 18, 17 + pulse * 6);
        ctx.stroke();
      }

      // Arrival rings and the final burst.
      effectsRef.current = effectsRef.current.filter((fx) => now - fx.start < (fx.kind === "burst" ? 1100 : 650));
      for (const fx of effectsRef.current) {
        const u = (now - fx.start) / (fx.kind === "burst" ? 1100 : 650);
        if (fx.kind === "ring") {
          ctx.strokeStyle = `rgba(${fx.rgb}, ${0.85 * (1 - u)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, 6 + fx.max * ease(u), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          for (let k = 0; k < 14; k++) {
            const a = (k / 14) * Math.PI * 2 + 0.2;
            const d = fx.max * ease(u);
            ctx.fillStyle = `rgba(${fx.rgb}, ${1 - u})`;
            ctx.beginPath();
            ctx.arc(fx.x + Math.cos(a) * d, fx.y + Math.sin(a) * d * 0.6, 2.6 * (1 - u) + 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      void entry;
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const phase = phaseRef.current;
      const m = measure();

      if (requestRef.current && m) {
        const { stage } = requestRef.current;
        requestRef.current = null;
        indexRef.current = stage;
        setIndex(stage);
        phase.kind = "dwell";
        phase.start = now;
        arrive(stage, now, m.entry[stage], m.list[stage]);
      } else if (pausedRef.current) {
        phase.start += dt; // freeze the current phase while paused
      } else if (now < manualUntilRef.current) {
        phase.start = now; // the visitor is exploring: keep dwelling where they clicked
      } else if (m) {
        if (holdingRef.current) {
          holdingRef.current = false;
          phase.kind = "dwell";
          phase.start = now;
        }
        const elapsed = now - phase.start;
        const stage = indexRef.current;
        if (phase.kind === "dwell" && elapsed >= (stage === LAST ? LAST_DWELL_MS : DWELL_MS)) {
          if (stage < LAST) {
            phase.kind = "travel";
            phase.start = now;
          } else {
            cycleRef.current += 1;
            setCycle(cycleRef.current);
            indexRef.current = 0;
            setIndex(0);
            phase.kind = "dwell";
            phase.start = now;
            arrive(0, now, m.entry[0], m.list[0]);
          }
        } else if (phase.kind === "travel" && elapsed >= TRAVEL_MS) {
          const next = stage + 1;
          indexRef.current = next;
          setIndex(next);
          phase.kind = "dwell";
          phase.start = now;
          arrive(next, now, m.entry[next], m.list[next]);
        }
      }

      draw(now);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      // Seed the phase clock once; the observer may restart the loop repeatedly.
      if (phaseRef.current.start === 0) phaseRef.current.start = last;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: "80px" });
    visibility.observe(root);
    draw(0);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
    };
  }, [reduce]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 5);
    tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 3.5);
  }

  const step = STEPS[index];
  const isPaused = paused || !!reduce;

  const unit = (i: number, className: string) => {
    const s = STEPS[i];
    const Icon = s.icon;
    const lit = i === index;
    return (
      <button
        key={s.key}
        ref={(el) => {
          unitRefs.current[i] = el;
        }}
        type="button"
        onClick={(event) => choose(i, event.timeStamp)}
        aria-current={lit ? "step" : undefined}
        aria-label={`Etapa ${i + 1}: ${s.label}. Ver el detalle`}
        data-lit={lit ? "1" : "0"}
        style={{ "--accent": s.color } as CSSProperties}
        className={cn(
          "focus-ring group relative overflow-hidden border text-left transition-[border-color,box-shadow,transform,background-color] duration-500 [transform-style:preserve-3d]",
          "border-[color-mix(in_srgb,var(--accent)_32%,#17243d)] bg-[linear-gradient(150deg,#0c162a,#080d19)]",
          "data-[lit=1]:border-[var(--accent)] data-[lit=1]:bg-[linear-gradient(150deg,color-mix(in_srgb,var(--accent)_12%,#0c162a),#080d19)]",
          "data-[lit=1]:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_25%,transparent),0_0_34px_-4px_color-mix(in_srgb,var(--accent)_45%,transparent),inset_0_0_22px_color-mix(in_srgb,var(--accent)_14%,transparent)]",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--accent)]",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="photo-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 16%, transparent), transparent)" }}
        />
        <span
          className="relative mb-2.5 grid h-10 w-10 place-items-center rounded-xl transition-transform duration-500 group-data-[lit=1]:scale-110"
          style={{ background: "color-mix(in srgb, var(--accent) 16%, #081222)", color: s.color }}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="relative block font-display text-sm font-semibold tracking-tight text-foreground">{s.label}</span>
        {s.hint ? <span className="relative mt-1 block text-[11px] leading-snug text-[#8f9eb8]">{s.hint}</span> : null}
      </button>
    );
  };

  const arrow = (key: string) => (
    <span key={key} aria-hidden="true" className="grid place-items-center text-xl text-[#8493af] max-sm:h-5 max-sm:rotate-90">
      →
    </span>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="[perspective:1400px]">
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            tiltX.set(0);
            tiltY.set(0);
          }}
          style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: "preserve-3d" }}
          className="relative isolate rounded-[23px] border border-[#1b2b48] bg-[linear-gradient(145deg,#0a0f1e,#070b16_65%)] p-4 shadow-[0_40px_80px_-40px_rgba(56,211,255,0.28)] sm:p-8"
        >
          {/* Decorative layer: clipped to the rounded frame so the content above can keep its 3D depth. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_8%,#10264b_0,transparent_44%)]" />
            <div
              className="absolute inset-0 opacity-60 [mask-image:linear-gradient(#000,transparent_90%)]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(45,120,170,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,120,170,0.07) 1px, transparent 1px)",
                backgroundSize: "27px 27px",
              }}
            />
            <div className="signal-run absolute left-0 top-0 h-0.5 w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-70" />
          </div>

          <div ref={rootRef} className="relative [transform-style:preserve-3d]">
            <header className="border-b border-white/[0.08] pb-5 text-center">
              <p className="sign-text-cyan font-display text-2xl font-black tracking-tight sm:text-3xl">ia.nom.pe</p>
              <p className="mt-1.5 text-xs text-muted">La placa que conecta todo lo de abajo</p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#2b4c6b] bg-[#081b30] px-2.5 py-1.5 text-[9px] tracking-[0.1em] text-[#bdefff]">
                <span className={cn("h-1.5 w-1.5 rounded-full bg-[#43f0b2] shadow-[0_0_10px_#43f0b2]", !isPaused && "animate-pulse")} aria-hidden="true" />
                {reduce ? "MOVIMIENTO REDUCIDO · USA LAS ETAPAS" : paused ? "ANIMACIÓN EN PAUSA" : "ECOSISTEMA ACTIVO · CICLO AUTOMÁTICO"}
              </p>
            </header>

            <div className="pt-8 [transform-style:preserve-3d] sm:pt-9">
              <div className="grid gap-2 [transform-style:preserve-3d] sm:grid-cols-[1fr_30px_1.45fr_30px_1.25fr] sm:items-center sm:gap-2.5">
                {unit(0, "flex min-h-[96px] flex-col items-center justify-center rounded-2xl p-3 text-center data-[lit=1]:[transform:translateZ(26px)_translateY(-2px)] sm:min-h-[124px] sm:p-4")}
                {arrow("a1")}
                {unit(1, "flex min-h-[96px] flex-col items-center justify-center rounded-2xl p-3 text-center data-[lit=1]:[transform:translateZ(26px)_translateY(-2px)] sm:min-h-[124px] sm:p-4")}
                {arrow("a2")}
                {unit(2, "flex min-h-[96px] flex-col items-center justify-center rounded-2xl p-3 text-center data-[lit=1]:[transform:translateZ(26px)_translateY(-2px)] sm:min-h-[124px] sm:p-4")}
              </div>

              <div aria-hidden="true" className="relative flex h-12 items-center justify-center text-xl text-cyan sm:h-14">
                <span className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-cyan/45 to-transparent" />
                <span className="relative bg-[#0a1020] px-2.5">↓</span>
              </div>

              <div className="flex flex-col items-stretch justify-center gap-1 [transform-style:preserve-3d] sm:flex-row sm:items-center sm:gap-5">
                {unit(3, "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 data-[lit=1]:[transform:translateZ(22px)_translateY(-2px)] sm:px-4 sm:py-3 [&>span:nth-of-type(2)]:mb-0")}
                <span aria-hidden="true" className="grid h-5 place-items-center text-center text-xl text-[#8292ae] max-sm:rotate-90 sm:h-auto">→</span>
                {unit(4, "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 data-[lit=1]:[transform:translateZ(22px)_translateY(-2px)] sm:px-4 sm:py-3 [&>span:nth-of-type(2)]:mb-0")}
                <span aria-hidden="true" className="grid h-5 place-items-center text-center text-xl text-[#8292ae] max-sm:rotate-90 sm:h-auto">→</span>
                {unit(5, "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 data-[lit=1]:[transform:translateZ(22px)_translateY(-2px)] sm:px-4 sm:py-3 [&>span:nth-of-type(2)]:mb-0")}
              </div>

              <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[11px] text-[#9aacc8]" aria-live="polite">
                <span className="h-[5px] w-[5px] rounded-full bg-cyan shadow-[0_0_9px_#35ddff]" aria-hidden="true" />
                <span>Flujo automático:</span>
                <strong className="font-semibold text-[#e2faff]">{step.status}</strong>
                <span className="text-[#3d567a]">/</span>
                <span>Ciclo {String(cycle).padStart(2, "0")}</span>
              </p>
            </div>

            <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 h-full w-full" />
            <span
              ref={labelRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-50 whitespace-nowrap rounded-full border bg-[#071632]/95 px-2.5 py-1 text-[10px] font-semibold opacity-0"
            />
          </div>
        </motion.div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] leading-relaxed text-[#7184a2]">
          ANIMACIÓN AUTÓNOMA · SECUENCIA CÍCLICA · TOCA UNA ETAPA PARA VERLA
          <br />
          Las luces representan el recorrido de información de forma ilustrativa.
        </p>
        {reduce ? null : (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={paused}
            className="focus-ring inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border border-[#244768] bg-[#0a1930] px-3.5 text-xs font-bold text-[#cbeaff] transition-colors hover:border-cyan"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {paused ? "Reanudar animación" : "Pausar animación"}
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2" aria-live="polite">
        <article className="rounded-xl border border-[#1a2c49] bg-[#080e1c] p-4">
          <p className="text-[9px] tracking-[0.12em] text-[#7f97b9]">
            ETAPA ACTIVA · {pad(index)} / {pad(LAST)}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.key}
              initial={{ opacity: 0, transform: reduce ? "none" : "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-4px)" }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="mt-1.5 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9bacc7]">{step.copy}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#1a2941]">
            <span
              className="block h-full origin-left rounded-full bg-gradient-to-r from-primary via-cyan to-[#b957ff] shadow-[0_0_10px_#35ddff] transition-transform duration-500"
              style={{ transform: `scaleX(${(index + 1) / STEPS.length})` }}
            />
          </div>
        </article>
        <article className="rounded-xl border border-[#1a2c49] bg-[#080e1c] p-4">
          <p className="text-[9px] tracking-[0.12em] text-[#7f97b9]">PROPÓSITO DEL CICLO</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.key}
              initial={{ opacity: 0, transform: reduce ? "none" : "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-4px)" }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="mt-1.5 text-sm font-semibold" style={{ color: step.color }}>
                {step.outcome}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9bacc7]">{step.outcopy}</p>
            </motion.div>
          </AnimatePresence>
        </article>
      </div>
    </div>
  );
}
