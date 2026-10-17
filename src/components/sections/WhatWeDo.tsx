import { ArrowDown, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/animations/Reveal";
import { Icon } from "@/components/ui/Icon";
import { WhatWeDoHub } from "@/components/illustrations/WhatWeDoHub";
import { SectionPhoto } from "./SectionPhoto";
import { WHATWEDO_BOTTOM_ROW, WHATWEDO_TOP_ROW } from "@/data/diagrams";
import { BADGE_BG, type SignAccent } from "@/components/signage/Signage";
import { cn } from "@/lib/utils";

const ACCENTS: SignAccent[] = ["cyan", "amber", "signal"];

const TEAM_PHOTO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAANABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCf7XpF3H5L2sDtEQpfy1wT125PfjH41T26PdXbG30h0gilVWEbkBkPUgD8Oh6VFeaRbRQ+dE0qNJMHIDDGRnnGKtXrYsfKUBCUU7l4PBH4UCIIX8NtOi/2dvEpG0OOR1yOT2xRVKC8lm1R57gI+512qFwFx6fhRQM//9k=";

export function WhatWeDo() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionPhoto
          src="/assets/images/equipo-conectado.webp"
          alt="Un equipo de trabajo sonríe frente a una laptop mientras líneas de luz conectan íconos de correo, calendario, gráficos y nube sobre la oficina"
          width={1376}
          height={768}
          blurDataURL={TEAM_PHOTO_BLUR}
          position="50% 40%"
          caption="Tu equipo al centro; la iA conecta y ejecuta el resto."
          className="mb-14 sm:mb-20"
        />
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeader
              title="No construimos solamente agentes que conversan"
              description="Construimos sistemas de inteligencia capaces de conectar personas, información, aplicaciones, procesos y automatizaciones dentro de un mismo flujo de trabajo."
              className="max-w-none"
            />
          </Reveal>
          <Reveal delay={0.1}><WhatWeDoHub /></Reveal>
        </div>

        <Reveal delay={0.12} y={24} className="mt-14">
          <div className="plate mx-auto max-w-4xl p-6 sm:p-10">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="sign-text-cyan font-display text-lg font-semibold">ia.nom.pe</span>
              <span className="text-xs text-muted">la placa que conecta todo lo de abajo</span>
            </div>
            <div className="mt-8 flex flex-col items-stretch gap-3 pt-8 shadow-[0_1px_0_rgba(244,246,251,0.08)_inset] sm:flex-row sm:items-center sm:justify-center">
              {WHATWEDO_TOP_ROW.map((item, index, arr) => {
                const accent = ACCENTS[index % ACCENTS.length];
                return (
                  <div key={item.title} className="flex items-center gap-3">
                    <div className="flex flex-1 items-center gap-3 rounded-xl bg-background px-4 py-3 sm:flex-col sm:items-center sm:text-center">
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", BADGE_BG[accent])}><Icon name={item.icon} className="h-4 w-4" /></span>
                      <span><span className="block text-sm font-medium text-foreground">{item.title}</span><span className="block text-xs text-muted">{item.description}</span></span>
                    </div>
                    {index < arr.length - 1 ? <ArrowRight aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-muted sm:block" /> : null}
                  </div>
                );
              })}
            </div>
            <ArrowDown aria-hidden="true" className="sign-text-cyan mx-auto mt-4 h-5 w-5" />
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-3">
              {WHATWEDO_BOTTOM_ROW.map((step, index, arr) => (
                <div key={step.title} className="flex items-center gap-3">
                  <span className="sign-text-cyan flex items-center gap-2 rounded-full bg-cyan/10 px-4 py-2 text-sm font-medium"><Icon name={step.icon} className="h-4 w-4" />{step.title}</span>
                  {index < arr.length - 1 ? <ArrowRight aria-hidden="true" className="hidden text-muted sm:block" /> : null}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
