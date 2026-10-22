import { ASPECT_RATIOS, findVideoModel, type AspectRatio } from "@/lib/studio/config";
import { getFalJobState, isFalQueueUrl, submitFalJob } from "@/lib/studio/fal";
import {
  asMediaUrl,
  asString,
  guardStudio,
  readJson,
  studioError,
  upstreamError,
  withNetworkErrors,
} from "@/lib/studio/guard";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 2000;

/** Queues one scene. Body: { model, prompt, duration, aspectRatio, imageUrl?, negativePrompt? } */
async function handlePost(request: Request) {
  const apiKey = guardStudio(request, "fal");
  if (typeof apiKey !== "string") return apiKey;

  const body = await readJson(request);
  const model = findVideoModel(body?.model);
  const prompt = asString(body?.prompt, MAX_PROMPT_LENGTH);
  if (!model || !prompt) return studioError("invalid_payload", 422);

  const imageUrl = body?.imageUrl ? asMediaUrl(body.imageUrl) : undefined;
  if (body?.imageUrl && !imageUrl) return studioError("invalid_image", 422);

  const scene = {
    prompt,
    duration: typeof body?.duration === "number" ? body.duration : model.durations[0],
    aspectRatio: ASPECT_RATIOS.includes(body?.aspectRatio as AspectRatio) ? (body?.aspectRatio as AspectRatio) : "16:9",
    imageUrl,
    negativePrompt: asString(body?.negativePrompt, 500),
  };

  const job = await submitFalJob(apiKey, imageUrl ? model.imageEndpoint : model.textEndpoint, model.buildInput(scene));
  if (job instanceof Response) return upstreamError("fal", job);
  return Response.json(job);
}

/** Polls a queued job: ?status=<statusUrl>&response=<responseUrl> */
async function handleGet(request: Request) {
  const apiKey = guardStudio(request, "fal");
  if (typeof apiKey !== "string") return apiKey;

  const params = new URL(request.url).searchParams;
  const statusUrl = params.get("status");
  const responseUrl = params.get("response");
  if (!isFalQueueUrl(statusUrl) || !isFalQueueUrl(responseUrl)) return studioError("invalid_job", 422);

  const state = await getFalJobState(apiKey, statusUrl, responseUrl);
  if (state instanceof Response) return upstreamError("fal", state);
  return Response.json(state);
}

export const POST = withNetworkErrors("fal", handlePost);
export const GET = withNetworkErrors("fal", handleGet);
