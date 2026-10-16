import {
  Boxes,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  Megaphone,
  MessagesSquare,
  Package,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

/** One beat of a demo conversation. Tool steps update the app panel next to the phone. */
export type ChatStep =
  | { kind: "user"; text: string }
  | { kind: "agent"; text: string }
  | {
      kind: "tool";
      /** Present tense while running, past tense when done. */
      running: string;
      done: string;
      /** Index into `tools`, lit in the detail panel while this step runs. */
      tool: number;
      update: { addRow?: string[]; setRow?: { index: number; row: string[] }; highlight?: number };
    };

export type IndustryCase = {
  id: string;
  rubro: string;
  title: string;
  icon: LucideIcon;
  color: string;
  summary: string;
  channels: string[];
  chatName: string;
  tools: string[];
  modules: string[];
  highlight?: string;
  panel: { title: string; icon: LucideIcon; columns: [string, string, string]; rows: string[][] };
  script: ChatStep[];
};

// Each case is a system iA Connexion has built and deployed. Client names are withheld; the features
// listed are the ones the deployed system implements. Conversations and panel data are illustrative.
export const INDUSTRY_CASES: IndustryCase[] = [
  {
    id: "consultorio",
    rubro: "Salud",
    title: "Consultorio médico",
    icon: Stethoscope,
    color: "#38d3ff",
    summary:
      "Recepcionista virtual por WhatsApp que atiende a los pacientes, consulta la agenda y reserva turnos, con un panel en tiempo real donde el equipo puede tomar el control de cualquier conversación.",
    channels: ["WhatsApp"],
    chatName: "Consultorio · Asistente",
    tools: ["Consulta la disponibilidad", "Reserva el turno", "Reprograma o cancela", "Pasa a una persona cuando hace falta"],
    modules: ["Conversaciones en tiempo real", "Turnos", "Toma de control humano", "Configuración"],
    panel: {
      title: "Turnos de mañana",
      icon: CalendarDays,
      columns: ["Hora", "Paciente", "Estado"],
      rows: [
        ["09:00", "M. Torres", "Confirmado"],
        ["10:30", "—", "Disponible"],
        ["11:00", "J. Ríos", "Confirmado"],
      ],
    },
    script: [
      { kind: "user", text: "Hola, quisiera una cita para mañana en la mañana." },
      { kind: "tool", running: "Revisando la agenda…", done: "Agenda revisada", tool: 0, update: { highlight: 1 } },
      { kind: "agent", text: "¡Hola! Mañana tengo libre a las 10:30. ¿Te la reservo?" },
      { kind: "user", text: "Sí, a nombre de Ana Pérez." },
      {
        kind: "tool",
        running: "Reservando el turno…",
        done: "Turno reservado",
        tool: 1,
        update: { setRow: { index: 1, row: ["10:30", "A. Pérez", "Reservado"] }, highlight: 1 },
      },
      { kind: "agent", text: "Listo, Ana: tu cita quedó para mañana a las 10:30. Si necesitas cambiarla, escríbeme por aquí." },
    ],
  },
  {
    id: "salud-femenina",
    rubro: "Salud",
    title: "Clínica de salud femenina",
    icon: HeartPulse,
    color: "#ff5470",
    summary:
      "Agente que resuelve dudas con la información aprobada por la clínica en su base de conocimiento y agenda citas, con un dashboard de conversaciones y agenda.",
    channels: ["WhatsApp", "Chat web"],
    chatName: "Clínica · Asistente",
    tools: ["Consulta la base de conocimiento", "Revisa horarios", "Agenda la cita"],
    modules: ["Conversaciones", "Agenda de citas", "Base de conocimiento", "Estudio de mercado integrado"],
    panel: {
      title: "Agenda de citas",
      icon: CalendarDays,
      columns: ["Día", "Motivo", "Estado"],
      rows: [
        ["Mar 10:00", "Consulta", "Confirmada"],
        ["Mié 15:30", "Ecografía", "Confirmada"],
      ],
    },
    script: [
      { kind: "user", text: "Hola, ¿qué preparación necesito para mi control anual?" },
      { kind: "tool", running: "Consultando la base de conocimiento…", done: "Información de la clínica encontrada", tool: 0, update: {} },
      { kind: "agent", text: "Te comparto las indicaciones de la clínica para tu control. ¿Quieres que te agende un horario esta semana?" },
      { kind: "user", text: "Sí, el jueves por la tarde." },
      {
        kind: "tool",
        running: "Agendando la cita…",
        done: "Cita agendada",
        tool: 2,
        update: { addRow: ["Jue 16:00", "Control anual", "Reservada"], highlight: 2 },
      },
      { kind: "agent", text: "Listo, quedó reservada para el jueves a las 16:00." },
    ],
  },
  {
    id: "importaciones",
    rubro: "Comercio",
    title: "Importaciones y venta por mayor",
    icon: Package,
    color: "#ffb648",
    summary:
      "Agente que consulta precios y stock en vivo, crea pedidos que reservan stock y registra encargos de importación. Los casos complejos escalan a modelos de IA más potentes o a una persona.",
    channels: ["WhatsApp", "Chat web"],
    chatName: "Tienda · Asistente",
    tools: ["Busca precio y stock en vivo", "Crea el pedido y reserva stock", "Registra encargos de importación", "Escala casos complejos"],
    modules: ["Pedidos y encargos", "Inventario", "Conversaciones", "Claves de IA por niveles"],
    highlight: "Si un modelo da por hecho un pedido sin ejecutar la acción, el sistema le pide corregir y, si insiste, lo deriva a una persona.",
    panel: {
      title: "Inventario",
      icon: Boxes,
      columns: ["Producto", "Precio", "Stock"],
      rows: [
        ["Audífonos BT", "S/ 59", "42 u."],
        ["Smartwatch", "S/ 129", "8 u."],
        ["Parlante", "S/ 89", "En camino"],
      ],
    },
    script: [
      { kind: "user", text: "¿Tienen smartwatch? Necesito 5." },
      { kind: "tool", running: "Buscando precio y stock…", done: "Stock en vivo consultado", tool: 0, update: { highlight: 1 } },
      { kind: "agent", text: "Sí: el smartwatch está a S/ 129 y hay 8 unidades. ¿Te reservo 5?" },
      { kind: "user", text: "Sí, confírmalo." },
      {
        kind: "tool",
        running: "Creando el pedido…",
        done: "Pedido creado · 5 u. reservadas",
        tool: 1,
        update: { setRow: { index: 1, row: ["Smartwatch", "S/ 129", "5 reservadas"] }, highlight: 1 },
      },
      { kind: "agent", text: "Pedido creado y 5 unidades reservadas. Queda pendiente de pago; te paso los datos para pagar." },
    ],
  },
  {
    id: "capacitacion",
    rubro: "Educación",
    title: "Capacitación y cursos",
    icon: GraduationCap,
    color: "#7cffb2",
    summary:
      "Agente que informa sobre los cursos, registra inscripciones con su estado de pago y agenda, reprograma o cancela asesorías conectadas a Google Calendar y Meet.",
    channels: ["WhatsApp", "Chat web"],
    chatName: "Academia · Asistente",
    tools: ["Registra la inscripción", "Consulta disponibilidad", "Agenda la asesoría", "Reprograma o cancela"],
    modules: ["Inscripciones y pagos", "Asesorías", "Google Calendar y Meet", "Conversaciones"],
    panel: {
      title: "Inscripciones",
      icon: ClipboardList,
      columns: ["Curso", "Alumno", "Estado"],
      rows: [
        ["Curso corto", "L. Gómez", "Pagado"],
        ["Curso extendido", "R. Díaz", "Pendiente"],
      ],
    },
    script: [
      { kind: "user", text: "Quiero inscribirme al curso corto." },
      {
        kind: "tool",
        running: "Registrando la inscripción…",
        done: "Inscripción registrada",
        tool: 0,
        update: { addRow: ["Curso corto", "C. Vega", "Pend. de pago"], highlight: 2 },
      },
      { kind: "agent", text: "¡Listo! Quedaste inscrita. Tu vacante se confirma con el pago. ¿Agendamos también tu asesoría?" },
      { kind: "user", text: "Sí, el viernes a las 6 pm." },
      {
        kind: "tool",
        running: "Agendando la asesoría…",
        done: "Asesoría agendada con Meet",
        tool: 2,
        update: { addRow: ["Asesoría", "C. Vega", "Vie 18:00 · Meet"], highlight: 3 },
      },
      { kind: "agent", text: "Asesoría agendada el viernes a las 6 pm, con enlace de Google Meet." },
    ],
  },
  {
    id: "agencia",
    rubro: "Marketing",
    title: "Agencia de marketing",
    icon: Megaphone,
    color: "#a855f7",
    summary:
      "Recepcionista virtual por WhatsApp y chat web que califica prospectos y agenda reuniones, con panel de ventas, marketing y oficina, y herramientas de IA integradas para estudios de mercado, ideas de anuncios y presentaciones.",
    channels: ["WhatsApp", "Chat web"],
    chatName: "Agencia · Asistente",
    tools: ["Califica al prospecto", "Agenda la reunión", "Prepara el estudio de mercado", "Genera la presentación"],
    modules: ["Ventas", "Marketing", "Calendario", "Oficina", "Mercado IA", "Diapositivas IA"],
    panel: {
      title: "Prospectos",
      icon: Users,
      columns: ["Negocio", "Interés", "Estado"],
      rows: [
        ["Restaurante", "Anuncios", "Propuesta"],
        ["Gimnasio", "Redes", "Contactado"],
      ],
    },
    script: [
      { kind: "user", text: "Hola, tengo una cafetería y quiero más clientes por redes." },
      {
        kind: "tool",
        running: "Registrando al prospecto…",
        done: "Prospecto calificado",
        tool: 0,
        update: { addRow: ["Cafetería", "Redes + anuncios", "Calificado"], highlight: 2 },
      },
      { kind: "agent", text: "¡Genial! ¿Vemos tu caso en una reunión de 20 minutos? Tengo martes 11:00 o miércoles 16:00." },
      { kind: "user", text: "Martes a las 11." },
      {
        kind: "tool",
        running: "Agendando la reunión…",
        done: "Reunión agendada",
        tool: 1,
        update: { setRow: { index: 2, row: ["Cafetería", "Redes + anuncios", "Reunión mar 11:00"] }, highlight: 2 },
      },
      { kind: "agent", text: "Agendado. Antes de la reunión preparamos un estudio de tu mercado para mostrarte oportunidades." },
    ],
  },
  {
    id: "tecnologia",
    rubro: "Servicios B2B",
    title: "Servicios tecnológicos",
    icon: MessagesSquare,
    color: "#5b8bff",
    summary:
      "Chatbot para la web que responde solo sobre los servicios de la empresa, sin salirse del tema, y deriva a ventas a quienes muestran interés, con panel de conversaciones, ventas y marketing.",
    channels: ["Chat web", "WhatsApp"],
    chatName: "Soporte comercial",
    tools: ["Se mantiene en el tema", "Responde sobre los servicios", "Registra el interés", "Deriva a un asesor"],
    modules: ["Conversaciones", "Ventas", "Marketing", "Widget de chat web"],
    panel: {
      title: "Leads del chat web",
      icon: Users,
      columns: ["Origen", "Necesidad", "Estado"],
      rows: [
        ["Web", "Chatbot tienda", "Asesor asignado"],
        ["WhatsApp", "Agente de ventas", "Propuesta"],
      ],
    },
    script: [
      { kind: "user", text: "¿Me ayudas con una receta de cocina?" },
      { kind: "agent", text: "Solo puedo ayudarte con nuestros servicios de chatbots y agentes con IA. ¿Buscas uno para tu negocio?" },
      { kind: "user", text: "Sí, ¿cuánto cuesta un chatbot para mi tienda?" },
      {
        kind: "tool",
        running: "Registrando el interés…",
        done: "Lead registrado",
        tool: 2,
        update: { addRow: ["Web", "Chatbot tienda", "Nuevo"], highlight: 2 },
      },
      { kind: "agent", text: "Depende de los canales y funciones que necesites. Te conecto con un asesor para una propuesta a tu medida." },
    ],
  },
];
