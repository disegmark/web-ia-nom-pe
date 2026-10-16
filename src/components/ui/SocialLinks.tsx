import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { cn } from "@/lib/utils";

type SocialLink = {
  name: string;
  Icon: IconType;
  /** No hay cuentas conectadas todavía — se completa cuando existan los perfiles reales. */
  href: string | null;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Facebook", Icon: FaFacebook, href: "https://www.facebook.com/iAConnexion" },
  { name: "Instagram", Icon: FaInstagram, href: "https://www.instagram.com/iaconnexion" },
  { name: "LinkedIn", Icon: FaLinkedin, href: null },
  { name: "YouTube", Icon: FaYoutube, href: null },
  { name: "TikTok", Icon: FaTiktok, href: null },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-3", className)}>
      {SOCIAL_LINKS.map(({ name, Icon, href }) => (
        <li key={name}>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="focus-ring flex h-4 w-4 items-center justify-center text-muted transition-colors hover:text-cyan"
            >
              <Icon className="h-full w-full" />
            </a>
          ) : (
            <span
              aria-label={`${name} (próximamente)`}
              title={`${name} (próximamente)`}
              className="flex h-4 w-4 cursor-default items-center justify-center text-muted/50"
            >
              <Icon className="h-full w-full" />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
