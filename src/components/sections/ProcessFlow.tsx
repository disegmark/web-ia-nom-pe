"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/animations/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { ProcessStep } from "@/types";
import { cn } from "@/lib/utils";
import { BADGE_BG, PLATE_LIT, SignMarker, type SignAccent } from "@/components/signage/Signage";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function ProcessFlow({ steps, className }: { steps: ProcessStep[]; className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const progress = steps.length > 1 ? (activeIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className={cn("relative", className)}>
      {/* Connecting line */}
      <div
        aria-hidden="true"
        className="absolute left-5 top-6 hidden h-[calc(100%-3rem)] w-px bg-border sm:block lg:left-0 lg:top-5 lg:h-px lg:w-full"
      />
      <motion.div
        aria-hidden="true"
        initial={{ width: "0%" }}
        whileInView={{ width: `${progress}%` }}
        viewport={{ once: true, margin: "-60px" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: reduceMotion ? 0.1 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-5 hidden h-px bg-gradient-to-r from-primary to-cyan lg:block"
      />

      <ol className="relative grid gap-6 sm:grid-cols-1 lg:grid-cols-5">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <Reveal key={step.title} delay={index * 0.08}>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  className="focus-ring group flex w-full gap-4 text-left lg:flex-col lg:gap-3"
                >
                  <SignMarker index={index} active={isActive} accent={accent} />

                  <div
                    animate={{ opacity: isActive ? 1 : 0.76 }}
                    className={cn(
                      "plate flex-1 p-4 transition-all duration-200 lg:mt-1",
                      isActive ? PLATE_LIT[accent] : "opacity-70 group-hover:opacity-100"
                    )}
                  >
                    {step.icon ? (
                      <span className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", BADGE_BG[accent])}>
                        <Icon name={step.icon} className="h-4 w-4" />
                      </span>
                    ) : null}
                    <p className="font-display font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                  </div>
                </button>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
