import {
  BrainCircuit,
  ChartPie,
  CloudUpload,
  Database,
  FileStack,
  FileText,
  Mail,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { BrandLogoKey } from "@/components/brand/app-logos";

export type EcosystemModule = {
  name: string;
  short: string;
  category: string;
  sub: string;
  description: string;
  icon: LucideIcon;
  apps: Array<[name: string, detail: string]>;
  requirements: string[];
  flow: [string, string, string];
  note: string;
};

export type EcosystemApp = {
  name: string;
  role: string;
  method: string;
  module: number;
  color: string;
  /** Official mark when one is available; otherwise a neutral icon in the brand colour. */
  logo?: BrandLogoKey;
  fallback?: LucideIcon;
  /** Kept on phones, where each column has room for about five tiles. */
  core: boolean;
};

export const ECOSYSTEM_MODULES: EcosystemModule[] = [
  {
    name: "Bases de datos",
    short: "Datos",
    category: "Información",
    sub: "Base de información",
    description: "Centraliza la información de distintas herramientas para que los procesos trabajen con datos organizados y consistentes.",
    icon: Database,
    apps: [
      ["Google Sheets", "Datos tabulares"],
      ["Firestore", "Base de datos"],
      ["PostgreSQL", "SQL / registros"],
      ["Supabase", "API / datos"],
    ],
    requirements: [
      "Acceso autorizado a las fuentes de información.",
      "Definición de campos, claves y reglas de validación.",
      "Permisos, seguridad y estrategia de sincronización.",
    ],
    flow: ["Datos de origen", "Validación", "Registro listo"],
    note: "Ejemplo conceptual. Las conexiones reales requieren configurar permisos, credenciales y servicios compatibles.",
  },
  {
    name: "Nube y almacenamiento",
    short: "Nube",
    category: "Archivos y recursos",
    sub: "Archivos y recursos",
    description: "Reúne archivos y recursos compartidos para que las aplicaciones autorizadas puedan procesarlos y distribuirlos.",
    icon: CloudUpload,
    apps: [
      ["Google Drive", "Archivos / API"],
      ["OneDrive", "Microsoft Graph"],
      ["Dropbox", "Archivos / API"],
      ["AWS S3", "Almacenamiento"],
    ],
    requirements: [
      "Acceso a las cuentas o espacios de almacenamiento.",
      "OAuth, API o credenciales con privilegios mínimos.",
      "Definir carpetas, reglas de acceso y tratamiento de archivos.",
    ],
    flow: ["Archivo recibido", "Procesamiento", "Recurso disponible"],
    note: "La lectura, edición y distribución dependen de los permisos concedidos y de las APIs disponibles.",
  },
  {
    name: "Analítica",
    short: "Analítica",
    category: "Métricas e informes",
    sub: "Métricas e informes",
    description: "Transforma datos de los procesos y canales digitales en indicadores que ayudan a evaluar el rendimiento.",
    icon: ChartPie,
    apps: [
      ["Google Analytics", "Métricas web"],
      ["Looker Studio", "Dashboards"],
      ["Power BI", "BI / informes"],
      ["Google Sheets", "Datos tabulares"],
    ],
    requirements: [
      "Acceso autorizado a las fuentes de datos.",
      "Definición de métricas, dimensiones y periodicidad.",
      "Permisos de consulta y criterios de privacidad.",
    ],
    flow: ["Datos de actividad", "Análisis", "Informe / tablero"],
    note: "Los informes dependen de la calidad de los datos y de los permisos de acceso a cada plataforma.",
  },
  {
    name: "Flujos de trabajo",
    short: "Flujos",
    category: "Reglas y procesos",
    sub: "Reglas y procesos",
    description:
      "Orquesta pasos, condiciones y notificaciones para que una tarea pase de un sistema a otro con menos intervención manual.",
    icon: Workflow,
    apps: [
      ["n8n", "Automatización"],
      ["Make", "Flujos visuales"],
      ["Zapier", "Conectores"],
      ["Webhooks", "Eventos HTTP"],
    ],
    requirements: [
      "Identificar el evento que inicia el flujo.",
      "Credenciales y permisos para cada aplicación involucrada.",
      "Definir condiciones, errores, reintentos y registros de actividad.",
    ],
    flow: ["Evento detectado", "Reglas del flujo", "Acción ejecutada"],
    note: "Los flujos requieren pruebas con escenarios reales y tratamiento de errores antes de producción.",
  },
  {
    name: "Agentes de IA",
    short: "Agentes IA",
    category: "Inteligencia aplicada",
    sub: "Análisis y asistencia",
    description:
      "Integra modelos de IA con fuentes de información y herramientas para analizar contenido, apoyar decisiones o ejecutar tareas autorizadas.",
    icon: BrainCircuit,
    apps: [
      ["OpenAI API", "Modelos / API"],
      ["Claude API", "Modelos / API"],
      ["Bases de conocimiento", "Contexto / RAG"],
      ["n8n", "Orquestación"],
    ],
    requirements: [
      "Proveedor y modelo adecuados para el caso de uso.",
      "Acceso controlado a herramientas, datos y APIs.",
      "Instrucciones, límites, revisión humana y evaluación de resultados.",
    ],
    flow: ["Contexto y solicitud", "Análisis con IA", "Respuesta / acción"],
    note: "El comportamiento depende del modelo, las instrucciones, los datos disponibles y los controles de seguridad configurados.",
  },
  {
    name: "Documentos",
    short: "Documentos",
    category: "Lectura y creación",
    sub: "Lectura y creación",
    description: "Organiza la entrada, extracción, clasificación y generación de documentos dentro de procesos empresariales.",
    icon: FileStack,
    apps: [
      ["Google Docs", "Documentos"],
      ["PDF / Acrobat", "Documentos PDF"],
      ["Microsoft Word", "Office"],
      ["Google Drive", "Archivos"],
    ],
    requirements: [
      "Acceso a documentos y permisos adecuados.",
      "Definir formatos, campos y reglas de extracción.",
      "Validar información sensible y resultados generados.",
    ],
    flow: ["Documento recibido", "Lectura / extracción", "Dato o documento final"],
    note: "El procesamiento automático debe probarse con los formatos, idiomas y niveles de calidad de documentos reales.",
  },
  {
    name: "Sincronización",
    short: "Sincronización",
    category: "Datos actualizados",
    sub: "Datos actualizados",
    description: "Mantiene información relacionada entre sistemas mediante eventos, actualizaciones programadas o webhooks.",
    icon: RefreshCw,
    apps: [
      ["APIs REST", "Intercambio"],
      ["Webhooks", "Eventos"],
      ["n8n", "Orquestación"],
      ["PostgreSQL", "Persistencia"],
    ],
    requirements: [
      "Definir sistema fuente y sistema destino.",
      "Reglas para conflictos, duplicados y actualizaciones.",
      "Autenticación, logs, reintentos y manejo de límites de API.",
    ],
    flow: ["Cambio detectado", "Sincronización", "Datos actualizados"],
    note: "La sincronización depende de la disponibilidad de eventos, límites de API y reglas para resolver conflictos.",
  },
  {
    name: "Seguridad",
    short: "Seguridad",
    category: "Accesos y permisos",
    sub: "Accesos y permisos",
    description: "Organiza el acceso a herramientas y datos con credenciales protegidas, permisos mínimos y controles adecuados.",
    icon: ShieldCheck,
    apps: [
      ["OAuth 2.0", "Autorización"],
      ["Gestor de secretos", "Credenciales"],
      ["IAM", "Control de acceso"],
      ["Logs de actividad", "Auditoría"],
    ],
    requirements: [
      "Inventario de cuentas, datos y responsables.",
      "Principio de privilegio mínimo y rotación de credenciales.",
      "Políticas de retención, auditoría y respuesta ante incidentes.",
    ],
    flow: ["Solicitud de acceso", "Validación de permisos", "Acceso controlado"],
    note: "La seguridad debe revisarse según la sensibilidad de los datos y las obligaciones aplicables al negocio.",
  },
  {
    name: "Automatización",
    short: "Automatización",
    category: "Acciones coordinadas",
    sub: "Acciones coordinadas",
    description: "Conecta eventos de aplicaciones con reglas y acciones para ejecutar tareas repetitivas de forma consistente.",
    icon: Zap,
    apps: [
      ["n8n", "Flujos de trabajo"],
      ["WhatsApp Business", "Mensajería autorizada"],
      ["Gmail / Outlook", "Notificaciones"],
      ["CRM", "Gestión comercial"],
    ],
    requirements: [
      "Definir el disparador y el resultado esperado.",
      "Accesos autorizados y métodos de integración disponibles.",
      "Configurar límites, errores, notificaciones y monitoreo.",
    ],
    flow: ["Disparador", "Proceso automático", "Resultado"],
    note: "La automatización final requiere configurar y probar cada integración; esta demostración no ejecuta tareas reales.",
  },
];

export const ECOSYSTEM_INPUTS: EcosystemApp[] = [
  { name: "Gmail", role: "Correo electrónico", method: "Correo / OAuth", module: 0, color: "#EA4335", logo: "gmail", core: true },
  { name: "Outlook", role: "Correo empresarial", method: "Microsoft Graph", module: 0, color: "#0078D4", fallback: Mail, core: false },
  { name: "Google Drive", role: "Archivos compartidos", method: "Drive API", module: 1, color: "#4285F4", logo: "googleDrive", core: true },
  { name: "Google Docs", role: "Documentos", method: "Docs API", module: 5, color: "#4285F4", logo: "googleDocs", core: true },
  { name: "Google Sheets", role: "Hojas de cálculo", method: "Sheets API", module: 0, color: "#34A853", logo: "googleSheets", core: true },
  { name: "Adobe Acrobat", role: "PDF / documentos", method: "API según producto", module: 5, color: "#EC1C24", fallback: FileText, core: false },
  { name: "Chat", role: "Mensajería interna", method: "Servicio compatible", module: 3, color: "#5B8BFF", fallback: MessageSquareText, core: true },
];

export const ECOSYSTEM_OUTPUTS: EcosystemApp[] = [
  { name: "WhatsApp", role: "Mensajería empresarial", method: "WhatsApp Business Platform", module: 8, color: "#25D366", logo: "whatsapp", core: true },
  { name: "Instagram", role: "Redes sociales", method: "Meta API / permisos", module: 2, color: "#FF0069", logo: "instagram", core: true },
  { name: "Facebook", role: "Páginas y campañas", method: "Meta API / permisos", module: 2, color: "#0866FF", logo: "facebook", core: false },
  { name: "Slack", role: "Comunicación de equipos", method: "Slack API", module: 3, color: "#4A154B", logo: "slack", core: false },
  { name: "Google Calendar", role: "Calendarios", method: "Calendar API", module: 3, color: "#4285F4", logo: "googleCalendar", core: true },
  { name: "Notion", role: "Documentación y tareas", method: "Notion API", module: 5, color: "#000000", logo: "notion", core: false },
  { name: "HubSpot", role: "CRM comercial", method: "CRM API", module: 6, color: "#FF7A59", logo: "hubspot", core: true },
  { name: "Trello", role: "Tableros de trabajo", method: "Trello API", module: 3, color: "#0052CC", logo: "trello", core: false },
  { name: "Google Analytics", role: "Analítica digital", method: "Analytics API", module: 2, color: "#E37400", logo: "googleAnalytics", core: true },
];

export const ECOSYSTEM_DISCLAIMER =
  "Demo visual interactiva de iA Connexion. Los sistemas, aplicaciones y flujos mostrados ilustran posibilidades de integración; no representan conexiones activas ni verifican APIs en tiempo real. La viabilidad depende de los permisos, las versiones, los planes y las capacidades de cada proveedor. Los logotipos son marcas de sus respectivos titulares y se muestran solo para identificar las plataformas.";
