import { MERGE_VIDEOS_ENDPOINT } from "@/lib/studio/config";
import { submitFalJob } from "@/lib/studio/fal";
import { asMediaUrl, guardStudio, readJson, studioError, upstreamError, withNetworkErrors } from "@/lib/studio/guard";

export const runtime = "nodejs";

const MAX_CLIPS = 40;

/**
 * Stitches the finished scenes into one long video with fal's ffmpeg API.
 * Returns a queue job; poll it with GET /api/studio/video like any scene.
 */
async function handlePost(request: Request) {
  const apiKey = guardStudio(request, "fal");
  if (typeof apiKey !== "string") return apiKey;

  const body = await readJson(request);
  const urls = Array.isArray(body?.urls) ? body.urls.map((u) => asMediaUrl(u)) : [];
  if (urls.length < 2 || urls.length > MAX_CLIPS || urls.some((u) => !u || u.startsWith("data:"))) {
    return studioError("invalid_payload", 422);
  }

  const job = await submitFalJob(apiKey, MERGE_VIDEOS_ENDPOINT, { video_urls: urls });
  if (job instanceof Response) return upstreamError("fal", job);
  return Response.json(job);
}

export const POST = withNetworkErrors("fal", handlePost);
