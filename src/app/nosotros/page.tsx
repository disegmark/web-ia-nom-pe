import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/animations/Reveal";
import type { SignAccent } from "@/components/signage/Signage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nosotros",
  description:
    "ia.nom.pe es un equipo especializado en agentes de IA, automatización e integración de sistemas para empresas, negocios y proyectos.",
  path: "/nosotros",
});

const VALUES = [
  {
    title: "Claridad",
    description: "Explicamos la tecnología en términos concretos, sin jerga innecesaria ni promesas vacías.",
  },
  {
    title: "Tecnología con criterio",
    description: "No implementamos IA porque sí: la usamos donde realmente resuelve un problema del negocio.",
  },
  {
    title: "Confianza",
    description: "Trabajamos con la información propia de cada empresa con el cuidado que merece.",
  },
  {
    title: "Escalabilidad",
    description: "Diseñamos cada sistema pensando en lo que la empresa necesitará mañana, no solo hoy.",
  },
];

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        eyebrow="Nosotros"
        title="Un equipo enfocado en conectar inteligencia"
        description="Somos un equipo especializado en el desarrollo de agentes de IA, automatización e integración de sistemas para empresas, negocios y proyectos."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <SectionHeader
              eyebrow="Quiénes somos"
              title="No vendemos otro chatbot"
              className="max-w-none"
            />
            <Reveal delay={0.1}>
              <div className="space-y-4 text-base leading-relaxed text-muted">
                <p>
                  ia.nom.pe nace de la experiencia de un equipo que ha trabajado en tecnología,
                  marketing digital y automatización, y que decidió enfocar ese conocimiento en un
                  solo lugar: conectar inteligencia artificial con los procesos reales de una
                  empresa.
                </p>
                <p>
                  Nuestro trabajo no es entregar un asistente que responde preguntas y nada más.
                  Es diseñar sistemas donde personas, datos, herramientas y agentes trabajan
                  conectados para convertir un objetivo en un resultado concreto.
                </p>
                <p>
                  Por eso cada proyecto empieza con una pregunta simple: ¿qué necesita realmente
                  esta empresa? La respuesta define la configuración, la integración y la
                  automatización que le siguen — nunca al revés.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <SectionHeader eyebrow="Cómo trabajamos" title="Lo que no negociamos" align="center" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <FeatureCard
                key={value.title}
                title={value.title}
                description={value.description}
                delay={index * 0.05}
                accent={ACCENTS[index % ACCENTS.length]}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <CTA
            title="Conversemos sobre tu proyecto"
            description="Cuéntanos en qué punto está tu empresa y hacia dónde quieres llevarla."
          />
        </Container>
      </section>
    </>
  );
}
