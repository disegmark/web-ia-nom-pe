"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useId } from "react";

const GRADIENT_ID = "network-art-gradient";

/** Spread onto a motion.line/motion.path stroke to give the gradient connection lines a permanent, staggered pulse. */
function linePulse(baseOpacity: number, index: number, reduce: boolean | null) {
  if (reduce) {
    return { opacity: baseOpacity };
  }
  return {
    initial: { opacity: baseOpacity },
    animate: { opacity: [baseOpacity, baseOpacity * 0.45, baseOpacity] },
    transition: {
      duration: 2.6,
      delay: index * 0.15,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };
}

function Defs() {
  return (
    <defs>
      <linearGradient id={GRADIENT_ID} x1="0" y1="320" x2="320" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#2f5dfa" />
        <stop offset="1" stopColor="#38d3ff" />
      </linearGradient>
    </defs>
  );
}

function Agents() {
  const reduce = useReducedMotion();
  const center = { x: 160, y: 160 };
  const count = 7;
  const satellites = Array.from({ length: count }, (_, i) => {
    const angle = (-90 + (i * 360) / count) * (Math.PI / 180);
    const r = 120;
    return {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
      key: i,
    };
  });

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      <motion.circle
        cx={center.x}
        cy={center.y}
        r="120"
        stroke="currentColor"
        className="text-border"
        strokeDasharray="2 8"
        strokeWidth="1"
        {...linePulse(0.6, satellites.length, reduce)}
      />
      {satellites.map((s) => (
        <g key={`signal-${s.key}`}>
          <motion.line
            x1={center.x}
            y1={center.y}
            x2={s.x}
            y2={s.y}
            stroke={`url(#${GRADIENT_ID})`}
            strokeWidth="1.5"
            {...linePulse(0.5, s.key, reduce)}
          />
          {!reduce && (
            <circle r="3" fill="#38d3ff" filter="drop-shadow(0 0 4px #38d3ff)">
              <animateMotion
                path={`M ${center.x} ${center.y} L ${s.x} ${s.y}`}
                dur={`${1.8 + s.key * 0.18}s`}
                begin={`${s.key * 0.22}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      ))}
      {satellites.map((s) => (
        <circle
          key={`node-${s.key}`}
          cx={s.x}
          cy={s.y}
          r={s.key % 2 === 0 ? 10 : 7}
          fill={s.key % 2 === 0 ? "#38d3ff" : "#f4f6fb"}
        />
      ))}
      <circle cx={center.x} cy={center.y} r="26" fill={`url(#${GRADIENT_ID})`} className="animate-pulse-glow" />
      <circle cx={center.x} cy={center.y} r="26" stroke="#05070f" strokeWidth="3" fill="none" />
    </svg>
  );
}

function Automation() {
  const reduce = useReducedMotion();
  const nodes = [
    { x: 40, y: 230 },
    { x: 120, y: 150 },
    { x: 200, y: 210 },
    { x: 280, y: 120 },
  ];

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      <motion.path
        d={`M${nodes[0].x} ${nodes[0].y} Q ${(nodes[0].x + nodes[1].x) / 2} ${nodes[0].y} ${nodes[1].x} ${nodes[1].y}
            Q ${(nodes[1].x + nodes[2].x) / 2} ${nodes[1].y} ${nodes[2].x} ${nodes[2].y}
            Q ${(nodes[2].x + nodes[3].x) / 2} ${nodes[2].y} ${nodes[3].x} ${nodes[3].y}`}
        stroke={`url(#${GRADIENT_ID})`}
        strokeWidth="2"
        {...linePulse(0.6, 0, reduce)}
      />
      <motion.path
        d={`M${nodes[3].x} ${nodes[3].y} C 320 40, 40 40, ${nodes[0].x - 8} ${nodes[0].y - 24}`}
        stroke="currentColor"
        className="text-border"
        strokeWidth="1.5"
        strokeDasharray="3 7"
        {...linePulse(0.7, 1, reduce)}
      />
      <motion.path
        d={`M${nodes[0].x - 14} ${nodes[0].y - 30} L${nodes[0].x - 8} ${nodes[0].y - 24} L${nodes[0].x - 18} ${nodes[0].y - 18}`}
        stroke="currentColor"
        className="text-border"
        strokeWidth="1.5"
        fill="none"
        {...linePulse(0.7, 2, reduce)}
      />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="16" fill="#0a0e1c" stroke={`url(#${GRADIENT_ID})`} strokeWidth="2" />
          <circle cx={n.x} cy={n.y} r="5" fill={i === nodes.length - 1 ? "#38d3ff" : "#f4f6fb"} />
          {!reduce && (
            <circle r="3" fill="#38d3ff" filter="drop-shadow(0 0 4px #38d3ff)">
              <animateMotion
                path={`M ${nodes[0].x} ${nodes[0].y} Q ${(nodes[0].x + nodes[1].x) / 2} ${nodes[0].y} ${nodes[1].x} ${nodes[1].y} Q ${(nodes[1].x + nodes[2].x) / 2} ${nodes[1].y} ${nodes[2].x} ${nodes[2].y} Q ${(nodes[2].x + nodes[3].x) / 2} ${nodes[2].y} ${nodes[3].x} ${nodes[3].y}`}
                dur="4s"
                begin={`${i * 0.7}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      ))}
    </svg>
  );
}

function Integrations() {
  const reduce = useReducedMotion();
  const center = { x: 160, y: 160 };
  const inner = [30, 150, 270].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: center.x + 68 * Math.cos(a), y: center.y + 68 * Math.sin(a) };
  });
  const outer = [90, 210, 330].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: center.x + 122 * Math.cos(a), y: center.y + 122 * Math.sin(a) };
  });

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      <motion.circle cx={center.x} cy={center.y} r="68" stroke="currentColor" className="text-border" strokeDasharray="2 6" {...linePulse(0.6, 6, reduce)} />
      <motion.circle cx={center.x} cy={center.y} r="122" stroke="currentColor" className="text-border" strokeDasharray="2 6" {...linePulse(0.6, 7, reduce)} />
      {[...inner, ...outer].map((s, i) => (
        <motion.line key={i} x1={center.x} y1={center.y} x2={s.x} y2={s.y} stroke={`url(#${GRADIENT_ID})`} strokeWidth="1.2" {...linePulse(0.4, i, reduce)} />
      ))}
      {inner.map((s, i) => (
        <circle key={`i-${i}`} cx={s.x} cy={s.y} r="9" fill="#f4f6fb" />
      ))}
      {outer.map((s, i) => (
        <circle key={`o-${i}`} cx={s.x} cy={s.y} r="11" fill="#2f5dfa" />
      ))}
      <circle cx={center.x} cy={center.y} r="24" fill={`url(#${GRADIENT_ID})`} />
      <path d="M150 160h20M160 150v20" stroke="#05070f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Knowledge() {
  const reduce = useReducedMotion();
  const docs = [60, 130, 200, 270];
  const core = { x: 250, y: 165 };

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      {docs.map((y, i) => (
        <g key={i}>
          <motion.path
            d={`M50 ${y} Q 150 ${(y + core.y) / 2} ${core.x - 20} ${core.y}`}
            stroke={`url(#${GRADIENT_ID})`}
            strokeWidth="1.2"
            {...linePulse(0.4, i, reduce)}
          />
          <rect x="26" y={y - 24} width="48" height="60" rx="6" fill="#0a0e1c" stroke="currentColor" className="text-border" />
          <motion.line x1="36" y1={y - 8} x2="66" y2={y - 8} stroke="#f4f6fb" strokeWidth="2" {...linePulse(0.6, i * 3, reduce)} />
          <motion.line x1="36" y1={y + 4} x2="60" y2={y + 4} stroke="#f4f6fb" strokeWidth="2" {...linePulse(0.4, i * 3 + 1, reduce)} />
          <motion.line x1="36" y1={y + 16} x2="66" y2={y + 16} stroke="#f4f6fb" strokeWidth="2" {...linePulse(0.4, i * 3 + 2, reduce)} />
        </g>
      ))}
      <circle cx={core.x} cy={core.y} r="34" fill={`url(#${GRADIENT_ID})`} className="animate-pulse-glow" />
      <circle cx={core.x} cy={core.y} r="34" stroke="#05070f" strokeWidth="3" fill="none" />
    </svg>
  );
}

function Solutions() {
  const reduce = useReducedMotion();
  const layers = [
    { x: 40, y: 210, w: 200, h: 64 },
    { x: 66, y: 170, w: 200, h: 64 },
    { x: 92, y: 130, w: 200, h: 64 },
  ];

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      {layers.map((layer, i) => (
        <g key={i}>
          <rect
            x={layer.x}
            y={layer.y}
            width={layer.w}
            height={layer.h}
            rx="12"
            fill="#0a0e1c"
            stroke={i === layers.length - 1 ? `url(#${GRADIENT_ID})` : "currentColor"}
            className={i === layers.length - 1 ? undefined : "text-border"}
            strokeWidth={i === layers.length - 1 ? 2 : 1}
          />
          <circle cx={layer.x + 24} cy={layer.y + layer.h / 2} r="5" fill={i === layers.length - 1 ? "#38d3ff" : "#f4f6fb"} opacity={i === layers.length - 1 ? 1 : 0.5} />
          <motion.line
            x1={layer.x + 44}
            y1={layer.y + layer.h / 2}
            x2={layer.x + layer.w - 24}
            y2={layer.y + layer.h / 2}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
            {...linePulse(0.5, i, reduce)}
          />
        </g>
      ))}
    </svg>
  );
}

function Industries() {
  const reduce = useReducedMotion();
  const points = [
    { x: 60, y: 80 }, { x: 140, y: 60 }, { x: 230, y: 90 }, { x: 280, y: 160 },
    { x: 220, y: 230 }, { x: 130, y: 250 }, { x: 60, y: 190 }, { x: 160, y: 160 },
  ];
  const edges: Array<[number, number]> = [[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [0, 1], [2, 3], [4, 5], [6, 0]];

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      {edges.map(([a, b], i) => (
        <motion.line key={i} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} stroke={`url(#${GRADIENT_ID})`} strokeWidth="1" {...linePulse(0.35, i, reduce)} />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === 7 ? 14 : 8} fill={i === 7 ? "#38d3ff" : i % 2 === 0 ? "#2f5dfa" : "#f4f6fb"} />
      ))}
    </svg>
  );
}

function Services() {
  const reduce = useReducedMotion();
  const center = { x: 160, y: 160 };
  const count = 5;
  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = (-90 + (i * 360) / count) * (Math.PI / 180);
    const r = 118;
    return { x: center.x + r * Math.cos(angle), y: center.y + r * Math.sin(angle), key: i };
  });
  const ring = nodes.map((n) => `${n.x} ${n.y}`).join(" L ");

  return (
    <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <Defs />
      <motion.path
        d={`M ${ring} Z`}
        stroke="currentColor"
        className="text-border"
        strokeWidth="1"
        strokeDasharray="2 7"
        {...linePulse(0.6, nodes.length, reduce)}
      />
      {nodes.map((n) => (
        <motion.line
          key={`spoke-${n.key}`}
          x1={center.x}
          y1={center.y}
          x2={n.x}
          y2={n.y}
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="1.5"
          {...linePulse(0.5, n.key, reduce)}
        />
      ))}
      {nodes.map((n) => (
        <circle
          key={`node-${n.key}`}
          cx={n.x}
          cy={n.y}
          r={n.key === 0 ? 11 : 8}
          fill={n.key === 0 ? "#38d3ff" : "#f4f6fb"}
        />
      ))}
      <circle cx={center.x} cy={center.y} r="28" fill={`url(#${GRADIENT_ID})`} className="animate-pulse-glow" />
      <circle cx={center.x} cy={center.y} r="28" stroke="#05070f" strokeWidth="3" fill="none" />
    </svg>
  );
}

const VARIANTS = {
  agents: Agents,
  automation: Automation,
  integrations: Integrations,
  knowledge: Knowledge,
  solutions: Solutions,
  industries: Industries,
  services: Services,
};

export type NetworkArtVariant = keyof typeof VARIANTS;

export function NetworkArt({ variant, className }: { variant: NetworkArtVariant; className?: string }) {
  const Component = VARIANTS[variant];
  const reduce = useReducedMotion();
  const sceneId = useId().replace(/:/g, "");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(pointerX, { stiffness: 90, damping: 18, mass: 0.6 });
  const rotateX = useSpring(pointerY, { stiffness: 90, damping: 18, mass: 0.6 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointerX.set(x * 22);
    pointerY.set(y * -18);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
      style={{ perspective: "1100px", touchAction: "pan-y" }}
    >
      <motion.div
        data-scene={sceneId}
        className="relative isolate mx-auto"
        style={{
          transformStyle: "preserve-3d",
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          willChange: reduce ? "auto" : "transform",
        }}
      >
        {/* Deep volumetric light behind the network */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[4%] -z-20 rounded-full"
          style={{
            transform: "translateZ(-90px)",
            background: "radial-gradient(ellipse at 50% 45%, rgba(56,211,255,.22), rgba(47,93,250,.12) 34%, transparent 70%)",
            filter: "blur(24px)",
          }}
          animate={reduce ? undefined : { opacity: [0.35, 0.9, 0.35], scale: [0.88, 1.12, 0.88] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Two holographic orbital planes, moving at different speeds */}
        {!reduce && (
          <>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[7%] rounded-[50%] border border-cyan/25"
              style={{
                transform: "translateZ(-35px) rotateX(66deg) rotateZ(-18deg)",
                boxShadow: "0 0 26px rgba(56,211,255,.12), inset 0 0 22px rgba(47,93,250,.08)",
              }}
              animate={{ rotateZ: [-18, 18, -18], scale: [0.92, 1.06, 0.92], opacity: [0.25, 0.8, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[15%] rounded-[50%] border border-blue-400/20"
              style={{ transform: "translateZ(42px) rotateX(72deg) rotateZ(26deg)" }}
              animate={{ rotateZ: [26, -26, 26], scale: [1.08, 0.9, 1.08], opacity: [0.15, 0.65, 0.15] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            {Array.from({ length: 10 }, (_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const radius = 76 + (i % 3) * 10;
              return (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-cyan"
                  style={{
                    boxShadow: "0 0 13px 3px rgba(56,211,255,.72)",
                    translateZ: i % 2 === 0 ? 46 : -24,
                  }}
                  animate={{
                    x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI) * radius, Math.cos(angle) * radius],
                    y: [Math.sin(angle) * radius * 0.68, Math.sin(angle + Math.PI) * radius * 0.68, Math.sin(angle) * radius * 0.68],
                    opacity: [0.08, 1, 0.08],
                    scale: [0.45, i % 3 === 0 ? 1.8 : 1.2, 0.45],
                  }}
                  transition={{ duration: 3.4 + (i % 4) * 0.65, repeat: Infinity, ease: "easeInOut", delay: i * 0.19 }}
                />
              );
            })}
          </>
        )}

        {/* Main diagram floats independently from the orbital planes */}
        <motion.div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(28px)",
            filter: "drop-shadow(0 22px 28px rgba(10,35,100,.32))",
          }}
          animate={reduce ? undefined : { y: [0, -8, 0, 5, 0], scale: [1, 1.025, 1, 1.012, 1] }}
          transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Component />
        </motion.div>

        {/* A luminous scanner sweeps through the scene like an active interface */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[8%] overflow-hidden rounded-[48%]"
            style={{ transform: "translateZ(58px)", maskImage: "radial-gradient(ellipse, black 35%, transparent 72%)" }}
          >
            <motion.div
              className="absolute inset-x-0 h-[2px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(56,211,255,.95), rgba(91,139,255,.7), transparent)", boxShadow: "0 0 18px 4px rgba(56,211,255,.35)" }}
              animate={{ top: ["8%", "92%", "8%"], opacity: [0, 0.9, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[3%] rounded-full"
          style={{
            transform: "translateZ(-55px)",
            background: "radial-gradient(circle, rgba(56,211,255,.10) 0%, rgba(47,93,250,.06) 38%, transparent 72%)",
          }}
          animate={reduce ? undefined : { opacity: [0.25, 0.75, 0.25], scale: [0.9, 1.13, 0.9] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
