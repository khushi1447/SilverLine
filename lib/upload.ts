import { NextRequest } from "next/server"
import { getStorageProvider } from './storage/providers'

export interface UploadOptions {
  maxFiles?: number
  maxSizePerFile?: number // in bytes
  allowedTypes?: string[]
  folder?: string
}

export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxFiles: 10,
  maxSizePerFile: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  folder: 'products'
}

// Get the configured storage provider
const storageProvider = getStorageProvider()

async function uploadSingleFile(file: File, folder: string): Promise<UploadResult> {
  return storageProvider.upload(file, folder)
}

export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (files.length > (opts.maxFiles || 10)) {
    throw new Error(`Maximum ${opts.maxFiles} files allowed`)
  }

  const uploadPromises = files.map(async (file) => {
    // Validate file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`)
    }

    // Validate file size
    if (opts.maxSizePerFile && file.size > opts.maxSizePerFile) {
      throw new Error(`File size ${file.size} bytes exceeds maximum ${opts.maxSizePerFile} bytes`)
    }

    // Upload using configured provider
    return uploadSingleFile(file, opts.folder || 'products')
  })

  return Promise.all(uploadPromises)
}

export async function deleteFile(url: string): Promise<boolean> {
  try {
    return storageProvider.delete(url)
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

export function getFileFromFormData(formData: FormData, fieldName: string): File[] {
  const files: File[] = []
  const entries = formData.getAll(fieldName)

  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry)
    }
  }

  return files
}

export async function handleImageUpload(request: NextRequest): Promise<UploadResult[]> {
  try {
    const formData = await request.formData()
    const files = getFileFromFormData(formData, 'images')

    if (files.length === 0) {
      throw new Error('No files provided')
    }

    const uploadResults = await uploadFiles(files, {
      maxFiles: 10,
      maxSizePerFile: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      folder: 'products'
    })

    return uploadResults
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}