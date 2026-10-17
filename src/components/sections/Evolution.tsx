import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeader } from "./SectionHeader";
import { LivingSystemImage } from "./LivingSystemImage";
import { WORKS_PRESET } from "@/data/living-image";
import { ProcessFlow } from "./ProcessFlow";
import { EVOLUTION_STAGES } from "@/data/process";

export function Evolution() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
          <Reveal>
            <SectionHeader
              title="De una iA que responde a una iA que trabaja"
              description="Cada etapa suma capacidad: de guiones fijos a un sistema que comprende, ejecuta y se conecta con el resto de tu operación."
              className="max-w-none"
            />
          </Reveal>
          <LivingSystemImage
            preset={WORKS_PRESET}
            className="max-lg:order-first"
          />
        </div>
        <ProcessFlow steps={EVOLUTION_STAGES} className="mt-14" />
      </Container>
    </section>
  );
}
