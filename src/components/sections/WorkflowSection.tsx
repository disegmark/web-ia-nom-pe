import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { Timeline } from "./Timeline";
import { CTA } from "./CTA";
import { WORK_FLOW } from "@/data/process";

export function WorkflowSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <SectionHeader
          align="center"
          title="No se trata solamente de hablar con una IA"
          description="Se trata de conectar inteligencia con acción."
        />
        <Timeline steps={WORK_FLOW} className="mt-14" />
        <div className="mt-16">
          <CTA
            title="Construyamos tu solución"
            description="Conversemos sobre tus procesos y objetivos, y diseñemos juntos el sistema de inteligencia que tu empresa necesita."
          />
        </div>
      </Container>
    </section>
  );
}
