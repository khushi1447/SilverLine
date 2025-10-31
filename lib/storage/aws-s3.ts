import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { UploadResult } from '../upload'

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const CDN_URL = process.env.AWS_CLOUDFRONT_URL // Optional CloudFront URL

export async function uploadToS3(file: File, folder: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const key = `${folder}/${timestamp}-${randomString}.${extension}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make publicly accessible
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(command)

    // Generate public URL
    const url = CDN_URL
      ? `${CDN_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return {
      url,
      filename: key,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error(`Upload failed: ${error}`)
  }
}

export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('S3 delete error:', error)
    return false
  }
}

// Environment variables needed:
// AWS_REGION=us-east-1
// AWS_ACCESS_KEY_ID=your_access_key
// AWS_SECRET_ACCESS_KEY=your_secret_key
// AWS_S3_BUCKET_NAME=your-bucket-name
// AWS_CLOUDFRONT_URL=https://your-cdn-url.com (optional)