import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { KnowledgeFlow } from "@/components/illustrations/KnowledgeFlow";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { KNOWLEDGE_HIGHLIGHTS, KNOWLEDGE_SOURCES } from "@/data/diagrams";
import { SignPlate, SignTag, TEXT_GLOW, type SignAccent } from "@/components/signage/Signage";
import { cn } from "@/lib/utils";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

export function KnowledgeSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              title="Inteligencia con el conocimiento de tu empresa"
              description="Los agentes pueden trabajar utilizando información propia de la organización, en lugar de responder solo con conocimiento genérico."
              className="max-w-none"
            />

            <div className="mt-8 grid grid-cols-3 gap-3">
              {KNOWLEDGE_HIGHLIGHTS.map((highlight, index) => (
                <SignPlate
                  key={highlight.title}
                  icon={highlight.icon}
                  title={highlight.title}
                  description={highlight.description}
                  accent={ACCENTS[index % ACCENTS.length]}
                  delay={index * 0.05}
                  className="text-left"
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/contacto" variant="primary">
                Conecta el conocimiento de tu empresa
              </ButtonLink>
              <ButtonLink href="/agentes-ia" variant="ghost">
                Conoce más
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-6">
            <Reveal delay={0.1}>
              <KnowledgeFlow />
            </Reveal>

            <Reveal delay={0.15}>
              <div className="plate p-6 sm:p-8">
                <p className={cn("font-display text-sm font-semibold", TEXT_GLOW.amber)}>¿Qué es RAG, en simple?</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Una forma de permitir que la IA consulte información propia antes de responder o
                  actuar, en lugar de depender solo de lo que ya sabe de forma genérica.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {KNOWLEDGE_SOURCES.map((source, index) => (
                    <SignTag key={source.title} accent={ACCENTS[index % ACCENTS.length]}>
                      {source.title}
                    </SignTag>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
