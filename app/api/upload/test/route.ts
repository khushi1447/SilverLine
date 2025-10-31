import { NextRequest, NextResponse } from "next/server"
import { uploadFiles } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files: File[] = []

    // Extract files from form data
    const entries = formData.getAll('images')
    for (const entry of entries) {
      if (entry instanceof File && entry.size > 0) {
        files.push(entry)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    console.log(`Testing upload of ${files.length} files using ${process.env.STORAGE_PROVIDER} storage`)

    const results = await uploadFiles(files, {
      folder: 'test',
      maxFiles: 5,
      maxSizePerFile: 5 * 1024 * 1024, // 5MB
    })

    return NextResponse.json({
      message: "Files uploaded successfully",
      storage_provider: process.env.STORAGE_PROVIDER,
      results
    })
  } catch (error) {
    console.error("Test upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed"
      },
      { status: 500 }
    )
  }
}