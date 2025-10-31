import { NextRequest, NextResponse } from "next/server"
import { handleImageUpload } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG UPLOAD START ===")
    
    const formData = await request.formData()
    console.log("FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }
    
    const uploadResults = await handleImageUpload(request)
    console.log("Upload results:", uploadResults)
    
    console.log("=== DEBUG UPLOAD END ===")

    return NextResponse.json({
      message: "Debug upload successful",
      images: uploadResults,
      debug: {
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : typeof value,
          name: value instanceof File ? value.name : undefined,
          size: value instanceof File ? value.size : undefined,
          mimeType: value instanceof File ? value.type : undefined
        }))
      }
    })
  } catch (error) {
    console.error("Debug upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Debug upload failed",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 400 }
    )
  }
}
