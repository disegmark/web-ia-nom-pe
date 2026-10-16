import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";
import { BADGE_BG, DOT_BG, PLATE_GLOW, type SignAccent } from "@/components/signage/Signage";
import type { Service } from "@/types";

export function ServiceCard({
  service,
  delay = 0,
  accent = "cyan",
}: {
  service: Service;
  delay?: number;
  accent?: SignAccent;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className={cn("plate h-full p-6", PLATE_GLOW[accent])}>
        <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl", BADGE_BG[accent])}>
          <Icon name={service.icon} />
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{service.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
        <ul className="mt-4 space-y-2">
          {service.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-sm text-muted">
              <span aria-hidden="true" className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", DOT_BG[accent])} />
              {bullet}
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}
