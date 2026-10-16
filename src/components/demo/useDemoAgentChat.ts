"use client";

import { useState } from "react";
import { GREETING, MAX_HISTORY_SENT, toApiHistory, type ActionEntry, type Entry, type TextEntry } from "./demo-chat-types";

/**
 * Shared streaming/tool-handling logic for the demo agent, reused by every
 * channel skin (web widget card, WhatsApp-style view, …) so they all talk to
 * the same /api/demo backend and render the same conversation, just styled
 * differently per channel.
 */
export function useDemoAgentChat() {
  const [entries, setEntries] = useState<Entry[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setNotice(null);
    const nextEntries: Entry[] = [...entries, { kind: "text", role: "user", content: trimmed }];
    setEntries(nextEntries);
    setInput("");
    setIsStreaming(true);

    let assistantTextOpen = false;

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiHistory(nextEntries).slice(-MAX_HISTORY_SENT) }),
      });

      if (response.status === 429) {
        setNotice("Alcanzaste el límite de mensajes de este demo por ahora. Intenta de nuevo en unos minutos.");
        return;
      }
      if (response.status === 503) {
        setNotice("El demo todavía no está activo.");
        return;
      }
      if (!response.ok || !response.body) {
        throw new Error(`demo request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          let event: { type?: string; delta?: string; action?: string; data?: unknown };
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          if (event.type === "text") {
            const delta = event.delta ?? "";
            const isFirstOfSegment = !assistantTextOpen;
            assistantTextOpen = true;
            setEntries((prev) => {
              if (isFirstOfSegment) {
                return [...prev, { kind: "text", role: "assistant", content: delta }];
              }
              const next = [...prev];
              const last = next[next.length - 1] as TextEntry;
              next[next.length - 1] = { ...last, content: last.content + delta };
              return next;
            });
          } else if (event.type === "action" && (event.action === "schedule_appointment" || event.action === "create_meeting")) {
            assistantTextOpen = false;
            const actionEntry = { kind: "action", action: event.action, data: event.data } as ActionEntry;
            setEntries((prev) => [...prev, actionEntry]);
          }
        }
      }
    } catch (error) {
      console.error("[demo-agent] send failed", error);
      setEntries((prev) => [...prev, { kind: "text", role: "assistant", content: "Tuve un problema para responder. Intenta de nuevo." }]);
    } finally {
      setIsStreaming(false);
    }
  }

  function reset() {
    setEntries([GREETING]);
    setInput("");
    setNotice(null);
  }

  return { entries, input, setInput, isStreaming, notice, sendMessage, reset };
}
