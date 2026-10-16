"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { WHATWEDO_LEFT_NODES, WHATWEDO_RIGHT_NODES } from "@/data/diagrams";
import type { IconItem } from "@/types";

const LEFT_Y = [18, 50, 82];
const RIGHT_Y = [32, 68];
const NODES = [...WHATWEDO_LEFT_NODES, ...WHATWEDO_RIGHT_NODES];

type NodeButtonProps = {
  node: IconItem;
  side: "left" | "right";
  y: number;
  isActive: boolean;
  onActivate: () => void;
};

function NodeButton({ node, side, y, isActive, onActivate }: NodeButtonProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      aria-pressed={isActive}
      aria-label={`${node.title}: ${node.description}`}
      style={{ top: `${y}%`, [side]: 0 }}
      className={cn(
        "focus-ring absolute z-10 flex w-[7.5rem] -translate-y-1/2 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all duration-300 sm:w-36",
        side === "right" && "flex-row-reverse text-right",
        isActive
          ? "border-cyan/60 bg-background-elevated text-cyan shadow-[0_0_24px_-8px_rgba(56,211,255,.55)]"
          : "border-border bg-background-elevated/90 text-muted hover:border-cyan/35 hover:text-foreground",
      )}
    >
      <Icon name={node.icon} className="h-4 w-4 shrink-0" />
      <span className="text-xs font-medium leading-tight">{node.title}</span>
      <span className={cn("absolute -inset-px -z-10 rounded-xl bg-cyan/5 opacity-0 transition-opacity", isActive && "opacity-100")} />
    </button>
  );
}

/** Interactive systems map. Every node is keyboard and touch accessible. */
export function WhatWeDoHub() {
  const [active, setActive] = useState<string>("Personas");
  const activeNode = NODES.find((node) => node.title === active) ?? NODES[0];

  const leftPositions = WHATWEDO_LEFT_NODES.map((node, i) => ({ node, y: LEFT_Y[i] }));
  const rightPositions = WHATWEDO_RIGHT_NODES.map((node, i) => ({ node, y: RIGHT_Y[i] }));
  const allPositions = [
    ...leftPositions.map((p) => ({ ...p, x: 8 })),
    ...rightPositions.map((p) => ({ ...p, x: 92 })),
  ];

  return (
    <div className="systems-map relative mx-auto w-full max-w-xl">
      <div className="relative h-64 sm:h-72">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="systems-link-gradient"><stop offset="0%" stopColor="#38d3ff" stopOpacity=".9" /><stop offset="100%" stopColor="#5b8bff" stopOpacity=".15" /></linearGradient>
          </defs>
          {allPositions.map(({ node, x, y }) => (
            <g key={node.title}>
              <line x1={50} y1={50} x2={x} y2={y} stroke="currentColor" className={active === node.title ? "text-cyan" : "text-border"} strokeWidth={active === node.title ? 0.7 : 0.35} strokeDasharray={active === node.title ? "2 1.5" : "1.5 2"} opacity={active === node.title ? 1 : 0.5} />
              {active === node.title && <circle r="1.15" fill="#8ff2ff"><animateMotion dur="2.8s" repeatCount="indefinite" path={`M 50 50 L ${x} ${y}`} /></circle>}
            </g>
          ))}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-[1] flex h-[4.7rem] w-[4.7rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-cyan/55 bg-background-elevated shadow-[0_0_38px_-6px_rgba(56,211,255,.42)] sm:h-24 sm:w-24">
          <span className="font-display text-xl font-semibold text-foreground">iA</span>
          <span className="text-[9px] uppercase tracking-[.2em] text-cyan">nom.pe</span>
          <span className="absolute inset-[-6px] -z-10 animate-pulse rounded-full border border-cyan/15" />
        </div>

        {leftPositions.map(({ node, y }) => (
          <NodeButton key={node.title} node={node} side="left" y={y} isActive={active === node.title} onActivate={() => setActive(node.title)} />
        ))}
        {rightPositions.map(({ node, y }) => (
          <NodeButton key={node.title} node={node} side="right" y={y} isActive={active === node.title} onActivate={() => setActive(node.title)} />
        ))}
      </div>

      <div className="systems-map-readout mt-3 flex min-h-[84px] items-start gap-3 rounded-xl border border-cyan/15 bg-cyan/[0.035] p-4" aria-live="polite">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
          <Icon name={activeNode.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">{activeNode.title}<span className="ml-2 font-mono text-[9px] font-normal tracking-[.15em] text-cyan">/ NODO ACTIVO</span></p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{activeNode.description} Selecciona otro nodo para explorar cómo se conecta al sistema.</p>
        </div>
      </div>
    </div>
  );
}
