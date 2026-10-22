import { providerStatus, VIDEO_MODELS } from "@/lib/studio/config";
import { isStudioAuthorized } from "@/lib/studio/guard";

export const runtime = "nodejs";

/** Tells the studio UI what is unlocked. Never returns secrets. */
export async function GET(request: Request) {
  const enabled = Boolean(process.env.STUDIO_ACCESS_KEY?.trim());

  return Response.json({
    enabled,
    authorized: enabled && isStudioAuthorized(request),
    providers: providerStatus(),
    videoModels: VIDEO_MODELS.map(({ id, label, description, durations, audio }) => ({
      id,
      label,
      description,
      durations,
      audio,
    })),
  });
}
