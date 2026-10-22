"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { aspectClass } from "./StudioUI";
import type { AspectRatio } from "./studio-client";

/**
 * Plays finished scenes back to back as one continuous film, so a long video
 * can be previewed before (or without) merging it into a single file.
 */
export function SequencePlayer({ clips, aspectRatio }: { clips: Array<{ id: string; url: string; title: string }>; aspectRatio: AspectRatio }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const current = clips[Math.min(index, clips.length - 1)];

  useEffect(() => {
    if (autoplay) void videoRef.current?.play().catch(() => undefined);
  }, [index, autoplay]);

  if (!current) return null;

  return (
    <div>
      <div className={cn("mx-auto w-full overflow-hidden rounded-xl bg-black", aspectClass(aspectRatio))}>
        <video
          ref={videoRef}
          key={current.id}
          src={current.url}
          controls
          playsInline
          onPlay={() => setAutoplay(true)}
          onEnded={() => {
            if (index < clips.length - 1) setIndex(index + 1);
            else setAutoplay(false);
          }}
          className="h-full w-full object-contain"
        />
      </div>
      <ol className="mt-3 flex gap-1.5" aria-label="Escenas">
        {clips.map((clip, i) => (
          <li key={clip.id} className="flex-1">
            <button
              type="button"
              onClick={() => {
                setIndex(i);
                setAutoplay(true);
              }}
              title={clip.title}
              aria-label={`Escena ${i + 1}: ${clip.title}`}
              aria-current={i === index}
              className={cn(
                "focus-ring block h-2 w-full rounded-full transition-colors",
                i === index ? "bg-cyan" : i < index ? "bg-primary" : "bg-border hover:bg-muted",
              )}
            />
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-muted">
        Escena {index + 1} de {clips.length} · {current.title}
      </p>
    </div>
  );
}
