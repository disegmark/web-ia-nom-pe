import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LogoAnimation } from "./LogoAnimation";
import { CinematicCore } from "./CinematicCore";

export function Hero() {
  return (
    <section className="hero-cinematic bg-marquee-night relative isolate overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-14 lg:pb-28">
      <div aria-hidden="true" className="hero-ambient hero-ambient-one" />
      <div aria-hidden="true" className="hero-ambient hero-ambient-two" />
      <div aria-hidden="true" className="hero-scanline" />

      <Container className="relative z-10">
        <div className="grid items-center gap-7 lg:grid-cols-[1.04fr_0.96fr] lg:gap-2">
          <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="hero-kicker mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/[0.06] px-3.5 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sign-led opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-sign-led" />
              </span>
              <span className="font-mono text-[9px] font-medium tracking-[.2em] text-cyan sm:text-[10px]">
                INTELIGENCIA QUE SE PONE EN MARCHA
              </span>
            </div>

            <div className="hero-logo-wrap mb-2">
              <LogoAnimation />
            </div>

            <h1 className="hero-title max-w-2xl text-balance font-display text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-6xl md:text-7xl lg:text-[5.2rem]">
              No solo conectamos ideas.
              <span className="hero-title-accent mt-2 block">Conectamos inteligencia.</span>
            </h1>

            <p className="mt-6 max-w-xl text-balance text-base leading-7 text-muted sm:text-lg sm:leading-8">
              Diseñamos agentes de IA, automatizaciones e integraciones que convierten objetivos de negocio en sistemas capaces de actuar.
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center lg:justify-start">
              <ButtonLink href="/soluciones" variant="primary" className="hero-cta-primary">
                Descubrir soluciones <span aria-hidden="true" className="ml-2">↗</span>
              </ButtonLink>
              <ButtonLink href="/demo" variant="secondary" className="hero-cta-secondary">
                Explorar demo en vivo
              </ButtonLink>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-muted lg:justify-start">
              <span className="inline-flex items-center gap-2"><span className="hero-proof-dot" /> Agentes que ejecutan</span>
              <span className="inline-flex items-center gap-2"><span className="hero-proof-dot hero-proof-dot-amber" /> Procesos conectados</span>
              <span className="inline-flex items-center gap-2"><span className="hero-proof-dot" /> Sistemas a medida</span>
            </div>
          </div>

          <div className="hero-core-wrap relative mx-auto w-full max-w-[540px] lg:-my-5 lg:translate-x-4">
            <CinematicCore />
            <div className="hero-readout hero-readout-top">
              <span className="text-cyan">SYS / 01</span>
              <span className="text-muted">INTELLIGENCE CORE</span>
            </div>
            <div className="hero-readout hero-readout-bottom">
              <span className="text-sign-amber">LIVE SYSTEM</span>
              <span className="text-muted">IA.NOM.PE</span>
            </div>
          </div>
        </div>

        <div className="hero-bottom-line mt-5 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p className="text-xs leading-relaxed text-muted sm:text-sm">
            De una IA que responde a una inteligencia que trabaja.
          </p>
          <a href="/contacto" className="hero-text-link inline-flex items-center gap-2 self-start text-sm font-medium text-foreground sm:self-auto">
            Hablemos de tu proyecto <span aria-hidden="true">→</span>
          </a>
        </div>
      </Container>
    </section>
  );
}
