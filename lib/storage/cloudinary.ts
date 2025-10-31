import { v2 as cloudinary } from 'cloudinary'
import { UploadResult } from '../upload'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File, folder: string): Promise<UploadResult> {
  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `jewelry-ecommerce/${folder}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }, // Auto optimization
            { width: 1200, height: 1200, crop: 'limit' }, // Resize if larger
          ],
          public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    }) as any

    return {
      url: result.secure_url,
      filename: result.public_id,
      size: result.bytes,
      type: file.type
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Upload failed: ${error}`)
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

// Environment variables needed:
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=your_api_key
// CLOUDINARY_API_SECRET=your_api_secret