import { NextResponse, type NextRequest } from "next/server";

import { enrollmentSchema } from "@/lib/enrollment";
import { ENROLLMENTS_COLLECTION, getDb } from "@/lib/mongodb";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { validateScreenshot } from "@/lib/screenshot";
import { uploadScreenshot } from "@/lib/upload";

// Route handlers use the Node.js runtime by default, which is what the
// MongoDB driver needs (it opens TCP sockets).

/**
 * POST /api/enroll — the enrollment form.
 *
 * Accepts multipart/form-data (the screenshot rides along as a File). Validates
 * with the same zod schema the browser uses, uploads the screenshot through
 * lib/upload.ts, then stores one document in `enrollments`.
 *
 * Every response is JSON { ok, error? }. Raw database errors are only ever
 * logged server-side — the client gets a friendly sentence.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(clientIp(request.headers));
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "You've submitted this a few times already. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, Math.ceil(limited.retryAfterMs / 1000))) },
      },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't read the form. Please refresh the page and try again." },
      { status: 400 },
    );
  }

  const parsed = enrollmentSchema.safeParse({
    fullName: String(form.get("fullName") ?? ""),
    profession: String(form.get("profession") ?? ""),
    phone: String(form.get("phone") ?? ""),
    address: String(form.get("address") ?? ""),
    paymentMethod: String(form.get("paymentMethod") ?? ""),
    transactionId: String(form.get("transactionId") ?? ""),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        ok: false,
        error: issue?.message ?? "Please check the form and try again.",
        field: issue?.path?.[0] ?? null,
      },
      { status: 400 },
    );
  }

  // Optional screenshot — validated again here (the browser check is just UX).
  let screenshotUrl = "";
  const file = form.get("screenshot");
  if (file instanceof File && file.size > 0) {
    const check = validateScreenshot(file);
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: check.error, field: "screenshot" }, { status: 400 });
    }
    try {
      screenshotUrl = await uploadScreenshot(file);
    } catch (error) {
      console.error("[enroll] screenshot upload failed:", error);
      return NextResponse.json(
        { ok: false, error: "We couldn't save your screenshot. Please try again.", field: "screenshot" },
        { status: 500 },
      );
    }
  }

  try {
    const db = await getDb();
    await db.collection(ENROLLMENTS_COLLECTION).insertOne({
      ...parsed.data,
      screenshotUrl,
      status: "pending",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[enroll] insert failed:", error);
    // If the insert fails after a screenshot was uploaded (e.g. a duplicate
    // transaction ID), the GridFS file stays behind. TODO(storage): delete it
    // here once the real storage is chosen — Cloudinary/S3 make that one call.
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This transaction ID has already been submitted. If that wasn't you, message us on WhatsApp or Discord and we'll sort it out.",
          field: "transactionId",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Something went wrong on our side. Please try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
