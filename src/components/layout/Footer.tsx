import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { FOOTER_LINKS, CONTACT_EMAIL } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background-elevated shadow-[0_1px_0_rgba(244,246,251,0.08)_inset]">
      <Container className="flex flex-col gap-10 py-14 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="sign-text-amber mt-4 text-sm uppercase tracking-[0.25em]">
            Abierto 24 horas
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Diseñamos agentes de IA, automatizaciones e integraciones inteligentes para
            empresas, negocios y proyectos.
          </p>
        </div>

        <nav aria-label="Enlaces del sitio" className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-1">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring text-sm text-muted transition-colors hover:text-cyan"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="max-w-xs">
          <p className="text-sm font-medium text-foreground">Escríbenos</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="focus-ring mt-2 inline-block text-sm text-muted transition-colors hover:text-cyan"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 py-6 text-xs text-muted shadow-[0_1px_0_rgba(244,246,251,0.08)_inset] sm:flex-row sm:justify-between">
        <p>© {year} ia.nom.pe — Todos los derechos reservados.</p>
        <p>Conectamos inteligencia con personas, datos, herramientas y procesos.</p>
      </Container>
    </footer>
  );
}
