import type { Integration } from "@/types";

export const INTEGRATIONS: Integration[] = [
  { name: "CRM", category: "Gestión comercial", icon: "crm" },
  { name: "Google Workspace", category: "Productividad", icon: "google" },
  { name: "Email", category: "Comunicación", icon: "email" },
  { name: "WhatsApp", category: "Mensajería", icon: "whatsapp" },
  { name: "Redes sociales", category: "Canales", icon: "social" },
  { name: "ERP", category: "Gestión interna", icon: "erp" },
  { name: "Bases de datos", category: "Información", icon: "database" },
  { name: "APIs", category: "Conectividad", icon: "api" },
  { name: "Automatizaciones (n8n)", category: "Orquestación", icon: "automation" },
];

export const INTEGRATION_CONCEPTS = [
  {
    term: "MCP",
    description:
      "Un estándar que permite a un agente iA conectarse de forma ordenada con herramientas y fuentes de datos externas.",
  },
  {
    term: "APIs",
    description:
      "Los puentes técnicos que permiten que el agente consulte o actualice información en los sistemas que tu empresa ya usa.",
  },
  {
    term: "Integraciones",
    description:
      "Conexiones configuradas entre el agente y tus plataformas (CRM, email, mensajería) para que la información fluya sin trabajo manual.",
  },
  {
    term: "n8n",
    description:
      "Una herramienta de orquestación que encadena pasos automáticos entre distintos sistemas cuando ocurre un evento determinado.",
  },
];
