import { NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  need?: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPayload(value: unknown): value is ContactPayload {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    record.name.trim().length > 1 &&
    typeof record.email === "string" &&
    EMAIL_PATTERN.test(record.email) &&
    typeof record.message === "string" &&
    record.message.trim().length > 5
  );
}

/**
 * Contact intake endpoint. No email/CRM provider is wired yet — this
 * validates and logs server-side so the frontend has a real endpoint to
 * call. Plug a provider (Resend, SMTP, CRM webhook) behind
 * CONTACT_NOTIFY_URL / CONTACT_NOTIFY_API_KEY (server-only env vars) when
 * ready; nothing about the transport needs to change on the client.
 */
export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isValidPayload(payload)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 422 });
  }

  const notifyUrl = process.env.CONTACT_NOTIFY_URL;
  const notifyApiKey = process.env.CONTACT_NOTIFY_API_KEY;

  if (notifyUrl) {
    try {
      await fetch(notifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(notifyApiKey ? { Authorization: `Bearer ${notifyApiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[contact] notify webhook failed", error);
    }
  } else {
    console.info("[contact] new submission (no CONTACT_NOTIFY_URL configured)", payload);
  }

  return NextResponse.json({ ok: true });
}
