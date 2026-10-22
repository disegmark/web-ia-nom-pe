import { timingSafeEqual } from "node:crypto";
import { providerKey, type StudioProvider } from "./config";

// Every studio call spends paid provider credits, so the whole API sits behind
// a shared access key (STUDIO_ACCESS_KEY). Without it the studio stays locked.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;

export function studioError(error: string, status: number, detail?: string) {
  return Response.json({ error, ...(detail ? { detail } : {}) }, { status });
}

function keysMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// In-memory sliding window per IP — best-effort (not shared across instances),
// a backstop against a leaked key looping requests, not a security boundary.
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(key, recent);

  if (requestLog.size > 5000) {
    for (const [entryKey, timestamps] of requestLog) {
      if (timestamps.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) requestLog.delete(entryKey);
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

export function isStudioAuthorized(request: Request): boolean {
  const expected = process.env.STUDIO_ACCESS_KEY?.trim();
  if (!expected) return false;
  const given = request.headers.get("x-studio-key")?.trim() ?? "";
  return keysMatch(given, expected);
}

/**
 * Returns an error Response when the request must be rejected, or the
 * provider API key when it may proceed.
 */
export function guardStudio(request: Request, provider: StudioProvider): Response | string {
  if (!process.env.STUDIO_ACCESS_KEY?.trim()) return studioError("studio_not_configured", 503);
  if (!isStudioAuthorized(request)) return studioError("unauthorized", 401);

  const forwarded = request.headers.get("x-forwarded-for");
  if (isRateLimited(forwarded?.split(",")[0]?.trim() || "unknown")) return studioError("rate_limited", 429);

  const key = providerKey(provider);
  if (!key) return studioError(`${provider}_not_configured`, 503);
  return key;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = await request.json();
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function asString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : undefined;
}

/** Accepts https URLs or image data URIs (used for start frames). */
export function asMediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 8_000_000) return undefined;
  if (/^data:image\/(png|jpeg|webp);base64,/.test(value)) return value;
  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Upstream error → logged server-side, generic message to the client. */
export async function upstreamError(tag: string, response: Response) {
  const body = await response.text().catch(() => "");
  console.error(`[studio:${tag}] upstream ${response.status}`, body.slice(0, 500));
  return studioError(`${tag}_upstream_error`, response.status === 429 ? 429 : 502, `HTTP ${response.status}`);
}

/** Wraps a route handler so a provider that can't be reached returns a JSON 502 instead of crashing. */
export function withNetworkErrors(tag: string, handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error(`[studio:${tag}] request failed`, error);
      return studioError(`${tag}_unreachable`, 502);
    }
  };
}
