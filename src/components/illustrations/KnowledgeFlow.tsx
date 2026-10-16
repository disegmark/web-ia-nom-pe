"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, MessageSquareText, Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { KNOWLEDGE_OUTCOMES, KNOWLEDGE_SOURCES } from "@/data/diagrams";
import { FOCAL, TAU, quad, rotate, type Pt, type Vec3 } from "./orbit3d";

type Question = { text: string; sources: number[]; outcomes: number[]; answer: string };

// Illustrative questions for a fictional business: which sources RAG consults and what comes back.
const QUESTIONS: Question[] = [
  {
    text: "¿Cuál es su política de devoluciones?",
    sources: [3, 4],
    outcomes: [0],
    answer: "Puedes solicitar la devolución dentro de los 30 días con tu comprobante. Te envío los pasos para iniciarla ahora mismo.",
  },
  {
    text: "¿Tienen stock del modelo X y a qué precio?",
    sources: [2, 5],
    outcomes: [1, 0],
    answer: "Sí, quedan 24 unidades a S/ 189. ¿Quieres que te reserve una y te envíe el enlace de pago?",
  },
  {
    text: "¿Cómo configuro el equipo que compré?",
    sources: [1, 0],
    outcomes: [0, 3],
    answer: "Según el manual son 3 pasos: conectar, emparejar y actualizar. Te los detallo uno por uno y, si algo falla, agendo soporte.",
  },
  {
    text: "Prepárame el resumen de ventas del mes",
    sources: [5, 0],
    outcomes: [1, 2, 3],
    answer: "Listo: ventas +12% frente al mes anterior y 3 clientes recurrentes nuevos. Envié el informe al correo del equipo.",
  },
];

const STEPS = ["Busca en tus fuentes", "Recupera lo relevante", "Responde con contexto"];

// Timeline of one question (ms).
const T_SCAN = 350;
const T_FRAG = 1000;
const T_LENS = 1900;
const T_AGENT = 2600;
const T_ANSWER = 2900;
const CYCLE_MS = 7600;
const MANUAL_HOLD_MS = 12000;

const COMPACT_WIDTH = 480;
const BASE_TILT = -0.1;
const YAW_LIMIT = 0.55;
const DRAG_GAIN = 0.005;
const SRC_RGB = "56, 211, 255";
const OUT_RGB = "255, 182, 72";

type Layout = {
  sources: Vec3[];
  lens: Vec3;
  agent: Vec3;
  outcomes: Vec3[];
  /** Desktop source chips hang to the left of their anchor so long labels never reach the lens. */
  anchorRight: boolean;
  scale: (w: number, h: number) => number;
};

const WIDE: Layout = {
  sources: KNOWLEDGE_SOURCES.map((_, i, arr) => {
    const y = -0.98 + (1.96 * i) / (arr.length - 1);
    return { x: -0.7, y, z: 0.32 * (1 - (y / 0.98) ** 2) - 0.08 };
  }),
  lens: { x: 0.25, y: 0, z: 0.1 },
  agent: { x: 1.14, y: -0.42, z: 0 },
  outcomes: [
    { x: 0.86, y: 0.3, z: 0.05 },
    { x: 1.42, y: 0.3, z: 0.05 },
    { x: 0.86, y: 0.72, z: 0.1 },
    { x: 1.42, y: 0.72, z: 0.1 },
  ],
  anchorRight: true,
  scale: (w, h) => Math.min(w / 3.55, h / 2.45),
};

// Phones: three rows of two, so even "Información comercial" has room without touching a neighbour.
const TALL: Layout = {
  sources: KNOWLEDGE_SOURCES.map((_, i) => {
    const row = Math.floor(i / 2);
    const side = i % 2 === 0 ? -1 : 1;
    return { x: side * 0.6, y: -1.46 + row * 0.42, z: 0.12 - row * 0.04 };
  }),
  lens: { x: 0, y: -0.08, z: 0.1 },
  agent: { x: 0, y: 0.55, z: 0 },
  outcomes: [
    { x: -0.5, y: 1.04, z: 0.05 },
    { x: 0.5, y: 1.04, z: 0.05 },
    { x: -0.5, y: 1.4, z: 0.08 },
    { x: 0.5, y: 1.4, z: 0.08 },
  ],
  anchorRight: false,
  scale: (w, h) => Math.min(w / 2.65, h / 3.5),
};

type Run = { q: number; start: number };

/** 3D RAG explainer: the search lens scans your sources, pulls fragments, and hands context to the agent. */
export function KnowledgeFlow() {
  const reduce = useReducedMotion();
  const [question, setQuestion] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const outcomeRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const lensRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const answerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef(0);
  const runRef = useRef<Run | null>(null);
  const requestRef = useRef<number | null>(null);
  const manualUntilRef = useRef(0);
  const hoverRef = useRef(-1);
  const yawRef = useRef({ value: 0, velocity: 0, heldUntil: 0 });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const dragRef = useRef({ active: false, lastX: 0, lastT: 0, velocity: 0 });

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function ask(index: number, timeStamp: number) {
    setQuestion(index);
    questionRef.current = index;
    requestRef.current = index;
    manualUntilRef.current = timeStamp + MANUAL_HOLD_MS;
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const motes = Array.from({ length: 46 }, () => ({
      x: (Math.random() - 0.5) * 3.6,
      y: (Math.random() - 0.5) * 2.8,
      z: (Math.random() - 0.5) * 1.6,
      tw: Math.random() * TAU,
    }));

    const dot = (x: number, y: number, r: number, rgb: string, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.24})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(240, 252, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    };

    const draw = (now: number) => {
      const time = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const L = width < COMPACT_WIDTH ? TALL : WIDE;
      const R = L.scale(width, height);
      const cx = width / 2;
      const cy = height / 2;
      const yaw = yawRef.current.value;
      const tilt = tiltRef.current.value;
      const project = (p: Vec3): Pt => {
        const q = rotate(p, yaw, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
      };

      const run = runRef.current;
      const e = run ? now - run.start : Infinity;
      const q = run ? QUESTIONS[run.q] : null;
      const picked = (i: number) => (q ? q.sources.includes(i) : false);
      const pulseAt = (center: number, w: number) => (run ? Math.exp(-((e - center) ** 2) / w) : 0);
      const lensFlash = pulseAt(T_LENS, 70000);
      const agentFlash = pulseAt(T_AGENT, 70000);

      for (const m of motes) {
        const p = project(m);
        const depth = (p.z + 1) / 2;
        const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(time * 1.4 + m.tw);
        ctx.fillStyle = `rgba(150, 215, 255, ${(0.06 + 0.22 * depth) * tw})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.6 + depth, 0, TAU);
        ctx.fill();
      }

      const bob = (i: number) => (reduce ? 0 : Math.sin(time * 1.2 + i * 0.9) * 0.025);
      const srcPts = L.sources.map((p, i) => project({ ...p, y: p.y + bob(i) }));
      const lens = project(L.lens);
      const agent = project(L.agent);
      const outPts = L.outcomes.map((p) => project(p));

      // Source → lens traces; picked ones carry fragments into the lens.
      srcPts.forEach((s, i) => {
        const mid = project({
          x: (L.sources[i].x + L.lens.x) / 2,
          y: (L.sources[i].y + L.lens.y) / 2 + (L.anchorRight ? 0 : 0.12),
          z: (L.sources[i].z + L.lens.z) / 2 + 0.35,
        });
        const hot = picked(i) && e > T_SCAN && e < T_AGENT + 900;
        const hover = hoverRef.current === i;
        const gradient = ctx.createLinearGradient(s.x, s.y, lens.x, lens.y);
        gradient.addColorStop(0, `rgba(${SRC_RGB}, ${hot || hover ? 0.95 : 0.22})`);
        gradient.addColorStop(1, `rgba(${SRC_RGB}, ${hot ? 0.7 : 0.1})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.setLineDash(hot ? [] : [3, 6]);
        ctx.lineDashOffset = reduce ? 0 : time * 12;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(mid.x, mid.y, lens.x, lens.y);
        ctx.stroke();
        ctx.setLineDash([]);
        dot(s.x, s.y, 2.2 * s.s, SRC_RGB, hot || hover ? 1 : 0.5);

        // Scan: the lens sweeps every source in turn.
        if (run && e > T_SCAN && e < T_FRAG + 200 && !reduce) {
          const sweep = (e - T_SCAN) / (T_FRAG - T_SCAN);
          const lit = Math.exp(-((sweep * (srcPts.length - 1) - i) ** 2) / 0.35);
          if (lit > 0.05) {
            ctx.strokeStyle = `rgba(143, 242, 255, ${0.5 * lit})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(lens.x, lens.y);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
          }
        }
        // Fragments: three per picked source, flying into the lens.
        if (hot && e > T_FRAG && e < T_LENS + 150) {
          for (let k = 0; k < 3; k++) {
            const u = Math.min(1, Math.max(0, (e - T_FRAG - k * 140) / (T_LENS - T_FRAG - 280)));
            if (u <= 0 || u >= 1) continue;
            const p = quad(s, mid, lens, u);
            const size = 4.5 * s.s;
            ctx.fillStyle = "rgba(143, 242, 255, 0.95)";
            ctx.strokeStyle = "rgba(235, 252, 255, 0.9)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.rect(p.x - size, p.y - size * 0.7, size * 2, size * 1.4);
            ctx.fill();
            ctx.stroke();
            dot(p.x, p.y, 1.2, SRC_RGB, 0.6);
          }
        } else if (!run || e > T_AGENT + 900) {
          const u = reduce ? 0.5 : (time * 0.18 + i * 0.17) % 1;
          const p = quad(s, mid, lens, u);
          dot(p.x, p.y, 1.2 * s.s, SRC_RGB, 0.45 * Math.sin(u * Math.PI));
        }
      });

      // The search lens: two rings spinning on different axes, flaring when context is assembled.
      const lensR = 0.27;
      for (const [axis, speed, rgb] of [
        [0, 1.1, "56, 211, 255"],
        [1, -0.8, "143, 242, 255"],
      ] as const) {
        ctx.strokeStyle = `rgba(${rgb}, ${0.5 + 0.45 * lensFlash})`;
        ctx.lineWidth = 1.6 + 1.6 * lensFlash;
        ctx.beginPath();
        for (let k = 0; k <= 48; k++) {
          const a = (k / 48) * TAU;
          const spin = reduce ? 0.6 : time * speed;
          const local =
            axis === 0
              ? { x: Math.cos(a) * lensR, y: Math.sin(a) * lensR * Math.cos(spin), z: Math.sin(a) * lensR * Math.sin(spin) }
              : { x: Math.cos(a) * lensR * Math.cos(spin), y: Math.sin(a) * lensR, z: Math.cos(a) * lensR * Math.sin(spin) };
          const p = project({ x: L.lens.x + local.x, y: L.lens.y + local.y, z: L.lens.z + local.z });
          if (k === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      const halo = ctx.createRadialGradient(lens.x, lens.y, 0, lens.x, lens.y, R * (0.5 + 0.3 * lensFlash));
      halo.addColorStop(0, `rgba(56, 211, 255, ${0.22 + 0.35 * lensFlash})`);
      halo.addColorStop(1, "rgba(56, 211, 255, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(lens.x, lens.y, R * (0.5 + 0.3 * lensFlash), 0, TAU);
      ctx.fill();

      // Lens → agent: the assembled context travels as one bright bundle.
      const lensAgentMid = project({ x: (L.lens.x + L.agent.x) / 2, y: (L.lens.y + L.agent.y) / 2 - 0.15, z: 0.3 });
      ctx.strokeStyle = `rgba(143, 242, 255, ${run && e > T_LENS - 100 && e < T_AGENT + 700 ? 0.9 : 0.25})`;
      ctx.lineWidth = run && e > T_LENS - 100 && e < T_AGENT + 700 ? 2 : 1.1;
      ctx.beginPath();
      ctx.moveTo(lens.x, lens.y);
      ctx.quadraticCurveTo(lensAgentMid.x, lensAgentMid.y, agent.x, agent.y);
      ctx.stroke();
      if (run && e > T_LENS && e < T_AGENT && !reduce) {
        const u = (e - T_LENS) / (T_AGENT - T_LENS);
        for (let t = 0; t < 6; t++) {
          const uu = u - t * 0.04;
          if (uu < 0) break;
          const p = quad(lens, lensAgentMid, agent, uu);
          dot(p.x, p.y, (3.4 - t * 0.45) * agent.s, "143, 242, 255", 1 - t * 0.15);
        }
      }

      const agentHalo = ctx.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, R * (0.45 + 0.3 * agentFlash));
      agentHalo.addColorStop(0, `rgba(56, 211, 255, ${0.2 + 0.4 * agentFlash})`);
      agentHalo.addColorStop(1, "rgba(56, 211, 255, 0)");
      ctx.fillStyle = agentHalo;
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, R * (0.45 + 0.3 * agentFlash), 0, TAU);
      ctx.fill();

      // Agent → outcomes.
      outPts.forEach((o, k) => {
        const on = q !== null && q.outcomes.includes(k) && e > T_AGENT + k * 180;
        ctx.strokeStyle = `rgba(${OUT_RGB}, ${on ? 0.8 : 0.16})`;
        ctx.lineWidth = on ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(agent.x, agent.y);
        ctx.lineTo(o.x, o.y);
        ctx.stroke();
        if (on && !reduce) {
          const u = ((e - T_AGENT - k * 180) / 650) % 1;
          dot(agent.x + (o.x - agent.x) * u, agent.y + (o.y - agent.y) * u, 1.8 * o.s, OUT_RGB, Math.sin(u * Math.PI));
        }
      });

      // HTML layer.
      const place = (el: HTMLElement | null, p: Pt, anchorRight = false, extra = 1) => {
        if (!el) return;
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(${anchorRight ? "-100%" : "-50%"}, -50%) rotateY(${yaw}rad) rotateX(${-tilt}rad) scale(${p.s * extra})`;
        el.style.transformOrigin = anchorRight ? "100% 50%" : "50% 50%";
        el.style.zIndex = String(10 + Math.round((p.z + 1) * 10));
      };
      srcPts.forEach((p, i) => {
        const el = sourceRefs.current[i];
        const on = picked(i) && e > T_SCAN && e < CYCLE_MS;
        place(el, p, L.anchorRight, on ? 1.06 : 1);
        if (el) el.dataset.on = on ? "1" : "0";
      });
      place(lensRef.current, lens, false, 1 + 0.08 * lensFlash);
      place(agentRef.current, agent, false, 1 + 0.08 * agentFlash);
      outPts.forEach((p, k) => {
        const el = outcomeRefs.current[k];
        const on = q !== null && q.outcomes.includes(k) && e > T_AGENT + k * 180;
        place(el, p, false, on ? 1.08 : 1);
        if (el) el.dataset.on = on ? "1" : "0";
      });

      const stepsOn = run ? [e > T_SCAN, e > T_FRAG, e > T_AGENT] : [true, true, true];
      stepRefs.current.forEach((el, k) => {
        if (el) el.dataset.on = stepsOn[k] ? "1" : "0";
      });
      if (answerRef.current) answerRef.current.dataset.on = !run || e > T_ANSWER ? "1" : "0";
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (requestRef.current !== null) {
        runRef.current = { q: requestRef.current, start: now };
        requestRef.current = null;
      } else if (!reduce && now >= manualUntilRef.current && (!runRef.current || now - runRef.current.start > CYCLE_MS)) {
        const next = runRef.current ? (questionRef.current + 1) % QUESTIONS.length : questionRef.current;
        questionRef.current = next;
        setQuestion(next);
        runRef.current = { q: next, start: now };
      }

      const yaw = yawRef.current;
      if (!dragRef.current.active) {
        if (Math.abs(yaw.velocity) > 0.02) {
          yaw.value += yaw.velocity * dt;
          yaw.velocity *= Math.exp(-dt * 3.2);
        } else if (!reduce && now > yaw.heldUntil) {
          const target = Math.sin(now / 5000) * (width < COMPACT_WIDTH ? 0.07 : 0.15);
          yaw.value += (target - yaw.value) * (1 - Math.exp(-dt * 1.4));
        }
        yaw.value = Math.max(-YAW_LIMIT, Math.min(YAW_LIMIT, yaw.value));
      }
      const tiltState = tiltRef.current;
      tiltState.value += (tiltState.target - tiltState.value) * (1 - Math.exp(-dt * 4));

      draw(now);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      rootMargin: "80px",
    });
    visibility.observe(stage);
    draw(0);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
    };
  }, [reduce]);

  function handleCanvasDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    drag.active = true;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
    drag.velocity = 0;
    yawRef.current.velocity = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCanvasMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const delta = (event.clientX - drag.lastX) * DRAG_GAIN;
    const yaw = yawRef.current;
    yaw.value = Math.max(-YAW_LIMIT, Math.min(YAW_LIMIT, yaw.value + delta));
    drag.velocity = delta / Math.max(0.008, (event.timeStamp - drag.lastT) / 1000);
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
  }

  function handleCanvasUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    yawRef.current.velocity = reduce ? 0 : Math.max(-3, Math.min(3, drag.velocity));
    yawRef.current.heldUntil = event.timeStamp + 3000;
  }

  function handleStageMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.target = BASE_TILT - ny * 0.18;
  }

  const current = QUESTIONS[question];

  return (
    <div className="@container overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_50%_45%,#0b2042_0%,#071124_55%,#050914_100%)]">
      <div
        ref={stageRef}
        className="relative h-[460px] w-full select-none @min-[480px]:h-[380px]"
        style={{ perspective: "1000px" }}
        onPointerMove={handleStageMove}
        onPointerLeave={() => {
          hoverRef.current = -1;
          tiltRef.current.target = BASE_TILT;
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onPointerDown={handleCanvasDown}
          onPointerMove={handleCanvasMove}
          onPointerUp={handleCanvasUp}
          onPointerCancel={handleCanvasUp}
        />

        {KNOWLEDGE_SOURCES.map((source, i) => {
          const firstQuestion = QUESTIONS.findIndex((qq) => qq.sources.includes(i));
          return (
            <button
              key={source.title}
              ref={(el) => {
                sourceRefs.current[i] = el;
              }}
              type="button"
              onClick={(event) => ask(firstQuestion, event.timeStamp)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hoverRef.current = i;
              }}
              onPointerLeave={() => {
                if (hoverRef.current === i) hoverRef.current = -1;
              }}
              title={source.description}
              aria-label={`${source.title}: ${source.description} Ver una consulta que la usa`}
              className="focus-ring absolute left-0 top-0 flex max-w-[6.75rem] items-center gap-1.5 rounded-xl border border-[#24436b] bg-[#09152a] px-2 py-1.5 text-left text-[11px] leading-tight text-muted shadow-[0_4px_0_-1px_rgba(4,8,30,0.9)] transition-[border-color,color,box-shadow,background-color] duration-200 [backface-visibility:hidden] hover:border-cyan/50 hover:text-foreground data-[on=1]:border-cyan data-[on=1]:bg-[#0e2345] data-[on=1]:text-foreground data-[on=1]:shadow-[0_4px_0_-1px_rgba(4,8,30,0.9),0_0_20px_-2px_rgba(56,211,255,0.7)] @min-[480px]:max-w-[8.25rem] @min-[480px]:px-2.5"
            >
              <Icon name={source.icon} className="h-3.5 w-3.5 shrink-0 text-cyan" />
              <span>{source.title}</span>
            </button>
          );
        })}

        <div
          ref={lensRef}
          className="pointer-events-none absolute left-0 top-0 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-cyan/60 bg-[radial-gradient(circle_at_35%_30%,#123063,#071632_70%)] shadow-[0_0_30px_-4px_rgba(56,211,255,0.6)]"
        >
          <Search className="h-5 w-5 text-cyan" aria-hidden="true" />
          <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-cyan/90">RAG</span>
        </div>

        <div
          ref={agentRef}
          className="pointer-events-none absolute left-0 top-0 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-cyan/70 bg-[radial-gradient(circle_at_35%_30%,#16245a,#070b1d_70%)] shadow-[0_0_0_4px_rgba(56,211,255,0.12),0_0_36px_-4px_rgba(56,211,255,0.7)]"
        >
          <Bot className="h-6 w-6 text-cyan" aria-hidden="true" />
          <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-foreground/85">Agente</span>
        </div>

        {KNOWLEDGE_OUTCOMES.map((outcome, k) => (
          <span
            key={outcome}
            ref={(el) => {
              outcomeRefs.current[k] = el;
            }}
            className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full border border-sign-amber/25 bg-[#120f12]/90 px-2.5 py-1 text-[11px] text-sign-amber/70 transition-[border-color,color,box-shadow] duration-200 data-[on=1]:border-sign-amber data-[on=1]:text-sign-amber data-[on=1]:shadow-[0_0_18px_-2px_rgba(255,182,72,0.7)]"
          >
            {outcome}
          </span>
        ))}
      </div>

      {/* Query console */}
      <div className="border-t border-[#172c4a] bg-[#060d1b]/80 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#91a9ca]">Prueba una consulta</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUESTIONS.map((qq, i) => (
            <button
              key={qq.text}
              type="button"
              onClick={(event) => ask(i, event.timeStamp)}
              aria-pressed={question === i}
              className={cn(
                "focus-ring rounded-full border px-3 py-1.5 text-left text-xs transition-[border-color,background-color,color] duration-200",
                question === i ? "border-cyan bg-cyan/10 text-foreground" : "border-[#24436b] text-muted hover:border-cyan/50 hover:text-foreground",
              )}
            >
              {qq.text}
            </button>
          ))}
        </div>

        <ol className="mt-4 grid grid-cols-3 gap-2">
          {STEPS.map((step, k) => (
            <li
              key={step}
              ref={(el) => {
                stepRefs.current[k] = el;
              }}
              data-on="1"
              className="rounded-lg border border-[#1c3453] px-2 py-1.5 text-center text-[10px] leading-tight text-muted opacity-40 transition-[opacity,border-color,color] duration-300 data-[on=1]:border-cyan/40 data-[on=1]:text-foreground data-[on=1]:opacity-100 sm:text-[11px]"
            >
              <span className="font-display font-semibold text-cyan">{k + 1}.</span> {step}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.text}
            initial={{ opacity: 0, transform: reduce ? "none" : "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-4px)" }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-4 grid gap-2.5"
            aria-live="polite"
          >
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary/90 px-3.5 py-2 text-sm text-white">{current.text}</div>
            <p className="text-[11px] text-muted">
              Fuentes consultadas:{" "}
              {current.sources.map((s) => (
                <span key={s} className="ml-1 inline-block rounded-md bg-cyan/10 px-1.5 py-0.5 text-cyan">
                  {KNOWLEDGE_SOURCES[s].title}
                </span>
              ))}
            </p>
            <div
              ref={answerRef}
              data-on="1"
              className="flex max-w-[92%] gap-2 opacity-0 transition-opacity duration-300 data-[on=1]:opacity-100"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan">
                <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="rounded-2xl rounded-tl-md border border-[#1c3453] bg-[#0a1628] px-3.5 py-2 text-sm leading-relaxed text-foreground/90">
                {current.answer}
                <span className="mt-1 block text-[10px] text-muted">Ejemplo ilustrativo con datos de un negocio ficticio.</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
