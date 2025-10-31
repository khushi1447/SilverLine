import { NextRequest, NextResponse } from "next/server"
import { handleImageUpload } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    console.log("Image upload request received")
    
    const uploadResults = await handleImageUpload(request)
    
    console.log("Upload successful:", uploadResults)

    return NextResponse.json({
      message: "Images uploaded successfully",
      images: uploadResults
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed"
      },
      { status: 400 }
    )
  }
}