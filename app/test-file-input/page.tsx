"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestFileInputPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files)
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      console.log('Files selected:', fileArray)
      setSelectedFiles(fileArray)
    }
  }

  const handleClick = () => {
    console.log('Button clicked, triggering file input')
    fileInputRef.current?.click()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">File Input Test</h1>
        
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
            className="hidden"
          />
          
          <div>
            <h3 className="font-semibold mb-2">Selected Files:</h3>
            {selectedFiles.length === 0 ? (
              <p className="text-gray-500">No files selected</p>
            ) : (
              <ul className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-sm">
                    {file.name} ({file.size} bytes, {file.type})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
