"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { IconItem } from "@/types";

const GRADIENT_ID = "radial-diagram-gradient";

type RadialDiagramProps = {
  centerLabel: string;
  centerIcon: IconItem["icon"];
  nodes: IconItem[];
  className?: string;
};

/** Circular hub with animated signal paths and interactive capability nodes. */
export function RadialDiagram({ centerLabel, centerIcon, nodes, className }: RadialDiagramProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const gradientId = `${GRADIENT_ID}-${useId().replace(/:/g, "")}`;
  const active = nodes[activeIndex];

  const positions = nodes.map((_, i) => {
    const angle = (-90 + (i * 360) / nodes.length) * (Math.PI / 180);
    const radius = 40;
    return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
  });

  return (
    <div className={className}>
      <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2f5dfa" />
              <stop offset="1" stopColor="#38d3ff" />
            </linearGradient>
          </defs>
          {positions.map((pos, i) => (
            <g key={nodes[i].title}>
              <motion.line
                x1={50} y1={50} x2={pos.x} y2={pos.y}
                stroke={i === activeIndex ? `url(#${gradientId})` : "currentColor"}
                className={i === activeIndex ? undefined : "text-border"}
                strokeWidth={i === activeIndex ? 1 : 0.45}
                initial={false}
                animate={{ opacity: i === activeIndex ? 1 : 0.28, pathLength: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.45 }}
              />
              {!reduceMotion && (
                <motion.circle
                  r={i === activeIndex ? 1.15 : 0.65}
                  fill="#38d3ff"
                  style={{ offsetPath: `path("M 50 50 L ${pos.x} ${pos.y}")` }}
                  animate={{ offsetDistance: ["0%", "100%"], opacity: [0, i === activeIndex ? 1 : 0.45, 0] }}
                  transition={{ duration: i === activeIndex ? 1.65 : 2.6, repeat: Infinity, ease: "linear", delay: i * 0.11 }}
                />
              )}
            </g>
          ))}
        </svg>

        <motion.div
          animate={reduceMotion ? undefined : { scale: [1, 1.045, 1], boxShadow: ["0 0 18px -8px rgba(56,211,255,0.18)", "0 0 38px -4px rgba(56,211,255,0.45)", "0 0 18px -8px rgba(56,211,255,0.18)"] }}
          transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-cyan/50 bg-background-elevated text-center"
        >
          <Icon name={centerIcon} className="h-7 w-7 text-cyan" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">{centerLabel}</span>
        </motion.div>

        {nodes.map((node, i) => {
          const pos = positions[i];
          const isActive = i === activeIndex;
          return (
            <motion.button
              key={node.title}
              type="button"
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              aria-pressed={isActive}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              whileHover={reduceMotion ? undefined : { scale: 1.08 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              className="focus-ring absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
            >
              <motion.span
                animate={isActive && !reduceMotion ? { boxShadow: ["0 0 0 0 rgba(56,211,255,0.05)", "0 0 20px 3px rgba(56,211,255,0.38)", "0 0 0 0 rgba(56,211,255,0.05)"] } : { boxShadow: "0 0 0 0 rgba(56,211,255,0)" }}
                transition={{ duration: 1.8, repeat: isActive && !reduceMotion ? Infinity : 0 }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200",
                  isActive ? "border-cyan bg-primary/20 text-cyan" : "border-border bg-background text-muted hover:border-cyan/40 hover:text-cyan",
                )}
              >
                <Icon name={node.icon} className="h-5 w-5" />
              </motion.span>
              <span className={cn("text-xs leading-tight", isActive ? "font-medium text-foreground" : "text-muted")}>{node.title}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mx-auto mt-6 hidden max-w-md text-center lg:block" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={active.title}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10, filter: reduceMotion ? "none" : "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8, filter: reduceMotion ? "none" : "blur(3px)" }}
            transition={{ duration: reduceMotion ? 0.12 : 0.3 }}
            className="text-sm leading-relaxed text-muted"
          >
            <span className="font-medium text-cyan">{active.title}:</span> {active.description}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="lg:hidden">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-cyan/40 bg-background-elevated px-4 py-2">
          <Icon name={centerIcon} className="h-5 w-5 text-cyan" />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{centerLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {nodes.map((node, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.button
                key={node.title}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-pressed={isActive}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className={cn("focus-ring flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors", isActive ? "border-cyan/60 bg-primary/10" : "border-border bg-background-elevated")}
              >
                <Icon name={node.icon} className={cn("h-5 w-5", isActive ? "text-cyan" : "text-muted")} />
                <span className="text-xs leading-tight text-foreground">{node.title}</span>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={active.title}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.25 }}
            className="mt-4 text-center text-sm leading-relaxed text-muted"
          >
            <span className="font-medium text-cyan">{active.title}:</span> {active.description}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
