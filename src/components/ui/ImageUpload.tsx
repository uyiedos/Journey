'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Progress } from './progress'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { imageService, ImageUpload as ImageUploadType } from '@/services/imageService'
import { useAuth } from '@/contexts/SupabaseAuthContext'

interface ImageUploadComponentProps {
  onImagesChange?: (images: ImageUploadType[]) => void
  maxImages?: number
  maxFileSize?: number
  acceptedTypes?: string[]
  className?: string
}

interface UploadedImage {
  file: File
  preview: string
  alt_text?: string
  uploading?: boolean
  progress?: number
  error?: string
}

export function ImageUpload({
  onImagesChange,
  maxImages = 5,
  maxFileSize = 1 * 1024 * 1024, // 1MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}: ImageUploadComponentProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [completedImages, setCompletedImages] = useState<ImageUploadType[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || !user) return

    const newImages: UploadedImage[] = []
    
    for (let i = 0; i < files.length && uploadedImages.length + newImages.length < maxImages; i++) {
      const file = files[i]
      
      // Validate file
      if (file.size > maxFileSize) {
        newImages.push({
          file,
          preview: '',
          error: `File size must be less than ${maxFileSize / 1024 / 1024}MB`
        })
        continue
      }

      if (!acceptedTypes.includes(file.type)) {
        newImages.push({
          file,
          preview: '',
          error: `File type must be: ${acceptedTypes.join(', ')}`
        })
        continue
      }

      // Create preview
      const preview = await imageService.createPreview(file)
      
      newImages.push({
        file,
        preview,
        uploading: true,
        progress: 0
      })
    }

    setUploadedImages(prev => [...prev, ...newImages])
  }, [user, uploadedImages.length, maxImages, maxFileSize, acceptedTypes])

  const uploadImage = async (image: UploadedImage, index: number) => {
    if (!user) return

    try {
      // Compress image if needed
      const compressedFile = await imageService.compressImage(image.file)
      
      // Update progress
      setUploadedImages(prev => 
        prev.map((img, i) => 
          i === index ? { ...img, progress: 50 } : img
        )
      )

      // Upload to Supabase
      const uploadedImage = await imageService.uploadImage(
        compressedFile, 
        user.id, 
        image.alt_text
      )

      // Mark as complete
      setUploadedImages(prev => 
        prev.map((img, i) => 
          i === index ? { ...img, uploading: false, progress: 100 } : img
        )
      )

      // Add to completed images
      setCompletedImages(prev => [...prev, uploadedImage])
      onImagesChange?.([...completedImages, uploadedImage])

    } catch (error) {
      setUploadedImages(prev => 
        prev.map((img, i) => 
          i === index ? { ...img, uploading: false, error: 'Upload failed' } : img
        )
      )
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const updateAltText = (index: number, altText: string) => {
    setUploadedImages(prev => 
      prev.map((img, i) => 
        i === index ? { ...img, alt_text: altText } : img
      )
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  // Auto-upload images when they are added
  React.useEffect(() => {
    uploadedImages.forEach((image, index) => {
      if (image.uploading && image.progress === 0) {
        uploadImage(image, index)
      }
    })
  }, [uploadedImages])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {uploadedImages.length < maxImages && (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload Images
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Max {maxFileSize / 1024 / 1024}MB per file • {acceptedTypes.join(', ')}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!user}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Images
              </Button>
              {!user && (
                <p className="text-xs text-gray-500 mt-2">
                  Please log in to upload images
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploadedImages.map((image, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative">
              {image.preview && (
                <img
                  src={image.preview}
                  alt={image.alt_text || ''}
                  className="w-full h-48 object-cover"
                />
              )}
              
              {/* Upload overlay */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Uploading...</p>
                    {image.progress && (
                      <Progress value={image.progress} className="w-32 mt-2" />
                    )}
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {image.error && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                  <div className="text-white text-center p-2">
                    <p className="text-sm">{image.error}</p>
                  </div>
                </div>
              )}

              {/* Remove button */}
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Alt text input */}
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label htmlFor={`alt-text-${index}`}>Alt Text (Optional)</Label>
                <Textarea
                  id={`alt-text-${index}`}
                  placeholder="Describe this image for accessibility..."
                  value={image.alt_text || ''}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  disabled={image.uploading}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Progress Summary */}
      {uploadedImages.length > 0 && (
        <div className="text-sm text-gray-500">
          {uploadedImages.filter(img => img.uploading).length} uploading, 
          {completedImages.length} completed, 
          {uploadedImages.filter(img => img.error).length} failed
        </div>
      )}
    </div>
  )
}
