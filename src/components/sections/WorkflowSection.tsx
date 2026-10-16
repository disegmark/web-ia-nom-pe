import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeader } from "./SectionHeader";
import { Timeline } from "./Timeline";
import { CTA } from "./CTA";
import { WORK_FLOW } from "@/data/process";

export function WorkflowSection() {
  return (
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
        <Reveal delay={0.12} y={24} className="mt-16">
          <CTA
            title="Construyamos tu solución"
            description="Conversemos sobre tus procesos y objetivos, y diseñemos juntos el sistema de inteligencia que tu empresa necesita."
          />
        </Reveal>
      </Container>
    </section>
  );
}
