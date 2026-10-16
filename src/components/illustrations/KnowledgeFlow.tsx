"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { KNOWLEDGE_OUTCOMES, KNOWLEDGE_SOURCES } from "@/data/diagrams";

/** Sources -> search -> agent -> outcomes flow used in KnowledgeSection. */
export function KnowledgeFlow() {
  const [activeSource, setActiveSource] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-background-elevated p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center">
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-2">
          {KNOWLEDGE_SOURCES.map((source, index) => (
            <button
              key={source.title}
              type="button"
              onMouseEnter={() => setActiveSource(index)}
              onFocus={() => setActiveSource(index)}
              onMouseLeave={() => setActiveSource(null)}
              onBlur={() => setActiveSource(null)}
              className={cn(
                "focus-ring flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                activeSource === index ? "border-cyan/60 text-cyan" : "border-border text-muted",
              )}
            >
              <Icon name={source.icon} className="h-3.5 w-3.5 shrink-0" />
              <span className="leading-tight">{source.title}</span>
            </button>
          ))}
        </div>

        <ArrowRight className="hidden h-5 w-5 shrink-0 text-border lg:block" aria-hidden="true" />
        <ArrowDown className="h-5 w-5 shrink-0 text-border lg:hidden" aria-hidden="true" />

        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-full border transition-colors",
            activeSource !== null ? "border-cyan bg-primary/20" : "border-cyan/40 bg-background",
          )}
        >
          <Search className="h-6 w-6 text-cyan" aria-hidden="true" />
        </div>

        <ArrowRight className="hidden h-5 w-5 shrink-0 text-border lg:block" aria-hidden="true" />
        <ArrowDown className="h-5 w-5 shrink-0 text-border lg:hidden" aria-hidden="true" />

        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan/40 bg-background text-cyan animate-pulse-glow">
            <Icon name="bot" className="h-7 w-7" />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {KNOWLEDGE_OUTCOMES.map((outcome) => (
              <span key={outcome} className="rounded-full border border-cyan/30 px-2.5 py-1 text-[11px] text-cyan">
                {outcome}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
