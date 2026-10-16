import Link from "next/link";
import { Mark } from "./Mark";
import { Wordmark } from "./Wordmark";

type LogoProps = {
  href?: string;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
};

export function Logo({
  href = "/",
  className = "",
  markClassName = "h-9 w-9",
  wordmarkClassName = "text-xl font-semibold tracking-tight",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`focus-ring inline-flex flex-col items-start ${className}`}
      aria-label="Connexion — Inicio"
    >
      <span className="inline-flex items-center gap-2.5">
        <Mark className={markClassName} />
        <Wordmark className={wordmarkClassName} />
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
        Connexion
      </span>
    </Link>
  );
}
