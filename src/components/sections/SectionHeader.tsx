import { cn } from "@/lib/utils";
import { Reveal } from "@/components/animations/Reveal";

/** Section heading: no eyebrow/kicker label — the heading itself carries the weight. */
export function SectionHeader({
  title,
  description,
  align = "left",
  className,
}: {
  /** Kept for existing call sites; no longer rendered as a kicker label. */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-balance text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
