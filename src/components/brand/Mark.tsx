type MarkProps = {
  className?: string;
  title?: string;
};

/**
 * Inline recreation of the ia.nom.pe orbital mark (two open rings + node
 * satellites bridging the gap, "IA" glyph at the core). Kept as a single
 * component so the same geometry can back the static logo, the favicon
 * source, and the animated hero version.
 */
export function Mark({ className, title = "ia.nom.pe" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="mark-ring" x1="30" y1="170" x2="170" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f5dfa" />
          <stop offset="1" stopColor="#38d3ff" />
        </linearGradient>
        <linearGradient id="mark-band" x1="120" y1="90" x2="175" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b8bff" />
          <stop offset="1" stopColor="#c8e8ff" />
        </linearGradient>
        <clipPath id="mark-a-clip">
          <path d="M141 64L177 134H159L141 98L123 134H105L141 64Z" />
        </clipPath>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="80"
        stroke="currentColor"
        className="text-foreground"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="377 126"
        transform="rotate(60 100 100)"
      />
      <circle
        cx="100"
        cy="100"
        r="62"
        stroke="url(#mark-ring)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="292 97"
        transform="rotate(60 100 100)"
      />

      <circle cx="175" cy="73" r="13" fill="#2f5dfa" />
      <circle cx="144" cy="144" r="10" fill="currentColor" className="text-foreground" />

      <path fill="currentColor" className="text-foreground" d="M70 66H86V134H70V66Z" />
      <g clipPath="url(#mark-a-clip)">
        <path fill="currentColor" className="text-foreground" d="M141 64L177 134H159L141 98L123 134H105L141 64Z" />
        <rect x="118" y="88" width="60" height="14" fill="url(#mark-band)" />
      </g>
    </svg>
  );
}
