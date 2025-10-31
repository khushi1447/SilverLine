"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBasicUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== FILE SELECT EVENT ===')
    console.log('Event:', event)
    console.log('Files:', event.target.files)
    console.log('Files length:', event.target.files?.length)
    
    const files = event.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      console.log('File array:', fileArray)
      setSelectedFiles(fileArray)
    } else {
      console.log('No files selected')
    }
  }

  const handleClick = () => {
    console.log('=== CLICK EVENT ===')
    console.log('File input ref:', fileInputRef.current)
    console.log('About to click file input')
    fileInputRef.current?.click()
    console.log('File input clicked')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Basic File Input Test</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test if basic file input works
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button onClick={handleClick}>
                Click to Select Files
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <div>
                <h3 className="font-semibold mb-2">Selected Files ({selectedFiles.length}):</h3>
                {selectedFiles.length === 0 ? (
                  <p className="text-gray-500">No files selected</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="text-sm p-2 bg-gray-100 rounded">
                        {file.name} ({file.size} bytes, {file.type})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
