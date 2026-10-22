"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AudioLines, Clapperboard, KeyRound, LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarStudio } from "./AvatarStudio";
import { LongVideoStudio } from "./LongVideoStudio";
import { ActionButton, INPUT_CLASSES, Notice, Panel } from "./StudioUI";
import { VoiceStudio } from "./VoiceStudio";
import { createStudioFetch, StudioContext, type ProviderMap, type StudioStatus } from "./studio-client";

type Tab = "avatar" | "voice" | "video";

const TABS: Array<{ key: Tab; label: string; icon: typeof UserRound }> = [
  { key: "avatar", label: "Avatares", icon: UserRound },
  { key: "voice", label: "Voces", icon: AudioLines },
  { key: "video", label: "Video largo", icon: Clapperboard },
];

const PROVIDER_LABELS: Record<keyof ProviderMap, string> = {
  heygen: "HeyGen",
  elevenlabs: "ElevenLabs",
  fal: "fal.ai",
  anthropic: "Guion iA",
};

const KEY_STORAGE = "studio:access-key";

function readKey() {
  try {
    return sessionStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function StudioApp() {
  const [accessKey, setAccessKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [status, setStatus] = useState<StudioStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("avatar");

  const check = useCallback(async (key: string) => {
    setChecking(true);
    try {
      const response = await fetch("/api/studio/status", { headers: key ? { "x-studio-key": key } : {} });
      const data = (await response.json()) as StudioStatus;
      setStatus(data);
      if (data.authorized) {
        setAccessKey(key);
        try {
          sessionStorage.setItem(KEY_STORAGE, key);
        } catch {
          // Blocked storage: the key just won't survive a reload.
        }
      } else if (key) {
        setLoginError("Clave incorrecta.");
      }
    } catch {
      setLoginError("No se pudo conectar con el servidor.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- verify a key remembered from this session
    void check(readKey());
  }, [check]);

  const api = useMemo(() => createStudioFetch(accessKey), [accessKey]);

  if (!status) {
    return <p className="text-center text-sm text-muted">{checking ? "Cargando estudio…" : loginError}</p>;
  }

  if (!status.enabled) {
    return (
      <Notice>
        El estudio está desactivado. Define STUDIO_ACCESS_KEY y las claves de los proveedores en el servidor (ver
        .env.local.example).
      </Notice>
    );
  }

  if (!status.authorized) {
    return (
      <Panel className="mx-auto max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoginError(null);
            void check(draftKey.trim());
          }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-foreground">
            <KeyRound className="h-5 w-5 text-cyan" />
            <h2 className="font-display text-lg font-semibold">Acceso al estudio</h2>
          </div>
          <p className="text-sm text-muted">
            Cada generación consume créditos de los proveedores, por eso el estudio es privado.
          </p>
          <input
            type="password"
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            placeholder="Clave de acceso"
            autoComplete="current-password"
            className={INPUT_CLASSES}
          />
          {loginError ? <Notice>{loginError}</Notice> : null}
          <ActionButton type="submit" busy={checking} disabled={!draftKey.trim()}>
            Entrar
          </ActionButton>
        </form>
      </Panel>
    );
  }

  return (
    <StudioContext value={{ api, status }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {TABS.map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "focus-ring flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                tab === key
                  ? "border-cyan/60 bg-primary/10 text-cyan"
                  : "border-border text-muted hover:border-cyan/40 hover:text-cyan",
              )}
            >
              <TabIcon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(Object.keys(PROVIDER_LABELS) as Array<keyof ProviderMap>).map((p) => (
            <span
              key={p}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                status.providers[p] ? "border-sign-led/30 text-foreground" : "border-border text-muted line-through",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.providers[p] ? "bg-sign-led" : "bg-muted")} />
              {PROVIDER_LABELS[p]}
            </span>
          ))}
          <button
            type="button"
            aria-label="Salir del estudio"
            onClick={() => {
              try {
                sessionStorage.removeItem(KEY_STORAGE);
              } catch {
                // ignore
              }
              setAccessKey("");
              setDraftKey("");
              setStatus({ ...status, authorized: false });
            }}
            className="focus-ring rounded-full p-1.5 text-muted hover:text-cyan"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div role="tabpanel">
        {tab === "avatar" ? <AvatarStudio /> : tab === "voice" ? <VoiceStudio /> : <LongVideoStudio />}
      </div>
    </StudioContext>
  );
}
