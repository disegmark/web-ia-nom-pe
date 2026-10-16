import type { ProcessStep } from "@/types";

/** Sección 3 del home: evolución conceptual de chatbot a sistema inteligente. */
export const EVOLUTION_STAGES: ProcessStep[] = [
  {
    title: "Chatbot",
    description: "Responde con guiones fijos, sin comprender el contexto real de la conversación.",
    icon: "chat",
  },
  {
    title: "Agente iA",
    description: "Comprende contexto, consulta información propia y ejecuta tareas autorizadas.",
    icon: "brain",
  },
  {
    title: "Multiagente",
    description: "Varios agentes especializados colaboran y se derivan tareas entre sí según el objetivo.",
    icon: "network",
  },
  {
    title: "Automatización",
    description: "Los procesos repetitivos ocurren sin intervención manual, conectando herramientas entre sí.",
    icon: "automation",
  },
  {
    title: "Sistema inteligente",
    description: "Personas, datos, herramientas y agentes operan como una infraestructura conectada.",
    icon: "globe",
  },
];

/** Sección 10 del home: de una persona con un objetivo a un resultado. */
export const WORK_FLOW: ProcessStep[] = [
  { title: "Persona", description: "Alguien con una necesidad real dentro de la empresa." },
  { title: "Objetivo", description: "Un resultado concreto que se busca lograr." },
  { title: "ia.nom.pe", description: "Diseñamos el sistema de inteligencia que conecta todo lo demás." },
  { title: "Agentes", description: "Ejecutan tareas específicas dentro de ese sistema." },
  { title: "Conocimiento", description: "Los agentes consultan información propia de la empresa." },
  { title: "Herramientas", description: "Se conectan con el CRM, el correo, la mensajería y más." },
  { title: "Automatización", description: "Los procesos repetitivos ocurren sin fricción." },
  { title: "Resultado", description: "Objetivos empresariales convertidos en acciones concretas." },
];

/** Capa de inteligencia del concepto central (sección "¿Qué hacemos?"). */
export const INTELLIGENCE_LAYER = {
  center: "ia.nom.pe",
  layer: "Capa de inteligencia",
  connects: ["Personas", "Datos", "Herramientas"],
  through: "Agentes",
  then: "Automatización",
  result: "Resultados",
};
