"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { WHATWEDO_LEFT_NODES, WHATWEDO_RIGHT_NODES } from "@/data/diagrams";
import type { IconItem } from "@/types";

const LEFT_Y = [18, 50, 82];
const RIGHT_Y = [32, 68];

type NodeButtonProps = {
  node: IconItem;
  side: "left" | "right";
  y: number;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
};

function NodeButton({ node, side, y, isActive, onHover, onLeave }: NodeButtonProps) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      style={{ top: `${y}%`, [side]: 0 }}
      className={cn(
        "focus-ring absolute flex w-[7.5rem] -translate-y-1/2 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors sm:w-36",
        side === "right" && "flex-row-reverse text-right",
        isActive ? "border-cyan/60 bg-background-elevated text-cyan" : "border-border bg-background-elevated/80 text-muted",
      )}
    >
      <Icon name={node.icon} className="h-4 w-4 shrink-0" />
      <span className="text-xs font-medium leading-tight">{node.title}</span>
    </button>
  );
}

/** Home "¿Qué hacemos?" hub: personas/información/aplicaciones + procesos/automatizaciones around ia.nom.pe. */
export function WhatWeDoHub() {
  const [active, setActive] = useState<string | null>(null);

  const leftPositions = WHATWEDO_LEFT_NODES.map((node, i) => ({ node, y: LEFT_Y[i] }));
  const rightPositions = WHATWEDO_RIGHT_NODES.map((node, i) => ({ node, y: RIGHT_Y[i] }));
  const allPositions = [
    ...leftPositions.map((p) => ({ ...p, x: 8 })),
    ...rightPositions.map((p) => ({ ...p, x: 92 })),
  ];

  return (
    <div className="relative mx-auto h-64 w-full max-w-xl sm:h-72">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {allPositions.map(({ node, x, y }) => (
          <line
            key={node.title}
            x1={50}
            y1={50}
            x2={x}
            y2={y}
            stroke="currentColor"
            className={active === node.title ? "text-cyan" : "text-border"}
            strokeWidth={active === node.title ? 0.6 : 0.35}
            strokeDasharray="1.5 2"
            opacity={active === node.title ? 0.9 : 0.6}
          />
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-cyan/50 bg-background-elevated shadow-[0_0_30px_-6px_rgba(56,211,255,0.4)]">
        <span className="text-lg font-semibold text-foreground">ia</span>
        <span className="text-[9px] uppercase tracking-widest text-cyan">nom.pe</span>
      </div>

      {leftPositions.map(({ node, y }) => (
        <NodeButton
          key={node.title}
          node={node}
          side="left"
          y={y}
          isActive={active === node.title}
          onHover={() => setActive(node.title)}
          onLeave={() => setActive(null)}
        />
      ))}
      {rightPositions.map(({ node, y }) => (
        <NodeButton
          key={node.title}
          node={node}
          side="right"
          y={y}
          isActive={active === node.title}
          onHover={() => setActive(node.title)}
          onLeave={() => setActive(null)}
        />
      ))}
    </div>
  );
}
