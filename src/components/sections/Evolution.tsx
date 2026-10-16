import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeader } from "./SectionHeader";
import { ProcessFlow } from "./ProcessFlow";
import { EVOLUTION_STAGES } from "@/data/process";

export function Evolution() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            title="De una iA que responde a una iA que trabaja"
            description="Cada etapa suma capacidad: de guiones fijos a un sistema que comprende, ejecuta y se conecta con el resto de tu operación."
          />
        </Reveal>
        <ProcessFlow steps={EVOLUTION_STAGES} className="mt-14" />
      </Container>
    </section>
  );
}
