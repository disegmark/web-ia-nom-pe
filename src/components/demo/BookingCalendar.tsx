"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, PhoneCall, StickyNote, User, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type Modalidad = "presencial" | "virtual";
type Estado = "confirmado" | "pendiente" | "cancelado" | "completado";

type Turno = {
  id: string;
  dayOffset: number;
  hora: string;
  nombre: string;
  telefono: string;
  tipo: string;
  modalidad: Modalidad;
  estado: Estado;
  notas?: string;
};

// Fictitious example appointments, anchored to "today" so the calendar always
// looks alive regardless of when the demo is viewed — not real bookings.
const TURNOS: Turno[] = [
  {
    id: "t1",
    dayOffset: 0,
    hora: "1:00 p.m.",
    nombre: "Cliente #470",
    telefono: "+51 987 654 321",
    tipo: "Reserva de mesa (2 personas)",
    modalidad: "presencial",
    estado: "confirmado",
  },
  {
    id: "t2",
    dayOffset: 0,
    hora: "7:30 p.m.",
    nombre: "Cliente #465",
    telefono: "+51 912 345 678",
    tipo: "Reserva de mesa (6 personas)",
    modalidad: "presencial",
    estado: "pendiente",
  },
  {
    id: "t3",
    dayOffset: 1,
    hora: "11:00 a.m.",
    nombre: "Empresa Delta SAC",
    telefono: "+51 999 888 777",
    tipo: "Coordinación de catering",
    modalidad: "virtual",
    estado: "confirmado",
    notas: "Videollamada de ejemplo generada por el agente",
  },
  {
    id: "t4",
    dayOffset: 1,
    hora: "8:00 p.m.",
    nombre: "Cliente #482",
    telefono: "+51 955 444 333",
    tipo: "Reserva de mesa (4 personas)",
    modalidad: "presencial",
    estado: "confirmado",
  },
  {
    id: "t5",
    dayOffset: 4,
    hora: "6:00 p.m.",
    nombre: "Colegio San Martín",
    telefono: "+51 944 222 111",
    tipo: "Coffee break para evento",
    modalidad: "presencial",
    estado: "pendiente",
  },
  {
    id: "t6",
    dayOffset: -2,
    hora: "7:00 p.m.",
    nombre: "Cliente #458",
    telefono: "+51 933 111 222",
    tipo: "Reserva de mesa (3 personas)",
    modalidad: "presencial",
    estado: "completado",
  },
];

const ESTADO_BADGE: Record<Estado, { label: string; tone: string }> = {
  confirmado: { label: "Confirmado", tone: "bg-success/15 text-success" },
  pendiente: { label: "Pendiente", tone: "border border-border text-muted" },
  cancelado: { label: "Cancelado", tone: "bg-red-500/15 text-red-400" },
  completado: { label: "Completado", tone: "bg-cyan/15 text-cyan" },
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function BookingCalendar() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(today);
  const [selected, setSelected] = useState(today);
  const [calledIds, setCalledIds] = useState<string[]>([]);

  const turnosConFecha = useMemo(() => TURNOS.map((t) => ({ ...t, fecha: addDays(today, t.dayOffset) })), [today]);

  const monthStart = startOfMonth(viewDate);
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const total = daysInMonth(viewDate);

  const cells: Array<Date | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: total }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  const turnosDelDia = turnosConFecha.filter((t) => sameDay(t.fecha, selected));

  const monthLabel = viewDate.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="rounded-xl border border-border bg-background p-3 md:w-72">
        <div className="flex items-center justify-between px-1 pb-2">
          <button
            type="button"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            aria-label="Mes anterior"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-cyan"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-xs font-medium capitalize text-foreground">{monthLabel}</p>
          <button
            type="button"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            aria-label="Mes siguiente"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-cyan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} />;
            const hasTurnos = turnosConFecha.some((t) => sameDay(t.fecha, date));
            const isSelected = sameDay(date, selected);
            const isToday = sameDay(date, today);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelected(date)}
                className={cn(
                  "focus-ring flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors",
                  isSelected
                    ? "bg-primary text-white"
                    : hasTurnos
                      ? "bg-cyan/15 font-semibold text-cyan"
                      : "text-muted hover:bg-background-elevated hover:text-foreground",
                  !isSelected && isToday && "ring-1 ring-cyan/50",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex max-h-80 flex-col gap-2.5 overflow-y-auto rounded-xl border border-border bg-background p-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted">
          Turnos del {selected.toLocaleDateString("es-PE", { day: "numeric", month: "long" })}
        </p>
        {turnosDelDia.length === 0 ? (
          <p className="px-1 text-sm text-muted">No hay citas agendadas ese día (ejemplo).</p>
        ) : (
          turnosDelDia.map((turno) => {
            const badge = ESTADO_BADGE[turno.estado];
            const called = calledIds.includes(turno.id);
            return (
              <div key={turno.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{turno.hora}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
                      {turno.modalidad === "virtual" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {turno.modalidad === "virtual" ? "Virtual" : "Presencial"}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", badge.tone)}>{badge.label}</span>
                  </div>
                </div>
                <div className="mt-1.5 grid gap-1 text-xs text-muted sm:grid-cols-2">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" /> {turno.nombre}
                  </span>
                  <span>{turno.telefono}</span>
                  <span className="sm:col-span-2">{turno.tipo}</span>
                  {turno.notas ? (
                    <span className="flex items-center gap-1.5 sm:col-span-2">
                      <StickyNote className="h-3 w-3" /> {turno.notas}
                    </span>
                  ) : null}
                </div>
                {turno.estado !== "cancelado" ? (
                  <button
                    type="button"
                    onClick={() => setCalledIds((prev) => [...prev, turno.id])}
                    disabled={called}
                    className="focus-ring mt-2 flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-cyan/40 hover:text-cyan disabled:opacity-60"
                  >
                    <PhoneCall className="h-3 w-3" /> {called ? "Llamada iniciada (ejemplo)" : "Llamar para confirmar"}
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
