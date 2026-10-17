import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { SolutionFinder } from "@/components/sections/SolutionFinder";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/animations/Reveal";
import { PLATE_GLOW, TEXT_GLOW, type SignAccent } from "@/components/signage/Signage";
import { FAQS } from "@/data/faqs";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

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
          <Reveal>
            <SectionHeader eyebrow="Cuatro frentes" title="Cómo se compone una solución" />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, index) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <Reveal key={pillar.href} delay={index * 0.05} className="h-full">
                  <Link
                    href={pillar.href}
                    className={cn("plate focus-ring group flex h-full flex-col justify-between p-6", PLATE_GLOW[accent])}
                  >
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.description}</p>
                    </div>
                    <span className={cn("mt-6 inline-flex items-center gap-1.5 text-sm font-medium", TEXT_GLOW[accent])}>
                      Ver más
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <SolutionFinder />

      <IndustriesSection />

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
