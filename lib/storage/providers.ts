/**
 * Storage Provider Configuration
 * Centralized configuration for different storage providers
 */

import path from 'path'
import { UploadResult } from '../upload'
import { uploadToLocal, deleteFromLocal } from './local'
import { uploadToVercelBlob, deleteFromVercelBlob } from './vercel-blob-simple'
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary'
import { uploadToS3, deleteFromS3 } from './aws-s3'

export interface StorageProvider {
  upload: (file: File, folder: string) => Promise<UploadResult>
  delete: (url: string) => Promise<boolean>
  name: string
}

// Storage provider configurations
export const storageProviders: Record<string, StorageProvider> = {
  local: {
    name: 'Local Storage',
    upload: async (file: File, folder: string) => {
      return uploadToLocal(file, folder)
    },
    delete: async (url: string) => {
      return deleteFromLocal(url)
    }
  },
  
  'vercel-blob': {
    name: 'Vercel Blob',
    upload: async (file: File, folder: string) => {
      return uploadToVercelBlob(file, folder)
    },
    delete: async (url: string) => {
      return deleteFromVercelBlob(url)
    }
  },
  
  cloudinary: {
    name: 'Cloudinary',
    upload: async (file: File, folder: string) => {
      return uploadToCloudinary(file, folder)
    },
    delete: async (url: string) => {
      return deleteFromCloudinary(url)
    }
  },
  
  s3: {
    name: 'AWS S3',
    upload: async (file: File, folder: string) => {
      return uploadToS3(file, folder)
    },
    delete: async (url: string) => {
      return deleteFromS3(url)
    }
  }
}

// Get the configured storage provider
export function getStorageProvider(): StorageProvider {
  const providerName = process.env.STORAGE_PROVIDER || 'local'
  const provider = storageProviders[providerName]
  
  if (!provider) {
    console.warn(`Unknown storage provider: ${providerName}. Falling back to local storage.`)
    return storageProviders.local
  }
  
  return provider
}

// Validate storage provider configuration
export function validateStorageConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const provider = process.env.STORAGE_PROVIDER || 'local'
  
  switch (provider) {
    case 'local':
      if (!process.env.UPLOAD_BASE_PATH) {
        errors.push('UPLOAD_BASE_PATH is required for local storage')
      }
      if (!process.env.UPLOAD_BASE_URL) {
        errors.push('UPLOAD_BASE_URL is required for local storage')
      }
      break
      
    case 'vercel-blob':
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        errors.push('BLOB_READ_WRITE_TOKEN is required for Vercel Blob storage')
      }
      break
      
    case 'cloudinary':
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        errors.push('CLOUDINARY_CLOUD_NAME is required for Cloudinary storage')
      }
      if (!process.env.CLOUDINARY_API_KEY) {
        errors.push('CLOUDINARY_API_KEY is required for Cloudinary storage')
      }
      if (!process.env.CLOUDINARY_API_SECRET) {
        errors.push('CLOUDINARY_API_SECRET is required for Cloudinary storage')
      }
      break
      
    case 's3':
      if (!process.env.AWS_ACCESS_KEY_ID) {
        errors.push('AWS_ACCESS_KEY_ID is required for S3 storage')
      }
      if (!process.env.AWS_SECRET_ACCESS_KEY) {
        errors.push('AWS_SECRET_ACCESS_KEY is required for S3 storage')
      }
      if (!process.env.AWS_REGION) {
        errors.push('AWS_REGION is required for S3 storage')
      }
      if (!process.env.AWS_S3_BUCKET) {
        errors.push('AWS_S3_BUCKET is required for S3 storage')
      }
      break
      
    default:
      errors.push(`Unknown storage provider: ${provider}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get storage provider info for debugging
export function getStorageInfo() {
  const provider = getStorageProvider()
  const config = validateStorageConfig()
  
  return {
    provider: provider.name,
    isConfigured: config.isValid,
    errors: config.errors,
    environment: {
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
      UPLOAD_BASE_PATH: process.env.UPLOAD_BASE_PATH,
      UPLOAD_BASE_URL: process.env.UPLOAD_BASE_URL,
    }
  }
}
