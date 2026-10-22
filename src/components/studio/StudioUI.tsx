"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASPECT_RATIOS, type AspectRatio } from "./studio-client";

export const INPUT_CLASSES =
  "focus-ring w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 focus:border-cyan/50";

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("plate p-5 sm:p-6", className)}>
      {title ? <h2 className="font-display mb-4 text-lg font-semibold text-foreground">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted/80">{hint}</span> : null}
    </label>
  );
}

export function Slider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs text-muted">
        <span className="font-medium uppercase tracking-wide">{label}</span>
        <span className="tabular-nums text-foreground">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--cyan)]"
      />
      {hint ? <span className="block text-xs text-muted/80">{hint}</span> : null}
    </label>
  );
}

export function AspectPicker({ value, onChange }: { value: AspectRatio; onChange: (value: AspectRatio) => void }) {
  const labels: Record<AspectRatio, string> = { "16:9": "Horizontal", "9:16": "Vertical", "1:1": "Cuadrado" };
  return (
    <div className="flex flex-wrap gap-2">
      {ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio}
          type="button"
          onClick={() => onChange(ratio)}
          aria-pressed={value === ratio}
          className={cn(
            "focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === ratio ? "border-cyan/60 bg-primary/10 text-cyan" : "border-border text-muted hover:text-cyan",
          )}
        >
          {ratio} · {labels[ratio]}
        </button>
      ))}
    </div>
  );
}

export function ActionButton({
  children,
  busy,
  disabled,
  onClick,
  variant = "primary",
  type = "button",
}: {
  children: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-primary text-white hover:bg-primary-light"
          : "border border-border bg-background-elevated text-foreground hover:text-cyan",
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-3.5 py-2.5 text-sm",
        tone === "error" ? "bg-sign-signal/10 text-sign-signal" : "bg-primary/10 text-cyan",
      )}
    >
      {children}
    </p>
  );
}

export function aspectClass(ratio: AspectRatio) {
  return ratio === "9:16" ? "aspect-[9/16] max-h-[70vh]" : ratio === "1:1" ? "aspect-square" : "aspect-video";
}
