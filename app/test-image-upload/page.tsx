"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UploadedImage } from "@/hooks/useImageUpload"

export default function TestImageUploadPage() {
  const [images, setImages] = useState<UploadedImage[]>([])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    console.log('Files selected:', files.length)
    
    const fileArray = Array.from(files)
    const newImages: UploadedImage[] = fileArray.map((file, index) => {
      const previewUrl = URL.createObjectURL(file)
      console.log('Created preview for:', file.name, previewUrl)
      return {
        url: '',
        preview: previewUrl,
        altText: file.name.replace(/\.[^/.]+$/, ''),
        isPrimary: images.length === 0 && index === 0,
        file,
      }
    })

    console.log('New images:', newImages)
    setImages(prev => {
      const updated = [...prev, ...newImages]
      console.log('Updated images:', updated)
      return updated
    })
  }

  const clearImages = () => {
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setImages([])
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Image Upload Test</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test image selection and preview functionality
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={clearImages} variant="outline">
                Clear All
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Selected Images ({images.length}):</h3>
              {images.length === 0 ? (
                <p className="text-gray-500">No images selected</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                        {image.preview ? (
                          <img
                            src={image.preview}
                            alt={image.altText}
                            className="w-full h-full object-cover"
                            onLoad={() => console.log('Image loaded:', image.preview)}
                            onError={(e) => console.error('Image error:', e.currentTarget.src)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Preview
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{image.altText}</p>
                      {image.isPrimary && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
