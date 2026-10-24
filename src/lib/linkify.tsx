import type { ReactNode } from "react";

// Matches a Markdown link `[label](url)` or a bare `http(s)://...` URL.
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/\S+?)\)|(https?:\/\/\S+)/g;
const TRAILING_PUNCTUATION_RE = /[.,;:!?)]+$/;

const BOLD_RE = /\*([^*\n]+)\*/g;

/** WhatsApp-style `*bold*` (the 360 assistant writes that way) rendered as bold text. */
function boldify(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  BOLD_RE.lastIndex = 0;
  while ((m = BOLD_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<strong key={`${keyPrefix}-b-${n++}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Renders chat message text with any link made clickable. Chat bubbles show
 * plain text (no Markdown renderer), so a model that slips into `[label](url)`
 * syntax — or just drops a bare URL — would otherwise show up as dead text.
 */
export function linkifyText(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let linkIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_RE.exec(text)) !== null) {
    const [full, mdLabel, mdUrl, bareUrl] = match;

    if (match.index > lastIndex) {
      parts.push(...boldify(text.slice(lastIndex, match.index), `${keyPrefix}-t${linkIndex}`));
    }

    let url = mdUrl ?? bareUrl;
    let trailing = "";
    if (!mdUrl) {
      const trailingMatch = url.match(TRAILING_PUNCTUATION_RE);
      if (trailingMatch) {
        trailing = trailingMatch[0];
        url = url.slice(0, -trailing.length);
      }
    }

    parts.push(
      <a
        key={`${keyPrefix}-link-${linkIndex++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan underline underline-offset-2"
      >
        {mdLabel ?? url}
      </a>,
    );
    if (trailing) parts.push(trailing);

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) parts.push(...boldify(text.slice(lastIndex), `${keyPrefix}-tail`));
  return parts;
}
