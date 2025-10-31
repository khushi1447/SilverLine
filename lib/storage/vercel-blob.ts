import { put, del } from '@vercel/blob'
import { UploadResult } from '../upload'

export async function uploadToVercelBlob(file: File, folder: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`

    // Upload to Vercel Blob using the token directly
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_RYvcQp6FMT1XQpxN_PKi3fRozRw6JZvkRg1d9OJ0aVONPjZ"
    })

    return {
      url: blob.url,
      filename,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('Vercel Blob upload error:', error)
    throw new Error(`Upload failed: ${error}`)
  }
}

export async function deleteFromVercelBlob(url: string): Promise<boolean> {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_RYvcQp6FMT1XQpxN_PKi3fRozRw6JZvkRg1d9OJ0aVONPjZ"
    })
    return true
  } catch (error) {
    console.error('Vercel Blob delete error:', error)
    return false
  }
}

// Environment variables needed:
// BLOB_READ_WRITE_TOKEN=your_vercel_blob_token