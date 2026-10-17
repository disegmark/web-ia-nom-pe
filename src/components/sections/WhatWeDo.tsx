import { Container } from "@/components/ui/Container";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "@/components/animations/Reveal";
import { WhatWeDoHub } from "@/components/illustrations/WhatWeDoHub";
import { SectionPhoto } from "./SectionPhoto";
import { ConnectivityPlate } from "./ConnectivityPlate";

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
          <ConnectivityPlate />
        </Reveal>
      </Container>
    </section>
  );
}
