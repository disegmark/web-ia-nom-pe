"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/85 shadow-[0_1px_0_rgba(244,246,251,0.08),0_16px_30px_-22px_rgba(56,211,255,0.3)] backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "focus-ring relative pb-1 text-sm font-medium text-muted transition-colors after:absolute after:inset-x-0 after:-bottom-[5px] after:h-px after:origin-center after:scale-x-0 after:bg-cyan after:shadow-[0_0_8px_rgba(56,211,255,0.8)] after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100",
                  active && "sign-text-cyan after:scale-x-100"
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/contacto" variant="primary" className="px-5 py-2.5 text-sm">
            Conversemos
          </ButtonLink>
        </div>

        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full p-2 text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Navegación móvil"
          className="border-t border-border bg-background lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg px-3 py-3 text-base font-medium text-muted hover:bg-background-elevated hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="focus-ring mt-2 rounded-full bg-primary px-3 py-3 text-center text-base font-medium text-white"
            >
              Conversemos
            </Link>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
