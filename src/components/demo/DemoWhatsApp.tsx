"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, CalendarCheck, CheckCheck, ExternalLink, Loader2, Phone, RotateCcw, Send, Smile, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { linkifyText } from "@/lib/linkify";
import { useDemoAgentChat } from "./useDemoAgentChat";
import { QUICK_ACTIONS, type AppointmentData, type MeetingData } from "./demo-chat-types";

function WaAppointmentCard({ data }: { data: AppointmentData }) {
  return (
    <div className="max-w-[80%] rounded-lg bg-[#202c33] px-3 py-2 text-sm text-[#e9edef]">
      <div className="flex items-center gap-1.5 text-[#25d366]">
        <CalendarCheck className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Cita agendada (ejemplo)</span>
      </div>
      <p className="mt-1.5">{data.motivo}</p>
      <p className="text-[#8696a0]">
        {data.fecha} · {data.hora}
        {data.nombre ? ` · ${data.nombre}` : ""}
      </p>
      <p className="mt-1 text-[10px] text-[#8696a0]">Folio {data.id} — simulación del demo, no es una reserva real.</p>
    </div>
  );
}

function WaMeetingCard({ data }: { data: MeetingData }) {
  return (
    <div className="max-w-[80%] rounded-lg bg-[#202c33] px-3 py-2 text-sm text-[#e9edef]">
      <div className="flex items-center gap-1.5 text-[#25d366]">
        <Video className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Reunión creada (ejemplo)</span>
      </div>
      <p className="mt-1.5">{data.tema}</p>
      <a
        href={data.enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring mt-1 inline-flex items-center gap-1 text-[#53bdeb] underline underline-offset-2"
      >
        Abrir sala de ejemplo <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

/**
 * Same demo agent, dressed as a WhatsApp conversation — a sample of the
 * WhatsApp channel (the "Nova" product line) alongside the generic web
 * widget view. Purely a visual skin: colors and layout only, no WhatsApp
 * logo asset, and it talks to the same sandboxed /api/demo backend.
 */
export function DemoWhatsApp() {
  const { entries, input, setInput, isStreaming, notice, sendMessage, reset } = useDemoAgentChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, isStreaming]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const lastEntry = entries[entries.length - 1];
  const showTypingIndicator = isStreaming && !(lastEntry?.kind === "text" && lastEntry.role === "assistant");

  return (
    <div className="mx-auto flex h-[36rem] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-[6px] border-[#111b21] bg-[#0b141a] shadow-[0_20px_60px_-16px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2.5 bg-[#202c33] px-3 py-3">
        <ArrowLeft className="h-5 w-5 shrink-0 text-[#aebac1]" />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-base">☕</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">Café Aurora</p>
          <p className="truncate text-[11px] text-[#8696a0]">{isStreaming ? "escribiendo…" : "en línea (demo)"}</p>
        </div>
        <Phone className="h-4 w-4 shrink-0 text-[#aebac1]" />
        <button type="button" onClick={reset} aria-label="Reiniciar conversación" className="focus-ring shrink-0 text-[#aebac1]">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-[#0b141a] px-3 py-3">
        {entries.map((entry, index) =>
          entry.kind === "action" ? (
            <div key={index} className="flex justify-start">
              {entry.action === "schedule_appointment" ? (
                <WaAppointmentCard data={entry.data} />
              ) : (
                <WaMeetingCard data={entry.data} />
              )}
            </div>
          ) : (
            <div key={index} className={cn("flex", entry.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-2.5 py-1.5 text-sm leading-snug",
                  entry.role === "user" ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-[#e9edef]",
                )}
              >
                <p className="whitespace-pre-wrap">{linkifyText(entry.content, `wa-${index}`)}</p>
                {entry.role === "user" ? (
                  <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-[#a8e6d5]">
                    <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                  </span>
                ) : null}
              </div>
            </div>
          ),
        )}
        {showTypingIndicator ? (
          <div className="flex justify-start">
            <span className="flex items-center gap-2 rounded-lg bg-[#202c33] px-3 py-2 text-sm text-[#8696a0]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            </span>
          </div>
        ) : null}
        {notice ? <p className="text-center text-xs text-[#8696a0]">{notice}</p> : null}
      </div>

      <div className="flex gap-1.5 overflow-x-auto bg-[#0b141a] px-3 pb-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => void sendMessage(action.prompt)}
            disabled={isStreaming}
            className="focus-ring shrink-0 whitespace-nowrap rounded-full border border-[#2a3942] px-2.5 py-1 text-[11px] text-[#8696a0] transition-colors hover:border-[#25d366]/60 hover:text-[#25d366] disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-[#202c33] px-2.5 py-2.5">
        <Smile className="h-5 w-5 shrink-0 text-[#8696a0]" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mensaje"
          aria-label="Mensaje para el agente de ejemplo"
          className="focus-ring min-w-0 flex-1 rounded-full bg-[#2a3942] px-3.5 py-2 text-sm text-white placeholder:text-[#8696a0] outline-none"
        />
        <button
          type="submit"
          disabled={isStreaming || input.trim().length === 0}
          aria-label="Enviar mensaje"
          className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
