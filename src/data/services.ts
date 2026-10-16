import type { Service } from "@/types";

export const SERVICES: Service[] = [
  {
    slug: "configuracion",
    name: "Configuración",
    description:
      "Creamos y configuramos tus agentes iA con información exclusiva y propia de tu empresa, negocio o proyecto — no con respuestas genéricas.",
    bullets: [
      "Definición de objetivos y alcance del agente",
      "Carga de conocimiento propio (catálogos, políticas, procedimientos)",
      "Ajuste de tono y estilo de conversación a tu marca",
    ],
    icon: "config",
  },
  {
    slug: "integracion",
    name: "Integración",
    description:
      "Conectamos tus agentes con CRM, aplicaciones, correo, mensajería y redes sociales para que trabajen dentro de tu sistema de procesos, no al margen de él.",
    bullets: [
      "Integración con CRM y herramientas de gestión",
      "Conexión con canales de mensajería y redes sociales",
      "Diseño de flujos de datos entre sistemas existentes",
    ],
    icon: "integration",
  },
  {
    slug: "automatizacion",
    name: "Automatización",
    description:
      "Automatizamos tareas repetitivas — seguimiento, clasificación, generación de leads, notificaciones — para liberar tiempo del equipo hacia lo estratégico.",
    bullets: [
      "Automatización de respuestas y seguimiento",
      "Generación y clasificación de leads",
      "Procesos administrativos recurrentes",
    ],
    icon: "automation",
  },
  {
    slug: "personalizacion",
    name: "Personalización",
    description:
      "Cada proyecto es distinto. Adaptamos el comportamiento, el conocimiento y las integraciones del agente a los requerimientos reales del negocio.",
    bullets: [
      "Diseño a medida según objetivos del negocio",
      "Ajustes iterativos con datos de uso real",
      "Sin soluciones de talla única",
    ],
    icon: "knowledge",
  },
  {
    slug: "asesoria",
    name: "Asesoría",
    description:
      "Acompañamos la creación, configuración e integración de agentes iA con asesoría especializada durante todo el proceso.",
    bullets: [
      "Diagnóstico inicial de procesos y oportunidades",
      "Acompañamiento técnico durante la implementación",
      "Recomendaciones de evolución del sistema en el tiempo",
    ],
    icon: "advisory",
  },
];
