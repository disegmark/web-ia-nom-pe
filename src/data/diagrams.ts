import type { IconItem } from "@/types";

/** SolutionsSection: cómo se construye una solución, paso a paso. */
export const SOLUTION_PROCESS: IconItem[] = [
  { title: "Entendemos", description: "Escuchamos tus objetivos y analizamos tus procesos actuales a profundidad.", icon: "target" },
  { title: "Diseñamos", description: "Creamos una solución a la medida, alineada a tu negocio y necesidades.", icon: "design" },
  { title: "Integramos", description: "Conectamos las herramientas que ya usas y las que tu empresa necesita.", icon: "integration" },
  { title: "Optimizamos", description: "Implementamos, medimos y mejoramos continuamente para generar más valor.", icon: "trending" },
];

/** SolutionsSection: diferenciadores en la tarjeta interactiva. */
export const SOLUTION_DIFFERENTIATORS: IconItem[] = [
  {
    title: "Soluciones a la medida",
    description: "Diseñadas para tu realidad, no para un modelo genérico.",
    icon: "person",
  },
  {
    title: "Flexibles y escalables",
    description: "Crecen contigo y se adaptan a los cambios de tu negocio.",
    icon: "network",
  },
  {
    title: "Seguras y confiables",
    description: "Protegemos tu información y garantizamos continuidad.",
    icon: "security",
  },
];

/** AgentsSection: los cuatro pilares que menciona la descripción de la sección. */
export const AGENT_PILLARS: IconItem[] = [
  { title: "Conocimiento", description: "Accede y utiliza información relevante de tu organización.", icon: "knowledge" },
  { title: "Herramientas", description: "Usa las mejores herramientas para cada tarea.", icon: "tools" },
  { title: "Procesos", description: "Ejecuta procesos definidos y se adapta a cada situación.", icon: "process" },
  { title: "Objetivos", description: "Enfocado en resultados medibles y de alto impacto.", icon: "target" },
];

/** AgentsSection: capacidades del agente alrededor del núcleo "IA Agente". */
export const AGENT_CAPABILITIES: IconItem[] = [
  { title: "Conversación inteligente", description: "Entiende preguntas en lenguaje natural y mantiene el contexto.", icon: "chat" },
  { title: "Análisis y comprensión", description: "Interpreta información compleja antes de actuar.", icon: "analysis" },
  { title: "Búsqueda y recuperación", description: "Encuentra la información precisa dentro de tus fuentes.", icon: "research" },
  { title: "Toma de decisiones", description: "Elige la acción correcta según reglas y contexto.", icon: "decisions" },
  { title: "Ejecución de acciones", description: "Ejecuta tareas autorizadas dentro de tus sistemas.", icon: "execution" },
  { title: "Monitoreo y mejora continua", description: "Se ajusta con datos de uso real para mejorar con el tiempo.", icon: "security" },
  { title: "Integración con sistemas", description: "Se conecta con el CRM, ERP y herramientas que ya usas.", icon: "integration" },
  { title: "Gestión de información", description: "Ordena y estructura datos entre los sistemas conectados.", icon: "database" },
];

/** KnowledgeSection: por qué conectar el conocimiento propio. */
export const KNOWLEDGE_HIGHLIGHTS: IconItem[] = [
  { title: "Tu información", description: "Conecta tus fuentes de datos internas.", icon: "database" },
  { title: "Respuestas precisas", description: "Basadas en tu contexto real.", icon: "execution" },
  { title: "Más control", description: "Información segura y actualizada.", icon: "security" },
];

export const KNOWLEDGE_SOURCES: IconItem[] = [
  { title: "Documentos", description: "Contratos, guías y archivos internos.", icon: "knowledge" },
  { title: "Manuales", description: "Procedimientos y manuales operativos.", icon: "config" },
  { title: "Catálogos", description: "Productos, precios y disponibilidad.", icon: "database" },
  { title: "Políticas", description: "Reglas y condiciones del negocio.", icon: "security" },
  { title: "Procedimientos", description: "Pasos definidos para cada proceso.", icon: "process" },
  { title: "Información comercial", description: "Datos de ventas y de clientes.", icon: "trending" },
];

export const KNOWLEDGE_OUTCOMES = ["Responde", "Analiza", "Actúa", "Aporta valor"] as const;

/** WhatWeDo: capas que conecta ia.nom.pe alrededor del núcleo. */
export const WHATWEDO_LEFT_NODES: IconItem[] = [
  { title: "Personas", description: "Clientes, equipo y usuarios.", icon: "person" },
  { title: "Información", description: "Bases de datos, documentos y conocimiento.", icon: "database" },
  { title: "Aplicaciones", description: "CRM, ERP y herramientas externas.", icon: "api" },
];

export const WHATWEDO_RIGHT_NODES: IconItem[] = [
  { title: "Procesos", description: "Flujos de trabajo y reglas de negocio.", icon: "process" },
  { title: "Automatizaciones", description: "IA, APIs e integraciones.", icon: "automation" },
];

export const WHATWEDO_TOP_ROW: IconItem[] = [
  { title: "Personas", description: "Interacción humana + IA", icon: "person" },
  { title: "Datos", description: "Información estructurada y no estructurada", icon: "database" },
  { title: "Herramientas", description: "Aplicaciones, APIs y servicios externos", icon: "tools" },
];

export const WHATWEDO_BOTTOM_ROW: IconItem[] = [
  { title: "Agentes", description: "Analizan · Deciden · Ejecutan", icon: "brain" },
  { title: "Automatización", description: "Conecta · Orquesta · Optimiza", icon: "automation" },
  { title: "Resultados", description: "Más eficiencia · Menos tiempo · Mayor valor", icon: "target" },
];
