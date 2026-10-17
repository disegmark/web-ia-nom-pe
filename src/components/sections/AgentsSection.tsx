import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { AgentCard } from "@/components/cards/AgentCard";
import { RadialDiagram } from "@/components/illustrations/RadialDiagram";
import { LivingSystemImage } from "./LivingSystemImage";
import { Reveal } from "@/components/animations/Reveal";
import { SignPlate, type SignAccent } from "@/components/signage/Signage";
import { AGENT_AREAS } from "@/data/agents";
import { AGENT_CAPABILITIES, AGENT_PILLARS } from "@/data/diagrams";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function AgentsSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-14">
          <Reveal>
            <SectionHeader
              title="Un sistema inteligente diseñado para cumplir objetivos"
              description="Un agente iA usa conocimiento, herramientas y procesos para cumplir objetivos específicos. Estas son áreas donde puede desarrollarse una solución — no un catálogo cerrado de productos ya implementados."
              className="max-w-none"
            />
          </Reveal>
          <LivingSystemImage className="max-lg:order-first" />
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
            {AGENT_PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.06} y={14}>
                <SignPlate icon={pillar.icon} title={pillar.title} description={pillar.description} accent={ACCENTS[index % ACCENTS.length]} delay={0} />
              </Reveal>
            ))}
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
  );
}
