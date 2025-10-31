"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSimpleUploadPage() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('images', file)

      console.log('Uploading file:', file.name, file.size, file.type)

      const response = await fetch('/api/upload/debug', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
      console.log('Upload result:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Simple Upload Test</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test basic image upload functionality
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="text-sm text-green-700 mt-2">
                  <p>Uploaded {result.images?.length || 0} image(s)</p>
                  {result.images?.map((img: any, index: number) => (
                    <div key={index} className="mt-2">
                      <p><strong>Image {index + 1}:</strong></p>
                      <p>URL: <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{img.url}</a></p>
                      <p>Filename: {img.filename}</p>
                      <p>Size: {img.size} bytes</p>
                      <p>Type: {img.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Select an image file (JPG, PNG, WebP)</li>
                <li>File will be uploaded to /api/upload/debug</li>
                <li>Check the console for detailed logs</li>
                <li>Verify the uploaded image URL works</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
