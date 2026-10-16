"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { Mark } from "@/components/brand/Mark";
import { cn } from "@/lib/utils";
import { linkifyText } from "@/lib/linkify";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/constants";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! Soy el asistente de ia.nom.pe. Pregúntame sobre nuestros servicios, agentes iA, automatización o integraciones.",
};

const SUGGESTIONS = [
  "¿Qué servicios ofrecen?",
  "¿Qué es un agente iA?",
  "¿Cómo empiezo un proyecto?",
];

const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

const MAX_HISTORY_SENT = 12;

export function ChatWidget() {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(history);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY_SENT) }),
      });

      if (response.status === 503) {
        setUnavailable(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "El chat todavía no está activo. Escríbenos por WhatsApp y te respondemos directamente.",
          },
        ]);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(`chat request failed: ${response.status}`);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      }
    } catch (error) {
      console.error("[chat-widget] send failed", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tuve un problema para responder. Intenta de nuevo o escríbenos por WhatsApp." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

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

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat de ia.nom.pe"}
        aria-expanded={isOpen}
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.6, y: shouldReduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.2 : 0.5, delay: shouldReduceMotion ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
        className="focus-ring fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_0_1px_rgba(56,211,255,0.15),0_10px_30px_-8px_rgba(47,93,250,0.65)] sm:bottom-28 sm:right-7"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="dialog"
            aria-label="Chat con ia.nom.pe"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[9.5rem] right-4 z-50 flex h-[min(32rem,70vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-background-elevated shadow-[0_20px_60px_-16px_rgba(0,0,0,0.6)] sm:bottom-[11rem] sm:right-7"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Mark className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">ia.nom.pe</p>
                <p className="truncate text-xs text-muted">Asistente de servicios</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <p
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "border border-border bg-background text-foreground",
                    )}
                  >
                    {linkifyText(message.content, `msg-${index}`)}
                  </p>
                </div>
              ))}
              {isStreaming && messages.at(-1)?.role !== "assistant" ? (
                <div className="flex justify-start">
                  <span className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Escribiendo…
                  </span>
                </div>
              ) : null}
            </div>

            {messages.length <= 1 ? (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    className="focus-ring rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-cyan/40 hover:text-cyan"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={unavailable}
                placeholder={unavailable ? "Chat no disponible — usa WhatsApp" : "Escribe tu pregunta…"}
                aria-label="Mensaje para el asistente"
                className="focus-ring max-h-24 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:opacity-60"
              />
              {unavailable ? (
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"
                  aria-label="Escribir por WhatsApp"
                >
                  <Send className="h-4 w-4" />
                </a>
              ) : (
                <button
                  type="submit"
                  disabled={isStreaming || input.trim().length === 0}
                  aria-label="Enviar mensaje"
                  className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
