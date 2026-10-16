import {
  ArrowLeftRight,
  Bell,
  Boxes,
  Braces,
  CalendarDays,
  ChartLine,
  ClipboardList,
  Code,
  Database,
  Factory,
  FileSpreadsheet,
  FileCheck,
  Filter,
  Flame,
  HardDrive,
  Heart,
  Inbox,
  LayoutGrid,
  Mail,
  Megaphone,
  MessageCircle,
  Package,
  PackageCheck,
  Plug,
  Send,
  Server,
  Share2,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Webhook,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type IntegrationSystem = {
  name: string;
  short: string;
  category: string;
  sub: string;
  description: string;
  icon: LucideIcon;
  color: string;
  marks: LucideIcon[];
  apps: Array<[name: string, detail: string]>;
  requirements: string[];
  flow: Array<{ label: string; icon: LucideIcon }>;
  note: string;
};

// The platforms listed are examples of possible integrations, not active connections or
// compatibility guarantees — see INTEGRATIONS_DISCLAIMER.
export const INTEGRATION_SYSTEMS: IntegrationSystem[] = [
  {
    name: "CRM",
    short: "CRM",
    category: "Gestión comercial",
    sub: "Gestión comercial",
    description: "Centraliza la información comercial y conecta los datos de tus clientes con otros procesos de la empresa.",
    icon: Users,
    color: "#ff7a59",
    marks: [Users, ChartLine, UserPlus],
    apps: [
      ["HubSpot", "CRM / API"],
      ["Salesforce", "CRM / API"],
      ["Zoho CRM", "CRM / API"],
      ["Odoo", "CRM / ERP"],
    ],
    requirements: [
      "Cuenta y permisos para acceder a los datos necesarios.",
      "API, conector oficial o método de integración disponible.",
      "Definir campos, eventos y reglas de sincronización.",
    ],
    flow: [
      { label: "Nuevo contacto", icon: UserPlus },
      { label: "CRM / registro", icon: Users },
      { label: "Seguimiento", icon: TrendingUp },
    ],
    note: "La compatibilidad definitiva se valida según la edición contratada, los permisos y las APIs disponibles.",
  },
  {
    name: "Google Workspace",
    short: "Workspace",
    category: "Productividad",
    sub: "Productividad",
    description:
      "Conecta documentos, hojas de cálculo, formularios y calendarios para reducir el trabajo manual y la duplicación de información.",
    icon: LayoutGrid,
    color: "#4285f4",
    marks: [FileSpreadsheet, HardDrive, CalendarDays],
    apps: [
      ["Google Sheets", "Datos / API"],
      ["Google Forms", "Captura de datos"],
      ["Google Drive", "Archivos / API"],
      ["Google Calendar", "Eventos / API"],
    ],
    requirements: [
      "Cuenta Google con acceso a los recursos implicados.",
      "OAuth o cuenta de servicio y proyecto de Google Cloud cuando corresponda.",
      "Permisos y APIs habilitadas para los recursos que se conectarán.",
    ],
    flow: [
      { label: "Formulario", icon: ClipboardList },
      { label: "Hoja de cálculo", icon: FileSpreadsheet },
      { label: "Aviso al equipo", icon: Bell },
    ],
    note: "El acceso a recursos y el método de autenticación dependen de la cuenta y las políticas de la organización.",
  },
  {
    name: "Email",
    short: "Email",
    category: "Comunicación",
    sub: "Comunicación",
    description: "Relaciona el correo electrónico con procesos comerciales y operativos para agilizar notificaciones y seguimientos.",
    icon: Mail,
    color: "#ea4335",
    marks: [Mail, Inbox, Send],
    apps: [
      ["Gmail", "API / OAuth"],
      ["Microsoft Outlook", "Microsoft Graph"],
      ["Brevo", "Email / API"],
      ["Mailchimp", "Marketing / API"],
    ],
    requirements: [
      "Cuenta de correo o proveedor de envío habilitado.",
      "OAuth, API o SMTP autorizado según el servicio.",
      "Remitente verificado y cumplimiento de las políticas de envío.",
    ],
    flow: [
      { label: "Evento de negocio", icon: Zap },
      { label: "Correo automático", icon: Send },
      { label: "Seguimiento", icon: TrendingUp },
    ],
    note: "Los envíos masivos pueden requerir verificación del dominio, consentimiento y límites específicos del proveedor.",
  },
  {
    name: "WhatsApp",
    short: "WhatsApp",
    category: "Mensajería",
    sub: "Mensajería",
    description: "Conecta las conversaciones con atención al cliente, CRM y automatizaciones mediante canales autorizados.",
    icon: MessageCircle,
    color: "#25d366",
    marks: [MessageCircle, Sparkles, Webhook],
    apps: [
      ["WhatsApp Business Platform", "API oficial"],
      ["HubSpot", "CRM / canales compatibles"],
      ["n8n", "Flujos / nodos"],
      ["Meta Webhooks", "Eventos entrantes"],
    ],
    requirements: [
      "Cuenta de Meta Business y número habilitado para la solución elegida.",
      "Acceso a la plataforma oficial o a un proveedor autorizado.",
      "Tokens, webhooks, permisos y plantillas cuando correspondan.",
    ],
    flow: [
      { label: "Mensaje entrante", icon: MessageCircle },
      { label: "Flujo de atención", icon: Workflow },
      { label: "Registro CRM", icon: Users },
    ],
    note: "La API, las ventanas de atención, las plantillas y las tarifas dependen de la configuración y las políticas de Meta.",
  },
  {
    name: "Redes sociales",
    short: "Redes",
    category: "Canales digitales",
    sub: "Canales digitales",
    description: "Relaciona la planificación de contenidos y las interacciones con procesos de marketing y seguimiento.",
    icon: Share2,
    color: "#e1306c",
    marks: [Megaphone, Heart, Share2],
    apps: [
      ["Instagram / Meta", "Graph API"],
      ["Facebook Pages", "API / permisos"],
      ["LinkedIn", "API según producto"],
      ["Buffer", "Funciones según plan"],
    ],
    requirements: [
      "Cuenta y permisos para administrar las páginas correspondientes.",
      "Aplicación registrada, OAuth y permisos aprobados cuando proceda.",
      "Verificar las acciones y métricas disponibles en cada API.",
    ],
    flow: [
      { label: "Contenido", icon: Megaphone },
      { label: "Interacción", icon: Heart },
      { label: "Registro / métricas", icon: ChartLine },
    ],
    note: "La publicación y analítica varían por red, tipo de cuenta, permisos y aprobación de la aplicación.",
  },
  {
    name: "Bases de datos",
    short: "Datos",
    category: "Información",
    sub: "Información",
    description: "Intercambia información estructurada entre aplicaciones y mantiene los registros organizados y consistentes.",
    icon: Database,
    color: "#38d3ff",
    marks: [Database, Server, Flame],
    apps: [
      ["PostgreSQL", "SQL / conexión segura"],
      ["MySQL", "SQL / conexión segura"],
      ["Firebase / Firestore", "SDK / API"],
      ["Supabase", "API / PostgreSQL"],
    ],
    requirements: [
      "Acceso autorizado al servidor, proyecto o servicio.",
      "Credenciales seguras con privilegios mínimos y conectividad necesaria.",
      "Definir esquema, validaciones, duplicados y sincronización.",
    ],
    flow: [
      { label: "Datos recibidos", icon: Inbox },
      { label: "Validación", icon: Filter },
      { label: "Registro actualizado", icon: FileCheck },
    ],
    note: "La arquitectura debe considerar copias de seguridad, control de acceso y protección de datos.",
  },
  {
    name: "APIs",
    short: "APIs",
    category: "Conectividad",
    sub: "Conectividad",
    description: "Permite que aplicaciones diferentes intercambien información y ejecuten acciones mediante interfaces de software.",
    icon: Plug,
    color: "#a855f7",
    marks: [Braces, Webhook, Plug],
    apps: [
      ["REST / HTTP", "Endpoints"],
      ["GraphQL", "Consultas / API"],
      ["OpenAPI", "Contrato de API"],
      ["Webhooks", "Eventos entrantes"],
    ],
    requirements: [
      "Documentación técnica y endpoints disponibles.",
      "Método de autenticación, permisos y límites de uso.",
      "Manejo de errores, reintentos y seguridad.",
    ],
    flow: [
      { label: "Solicitud", icon: Send },
      { label: "API / procesamiento", icon: Braces },
      { label: "Respuesta", icon: ArrowLeftRight },
    ],
    note: "Las funciones disponibles dependen de la documentación, permisos, límites y condiciones del proveedor.",
  },
  {
    name: "ERP",
    short: "ERP",
    category: "Gestión interna",
    sub: "Gestión interna",
    description: "Conecta información operativa, pedidos, inventario y administración con otras aplicaciones del negocio.",
    icon: Boxes,
    color: "#8b5cf6",
    marks: [Boxes, Factory, Package],
    apps: [
      ["Odoo", "Módulos / API"],
      ["SAP", "Servicios según producto"],
      ["Dynamics 365", "APIs / conectores"],
      ["ERP propio", "API o integración a medida"],
    ],
    requirements: [
      "Identificar versión, módulos y entorno del ERP.",
      "Acceso de integración autorizado y documentación técnica.",
      "Mapeo de datos, reglas operativas y pruebas de validación.",
    ],
    flow: [
      { label: "Pedido recibido", icon: ShoppingCart },
      { label: "ERP / operación", icon: Boxes },
      { label: "Estado actualizado", icon: PackageCheck },
    ],
    note: "Accesos, licencias y APIs varían entre versiones, módulos, despliegues y personalizaciones.",
  },
  {
    name: "Automatizaciones (n8n)",
    short: "n8n",
    category: "Orquestación",
    sub: "Orquestación",
    description: "Coordina aplicaciones y servicios mediante flujos, disparadores, condiciones, transformaciones y acciones.",
    icon: Workflow,
    color: "#ea4b71",
    marks: [Workflow, Share2, Code],
    apps: [
      ["n8n Cloud", "Servicio administrado"],
      ["n8n self-hosted", "Instalación propia"],
      ["Webhook Trigger", "Eventos / HTTP"],
      ["HTTP Request", "APIs / servicios"],
    ],
    requirements: [
      "Entorno n8n operativo con acceso a los servicios necesarios.",
      "Credenciales seguras y permisos específicos por integración.",
      "Definir disparadores, errores, reintentos y supervisión.",
    ],
    flow: [
      { label: "Evento", icon: Zap },
      { label: "Flujo n8n", icon: Workflow },
      { label: "Acción en una app", icon: Send },
    ],
    note: "Algunas integraciones requieren nodos adicionales, configuración manual, acceso de red o código personalizado.",
  },
];

export const INTEGRATIONS_DISCLAIMER =
  "Las plataformas indicadas son ejemplos de posibles integraciones, no conexiones activas ni garantías de compatibilidad. La viabilidad depende de la versión, el plan, los permisos, las APIs y las políticas de cada proveedor.";
