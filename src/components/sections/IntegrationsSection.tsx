import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { SignHeading, SignWord } from "@/components/signage/Signage";
import { IntegrationsHub } from "./IntegrationsHub";

export function IntegrationsSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <SignHeading
          title={
            <>
              Conectamos tus <SignWord>herramientas</SignWord>
            </>
          }
          description="La inteligencia aumenta su utilidad cuando puede interactuar con los sistemas que la empresa ya utiliza."
        />
        <Reveal delay={0.08}>
          <IntegrationsHub />
        </Reveal>
      </Container>
    </section>
  );
}
