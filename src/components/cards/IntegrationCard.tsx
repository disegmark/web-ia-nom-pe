import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";
import { BADGE_BG, PLATE_GLOW, type SignAccent } from "@/components/signage/Signage";
import type { Integration } from "@/types";

export function IntegrationCard({
  integration,
  delay = 0,
  accent = "cyan",
}: {
  integration: Integration;
  delay?: number;
  accent?: SignAccent;
}) {
  return (
    <Reveal delay={delay}>
      <div className={cn("plate flex items-center gap-3 px-4 py-3.5", PLATE_GLOW[accent])}>
        <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", BADGE_BG[accent])}>
          <Icon name={integration.icon} className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{integration.name}</p>
          <p className="text-xs text-muted">{integration.category}</p>
        </div>
      </div>
    </Reveal>
  );
}
