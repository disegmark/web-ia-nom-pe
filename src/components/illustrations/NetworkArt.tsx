"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const sceneMotion = reduce
    ? {}
    : {
        animate: {
          rotateX: [0, 3.5, 0, -3.5, 0],
          rotateY: [0, -5, 0, 5, 0],
          rotateZ: [0, 0.8, 0, -0.8, 0],
          y: [0, -7, 0, 5, 0],
          scale: [1, 1.025, 1, 1.015, 1],
        },
        transition: { duration: 11, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div className={className}>
      <motion.div
        {...sceneMotion}
        data-scene={sceneId}
        style={{ perspective: 1000, transformStyle: "preserve-3d", willChange: reduce ? "auto" : "transform" }}
        className="relative isolate mx-auto"
      >
        <div
          className="pointer-events-none absolute inset-[12%] -z-10 rounded-full bg-cyan/10 blur-3xl"
          style={{ transform: "translateZ(-36px) scale(1.15)" }}
          aria-hidden="true"
        />
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d", filter: "drop-shadow(0 18px 22px rgba(10,35,100,.22))" }}
          animate={reduce ? undefined : { z: [0, 14, 0, -5, 0] }}
          transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <Component />
        </motion.div>
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[8%] rounded-full border border-cyan/10"
            style={{ transform: "translateZ(-18px) rotateX(68deg) rotateZ(-12deg)" }}
            animate={{ rotateZ: [-12, 12, -12], scale: [0.96, 1.04, 0.96], opacity: [0.25, 0.65, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </div>
  );
}
