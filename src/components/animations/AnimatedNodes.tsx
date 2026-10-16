"use client";

import { motion, useReducedMotion } from "framer-motion";

const NODES = [
  { x: 60, y: 40 },
  { x: 220, y: 90 },
  { x: 340, y: 30 },
  { x: 420, y: 140 },
  { x: 120, y: 160 },
  { x: 300, y: 210 },
  { x: 60, y: 260 },
  { x: 400, y: 260 },
];

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [4, 5],
  [4, 6],
  [3, 5],
  [5, 7],
];

/** Decorative connected-nodes backdrop — evokes "inteligencia conectándose" behind section content. Purely presentational. */
export function AnimatedNodes({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 460 300"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {EDGES.map(([a, b], index) => (
        <motion.line
          key={`${a}-${b}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#nodes-gradient)"
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={
            shouldReduceMotion
              ? { pathLength: 1, opacity: 0.5 }
              : { pathLength: 1, opacity: [0, 0.65, 0.3, 0.65, 0.3] }
          }
          viewport={{ once: true }}
          transition={
            shouldReduceMotion
              ? { duration: 0.3, delay: 0, ease: "easeOut" }
              : {
                  pathLength: { duration: 1.2, delay: index * 0.08, ease: "easeOut" },
                  opacity: {
                    duration: 3.2,
                    delay: index * 0.08,
                    times: [0, 0.15, 0.5, 0.85, 1],
                    repeat: Infinity,
                    repeatDelay: 0.4,
                    ease: "easeInOut",
                  },
                }
          }
        />
      ))}
      {!shouldReduceMotion &&
        EDGES.map(([a, b], index) => (
          <motion.circle
            key={`pulse-${a}-${b}`}
            r={1.8}
            fill="#a8e9ff"
            initial={{ cx: NODES[a].x, cy: NODES[a].y, opacity: 0 }}
            animate={{
              cx: [NODES[a].x, NODES[b].x],
              cy: [NODES[a].y, NODES[b].y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.8,
              delay: 1.2 + index * 0.35,
              times: [0, 0.15, 0.85, 1],
              repeat: Infinity,
              repeatDelay: EDGES.length * 0.35,
              ease: "linear",
            }}
          />
        ))}
      {NODES.map((node, index) => (
        <motion.circle
          key={`${node.x}-${node.y}`}
          cx={node.x}
          cy={node.y}
          r={index % 3 === 0 ? 4 : 2.5}
          fill={index % 3 === 0 ? "#38d3ff" : "#5b8bff"}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true }}
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.9, 0.5, 0.9], scale: [1, 1.15, 1] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.2, delay: 0 }
              : {
                  opacity: { duration: 2.4, delay: 1 + index * 0.15, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 2.4, delay: 1 + index * 0.15, repeat: Infinity, ease: "easeInOut" },
                }
          }
        />
      ))}
      <defs>
        <linearGradient id="nodes-gradient" x1="0" y1="0" x2="460" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f5dfa" />
          <stop offset="1" stopColor="#38d3ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
