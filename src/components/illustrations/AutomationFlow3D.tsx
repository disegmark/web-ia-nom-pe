"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  BrainCircuit,
  CalendarDays,
  Camera,
  ChartPie,
  CloudUpload,
  Database,
  FileStack,
  FileText,
  HardDrive,
  Hash,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquareText,
  NotebookPen,
  Receipt,
  RefreshCw,
  Sheet,
  ShieldCheck,
  SquareKanban,
  ThumbsUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Mark } from "@/components/brand/Mark";
import { cn } from "@/lib/utils";
import { FOCAL, TAU, rotate, type Pt, type Vec3 } from "./orbit3d";

type App = { name: string; icon: LucideIcon; color: string; fg?: string; core: boolean };

// `core` apps are the ones kept on phones, where the columns have room for five or so tiles.
const INPUTS: App[] = [
  { name: "Gmail", icon: Mail, color: "#ea4335", core: true },
  { name: "Outlook", icon: Inbox, color: "#0a64d6", core: false },
  { name: "Google Drive", icon: HardDrive, color: "#1fa463", core: true },
  { name: "Google Docs", icon: FileText, color: "#4285f4", core: false },
  { name: "Google Sheets", icon: Sheet, color: "#0f9d58", core: true },
  { name: "Facturas PDF", icon: Receipt, color: "#e53935", core: true },
  { name: "Chat web", icon: MessageSquareText, color: "#5b8bff", core: true },
];
const OUTPUTS: App[] = [
  { name: "WhatsApp", icon: MessageCircle, color: "#25d366", core: true },
  { name: "Instagram", icon: Camera, color: "#e1306c", core: true },
  { name: "Facebook", icon: ThumbsUp, color: "#1877f2", core: false },
  { name: "Slack", icon: Hash, color: "#e01e5a", core: false },
  { name: "Google Calendar", icon: CalendarDays, color: "#4285f4", core: true },
  { name: "Notion", icon: NotebookPen, color: "#e5e7eb", fg: "#0a0e1c", core: false },
  { name: "HubSpot", icon: Users, color: "#ff7a59", core: true },
  { name: "Trello", icon: SquareKanban, color: "#0079bf", core: true },
];
const FUNCTIONS: Array<{ name: string; icon: LucideIcon }> = [
  { name: "Base de datos", icon: Database },
  { name: "Nube", icon: CloudUpload },
  { name: "Analítica", icon: ChartPie },
  { name: "Flujos", icon: Workflow },
  { name: "Documentos", icon: FileStack },
  { name: "Razonamiento iA", icon: BrainCircuit },
  { name: "Seguridad", icon: ShieldCheck },
  { name: "Sincronización", icon: RefreshCw },
];

type Scenario = { input: number; outputs: number[]; functions: number[]; steps: [string, string, string] };

const SCENARIOS: Scenario[] = [
  {
    input: 0,
    outputs: [6, 0],
    functions: [5, 0],
    steps: [
      "Llega a Gmail el correo de un cliente pidiendo una cotización.",
      "La iA lee el mensaje, entiende qué necesita y guarda sus datos.",
      "Registra el lead en HubSpot y avisa al vendedor por WhatsApp.",
    ],
  },
  {
    input: 6,
    outputs: [4, 0],
    functions: [5, 3],
    steps: [
      "Un cliente escribe al chat de la web para reservar una cita.",
      "La iA entiende la intención y revisa la disponibilidad.",
      "Agenda la cita en Google Calendar y la confirma por WhatsApp.",
    ],
  },
  {
    input: 2,
    outputs: [7, 4],
    functions: [4, 1],
    steps: [
      "Se sube un contrato nuevo a Google Drive.",
      "La iA extrae fechas, montos y responsables del documento.",
      "Crea la tarea en Trello y agenda el vencimiento en el calendario.",
    ],
  },
  {
    input: 4,
    outputs: [1, 6],
    functions: [2, 1],
    steps: [
      "Se actualizan los precios en la hoja de productos de Google Sheets.",
      "La iA arma el contenido de la promoción a partir de los datos.",
      "Publica la promoción en Instagram y actualiza los contactos en HubSpot.",
    ],
  },
  {
    input: 5,
    outputs: [7, 0],
    functions: [4, 6],
    steps: [
      "Llega una factura en PDF al correo de administración.",
      "La iA lee la factura, valida los datos y la clasifica.",
      "Registra el pago pendiente en Trello y avisa por WhatsApp.",
    ],
  },
  {
    input: 1,
    outputs: [7, 3],
    functions: [0, 3],
    steps: [
      "Entra una orden de compra al correo de Outlook.",
      "La iA valida el pedido contra el inventario.",
      "Crea la tarea en Trello y notifica al equipo en Slack.",
    ],
  },
  {
    input: 3,
    outputs: [5, 4],
    functions: [4, 5],
    steps: [
      "Se aprueba una propuesta en Google Docs.",
      "La iA la resume y prepara los próximos pasos.",
      "Guarda el resumen en Notion y agenda la reunión de inicio.",
    ],
  },
];
const ALL_STEPS: [string, string, string] = [
  "Todas tus fuentes envían información al mismo tiempo.",
  "La iA la procesa, la protege y la sincroniza en un solo lugar.",
  "Cada canal recibe exactamente lo que le corresponde, sin trabajo manual.",
];

const STEP_LABELS = ["Entrada", "iA Connexion", "Acción"];
const IN_RGB = "56, 211, 255";
const OUT_RGB = "168, 85, 247";

const COL_X = 1.62;
const BUS_X = 1.24;
const PORT_R = 0.8;
const FN_R = 0.53;
const CORE_R = 0.3;
const TILE_HALF = 0.13;
const ENTRY_Y = 0.32;
const CURVE = 0.42;
const BASE_TILT = -0.12;
const YAW_LIMIT = 0.6;
const DRAG_GAIN = 0.005;
const TAP_SLOP_PX = 5;
const RING_SPEED = 0.07;

// Scenario timeline (ms).
const T_IN = 950;
const T_CORE = 1000;
const T_OUT = 1550;
const T_ARRIVE = 2500;
const SCENARIO_HOLD = 5600;

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
type Run = { scenario: number; start: number; spawnedOut: boolean }; // scenario -1 = everything

/** 3D automation hub: apps feed the iA Connexion core, its functions process the work, apps receive the result. */
export function AutomationFlow3D({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [scenario, setScenario] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const outRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fnRefs = useRef<Array<HTMLDivElement | null>>([]);
  const coreRef = useRef<HTMLButtonElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const yawRef = useRef({ value: 0, velocity: 0, heldUntil: 0 });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const dragRef = useRef({ active: false, startX: 0, lastX: 0, lastT: 0, velocity: 0 });
  const requestRef = useRef<{ scenario: number; at: number } | null>(null);
  const lastUserRef = useRef(-Infinity);

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function run(index: number, timeStamp: number) {
    requestRef.current = { scenario: index, at: timeStamp };
    lastUserRef.current = timeStamp;
    setScenario(index);
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

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
      visIn = INPUTS.map((_, i) => i).filter((i) => !compact || INPUTS[i].core);
      visOut = OUTPUTS.map((_, i) => i).filter((i) => !compact || OUTPUTS[i].core);
      const ys = (n: number) => spread(n, compact ? 0.92 : 0.95);
      const inYs = ys(visIn.length);
      const outYs = ys(visOut.length);
      inY = INPUTS.map((_, i) => inYs[visIn.indexOf(i)] ?? 0);
      outY = OUTPUTS.map((_, i) => outYs[visOut.indexOf(i)] ?? 0);
      inPaths = INPUTS.map((_, i) => makePath(tracePoints(inY[i], -1)));
      outPaths = OUTPUTS.map((_, i) => makePath(tracePoints(outY[i], 1)));
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
    let ringAngle = 0;
    let order = 0;

    const visibleScenarios = () =>
      SCENARIOS.map((_, i) => i).filter((i) => visIn.includes(SCENARIOS[i].input) && SCENARIOS[i].outputs.every((o) => visOut.includes(o)));

    const startRun = (index: number, now: number) => {
      current = { scenario: index, start: now, spawnedOut: false };
      const inputs = index < 0 ? visIn : [SCENARIOS[index].input];
      inputs.forEach((i) => {
        for (let k = 0; k < 3; k++) {
          packets.push({ path: inPaths[i], start: now + k * 120, dur: T_IN, rgb: IN_RGB, size: 2.6, alpha: 1 });
        }
      });
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Phones are width-bound (the side columns must stay on screen); desktop is height-bound.
      const R = phone.matches ? Math.min(width / 4.6, height / 2.5) : Math.min(width / 3.75, height / 2.95);
      const cx = width / 2;
      const cy = height / 2;
      const yaw = yawRef.current.value;
      const tilt = tiltRef.current.value;
      const project = (p: Vec3): Pt => {
        const q = rotate(p, yaw, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
      };

      const elapsed = current ? now - current.start : Infinity;
      const scen = current && current.scenario >= 0 ? SCENARIOS[current.scenario] : null;
      const all = current?.scenario === -1;
      const pulseAt = (center: number, width2: number) => (current ? Math.exp(-((elapsed - center) ** 2) / width2) : 0);
      const inFlash = pulseAt(0, 60000);
      const coreFlash = pulseAt(T_CORE, 90000);
      const fnFlash = pulseAt(T_CORE + 250, 160000);
      const outFlash = pulseAt(T_ARRIVE + 150, 90000);
      const inHot = (i: number) => (all ? true : scen?.input === i);
      const outHot = (j: number) => (all ? true : (scen?.outputs.includes(j) ?? false));
      const fnHot = (f: number) => (all ? true : (scen?.functions.includes(f) ?? false));

      // Circuit traces: a wide soft glow under a thin bright line, with junction dots at the bends.
      const stroke = (path: Path, rgb: string, hot: boolean) => {
        const pts = path.pts.map(project);
        for (const [w, a] of [
          [6, hot ? 0.16 : 0.06],
          [1.4, hot ? 0.95 : 0.4],
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
          ctx.fillStyle = `rgba(${rgb}, ${hot ? 1 : 0.6})`;
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
      visIn.forEach((i) => stroke(inPaths[i], IN_RGB, inHot(i) && elapsed < T_OUT + 400));
      visOut.forEach((j) => {
        const pts = stroke(outPaths[j], OUT_RGB, outHot(j) && elapsed > T_OUT - 200);
        // Arrowhead into the destination tile.
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

      // Port ring around the hub, cyan on the input side fading to violet on the output side.
      const ring = Array.from({ length: 73 }, (_, k) => {
        const a = (k / 72) * TAU;
        return { a, q: project(P(Math.cos(a) * PORT_R, Math.sin(a) * PORT_R)) };
      });
      for (let k = 1; k < ring.length; k++) {
        const mixOut = (Math.cos(ring[k].a) + 1) / 2;
        const rgb = mixOut > 0.5 ? OUT_RGB : IN_RGB;
        ctx.strokeStyle = `rgba(${rgb}, ${0.45 + 0.4 * coreFlash})`;
        ctx.lineWidth = 2.2 + 2 * coreFlash;
        ctx.beginPath();
        ctx.moveTo(ring[k - 1].q.x, ring[k - 1].q.y);
        ctx.lineTo(ring[k].q.x, ring[k].q.y);
        ctx.stroke();
      }

      const center = project(P(0, 0));
      const glowR = R * (0.62 + 0.25 * coreFlash);
      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, glowR);
      glow.addColorStop(0, `rgba(56, 211, 255, ${0.28 + 0.4 * coreFlash})`);
      glow.addColorStop(0.5, "rgba(91, 80, 255, 0.12)");
      glow.addColorStop(1, "rgba(47, 93, 250, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center.x, center.y, glowR, 0, TAU);
      ctx.fill();

      // Function tiles orbit the core; spokes carry the work out to the ones this automation uses.
      const fnPts = FUNCTIONS.map((_, f) => {
        const a = ringAngle + (f * TAU) / FUNCTIONS.length - Math.PI / 2;
        return project(P(Math.cos(a) * FN_R, Math.sin(a) * FN_R));
      });
      fnPts.forEach((q, f) => {
        const hot = fnHot(f) && current !== null && elapsed > T_CORE - 100 && elapsed < SCENARIO_HOLD;
        ctx.strokeStyle = `rgba(${hot ? "143, 242, 255" : "91, 139, 255"}, ${hot ? 0.75 : 0.18})`;
        ctx.lineWidth = hot ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        if (hot && !reduce) {
          const u = ((now - (current?.start ?? 0) - T_CORE) / 500) % 1;
          ctx.fillStyle = "rgba(235, 252, 255, 0.95)";
          ctx.beginPath();
          ctx.arc(center.x + (q.x - center.x) * u, center.y + (q.y - center.y) * u, 2.2, 0, TAU);
          ctx.fill();
        }
      });

      // Packets travelling the traces.
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
      INPUTS.forEach((_, i) => {
        const el = inRefs.current[i];
        place(el, P(-COL_X, inY[i]), 1 + 0.12 * (inHot(i) ? inFlash : 0));
        if (el) el.dataset.hot = inHot(i) && elapsed < T_OUT ? "1" : "0";
      });
      OUTPUTS.forEach((_, j) => {
        const el = outRefs.current[j];
        place(el, P(COL_X, outY[j]), 1 + 0.14 * (outHot(j) ? outFlash : 0));
        if (el) el.dataset.hot = outHot(j) && elapsed > T_ARRIVE - 100 && elapsed < SCENARIO_HOLD ? "1" : "0";
      });
      FUNCTIONS.forEach((_, f) => {
        const el = fnRefs.current[f];
        const a = ringAngle + (f * TAU) / FUNCTIONS.length - Math.PI / 2;
        place(el, P(Math.cos(a) * FN_R, Math.sin(a) * FN_R), 1 + 0.12 * (fnHot(f) ? fnFlash : 0));
        if (el) el.dataset.hot = fnHot(f) && current !== null && elapsed > T_CORE - 100 && elapsed < SCENARIO_HOLD ? "1" : "0";
      });
      place(coreRef.current, P(0, 0), 1 + 0.06 * coreFlash);

      const progress = current ? [0, T_CORE - 150, T_OUT].map((t) => elapsed >= t) : [true, true, true];
      stepRefs.current.forEach((el, k) => {
        if (el) el.dataset.on = progress[k] ? "1" : "0";
      });
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const request = requestRef.current;
      if (request) {
        requestRef.current = null;
        startRun(request.scenario, now);
      } else if (!reduce && (!current || now - current.start > SCENARIO_HOLD) && now - lastUserRef.current > SCENARIO_HOLD) {
        // Idle: cycle through the automations on their own.
        const list = visibleScenarios();
        if (list.length) {
          const next = list[order % list.length];
          order++;
          setScenario(next);
          startRun(next, now);
        }
      }

      if (current && !current.spawnedOut && now - current.start >= T_OUT) {
        current.spawnedOut = true;
        const targets = current.scenario < 0 ? visOut : SCENARIOS[current.scenario].outputs.filter((o) => visOut.includes(o));
        const begin = current.start + T_OUT;
        targets.forEach((j) => {
          for (let k = 0; k < 3; k++) {
            packets.push({ path: outPaths[j], start: begin + k * 120, dur: T_ARRIVE - T_OUT, rgb: OUT_RGB, size: 2.6, alpha: 1 });
          }
        });
      }

      // Background traffic so the board is never idle.
      if (!reduce && now - lastAmbient > 380) {
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
          alpha: 0.55,
        });
      }

      if (!reduce) ringAngle += RING_SPEED * dt;

      const yaw = yawRef.current;
      if (!dragRef.current.active) {
        if (Math.abs(yaw.velocity) > 0.02) {
          yaw.value += yaw.velocity * dt;
          yaw.velocity *= Math.exp(-dt * 3.2);
        } else if (!reduce && now > yaw.heldUntil) {
          const target = Math.sin(now / 5200) * (phone.matches ? 0.1 : 0.22);
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
      rootMargin: "120px",
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
    drag.startX = event.clientX;
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
    if (Math.abs(event.clientX - drag.startX) < TAP_SLOP_PX) return;
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

  const active = scenario >= 0 ? SCENARIOS[scenario] : null;
  const steps = active?.steps ?? ALL_STEPS;
  const stepApps = active
    ? [
        INPUTS[active.input].name,
        active.functions.map((f) => FUNCTIONS[f].name).join(" · "),
        active.outputs.map((o) => OUTPUTS[o].name).join(" · "),
      ]
    : ["Todas las fuentes", "Todas las funciones", "Todos los canales"];

  const tile =
    "absolute left-0 top-0 items-center justify-center rounded-xl transition-[box-shadow,filter] duration-300 [backface-visibility:hidden]";

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={stageRef}
        className="relative h-[300px] w-full select-none sm:h-[440px] lg:h-[480px]"
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

        {INPUTS.map((app, i) => {
          const AppIcon = app.icon;
          const scenarioIndex = SCENARIOS.findIndex((s) => s.input === i);
          return (
            <button
              key={app.name}
              ref={(el) => {
                inRefs.current[i] = el;
              }}
              type="button"
              title={app.name}
              aria-label={`${app.name}: ver cómo se automatiza`}
              onClick={(event) => run(scenarioIndex, event.timeStamp)}
              className={cn(
                tile,
                "focus-ring h-7 w-7 sm:h-10 sm:w-10 lg:h-11 lg:w-11",
                "shadow-[0_4px_0_-1px_rgba(6,12,40,0.9),0_0_16px_-4px_var(--app)] data-[hot=1]:shadow-[0_4px_0_-1px_rgba(6,12,40,0.9),0_0_28px_2px_var(--app)] data-[hot=1]:brightness-125",
                app.core ? "flex" : "hidden sm:flex",
              )}
              style={{ "--app": app.color, background: `linear-gradient(145deg, ${app.color}, ${app.color}c0)`, color: app.fg ?? "#ffffff" } as CSSProperties}
            >
              <AppIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden="true" />
            </button>
          );
        })}

        {OUTPUTS.map((app, j) => {
          const AppIcon = app.icon;
          return (
            <div
              key={app.name}
              ref={(el) => {
                outRefs.current[j] = el;
              }}
              title={app.name}
              aria-hidden="true"
              className={cn(
                tile,
                "h-7 w-7 sm:h-10 sm:w-10 lg:h-11 lg:w-11",
                "shadow-[0_4px_0_-1px_rgba(30,8,50,0.9),0_0_16px_-4px_var(--app)] data-[hot=1]:shadow-[0_4px_0_-1px_rgba(30,8,50,0.9),0_0_30px_3px_var(--app)] data-[hot=1]:brightness-125",
                app.core ? "flex" : "hidden sm:flex",
              )}
              style={{ "--app": app.color, background: `linear-gradient(145deg, ${app.color}, ${app.color}c0)`, color: app.fg ?? "#ffffff" } as CSSProperties}
            >
              <AppIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" strokeWidth={2} />
            </div>
          );
        })}

        {FUNCTIONS.map((fn, f) => {
          const FnIcon = fn.icon;
          return (
            <div
              key={fn.name}
              ref={(el) => {
                fnRefs.current[f] = el;
              }}
              title={fn.name}
              aria-hidden="true"
              className={cn(
                tile,
                "flex h-6 w-6 rounded-lg border border-cyan/30 bg-[linear-gradient(145deg,#13204a,#0a1030)] text-cyan sm:h-10 sm:w-10 sm:rounded-xl",
                "shadow-[0_4px_0_-1px_rgba(4,8,30,0.95),0_0_14px_-4px_rgba(56,211,255,0.6)] data-[hot=1]:border-cyan data-[hot=1]:text-white data-[hot=1]:shadow-[0_4px_0_-1px_rgba(4,8,30,0.95),0_0_26px_2px_rgba(56,211,255,0.8)]",
              )}
            >
              <FnIcon className="h-3 w-3 sm:h-5 sm:w-5" strokeWidth={1.8} />
            </div>
          );
        })}

        <button
          ref={coreRef}
          type="button"
          onClick={(event) => run(-1, event.timeStamp)}
          aria-label="iA Connexion: conectar todas las fuentes y canales a la vez"
          className="focus-ring absolute left-0 top-0 z-30 flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-cyan/70 bg-[radial-gradient(circle_at_35%_30%,#16245a,#070b1d_70%)] shadow-[0_0_0_4px_rgba(56,211,255,0.12),0_0_40px_-4px_rgba(56,211,255,0.7)] sm:h-[6.5rem] sm:w-[6.5rem]"
        >
          <Mark className="h-8 w-8 text-foreground sm:h-14 sm:w-14" title="iA Connexion" />
          <span className="mt-0.5 hidden text-[8px] font-semibold sm:block tracking-[0.25em] text-foreground/80">CONNEXION</span>
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3 sm:gap-3" aria-live="polite">
        {steps.map((text, k) => (
          <div
            key={`${scenario}-${k}`}
            ref={(el) => {
              stepRefs.current[k] = el;
            }}
            data-on="1"
            className="rounded-xl border border-border bg-background-elevated/60 p-3 opacity-40 transition-[opacity,border-color] duration-300 data-[on=1]:border-cyan/30 data-[on=1]:opacity-100"
          >
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", k === 2 ? "text-[#c084fc]" : "text-cyan")}>
              {k + 1}. {STEP_LABELS[k]} <span className="font-normal normal-case tracking-normal text-muted">· {stepApps[k]}</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{text}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted/70">
        Toca una app de la izquierda para ver su automatización · toca el núcleo para conectarlo todo · arrastra para girar
      </p>
    </div>
  );
}
