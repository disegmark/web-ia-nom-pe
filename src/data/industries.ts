import type { Industry } from "@/types";

export const INDUSTRIES: Industry[] = [
  {
    slug: "ecommerce",
    name: "E-commerce",
    description: "Acompañar al comprador desde la búsqueda del producto hasta el seguimiento post-venta.",
    useCases: ["Ayudar a encontrar productos", "Procesar pedidos en la conversación", "Seguimiento post-venta"],
  },
  {
    slug: "servicios",
    name: "Servicios",
    description: "Agendar citas, responder consultas y calificar solicitudes sin intervención manual constante.",
    useCases: ["Agendamiento de citas", "Respuesta a consultas frecuentes", "Calificación de solicitudes"],
  },
  {
    slug: "restaurantes",
    name: "Restaurantes",
    description: "Gestionar reservas, compartir el menú y tomar pedidos por los canales que el cliente ya usa.",
    useCases: ["Gestión de reservas", "Menús y pedidos en línea", "Consultas de horario y ubicación"],
  },
  {
    slug: "turismo",
    name: "Turismo",
    description: "Ayudar a reservar y resolver dudas sobre destinos, fechas y disponibilidad.",
    useCases: ["Reserva de vuelos y hoteles", "Información de destinos", "Promociones personalizadas"],
  },
  {
    slug: "finanzas",
    name: "Finanzas",
    description: "Responder consultas sobre cuentas y políticas, con derivación humana en casos sensibles.",
    useCases: ["Consultas sobre cuentas", "Información de políticas", "Resolución de dudas básicas"],
  },
  {
    slug: "educacion",
    name: "Educación",
    description: "Orientar a estudiantes y postulantes, y automatizar procesos administrativos recurrentes.",
    useCases: ["Orientación a postulantes", "Recordatorios y seguimiento", "Consultas administrativas"],
  },
  {
    slug: "salud",
    name: "Salud",
    description: "Apoyar la programación de citas y la comunicación con pacientes, siempre con derivación profesional cuando corresponde.",
    useCases: ["Programación de citas", "Recordatorios de consultas", "Información general orientativa"],
  },
  {
    slug: "empresas-locales",
    name: "Empresas locales",
    description: "Automatizar reservas, pedidos y atención básica sin necesitar un equipo dedicado 24/7.",
    useCases: ["Automatización de reservas", "Atención fuera de horario", "Generación de leads locales"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Sostener la conversación en campañas digitales y nutrir leads con contenido relevante.",
    useCases: ["Segmentación de audiencia", "Nutrición de leads", "Recomendaciones personalizadas"],
  },
  {
    slug: "operaciones",
    name: "Operaciones",
    description: "Coordinar procesos internos y reducir el trabajo manual repetitivo entre áreas.",
    useCases: ["Coordinación de procesos internos", "Clasificación de solicitudes", "Reportes automáticos"],
  },
];
