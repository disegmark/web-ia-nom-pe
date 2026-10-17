import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { CTA } from "@/components/sections/CTA";
import { IntegrationsHub } from "@/components/sections/IntegrationsHub";
import { Reveal } from "@/components/animations/Reveal";
import { SignHeading, SignWord, PLATE_GLOW, TEXT_GLOW, type SignAccent } from "@/components/signage/Signage";
import { INTEGRATION_CONCEPTS } from "@/data/integrations";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Integraciones",
  description:
    "Conectamos tus agentes iA con CRM, Google, email, WhatsApp, redes sociales, ERP, bases de datos y APIs para que trabajen dentro de tu sistema real.",
  path: "/integraciones",
});

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

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
          <SignHeading
            title={
              <>
                Un agente que trabaja <SignWord>donde ya trabajas</SignWord>
              </>
            }
            description="CRM, correo, mensajería, ERP y bases de datos: el agente se conecta con los sistemas que tu equipo ya usa."
          />
          <Reveal delay={0.08}>
            <IntegrationsHub />
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="En simple"
              title="Los conceptos detrás de una integración"
              description="No hace falta dominar estos términos para tener un sistema conectado — pero ayuda entender qué hacen."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INTEGRATION_CONCEPTS.map((concept, index) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <Reveal key={concept.term} delay={index * 0.06} y={18} className="h-full">
                  <div className={cn("plate h-full p-6", PLATE_GLOW[accent])}>
                    <p className={cn("font-display text-sm font-semibold", TEXT_GLOW[accent])}>{concept.term}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{concept.description}</p>
                  </div>
                </Reveal>
              );
            })}
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
