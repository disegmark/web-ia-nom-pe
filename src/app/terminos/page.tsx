import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Términos y condiciones",
  description:
    "Condiciones de uso del sitio ia.nom.pe, su chat con inteligencia artificial y la solicitud de reuniones y propuestas.",
  path: "/terminos",
});

const UPDATED = "24 de octubre de 2026";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Aceptación",
    body: (
      <p>
        Al navegar por ia.nom.pe (también presentado como iA Connexion), usar su chat o enviarnos una consulta, aceptas estos
        términos. Si no estás de acuerdo, te pedimos no usar el sitio. El tratamiento de tus datos personales se explica en
        la <Link href="/privacidad">política de privacidad</Link>.
      </p>
    ),
  },
  {
    title: "2. Qué es este sitio",
    body: (
      <p>
        ia.nom.pe presenta los servicios de diseño de agentes de inteligencia artificial, automatizaciones e integraciones para
        empresas. El contenido es informativo. Los ejemplos, demos, simuladores y cifras mostradas son ilustrativos: no
        constituyen una oferta, una garantía de resultados ni estadísticas verificadas de proyectos reales.
      </p>
    ),
  },
  {
    title: "3. Propuestas, precios y contratación",
    body: (
      <p>
        No publicamos tarifas: cada proyecto parte de un diagnóstico. Las condiciones, alcances, plazos y precios de un servicio
        solo obligan a las partes cuando constan en una propuesta o contrato firmado o aceptado por escrito. Una conversación
        por el chat, por WhatsApp o por correo no crea por sí sola un contrato.
      </p>
    ),
  },
  {
    title: "4. Chat con inteligencia artificial",
    body: (
      <>
        <p>
          El chat está atendido por un asistente de inteligencia artificial, con apoyo de personas del equipo. Sus respuestas
          son orientativas y pueden contener errores o estar incompletas; no sustituyen asesoría profesional ni una propuesta
          formal. No compartas en el chat contraseñas, datos financieros ni información sensible.
        </p>
        <p>
          El asistente puede ayudarte a solicitar una reunión. Una reunión queda coordinada cuando recibes la confirmación del
          horario; podemos reprogramarla o cancelarla por causas operativas avisándote con la mayor anticipación posible.
        </p>
      </>
    ),
  },
  {
    title: "5. Uso permitido",
    body: (
      <ul>
        <li>No uses el sitio para actividades ilegales, fraudulentas o que dañen a terceros.</li>
        <li>No intentes vulnerar la seguridad del sitio, del chat o de los sistemas conectados, ni sobrecargarlos con un uso automatizado abusivo.</li>
        <li>No envíes contenido ofensivo, malicioso ni datos de terceros sin su autorización.</li>
        <li>Debes darnos datos de contacto verdaderos cuando solicites una reunión o propuesta.</li>
      </ul>
    ),
  },
  {
    title: "6. Propiedad intelectual",
    body: (
      <p>
        Los textos, diseños, animaciones, imágenes, marcas y demás contenidos del sitio pertenecen a ia.nom.pe o se usan con
        autorización. Las marcas y logotipos de terceros que aparecen (por ejemplo, de aplicaciones con las que se puede
        integrar un agente) pertenecen a sus titulares y se muestran solo para indicar compatibilidad; no implican alianza ni
        respaldo. No puedes copiar ni reutilizar el contenido del sitio con fines comerciales sin nuestro permiso por escrito.
      </p>
    ),
  },
  {
    title: "7. Enlaces y servicios de terceros",
    body: (
      <p>
        El sitio enlaza o se apoya en servicios de terceros (como WhatsApp, Google u otras aplicaciones). No controlamos sus
        contenidos ni condiciones, y su uso se rige por sus propios términos.
      </p>
    ),
  },
  {
    title: "8. Disponibilidad y limitación de responsabilidad",
    body: (
      <p>
        Procuramos que el sitio y el chat estén disponibles, pero pueden interrumpirse por mantenimiento, fallas técnicas o de
        terceros. En la medida permitida por la ley, ia.nom.pe no responde por daños indirectos derivados del uso del sitio o de
        confiar en el contenido informativo o en las respuestas del chat, ni por interrupciones fuera de su control. Esto no
        limita los derechos que la ley reconoce a los consumidores.
      </p>
    ),
  },
  {
    title: "9. Cambios",
    body: (
      <p>
        Podemos actualizar estos términos cuando cambien el sitio, los servicios o la ley. La versión vigente es la publicada
        en esta página, con su fecha de actualización.
      </p>
    ),
  },
  {
    title: "10. Ley aplicable y contacto",
    body: (
      <p>
        Estos términos se rigen por las leyes de la República del Perú. Para cualquier consulta escríbenos a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por el <Link href="/contacto">formulario de contacto</Link>.
      </p>
    ),
  },
];

export default function TerminosPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Términos y condiciones"
        description="Las condiciones para usar ia.nom.pe, su chat con inteligencia artificial y solicitar reuniones o propuestas."
      />

      <section className="py-16 sm:py-24">
        <Container>
          <article className="mx-auto max-w-3xl [&_a]:text-cyan [&_a]:underline [&_a]:underline-offset-2 [&_li]:mt-2 [&_p+p]:mt-3 [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
            <p className="text-sm text-muted">Última actualización: {UPDATED}</p>
            <div className="mt-8 space-y-10">
              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">{section.title}</h2>
                  <div className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{section.body}</div>
                </section>
              ))}
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
