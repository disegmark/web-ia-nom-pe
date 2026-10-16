"use client";

import { useEffect, useRef } from "react";
import { CalendarCheck, ExternalLink, Loader2, RotateCcw, Send, Sparkles, Video } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { linkifyText } from "@/lib/linkify";
import { useDemoAgentChat } from "./useDemoAgentChat";
import { QUICK_ACTIONS, type AppointmentData, type MeetingData } from "./demo-chat-types";

function AppointmentCard({ data }: { data: AppointmentData }) {
  return (
    <div className="max-w-[85%] rounded-2xl border border-cyan/30 bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-cyan">
        <CalendarCheck className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Cita agendada (ejemplo)</span>
      </div>
      <p className="mt-2 text-sm text-foreground">{data.motivo}</p>
      <p className="text-sm text-muted">
        {data.fecha} · {data.hora}
        {data.nombre ? ` · ${data.nombre}` : ""}
      </p>
      <p className="mt-2 text-[11px] text-muted">Folio de ejemplo {data.id} — simulación, no se guardó en ningún calendario real.</p>
    </div>
  );
}

function MeetingCard({ data }: { data: MeetingData }) {
  return (
    <div className="max-w-[85%] rounded-2xl border border-cyan/30 bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-cyan">
        <Video className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Reunión creada (ejemplo)</span>
      </div>
      <p className="mt-2 text-sm text-foreground">{data.tema}</p>
      {data.fecha || data.hora ? (
        <p className="text-sm text-muted">
          {data.fecha ?? ""} {data.hora ?? ""}
        </p>
      ) : null}
      <a
        href={data.enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-cyan hover:underline"
      >
        Abrir sala de ejemplo <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <p className="mt-1 text-[11px] text-muted">Enlace de ejemplo — no es una videollamada real.</p>
    </div>
  );
}

export function DemoAgent() {
  const { entries, input, setInput, isStreaming, notice, sendMessage, reset } = useDemoAgentChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, isStreaming]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const lastEntry = entries[entries.length - 1];
  const showTypingIndicator = isStreaming && !(lastEntry?.kind === "text" && lastEntry.role === "assistant");

  return (
    <div className="flex h-[36rem] flex-col overflow-hidden rounded-3xl border border-border bg-background-elevated shadow-[0_20px_60px_-16px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-cyan">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Café Aurora — agente de ejemplo</p>
            <p className="truncate text-xs text-muted">Negocio ficticio, solo para este demo</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label="Reiniciar conversación"
          className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-cyan/40 hover:text-cyan"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {entries.map((entry, index) =>
          entry.kind === "action" ? (
            <div key={index} className="flex justify-start">
              {entry.action === "schedule_appointment" ? (
                <AppointmentCard data={entry.data} />
              ) : (
                <MeetingCard data={entry.data} />
              )}
            </div>
          ) : (
            <div key={index} className={cn("flex", entry.role === "user" ? "justify-end" : "justify-start")}>
              <p
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  entry.role === "user" ? "bg-primary text-white" : "border border-border bg-background text-foreground",
                )}
              >
                {linkifyText(entry.content, `entry-${index}`)}
              </p>
            </div>
          ),
        )}
        {showTypingIndicator ? (
          <div className="flex justify-start">
            <span className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Escribiendo…
            </span>
          </div>
        ) : null}
        {notice ? <p className="text-center text-xs text-muted">{notice}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => void sendMessage(action.prompt)}
            disabled={isStreaming}
            className="focus-ring flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
          >
            <Icon name={action.icon} className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Escribe como si fueras un cliente…"
          aria-label="Mensaje para el agente de ejemplo"
          className="focus-ring max-h-24 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={isStreaming || input.trim().length === 0}
          aria-label="Enviar mensaje"
          className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
