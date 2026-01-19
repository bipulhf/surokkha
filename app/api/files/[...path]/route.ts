import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const DATA_DIR = join(process.cwd(), "data");

const CONTENT_TYPES: Record<string, string> = {
  webm: "audio/webm",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const safe = pathSegments.every((p) => !p.includes("..") && p.length > 0);
  if (!safe) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const filepath = join(DATA_DIR, ...pathSegments);
  try {
    const file = await readFile(filepath);
    const ext = pathSegments[pathSegments.length - 1]?.split(".").pop()?.toLowerCase();
    const contentType = (ext && CONTENT_TYPES[ext]) || "application/octet-stream";
    return new NextResponse(file, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
