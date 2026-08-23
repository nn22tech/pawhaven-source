import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/session";
import crypto from "crypto";

/**
 * POST /api/upload — staff only.
 * Accepts multipart/form-data with field `files` (one or many).
 *
 * STORAGE STRATEGY (optimized for Neon free tier):
 *  - Production (Vercel): Uses Vercel Blob — files stored in Blob storage,
 *    only the URL is saved to Neon. Zero database bloat.
 *  - Local dev (no Blob token): Saves to /public/uploads.
 *
 * Previous base64 fallback removed — it bloated the Neon database and
 * consumed all free-tier compute hours.
 */
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const MAX = 10 * 1024 * 1024; // 10MB per file
  const results: { url: string; type: "IMAGE" | "VIDEO"; name: string }[] = [];

  for (const file of files) {
    if (file.size > MAX) {
      return NextResponse.json(
        { error: `${file.name} exceeds 10MB limit` },
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

    // Try Vercel Blob first (production)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
        const blobName = `uploads/${crypto.randomBytes(12).toString("hex")}.${ext}`;
        const blob = await put(blobName, file, {
          access: "public",
          contentType: file.type,
          addRandomSuffix: false,
        });
        results.push({ url: blob.url, type: isVideo ? "VIDEO" : "IMAGE", name: file.name });
        continue;
      } catch (e) {
        console.error("Blob upload failed, falling back to local:", e);
      }
    }

    // Fallback: local filesystem (dev only)
    try {
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
      const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
      await writeFile(path.join(uploadDir, name), buffer);
      results.push({ url: `/uploads/${name}`, type: isVideo ? "VIDEO" : "IMAGE", name: file.name });
    } catch {
      return NextResponse.json(
        { error: "Upload failed. Set BLOB_READ_WRITE_TOKEN in Vercel for production uploads." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ files: results });
}
