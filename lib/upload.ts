import { GridFSBucket, ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";

/**
 * Screenshot storage.
 *
 * The image bytes NEVER go into the enrollment document — only a URL does.
 * The size/type rules live in lib/screenshot.ts (shared with the browser form);
 * this file is server-only.
 *
 * TODO(storage): the final storage is not decided yet. When the client picks
 * Cloudinary / S3 / R2, replace `uploadScreenshot` with their SDK call and keep
 * the same signature (`File` in, URL out) — nothing else in the app changes.
 * The current implementation is a placeholder: MongoDB GridFS, served back by
 * app/api/enroll/screenshot/[id]/route.ts.
 */

export const SCREENSHOT_BUCKET = "screenshots";

/** Stores the screenshot and returns the URL saved on the enrollment document. */
export async function uploadScreenshot(file: File): Promise<string> {
  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: SCREENSHOT_BUCKET });
  const id = new ObjectId();
  const buffer = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    const upload = bucket.openUploadStreamWithId(id, safeFileName(file.name), {
      // MongoDB v6+ keeps extra fields in `metadata` (contentType is no longer a
      // top-level option); the serving route reads it back from there.
      metadata: { contentType: file.type },
    });
    upload.on("finish", () => resolve());
    upload.on("error", reject);
    upload.end(buffer);
  });

  return `/api/enroll/screenshot/${id.toHexString()}`;
}

function safeFileName(name: string): string {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").replace(/^_+/, "").slice(-60);
  return cleaned || "screenshot";
}
