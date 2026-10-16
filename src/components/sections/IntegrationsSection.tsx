import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { IntegrationCard } from "@/components/cards/IntegrationCard";
import { NetworkArt } from "@/components/illustrations/NetworkArt";
import { Reveal } from "@/components/animations/Reveal";
import { TEXT_GLOW, type SignAccent } from "@/components/signage/Signage";
import { INTEGRATIONS, INTEGRATION_CONCEPTS } from "@/data/integrations";
import { cn } from "@/lib/utils";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function IntegrationsSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <SectionHeader
              title="Conectamos tus herramientas"
              description="La inteligencia aumenta su utilidad cuando puede interactuar con los sistemas que la empresa ya utiliza."
              className="max-w-none"
            />
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center lg:block">
            <NetworkArt variant="integrations" className="mx-auto w-full max-w-[300px] sm:max-w-sm lg:max-w-md text-border" />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {INTEGRATIONS.map((integration, index) => (
            <Reveal key={integration.name} delay={index * 0.07} y={16}>
              <IntegrationCard integration={integration} delay={0} accent={ACCENTS[index % ACCENTS.length]} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12} className="mt-14">
          <div className="plate grid gap-6 p-8 sm:grid-cols-4 sm:p-10">
            {INTEGRATION_CONCEPTS.map((concept, index) => (
              <div key={concept.term}>
                <p className={cn("font-display text-sm font-semibold", TEXT_GLOW[ACCENTS[index % ACCENTS.length]])}>
                  {concept.term}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{concept.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
