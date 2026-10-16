"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { IconKey } from "@/types";
import { RepartosPanel } from "./RepartosMap";
import { BookingCalendar } from "./BookingCalendar";
import { AvatarLiveDemo } from "./AvatarLiveDemo";
import { MercadoIAApp } from "./marketing-apps/MercadoIAApp";
import { CarruselStudioApp } from "./marketing-apps/CarruselStudioApp";
import { ConvertirVideoApp } from "./marketing-apps/ConvertirVideoApp";
import { QuitarMarcaAguaApp } from "./marketing-apps/QuitarMarcaAguaApp";
import { CatalogosApp } from "./marketing-apps/CatalogosApp";
import { SlidesApp } from "./office-apps/SlidesApp";
import { ConvertirDocumentosApp } from "./office-apps/ConvertirDocumentosApp";

const GRADIENT_ID = "demo-dashboard-gradient";

type ModuleKey =
  | "dashboard"
  | "conversaciones"
  | "calendario"
  | "contactos"
  | "ventas"
  | "marketing-campanas"
  | "marketing-mercado"
  | "marketing-avatares"
  | "marketing-carruseles"
  | "marketing-video"
  | "marketing-marca"
  | "marketing-catalogos"
  | "automatizaciones"
  | "oficina-cotizaciones"
  | "oficina-slides"
  | "oficina-documentos"
  | "logistica"
  | "conexiones"
  | "reportes"
  | "sucursales"
  | "usuarios"
  | "configuracion";

type NavEntry = {
  key: ModuleKey;
  label: string;
  icon: IconKey;
  children?: Array<{ key: ModuleKey; label: string }>;
};

const NAV: NavEntry[] = [
  { key: "dashboard", label: "Dashboard", icon: "trending" },
  { key: "conversaciones", label: "Conversaciones", icon: "chat" },
  { key: "calendario", label: "Calendario", icon: "calendar" },
  { key: "contactos", label: "Contacto", icon: "person" },
  { key: "ventas", label: "Ventas y leads", icon: "sales" },
  {
    key: "marketing-campanas",
    label: "Marketing",
    icon: "marketing",
    children: [
      { key: "marketing-campanas", label: "Campañas" },
      { key: "marketing-mercado", label: "Estudio de mercado" },
      { key: "marketing-avatares", label: "Avatares en vivo" },
      { key: "marketing-carruseles", label: "Carruseles" },
      { key: "marketing-video", label: "Convertir video" },
      { key: "marketing-marca", label: "Quitar marca de agua" },
      { key: "marketing-catalogos", label: "Catálogos virtuales" },
    ],
  },
  { key: "automatizaciones", label: "Automatizaciones", icon: "automation" },
  {
    key: "oficina-cotizaciones",
    label: "Oficina",
    icon: "admin",
    children: [
      { key: "oficina-cotizaciones", label: "Cotizaciones" },
      { key: "oficina-slides", label: "Slides" },
      { key: "oficina-documentos", label: "Convertir documentos" },
    ],
  },
  { key: "logistica", label: "Logística", icon: "logistics" },
  { key: "conexiones", label: "Conexiones", icon: "api" },
  { key: "reportes", label: "Reportes", icon: "analysis" },
  { key: "sucursales", label: "Negocios y sedes", icon: "network" },
  { key: "usuarios", label: "Usuarios", icon: "crm" },
  { key: "configuracion", label: "Configuración", icon: "config" },
];

const MOBILE_NAV_ITEMS: Array<{ key: ModuleKey; label: string; icon: IconKey }> = NAV.flatMap((item) =>
  item.children ? item.children.map((child) => ({ key: child.key, label: child.label, icon: item.icon })) : [item],
);

// Everything below is fictitious example data — none of it comes from or
// connects to a real account, integration, or client.

const STATS: Array<{ label: string; value: string; icon: IconKey }> = [
  { label: "Conversaciones hoy", value: "128", icon: "chat" },
  { label: "Contactos nuevos", value: "34", icon: "person" },
  { label: "Resueltas por iA", value: "112", icon: "bot" },
  { label: "En espera humana", value: "6", icon: "support" },
  { label: "Tasa de éxito", value: "91%", icon: "trending" },
];

const TREND = [18, 22, 19, 25, 30, 28, 34, 31, 38, 42, 39, 45, 48, 52];
const TREND_TOTAL = TREND.reduce((sum, value) => sum + value, 0);

const CONVERSATIONS = [
  { name: "Cliente #482", channel: "whatsapp" as const, preview: "¿Tienen mesa libre para hoy a las 8?", time: "10:42" },
  { name: "Cliente #481", channel: "chat" as const, preview: "¿Tienen picarones o suspiro de postre?", time: "10:15" },
  { name: "Cliente #480", channel: "whatsapp" as const, preview: "Mi pedido llegó incompleto", time: "09:58" },
  { name: "Cliente #479", channel: "whatsapp" as const, preview: "Quisiera cotizar catering para 30 personas", time: "09:30" },
  { name: "Cliente #478", channel: "chat" as const, preview: "¿Hasta qué hora atienden los domingos?", time: "09:02" },
];

const CONTACTS = [
  { name: "Valeria R.", channel: "WhatsApp", tag: "Cliente frecuente" },
  { name: "Jorge M.", channel: "Web", tag: "Nuevo" },
  { name: "Empresa Delta SAC", channel: "WhatsApp", tag: "Cuenta corporativa" },
  { name: "Ana P.", channel: "Web", tag: "Nuevo" },
  { name: "Luis T.", channel: "WhatsApp", tag: "Cliente frecuente" },
];

const SALES_STAGES = [
  { label: "Nuevos leads", value: 46, max: 46 },
  { label: "Calificados", value: 28, max: 46 },
  { label: "En propuesta", value: 14, max: 46 },
  { label: "Cerrados (mes)", value: 9, max: 46 },
];

const MARKETING_STATS: Array<{ label: string; value: string; icon: IconKey }> = [
  { label: "Campañas activas", value: "3", icon: "marketing" },
  { label: "Mensajes enviados", value: "2,140", icon: "email" },
  { label: "Tasa de apertura", value: "58%", icon: "trending" },
  { label: "Clics a WhatsApp", value: "312", icon: "whatsapp" },
];

const OFFICE_TASKS = [
  { task: "Actualizar menú de temporada", owner: "Equipo cocina", status: "pendiente" as const },
  { task: "Revisar inventario de insumos", owner: "Administración", status: "hecho" as const },
  { task: "Confirmar proveedor de catering", owner: "Ventas", status: "pendiente" as const },
  { task: "Publicar horario de feriados", owner: "Marketing", status: "hecho" as const },
];

// Cotizaciones: la subsección nativa de Oficina en el sistema real — pedidos
// de precio que todavía no se confirman (distinto de "Pedidos y encargos",
// que ya está aceptado y en curso).
const COTIZACIONES: Array<{ id: string; concepto: string; cliente: string; estado: string; monto: string }> = [
  { id: "COT-104", concepto: "Catering corporativo (80 personas)", cliente: "Constructora Andina SAC", estado: "Enviada", monto: "S/ 1,450" },
  { id: "COT-103", concepto: "Alquiler de local para evento privado", cliente: "Familia Quispe", estado: "Por cotizar", monto: "Por definir" },
  { id: "COT-102", concepto: "Desayunos para taller de 25 personas", cliente: "Instituto San Marcos", estado: "Aceptada", monto: "S/ 625" },
  { id: "COT-101", concepto: "Combo picarones para feria", cliente: "Municipalidad de Miraflores", estado: "Rechazada", monto: "S/ 340" },
];

// Pedidos y encargos: mismo flujo de estados que usa el sistema real (Nuevo →
// Cotizando → Cotizado → Aceptado → En proceso → Pago confirmado → Entregado).
const PEDIDOS_ENCARGOS: Array<{ id: string; producto: string; cliente: string; estado: string; monto: string }> = [
  { id: "ENC-231", producto: "Catering para 50 personas", cliente: "Empresa Delta SAC", estado: "Pago confirmado", monto: "S/ 850" },
  { id: "ENC-230", producto: "Torta de cumpleaños personalizada", cliente: "Valeria R.", estado: "En proceso", monto: "S/ 120" },
  { id: "ENC-229", producto: "Coffee break para evento", cliente: "Colegio San Martín", estado: "Cotizando", monto: "Por confirmar" },
  { id: "ENC-228", producto: "Combo picarones x20", cliente: "Jorge M.", estado: "Entregado", monto: "S/ 180" },
];

const INVENTORY: Array<{ producto: string; categoria: string; unidades: number; minimo: number }> = [
  { producto: "Café en grano", categoria: "Insumos", unidades: 42, minimo: 15 },
  { producto: "Papas para salchipapa", categoria: "Insumos", unidades: 8, minimo: 10 },
  { producto: "Pollo para broaster", categoria: "Insumos", unidades: 25, minimo: 10 },
  { producto: "Harina para picarones", categoria: "Insumos", unidades: 3, minimo: 8 },
  { producto: "Vasos descartables", categoria: "Empaques", unidades: 320, minimo: 100 },
];

const IMPORTS: Array<{ producto: string; origen: string; transporte: string; estado: string }> = [
  { producto: "Máquina de café espresso", origen: "Italia", transporte: "Aéreo", estado: "En aduana" },
  { producto: "Empaques biodegradables", origen: "China", transporte: "Marítimo", estado: "En tránsito" },
  { producto: "Mobiliario para terraza", origen: "Colombia", transporte: "Terrestre", estado: "Recibido" },
];

const SUCCESS_ESTADOS = new Set(["Entregado", "Pago confirmado", "Recibido", "Confirmado"]);

const CONNECTIONS: Array<{ name: string; icon: IconKey; status: "conectado" | "disponible" }> = [
  { name: "WhatsApp Business", icon: "whatsapp", status: "conectado" },
  { name: "Google Calendar", icon: "calendar", status: "conectado" },
  { name: "CRM", icon: "crm", status: "disponible" },
  { name: "Correo", icon: "email", status: "conectado" },
  { name: "Redes sociales", icon: "social", status: "disponible" },
  { name: "API / n8n", icon: "api", status: "disponible" },
];

const USERS = [
  { name: "María Gómez", role: "Administradora", status: "Activa" },
  { name: "Diego Ríos", role: "Atención al cliente", status: "Activo" },
  { name: "Carla Vidal", role: "Marketing", status: "Invitada" },
];

const AUTOMATIONS: Array<{ name: string; trigger: string; status: "Activa" | "Pausada" }> = [
  { name: "Confirmación de reserva por WhatsApp", trigger: "Al agendar una cita", status: "Activa" },
  { name: "Encuesta de satisfacción", trigger: "24 h después de la visita", status: "Activa" },
  { name: "Alerta de stock bajo a cocina", trigger: "Inventario por debajo de 10 unidades", status: "Pausada" },
  { name: "Resumen diario al dueño por correo", trigger: "Todos los días, 9:00 p.m.", status: "Activa" },
];

const REPORTS: Array<{ name: string; format: string }> = [
  { name: "Resumen semanal de conversaciones", format: "PDF" },
  { name: "Ventas y leads del mes", format: "Excel" },
  { name: "Satisfacción de clientes", format: "PDF" },
  { name: "Uso del agente por canal", format: "CSV" },
];

const BRANCHES: Array<{ name: string; conversations: number; status: string }> = [
  { name: "Café Aurora — Miraflores", conversations: 128, status: "En línea" },
  { name: "Café Aurora — San Isidro", conversations: 74, status: "En línea" },
  { name: "Café Aurora — Delivery Lima Norte", conversations: 31, status: "En línea" },
];

const SETTINGS = [
  { label: "Nombre del negocio", value: "Café Aurora" },
  { label: "Tono de respuesta", value: "Cercano y profesional" },
  { label: "Horario de atención", value: "8:00 a.m. – 8:00 p.m." },
  { label: "Idioma principal", value: "Español" },
];

function StatGrid({ items }: { items: Array<{ label: string; value: string; icon: IconKey }> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-background p-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-cyan">
            <Icon name={stat.icon} className="h-4 w-4" />
          </span>
          <p className="mt-2.5 text-xl font-semibold text-foreground">{stat.value}</p>
          <p className="text-[11px] leading-tight text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function Row({
  title,
  subtitle,
  badge,
  tone = "neutral",
}: {
  title: string;
  subtitle: string;
  badge: string;
  tone?: "success" | "neutral";
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <div className="min-w-0">
        <p className="truncate text-foreground">{title}</p>
        <p className="truncate text-xs text-muted">{subtitle}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium",
          tone === "success" ? "bg-success/15 text-success" : "border border-border text-muted",
        )}
      >
        {badge}
      </span>
    </li>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TrendChart() {
  const width = 600;
  const height = 140;
  const padding = 8;
  const max = Math.max(...TREND);
  const min = Math.min(...TREND);
  const range = max - min || 1;

  const points = TREND.map((value, index) => {
    const x = padding + (index / (TREND.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x} ${height} L${points[0].x} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f5dfa" />
          <stop offset="1" stopColor="#38d3ff" />
        </linearGradient>
        <linearGradient id={`${GRADIENT_ID}-fill`} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38d3ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#38d3ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-border" strokeWidth="1" />

      <path d={areaPath} fill={`url(#${GRADIENT_ID}-fill)`} />
      <path d={linePath} fill="none" stroke={`url(#${GRADIENT_ID})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
          <circle cx={p.x} cy={p.y} r="2.5" fill="#38d3ff" />
          <title>{`Día ${i + 1}: ${p.value} conversaciones (ejemplo)`}</title>
        </g>
      ))}
    </svg>
  );
}

function DashboardPanel() {
  return (
    <div className="space-y-4">
      <StatGrid items={STATS} />
      <Panel title="Conversaciones atendidas por iA" hint={`Últimos 14 días (ejemplo) · ${TREND_TOTAL} en total`}>
        <TrendChart />
      </Panel>
      <Panel title="Conversaciones recientes" hint="Ejemplo de bandeja unificada">
        <ul className="space-y-2.5">
          {CONVERSATIONS.slice(0, 4).map((c) => (
            <Row
              key={c.name}
              title={c.name}
              subtitle={c.preview}
              badge={c.channel === "whatsapp" ? "WhatsApp" : "Web"}
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function ConversationsPanel() {
  return (
    <Panel title="Bandeja de conversaciones" hint="Ejemplo — mensajes de todos los canales en un solo lugar">
      <ul className="space-y-2.5">
        {CONVERSATIONS.map((c) => (
          <Row
            key={c.name}
            title={`${c.name} · ${c.time}`}
            subtitle={c.preview}
            badge={c.channel === "whatsapp" ? "WhatsApp" : "Web"}
          />
        ))}
      </ul>
    </Panel>
  );
}

function CalendarPanel() {
  return (
    <Panel title="Calendario y agendamiento" hint="Ejemplo — se llena solo cuando el agente agenda algo">
      <BookingCalendar />
    </Panel>
  );
}

function ContactsPanel() {
  return (
    <Panel title="Contactos" hint="Ejemplo — se arma automáticamente con cada conversación">
      <ul className="space-y-2.5">
        {CONTACTS.map((c) => (
          <Row key={c.name} title={c.name} subtitle={`Canal: ${c.channel}`} badge={c.tag} tone={c.tag === "Nuevo" ? "success" : "neutral"} />
        ))}
      </ul>
    </Panel>
  );
}

function SalesPanel() {
  return (
    <Panel title="Embudo de ventas y leads" hint="Ejemplo — clasificación automática por el agente">
      <div className="space-y-3">
        {SALES_STAGES.map((stage) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{stage.label}</span>
              <span className="font-medium text-foreground">{stage.value}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
                style={{ width: `${(stage.value / stage.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MarketingCampaignsPanel() {
  return (
    <Panel title="Campañas" hint="Ejemplo — seguimiento de campañas conectadas al agente">
      <StatGrid items={MARKETING_STATS} />
    </Panel>
  );
}

function MarketingAvataresPanel() {
  return (
    <Panel title="Avatares en vivo" hint="Todavía en desarrollo — así se ve la vista previa por ahora">
      <AvatarLiveDemo />
    </Panel>
  );
}

function OficinaCotizacionesPanel() {
  return (
    <div className="space-y-4">
      <Panel title="Cotizaciones" hint="Ejemplo — pedidos de precio que el agente clasifica antes de confirmarse">
        <ul className="space-y-2.5">
          {COTIZACIONES.map((c) => (
            <Row
              key={c.id}
              title={c.concepto}
              subtitle={`${c.cliente} · ${c.monto}`}
              badge={c.estado}
              tone={c.estado === "Aceptada" ? "success" : "neutral"}
            />
          ))}
        </ul>
      </Panel>
      <Panel title="Tareas internas" hint="Ejemplo — tareas que el equipo gestiona junto al agente">
        <ul className="space-y-2.5">
          {OFFICE_TASKS.map((t) => (
            <Row
              key={t.task}
              title={t.task}
              subtitle={`Responsable: ${t.owner}`}
              badge={t.status === "hecho" ? "Hecho" : "Pendiente"}
              tone={t.status === "hecho" ? "success" : "neutral"}
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function LogisticsPanel() {
  return (
    <div className="space-y-4">
      <Panel title="Repartos" hint="Mapa real (OpenStreetMap) — posiciones de ejemplo, no son ubicaciones GPS reales">
        <RepartosPanel />
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Así funciona en el sistema real: el repartidor abre un enlace desde su celular y su ubicación aparece en
          vivo en este mapa; también se le puede pedir la ubicación al cliente para ubicar la entrega exacta — todo
          sin que nadie tenga que llamar a preguntar &ldquo;¿dónde está mi pedido?&rdquo;.
        </p>
      </Panel>

      <Panel title="Pedidos y encargos" hint="Ejemplo — mismo flujo de estados del sistema real">
        <ul className="space-y-2.5">
          {PEDIDOS_ENCARGOS.map((p) => (
            <Row
              key={p.id}
              title={p.producto}
              subtitle={`${p.cliente} · ${p.monto}`}
              badge={p.estado}
              tone={SUCCESS_ESTADOS.has(p.estado) ? "success" : "neutral"}
            />
          ))}
        </ul>
      </Panel>

      <Panel title="Inventario" hint="Ejemplo — alerta automática cuando un insumo baja del mínimo">
        <ul className="space-y-2.5">
          {INVENTORY.map((item) => {
            const bajo = item.unidades < item.minimo;
            return (
              <Row
                key={item.producto}
                title={item.producto}
                subtitle={`${item.categoria} · ${item.unidades} unidades (mínimo ${item.minimo})`}
                badge={bajo ? "Stock bajo" : "En stock"}
                tone={bajo ? "neutral" : "success"}
              />
            );
          })}
        </ul>
      </Panel>

      <Panel title="Importaciones" hint="Ejemplo — seguimiento de pedidos a proveedores internacionales">
        <ul className="space-y-2.5">
          {IMPORTS.map((item) => (
            <Row
              key={item.producto}
              title={item.producto}
              subtitle={`Origen: ${item.origen} · Transporte: ${item.transporte}`}
              badge={item.estado}
              tone={SUCCESS_ESTADOS.has(item.estado) ? "success" : "neutral"}
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function ConnectionsPanel() {
  return (
    <Panel title="Conexiones disponibles" hint="Ejemplo — cada integración se activa según tu negocio">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CONNECTIONS.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Icon name={c.icon} className="h-4 w-4 text-cyan" />
              {c.name}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium",
                c.status === "conectado" ? "bg-success/15 text-success" : "border border-border text-muted",
              )}
            >
              {c.status === "conectado" ? "Conectado" : "Disponible"}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function UsersPanel() {
  return (
    <Panel title="Usuarios del equipo" hint="Ejemplo — quién puede ver y responder conversaciones">
      <ul className="space-y-2.5">
        {USERS.map((u) => (
          <Row key={u.name} title={u.name} subtitle={u.role} badge={u.status} tone={u.status.startsWith("Activ") ? "success" : "neutral"} />
        ))}
      </ul>
    </Panel>
  );
}

function AutomationsPanel() {
  return (
    <Panel title="Automatizaciones" hint="Ejemplo — flujos tipo n8n conectados al agente">
      <ul className="space-y-2.5">
        {AUTOMATIONS.map((a) => (
          <Row
            key={a.name}
            title={a.name}
            subtitle={a.trigger}
            badge={a.status}
            tone={a.status === "Activa" ? "success" : "neutral"}
          />
        ))}
      </ul>
    </Panel>
  );
}

function ReportsPanel() {
  return (
    <Panel title="Reportes" hint="Ejemplo — exportables para revisar el desempeño del agente">
      <ul className="space-y-2.5">
        {REPORTS.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm">
            <span className="text-foreground">{r.name}</span>
            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-muted">{r.format}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function BranchesPanel() {
  return (
    <Panel title="Negocios y sedes" hint="Ejemplo — un mismo panel para varias sedes, marcas o clientes">
      <ul className="space-y-2.5">
        {BRANCHES.map((b) => (
          <Row key={b.name} title={b.name} subtitle={`${b.conversations} conversaciones este mes`} badge={b.status} tone="success" />
        ))}
      </ul>
    </Panel>
  );
}

function SettingsPanel() {
  return (
    <Panel title="Configuración del agente" hint="Ejemplo — así se personaliza para cada negocio">
      <dl className="space-y-2.5">
        {SETTINGS.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm">
            <dt className="text-muted">{s.label}</dt>
            <dd className="font-medium text-foreground">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

const PANELS: Record<ModuleKey, () => React.ReactElement> = {
  dashboard: DashboardPanel,
  conversaciones: ConversationsPanel,
  calendario: CalendarPanel,
  contactos: ContactsPanel,
  ventas: SalesPanel,
  "marketing-campanas": MarketingCampaignsPanel,
  "marketing-mercado": MercadoIAApp,
  "marketing-avatares": MarketingAvataresPanel,
  "marketing-carruseles": CarruselStudioApp,
  "marketing-video": ConvertirVideoApp,
  "marketing-marca": QuitarMarcaAguaApp,
  "marketing-catalogos": CatalogosApp,
  automatizaciones: AutomationsPanel,
  "oficina-cotizaciones": OficinaCotizacionesPanel,
  "oficina-slides": SlidesApp,
  "oficina-documentos": ConvertirDocumentosApp,
  logistica: LogisticsPanel,
  conexiones: ConnectionsPanel,
  reportes: ReportsPanel,
  sucursales: BranchesPanel,
  usuarios: UsersPanel,
  configuracion: SettingsPanel,
};

// Full-screen app recreations (not the compact Panel-card modules) render
// without the shared Panel chrome, since they already bring their own.
const FULL_SCREEN_PANELS = new Set<ModuleKey>([
  "marketing-mercado",
  "marketing-carruseles",
  "marketing-video",
  "marketing-marca",
  "marketing-catalogos",
  "oficina-slides",
  "oficina-documentos",
]);

function NavTree({
  active,
  onSelect,
  itemClassName,
}: {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
  itemClassName?: string;
}) {
  return (
    <>
      {NAV.map((item) => {
        const isGroupActive = active === item.key || item.children?.some((child) => child.key === active);
        return (
          <div key={item.key}>
            <button
              type="button"
              onClick={() => onSelect(item.key)}
              aria-pressed={active === item.key}
              className={cn(
                "focus-ring flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                active === item.key
                  ? "bg-primary/15 text-cyan"
                  : isGroupActive
                    ? "text-foreground"
                    : "text-muted hover:bg-background hover:text-foreground",
                itemClassName,
              )}
            >
              <Icon name={item.icon} className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
            {item.children && isGroupActive ? (
              <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                {item.children.map((child) => (
                  <button
                    key={child.key}
                    type="button"
                    onClick={() => onSelect(child.key)}
                    aria-pressed={active === child.key}
                    className={cn(
                      "focus-ring rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                      active === child.key ? "font-medium text-cyan" : "text-muted hover:text-foreground",
                    )}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function DemoDashboard() {
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const ActivePanel = PANELS[active];
  const isFullScreen = FULL_SCREEN_PANELS.has(active);
  const activeLabel = MOBILE_NAV_ITEMS.find((item) => item.key === active)?.label ?? "Dashboard";

  function selectModule(key: ModuleKey) {
    setActive(key);
    setMenuOpen(false);
  }

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="text-sm font-semibold text-foreground">Panel de control — Café Aurora</p>
          <p className="text-xs text-muted">Datos de ejemplo. No conectado a ninguna cuenta ni sistema real.</p>
        </div>
        <span className="rounded-full border border-cyan/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan">
          Vista previa
        </span>
      </div>

      <div className="mt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-controls="demo-dashboard-menu"
          className="focus-ring flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        >
          <Menu className="h-4 w-4 shrink-0 text-cyan" />
          <span className="truncate font-medium">{activeLabel}</span>
          <span className="ml-auto text-xs text-muted">Menú</span>
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[1100] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div
            id="demo-dashboard-menu"
            className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col gap-1 overflow-y-auto bg-background-elevated p-4 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Panel de control</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavTree active={active} onSelect={selectModule} />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[13rem_1fr]">
        <nav className="hidden flex-col gap-1 lg:flex">
          <NavTree active={active} onSelect={selectModule} />
        </nav>

        <div className={cn("min-w-0", isFullScreen && "overflow-x-auto rounded-2xl border border-border")}>
          <ActivePanel />
        </div>
      </div>
    </div>
  );
}
