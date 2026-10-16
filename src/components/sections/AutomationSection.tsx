import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { NetworkArt } from "@/components/illustrations/NetworkArt";
import { Reveal } from "@/components/animations/Reveal";
import type { SignAccent } from "@/components/signage/Signage";
import { AUTOMATION_EXAMPLES } from "@/data/automation-examples";
import { AutomationPlayground } from "./AutomationPlayground";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function AutomationSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal delay={0.1} className="flex justify-center lg:block">
            <NetworkArt variant="automation" className="mx-auto w-full max-w-[220px] sm:max-w-xs lg:max-w-sm text-border" />
          </Reveal>
          <Reveal>
            <SectionHeader
              title="Automatizamos lo repetitivo"
              description="La automatización permite que los equipos dediquen menos tiempo a tareas repetitivas y más tiempo a actividades estratégicas."
              className="max-w-none"
            />
          </Reveal>
        </div>
        <Reveal delay={0.08} y={24}>
          <AutomationPlayground />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AUTOMATION_EXAMPLES.map((example, index) => (
            <Reveal key={example.title} delay={index * 0.07} y={18}>
              <FeatureCard
                title={example.title}
                description={example.description}
                delay={0}
                accent={ACCENTS[index % ACCENTS.length]}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
