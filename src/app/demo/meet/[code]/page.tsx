import type { Metadata } from "next";
import Link from "next/link";
import { Video } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sala de reunión de ejemplo",
  description: "Simulación de una sala de videollamada generada por el agente de demostración de ia.nom.pe.",
  path: "/demo/meet",
});

export default async function DemoMeetPage(props: PageProps<"/demo/meet/[code]">) {
  const { code } = await props.params;

  return (
    <section className="flex flex-1 items-center justify-center py-20">
      <Container className="max-w-lg text-center">
        <div className="rounded-3xl border border-border bg-background-elevated p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-cyan">
            <Video className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Sala de reunión de ejemplo</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Esto es una simulación: en un sistema real, aquí se abriría tu videollamada (Google Meet, Zoom o el
            proveedor que uses). Código de sala de ejemplo: <span className="text-cyan">{code}</span>
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/demo" variant="primary">
              Volver al demo
            </ButtonLink>
            <ButtonLink href="/contacto" variant="secondary">
              Quiero esto para mi negocio
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-muted">
            <Link href="/" className="underline-offset-2 hover:underline">
              ia.nom.pe
            </Link>{" "}
            — este enlace no crea ni conecta ninguna videollamada real.
          </p>
        </div>
      </Container>
    </section>
  );
}
