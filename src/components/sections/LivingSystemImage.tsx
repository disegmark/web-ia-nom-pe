"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

import { SYSTEM_PRESET, type ImagePreset } from "@/data/living-image";

const CYCLE_MS = 4200;
const HOLD_MS = 10000;

/** Illustration of the connected system, made interactive: tilt + parallax, cursor light, pulsing hotspots with a readout. */
export function LivingSystemImage({ className, preset = SYSTEM_PRESET }: { className?: string; preset?: ImagePreset }) {
  const { spots: SPOTS, core: CORE } = preset;
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { margin: "-10% 0px" });
  const [active, setActive] = useState(0);
  const holdUntil = useRef(0);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 90, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 90, damping: 18 });
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 20 });
  const sy = useSpring(py, { stiffness: 70, damping: 20 });
  const imgX = useTransform(sx, (v) => v * -5);
  const imgY = useTransform(sy, (v) => v * -4);
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const light = useMotionTemplate`radial-gradient(360px circle at ${lightX}% ${lightY}%, rgba(56, 211, 255, 0.22), transparent 62%)`;
  const lightTarget = useMotionValue(0);
  const lightOpacity = useSpring(lightTarget, { stiffness: 120, damping: 20 });

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => {
      if (performance.now() < holdUntil.current) return;
      setActive((i) => (i + 1) % SPOTS.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduce, inView, SPOTS.length]);

  function handleMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const r = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - r.left) / r.width;
    const ny = (event.clientY - r.top) / r.height;
    tiltY.set((nx - 0.5) * 7);
    tiltX.set(-(ny - 0.5) * 5);
    px.set(nx - 0.5);
    py.set(ny - 0.5);
    lightX.set(nx * 100);
    lightY.set(ny * 100);
    lightTarget.set(1);
  }

  function handleLeave() {
    tiltX.set(0);
    tiltY.set(0);
    px.set(0);
    py.set(0);
    lightTarget.set(0);
  }

  function choose(i: number, timeStamp: number) {
    holdUntil.current = timeStamp + HOLD_MS;
    setActive(i);
  }

  const spot = SPOTS[active];

  return (
    <div className={cn("[perspective:1400px]", className)}>
      <motion.div
        ref={frameRef}
        initial={reduce ? false : { opacity: 0, transform: "scale(0.96)" }}
        whileInView={{ opacity: 1, transform: "scale(1)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-[28px] bg-background-elevated shadow-[0_40px_90px_-40px_rgba(56,211,255,0.4),0_0_0_1px_rgba(56,211,255,0.14)]"
      >
        <div className="relative w-full" style={{ aspectRatio: `${preset.width} / ${preset.height}` }}>
          <motion.div className="absolute inset-0 scale-[1.025]" style={{ x: reduce ? 0 : imgX, y: reduce ? 0 : imgY }}>
            <Image
              src={preset.src}
              alt={preset.alt}
              width={preset.width}
              height={preset.height}
              sizes={preset.sizes}
              quality={82}
              className="h-full w-full object-cover"
            />
          </motion.div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(5,7,15,0.55)]" />

          {/* Energy rings around the core and pulses on the hotspots. */}
          {reduce ? null : (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {CORE ? [0, 1, 2].map((n) => (
                <span
                  key={n}
                  className="core-pulse absolute rounded-full border border-cyan/60"
                  style={{ left: `${CORE.x}%`, top: `${CORE.y}%`, width: "34%", aspectRatio: "1", animationDelay: `${n * 1.3}s` } as CSSProperties}
                />
              )) : null}
              <span className="photo-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-cyan/15 to-transparent" />
              <motion.div className="absolute inset-0" style={{ background: light, opacity: lightOpacity }} />
            </div>
          )}

          {SPOTS.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.key}
                type="button"
                onClick={(event) => choose(i, event.timeStamp)}
                onFocus={(event) => choose(i, event.timeStamp)}
                aria-label={`${s.title}. ${s.copy}`}
                aria-pressed={on}
                className="focus-ring group absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                style={{ left: `${s.x}%`, top: `${s.y}%`, "--c": s.color } as CSSProperties}
              >
                <span
                  className={cn(
                    "absolute h-full w-full rounded-full border-2 transition-[transform,opacity] duration-300",
                    on ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:scale-75 group-hover:opacity-70",
                  )}
                  style={{ borderColor: s.color, boxShadow: `0 0 18px ${s.color}` }}
                />
                {on && !reduce ? <span className="hotspot-ping absolute h-5 w-5 rounded-full" style={{ background: s.color }} /> : null}
                <span className="relative h-3 w-3 rounded-full ring-2 ring-white/80" style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
              </button>
            );
          })}

        </div>
      </motion.div>
    <div className="mt-4" aria-live="polite">
      <motion.div
        key={spot.key}
        initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="plate max-w-none px-4 py-3"
        style={{ borderColor: `${spot.color}66` }}
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: spot.color, boxShadow: `0 0 10px ${spot.color}` }} aria-hidden="true" />
          {spot.title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{spot.copy}</p>
      </motion.div>
    </div>
    </div>
  );
}
