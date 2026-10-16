import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  // Caja acrílica azul con la luz del tubo cian filtrándose por dentro del borde.
  primary:
    "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-10px_14px_-6px_rgba(56,211,255,0.35),0_16px_34px_-14px_rgba(47,93,250,0.65)] hover:bg-primary-light hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-10px_18px_-4px_rgba(56,211,255,0.5),0_0_46px_-6px_rgba(56,211,255,0.75)]",
  // Placa apagada que se enciende al pasar el cursor.
  secondary:
    "bg-background-elevated text-foreground shadow-[inset_0_1px_0_rgba(244,246,251,0.08),0_1px_0_rgba(0,0,0,0.4)] hover:text-cyan hover:shadow-[inset_0_1px_0_rgba(244,246,251,0.12),0_0_30px_-8px_rgba(56,211,255,0.5)]",
  ghost: "bg-transparent text-foreground hover:text-cyan",
};

const BASE_CLASSES =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[color,background-color,box-shadow] duration-300";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)}>
      {children}
    </Link>
  );
}
