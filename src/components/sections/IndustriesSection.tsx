import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { SignHeading, SignWord } from "@/components/signage/Signage";
import { IndustryShowcase } from "./IndustryShowcase";

export function IndustriesSection() {
  return (
    <section id="casos" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <Container>
        <SignHeading
          title={
            <>
              Sistemas agénticos <SignWord accent="amber">en acción</SignWord>, por rubro
            </>
          }
          description="Casos que hemos implementado en distintos rubros. Elige uno y mira cómo el agente conversa, usa sus herramientas y actualiza el panel del negocio en tiempo real."
          className="max-w-3xl"
        />
        <Reveal delay={0.08}>
          <IndustryShowcase />
        </Reveal>
      </Container>
    </section>
  );
}
