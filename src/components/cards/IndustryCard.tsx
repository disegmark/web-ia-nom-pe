import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";
import { PLATE_GLOW, type SignAccent } from "@/components/signage/Signage";
import type { Industry } from "@/types";

export function IndustryCard({
  industry,
  delay = 0,
  accent = "cyan",
}: {
  industry: Industry;
  delay?: number;
  accent?: SignAccent;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className={cn("plate h-full p-6", PLATE_GLOW[accent])}>
        <h3 className="font-display text-lg font-semibold text-foreground">{industry.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{industry.description}</p>
        <ul className="mt-4 space-y-1.5 pt-4 shadow-[0_1px_0_rgba(244,246,251,0.08)_inset]">
          {industry.useCases.map((useCase) => (
            <li key={useCase} className="text-xs text-muted">
              {useCase}
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}
