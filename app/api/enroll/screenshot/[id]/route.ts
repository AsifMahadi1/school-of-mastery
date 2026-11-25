import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { SCREENSHOT_BUCKET } from "@/lib/upload";

/**
 * GET /api/enroll/screenshot/[id] — serves a screenshot stored in GridFS.
 *
 * This route only exists because the temporary storage is GridFS (see the
 * TODO in lib/upload.ts). It disappears when the screenshots move to the
 * client's real storage (Cloudinary / S3 / R2), which serves its own URLs.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: SCREENSHOT_BUCKET });
    const [file] = await bucket.find({ _id: new ObjectId(id) }).limit(1).toArray();
    if (!file) {
      return new NextResponse("Not found", { status: 404 });
    }

    const download = bucket.openDownloadStream(file._id);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        download.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        download.on("end", () => controller.close());
        download.on("error", (error) => {
          console.error("[enroll] screenshot read failed:", error);
          controller.error(error);
        });
      },
      cancel() {
        download.destroy();
      },
    });

    return new NextResponse(body, {
      headers: {
        "Content-Type":
          typeof file.metadata?.contentType === "string"
            ? file.metadata.contentType
            : "application/octet-stream",
        "Content-Length": String(file.length),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("[enroll] screenshot lookup failed:", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
