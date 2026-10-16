"use client";

import { motion, useReducedMotion } from "framer-motion";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/constants";

export function WhatsAppButton() {
  const shouldReduceMotion = useReducedMotion();
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp a ia.nom.pe"
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.6, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.5, delay: shouldReduceMotion ? 0 : 1.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      className="focus-ring fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.65)] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.02 3C9.4 3 4 8.36 4 14.98c0 2.2.6 4.28 1.63 6.06L3 29l8.2-2.55a12.9 12.9 0 0 0 4.82.94h.01c6.63 0 12.02-5.37 12.02-11.98C28.05 8.79 22.65 3 16.02 3Zm0 21.86h-.01a10.7 10.7 0 0 1-5.46-1.5l-.39-.23-4.86 1.51 1.55-4.72-.25-.39a9.9 9.9 0 0 1-1.55-5.35C5.05 9.5 10.02 4.9 16.02 4.9c2.85 0 5.53 1.12 7.55 3.14a10.63 10.63 0 0 1 3.13 7.53c0 5.6-4.98 10.29-10.68 10.29Zm5.86-7.7c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.51-.16-.73.16-.21.32-.84 1.04-1.03 1.25-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.58-1.6-.95-.85-1.6-1.9-1.78-2.22-.19-.32-.02-.5.14-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.24 3.42 5.43 4.79.76.33 1.35.53 1.81.68.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </motion.a>
  );
}
