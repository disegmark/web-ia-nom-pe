import type { ReactNode } from "react";
import { Reveal } from "@/components/animations/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { IconKey } from "@/types";

export type SignAccent = "cyan" | "amber" | "signal";

/** Shared accent maps — reused by the card components so every plate in the
 * site draws its glow, badge, and dot colors from the same three signs. */
export const TEXT_GLOW: Record<SignAccent, string> = {
  cyan: "sign-text-cyan",
  amber: "sign-text-amber",
  signal: "sign-text-signal",
};

export const PLATE_GLOW: Record<SignAccent, string> = {
  cyan: "plate-glow-cyan",
  amber: "plate-glow-amber",
  signal: "plate-glow-signal",
};

export const BADGE_BG: Record<SignAccent, string> = {
  cyan: "bg-cyan/15 text-cyan",
  amber: "bg-sign-amber/15 text-sign-amber",
  signal: "bg-sign-signal/15 text-sign-signal",
};

export const DOT_BG: Record<SignAccent, string> = {
  cyan: "bg-cyan",
  amber: "bg-sign-amber",
  signal: "bg-sign-signal",
};

export const PLATE_LIT: Record<SignAccent, string> = {
  cyan: "plate-lit-cyan",
  amber: "plate-lit-amber",
  signal: "plate-lit-signal",
};

const TAG_BG: Record<SignAccent, string> = {
  cyan: "bg-cyan/10 text-cyan",
  amber: "bg-sign-amber/10 text-sign-amber",
  signal: "bg-sign-signal/10 text-sign-signal",
};

const ACTIVE_MARKER: Record<SignAccent, string> = {
  cyan: "bg-cyan text-background shadow-[0_0_22px_-2px_rgba(56,211,255,0.85)]",
  amber: "bg-sign-amber text-background shadow-[0_0_22px_-2px_rgba(255,182,72,0.85)]",
  signal: "bg-sign-signal text-background shadow-[0_0_22px_-2px_rgba(255,84,112,0.85)]",
};

/** One word of a heading lit up like a sign tube — the replacement for a kicker/eyebrow label. */
export function SignWord({ children, accent = "cyan" }: { children: ReactNode; accent?: SignAccent }) {
  return <span className={cn("font-display", TEXT_GLOW[accent])}>{children}</span>;
}

/** Section heading: no eyebrow, no kicker. `title` can embed a <SignWord> for the one lit phrase. */
export function SignHeading({
  title,
  description,
  align = "left",
  className,
}: {
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-balance text-base leading-relaxed text-muted sm:text-lg">{description}</p>
      ) : null}
    </Reveal>
  );
}

/** Small backlit plate for a list item — replaces the generic icon-circle + heading + text grid cell. */
export function SignPlate({
  icon,
  title,
  description,
  accent = "cyan",
  delay = 0,
  className,
}: {
  icon?: IconKey;
  title: string;
  description: string;
  accent?: SignAccent;
  delay?: number;
  className?: string;
}) {
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <div className={cn("plate flex h-full flex-col gap-3 p-5", PLATE_GLOW[accent])}>
        {icon ? (
          <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg", BADGE_BG[accent])}>
            <Icon name={icon} className="h-4 w-4" />
          </span>
        ) : null}
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted">{description}</p>
      </div>
    </Reveal>
  );
}

/** Small engraved-plate tag for inline data (a category, a source) — not a page-level kicker. */
export function SignTag({ children, accent = "cyan" }: { children: ReactNode; accent?: SignAccent }) {
  return (
    <span className={cn("led-readout inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium", TAG_BG[accent])}>
      {children}
    </span>
  );
}

/** Numbered marker for a real sequence (steps that happen in order) — small lit plate, not a bare circle. */
export function SignMarker({
  index,
  active = false,
  accent = "cyan",
  className,
}: {
  index: number;
  active?: boolean;
  accent?: SignAccent;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "led-readout relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300",
        active ? ACTIVE_MARKER[accent] : cn("plate", TEXT_GLOW[accent]),
        className
      )}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}
