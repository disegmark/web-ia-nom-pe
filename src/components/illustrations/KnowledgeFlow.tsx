"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { KNOWLEDGE_OUTCOMES, KNOWLEDGE_SOURCES } from "@/data/diagrams";

/** Sources -> retrieval -> agent -> outcomes, with a visible live data pulse. */
export function KnowledgeFlow() {
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(56,211,255,0.08),transparent_65%)]" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center">
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-2">
          {KNOWLEDGE_SOURCES.map((source, index) => (
            <motion.button
              key={source.title}
              type="button"
              onMouseEnter={() => setActiveSource(index)}
              onFocus={() => setActiveSource(index)}
              onMouseLeave={() => setActiveSource(null)}
              onBlur={() => setActiveSource(null)}
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.025 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className={cn(
                "focus-ring flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                activeSource === index ? "border-cyan/70 bg-primary/10 text-cyan shadow-[0_0_18px_-8px_rgba(56,211,255,0.8)]" : "border-border text-muted",
              )}
            >
              <Icon name={source.icon} className="h-3.5 w-3.5 shrink-0" />
              <span className="leading-tight">{source.title}</span>
            </motion.button>
          ))}
        </div>

        <div className="relative flex items-center justify-center">
          <ArrowRight className="hidden h-5 w-5 shrink-0 text-cyan/70 lg:block" aria-hidden="true" />
          <ArrowDown className="h-5 w-5 shrink-0 text-cyan/70 lg:hidden" aria-hidden="true" />
          {!reduceMotion && (
            <motion.span
              className="absolute hidden h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_3px_rgba(56,211,255,0.7)] lg:block"
              animate={{ x: [-3, 25], opacity: [0, 1, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            />
          )}
        </div>

        <motion.div
          animate={reduceMotion ? undefined : { boxShadow: ["0 0 0 0 rgba(56,211,255,0.05)", "0 0 28px 2px rgba(56,211,255,0.22)", "0 0 0 0 rgba(56,211,255,0.05)"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-full border transition-colors",
            activeSource !== null ? "border-cyan bg-primary/20" : "border-cyan/40 bg-background",
          )}
        >
          <Search className="h-6 w-6 text-cyan" aria-hidden="true" />
        </motion.div>

        <div className="relative flex items-center justify-center">
          <ArrowRight className="hidden h-5 w-5 shrink-0 text-cyan/70 lg:block" aria-hidden="true" />
          <ArrowDown className="h-5 w-5 shrink-0 text-cyan/70 lg:hidden" aria-hidden="true" />
          {!reduceMotion && (
            <motion.span
              className="absolute hidden h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_3px_rgba(56,211,255,0.7)] lg:block"
              animate={{ x: [-3, 25], opacity: [0, 1, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "linear", delay: 0.85 }}
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.07, 1], boxShadow: ["0 0 0 0 rgba(56,211,255,0.08)", "0 0 32px 4px rgba(56,211,255,0.28)", "0 0 0 0 rgba(56,211,255,0.08)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan/50 bg-background text-cyan"
          >
            <Icon name="bot" className="h-7 w-7" />
          </motion.div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {KNOWLEDGE_OUTCOMES.map((outcome, index) => (
              <motion.span
                key={outcome}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.12 * index }}
                className="rounded-full border border-cyan/30 px-2.5 py-1 text-[11px] text-cyan"
              >
                {outcome}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
