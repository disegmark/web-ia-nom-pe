"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

/**
 * Circular hub diagram: a core node (the agent/system) with N capability
 * nodes around it. Clicking a node pins it as active and surfaces its
 * description in the caption — the interactive alternative to the old
 * static NetworkArt illustrations.
 */
export function RadialDiagram({ centerLabel, centerIcon, nodes, className }: RadialDiagramProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gradientId = `${GRADIENT_ID}-${useId().replace(/:/g, "")}`;
  const active = nodes[activeIndex];

  const positions = nodes.map((_, i) => {
    const angle = (-90 + (i * 360) / nodes.length) * (Math.PI / 180);
    const radius = 40;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  });

  return (
    <div className={className}>
      {/* Desktop: circular hub with connecting lines */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2f5dfa" />
              <stop offset="1" stopColor="#38d3ff" />
            </linearGradient>
          </defs>
          {positions.map((pos, i) => (
            <line
              key={i}
              x1={50}
              y1={50}
              x2={pos.x}
              y2={pos.y}
              stroke={i === activeIndex ? `url(#${gradientId})` : "currentColor"}
              className={i === activeIndex ? undefined : "text-border"}
              strokeWidth={i === activeIndex ? 0.8 : 0.5}
              opacity={i === activeIndex ? 0.9 : 0.5}
            />
          ))}
        </svg>

        <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-cyan/40 bg-background-elevated text-center shadow-[0_0_30px_-4px_rgba(56,211,255,0.35)]">
          <Icon name={centerIcon} className="h-7 w-7 text-cyan animate-pulse-glow" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">{centerLabel}</span>
        </div>

        {nodes.map((node, i) => {
          const pos = positions[i];
          const isActive = i === activeIndex;
          return (
            <button
              key={node.title}
              type="button"
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              aria-pressed={isActive}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="focus-ring absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200",
                  isActive
                    ? "border-cyan bg-primary/20 text-cyan shadow-[0_0_16px_-2px_rgba(56,211,255,0.6)] scale-110"
                    : "border-border bg-background text-muted hover:border-cyan/40 hover:text-cyan",
                )}
              >
                <Icon name={node.icon} className="h-5 w-5" />
              </span>
              <span className={cn("text-xs leading-tight", isActive ? "text-foreground font-medium" : "text-muted")}>
                {node.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Caption for the active capability */}
      <div className="mx-auto mt-6 hidden max-w-md text-center lg:block" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={active.title}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-sm leading-relaxed text-muted"
          >
            <span className="font-medium text-cyan">{active.title}:</span> {active.description}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Mobile / tablet fallback: simple interactive grid */}
      <div className="lg:hidden">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-cyan/40 bg-background-elevated px-4 py-2">
          <Icon name={centerIcon} className="h-5 w-5 text-cyan" />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{centerLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {nodes.map((node, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={node.title}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-pressed={isActive}
                className={cn(
                  "focus-ring flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
                  isActive ? "border-cyan/60 bg-primary/10" : "border-border bg-background-elevated",
                )}
              >
                <Icon name={node.icon} className={cn("h-5 w-5", isActive ? "text-cyan" : "text-muted")} />
                <span className="text-xs leading-tight text-foreground">{node.title}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted">
          <span className="font-medium text-cyan">{active.title}:</span> {active.description}
        </p>
      </div>
    </div>
  );
}
