import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { IntegrationCard } from "@/components/cards/IntegrationCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { CTA } from "@/components/sections/CTA";
import { NetworkArt } from "@/components/illustrations/NetworkArt";
import { Reveal } from "@/components/animations/Reveal";
import { INTEGRATIONS, INTEGRATION_CONCEPTS } from "@/data/integrations";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Integraciones",
  description:
    "Conectamos tus agentes iA con CRM, Google, email, WhatsApp, redes sociales, ERP, bases de datos y APIs para que trabajen dentro de tu sistema real.",
  path: "/integraciones",
});

export default function IntegracionesPage() {
  return (
    <>
      <PageHero
        eyebrow="Integraciones"
        title="Conectamos tus herramientas"
        description="La inteligencia aumenta su utilidad cuando puede interactuar con los sistemas que la empresa ya utiliza."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <SectionHeader
              eyebrow="Plataformas"
              title="Un agente que trabaja donde ya trabajas"
              className="max-w-none"
            />
            <Reveal delay={0.1} className="flex justify-center lg:block">
              <NetworkArt variant="integrations" className="mx-auto w-full max-w-[220px] sm:max-w-xs lg:max-w-sm text-border" />
            </Reveal>
          </div>
          <div className="mt-14 grid gap-3 sm:grid-cols-3">
            {INTEGRATIONS.map((integration, index) => (
              <IntegrationCard key={integration.name} integration={integration} delay={index * 0.03} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="En simple"
            title="Los conceptos detrás de una integración"
            description="No hace falta dominar estos términos para tener un sistema conectado — pero ayuda entender qué hacen."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INTEGRATION_CONCEPTS.map((concept) => (
              <div key={concept.term} className="rounded-2xl border border-border bg-background-elevated p-6">
                <p className="text-sm font-semibold text-cyan">{concept.term}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{concept.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <CTA
            title="¿Qué herramientas usa tu equipo hoy?"
            description="Cuéntanos con qué sistemas trabajas y evaluemos cómo conectarlos a un agente iA."
          />
        </Container>
      </section>
    </>
  );
}
