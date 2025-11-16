import { UploadResult } from '../upload'

export async function uploadToVercelBlob(file: File, folder: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      throw new Error("Missing BLOB_READ_WRITE_TOKEN")
    }

    // Upload directly to Vercel Blob
    const response = await fetch(`https://blob.vercel-storage.com/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${blobToken}`,
        "x-vercel-filename": filename
      },
      body: file
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Upload failed: ${response.status} ${errText}`)
    }

    const json = await response.json()

    return {
      url: json.url,
      filename,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error("Vercel Blob upload error:", error)
    throw new Error(`Upload failed: ${error}`)
  }
}

export async function deleteFromVercelBlob(url: string): Promise<boolean> {
  try {
    const blobId = url.split("/").pop()
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!blobToken || !blobId) return false

    const response = await fetch(`https://blob.vercel-storage.com/${blobId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${blobToken}`
      }
    })

    return response.ok
  } catch (error) {
    console.error("Vercel Blob delete error:", error)
    return false
  }
}
