"use client";

import { useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

const SAMPLE_MESSAGES = [
  "Juan P.: ¿hacen delivery hasta San Borja?",
  "María G.: 😍😍 se ve delicioso",
  "Carlos R.: ¿cuánto cuesta el combo picarones?",
  "Ana L.: voy a ir este finde!",
  "Luis T.: ¿tienen promos para cumpleaños?",
  "Vale R.: el avatar responde rapidísimo 🤖",
];

/**
 * Bespoke preview for "Avatares en vivo" — a simulated live stream with a
 * ticking viewer count and scrolling mock chat. No real stream, no real
 * YouTube/Facebook connection.
 */
export function AvatarLiveDemo() {
  const [live, setLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!live) return;

    const viewerInterval = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 3));
    }, 1200);

    const messageInterval = setInterval(() => {
      setMessages((prev) => [...prev.slice(-4), SAMPLE_MESSAGES[indexRef.current % SAMPLE_MESSAGES.length]]);
      indexRef.current += 1;
    }, 1700);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(messageInterval);
    };
  }, [live]);

  function toggle() {
    setLive((prev) => {
      const next = !prev;
      if (!next) {
        setViewers(0);
        setMessages([]);
        indexRef.current = 0;
      } else {
        setViewers(12);
      }
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-border px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-cyan">
            <Icon name="bot" className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-foreground">Avatares en vivo</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="focus-ring shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-cyan/40 hover:text-cyan"
        >
          {live ? "Detener" : "Probar"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Avatar con iA que transmite 24/7 por YouTube y Facebook, atiende el chat y vende cursos o asesorías.
      </p>

      {live ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-primary/30 to-cyan/20">
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Radio className="h-2.5 w-2.5" /> EN VIVO
            </span>
            <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">{viewers} viendo</span>
            <span className="text-4xl">🤖</span>
          </div>
          <div className="h-24 space-y-1 overflow-hidden bg-background-elevated p-2 text-[11px] text-muted">
            {messages.length === 0 ? <p>Conectando chat (ejemplo)…</p> : messages.map((message, i) => <p key={i} className="truncate">{message}</p>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
