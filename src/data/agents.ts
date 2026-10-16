import type { AgentArea } from "@/types";

/**
 * Áreas donde puede desarrollarse un agente iA. No implica que estas
 * soluciones ya estén implementadas para todo cliente: son ámbitos de
 * aplicación, no un catálogo cerrado de productos.
 */
export const AGENT_AREAS: AgentArea[] = [
  {
    slug: "ventas",
    name: "Ventas",
    description:
      "Agentes que acompañan al prospecto desde la primera pregunta hasta la cotización, calificando interés y consultando disponibilidad en tiempo real.",
    capabilities: [
      "Responde con el catálogo y las condiciones reales del negocio",
      "Califica leads y los deriva al equipo correcto",
      "Da seguimiento sin perder el hilo de la conversación",
    ],
    icon: "sales",
  },
  {
    slug: "atencion",
    name: "Atención",
    description:
      "Agentes de soporte que entienden el contexto del cliente y resuelven consultas frecuentes las 24 horas, escalando a una persona cuando el caso lo requiere.",
    capabilities: [
      "Disponibilidad continua en Web, WhatsApp y redes sociales",
      "Consulta información propia de la empresa antes de responder",
      "Deriva a un asesor humano en casos complejos",
    ],
    icon: "support",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description:
      "Agentes que segmentan audiencias, personalizan mensajes y mantienen la conversación activa en campañas digitales.",
    capabilities: [
      "Personalización de mensajes según el interés del usuario",
      "Recolección estructurada de datos para nutrición de leads",
      "Coordinación con campañas en redes sociales y buscadores",
    ],
    icon: "marketing",
  },
  {
    slug: "operaciones",
    name: "Operaciones",
    description:
      "Agentes que ejecutan tareas operativas repetitivas: reservas, agendamiento, seguimiento de pedidos y coordinación interna.",
    capabilities: [
      "Gestión de reservas y citas conectada a la agenda real",
      "Seguimiento de pedidos y estados de proceso",
      "Reducción de tareas manuales repetitivas",
    ],
    icon: "operations",
  },
  {
    slug: "investigacion",
    name: "Investigación",
    description:
      "Agentes que organizan y consultan información dispersa para acelerar el análisis y la toma de decisiones.",
    capabilities: [
      "Consulta de documentos, manuales y bases de conocimiento propias",
      "Síntesis de información para apoyar decisiones",
      "Organización de hallazgos de forma estructurada",
    ],
    icon: "research",
  },
  {
    slug: "administracion",
    name: "Administración",
    description:
      "Agentes que apoyan procesos administrativos: clasificación de solicitudes, generación de reportes y comunicación interna.",
    capabilities: [
      "Clasificación y priorización de solicitudes entrantes",
      "Generación de reportes y resúmenes de actividad",
      "Automatización de comunicaciones internas recurrentes",
    ],
    icon: "admin",
  },
  {
    slug: "datos",
    name: "Datos",
    description:
      "Agentes que recopilan, ordenan y conectan datos entre los sistemas que ya usa la empresa.",
    capabilities: [
      "Recopilación estructurada de datos durante la interacción",
      "Conexión con CRM y bases de datos existentes",
      "Base para reportes y decisiones basadas en información real",
    ],
    icon: "data",
  },
];
