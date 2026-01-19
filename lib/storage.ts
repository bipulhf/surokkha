import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

const DATA_DIR = join(process.cwd(), "data");

export async function saveFile(
  file: Buffer,
  type: "photos" | "audio",
  extension: string
): Promise<string> {
  const dir = join(DATA_DIR, type);
  await mkdir(dir, { recursive: true });
  const filename = `${nanoid()}.${extension}`;
  const filepath = join(dir, filename);
  await writeFile(filepath, file);
  return `${type}/${filename}`;
}
