"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"
import type { UploadedImage } from "@/hooks/useImageUpload"

export default function TestUploadPage() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setImages(newImages)
  }

  const testUpload = async () => {
    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please add some images first",
        variant: "destructive",
      })
      return
    }

    setTesting(true)

    try {
      // Test uploading images
      const formData = new FormData()
      images.forEach(image => {
        if (image.file) {
          formData.append('images', image.file)
        }
      })

      const response = await fetch('/api/upload/debug', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()

      toast({
        title: "Upload successful!",
        description: `Uploaded ${result.results.length} images using ${result.storage_provider} storage`,
      })

      console.log('Upload results:', result)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 File Upload System Test</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test the image upload system. Current storage: <strong>{process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local'}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={images}
              onChange={handleImagesChange}
              maxImages={5}
              minImages={1}
              required
            />

            <div className="flex gap-2">
              <Button
                onClick={testUpload}
                disabled={testing || images.length === 0}
                className="flex-1"
              >
                {testing ? "Testing Upload..." : "Test Upload System"}
              </Button>
            </div>

            {images.length > 0 && (
              <div className="text-sm text-gray-600">
                Ready to upload {images.length} image{images.length !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 System Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>Storage Provider:</div>
              <div className="font-mono">local (development)</div>

              <div>Upload Directory:</div>
              <div className="font-mono">public/uploads/</div>

              <div>Max File Size:</div>
              <div className="font-mono">5MB per image</div>

              <div>Supported Formats:</div>
              <div className="font-mono">JPG, PNG, WebP</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}