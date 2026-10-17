import type { BlogBlock, BlogCategory, BlogPost } from "@/types";

type BlogPostInput = Omit<BlogPost, "readingTime">;

// Newest first. Articles describe systems iA Connexion has built and deployed; client names are
// withheld, and only features those systems actually implement are described.
const POSTS: BlogPostInput[] = [
  {
    slug: "seis-sistemas-agenticos-en-produccion",
    title: "Seis sistemas agénticos en producción: lo que aprendimos por rubro",
    excerpt:
      "Consultorios, una clínica, una importadora, una academia, una agencia y una empresa de tecnología. Qué hace cada sistema, qué herramientas usa el agente y qué patrones se repiten.",
    date: "2026-10-16",
    category: "Casos reales",
    tags: ["Casos", "WhatsApp", "Panel de control", "Industrias"],
    cta: { label: "Ver los casos funcionando", href: "/soluciones" },
    content: [
      "En los últimos meses pasamos de explicar qué es un agente iA a tener sistemas trabajando todos los días en negocios reales. Reservamos los nombres de nuestros clientes, pero sí podemos contar qué hace cada sistema, porque es la mejor forma de entender qué esperar de uno.",
      { heading: "Salud: recepción virtual y agenda" },
      "Para un consultorio médico construimos una recepcionista virtual por WhatsApp: atiende a los pacientes, consulta la disponibilidad, reserva, reprograma o cancela turnos, y pasa la conversación a una persona cuando hace falta. El equipo ve todo en un panel en tiempo real y puede tomar el control de cualquier conversación.",
      "Para una clínica de salud femenina, el foco fue distinto: responder dudas solo con la información aprobada por la clínica, guardada en su base de conocimiento, y agendar citas por WhatsApp o desde el chat de la web.",
      { heading: "Comercio: precios, stock y pedidos en vivo" },
      "Una empresa de importaciones y venta por mayor necesitaba que el agente consultara precios y stock en vivo, creara pedidos que reservan stock y registrara encargos de importación. Los casos complejos escalan a modelos de IA más potentes o a una persona.",
      { heading: "Educación: inscripciones y asesorías" },
      "En una academia de capacitación, el agente informa sobre los cursos, registra inscripciones con su estado de pago y agenda, reprograma o cancela asesorías conectadas a Google Calendar y Google Meet.",
      { heading: "Marketing y servicios B2B: prospectos calificados" },
      "Para una agencia de marketing, la recepcionista virtual califica prospectos y agenda reuniones, y el panel suma herramientas de IA para estudios de mercado, ideas de anuncios y presentaciones. Para una empresa de servicios tecnológicos, el chatbot de la web responde solo sobre los servicios de la empresa, sin salirse del tema, y deriva a ventas a quienes muestran interés.",
      { heading: "Lo que se repite en todos" },
      {
        list: [
          "El agente no solo responde: ejecuta acciones concretas (reservar, crear un pedido, registrar una inscripción).",
          "Siempre hay un panel donde el equipo ve las conversaciones y puede intervenir.",
          "La derivación a una persona está prevista desde el diseño, no como parche.",
          "WhatsApp es el canal principal; el chat web lo complementa.",
        ],
      },
      "En la página de soluciones puedes ver cada caso funcionando, con una conversación de ejemplo y el panel que se actualiza mientras el agente trabaja.",
    ],
  },
  {
    slug: "demo-abierto-sistema-agentico-24-7",
    title: "Demo abierto: prueba un sistema agéntico 24/7 sin compromiso",
    excerpt:
      "Publicamos un demo interactivo con un negocio ficticio, Café Aurora: conversa con el agente por chat web o WhatsApp simulado, agenda una reserva y recorre su panel de control.",
    date: "2026-09-28",
    category: "Producto",
    tags: ["Demo", "Chat web", "WhatsApp", "Panel de control"],
    cta: { label: "Probar el demo", href: "/demo" },
    content: [
      "Explicar un sistema agéntico con palabras tiene un límite. Por eso abrimos al público un demo en ia.nom.pe/demo: un agente de ejemplo para Café Aurora, una cafetería-restaurante ficticia en Lima con sazón peruana, y el panel de control que vería su equipo.",
      { heading: "Qué puedes probar" },
      {
        list: [
          "Conversación web: pregunta por el menú, el horario, el delivery o pide una reserva.",
          "WhatsApp: la misma experiencia en una simulación del canal donde más conversan tus clientes.",
          "Panel de control: dashboard, conversaciones, calendario, contactos, ventas y leads, marketing, automatizaciones, oficina, logística, conexiones y reportes.",
        ],
      },
      "Cuando pides una reserva, el agente usa una herramienta para agendarla y la cita aparece en el calendario del panel. Si pides una reunión, genera una videollamada de ejemplo. Es la diferencia entre un chatbot y un agente: la conversación termina en una acción.",
      { heading: "Seguro por diseño" },
      "El demo no está conectado a ningún sistema real: no hay base de datos, pagos, CRM ni calendarios reales, y nada de lo que hagas queda guardado. El agente tiene reglas estrictas: no pide datos personales, no sale de su personaje y no responde temas ajenos al negocio de ejemplo.",
      {
        note: "Café Aurora es solo un ejemplo. En un proyecto real construimos el agente, el conocimiento, las integraciones y el panel a la medida de los procesos de cada negocio.",
      },
    ],
  },
  {
    slug: "panel-de-control-toma-de-control-humano",
    title: "El panel de control: donde el equipo humano toma el mando",
    excerpt:
      "Un agente iA no debería ser una caja negra. Así es el panel que acompaña a cada sistema: conversaciones en tiempo real, toma de control humano, agenda, ventas y reportes.",
    date: "2026-09-08",
    category: "Producto",
    tags: ["Panel de control", "Toma de control humano", "Operación"],
    cta: { label: "Ver el panel en el demo", href: "/demo" },
    content: [
      "Una de las preguntas más frecuentes cuando hablamos de agentes iA es: ¿y si el agente se equivoca? Nuestra respuesta es que el agente nunca trabaja solo. Cada sistema que entregamos incluye un panel de control donde el equipo ve lo que pasa y puede intervenir en cualquier momento.",
      { heading: "Conversaciones en tiempo real" },
      "Todas las conversaciones de WhatsApp y del chat web llegan a un solo lugar. El panel distingue las que el agente resolvió de las que esperan a una persona, y cualquier miembro del equipo puede tomar el control de una conversación con un clic. Cuando termina, el agente retoma.",
      { heading: "Los módulos que usa la operación" },
      {
        list: [
          "Agenda o turnos: citas, reservas y asesorías que el agente crea, reprograma o cancela.",
          "Contactos, ventas y leads: quién escribió, qué necesita y en qué etapa está.",
          "Pedidos, inventario o inscripciones, según el rubro.",
          "Marketing y oficina: herramientas de IA para campañas, estudios de mercado, presentaciones y documentos.",
          "Conexiones y configuración: canales, integraciones, usuarios y sedes.",
          "Reportes: indicadores para medir cuánto resuelve el agente y dónde hace falta ajustar.",
        ],
      },
      "No todos los negocios necesitan todos los módulos. El panel se arma con lo que la operación realmente usa: un consultorio necesita turnos y toma de control; una importadora, pedidos e inventario.",
      { heading: "Por qué importa" },
      "El panel convierte al agente en un miembro más del equipo: visible, medible y supervisado. Esa transparencia es lo que permite confiarle tareas reales.",
    ],
  },
  {
    slug: "base-de-conocimiento-agente-con-tu-informacion",
    title: "Base de conocimiento: un agente que responde con tu información",
    excerpt:
      "Un agente útil no improvisa: consulta documentos, políticas y catálogos de la empresa antes de responder. Así funciona el flujo de conocimiento detrás de cada sistema.",
    date: "2026-08-18",
    category: "Fundamentos",
    tags: ["Base de conocimiento", "RAG", "Documentos"],
    cta: { label: "Ver cómo funciona", href: "/agentes-ia" },
    content: [
      "Los modelos de IA saben mucho de todo, pero nada de tu negocio: tus precios, tus horarios, tus políticas de cambio o las indicaciones que das a un paciente antes de un control. Para que un agente responda bien, necesita consultar la información de la empresa antes de contestar.",
      { heading: "Cómo funciona" },
      {
        list: [
          "Reunimos la información aprobada: documentos, preguntas frecuentes, catálogos, políticas.",
          "La organizamos en una base de conocimiento que el agente puede consultar.",
          "Ante cada pregunta, el agente busca los fragmentos relevantes y responde a partir de ellos.",
          "Si la respuesta no está en la base, no la inventa: lo dice o deriva a una persona.",
        ],
      },
      "A esta técnica se la conoce como generación aumentada por recuperación (RAG). En la práctica significa que el agente responde con tu información, no con suposiciones.",
      { heading: "Un caso concreto" },
      "En la clínica de salud femenina donde implementamos este enfoque, el agente resuelve dudas usando solo las indicaciones aprobadas por la clínica y, cuando corresponde, agenda la cita en la misma conversación. Lo que el agente dice es lo que la clínica decidió decir.",
      {
        note: "La base de conocimiento se mantiene viva: cuando cambia un precio o una política, se actualiza la fuente y el agente responde con la versión nueva.",
      },
    ],
  },
  {
    slug: "salvaguardas-agente-que-no-promete-lo-que-no-hizo",
    title: "Salvaguardas: cómo evitamos que un agente prometa lo que no hizo",
    excerpt:
      "Mantenerse en el tema, verificar que cada acción se ejecutó y escalar a tiempo. Las reglas que aplicamos para que un agente sea confiable en producción.",
    date: "2026-07-27",
    category: "Guías",
    tags: ["Seguridad", "Calidad", "Escalamiento"],
    cta: { label: "Conversemos sobre tu caso", href: "/contacto" },
    content: [
      "Un agente que conversa bien no es necesariamente un agente confiable. En producción, lo que importa es que haga lo que dice que hizo, que no se salga de su rol y que sepa cuándo pedir ayuda. Estas son algunas salvaguardas que aplicamos en los sistemas que construimos.",
      { heading: "1. Mantenerse en el tema" },
      "El chatbot que hicimos para una empresa de servicios tecnológicos responde solo sobre los servicios de la empresa. Si alguien le pide una receta de cocina, lo dice con amabilidad y vuelve a lo suyo. Un agente acotado es más útil y más difícil de manipular.",
      { heading: "2. Verificar que la acción se ejecutó" },
      "Los modelos de IA a veces dan por hecho algo que no hicieron. En el sistema de una importadora, si el modelo afirma que creó un pedido sin haber ejecutado la acción, el sistema le pide corregir y, si insiste, deriva la conversación a una persona. El cliente nunca recibe una confirmación falsa.",
      { heading: "3. Escalar por niveles" },
      "No todas las consultas son iguales. Las simples las resuelve un modelo rápido; las complejas escalan a modelos más potentes; y las que requieren criterio humano pasan a una persona, que toma el control desde el panel.",
      { heading: "4. Permisos mínimos y datos protegidos" },
      "Cada agente accede solo a las herramientas y datos que necesita, con credenciales protegidas. En el demo público vamos más allá: no hay ninguna conexión real y el agente no pide ni guarda datos personales.",
      "Estas reglas no son un extra: son parte del diseño desde el primer día.",
    ],
  },
  {
    slug: "marketing-con-ia-en-el-mismo-sistema",
    title: "Marketing con IA dentro del mismo sistema: estudios, carruseles, avatares y catálogos",
    excerpt:
      "El panel de control también sirve para crear: estudios de mercado, ideas de anuncios, carruseles, catálogos virtuales, avatares en vivo y presentaciones generadas con IA.",
    date: "2026-07-06",
    category: "Marketing con IA",
    tags: ["Marketing", "Estudio de mercado", "Contenido", "Presentaciones"],
    cta: { label: "Explorar el módulo de marketing", href: "/demo" },
    content: [
      "Trabajando con una agencia de marketing nos dimos cuenta de algo: el mismo sistema que atiende y califica prospectos puede ayudar a preparar lo que viene después. Así nacieron las herramientas de marketing y oficina integradas en el panel.",
      { heading: "Herramientas de marketing" },
      {
        list: [
          "Mercado IA: estudios de mercado por negocio o cliente — quién compite, qué cobra, qué busca la gente — y nuevas ideas de anuncios a partir de ese análisis.",
          "Carruseles: de una idea o un conjunto de imágenes a láminas listas para redes.",
          "Avatares en vivo: un avatar que responde los comentarios durante una transmisión.",
          "Catálogos virtuales: de un PDF a un catálogo navegable para compartir.",
          "Conversión de video: archivos MP4, MOV, AVI, WebM y más, al formato que necesites.",
        ],
      },
      { heading: "Herramientas de oficina" },
      {
        list: [
          "Slides: presentaciones y propuestas generadas con IA a partir de una idea.",
          "Cotizaciones: seguimiento de cada pedido de precio, de “por cotizar” a “aceptada”.",
          "Conversión de documentos: Word, Excel, PowerPoint, PDF e imágenes entre formatos.",
        ],
      },
      "En el caso de la agencia, el flujo completo ocurre en un solo lugar: el agente califica al prospecto y agenda la reunión; antes de la reunión, el equipo prepara un estudio de su mercado y una presentación con IA.",
      "Puedes recorrer estas herramientas en el panel del demo, en las secciones Marketing y Oficina.",
    ],
  },
  {
    slug: "integraciones-y-automatizacion-conectar-sistemas",
    title: "Integraciones y automatización: conectar WhatsApp, Calendar, CRM y más",
    excerpt:
      "Un agente aislado no transforma una operación. Cómo conectamos canales, calendarios, hojas de cálculo, CRM, bases de datos y flujos de automatización alrededor del agente.",
    date: "2026-06-15",
    category: "Guías",
    tags: ["Integraciones", "Automatización", "n8n", "Google Calendar"],
    cta: { label: "Ver el ecosistema de integraciones", href: "/integraciones" },
    content: [
      "El valor de un agente iA crece con cada sistema al que se conecta. Si puede leer la agenda, crear el evento con su enlace de Meet, registrar el lead en el CRM y avisar al equipo por correo, deja de ser un asistente y se convierte en parte de la operación.",
      { heading: "Las conexiones más comunes" },
      {
        list: [
          "Canales: WhatsApp Business, chat web, redes sociales y correo.",
          "Agenda: Google Calendar y Google Meet para citas, reservas y asesorías.",
          "Datos: hojas de cálculo, bases de datos, inventarios y sistemas propios vía API.",
          "Comercial: CRM para contactos, prospectos y seguimiento.",
          "Automatización: flujos en n8n que reaccionan a eventos y ejecutan tareas repetitivas.",
        ],
      },
      { heading: "Cómo lo organizamos" },
      "Pensamos las integraciones como un ecosistema con módulos claros: bases de datos que centralizan la información, almacenamiento en la nube, analítica, flujos de trabajo, agentes de IA, gestión de documentos, sincronización entre sistemas mediante eventos o webhooks, seguridad con credenciales y permisos mínimos, y automatización de tareas repetitivas.",
      "No hace falta conectarlo todo el primer día. Empezamos por las herramientas que el negocio ya usa — muchas veces una agenda y una hoja de cálculo — y sumamos integraciones a medida que el sistema demuestra valor.",
    ],
  },
  {
    slug: "como-elegir-la-solucion-ia-para-tu-negocio",
    title: "¿Por dónde empezar? Cómo elegir la solución iA para tu negocio en 4 preguntas",
    excerpt:
      "Rubro, objetivos, canales y herramientas actuales. Las cuatro preguntas con las que orientamos cada proyecto, ahora en un buscador guiado en la web.",
    date: "2026-05-25",
    category: "Guías",
    tags: ["Diagnóstico", "Primeros pasos", "Soluciones"],
    cta: { label: "Usar el buscador de soluciones", href: "/#encuentra" },
    content: [
      "Cuando un negocio nos escribe, rara vez llega con una especificación técnica. Llega con un problema: no alcanza a responder los WhatsApp, pierde reservas, no hace seguimiento a los interesados. Para pasar de ese problema a una propuesta concreta usamos cuatro preguntas, que ahora puedes responder tú mismo en el buscador guiado de la página de inicio.",
      { heading: "1. ¿En qué rubro estás?" },
      "Salud, comercio, educación, marketing, servicios o cualquier otro. El rubro nos dice qué caso implementado está más cerca del tuyo y qué podemos reutilizar.",
      { heading: "2. ¿Qué debe hacer el sistema?" },
      "Atender 24/7, agendar citas, vender y tomar pedidos, gestionar inscripciones y pagos, captar prospectos, responder con tu información o crear marketing con IA. Recomendamos elegir hasta tres objetivos: empezar enfocado da mejores resultados.",
      { heading: "3. ¿Por dónde te escriben tus clientes?" },
      "WhatsApp, el chat de tu web, Instagram y Facebook, o correo. El agente vive donde ya están tus clientes.",
      { heading: "4. ¿Qué herramientas usas hoy?" },
      "Google Calendar, hojas de cálculo, un CRM, un ERP o sistema propio — o ninguna todavía. Eso define qué integraciones evaluar.",
      {
        note: "Con esas respuestas, el buscador arma una propuesta con las herramientas del agente y los módulos del panel. No hay tarifas públicas: cada proyecto empieza con un diagnóstico.",
      },
    ],
  },
  {
    slug: "agentes-ia-en-marketing-digital",
    title: "Agentes iA en marketing digital: automatización y personalización",
    excerpt:
      "Automatización de interacciones, segmentación de audiencia y contenido personalizado: el rol de los agentes iA dentro de una estrategia de marketing digital.",
    date: "2026-03-23",
    category: "Marketing con IA",
    tags: ["Marketing", "Leads", "Personalización"],
    content: [
      "Automatización y personalización son dos pilares del marketing digital moderno, y los agentes iA pueden sostener ambos a la vez. Del lado de la automatización, un agente puede resolver preguntas frecuentes, capturar leads (correos, teléfonos) durante la conversación, y segmentar audiencias según la información que el propio usuario proporciona.",
      "Del lado de la personalización, un agente puede analizar el comportamiento y las preferencias del usuario para ofrecer recomendaciones relevantes, entregar contenido acorde a sus intereses, y enviar mensajes u ofertas ajustados a su historial — todo dentro de una misma conversación fluida.",
      "El resultado combinado mejora la experiencia del cliente: respuestas rápidas y relevantes disponibles en cualquier momento, lo que incrementa tanto la satisfacción como la probabilidad de conversión.",
      "Comercio electrónico, servicios financieros y empresas de viajes ya utilizan este enfoque para gestionar reservas, recomendar productos y resolver consultas — demostrando que automatización y personalización no son objetivos opuestos, sino complementarios cuando se diseñan bien.",
      "Integrar agentes iA en una estrategia de marketing digital no reemplaza la estrategia: la potencia, dándole capacidad de ejecución conversacional a gran escala.",
    ],
  },
  {
    slug: "agentes-ia-en-atencion-al-cliente",
    title: "Agentes iA en atención al cliente: mejorando la experiencia",
    excerpt:
      "Respuestas rápidas, disponibilidad continua y manejo de preguntas frecuentes: cómo los agentes iA están transformando el servicio al cliente sin reemplazar el criterio humano.",
    date: "2026-03-09",
    category: "Fundamentos",
    tags: ["Atención al cliente", "24/7"],
    content: [
      "La expectativa del cliente actual es clara: respuestas rápidas y efectivas, sin importar la hora. Los agentes iA cubren esa expectativa al estar disponibles las 24 horas, los 7 días de la semana, sin las esperas típicas de una línea telefónica o un correo sin responder.",
      "Gran parte de las consultas de atención al cliente son preguntas frecuentes que se repiten constantemente. Un agente bien configurado las resuelve con precisión y consistencia, liberando al equipo humano para los casos que realmente requieren un criterio experto.",
      "Más allá de responder, un agente puede automatizar procesos completos: programación de citas, seguimiento de pedidos, resolución de problemas técnicos básicos y recopilación ordenada de información del cliente — reduciendo tiempos de espera y errores manuales.",
      "La personalización también es posible: al analizar el historial e interacciones previas, el agente puede adaptar sus respuestas y recomendaciones a cada cliente, acercando la experiencia digital a una atención genuinamente individual.",
      "Comercio electrónico, viajes y turismo, y servicios financieros son solo algunos de los sectores donde este enfoque ya demuestra resultados: menos fricción, más consistencia, y un equipo humano enfocado en lo que realmente necesita su atención.",
    ],
  },
  {
    slug: "como-implementar-un-agente-ia-en-tu-negocio",
    title: "Cómo implementar un agente iA en tu negocio",
    excerpt:
      "Los pasos clave para llevar un agente de inteligencia artificial a tu operación, sin importar si gestionas una tienda en línea, un restaurante o un consultorio.",
    date: "2026-02-24",
    category: "Guías",
    tags: ["Primeros pasos", "Implementación"],
    content: [
      "Implementar un agente iA con éxito empieza antes de cualquier configuración técnica: empieza por definir objetivos. ¿Buscas mejorar la atención al cliente, aumentar la conversión de ventas, o automatizar procesos internos como reservas o programación de citas? Tener claridad aquí determina todo lo que sigue.",
      "El segundo paso es explorar qué necesita realmente tu negocio en términos de personalización, integración con tus sistemas actuales y facilidad de mantenimiento. No todas las soluciones son iguales, y un agente que no puede integrarse con tu CRM o tu correo pierde buena parte de su valor.",
      "El tercer paso es el diseño de la conversación: el lenguaje y tono deben alinearse con la personalidad de tu marca, el flujo debe guiar al usuario con lógica, y las respuestas deben ser precisas y útiles — no genéricas.",
      "Los casos de uso lo ilustran bien: una tienda en línea puede usar un agente para ayudar a encontrar productos y procesar pedidos dentro de la misma conversación; un restaurante puede gestionar reservas y pedidos; un consultorio puede programar citas y resolver dudas frecuentes de pacientes, siempre con derivación profesional cuando corresponde.",
      "Sea cual sea tu sector, el potencial está en la misma idea: convertir una conversación en una acción concreta dentro de tu operación.",
    ],
  },
  {
    slug: "de-chatbot-a-agente-ia",
    title: "De chatbot a agente iA: por qué el concepto está cambiando",
    excerpt:
      "Un chatbot responde con guiones. Un agente iA comprende contexto, consulta información propia y ejecuta tareas. Esta es la diferencia que está redefiniendo la atención digital.",
    date: "2026-02-10",
    category: "Fundamentos",
    tags: ["Agentes iA", "Chatbots"],
    content: [
      "Durante años, integrar un asistente conversacional en una web o en campañas de redes sociales significó una cosa: un chatbot con reglas fijas, capaz de responder preguntas frecuentes y poco más. Ese modelo trajo beneficios reales — atención instantánea, disponibilidad continua, reducción de trabajo repetitivo — pero también un techo claro: no entendía contexto ni podía actuar más allá de responder.",
      "La inteligencia artificial actual permite ir más lejos. Un agente iA no solo conversa: comprende el contexto de lo que se le pregunta, puede consultar información exclusiva de la empresa antes de responder, ejecutar tareas autorizadas dentro de un sistema, conectarse con herramientas externas y, cuando la situación lo requiere, derivar la conversación a una persona.",
      "Esto no significa descartar los beneficios que ya conocíamos de la atención automatizada: atención 24/7, respuestas naturales y personalizadas, generación de leads, acceso rápido a documentación de la empresa y mejora en la retención de clientes. Significa llevarlos un paso más allá, dentro de un sistema capaz de actuar y no solo de responder.",
      "En ia.nom.pe partimos de esa evolución: de un agente que responde a un agente que trabaja, conectado a los procesos reales del negocio.",
    ],
  },
];

const WORDS_PER_MINUTE = 180;

function blockText(block: BlogBlock): string {
  if (typeof block === "string") return block;
  if ("heading" in block) return block.heading;
  if ("list" in block) return block.list.join(" ");
  return block.note;
}

function readingTime(post: BlogPostInput): string {
  const words = [post.title, ...post.content.map(blockText)].join(" ").split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min`;
}

export const BLOG_POSTS: BlogPost[] = POSTS.map((post) => ({ ...post, readingTime: readingTime(post) })).sort(
  (a, b) => b.date.localeCompare(a.date),
);

export const BLOG_CATEGORIES: BlogCategory[] = ["Casos reales", "Producto", "Guías", "Fundamentos", "Marketing con IA"];

/** Same-category posts first, then the most recent others. */
export function relatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  const others = BLOG_POSTS.filter((item) => item.slug !== slug);
  if (!post) return others.slice(0, limit);
  const sameCategory = others.filter((item) => item.category === post.category);
  const rest = others.filter((item) => item.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
