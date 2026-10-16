type WordmarkProps = {
  className?: string;
};

/**
 * "ia.nom.pe" as real text (not an image) so it stays crisp, selectable,
 * and legible to search engines — the periods pick up the brand cyan to
 * echo the connection nodes in the mark.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={className}>
      ia<span className="text-cyan">.</span>nom<span className="text-cyan">.</span>pe
    </span>
  );
}

export function Tagline({ className }: WordmarkProps) {
  return (
    <span className={`uppercase tracking-[0.3em] text-cyan ${className ?? ""}`}>
      Conectamos inteligencia
    </span>
  );
}
