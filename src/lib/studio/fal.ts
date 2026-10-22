const QUEUE_ORIGIN = "https://queue.fal.run";

export type FalJob = { requestId: string; statusUrl: string; responseUrl: string };

export type FalJobState =
  | { state: "queued" | "running"; position: number | null }
  | { state: "completed"; videoUrl: string }
  | { state: "failed"; error: string };

function authHeaders(apiKey: string) {
  return { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" };
}

/** Submits a job to fal's async queue; generation runs for minutes, so we poll. */
export async function submitFalJob(
  apiKey: string,
  endpoint: string,
  input: Record<string, unknown>,
): Promise<Response | FalJob> {
  const response = await fetch(`${QUEUE_ORIGIN}/${endpoint}`, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify(input),
  });
  if (!response.ok) return response;

  const data = (await response.json()) as { request_id?: string; status_url?: string; response_url?: string };
  if (!data.request_id || !data.status_url || !data.response_url) {
    return new Response("malformed fal queue response", { status: 502 });
  }
  return { requestId: data.request_id, statusUrl: data.status_url, responseUrl: data.response_url };
}

/**
 * Only fal queue URLs may be polled — the client hands them back to us, so
 * this keeps the endpoint from being used as an open proxy (SSRF).
 */
export function isFalQueueUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === QUEUE_ORIGIN && url.pathname.includes("/requests/");
  } catch {
    return false;
  }
}

export async function getFalJobState(
  apiKey: string,
  statusUrl: string,
  responseUrl: string,
): Promise<Response | FalJobState> {
  const statusResponse = await fetch(statusUrl, { headers: authHeaders(apiKey), cache: "no-store" });
  if (!statusResponse.ok) return statusResponse;

  const status = (await statusResponse.json()) as { status?: string; queue_position?: number };
  if (status.status === "IN_QUEUE") return { state: "queued", position: status.queue_position ?? null };
  if (status.status === "IN_PROGRESS") return { state: "running", position: null };
  if (status.status !== "COMPLETED") return { state: "failed", error: `estado desconocido: ${status.status}` };

  const result = await fetch(responseUrl, { headers: authHeaders(apiKey), cache: "no-store" });
  if (!result.ok) {
    // fal returns 4xx/5xx on the result URL when the model itself failed.
    const body = (await result.json().catch(() => ({}))) as { detail?: unknown };
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail ?? `HTTP ${result.status}`);
    return { state: "failed", error: detail.slice(0, 300) };
  }

  const data = (await result.json()) as { video?: { url?: string } };
  const videoUrl = data.video?.url;
  return videoUrl ? { state: "completed", videoUrl } : { state: "failed", error: "el modelo no devolvió video" };
}
