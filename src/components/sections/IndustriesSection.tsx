import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { IndustryCard } from "@/components/cards/IndustryCard";
import { NetworkArt } from "@/components/illustrations/NetworkArt";
import { Reveal } from "@/components/animations/Reveal";
import type { SignAccent } from "@/components/signage/Signage";
import { INDUSTRIES } from "@/data/industries";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function IndustriesSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal delay={0.1} className="flex justify-center lg:block">
            <NetworkArt variant="industries" className="mx-auto w-full max-w-[220px] sm:max-w-xs lg:max-w-sm text-border" />
          </Reveal>
          <SectionHeader
            title="¿Dónde puede aplicarse?"
            description="Estos son ejemplos ilustrativos de dónde suele aplicarse este tipo de tecnología — no casos de éxito verificados de un cliente en particular."
            className="max-w-none"
          />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry, index) => (
            <IndustryCard
              key={industry.slug}
              industry={industry}
              delay={index * 0.04}
              accent={ACCENTS[index % ACCENTS.length]}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
