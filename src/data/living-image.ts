export type Spot = { key: string; x: number; y: number; color: string; title: string; copy: string };

export type ImagePreset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  /** Spot positions are percentages of the image. */
  spots: readonly Spot[];
  /** Center of the energy rings, if the picture has a core. */
  core?: { x: number; y: number };
};

/** Home / Agentes iA: the connected-system sphere (image cropped to 816 x 768). */
export const SYSTEM_PRESET: ImagePreset = {
  src: "/assets/images/sistema-inteligente.webp",
  alt: "Esfera de luz que representa un sistema de iA conectado con áreas de atención al cliente, análisis de datos, herramientas creativas, trabajo en equipo y servicios en la nube",
  width: 816,
  height: 768,
  sizes: "(min-width: 1024px) 560px, calc(100vw - 3rem)",
  core: { x: 33.1, y: 49.5 },
  spots: [
  { key: "soporte", x: 48.4, y: 18.9, color: "#ffd36a", title: "Atención al cliente", copy: "Un agente responde consultas y deriva a una persona cuando el caso lo requiere." },
  { key: "reportes", x: 69.9, y: 34.2, color: "#35ddff", title: "Datos y seguimiento", copy: "La información queda ordenada para que el equipo la revise y tome decisiones." },
  { key: "herramientas", x: 75.4, y: 59.5, color: "#ff7ab0", title: "Tus herramientas", copy: "Se conecta con las aplicaciones que tu equipo ya usa, dentro de permisos definidos." },
  { key: "equipo", x: 60.0, y: 78.5, color: "#43f0b2", title: "Trabajo en equipo", copy: "Las personas coordinan con el sistema: la iA prepara, el equipo decide lo sensible." },
  { key: "servicios", x: 37.7, y: 87.2, color: "#48c9ff", title: "Servicios conectados", copy: "Correo, calendario, archivos, tienda y nube enlazados dentro de un mismo flujo." },
],
};

/** Evolución: from a bot that answers to a team served by an agent that works. */
export const WORKS_PRESET: ImagePreset = {
  src: "/assets/images/ia-que-trabaja.webp",
  alt: "Un robot de iA responde por WhatsApp y enlaza documentos, procesos y resultados mientras un equipo trabaja con sus laptops en una oficina",
  width: 1600,
  height: 900,
  sizes: "(min-width: 1024px) 680px, calc(100vw - 3rem)",
  spots: [
    { key: "responde", x: 9.5, y: 41, color: "#35ddff", title: "Responde al instante", copy: "El asistente atiende la conversación y recoge lo que la persona necesita." },
    { key: "canal", x: 21, y: 36, color: "#43f0b2", title: "En el canal del cliente", copy: "Conversa donde ya está el cliente, como WhatsApp, y mantiene el contexto." },
    { key: "info", x: 48, y: 33, color: "#ffd36a", title: "Usa información propia", copy: "Consulta documentos y datos de tu organización para responder con criterio." },
    { key: "procesos", x: 48, y: 49, color: "#ff7ab0", title: "Ejecuta procesos", copy: "Aplica reglas y ejecuta tareas autorizadas, sin pasos manuales repetidos." },
    { key: "equipo", x: 67, y: 44, color: "#48c9ff", title: "Personas al centro", copy: "El equipo supervisa, decide lo sensible y recibe el trabajo ya preparado." },
    { key: "resultados", x: 95, y: 30, color: "#43f0b2", title: "Resultados con seguimiento", copy: "Cada acción queda registrada para medir y mejorar el proceso." },
  ],
};
