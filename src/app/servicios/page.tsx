import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { DifferentiatorStack } from "@/components/sections/SolutionsSection";
import { Timeline } from "@/components/sections/Timeline";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/animations/Reveal";
import { SignMarker, type SignAccent } from "@/components/signage/Signage";
import { SERVICES } from "@/data/services";
import { SOLUTION_PROCESS } from "@/data/diagrams";
import { WORK_FLOW } from "@/data/process";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Servicios",
  description:
    "Configuración, integración, automatización, personalización y asesoría: los servicios detrás de cada solución de ia.nom.pe.",
  path: "/servicios",
});

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        eyebrow="Servicios"
        title="Lo que hacemos, paso a paso"
        description="Cada proyecto combina distintos servicios según lo que la empresa necesita. Esta es la base de cómo trabajamos."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Reveal>
                <SectionHeader eyebrow="Cómo trabajamos" title="Cinco frentes, un mismo sistema" className="max-w-none" />
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {SOLUTION_PROCESS.map((step, index) => (
                  <Reveal key={step.title} delay={index * 0.05}>
                    <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                      <SignMarker index={index} accent={ACCENTS[index % ACCENTS.length]} />
                      <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                      <p className="text-xs leading-relaxed text-muted">{step.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.1}>
              <DifferentiatorStack />
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <ServiceCard
                key={service.slug}
                service={service}
                delay={index * 0.05}
                accent={ACCENTS[index % ACCENTS.length]}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeader
              align="center"
              title="No se trata solamente de hablar con una IA"
              description="Se trata de conectar inteligencia con acción."
            />
          </Reveal>
          <Timeline steps={WORK_FLOW} className="mt-14" />
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <CTA
            title="Solicita un diagnóstico"
            description="Antes de proponer un servicio, entendemos tus objetivos y procesos actuales. Empecemos por ahí."
            primaryLabel="Solicitar diagnóstico"
          />
        </Container>
      </section>
    </>
  );
}
