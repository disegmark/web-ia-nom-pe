import type { ReactNode } from "react";

// Matches a Markdown link `[label](url)` or a bare `http(s)://...` URL.
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/\S+?)\)|(https?:\/\/\S+)/g;
const TRAILING_PUNCTUATION_RE = /[.,;:!?)]+$/;

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
      parts.push(text.slice(lastIndex, match.index));
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

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
