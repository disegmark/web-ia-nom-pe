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

type Vec3 = { x: number; y: number; z: number };

function rotate(p: Vec3, rotY: number, tilt: number): Vec3 {
  const cr = Math.cos(rotY);
  const sr = Math.sin(rotY);
  const x = p.x * cr + p.z * sr;
  const z = -p.x * sr + p.z * cr;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x, y: p.y * ct - z * st, z: p.y * st + z * ct };
}

function shortestAngle(from: number, to: number) {
  return ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const NODE_RGB = NODE_COLORS.map(hexToRgb);

/** 3D systems map: the iA core with its five connected layers orbiting in real perspective. */
export function WhatWeDoHub() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeRef = useRef(0);
  const rotRef = useRef({ value: THETA[0] - Math.PI / 2, target: null as number | null, velocity: 0 });
  const tiltRef = useRef({ value: BASE_TILT, target: BASE_TILT });
  const baseTiltRef = useRef(BASE_TILT);
  const focusUntilRef = useRef(0);
  const hoverRef = useRef(false);
  const dragRef = useRef({ active: false, lastX: 0, lastT: 0, velocity: 0 });

  // `timeStamp` comes from the triggering event — same clock as performance.now() in the loop.
  function select(index: number, timeStamp: number) {
    setActive(index);
    activeRef.current = index;
    const rot = rotRef.current;
    rot.velocity = 0;
    rot.target = rot.value + shortestAngle(rot.value, THETA[index] - Math.PI / 2);
    focusUntilRef.current = timeStamp + RESUME_AFTER_MS;
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

    const draw = (time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const compact = width < COMPACT_WIDTH;
      const R = Math.min(width * (compact ? 0.33 : 0.4), height * 0.4);
      const cx = width / 2;
      const cy = height / 2;
      const rot = rotRef.current.value;
      const tilt = tiltRef.current.value;
      const project = (p: Vec3, r = rot) => {
        const q = rotate(p, r, tilt);
        const s = FOCAL / (FOCAL - q.z);
        return { x: cx + q.x * R * s, y: cy + q.y * R * s, z: q.z, s };
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

      const pulse = reduce ? 1 : 1 + 0.08 * Math.sin(time * 2.2);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55 * pulse);
      glow.addColorStop(0, "rgba(56, 211, 255, 0.32)");
      glow.addColorStop(0.45, "rgba(47, 93, 250, 0.12)");
      glow.addColorStop(1, "rgba(47, 93, 250, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.55 * pulse, 0, TAU);
      ctx.fill();

      const projected = NODES.map((_, i) => ({
        i,
        p: project({ x: Math.cos(THETA[i]), y: NODE_Y[i], z: Math.sin(THETA[i]) }),
      })).sort((a, b) => a.p.z - b.p.z);

      for (const { i, p } of projected) {
        const isActive = i === activeRef.current;
        const front = Math.max(0, Math.min(1, (p.z + 1) / 2));
        const rgb = NODE_RGB[i];

        const link = ctx.createLinearGradient(cx, cy, p.x, p.y);
        link.addColorStop(0, `rgba(${rgb}, ${isActive ? 0.95 : 0.12 + 0.25 * front})`);
        link.addColorStop(1, `rgba(${rgb}, ${isActive ? 0.55 : 0.05 + 0.15 * front})`);
        ctx.strokeStyle = link;
        ctx.lineWidth = isActive ? 1.8 : 0.9;
        ctx.setLineDash(isActive ? [] : [3, 6]);
        ctx.lineDashOffset = reduce ? 0 : -time * 14;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const count = isActive ? 3 : 1;
        const speed = isActive ? 0.5 : 0.22;
        for (let j = 0; j < count; j++) {
          const u = reduce ? 0.5 : (time * speed + j / count + i * 0.19) % 1;
          const x = p.x + (cx - p.x) * u;
          const y = p.y + (cy - p.y) * u;
          const fade = Math.sin(u * Math.PI);
          const alpha = (isActive ? 1 : 0.35 + 0.4 * front) * fade;
          ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.22})`;
          ctx.beginPath();
          ctx.arc(x, y, (isActive ? 6 : 4) * p.s, 0, TAU);
          ctx.fill();
          ctx.fillStyle = `rgba(230, 250, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, (isActive ? 1.9 : 1.3) * p.s, 0, TAU);
          ctx.fill();
        }

        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34 * p.s);
        halo.addColorStop(0, `rgba(${rgb}, ${isActive ? 0.34 : 0.1 + 0.12 * front})`);
        halo.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 34 * p.s, 0, TAU);
        ctx.fill();

        const el = buttonRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${compact ? 0.7 + 0.26 * front : 0.8 + 0.3 * front})`;
          el.style.opacity = String(0.58 + 0.42 * front);
          el.style.zIndex = p.z > 0 ? "30" : "10";
        }
      }
    };

    let raf = 0;
    let last = performance.now();
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

      const tiltState = tiltRef.current;
      tiltState.value += (tiltState.target - tiltState.value) * (1 - Math.exp(-dt * 4));

      draw(now / 1000);
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
    draw(performance.now() / 1000);

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
        className="relative h-[320px] select-none sm:h-[380px]"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hoverRef.current = true;
        }}
        onPointerLeave={() => {
          hoverRef.current = false;
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

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-[4.4rem] w-[4.4rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-cyan/55 bg-background-elevated/90 shadow-[0_0_42px_-6px_rgba(56,211,255,.5)] sm:h-[5.5rem] sm:w-[5.5rem]">
          <span className="font-display text-xl font-semibold text-foreground">iA</span>
          <span className="text-[9px] uppercase tracking-[.2em] text-cyan">nom.pe</span>
        </div>

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
              aria-pressed={isActive}
              aria-label={`${node.title}: ${node.description}`}
              className={cn(
                "focus-ring absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-left opacity-0 sm:gap-2 sm:px-3 sm:py-2 transition-[border-color,color,background-color,box-shadow] duration-200",
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
              {activeNode.description} Selecciona un nodo o arrastra el sistema para girarlo en 3D.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
