import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveFile } from "@/lib/storage";

// Configure route to handle larger uploads
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as "photos" | "audio" | null;
  if (!file || !type || (type !== "photos" && type !== "audio")) {
    return NextResponse.json(
      { error: "Missing file or invalid type (photos|audio)" },
      { status: 400 }
    );
  }
  
  // Check file size (4MB limit for photos)
  const MAX_SIZE = type === "photos" ? 4 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` },
      { status: 413 }
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const allowed = type === "photos" ? ["jpg", "jpeg", "png", "webp"] : ["webm", "mp3", "ogg", "m4a"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  const path = await saveFile(buffer, type, ext);
  return NextResponse.json({ path });
}
