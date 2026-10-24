import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad",
  description:
    "Cómo ia.nom.pe recoge, usa y protege los datos personales que compartes a través del formulario de contacto, el chat, WhatsApp y las herramientas de analítica del sitio.",
  path: "/privacidad",
});

const UPDATED = "24 de octubre de 2026";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Quién es el responsable",
    body: (
      <p>
        Este sitio web (ia.nom.pe, también presentado como iA Connexion) es operado por el equipo de ia.nom.pe, que decide
        para qué se usan los datos que recoge. Puedes escribirnos para cualquier consulta sobre tus datos a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por <a href={WHATSAPP_URL}>WhatsApp</a>.
      </p>
    ),
  },
  {
    title: "2. Qué datos recogemos y para qué",
    body: (
      <ul>
        <li>
          <strong>Formulario de contacto:</strong> nombre, correo electrónico, empresa, teléfono, necesidad y el mensaje que
          escribas. Los usamos para responderte y evaluar cómo ayudarte.
        </li>
        <li>
          <strong>Chat del sitio:</strong> los mensajes que escribes y los datos que decidas compartir en la conversación
          (por ejemplo tu nombre, un teléfono o un correo para agendar una reunión). Los usamos para responder tus preguntas
          y coordinar reuniones.
        </li>
        <li>
          <strong>WhatsApp:</strong> si nos escribes por WhatsApp compartes tu número y el contenido de tus mensajes. La
          conversación se rige además por las condiciones y la política de privacidad de WhatsApp.
        </li>
        <li>
          <strong>Datos de navegación:</strong> información técnica y estadística de uso del sitio (páginas visitadas,
          dispositivo, navegador, ubicación aproximada), obtenida con herramientas de analítica.
        </li>
      </ul>
    ),
  },
  {
    title: "3. Cómo funciona el chat y la inteligencia artificial",
    body: (
      <>
        <p>
          El chat está atendido por un asistente de inteligencia artificial conectado a nuestro sistema interno de gestión.
          Allí se guarda la conversación, y una persona del equipo puede leerla, intervenir y continuar la atención. Cuando
          pides una reunión, el asistente puede consultar disponibilidad y registrarla en nuestro calendario, y en las
          reuniones virtuales se genera un enlace de videollamada.
        </p>
        <p>
          Si ese sistema no estuviera disponible, el chat usa un servicio de inteligencia artificial de un proveedor
          externo para responder con la información pública del sitio. Por eso te recomendamos no escribir en el chat datos
          sensibles, contraseñas ni información financiera.
        </p>
      </>
    ),
  },
  {
    title: "4. Cookies y analítica",
    body: (
      <p>
        Usamos Google Tag Manager y Google Analytics para medir cómo se usa el sitio y mejorarlo. Estas herramientas pueden
        colocar cookies o identificadores en tu navegador y enviar datos de uso a Google. Puedes bloquearlas o eliminarlas
        desde la configuración de tu navegador, o instalar el complemento de inhabilitación de Google Analytics. Además,
        guardamos en tu navegador un identificador anónimo para que el chat recuerde tu conversación al volver.
      </p>
    ),
  },
  {
    title: "5. Con quién compartimos los datos",
    body: (
      <>
        <p>No vendemos tus datos. Solo los compartimos con proveedores que hacen posible el servicio, cada uno con su propia política:</p>
        <ul>
          <li>Google (analítica y calendario/videollamadas para agendar reuniones).</li>
          <li>Meta, por WhatsApp, cuando eliges ese canal.</li>
          <li>Proveedores de inteligencia artificial y de alojamiento que procesan la información para prestar el servicio.</li>
        </ul>
        <p>También podríamos divulgar datos si una autoridad competente lo exige conforme a la ley.</p>
      </>
    ),
  },
  {
    title: "6. Cuánto tiempo los conservamos",
    body: (
      <p>
        Conservamos los datos el tiempo necesario para atender tu consulta, coordinar o dar seguimiento a reuniones y cumplir
        obligaciones legales. Cuando dejan de ser necesarios, los eliminamos o anonimizamos.
      </p>
    ),
  },
  {
    title: "7. Tus derechos",
    body: (
      <p>
        De acuerdo con la Ley N.º 29733, Ley de Protección de Datos Personales del Perú, puedes solicitar acceso,
        rectificación, cancelación u oposición respecto de tus datos, y retirar tu consentimiento cuando corresponda. Escríbenos
        a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> indicando qué quieres hacer y cómo identificarte, y te
        responderemos dentro de los plazos legales.
      </p>
    ),
  },
  {
    title: "8. Seguridad",
    body: (
      <p>
        Aplicamos medidas razonables para proteger los datos, como conexiones cifradas (HTTPS) y acceso restringido a los
        sistemas donde se guardan. Ningún sistema es completamente infalible, por lo que no podemos garantizar una seguridad
        absoluta.
      </p>
    ),
  },
  {
    title: "9. Menores de edad",
    body: <p>El sitio y el chat están dirigidos a empresas y personas adultas. No recogemos intencionalmente datos de menores de edad.</p>,
  },
  {
    title: "10. Cambios en esta política",
    body: (
      <p>
        Podemos actualizar esta política cuando cambien el sitio o la ley. Publicaremos la versión vigente en esta página, con
        su fecha de actualización.
      </p>
    ),
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Política de privacidad"
        description="Qué datos recogemos en ia.nom.pe, para qué los usamos y cómo puedes ejercer tus derechos."
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
            <p className="mt-12 text-sm text-muted">
              ¿Dudas? <Link href="/contacto">Contáctanos</Link>.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
