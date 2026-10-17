"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/animations/Reveal";
import { SERVICES } from "@/data/services";
import { SOLUTION_DIFFERENTIATORS, SOLUTION_PROCESS } from "@/data/diagrams";
import { cn } from "@/lib/utils";
import { BADGE_BG, PLATE_LIT, SignMarker, type SignAccent } from "@/components/signage/Signage";

const ROTATE_MS = 3500;
const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function DifferentiatorStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SOLUTION_DIFFERENTIATORS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SOLUTION_DIFFERENTIATORS.map((item, index) => {
        const isActive = index === activeIndex;
        const accent = ACCENTS[index % ACCENTS.length];
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-pressed={isActive}
            className={cn(
              "plate focus-ring flex items-center gap-4 p-5 text-left transition-all duration-300",
              isActive ? PLATE_LIT[accent] : "opacity-70 hover:opacity-100"
            )}
          >
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", BADGE_BG[accent])}>
              <Icon name={item.icon} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{item.description}</span>
            </span>
            <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isActive && "translate-x-0.5 text-cyan")} />
          </button>
        );
      })}
    </div>
  );
}

export function SolutionsSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeader
              title="Soluciones diseñadas para cada empresa"
              description="Cada proyecto es diferente. Antes de proponer una solución, entendemos tus objetivos, tus procesos actuales y las herramientas que ya usas."
              className="max-w-none"
            />
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {SOLUTION_PROCESS.map((step, index) => (
                <Reveal key={step.title} delay={index * 0.05}>
                  <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                    <SignMarker index={index} accent={ACCENTS[index % ACCENTS.length]} />
                    <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs leading-relaxed text-muted">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1}>
            <DifferentiatorStack />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              delay={index * 0.05}
              accent={ACCENTS[index % ACCENTS.length]}
            />
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ButtonLink href="/contacto" variant="primary">
            Solicitar diagnóstico
          </ButtonLink>
          <ButtonLink href="/soluciones" variant="secondary">
            Diseñemos tu sistema
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
