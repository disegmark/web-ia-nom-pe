"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Mark } from "@/components/brand/Mark";
import { BRAND_LOGOS } from "@/components/brand/app-logos";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import {
  ECOSYSTEM_DISCLAIMER,
  ECOSYSTEM_INPUTS,
  ECOSYSTEM_MODULES,
  ECOSYSTEM_OUTPUTS,
  type EcosystemApp,
} from "@/data/automation-ecosystem";
import { FOCAL, TAU, rotate, shortestAngle, type Pt, type Vec3 } from "@/components/illustrations/orbit3d";

const MODULES = ECOSYSTEM_MODULES;
const INS = ECOSYSTEM_INPUTS;
const OUTS = ECOSYSTEM_OUTPUTS;
const MOD_N = MODULES.length;
const AUTOMATION_MODULE = MOD_N - 1;

const IN_RGB = "56, 211, 255";
const OUT_RGB = "168, 85, 247";

const COL_X = 1.62;
const BUS_X = 1.24;
const PORT_R = 0.86;
const FN_R = 0.6;
const CORE_R = 0.28;
const TILE_HALF = 0.13;
const ENTRY_Y = 0.34;
const CURVE = 0.42;
const BASE_TILT = -0.12;
const YAW_LIMIT = 0.6;
const DRAG_GAIN = 0.005;

const TOUR_MS = 4500;
const MANUAL_HOLD_MS = 12000;
// Flow timeline for the active module (ms from its start).
const T_IN = 950;
const T_CORE = 1000;
const T_MOD = 1250;
const T_OUT = 1550;
const T_ARRIVE = 2500;

const BENEFITS = [
  { icon: ArrowLeftRight, title: "Herramientas conectadas", text: "Intercambio de información" },
  { icon: RefreshCw, title: "Procesos automatizados", text: "Menos trabajo repetitivo" },
  { icon: Sparkles, title: "Inteligencia aplicada", text: "Agentes y reglas de negocio" },
  { icon: ShieldCheck, title: "Seguridad y control", text: "Accesos y permisos definidos" },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");
const modAngle = (i: number) => (i * TAU) / MOD_N;
const curveZ = (x: number) => CURVE * (x / COL_X) ** 2;
const P = (x: number, y: number): Vec3 => ({ x, y, z: curveZ(x) });
const spread = (n: number, max: number) => (n <= 1 ? [0] : Array.from({ length: n }, (_, k) => -max + (2 * max * k) / (n - 1)));

type Path = { pts: Vec3[]; cum: number[]; len: number };

function makePath(pts: Vec3[]): Path {
  const cum = [0];
  for (let k = 1; k < pts.length; k++) {
    cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y, pts[k].z - pts[k - 1].z));
  }
  return { pts, cum, len: cum[cum.length - 1] };
}

function pointAt(path: Path, u: number): Vec3 {
  const d = Math.max(0, Math.min(1, u)) * path.len;
  let k = 1;
  while (k < path.cum.length - 1 && path.cum[k] < d) k++;
  const a = path.pts[k - 1];
  const b = path.pts[k];
  const t = (d - path.cum[k - 1]) / (path.cum[k] - path.cum[k - 1] || 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

/** Orthogonal circuit trace from a side tile through the bus into the port ring, ending at the core. */
function tracePoints(y: number, side: -1 | 1): Vec3[] {
  const entryY = Math.abs(y) < 0.05 ? 0 : Math.sign(y) * ENTRY_Y;
  const entryX = side * Math.sqrt(PORT_R ** 2 - entryY ** 2);
  const len = Math.hypot(entryX, entryY);
  const pts = [
    P(side * (COL_X - TILE_HALF), y),
    P(side * BUS_X, y),
    P(side * BUS_X, entryY),
    P(entryX, entryY),
    P((entryX / len) * CORE_R, (entryY / len) * CORE_R),
  ];
  return side === -1 ? pts : pts.reverse();
}

type Packet = { path: Path; start: number; dur: number; rgb: string; size: number; alpha: number };
type Run = { module: number; start: number; spawnedOut: boolean; all: boolean };
type Picked = { side: "in" | "out"; index: number } | null;

function AppLogo({ app, className }: { app: EcosystemApp; className?: string }) {
  if (app.logo) {
    const logo = BRAND_LOGOS[app.logo];
    return (
      <svg viewBox="0 0 24 24" className={className} fill={logo.hex} aria-hidden="true">
        <path d={logo.path} />
      </svg>
    );
  }
  const Fallback = app.fallback;
  return Fallback ? <Fallback className={className} style={{ color: app.color }} strokeWidth={2} aria-hidden="true" /> : null;
}

/** Interactive automation ecosystem: apps → iA Connexion and its nine modules → apps, on a curved 3D board. */
export function AutomationEcosystem() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [picked, setPicked] = useState<Picked>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const outRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const coreRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const pickedRef = useRef<Picked>(null);
  const manualUntilRef = useRef(0);
  const tourStartRef = useRef(0);
  const ringRef = useRef({ value: 0, target: 0 });
  const yawRef = useRef({ value: 0, velocity: 0, heldUntil: 0 });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const dragRef = useRef({ active: false, lastX: 0, lastT: 0, velocity: 0 });
  const requestRef = useRef<{ module: number; all: boolean } | null>(null);

  function focusModule(next: number, timeStamp: number, all = false) {
    const i = ((next % MOD_N) + MOD_N) % MOD_N;
    setIndex(i);
    indexRef.current = i;
    const ring = ringRef.current;
    ring.target = ring.value + shortestAngle(ring.value, -modAngle(i));
    tourStartRef.current = timeStamp;
    requestRef.current = { module: i, all };
  }

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function chooseModule(next: number, timeStamp: number) {
    manualUntilRef.current = timeStamp + MANUAL_HOLD_MS;
    pickedRef.current = null;
    setPicked(null);
    focusModule(next, timeStamp);
  }

  function chooseApp(side: "in" | "out", i: number, timeStamp: number) {
    const app = side === "in" ? INS[i] : OUTS[i];
    manualUntilRef.current = timeStamp + MANUAL_HOLD_MS;
    const value = { side, index: i } as const;
    pickedRef.current = value;
    setPicked(value);
    focusModule(app.module, timeStamp);
  }

  function togglePause(timeStamp: number) {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next) {
      manualUntilRef.current = 0;
      tourStartRef.current = timeStamp;
    }
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    if (reduce) pausedRef.current = true;

    const phone = window.matchMedia("(max-width: 639px)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visIn: number[] = [];
    let visOut: number[] = [];
    let inY: number[] = [];
    let outY: number[] = [];
    let inPaths: Path[] = [];
    let outPaths: Path[] = [];

    const layout = () => {
      const compact = phone.matches;
      visIn = INS.map((_, i) => i).filter((i) => !compact || INS[i].core);
      visOut = OUTS.map((_, i) => i).filter((i) => !compact || OUTS[i].core);
      const inYs = spread(visIn.length, compact ? 0.92 : 0.95);
      const outYs = spread(visOut.length, compact ? 0.92 : 0.98);
      inY = INS.map((_, i) => inYs[visIn.indexOf(i)] ?? 0);
      outY = OUTS.map((_, i) => outYs[visOut.indexOf(i)] ?? 0);
      inPaths = INS.map((_, i) => makePath(tracePoints(inY[i], -1)));
      outPaths = OUTS.map((_, i) => makePath(tracePoints(outY[i], 1)));
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layout();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const packets: Packet[] = [];
    let current: Run | null = null;
    let lastAmbient = 0;

    const runInputs = (run: Run) => {
      if (run.all) return visIn;
      const p = pickedRef.current;
      if (p?.side === "in" && visIn.includes(p.index)) return [p.index];
      return visIn.filter((i) => INS[i].module === run.module);
    };
    const runOutputs = (run: Run) => {
      if (run.all) return visOut;
      const p = pickedRef.current;
      if (p?.side === "out" && visOut.includes(p.index)) return [p.index];
      return visOut.filter((j) => OUTS[j].module === run.module);
    };

    const startRun = (module: number, all: boolean, now: number) => {
      current = { module, start: now, spawnedOut: false, all };
      runInputs(current).forEach((i) => {
        for (let k = 0; k < 3; k++) packets.push({ path: inPaths[i], start: now + k * 120, dur: T_IN, rgb: IN_RGB, size: 2.6, alpha: 1 });
      });
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Phones are width-bound (the side columns must stay on screen); desktop is height-bound.
      const R = phone.matches ? Math.min(width / 4.6, height / 2.5) : Math.min(width / 4.35, height / 2.95);
      const cx = width / 2;
      const cy = height / 2;
      const yaw = yawRef.current.value;
      const tilt = tiltRef.current.value;
      const ring = ringRef.current.value;
      const project = (p: Vec3): Pt => {
        const q = rotate(p, yaw, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
      };

      const run = current as Run | null;
      const elapsed = run ? now - run.start : Infinity;
      const pulseAt = (center: number, w: number) => (run ? Math.exp(-((elapsed - center) ** 2) / w) : 0);
      const coreFlash = pulseAt(T_CORE, 90000);
      const modFlash = pulseAt(T_MOD, 90000);
      const outFlash = pulseAt(T_ARRIVE + 150, 90000);
      const ins = run ? runInputs(run) : [];
      const outs = run ? runOutputs(run) : [];
      const activeMod = indexRef.current;
      const accentRgb = activeMod === AUTOMATION_MODULE ? "216, 76, 255" : IN_RGB;

      const stroke = (path: Path, rgb: string, hot: boolean) => {
        const pts = path.pts.map(project);
        for (const [w, a] of [
          [6, hot ? 0.16 : 0.05],
          [1.4, hot ? 0.95 : 0.36],
        ] as const) {
          ctx.strokeStyle = `rgba(${rgb}, ${a})`;
          ctx.lineWidth = w;
          ctx.lineJoin = "round";
          ctx.beginPath();
          pts.forEach((q, k) => (k === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y)));
          ctx.stroke();
        }
        for (const k of [1, 3]) {
          const q = pts[k];
          ctx.fillStyle = `rgba(${rgb}, ${hot ? 1 : 0.55})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.6 * q.s, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(240, 250, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(q.x, q.y, 1.2 * q.s, 0, TAU);
          ctx.fill();
        }
        return pts;
      };
      visIn.forEach((i) => stroke(inPaths[i], IN_RGB, ins.includes(i) && elapsed < T_OUT + 600));
      visOut.forEach((j) => {
        const pts = stroke(outPaths[j], OUT_RGB, outs.includes(j) && elapsed > T_OUT - 200);
        const tip = pts[pts.length - 1];
        const back = pts[pts.length - 2];
        const ang = Math.atan2(tip.y - back.y, tip.x - back.x);
        const size = 6 * tip.s;
        ctx.fillStyle = `rgba(${OUT_RGB}, 0.95)`;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x - Math.cos(ang - 0.5) * size, tip.y - Math.sin(ang - 0.5) * size);
        ctx.lineTo(tip.x - Math.cos(ang + 0.5) * size, tip.y - Math.sin(ang + 0.5) * size);
        ctx.closePath();
        ctx.fill();
      });

      // Port ring: cyan on the input side, violet on the output side.
      let prev = project(P(PORT_R, 0));
      for (let k = 1; k <= 72; k++) {
        const a = (k / 72) * TAU;
        const q = project(P(Math.cos(a) * PORT_R, Math.sin(a) * PORT_R));
        ctx.strokeStyle = `rgba(${Math.cos(a) > 0 ? OUT_RGB : IN_RGB}, ${0.45 + 0.4 * coreFlash})`;
        ctx.lineWidth = 2.2 + 2 * coreFlash;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        prev = q;
      }

      const center = project(P(0, 0));
      const glowR = R * (0.66 + 0.25 * coreFlash);
      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, glowR);
      glow.addColorStop(0, `rgba(56, 211, 255, ${0.28 + 0.4 * coreFlash})`);
      glow.addColorStop(0.5, "rgba(91, 80, 255, 0.12)");
      glow.addColorStop(1, "rgba(47, 93, 250, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center.x, center.y, glowR, 0, TAU);
      ctx.fill();

      // Modules orbit the core; the active one rotates to the top and its spoke carries the work.
      const modPos = MODULES.map((_, m) => {
        const a = modAngle(m) + ring - Math.PI / 2;
        return P(Math.cos(a) * FN_R, Math.sin(a) * FN_R);
      });
      modPos.forEach((p, m) => {
        const q = project(p);
        const hot = run !== null && (run.all || m === activeMod) && elapsed > T_CORE - 150;
        const isActive = m === activeMod;
        ctx.strokeStyle = `rgba(${isActive ? accentRgb : "91, 139, 255"}, ${isActive ? 0.85 : 0.18})`;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        if (hot && !reduce) {
          const u = ((elapsed - T_CORE) / 520) % 1;
          ctx.fillStyle = "rgba(235, 252, 255, 0.95)";
          ctx.beginPath();
          ctx.arc(center.x + (q.x - center.x) * u, center.y + (q.y - center.y) * u, 2.4, 0, TAU);
          ctx.fill();
        }
      });

      for (let k = packets.length - 1; k >= 0; k--) {
        const pk = packets[k];
        const u = (now - pk.start) / pk.dur;
        if (u > 1) {
          packets.splice(k, 1);
          continue;
        }
        if (u < 0) continue;
        for (let t = 0; t < 5; t++) {
          const uu = u - t * 0.025;
          if (uu < 0) break;
          const q = project(pointAt(pk.path, uu));
          const a = pk.alpha * (1 - t * 0.2);
          ctx.fillStyle = `rgba(${pk.rgb}, ${a * 0.25})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, (pk.size - t * 0.35) * 2.6 * q.s, 0, TAU);
          ctx.fill();
          ctx.fillStyle = `rgba(240, 250, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, (pk.size - t * 0.35) * q.s, 0, TAU);
          ctx.fill();
        }
      }

      // HTML tiles follow the projection and tilt with the curved board.
      const place = (el: HTMLElement | null, p: Vec3, extra = 1) => {
        if (!el) return;
        const q = project(p);
        const slope = Math.atan((2 * CURVE * p.x) / COL_X ** 2);
        el.style.transform = `translate3d(${q.x}px, ${q.y}px, 0) translate(-50%, -50%) rotateY(${yaw - slope}rad) rotateX(${-tilt}rad) scale(${q.s * extra})`;
        el.style.zIndex = String(10 + Math.round((q.z + 1) * 10));
      };
      const pk = pickedRef.current;
      INS.forEach((_, i) => {
        const el = inRefs.current[i];
        const hot = ins.includes(i) && elapsed < T_OUT + 600;
        place(el, P(-COL_X, inY[i]), 1 + (hot ? 0.1 * pulseAt(0, 60000) : 0));
        if (el) {
          el.dataset.hot = hot ? "1" : "0";
          el.dataset.picked = pk?.side === "in" && pk.index === i ? "1" : "0";
        }
      });
      OUTS.forEach((_, j) => {
        const el = outRefs.current[j];
        const hot = outs.includes(j) && elapsed > T_ARRIVE - 100 && elapsed < TOUR_MS + 400;
        place(el, P(COL_X, outY[j]), 1 + (hot ? 0.12 * outFlash : 0));
        if (el) {
          el.dataset.hot = hot ? "1" : "0";
          el.dataset.picked = pk?.side === "out" && pk.index === j ? "1" : "0";
        }
      });
      MODULES.forEach((_, m) => {
        const el = modRefs.current[m];
        const isActive = m === activeMod;
        place(el, modPos[m], 1 + (isActive ? 0.12 + 0.12 * modFlash : run?.all ? 0.1 * modFlash : 0));
        if (el && isActive) el.style.zIndex = "35";
      });
      place(coreRef.current, P(0, 0), 1 + 0.06 * coreFlash);

      const manual = now < manualUntilRef.current;
      const fill = pausedRef.current || manual ? 1 : Math.min(1, (now - tourStartRef.current) / TOUR_MS);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${fill})`;
      if (statusRef.current) {
        const p2 = pickedRef.current;
        const app = p2 ? (p2.side === "in" ? INS[p2.index] : OUTS[p2.index]) : null;
        statusRef.current.textContent = reduce
          ? "Usa los módulos para explorar"
          : pausedRef.current
            ? "Recorrido pausado"
            : manual && app
              ? `Aplicación: ${app.name} · ${app.method}`
              : manual
                ? "Exploración manual"
                : "Ecosistema activo · Demo";
      }
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const ring = ringRef.current;
      if (!pausedRef.current && now >= manualUntilRef.current && now - tourStartRef.current >= TOUR_MS) {
        if (pickedRef.current) {
          pickedRef.current = null;
          setPicked(null);
        }
        const next = (indexRef.current + 1) % MOD_N;
        setIndex(next);
        indexRef.current = next;
        ring.target = ring.value + shortestAngle(ring.value, -modAngle(next));
        tourStartRef.current = now;
        requestRef.current = { module: next, all: false };
      }

      const request = requestRef.current;
      if (request) {
        requestRef.current = null;
        startRun(request.module, request.all, now);
      }

      const run = current as Run | null;
      if (run && !run.spawnedOut && now - run.start >= T_OUT) {
        run.spawnedOut = true;
        const begin = run.start + T_OUT;
        runOutputs(run).forEach((j) => {
          for (let k = 0; k < 3; k++) {
            packets.push({ path: outPaths[j], start: begin + k * 120, dur: T_ARRIVE - T_OUT, rgb: OUT_RGB, size: 2.6, alpha: 1 });
          }
        });
      }

      // Background traffic so the board is never idle.
      if (!reduce && now - lastAmbient > 420) {
        lastAmbient = now;
        const toOut = Math.random() < 0.5;
        const pool = toOut ? visOut : visIn;
        const idx = pool[Math.floor(Math.random() * pool.length)];
        packets.push({
          path: toOut ? outPaths[idx] : inPaths[idx],
          start: now,
          dur: 1500 + Math.random() * 600,
          rgb: toOut ? OUT_RGB : IN_RGB,
          size: 1.5,
          alpha: 0.5,
        });
      }

      ring.value += (ring.target - ring.value) * (reduce ? 1 : 1 - Math.exp(-dt * 4.5));

      const yaw = yawRef.current;
      if (!dragRef.current.active) {
        if (Math.abs(yaw.velocity) > 0.02) {
          yaw.value += yaw.velocity * dt;
          yaw.velocity *= Math.exp(-dt * 3.2);
        } else if (!reduce && now > yaw.heldUntil) {
          const target = Math.sin(now / 5200) * (phone.matches ? 0.1 : 0.2);
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
      // Seed the tour clock and first flow once; the observer may restart the loop repeatedly.
      if (tourStartRef.current === 0) {
        tourStartRef.current = last;
        requestRef.current = { module: indexRef.current, all: false };
      }
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
    phone.addEventListener("change", layout);
    draw(0);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      phone.removeEventListener("change", layout);
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
    const yaw = yawRef.current;
    yaw.velocity = reduce ? 0 : Math.max(-3, Math.min(3, drag.velocity));
    yaw.heldUntil = event.timeStamp + 3000;
  }

  function handleStageMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.target = BASE_TILT - ny * 0.18;
  }

  const mod = MODULES[index];
  const isAutomation = index === AUTOMATION_MODULE;
  const whatsappText = `Hola, iA Connexion. Quiero evaluar una solución de integración relacionada con ${mod.name}. Objetivo: ${mod.flow.join(
    " → ",
  )}. Quisiera conocer alcance, aplicaciones compatibles, requisitos técnicos, plazo y presupuesto. Mi negocio es: `;
  const flowIcons = [ArrowDownToLine, mod.icon, CircleCheck];

  const appTile =
    "focus-ring absolute left-0 top-0 items-center justify-center rounded-xl border bg-[linear-gradient(150deg,#ffffff,#e4ecfb)] transition-[box-shadow,border-color] duration-300 [backface-visibility:hidden] h-7 w-7 sm:h-10 sm:w-10 lg:h-11 lg:w-11 data-[picked=1]:border-[#7af1ff] data-[picked=1]:outline data-[picked=1]:outline-2 data-[picked=1]:outline-offset-2 data-[picked=1]:outline-[#7af1ff]";

  const renderApp = (app: EcosystemApp, i: number, side: "in" | "out") => (
    <button
      key={app.name}
      ref={(el) => {
        (side === "in" ? inRefs : outRefs).current[i] = el;
      }}
      type="button"
      title={`${app.name} · ${app.role}`}
      aria-label={`${app.name}: ${app.role}. Ver el módulo ${MODULES[app.module].name}`}
      aria-pressed={picked?.side === side && picked.index === i}
      onClick={(event) => chooseApp(side, i, event.timeStamp)}
      className={cn(
        appTile,
        app.core ? "flex" : "hidden sm:flex",
        side === "in"
          ? "border-[#2c9cff]/60 shadow-[0_4px_0_-1px_rgba(10,30,80,0.9),0_0_14px_-4px_rgba(44,156,255,0.7)] data-[hot=1]:shadow-[0_4px_0_-1px_rgba(10,30,80,0.9),0_0_26px_2px_rgba(37,207,255,0.85)]"
          : "border-[#b06bff]/60 shadow-[0_4px_0_-1px_rgba(40,10,70,0.9),0_0_14px_-4px_rgba(176,107,255,0.7)] data-[hot=1]:shadow-[0_4px_0_-1px_rgba(40,10,70,0.9),0_0_28px_3px_rgba(216,76,255,0.85)]",
      )}
    >
      <AppLogo app={app} className="h-4 w-4 sm:h-6 sm:w-6" />
    </button>
  );

  return (
    <div className="mt-10">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.7fr)]">
        {/* Board */}
        <div className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#10366a] bg-[radial-gradient(ellipse_at_50%_49%,#0a2451_0%,#06132a_47%,#030711_78%)]">
          <div className="flex flex-col items-start gap-2 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Mapa de conexiones</p>
              <p className="mt-0.5 text-xs text-muted">Selecciona cualquier módulo o aplicación</p>
            </div>
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#1a426b] bg-[#07172a] px-3 py-1.5 text-[11px] text-[#9ec2df]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#50e7b3] shadow-[0_0_12px_#50e7b3]" aria-hidden="true" />
              <span ref={statusRef} aria-live="polite" className="max-w-[78vw] truncate sm:max-w-none">
                Ecosistema activo · Demo
              </span>
            </span>
          </div>

          <div
            ref={stageRef}
            className="relative h-[330px] w-full select-none sm:h-[460px] lg:h-auto lg:min-h-[520px] lg:flex-1"
            style={{ perspective: "1000px" }}
            onPointerMove={handleStageMove}
            onPointerLeave={() => {
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

            {INS.map((app, i) => renderApp(app, i, "in"))}
            {OUTS.map((app, j) => renderApp(app, j, "out"))}

            {MODULES.map((m, i) => {
              const isActive = i === index;
              const pink = i === AUTOMATION_MODULE;
              return (
                <button
                  key={m.name}
                  ref={(el) => {
                    modRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={(event) => chooseModule(i, event.timeStamp)}
                  aria-pressed={isActive}
                  aria-label={`Explorar ${m.name}`}
                  className={cn(
                    "focus-ring absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-md border transition-[border-color,box-shadow,color,background-color] duration-200 [backface-visibility:hidden] sm:h-10 sm:w-10 sm:rounded-xl",
                    "bg-[linear-gradient(145deg,#13204a,#0a1030)] shadow-[0_4px_0_-1px_rgba(4,8,30,0.95),0_0_12px_-4px_rgba(56,211,255,0.5)]",
                    isActive
                      ? pink
                        ? "border-[#e46cff] text-white shadow-[0_4px_0_-1px_rgba(4,8,30,0.95),0_0_26px_2px_rgba(216,76,255,0.85)]"
                        : "border-[#59edff] text-white shadow-[0_4px_0_-1px_rgba(4,8,30,0.95),0_0_26px_2px_rgba(56,211,255,0.85)]"
                      : pink
                        ? "border-[#c044ff]/50 text-[#f28cff] hover:border-[#e46cff]"
                        : "border-cyan/30 text-cyan hover:border-cyan/70",
                  )}
                >
                  <m.icon className="h-3 w-3 sm:h-5 sm:w-5" strokeWidth={1.8} aria-hidden="true" />
                  {isActive ? (
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[#2a5b8f] bg-[#071632]/95 px-2 py-0.5 text-[10px] font-semibold text-foreground sm:block">
                      {m.short}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <button
              ref={coreRef}
              type="button"
              onClick={(event) => {
                manualUntilRef.current = event.timeStamp + MANUAL_HOLD_MS;
                pickedRef.current = null;
                setPicked(null);
                focusModule(AUTOMATION_MODULE, event.timeStamp, true);
              }}
              aria-label="iA Connexion: activar todo el ecosistema a la vez"
              className="focus-ring absolute left-0 top-0 z-30 flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-[#0d8fff] bg-[radial-gradient(circle_at_35%_30%,#16245a,#071632_70%)] shadow-[0_0_0_4px_rgba(182,76,255,0.25),0_0_40px_-4px_rgba(13,143,255,0.8)] sm:h-[6.25rem] sm:w-[6.25rem]"
            >
              <Mark className="h-7 w-7 text-foreground sm:h-12 sm:w-12" title="iA Connexion" />
              <span className="mt-0.5 hidden text-[8px] font-semibold tracking-[0.25em] text-foreground/85 sm:block">CONNEXION</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#12305a] bg-[#040c1b] px-3 py-3 sm:px-4">
            <button
              type="button"
              onClick={(event) => togglePause(event.timeStamp)}
              aria-pressed={paused}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[#214b7b] bg-[#0b1c38] px-3 py-2 text-xs font-semibold text-foreground transition-[border-color] duration-200 hover:border-[#62dfff]"
            >
              {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
              {paused ? "Reanudar recorrido" : "Pausar recorrido"}
            </button>
            <div className="flex min-w-[80px] flex-1 gap-1" role="progressbar" aria-label="Progreso de la demostración" aria-valuemin={1} aria-valuemax={MOD_N} aria-valuenow={index + 1}>
              {MODULES.map((m, i) => (
                <span key={m.name} className="h-1 flex-1 overflow-hidden rounded-full bg-[#142a4a]">
                  {i < index ? <span className="block h-full w-full bg-gradient-to-r from-[#1684ff] to-[#51f2ff]" /> : null}
                  {i === index ? <span ref={fillRef} className="block h-full w-full origin-left bg-gradient-to-r from-[#1684ff] to-[#51f2ff]" /> : null}
                </span>
              ))}
            </div>
            <span className="whitespace-nowrap text-[11px] text-[#a9c5e5]">
              {pad(index)} / {pad(MOD_N - 1)} · {mod.short}
            </span>
          </div>
        </div>

        {/* Detail */}
        <aside className="flex min-w-0 flex-col rounded-2xl border border-[#153d6b] bg-[linear-gradient(145deg,#0a1830,#050c1b)] p-5 shadow-[0_18px_55px_#0005] sm:p-6" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, transform: reduce ? "none" : "translateY(8px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-6px)" }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", isAutomation ? "text-[#f28cff]" : "text-[#35dcff]")}>
                    {mod.category}
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{mod.name}</h3>
                </div>
                <span className="whitespace-nowrap rounded-md border border-[#20548b] bg-[#0b2341] px-2 py-1.5 text-[10px] tracking-wider text-[#8cceff]">
                  MÓDULO {pad(index)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#a8bad4]">{mod.description}</p>

              <hr className="my-4 border-[#1a3151]" />
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Aplicaciones relacionadas</p>
              <div className="grid grid-cols-2 gap-2">
                {mod.apps.map(([name, detail]) => (
                  <div key={name} className="flex min-w-0 items-center gap-2 rounded-lg border border-[#1b3558] bg-[#07152b] px-2.5 py-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#102d51] text-[11px] font-bold text-[#5ce6ff]">
                      {name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-foreground">{name}</span>
                      <span className="block truncate text-[10px] text-[#91a8c8]">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-[#1a3151]" />
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Qué se necesita</p>
              <ul className="grid gap-2">
                {mod.requirements.map((text) => (
                  <li key={text} className="flex gap-2.5 text-xs leading-relaxed text-[#b7c9df]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[#176c9d] bg-[#0c304d] text-[#64e8ff]">
                      <Check className="h-2.5 w-2.5" aria-hidden="true" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <hr className="my-4 border-[#1a3151]" />
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94b0d3]">Ejemplo de funcionamiento</p>
              <div className="flex items-start">
                {mod.flow.map((label, k) => {
                  const StepIcon = flowIcons[k];
                  return (
                    <div key={label} className="flex flex-1 items-start">
                      {k > 0 ? <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-[#54b8ff]" aria-hidden="true" /> : null}
                      <div className="min-w-0 flex-1 text-center">
                        <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-[#244d7b] bg-[#0b2140] text-[#65ddff]">
                          <StepIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="mt-1.5 block text-[11px] leading-snug text-[#b9cde5]">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 rounded-lg border border-[#1b4266] bg-[#091c31] p-2.5 text-[11px] leading-relaxed text-[#9ab5d2]">{mod.note}</p>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(110deg,#1858f3,#078cff)] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_22px_#096cff2e] transition-[filter] duration-200 hover:brightness-110"
              >
                Solicitar implementación <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-2 text-center text-[11px] text-[#8ea8cb]">Cuéntanos qué herramientas utiliza tu empresa y qué deseas automatizar.</p>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>

      {/* Module selector */}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9" aria-label="Seleccionar módulo">
        {MODULES.map((m, i) => {
          const isActive = i === index;
          return (
            <button
              key={m.name}
              type="button"
              onClick={(event) => chooseModule(i, event.timeStamp)}
              aria-pressed={isActive}
              className={cn(
                "focus-ring min-w-0 rounded-xl border px-2.5 py-3 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5",
                isActive ? "border-[#49dfff] bg-[#0b2550] shadow-[0_0_15px_#0b7eff33]" : "border-[#16325a] bg-[#071326] hover:border-[#3b9de8]",
              )}
            >
              <m.icon className={cn("mb-2 h-[18px] w-[18px]", i === AUTOMATION_MODULE ? "text-[#f28cff]" : "text-[#50ddff]")} aria-hidden="true" />
              <span className="block text-[9px] tracking-wider text-[#49dfff]">{pad(i)}</span>
              <span className="mt-0.5 block text-[11px] font-semibold leading-tight text-foreground [overflow-wrap:anywhere]">{m.short}</span>
              <span className="mt-1 block text-[10px] leading-tight text-[#8ea8ca]">{m.sub}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-center gap-3 rounded-xl border border-[#132b4b] bg-[#071326] p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#15568d] bg-[#0b2241] text-[#56dfff]">
              <b.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-foreground">{b.title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-[#8ea7c9]">{b.text}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[#7189ac]">{ECOSYSTEM_DISCLAIMER}</p>
    </div>
  );
}
