import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { IndustryCard } from "@/components/cards/IndustryCard";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { NetworkArt } from "@/components/illustrations/NetworkArt";
import { Reveal } from "@/components/animations/Reveal";
import { INDUSTRIES } from "@/data/industries";
import { FAQS } from "@/data/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Soluciones",
  description:
    "Agentes iA, automatización, integraciones y servicios diseñados para cada empresa. Soluciones personalizadas, no planes de talla única.",
  path: "/soluciones",
});

const PILLARS = [
  {
    href: "/agentes-ia",
    title: "Agentes iA",
    description: "Sistemas que comprenden contexto, consultan información propia y ejecutan tareas.",
  },
  {
    href: "/automatizacion",
    title: "Automatización",
    description: "Procesos repetitivos que ocurren sin intervención manual constante.",
  },
  {
    href: "/integraciones",
    title: "Integraciones",
    description: "Conexión con el CRM, el correo, la mensajería y las herramientas que ya usas.",
  },
  {
    href: "/servicios",
    title: "Servicios",
    description: "Configuración, personalización y asesoría durante todo el proceso.",
  },
];

export default function SolucionesPage() {
  return (
    <>
      <PageHero
        eyebrow="Soluciones personalizadas"
        title="Soluciones diseñadas para cada empresa"
        description="Cada proyecto es diferente. Antes de proponer una solución, entendemos tus objetivos, tus procesos actuales y las herramientas que ya usas."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader eyebrow="Cuatro frentes" title="Cómo se compone una solución" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.href} delay={index * 0.05} className="h-full">
                <Link
                  href={pillar.href}
                  className="focus-ring group flex h-full flex-col justify-between rounded-2xl border border-border bg-background-elevated p-6 transition-colors hover:border-cyan/40"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.description}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cyan">
                    Ver más
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal delay={0.1} className="flex justify-center lg:block">
              <NetworkArt variant="industries" className="mx-auto w-full max-w-[220px] sm:max-w-xs lg:max-w-sm text-border" />
            </Reveal>
            <SectionHeader
              eyebrow="Aplicación"
              title="¿Dónde puede aplicarse?"
              description="Ejemplos ilustrativos de dónde suele aplicarse este tipo de tecnología."
              className="max-w-none"
            />
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((industry, index) => (
              <IndustryCard key={industry.slug} industry={industry} delay={index * 0.04} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <SectionHeader align="center" eyebrow="Preguntas frecuentes" title="Antes de conversar" />
          <div className="mt-14">
            <FAQ items={FAQS} />
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <CTA
            title="Diseñemos tu sistema"
            description="Cuéntanos tus objetivos y procesos actuales, y te propondremos una solución a tu medida."
            primaryLabel="Solicitar diagnóstico"
          />
        </Container>
      </section>
    </>
  );
}
