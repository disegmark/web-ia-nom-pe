"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { WHATWEDO_LEFT_NODES, WHATWEDO_RIGHT_NODES } from "@/data/diagrams";

const NODES = [...WHATWEDO_LEFT_NODES, ...WHATWEDO_RIGHT_NODES];
const NODE_COLORS = ["#38d3ff", "#5b8bff", "#ffb648", "#38d3ff", "#ffb648"];
const NODE_Y = [-0.26, 0.14, 0.3, -0.16, 0.22];
const THETA = NODES.map((_, i) => (i * Math.PI * 2) / NODES.length);

const TAU = Math.PI * 2;
const FOCAL = 3.2;
// Steep enough that the front node drops clearly below the core instead of covering it;
// steeper still on narrow screens so the labels spread vertically instead of crowding the core.
const BASE_TILT = -0.78;
const COMPACT_TILT = -1;
const COMPACT_WIDTH = 480;
const AUTO_SPEED = 0.14;
const RESUME_AFTER_MS = 5200;
const DRAG_GAIN = 0.0065;
const TAP_SLOP_PX = 5;
const PHASE_MS = 750;
const AMBIENT_PULSE_MS = 6500;

type Vec3 = { x: number; y: number; z: number };
type Pt = { x: number; y: number; z: number; s: number };
type Pulse = { source: number; start: number }; // source -1 = the iA core

const NODE_POS: Vec3[] = NODES.map((_, i) => ({ x: Math.cos(THETA[i]), y: NODE_Y[i], z: Math.sin(THETA[i]) }));

// Three strands per area into the core: one straight, two bowed above/below it.
const CORE_STRANDS = NODE_POS.flatMap((n, i) =>
  [0, 1, 2].map((k) => {
    const perp = { x: -n.z, z: n.x };
    const side = k === 0 ? 0 : k === 1 ? 1 : -1;
    return {
      node: i,
      k,
      control: { x: n.x * 0.5 + perp.x * 0.2 * side, y: n.y * 0.5 + 0.3 * side, z: n.z * 0.5 + perp.z * 0.2 * side },
    };
  }),
);

// Every area connected to every other: neighbours bow along the orbit, opposites arc over/under the core.
const PAIRS = NODE_POS.flatMap((a, i) =>
  NODE_POS.slice(i + 1).map((b, offset) => {
    const j = i + 1 + offset;
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
    const neighbour = j - i === 1 || j - i === NODES.length - 1;
    const control = neighbour
      ? { x: mid.x * 1.22, y: mid.y + 0.1, z: mid.z * 1.22 }
      : { x: mid.x * 0.35, y: mid.y + ((i + j) % 2 ? 0.7 : -0.7), z: mid.z * 0.35 };
    return { a: i, b: j, control };
  }),
);

function rotate(p: Vec3, rotY: number, tilt: number): Vec3 {
  const cr = Math.cos(rotY);
  const sr = Math.sin(rotY);
  const x = p.x * cr + p.z * sr;
  const z = -p.x * sr + p.z * cr;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x, y: p.y * ct - z * st, z: p.y * st + z * ct };
}

function quad(p0: Pt, c: Pt, p1: Pt, u: number) {
  const v = 1 - u;
  return { x: v * v * p0.x + 2 * v * u * c.x + u * u * p1.x, y: v * v * p0.y + 2 * v * u * c.y + u * u * p1.y };
}

function shortestAngle(from: number, to: number) {
  return ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const NODE_RGB = NODE_COLORS.map(hexToRgb);
const CORE_RGB = "143, 242, 255";

/** 3D systems map: five areas orbiting the iA core, all wired to it and to each other. */
export function WhatWeDoHub() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeRef = useRef(0);
  const hoverNodeRef = useRef(-1);
  const rotRef = useRef({ value: THETA[0] - Math.PI / 2, target: null as number | null, velocity: 0 });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const baseTiltRef = useRef(BASE_TILT);
  const focusUntilRef = useRef(0);
  const hoverRef = useRef(false);
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
    const rot = rotRef.current;
    rot.velocity = 0;
    rot.target = rot.value + shortestAngle(rot.value, THETA[index] - Math.PI / 2);
    focusUntilRef.current = timeStamp + RESUME_AFTER_MS;
    firePulse(index, timeStamp);
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    const stars = Array.from({ length: 64 }, () => {
      const u = Math.random() * 2 - 1;
      const phi = Math.random() * TAU;
      const r = 1.25 + Math.random() * 0.45;
      const s = Math.sqrt(1 - u * u);
      return { x: Math.cos(phi) * s * r, y: u * r * 0.7, z: Math.sin(phi) * s * r, tw: Math.random() * TAU };
    });
    const ring = Array.from({ length: 97 }, (_, k) => {
      const a = (k / 96) * TAU;
      return { x: Math.cos(a), y: 0, z: Math.sin(a) };
    });
    const inclined = Array.from({ length: 97 }, (_, k) => {
      const a = (k / 96) * TAU;
      return { x: Math.cos(a) * 0.62, y: Math.sin(a) * 0.62 * Math.sin(1.05), z: Math.sin(a) * 0.62 * Math.cos(1.05) };
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

    // A short comet: the head plus a fading tail behind it along the curve.
    const comet = (p0: Pt, c: Pt, p1: Pt, u: number, rgb: string, scale: number, strength: number) => {
      for (let t = 0; t < 5; t++) {
        const uu = u - t * 0.035;
        if (uu < 0 || uu > 1) continue;
        const p = quad(p0, c, p1, uu);
        dot(p.x, p.y, (2.6 - t * 0.4) * scale, rgb, strength * (1 - t * 0.2));
      }
    };

    const draw = (nowMs: number) => {
      const time = nowMs / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const compact = width < COMPACT_WIDTH;
      const R = Math.min(width * (compact ? 0.33 : 0.4), height * 0.4);
      const cx = width / 2;
      const cy = height / 2;
      const rot = rotRef.current.value;
      const tilt = tiltRef.current.value;
      const project = (p: Vec3, r = rot): Pt => {
        const q = rotate(p, r, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
      };
      const core: Pt = { x: cx, y: cy, z: 0, s: 1 };

      const activeIndex = activeRef.current;
      const hovered = hoverNodeRef.current;
      const lit = (i: number) => i === activeIndex || i === hovered;

      // Pulse timeline: phase 1 leaves the source, phase 2 is relayed by whoever received it.
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
        const p = project(star, rot * 0.55);
        const depth = (p.z + 1.7) / 3.4;
        const twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(time * 1.6 + star.tw);
        ctx.fillStyle = `rgba(160, 220, 255, ${(0.08 + 0.42 * depth) * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.5 + 1.1 * depth * p.s, 0, TAU);
        ctx.fill();
      }

      const strokeRing = (points: Vec3[], rgb: string, base: number, span: number) => {
        let prev = project(points[0]);
        for (let k = 1; k < points.length; k++) {
          const p = project(points[k]);
          const depth = ((prev.z + p.z) / 2 + 1) / 2;
          ctx.strokeStyle = `rgba(${rgb}, ${base + span * depth})`;
          ctx.lineWidth = 0.6 + depth * 0.9;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          prev = p;
        }
      };
      strokeRing(inclined, "91, 139, 255", 0.03, 0.14);
      strokeRing(ring, "56, 211, 255", 0.05, 0.3);

      const breathe = reduce ? 1 : 1 + 0.08 * Math.sin(time * 2.2);
      const glowR = R * 0.55 * breathe * (1 + 0.35 * coreFlash);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(56, 211, 255, ${0.32 + 0.4 * coreFlash})`);
      glow.addColorStop(0.45, "rgba(47, 93, 250, 0.12)");
      glow.addColorStop(1, "rgba(47, 93, 250, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, TAU);
      ctx.fill();

      const nodes = NODE_POS.map((n) => project(n));
      const front = (p: Pt) => Math.max(0, Math.min(1, (p.z + 1) / 2));

      // Area ↔ area links.
      for (const pair of PAIRS) {
        const a = nodes[pair.a];
        const b = nodes[pair.b];
        const c = project(pair.control);
        const depth = (front(a) + front(b)) / 2;
        const hot = lit(pair.a) || lit(pair.b);
        const alpha = hot ? 0.55 + 0.35 * depth : 0.14 + 0.26 * depth;
        curve(a, c, b, NODE_RGB[pair.a], NODE_RGB[pair.b], alpha, alpha, hot ? 1.3 : 0.85, !hot, time);

        const count = hot ? 2 : 1;
        for (let j = 0; j < count; j++) {
          const u = reduce ? 0.5 : (time * (hot ? 0.32 : 0.16) + j / count + pair.a * 0.13 + pair.b * 0.07) % 1;
          const p = quad(a, c, b, u);
          dot(p.x, p.y, (hot ? 1.6 : 1.1) * ((a.s + b.s) / 2), NODE_RGB[pair.b], (hot ? 0.9 : 0.25 + 0.35 * depth) * Math.sin(u * Math.PI));
        }

        if (pulse) {
          const scale = (a.s + b.s) / 2;
          if (pulse.source === -1 && e >= 1 && e <= 1.5) {
            // Relay: each node pushes the pulse along its links; the two waves meet halfway.
            const u = (e - 1) / 1;
            comet(a, c, b, u, NODE_RGB[pair.a], scale, 1);
            comet(b, c, a, u, NODE_RGB[pair.b], scale, 1);
          } else if (pulse.source !== -1 && e >= 0 && e <= 1 && (pair.a === pulse.source || pair.b === pulse.source)) {
            const from = pair.a === pulse.source ? a : b;
            const to = pair.a === pulse.source ? b : a;
            comet(from, c, to, e, NODE_RGB[pulse.source], scale, 1);
          }
        }
      }

      // Area ↔ core strands.
      for (const strand of CORE_STRANDS) {
        const n = nodes[strand.node];
        const c = project(strand.control);
        const depth = front(n);
        const hot = lit(strand.node);
        const rgb = NODE_RGB[strand.node];
        const alpha = hot ? (strand.k === 0 ? 0.95 : 0.6) : (strand.k === 0 ? 0.2 : 0.1) + 0.26 * depth;
        curve(core, c, n, CORE_RGB, rgb, alpha, alpha * 0.6, hot && strand.k === 0 ? 1.8 : hot ? 1.1 : 0.7, !hot && strand.k !== 0, time);

        // Data flows both ways: odd strands carry the core's answer back out to the area.
        const inbound = strand.k !== 1;
        const speed = hot ? 0.5 : 0.24;
        const count = hot ? 2 : 1;
        for (let j = 0; j < count; j++) {
          const raw = reduce ? 0.5 : (time * speed + j / count + strand.node * 0.19 + strand.k * 0.31) % 1;
          const u = inbound ? 1 - raw : raw;
          const p = quad(core, c, n, u);
          dot(p.x, p.y, (hot ? 1.8 : 1.2) * n.s, inbound ? rgb : CORE_RGB, (hot ? 1 : 0.3 + 0.4 * depth) * Math.sin(raw * Math.PI));
        }

        if (pulse) {
          if (pulse.source === -1 && e >= 0 && e <= 1) {
            comet(core, c, n, e, CORE_RGB, n.s, 1);
          } else if (pulse.source === strand.node && e >= 0 && e <= 1) {
            comet(n, c, core, e, rgb, n.s, 1);
          } else if (pulse.source !== -1 && pulse.source !== strand.node && e >= 1 && e <= 2) {
            comet(core, c, n, e - 1, CORE_RGB, n.s, 1);
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        const f = front(p);
        const flash = nodeFlash(i);
        const radius = (34 + 26 * flash) * p.s;
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        halo.addColorStop(0, `rgba(${NODE_RGB[i]}, ${Math.min(0.85, (lit(i) ? 0.34 : 0.1 + 0.12 * f) + 0.5 * flash)})`);
        halo.addColorStop(1, `rgba(${NODE_RGB[i]}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, TAU);
        ctx.fill();

        const el = buttonRefs.current[i];
        if (el) {
          const scale = (compact ? 0.7 + 0.26 * f : 0.8 + 0.3 * f) * (1 + 0.06 * flash);
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${scale})`;
          el.style.opacity = String(Math.min(1, 0.58 + 0.42 * f + flash));
          el.style.zIndex = p.z > 0 ? "30" : "10";
        }
      }
    };

    let raf = 0;
    let last = 0; // set by start() before the first frame
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const rot = rotRef.current;

      if (!dragRef.current.active) {
        if (rot.target !== null) {
          rot.value += (rot.target - rot.value) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
          if (Math.abs(rot.target - rot.value) < 0.0005) {
            rot.value = rot.target;
            rot.target = null;
          }
        } else if (Math.abs(rot.velocity) > 0.02) {
          rot.value += rot.velocity * dt;
          rot.velocity *= Math.exp(-dt * 3.2);
        } else if (!reduce && !hoverRef.current && now > focusUntilRef.current) {
          rot.velocity = 0;
          rot.value += AUTO_SPEED * dt;
        }
      }

      // While idle, an area occasionally pings the network on its own.
      if (!reduce && !pulseRef.current && now - lastPulseRef.current > AMBIENT_PULSE_MS) {
        pulseRef.current = { source: Math.floor(Math.random() * NODES.length), start: now };
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
      lastPulseRef.current = last - AMBIENT_PULSE_MS + 1200;
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
  }, [reduce]);

  function handleCanvasDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    drag.active = true;
    drag.startX = event.clientX;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
    drag.velocity = 0;
    rotRef.current.target = null;
    rotRef.current.velocity = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCanvasMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const now = event.timeStamp;
    const delta = (event.clientX - drag.lastX) * DRAG_GAIN;
    rotRef.current.value += delta;
    drag.velocity = delta / Math.max(0.008, (now - drag.lastT) / 1000);
    drag.lastX = event.clientX;
    drag.lastT = now;
  }

  function handleCanvasUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (Math.abs(event.clientX - drag.startX) < TAP_SLOP_PX) {
      // A tap on the scene (not a drag) wakes the whole network from the core.
      firePulse(-1, event.timeStamp);
      return;
    }
    rotRef.current.velocity = reduce ? 0 : Math.max(-4, Math.min(4, drag.velocity));
    focusUntilRef.current = event.timeStamp + 2500;
  }

  function handleStageMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.target = baseTiltRef.current - ny * 0.22;
  }

  const activeNode = NODES[active];

  return (
    <div className="systems-map relative mx-auto w-full max-w-xl">
      <div
        ref={stageRef}
        className="relative h-[340px] select-none sm:h-[400px]"
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
          aria-label="Activar la red: el núcleo iA envía una señal a todas las áreas"
          className="focus-ring group absolute left-1/2 top-1/2 z-20 flex h-[4.4rem] w-[4.4rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-cyan/55 bg-background-elevated/90 shadow-[0_0_42px_-6px_rgba(56,211,255,.5)] transition-[box-shadow,border-color] duration-200 sm:h-[5.5rem] sm:w-[5.5rem] [@media(hover:hover)_and_(pointer:fine)]:hover:border-cyan [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_56px_-4px_rgba(56,211,255,.75)]"
        >
          <span className="font-display text-xl font-semibold text-foreground">iA</span>
          <span className="text-[9px] uppercase tracking-[.2em] text-cyan">nom.pe</span>
        </button>

        {NODES.map((node, i) => {
          const isActive = active === i;
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
              className={cn(
                "focus-ring absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-left opacity-0 transition-[border-color,color,background-color,box-shadow] duration-200 sm:gap-2 sm:px-3 sm:py-2",
                isActive
                  ? "border-cyan/60 bg-background-elevated text-cyan shadow-[0_0_26px_-8px_rgba(56,211,255,.6)]"
                  : "border-border bg-background-elevated/90 text-muted hover:border-cyan/35 hover:text-foreground",
              )}
            >
              <Icon name={node.icon} className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="text-[11px] font-medium leading-tight sm:text-xs">{node.title}</span>
            </button>
          );
        })}
      </div>

      <div className="systems-map-readout mt-3 flex min-h-[84px] items-start gap-3 rounded-xl border border-cyan/15 bg-cyan/[0.035] p-4" aria-live="polite">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
          <Icon name={activeNode.icon} className="h-4 w-4" />
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeNode.title}
            className="min-w-0"
            initial={{ opacity: 0, transform: reduce ? "none" : "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-4px)" }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="font-display text-sm font-semibold text-foreground">
              {activeNode.title}
              <span className="ml-2 font-mono text-[9px] font-normal tracking-[.15em] text-cyan">/ NODO ACTIVO</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {activeNode.description} Toca el núcleo iA para activar la red, elige un área o arrastra para girar.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
