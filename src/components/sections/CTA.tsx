import { ButtonLink } from "@/components/ui/Button";
import { AnimatedNodes } from "@/components/animations/AnimatedNodes";
import { Reveal } from "@/components/animations/Reveal";

export function CTA({
  title,
  description,
  primaryLabel = "Construyamos tu solución",
  primaryHref = "/contacto",
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Reveal>
      <div className="plate plate-glow-amber relative overflow-hidden px-6 py-16 text-center sm:px-12">
        <AnimatedNodes className="pointer-events-none absolute left-1/2 top-1/2 w-[40rem] -translate-x-1/2 -translate-y-1/2 opacity-30" />
        <div className="relative">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href={primaryHref} variant="primary">
              {primaryLabel}
            </ButtonLink>
            {secondaryLabel && secondaryHref ? (
              <ButtonLink href={secondaryHref} variant="secondary">
                {secondaryLabel}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
