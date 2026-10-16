import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/animations/Reveal";
import { CONTACT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contacto",
  description:
    "Conversemos sobre tus objetivos y procesos, y diseñemos juntos el sistema de agentes iA, automatización e integraciones que tu empresa necesita.",
  path: "/contacto",
});

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Hablemos de tu proyecto"
        description="Cuéntanos qué necesitas y en qué punto está tu empresa. Te responderemos con una propuesta de diagnóstico a tu medida."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Escríbenos directamente</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Si prefieres, puedes escribirnos directamente y te responderemos a la brevedad.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="focus-ring mt-4 inline-block text-base font-medium text-cyan"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-border bg-background-elevated p-6 sm:p-8">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
