import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LogoAnimation } from "./LogoAnimation";

const HEADLINE = "Conectamos Inteligencia";

// Precomputed once at module load (not during render) so each character knows
// its global ignition order without mutating anything inside the component.
const HEADLINE_WORDS = HEADLINE.split(" ").reduce<
  { word: string; chars: { char: string; globalIndex: number }[] }[]
>((acc, word) => {
  const previous = acc[acc.length - 1];
  const start = previous ? previous.chars[previous.chars.length - 1].globalIndex + 2 : 0;
  acc.push({ word, chars: word.split("").map((char, ci) => ({ char, globalIndex: start + ci })) });
  return acc;
}, []);

/** The headline as a channel-letter sign that ignites character by character on load. */
function IgniteHeadline() {
  return (
    <h1 className="relative mt-10 max-w-3xl text-balance text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
      <span className="sr-only">{HEADLINE}</span>
      <span aria-hidden="true" className="sign-text-cyan">
        {HEADLINE_WORDS.map(({ word, chars }, wi) => (
          <span key={word} className="inline-block whitespace-nowrap">
            {chars.map(({ char, globalIndex }, ci) => (
              <span
                key={`${wi}-${ci}`}
                className="inline-block opacity-0 [animation:sign-flicker-in_0.9s_ease-out_forwards]"
                style={{ animationDelay: `${0.4 + globalIndex * 0.032}s` }}
              >
                {char}
              </span>
            ))}
            {wi < HEADLINE_WORDS.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </h1>
  );
}

export function Hero() {
  return (
    <section className="bg-marquee-night relative overflow-hidden pb-20 pt-16 sm:pt-24">
      <Container className="relative">
        <div className="flex flex-col items-center">
          <LogoAnimation />

          <IgniteHeadline />

          <p className="plate mt-8 max-w-xl px-6 py-4 text-balance text-center text-sm leading-relaxed text-muted sm:text-base">
            Diseñamos agentes de IA, automatizaciones e integraciones que convierten la
            inteligencia artificial en soluciones reales para empresas, negocios y proyectos.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sign-led/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sign-led opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sign-led" />
            </span>
            <span className="led-readout text-[11px] font-medium text-sign-led">EN LÍNEA · 24/7</span>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <ButtonLink href="/soluciones" variant="primary">
              Explorar soluciones
            </ButtonLink>
            <ButtonLink href="/contacto" variant="secondary">
              Hablar con nosotros
            </ButtonLink>
            <ButtonLink
              href="/demo"
              variant="secondary"
              className="text-sign-amber shadow-[inset_0_1px_0_rgba(244,246,251,0.08),0_0_0_1px_rgba(255,182,72,0.35)] hover:shadow-[inset_0_1px_0_rgba(244,246,251,0.12),0_0_30px_-8px_rgba(255,182,72,0.6)]"
            >
              Probar demo en vivo
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
