/**
 * Screenshot rules — shared by the form (instant feedback) and the API route
 * (the real gate).
 *
 * Deliberately free of any server-only import (no mongodb here), so the client
 * component can use it without pulling the database driver into the bundle.
 * The storage itself lives in lib/upload.ts.
 */

export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_SCREENSHOT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

/** For the <input type="file" accept=...> attribute. */
export const SCREENSHOT_ACCEPT = ALLOWED_SCREENSHOT_TYPES.join(",");

export type ScreenshotCheck = { ok: true } | { ok: false; error: string };

export function validateScreenshot(file: { type: string; size: number }): ScreenshotCheck {
  if (file.size <= 0) {
    return { ok: false, error: "That file looks empty — please pick the screenshot again." };
  }
  if (!(ALLOWED_SCREENSHOT_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: "Only image files are allowed (PNG, JPG, WebP, GIF)." };
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return { ok: false, error: "Images must be 5MB or smaller — please compress it and try again." };
  }
  return { ok: true };
}
