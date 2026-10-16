import type { IconKey } from "@/types";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export type AppointmentData = { id: string; motivo: string; fecha: string; hora: string; nombre: string | null };
export type MeetingData = { tema: string; fecha: string | null; hora: string | null; codigo: string; enlace: string };

export type TextEntry = { kind: "text"; role: ChatRole; content: string };
export type ActionEntry =
  | { kind: "action"; action: "schedule_appointment"; data: AppointmentData }
  | { kind: "action"; action: "create_meeting"; data: MeetingData };
export type Entry = TextEntry | ActionEntry;

export const GREETING: Entry = {
  kind: "text",
  role: "assistant",
  content:
    "¡Hola! Soy el agente de ejemplo de Café Aurora ☕ (negocio ficticio para este demo). Puedo responder sobre el menú, agendar una cita de ejemplo o simular una reunión. ¿En qué te ayudo?",
};

export const QUICK_ACTIONS: Array<{ label: string; prompt: string; icon: IconKey }> = [
  { label: "Agendar una cita", prompt: "Quiero reservar una mesa para 4 personas mañana a las 7:30 p.m., mi nombre es Carla", icon: "calendar" },
  { label: "Crear una reunión", prompt: "¿Podemos coordinar una videollamada con el encargado para hablar de un evento privado?", icon: "video" },
  { label: "Ver el menú", prompt: "¿Qué tienen en el menú? ¿Tienen salchipapas o picarones?", icon: "knowledge" },
  { label: "¿Cómo lo tengo en mi negocio?", prompt: "Me gustaría tener un agente así para mi propio negocio, ¿cómo empiezo?", icon: "target" },
];

export const MAX_HISTORY_SENT = 10;

export function toApiHistory(entries: Entry[]): ChatMessage[] {
  return entries
    .filter((entry): entry is TextEntry => entry.kind === "text")
    .map((entry) => ({ role: entry.role, content: entry.content }));
}
