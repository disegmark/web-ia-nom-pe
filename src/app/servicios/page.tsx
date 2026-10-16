import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { CTA } from "@/components/sections/CTA";
import { NetworkArt } from "@/components/illustrations/NetworkArt";
import { Reveal } from "@/components/animations/Reveal";
import { SERVICES } from "@/data/services";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Servicios",
  description:
    "Configuración, integración, automatización, personalización y asesoría: los servicios detrás de cada solución de ia.nom.pe.",
  path: "/servicios",
});

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
            <SectionHeader
              eyebrow="Cómo trabajamos"
              title="Cinco frentes, un mismo sistema"
              className="max-w-none"
            />
            <Reveal delay={0.1} className="flex justify-center lg:block">
              <NetworkArt variant="services" className="mx-auto w-full max-w-[220px] sm:max-w-xs lg:max-w-sm text-border" />
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <ServiceCard key={service.slug} service={service} delay={index * 0.05} />
            ))}
          </div>
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
