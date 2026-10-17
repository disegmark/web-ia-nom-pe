import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { AgentCard } from "@/components/cards/AgentCard";
import { ProcessFlow } from "@/components/sections/ProcessFlow";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { CTA } from "@/components/sections/CTA";
import { RadialDiagram } from "@/components/illustrations/RadialDiagram";
import { Reveal } from "@/components/animations/Reveal";
import { AGENT_AREAS } from "@/data/agents";
import { KnowledgeSection } from "@/components/sections/KnowledgeSection";
import { SignPlate, type SignAccent } from "@/components/signage/Signage";
import { AGENT_CAPABILITIES, AGENT_PILLARS } from "@/data/diagrams";
import { EVOLUTION_STAGES } from "@/data/process";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Agentes iA",
  description:
    "Un agente iA comprende contexto, consulta información propia, ejecuta tareas y se conecta con tus herramientas. Conoce las áreas donde puede aplicarse.",
  path: "/agentes-ia",
});

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export default function AgentesIaPage() {
  return (
    <>
      <PageHero
        eyebrow="Agentes iA"
        title="Un sistema inteligente diseñado para cumplir objetivos"
        description="Un agente iA usa conocimiento, herramientas y procesos para cumplir objetivos específicos: comprende contexto, consulta información propia, ejecuta tareas autorizadas y deriva a una persona cuando corresponde."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Reveal>
                <SectionHeader
                  eyebrow="Áreas de aplicación"
                  title="No es un catálogo cerrado de productos"
                  description="Estas son áreas donde puede desarrollarse una solución a medida — el alcance real se define según los objetivos y procesos de cada empresa."
                  className="max-w-none"
                />
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
                {AGENT_PILLARS.map((pillar, index) => (
                  <Reveal key={pillar.title} delay={index * 0.06} y={14}>
                    <SignPlate icon={pillar.icon} title={pillar.title} description={pillar.description} accent={ACCENTS[index % ACCENTS.length]} delay={0} />
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.12}>
              <RadialDiagram centerLabel="IA Agente" centerIcon="bot" nodes={AGENT_CAPABILITIES} />
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AGENT_AREAS.map((agent, index) => (
              <Reveal key={agent.slug} delay={index * 0.06} y={18}>
                <AgentCard agent={agent} delay={0} accent={ACCENTS[index % ACCENTS.length]} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="De chatbot a agente"
              title="Cada etapa suma capacidad real"
              description="Un agente iA no es un chatbot con otro nombre: es un salto de capacidad, de guiones fijos a un sistema que comprende y actúa."
            />
          </Reveal>
          <ProcessFlow steps={EVOLUTION_STAGES} className="mt-14" />
        </Container>
      </section>

      <KnowledgeSection showMoreLink={false} />

      <section className="border-t border-border py-20 sm:py-28">
        <Container>
          <CTA
            title="¿Qué agente necesita tu empresa?"
            description="Conversemos sobre tus procesos y objetivos para definir el alcance real del agente que tiene sentido para ti."
          />
        </Container>
      </section>
    </>
  );
}
