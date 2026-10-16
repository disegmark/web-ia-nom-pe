import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { CTA } from "@/components/sections/CTA";
import { DemoTabs } from "@/components/demo/DemoTabs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Demo interactivo",
  description:
    "Prueba en vivo un sistema agéntico de iA funcional 24/7 — un agente de ejemplo y su panel de control, abierto al público, sin conexión a sistemas o datos reales.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Demo interactivo"
        title="Testea cómo funciona un Sistema Agéntico de iA funcional 24/7"
        description="Conversa con un agente de ejemplo para un negocio ficticio (Café Aurora) y mira cómo se vería su panel de control. Construimos sistemas agénticos personalizados y funcionales 24/7 para cualquier rubro o tipo de negocio — este demo es abierto al público solo para que veas cómo se sentiría, no está conectado a sistemas, clientes ni datos reales."
      />

      <section className="py-16 sm:py-20">
        <Container className="max-w-4xl">
          <Reveal>
            <DemoTabs />
          </Reveal>
          <p className="mt-6 text-center text-xs leading-relaxed text-muted">
            No compartas datos personales reales: nada de lo que hagas aquí queda guardado ni conectado a ningún
            sistema de producción — es solo para que veas cómo se sentiría.
          </p>
        </Container>
      </section>

      <section className="pb-20 sm:pb-28">
        <Container>
          <CTA
            title="Cada sistema se diseña a la medida de tu negocio"
            description="Este demo es solo un ejemplo. Para cada cliente construimos el agente, el conocimiento, las integraciones (WhatsApp, CRM, calendario, correo) y el panel de control a la medida de sus procesos reales — no una plantilla genérica."
            primaryLabel="Hablemos de tu proyecto"
            primaryHref="/contacto"
            secondaryLabel="Ver soluciones"
            secondaryHref="/soluciones"
          />
        </Container>
      </section>
    </>
  );
}
