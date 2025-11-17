import { put } from "@vercel/blob";
import { UploadResult } from "../upload";

export async function uploadToVercelBlob(file: File, folder: string): Promise<UploadResult> {
  try {
    const extension = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${folder}/${timestamp}-${random}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return {
      url: blob.url,
      filename,
      size: file.size,
      type: file.type,
    };
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error);
    throw new Error(`Vercel Blob upload failed: ${error.message}`);
  }
}

export async function deleteFromVercelBlob(url: string): Promise<boolean> {
  try {
    const { del } = await import("@vercel/blob");

    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return true;
  } catch (error) {
    console.error("Vercel Blob delete error:", error);
    return false;
  }
}
