import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { UploadResult } from '../upload'

// Use environment variables for production setup
const UPLOAD_DIR = process.env.UPLOAD_BASE_PATH || path.join(process.cwd(), 'public', 'uploads')
const BASE_URL = process.env.UPLOAD_BASE_URL || ''

export async function uploadToLocal(file: File, folder: string): Promise<UploadResult> {
  try {
    // Ensure upload directory exists
    const folderPath = path.join(UPLOAD_DIR, folder)
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}-${randomString}.${extension}`
    const filePath = path.join(folderPath, filename)

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return public URL - use full URL if BASE_URL is configured
    const url = BASE_URL ? `${BASE_URL}/${filename}` : `/uploads/${folder}/${filename}`

    return {
      url,
      filename,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('Local upload error:', error)
    throw new Error(`Upload failed: ${error}`)
  }
}

export async function deleteFromLocal(filename: string): Promise<boolean> {
  try {
    // Handle both relative and absolute URLs
    let relativePath: string
    if (filename.startsWith('http')) {
      // Full URL - extract filename from the end
      relativePath = filename.split('/').pop() || filename
    } else {
      // Relative URL - extract path
      relativePath = filename.replace('/uploads/', '')
    }
    
    const filePath = path.join(UPLOAD_DIR, relativePath)

    await unlink(filePath)
    return true
  } catch (error) {
    console.error('Local delete error:', error)
    return false
  }
}

// Note: This is only suitable for development
// In production, use cloud storage for scalability and reliability