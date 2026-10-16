import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";
import { PLATE_GLOW, type SignAccent } from "@/components/signage/Signage";

export function FeatureCard({
  title,
  description,
  delay = 0,
  accent = "cyan",
}: {
  title: string;
  description: string;
  delay?: number;
  accent?: SignAccent;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className={cn("plate h-full p-6", PLATE_GLOW[accent])}>
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </Reveal>
  );
}
