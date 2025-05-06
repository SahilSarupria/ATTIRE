"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string, file: File) => void
  onImageAnalysis?: (analysis: string) => void
}

export function ImageUploader({ onImageUpload, onImageAnalysis }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    // Create a preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onImageUpload(url, file)

    // If we have an analysis callback, analyze the image
    if (onImageAnalysis) {
      setIsAnalyzing(true)

      try {
        const formData = new FormData()
        formData.append("image", file)

        const response = await fetch("/api/analyze-image", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        onImageAnalysis(data.enhancedPrompt)

        toast({
          title: "Image Analyzed",
          description: "We've analyzed your reference image and created a detailed description.",
        })
      } catch (error) {
        console.error("Error analyzing image:", error)
        toast({
          title: "Analysis Failed",
          description: "There was an error analyzing your image. Please try again or use text input instead.",
          variant: "destructive",
        })
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        processFile(file)
      }
    }
  }

  const clearImage = () => {
    setPreviewUrl(null)
  }

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Reference image"
            className="w-full h-auto rounded-lg object-cover max-h-[300px]"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Analyzing image...</p>
              </div>
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={clearImage}
            disabled={isAnalyzing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            {isDragging ? (
              <ImageIcon className="h-10 w-10 text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium">
                {isDragging ? "Drop image here" : "Drag and drop your reference image"}
              </p>
              <p className="text-xs text-muted-foreground">or</p>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-primary font-medium">Browse files</span>
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Upload a reference image of clothing you'd like to use as inspiration
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
