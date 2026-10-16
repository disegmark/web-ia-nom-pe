"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Wordmark, Tagline } from "@/components/brand/Wordmark";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Premium load-in for the ia.nom.pe mark: rings trace themselves, the two
 * satellite nodes ignite, the core "IA" glyph resolves, then the wordmark
 * and tagline settle in. Reduced-motion users get the final state with a
 * short fade instead of the full sequence.
 */
export function LogoAnimation() {
  const shouldReduceMotion = useReducedMotion();
  const reduced = Boolean(shouldReduceMotion);

  const ringTransition = (delay: number) => ({
    pathLength: { duration: reduced ? 0.01 : 1.4, delay: reduced ? 0 : delay, ease: EASE },
    opacity: { duration: reduced ? 0.2 : 0.4, delay: reduced ? 0 : delay },
  });

  return (
    <div className="flex flex-col items-center text-center">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        className="h-40 w-40 sm:h-52 sm:w-52"
        role="img"
        aria-label="ia.nom.pe"
      >
        <defs>
          <linearGradient id="hero-ring" x1="30" y1="170" x2="170" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2f5dfa" />
            <stop offset="1" stopColor="#38d3ff" />
          </linearGradient>
          <linearGradient id="hero-band" x1="120" y1="90" x2="175" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5b8bff" />
            <stop offset="1" stopColor="#c8e8ff" />
          </linearGradient>
          <clipPath id="hero-a-clip">
            <path d="M141 64L177 134H159L141 98L123 134H105L141 64Z" />
          </clipPath>
        </defs>

        <motion.circle
          cx="100"
          cy="100"
          r="80"
          stroke="#f4f6fb"
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(60 100 100)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 0.75, opacity: 1 }}
          transition={ringTransition(0)}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="62"
          stroke="url(#hero-ring)"
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(60 100 100)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 0.75, opacity: 1 }}
          transition={ringTransition(0.25)}
        />

        <motion.circle
          cx="175"
          cy="73"
          r="13"
          fill="#2f5dfa"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1.2, ease: EASE }}
        />
        <motion.circle
          cx="144"
          cy="144"
          r="10"
          fill="#f4f6fb"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1.4, ease: EASE }}
        />

        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 1.6, ease: EASE }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <path fill="#f4f6fb" d="M70 66H86V134H70V66Z" />
          <g clipPath="url(#hero-a-clip)">
            <path fill="#f4f6fb" d="M141 64L177 134H159L141 98L123 134H105L141 64Z" />
            <rect x="118" y="88" width="60" height="14" fill="url(#hero-band)" />
          </g>
        </motion.g>
      </motion.svg>

      <motion.p
        initial={{ opacity: 0, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1.9, ease: EASE }}
        className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-muted sm:text-sm"
      >
        Connexion
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 2.1, ease: EASE }}
        className="mt-2"
      >
        <Wordmark className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 2.5, ease: EASE }}
        className="mt-2"
      >
        <Tagline className="text-xs font-medium sm:text-sm" />
      </motion.div>
    </div>
  );
}
