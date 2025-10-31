import { UploadResult } from '../upload'

export async function uploadToVercelBlob(file: File, folder: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`

    // Create FormData for Vercel Blob API
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)

    // Upload to Vercel Blob using fetch
    const response = await fetch('https://api.vercel.com/v1/blob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_RYvcQp6FMT1XQpxN_PKi3fRozRw6JZvkRg1d9OJ0aVONPjZ"}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Vercel Blob upload failed: ${response.statusText}`)
    }

    const result = await response.json()

    return {
      url: result.url,
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
    // Extract blob ID from URL
    const urlParts = url.split('/')
    const blobId = urlParts[urlParts.length - 1]

    const response = await fetch(`https://api.vercel.com/v1/blob/${blobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_RYvcQp6FMT1XQpxN_PKi3fRozRw6JZvkRg1d9OJ0aVONPjZ"}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Vercel Blob delete error:', error)
    return false
  }
}
