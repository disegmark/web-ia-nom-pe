"use client";

import Image from "next/image";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionPhotoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
  /** Tailwind aspect classes, e.g. "aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9]". */
  aspect?: string;
  /** CSS object-position of the crop, e.g. "50% 40%". */
  position?: string;
  priority?: boolean;
  /** Short line shown on a plate over the photo's lower-left corner. */
  caption?: ReactNode;
  className?: string;
};

/**
 * Wide photo banner for the home sections: scroll parallax, a gentle 3D tilt and a light that follows the
 * cursor (mouse only), and a slow sweep of light. Everything is off under reduced motion.
 */
export function SectionPhoto({
  src,
  alt,
  width,
  height,
  blurDataURL,
  aspect = "aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9]",
  position = "50% 42%",
  priority = false,
  caption,
  className,
}: SectionPhotoProps) {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 90, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 90, damping: 18 });
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const light = useMotionTemplate`radial-gradient(520px circle at ${lightX}% ${lightY}%, rgba(56, 211, 255, 0.2), transparent 62%)`;
  const lightOpacity = useMotionValue(0);
  const lightOpacitySpring = useSpring(lightOpacity, { stiffness: 120, damping: 20 });

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    tiltY.set((nx - 0.5) * 5);
    tiltX.set(-(ny - 0.5) * 3.5);
    lightX.set(nx * 100);
    lightY.set(ny * 100);
    lightOpacity.set(1);
  }

  function handlePointerLeave() {
    tiltX.set(0);
    tiltY.set(0);
    lightOpacity.set(0);
  }

  return (
    <div className={cn("[perspective:1400px]", className)}>
      <motion.div
        ref={frameRef}
        initial={reduce ? false : { opacity: 0, clipPath: "inset(9% 7% round 28px)", transform: "scale(0.97)" }}
        whileInView={{ opacity: 1, clipPath: "inset(0% 0% round 28px)", transform: "scale(1)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: "preserve-3d" }}
        className="group relative overflow-hidden rounded-[28px] bg-background-elevated shadow-[0_40px_90px_-40px_rgba(56,211,255,0.4),0_0_0_1px_rgba(56,211,255,0.14)]"
      >
        <div className={cn("relative w-full", aspect)}>
          <motion.div className="absolute inset-0 scale-[1.14]" style={{ y: reduce ? 0 : parallaxY }}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              sizes="(min-width: 1280px) 1152px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 3rem)"
              quality={82}
              className="h-full w-full object-cover"
              style={{ objectPosition: position }}
            />
          </motion.div>

          {/* Tie the black-and-white photo to the brand: cool shadows, warm highlights. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-sign-amber/15 mix-blend-soft-light" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(5,7,15,0.6)]" />

          {reduce ? null : (
            <>
              <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: light, opacity: lightOpacitySpring }} />
              <div aria-hidden="true" className="photo-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-cyan/15 to-transparent" />
            </>
          )}

          {caption ? (
            <div className="absolute bottom-6 left-6 hidden max-w-md sm:block" style={{ transform: "translateZ(40px)" }}>
              <p className="plate flex items-start gap-3 px-4 py-3 text-sm leading-snug text-foreground sm:text-base">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sign-led shadow-[0_0_12px_#7cffb2]" aria-hidden="true" />
                <span className="font-display font-medium">{caption}</span>
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
      {/* Phones: the caption sits under the photo so it never covers the people in it. */}
      {caption ? (
        <p className="mt-4 flex items-start gap-3 text-sm leading-snug text-foreground sm:hidden">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sign-led shadow-[0_0_12px_#7cffb2]" aria-hidden="true" />
          <span className="font-display font-medium">{caption}</span>
        </p>
      ) : null}
    </div>
  );
}
