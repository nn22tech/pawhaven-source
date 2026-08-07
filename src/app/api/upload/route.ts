import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/session";
import crypto from "crypto";

/**
 * POST /api/upload — staff only.
 * Accepts multipart/form-data with field `files` (one or many).
 *
 * Storage strategy (auto-detected):
 *  - On Vercel/serverless (read-only FS): files are returned as base64 data
 *    URLs so they work immediately without external storage setup. For
 *    production scale, swap this for Vercel Blob / S3.
 *  - Locally (writable FS): files are saved to /public/uploads and the
 *    public URL is returned.
 */
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const MAX = 5 * 1024 * 1024; // 5MB per file (keeps data URLs reasonable)
  const results: { url: string; type: "IMAGE" | "VIDEO"; name: string }[] = [];

  for (const file of files) {
    if (file.size > MAX) {
      return NextResponse.json(
        { error: `${file.name} exceeds 5MB limit` },
        { status: 413 }
      );
    }
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: `${file.name} is not an image or video` },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Try local filesystem first (works in dev + any writable FS).
    // On Vercel serverless, /public is read-only at runtime, so this will
    // throw and we fall back to a data URL.
    let url: string;
    try {
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
      const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
      await writeFile(path.join(uploadDir, name), buffer);
      url = `/uploads/${name}`;
    } catch {
      // Read-only filesystem (Vercel) — use a data URL as a portable fallback.
      // For production, replace with Vercel Blob upload.
      url = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    results.push({ url, type: isVideo ? "VIDEO" : "IMAGE", name: file.name });
  }

  return NextResponse.json({ files: results });
}
