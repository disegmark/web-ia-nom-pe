"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { IconItem } from "@/types";
import {
  FOCAL,
  TAU,
  makeStars,
  quad,
  rotate,
  rotateX,
  rotateY,
  shortestAngle,
  yawToFront,
  type Pt,
  type Vec3,
} from "./orbit3d";

type RadialDiagramProps = {
  centerLabel: string;
  centerIcon: IconItem["icon"];
  nodes: IconItem[];
  className?: string;
};

// Two gyroscope rings around the capability sphere, spinning in opposite directions.
const RINGS = [
  { inclination: 0.62, yaw: 0, speed: 0.34, rgb: "56, 211, 255" },
  { inclination: -0.62, yaw: 1.05, speed: -0.26, rgb: "255, 182, 72" },
];
const RING_RADIUS = 1.2;
const SPHERE_Y_SCALE = 0.78;
const NEIGHBOURS = 3;
const CORE_RGB = "143, 242, 255";
const BASE_TILT = -0.26;
const COMPACT_TILT = -0.34;
const COMPACT_WIDTH = 480;
const CAMERA_DRIFT = 0.07;
const FOCUS_OFFSET = 0.8;
const CORE_CLEARANCE_PX = 62;
const RESUME_AFTER_MS = 5200;
const DRAG_GAIN = 0.0065;
const TAP_SLOP_PX = 5;
const PHASE_MS = 750;
const AMBIENT_PULSE_MS = 6000;

type Pulse = { source: number; start: number }; // source -1 = the agent core

// Capabilities spread evenly over a slightly flattened sphere (Fibonacci lattice), so they
// keep fixed distances from each other and never pass through one another while rotating.
function spherePoints(n: number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) * 2) / n;
    const r = Math.sqrt(1 - y * y);
    return { x: Math.cos(i * golden) * r, y: y * SPHERE_Y_SCALE, z: Math.sin(i * golden) * r };
  });
}

/** Each capability linked to its nearest neighbours on the sphere (deduplicated pairs). */
function neighbourLinks(points: Vec3[]) {
  const seen = new Set<string>();
  const links: Array<{ a: number; b: number }> = [];
  points.forEach((p, a) => {
    points
      .map((q, b) => ({ b, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
      .filter(({ b }) => b !== a)
      .sort((m, n) => m.d - n.d)
      .slice(0, NEIGHBOURS)
      .forEach(({ b }) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (seen.has(key)) return;
        seen.add(key);
        links.push({ a: Math.min(a, b), b: Math.max(a, b) });
      });
  });
  return links;
}

function ringPoint(ring: number, angle: number, radius = 1): Vec3 {
  const p = { x: Math.cos(angle) * radius, y: 0, z: Math.sin(angle) * radius };
  return rotateY(rotateX(p, RINGS[ring].inclination), RINGS[ring].yaw);
}

/** 3D gyroscope: the agent at the centre, its capabilities on two counter-rotating rings, all wired together. */
export function RadialDiagram({ centerLabel, centerIcon, nodes, className }: RadialDiagramProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeRef = useRef(0);
  const hoverNodeRef = useRef(-1);
  const hoverRef = useRef(false);
  const camRef = useRef({ value: 0, velocity: 0 });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const baseTiltRef = useRef(BASE_TILT);
  const spinRef = useRef({ angles: [0, 0], mul: 1 });
  const focusUntilRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, lastX: 0, lastT: 0, velocity: 0 });
  const pulseRef = useRef<Pulse | null>(null);
  const lastPulseRef = useRef(0);

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function firePulse(source: number, timeStamp: number) {
    pulseRef.current = { source, start: timeStamp };
    lastPulseRef.current = timeStamp;
  }

  function select(index: number, timeStamp: number) {
    setActive(index);
    activeRef.current = index;
    camRef.current.velocity = 0;
    focusUntilRef.current = timeStamp + RESUME_AFTER_MS;
    firePulse(index, timeStamp);
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    const world = spherePoints(nodes.length);
    const meshLinks = neighbourLinks(world);

    const stars = makeStars(70);
    const ringCircle = (r: number) => Array.from({ length: 97 }, (_, k) => ringPoint(r, (k / 96) * TAU, RING_RADIUS));
    const circles = [ringCircle(0), ringCircle(1)];
    const equator = Array.from({ length: 97 }, (_, k) => {
      const a = (k / 96) * TAU;
      return { x: Math.cos(a) * 1.3, y: 0, z: Math.sin(a) * 1.3 };
    });

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
      const baseTilt = width < COMPACT_WIDTH ? COMPACT_TILT : BASE_TILT;
      baseTiltRef.current = baseTilt;
      tiltRef.current.target = baseTilt;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const nodeWorld = (i: number) => world[i];

    const dot = (x: number, y: number, r: number, rgb: string, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(235, 252, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    };

    const curve = (p0: Pt, c: Pt, p1: Pt, rgb0: string, rgb1: string, a0: number, a1: number, lineWidth: number, dash: boolean, time: number) => {
      const gradient = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
      gradient.addColorStop(0, `rgba(${rgb0}, ${a0})`);
      gradient.addColorStop(1, `rgba(${rgb1}, ${a1})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dash ? [3, 6] : []);
      ctx.lineDashOffset = reduce ? 0 : -time * 14;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo(c.x, c.y, p1.x, p1.y);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const comet = (p0: Pt, c: Pt, p1: Pt, u: number, rgb: string, scale: number) => {
      for (let t = 0; t < 5; t++) {
        const uu = u - t * 0.035;
        if (uu < 0 || uu > 1) continue;
        const p = quad(p0, c, p1, uu);
        dot(p.x, p.y, (2.6 - t * 0.4) * scale, rgb, 1 - t * 0.2);
      }
    };

    const draw = (nowMs: number) => {
      const time = nowMs / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const compact = width < COMPACT_WIDTH;
      const R = Math.min(width * (compact ? 0.32 : 0.35), height * 0.36);
      const cx = width / 2;
      const cy = height / 2;
      const yaw = camRef.current.value;
      const tilt = tiltRef.current.value;
      const project = (p: Vec3, r = yaw): Pt => {
        const q = rotate(p, r, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
      };
      const core: Pt = { x: cx, y: cy, z: 0, s: 1 };
      const front = (p: Pt) => Math.max(0, Math.min(1, (p.z + 1) / 2));

      const activeIndex = activeRef.current;
      const hovered = hoverNodeRef.current;
      const lit = (i: number) => i === activeIndex || i === hovered;

      const pulse = reduce ? null : pulseRef.current;
      const e = pulse ? (nowMs - pulse.start) / PHASE_MS : -1;
      if (pulse && e > 2.2) pulseRef.current = null;
      const flashAt = (arrival: number) => (pulse && e >= 0 ? Math.exp(-((e - arrival) ** 2) / 0.04) : 0);
      const coreFlash = pulse ? (pulse.source === -1 ? flashAt(0) : flashAt(1)) : 0;
      const nodeFlash = (i: number) => {
        if (!pulse) return 0;
        if (pulse.source === -1) return flashAt(1);
        return i === pulse.source ? flashAt(0) : flashAt(1);
      };

      for (const star of stars) {
        const p = project(star, yaw * 0.5);
        const depth = (p.z + 1.7) / 3.4;
        const twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(time * 1.6 + star.tw);
        ctx.fillStyle = `rgba(160, 220, 255, ${(0.08 + 0.42 * depth) * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.5 + 1.1 * depth * p.s, 0, TAU);
        ctx.fill();
      }

      const strokeLoop = (points: Vec3[], rgb: string, base: number, span: number, dashed = false) => {
        ctx.setLineDash(dashed ? [2, 7] : []);
        let prev = project(points[0]);
        for (let k = 1; k < points.length; k++) {
          const p = project(points[k]);
          const depth = ((prev.z + p.z) / 2 + 1) / 2;
          ctx.strokeStyle = `rgba(${rgb}, ${base + span * depth})`;
          ctx.lineWidth = 0.6 + depth * 1.1;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          prev = p;
        }
        ctx.setLineDash([]);
      };
      strokeLoop(equator, "91, 139, 255", 0.03, 0.12, true);
      strokeLoop(circles[1], RINGS[1].rgb, 0.05, 0.3);
      strokeLoop(circles[0], RINGS[0].rgb, 0.05, 0.3);

      // Satellites ride each gyroscope ring, which is what makes the counter-rotation visible.
      for (let r = 0; r < RINGS.length; r++) {
        for (let k = 0; k < 3; k++) {
          const p = project(ringPoint(r, spinRef.current.angles[r] + (k * TAU) / 3, RING_RADIUS));
          const depth = front(p);
          dot(p.x, p.y, (1.4 + 1.2 * depth) * p.s, RINGS[r].rgb, 0.35 + 0.65 * depth);
        }
      }

      const breathe = reduce ? 1 : 1 + 0.08 * Math.sin(time * 2.2);
      const glowR = R * 0.5 * breathe * (1 + 0.35 * coreFlash);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(56, 211, 255, ${0.3 + 0.4 * coreFlash})`);
      glow.addColorStop(0.45, "rgba(47, 93, 250, 0.12)");
      glow.addColorStop(1, "rgba(47, 93, 250, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, TAU);
      ctx.fill();

      const pts = world.map((w) => project(w));
      const rgbOf = (i: number) => RINGS[i % 2].rgb;

      // Capability ↔ capability: arcs that hug the sphere surface between neighbours.
      const links = meshLinks.map((link) => {
        const wa = world[link.a];
        const wb = world[link.b];
        const mid = { x: (wa.x + wb.x) / 2, y: (wa.y + wb.y) / 2, z: (wa.z + wb.z) / 2 };
        const len = Math.hypot(mid.x, mid.y, mid.z) || 1;
        const lift = 1.18 / len;
        return { a: link.a, b: link.b, control: project({ x: mid.x * lift, y: mid.y * lift, z: mid.z * lift }) };
      });

      for (const link of links) {
        const a = pts[link.a];
        const b = pts[link.b];
        const depth = (front(a) + front(b)) / 2;
        const hot = lit(link.a) || lit(link.b);
        const alpha = hot ? 0.55 + 0.35 * depth : 0.12 + 0.24 * depth;
        curve(a, link.control, b, rgbOf(link.a), rgbOf(link.b), alpha, alpha, hot ? 1.3 : 0.8, !hot, time);

        const u = reduce ? 0.5 : (time * (hot ? 0.34 : 0.17) + link.a * 0.11 + link.b * 0.07) % 1;
        const p = quad(a, link.control, b, u);
        dot(p.x, p.y, (hot ? 1.6 : 1.1) * ((a.s + b.s) / 2), rgbOf(link.b), (hot ? 0.9 : 0.25 + 0.35 * depth) * Math.sin(u * Math.PI));

        if (pulse) {
          const scale = (a.s + b.s) / 2;
          if (pulse.source === -1 && e >= 1 && e <= 1.5) {
            comet(a, link.control, b, e - 1, rgbOf(link.a), scale);
            comet(b, link.control, a, e - 1, rgbOf(link.b), scale);
          } else if (pulse.source !== -1 && e >= 0 && e <= 1 && (link.a === pulse.source || link.b === pulse.source)) {
            const from = link.a === pulse.source ? a : b;
            const to = link.a === pulse.source ? b : a;
            comet(from, link.control, to, e, rgbOf(pulse.source), scale);
          }
        }
      }

      // Agent ↔ capability: a straight strand and a bowed one per capability.
      for (let i = 0; i < pts.length; i++) {
        const n = pts[i];
        const w = world[i];
        const depth = front(n);
        const hot = lit(i);
        const rgb = rgbOf(i);
        for (let k = 0; k < 2; k++) {
          const lift = k === 0 ? 0 : i % 2 ? 0.34 : -0.34;
          const c = project({ x: w.x * 0.5, y: w.y * 0.5 + lift, z: w.z * 0.5 });
          const alpha = hot ? (k === 0 ? 0.95 : 0.6) : (k === 0 ? 0.2 : 0.1) + 0.26 * depth;
          curve(core, c, n, CORE_RGB, rgb, alpha, alpha * 0.6, hot && k === 0 ? 1.8 : hot ? 1.1 : 0.7, !hot && k === 1, time);

          const inbound = k === 0;
          const raw = reduce ? 0.5 : (time * (hot ? 0.5 : 0.24) + i * 0.17 + k * 0.4) % 1;
          const u = inbound ? 1 - raw : raw;
          const p = quad(core, c, n, u);
          dot(p.x, p.y, (hot ? 1.8 : 1.2) * n.s, inbound ? rgb : CORE_RGB, (hot ? 1 : 0.3 + 0.4 * depth) * Math.sin(raw * Math.PI));

          if (pulse) {
            if (pulse.source === -1 && e >= 0 && e <= 1) comet(core, c, n, e, CORE_RGB, n.s);
            else if (pulse.source === i && e >= 0 && e <= 1) comet(n, c, core, e, rgb, n.s);
            else if (pulse.source !== -1 && pulse.source !== i && e >= 1 && e <= 2) comet(core, c, n, e - 1, CORE_RGB, n.s);
          }
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const f = front(p);
        const flash = nodeFlash(i);
        const radius = (30 + 24 * flash) * p.s;
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        halo.addColorStop(0, `rgba(${rgbOf(i)}, ${Math.min(0.85, (lit(i) ? 0.4 : 0.12 + 0.14 * f) + 0.5 * flash)})`);
        halo.addColorStop(1, `rgba(${rgbOf(i)}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, TAU);
        ctx.fill();

        const el = buttonRefs.current[i];
        if (el) {
          const scale = (compact ? 0.72 + 0.3 * f : 0.78 + 0.34 * f) * (1 + 0.08 * flash);
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -20px) scale(${scale})`;
          // A node crossing in front of the core turns translucent and click-through, so the
          // agent stays readable and tappable.
          const clear = Math.max(0, Math.min(1, (Math.hypot(p.x - cx, p.y - cy) - CORE_CLEARANCE_PX) / 24));
          const overCore = p.z > 0 && !lit(i);
          el.style.opacity = String(Math.min(1, 0.5 + 0.5 * f + flash) * (overCore ? 0.35 + 0.65 * clear : 1));
          el.style.pointerEvents = overCore && clear < 0.5 ? "none" : "";
          el.style.zIndex = p.z > 0 ? "30" : "10";
          // Labels only read on the near side of the gyroscope, plus whatever is active or hovered.
          const label = (lit(i) ? 1 : Math.max(0, Math.min(1, (f - 0.52) * 3.2))) * clear;
          el.style.setProperty("--label", String(label));
        }
      }
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const cam = camRef.current;
      const spin = spinRef.current;
      const focused = now < focusUntilRef.current;

      // Rings slow to a stop while a capability is in focus, then spin back up.
      const spinTarget = reduce || focused ? 0 : 1;
      spin.mul += (spinTarget - spin.mul) * (1 - Math.exp(-dt * (focused ? 4 : 1.2)));
      spin.angles[0] += RINGS[0].speed * spin.mul * dt;
      spin.angles[1] += RINGS[1].speed * spin.mul * dt;

      if (!dragRef.current.active) {
        if (focused) {
          // Park the selected capability front-right, clear of the agent core rather than on top of it.
          const w = nodeWorld(activeRef.current);
          const frontYaw = yawToFront(w);
          const rightYaw = frontYaw + FOCUS_OFFSET;
          const target = w.x * Math.cos(rightYaw) + w.z * Math.sin(rightYaw) > 0 ? rightYaw : frontYaw - FOCUS_OFFSET;
          cam.value += shortestAngle(cam.value, target) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
        } else if (Math.abs(cam.velocity) > 0.02) {
          cam.value += cam.velocity * dt;
          cam.velocity *= Math.exp(-dt * 3.2);
        } else if (!reduce && !hoverRef.current) {
          cam.velocity = 0;
          cam.value += CAMERA_DRIFT * dt;
        }
      }

      if (!reduce && !pulseRef.current && now - lastPulseRef.current > AMBIENT_PULSE_MS) {
        pulseRef.current = { source: Math.random() < 0.35 ? -1 : Math.floor(Math.random() * nodes.length), start: now };
        lastPulseRef.current = now;
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
      lastPulseRef.current = last - AMBIENT_PULSE_MS + 1500;
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
    draw(0);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
    };
  }, [reduce, nodes]);

  function handleCanvasDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    drag.active = true;
    drag.startX = event.clientX;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
    drag.velocity = 0;
    camRef.current.velocity = 0;
    focusUntilRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCanvasMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const delta = (event.clientX - drag.lastX) * DRAG_GAIN;
    camRef.current.value += delta;
    drag.velocity = delta / Math.max(0.008, (event.timeStamp - drag.lastT) / 1000);
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
  }

  function handleCanvasUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (Math.abs(event.clientX - drag.startX) < TAP_SLOP_PX) {
      firePulse(-1, event.timeStamp);
      return;
    }
    camRef.current.velocity = reduce ? 0 : Math.max(-4, Math.min(4, drag.velocity));
  }

  function handleStageMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.target = baseTiltRef.current - ny * 0.24;
  }

  const activeNode = nodes[active];

  return (
    <div className={className}>
      <div
        ref={stageRef}
        className="relative mx-auto h-[380px] w-full max-w-xl select-none sm:h-[440px]"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hoverRef.current = true;
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
          hoverNodeRef.current = -1;
          tiltRef.current.target = baseTiltRef.current;
        }}
        onPointerMove={handleStageMove}
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

        <button
          type="button"
          onClick={(event) => firePulse(-1, event.timeStamp)}
          aria-label={`${centerLabel}: activar todas sus capacidades`}
          className="focus-ring absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-cyan/55 bg-background-elevated/90 text-center shadow-[0_0_42px_-6px_rgba(56,211,255,.5)] transition-[box-shadow,border-color] duration-200 sm:h-24 sm:w-24 [@media(hover:hover)_and_(pointer:fine)]:hover:border-cyan [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_56px_-4px_rgba(56,211,255,.75)]"
        >
          <Icon name={centerIcon} className="h-6 w-6 text-cyan sm:h-7 sm:w-7" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground sm:text-[11px]">{centerLabel}</span>
        </button>

        {nodes.map((node, i) => {
          const isActive = active === i;
          const amber = i % 2 === 1;
          return (
            <button
              key={node.title}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              onClick={(event) => select(i, event.timeStamp)}
              onFocus={(event) => select(i, event.timeStamp)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hoverNodeRef.current = i;
              }}
              onPointerLeave={() => {
                if (hoverNodeRef.current === i) hoverNodeRef.current = -1;
              }}
              aria-pressed={isActive}
              aria-label={`${node.title}: ${node.description}`}
              style={{ transformOrigin: "50% 20px" }}
              className="focus-ring absolute left-0 top-0 flex w-28 flex-col items-center gap-1.5 text-center opacity-0"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border bg-background-elevated transition-[border-color,color,box-shadow] duration-200",
                  isActive
                    ? amber
                      ? "border-sign-amber text-sign-amber shadow-[0_0_22px_-4px_rgba(255,182,72,.7)]"
                      : "border-cyan text-cyan shadow-[0_0_22px_-4px_rgba(56,211,255,.7)]"
                    : amber
                      ? "border-sign-amber/35 text-sign-amber/80"
                      : "border-cyan/35 text-cyan/80",
                )}
              >
                <Icon name={node.icon} className="h-[18px] w-[18px]" />
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight [text-shadow:0_0_6px_rgba(5,7,15,0.95),0_0_12px_rgba(5,7,15,0.9)]",
                  isActive ? "font-medium text-foreground" : "text-muted",
                )}
                style={{ opacity: "var(--label, 0)" }}
              >
                {node.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-4 min-h-[3.25rem] max-w-md text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeNode.title}
            initial={{ opacity: 0, transform: reduce ? "none" : "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-4px)" }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="text-sm leading-relaxed text-muted"
          >
            <span className="font-medium text-cyan">{activeNode.title}:</span> {activeNode.description}
          </motion.p>
        </AnimatePresence>
        <p className="mt-1 text-[11px] text-muted/70">Toca el agente para activar sus capacidades · arrastra para girar</p>
      </div>
    </div>
  );
}
