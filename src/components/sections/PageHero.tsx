import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";

/** Shared header for inner pages (including /demo) — a smaller sign than the
 * homepage marquee, same night-street material, no eyebrow/kicker. */
export function PageHero({
  title,
  description,
}: {
  /** Kept for existing call sites; no longer rendered as a kicker label. */
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-marquee-night relative overflow-hidden py-16 sm:py-20">
      <Container className="relative">
        <Reveal>
          <h1 className="font-display sign-text-cyan max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="plate mt-6 inline-block max-w-xl px-5 py-3 text-balance text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
