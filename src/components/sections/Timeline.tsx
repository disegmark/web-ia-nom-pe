import { Reveal } from "@/components/animations/Reveal";
import type { ProcessStep } from "@/types";
import { cn } from "@/lib/utils";
import { SignMarker, type SignAccent } from "@/components/signage/Signage";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function Timeline({ steps, className }: { steps: ProcessStep[]; className?: string }) {
  return (
    <ol className={cn("relative mx-auto max-w-md", className)}>
      <div
        aria-hidden="true"
        className="absolute left-5 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary via-cyan to-transparent"
      />
      {steps.map((step, index) => (
        <Reveal key={step.title} delay={index * 0.06}>
          <li className="relative flex gap-4 pb-8 last:pb-0">
            <SignMarker index={index} active accent={ACCENTS[index % ACCENTS.length]} />
            <div className="pt-1.5">
              <p className="font-display font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}
