import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { CTA } from "@/components/sections/CTA";
import { AutomationEcosystem } from "@/components/sections/AutomationEcosystem";
import { AutomationPlayground } from "@/components/sections/AutomationPlayground";
import { ImpactSimulator } from "@/components/sections/ImpactSimulator";
import { Reveal } from "@/components/animations/Reveal";
import type { SignAccent } from "@/components/signage/Signage";
import { AUTOMATION_EXAMPLES } from "@/data/automation-examples";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Automatización",
  description:
    "Automatizamos tareas repetitivas — respuestas, seguimiento, generación de leads, procesos administrativos — para que tu equipo dedique tiempo a lo estratégico.",
  path: "/automatizacion",
});

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export default function AutomatizacionPage() {
  return (
    <>
      <PageHero
        eyebrow="Automatización"
        title="Automatizamos lo repetitivo"
        description="La automatización permite que los equipos dediquen menos tiempo a tareas repetitivas y más tiempo a actividades estratégicas."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Ejemplos"
              title="Procesos que puedes dejar de hacer manualmente"
              description="Estos son ejemplos de tareas que un sistema de agentes y automatizaciones puede absorber dentro de tu operación."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <AutomationEcosystem />
          </Reveal>
          <Reveal delay={0.08} y={24}>
            <AutomationPlayground />
          </Reveal>
          <Reveal delay={0.08} y={24}>
            <ImpactSimulator />
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

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Cómo se diseña"
              title="La automatización no reemplaza el criterio, lo libera"
              description="El objetivo no es eliminar personas del proceso, sino eliminar la parte del proceso que no requiere criterio humano. Definimos junto a tu equipo qué automatizar y qué debe seguir pasando por una persona."
              align="center"
            />
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <CTA
            title="¿Qué proceso te está quitando más tiempo?"
            description="Cuéntanos qué tareas repetitivas ocupan a tu equipo y evaluemos juntos qué automatizar primero."
          />
        </Container>
      </section>
    </>
  );
}
