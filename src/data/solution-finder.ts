import {
  Building2,
  CalendarCheck,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Globe,
  GraduationCap,
  Headset,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Package,
  Server,
  Share2,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Choice = { id: string; label: string; detail?: string; icon: LucideIcon };

/** Step 1 — each sector points at the implemented case it is closest to (ids from industry-cases.ts). */
export const SECTORS: Array<Choice & { caseId: string | null }> = [
  { id: "salud", label: "Salud y clínicas", detail: "Consultorios, clínicas, especialistas", icon: Stethoscope, caseId: "consultorio" },
  { id: "comercio", label: "Comercio e importaciones", detail: "Tiendas, mayoristas, distribuidoras", icon: Package, caseId: "importaciones" },
  { id: "educacion", label: "Educación y cursos", detail: "Academias, capacitaciones, talleres", icon: GraduationCap, caseId: "capacitacion" },
  { id: "marketing", label: "Agencias y marketing", detail: "Agencias, consultoras, freelancers", icon: Megaphone, caseId: "agencia" },
  { id: "servicios", label: "Servicios y tecnología", detail: "Empresas de servicios B2B", icon: MessagesSquare, caseId: "tecnologia" },
  { id: "otro", label: "Otro rubro", detail: "Te orientamos según tu objetivo", icon: Building2, caseId: null },
];

/** Step 2 — what the system must do. Each goal brings the agent tools and panel modules our deployments use for it. */
export const GOALS: Array<Choice & { tools: string[]; modules: string[]; caseId: string }> = [
  {
    id: "atender",
    label: "Atender y responder 24/7",
    detail: "Consultas, seguimiento y derivación",
    icon: Headset,
    tools: ["Responde consultas al instante", "Pasa a una persona cuando hace falta"],
    modules: ["Toma de control humano"],
    caseId: "tecnologia",
  },
  {
    id: "agendar",
    label: "Agendar citas o reuniones",
    detail: "Turnos, citas, asesorías",
    icon: CalendarCheck,
    tools: ["Consulta disponibilidad", "Agenda, reprograma o cancela"],
    modules: ["Agenda / turnos"],
    caseId: "consultorio",
  },
  {
    id: "vender",
    label: "Vender y tomar pedidos",
    detail: "Precios, stock y pedidos",
    icon: ShoppingCart,
    tools: ["Consulta precio y stock en vivo", "Crea pedidos que reservan stock"],
    modules: ["Pedidos", "Inventario"],
    caseId: "importaciones",
  },
  {
    id: "inscribir",
    label: "Inscripciones y pagos",
    detail: "Matrículas, vacantes, estado de pago",
    icon: ClipboardList,
    tools: ["Registra inscripciones", "Controla el estado de pago"],
    modules: ["Inscripciones y pagos"],
    caseId: "capacitacion",
  },
  {
    id: "captar",
    label: "Captar y calificar prospectos",
    detail: "Leads, seguimiento comercial",
    icon: UserPlus,
    tools: ["Califica al prospecto", "Agenda la reunión con ventas"],
    modules: ["Ventas / prospectos"],
    caseId: "agencia",
  },
  {
    id: "conocimiento",
    label: "Responder con mi información",
    detail: "Documentos, políticas, catálogos",
    icon: Database,
    tools: ["Consulta tu base de conocimiento"],
    modules: ["Base de conocimiento"],
    caseId: "salud-femenina",
  },
  {
    id: "marketing",
    label: "Marketing con IA",
    detail: "Estudios, anuncios, presentaciones",
    icon: Sparkles,
    tools: ["Prepara estudios de mercado e ideas de anuncios", "Genera presentaciones"],
    modules: ["Marketing", "Mercado IA", "Diapositivas IA"],
    caseId: "agencia",
  },
];

export const MAX_GOALS = 3;

/** Step 3 — channels. */
export const CHANNELS: Choice[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "web", label: "Chat en mi web", icon: Globe },
  { id: "redes", label: "Instagram / Facebook", icon: Share2 },
  { id: "correo", label: "Correo", icon: Mail },
];

/** Step 4 — tools the business already uses (integrations to evaluate). */
export const CURRENT_TOOLS: Choice[] = [
  { id: "calendar", label: "Google Calendar", icon: CalendarCheck },
  { id: "sheets", label: "Hojas de cálculo", icon: FileSpreadsheet },
  { id: "crm", label: "Un CRM", icon: Users },
  { id: "erp", label: "ERP o sistema propio", icon: Server },
  { id: "ninguna", label: "Todavía ninguna", icon: Sparkles },
];
