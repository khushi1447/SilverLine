import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface UploadedImage {
  url: string
  altText?: string
  isPrimary: boolean
  file?: File
  preview?: string
}

export interface UseImageUploadReturn {
  images: UploadedImage[]
  uploading: boolean
  uploadProgress: number
  addImages: (files: FileList) => void
  removeImage: (index: number) => void
  reorderImages: (startIndex: number, endIndex: number) => void
  setPrimaryImage: (index: number) => void
  updateAltText: (index: number, altText: string) => void
  uploadImages: () => Promise<UploadedImage[]>
  resetImages: () => void
}

const MAX_IMAGES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function useImageUpload(): UseImageUploadReturn {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type ${file.type} not allowed. Use JPG, PNG, or WebP.`
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }

    return null
  }

  const addImages = (files: FileList) => {
    const fileArray = Array.from(files)

    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`,
        variant: "destructive",
      })
      return
    }

    const validFiles: File[] = []
    const errors: string[] = []

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    // Show validation errors if any
    if (errors.length > 0) {
      toast({
        title: "File validation errors",
        description: errors.join(', '),
        variant: "destructive",
      })
    }

    // Add valid files
    if (validFiles.length > 0) {
      const newImages: UploadedImage[] = validFiles.map((file, index) => ({
        url: '', // Will be set after upload
        preview: URL.createObjectURL(file),
        altText: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        isPrimary: images.length === 0 && index === 0, // First image is primary if no images exist
        file,
      }))

      setImages(prev => [...prev, ...newImages])

      toast({
        title: "Images added",
        description: `${validFiles.length} image(s) added successfully.`,
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)

      // If we removed the primary image and there are still images, make the first one primary
      if (prev[index]?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true
        // Clear primary flag from others
        newImages.slice(1).forEach(img => img.isPrimary = false)
      }

      // Cleanup preview URL
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview!)
      }

      return newImages
    })
  }

  const reorderImages = (startIndex: number, endIndex: number) => {
    setImages(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }

  const setPrimaryImage = (index: number) => {
    setImages(prev =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    )
  }

  const updateAltText = (index: number, altText: string) => {
    setImages(prev =>
      prev.map((img, i) =>
        i === index ? { ...img, altText } : img
      )
    )
  }

  const uploadImages = async (): Promise<UploadedImage[]> => {
    if (images.length === 0) return []

    setUploading(true)
    setUploadProgress(0)

    try {
      const filesToUpload = images.filter(img => img.file && !img.url)

      if (filesToUpload.length === 0) {
        // All images already uploaded
        return images
      }

      const formData = new FormData()
      filesToUpload.forEach(img => {
        if (img.file) {
          formData.append('images', img.file)
        }
      })

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { images: uploadedImages } = await response.json()

      // Update images with uploaded URLs
      let uploadIndex = 0
      const updatedImages = images.map(img => {
        if (img.file && !img.url) {
          const uploadedImage = uploadedImages[uploadIndex]
          uploadIndex++
          return {
            ...img,
            url: uploadedImage.url,
            file: undefined, // Remove file reference after upload
          }
        }
        return img
      })

      setImages(updatedImages)
      setUploadProgress(100)

      toast({
        title: "Images uploaded",
        description: `${uploadedImages.length} image(s) uploaded successfully.`,
      })

      return updatedImages
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      })
      throw error
    } finally {
      setUploading(false)
    }
  }

  const resetImages = () => {
    // Cleanup preview URLs
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })

    setImages([])
    setUploadProgress(0)
  }

  return {
    images,
    uploading,
    uploadProgress,
    addImages,
    removeImage,
    reorderImages,
    setPrimaryImage,
    updateAltText,
    uploadImages,
    resetImages,
  }
}