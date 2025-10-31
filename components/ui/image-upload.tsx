"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X, Star, StarOff, GripVertical, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { type UploadedImage } from "@/hooks/useImageUpload"

interface ImageUploadProps {
  value?: UploadedImage[]
  onChange?: (images: UploadedImage[]) => void
  maxImages?: number
  className?: string
  required?: boolean
  minImages?: number
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  className,
  required = false,
  minImages = 1,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const displayImages = value
  console.log('ImageUpload render - displayImages:', displayImages.length, displayImages)

  const validateFile = (file: File): string | null => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type ${file.type} not allowed. Use JPG, PNG, or WebP.`
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }

    return null
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered', event.target.files)
    const files = event.target.files
    if (!files) {
      console.log('No files selected')
      return
    }
    if (!onChange) {
      console.log('No onChange handler provided')
      return
    }

    const fileArray = Array.from(files)
    console.log('Files to process:', fileArray.length)

    // Check if adding these files would exceed the limit
    if (displayImages.length + fileArray.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed. You can add ${maxImages - displayImages.length} more.`,
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
      console.log('Processing valid files:', validFiles.length)
      const newImages: UploadedImage[] = validFiles.map((file, index) => {
        const previewUrl = URL.createObjectURL(file)
        console.log('Created preview URL for file:', file.name, previewUrl)
        return {
          url: '', // Will be set after upload
          preview: previewUrl,
          altText: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          isPrimary: displayImages.length === 0 && index === 0, // First image is primary if no images exist
          file,
        }
      })

      console.log('New images created:', newImages)
      const updatedImages = [...displayImages, ...newImages]
      console.log('Updated images array:', updatedImages)
      console.log('Calling onChange with:', updatedImages.length, 'images')
      onChange(updatedImages)

      toast({
        title: "Images added",
        description: `${validFiles.length} image(s) added successfully.`,
      })
    } else {
      console.log('No valid files to process')
    }

    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }, [displayImages, maxImages, onChange, toast])

  const handleRemoveImage = (index: number) => {
    if (!onChange) return

    const newImages = displayImages.filter((_, i) => i !== index)

    // If we removed the primary image and there are still images, make the first one primary
    if (displayImages[index]?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
      // Clear primary flag from others
      newImages.slice(1).forEach(img => img.isPrimary = false)
    }

    // Cleanup preview URL
    if (displayImages[index]?.preview) {
      URL.revokeObjectURL(displayImages[index].preview!)
    }

    onChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    if (!onChange) return

    const newImages = displayImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    onChange(newImages)
  }

  const handleAltTextChange = (index: number, altText: string) => {
    if (!onChange) return

    const newImages = displayImages.map((img, i) =>
      i === index ? { ...img, altText } : img
    )
    onChange(newImages)
  }

  const resetImages = () => {
    if (!onChange) return

    // Cleanup preview URLs
    displayImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })

    onChange([])
  }

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files && onChange) {
      // Create a synthetic event to reuse the file selection logic
      const syntheticEvent = {
        target: { files, value: '' }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(syntheticEvent)
    }
  }, [handleFileSelect, onChange])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const canAddMore = displayImages.length < maxImages
  const isMinimumMet = displayImages.length >= minImages
  
  console.log('ImageUpload state:', {
    displayImagesLength: displayImages.length,
    maxImages,
    canAddMore,
    uploading,
    isDisabled: !canAddMore || uploading
  })

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    console.log('Upload area clicked', { canAddMore, uploading, fileInputRef: fileInputRef.current })
    if (canAddMore && !uploading) {
      console.log('Triggering file input click')
      fileInputRef.current?.click()
    } else {
      console.log('Cannot add more files or currently uploading')
    }
  }, [canAddMore, uploading])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          canAddMore ? "border-gray-300" : "border-gray-200 bg-gray-50",
          !isMinimumMet && required && "border-red-300 bg-red-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={!canAddMore || uploading}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            opacity: 0, 
            cursor: 'pointer',
            zIndex: 1
          }}
        />

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              console.log('Button clicked', { canAddMore, uploading, fileInputRef: fileInputRef.current })
              e.preventDefault()
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            disabled={!canAddMore || uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {displayImages.length === 0 ? 'Choose Images' : 'Add More Images'}
          </Button>

          {required && (
            <p className="text-xs text-gray-500">
              Minimum {minImages} image{minImages !== 1 ? 's' : ''} required
              {!isMinimumMet && (
                <span className="text-red-500 ml-1">
                  ({minImages - displayImages.length} more needed)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {displayImages.map((image, index) => {
            console.log(`Rendering image ${index}:`, image)
            return (
            <Card key={index} className="relative group">
              <CardContent className="p-1.5">
                <div className="relative aspect-square mb-1.5 bg-gray-100 rounded-md overflow-hidden">
                  {image.preview || image.url ? (
                    <img
                      src={image.preview || image.url}
                      alt={image.altText || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', e.currentTarget.src)
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', image.preview || image.url)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <Badge className="absolute top-0.5 left-0.5 bg-primary text-white text-[10px] px-1 py-0">
                      1st
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSetPrimary(index)
                      }}
                      title={image.isPrimary ? "Primary image" : "Set as primary"}
                    >
                      {image.isPrimary ? (
                        <Star className="h-2.5 w-2.5 fill-current" />
                      ) : (
                        <StarOff className="h-2.5 w-2.5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemoveImage(index)
                      }}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute bottom-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical className="h-2.5 w-2.5 text-white drop-shadow" />
                  </div>
                </div>

                {/* Alt Text Input */}
                <div>
                  <Input
                    value={image.altText || ''}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    placeholder={`Alt text`}
                    className="h-6 text-[11px] px-1.5"
                    title="Alt Text (Optional)"
                  />
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Actions */}
      {displayImages.length > 0 && (
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-gray-600">
            {displayImages.length} image{displayImages.length !== 1 ? 's' : ''} added
            {required && !isMinimumMet && (
              <span className="text-red-500 ml-2">
                Need {minImages - displayImages.length} more
              </span>
            )}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetImages}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}