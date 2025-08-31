"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, Camera, ImageIcon, X, Loader2, Sparkles, RotateCcw, Zap, Palette, Shirt } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface EnhancedImageUploaderProps {
  onImageUpload: (imageUrl: string, file: File) => void
  onImageAnalysis: (analysis: string) => void
  className?: string
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
}

interface AnalysisResult {
  description: string
  detectedItems: string[]
  colors: string[]
  style: string
  occasion: string
  confidence: number
}

export function EnhancedImageUploader({
  onImageUpload,
  onImageAnalysis,
  className = "",
  maxFileSize = 10,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
}: EnhancedImageUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Simulate image analysis (replace with actual AI service)
  const analyzeImage = useCallback(async (file: File): Promise<AnalysisResult> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis result - replace with actual AI analysis
    const mockResults: AnalysisResult[] = [
      {
        description:
          "A stylish black leather jacket with silver zippers and a modern cut, perfect for casual or semi-formal occasions",
        detectedItems: ["leather jacket", "zipper", "collar"],
        colors: ["black", "silver"],
        style: "modern casual",
        occasion: "casual, evening",
        confidence: 0.92,
      },
      {
        description:
          "A flowing summer dress with floral patterns in soft pastel colors, ideal for spring and summer occasions",
        detectedItems: ["dress", "floral pattern", "sleeves"],
        colors: ["pink", "white", "green"],
        style: "bohemian",
        occasion: "casual, daytime",
        confidence: 0.88,
      },
      {
        description: "A classic white cotton t-shirt with a relaxed fit, perfect for everyday casual wear and layering",
        detectedItems: ["t-shirt", "cotton fabric", "crew neck"],
        colors: ["white"],
        style: "minimalist",
        occasion: "casual, everyday",
        confidence: 0.95,
      },
    ]

    return mockResults[Math.floor(Math.random() * mockResults.length)]
  }, [])

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `Please upload a valid image file (${acceptedFormats.join(", ")})`,
          variant: "destructive",
        })
        return
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `Please upload an image smaller than ${maxFileSize}MB`,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 100)

        // Create object URL for preview
        const imageUrl = URL.createObjectURL(file)
        setUploadedImage(imageUrl)
        setUploadedFile(file)

        // Complete upload progress
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)

        // Call the upload callback
        onImageUpload(imageUrl, file)

        toast({
          title: "Image Uploaded",
          description: "Your reference image has been uploaded successfully!",
        })

        // Start analysis automatically
        setIsAnalyzing(true)
        try {
          const analysis = await analyzeImage(file)
          setAnalysisResult(analysis)
          onImageAnalysis(analysis.description)

          toast({
            title: "Analysis Complete",
            description: "Your image has been analyzed and converted to a prompt!",
          })
        } catch (error) {
          console.error("Analysis failed:", error)
          toast({
            title: "Analysis Failed",
            description: "Could not analyze the image, but you can still use it as reference.",
            variant: "destructive",
          })
        } finally {
          setIsAnalyzing(false)
        }
      } catch (error) {
        console.error("Upload failed:", error)
        setIsUploading(false)
        toast({
          title: "Upload Failed",
          description: "Could not upload the image. Please try again.",
          variant: "destructive",
        })
      }
    },
    [acceptedFormats, maxFileSize, onImageUpload, onImageAnalysis, analyzeImage, toast],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect],
  )

  const clearImage = useCallback(() => {
    setUploadedImage(null)
    setUploadedFile(null)
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const reanalyzeImage = useCallback(async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    try {
      const analysis = await analyzeImage(uploadedFile)
      setAnalysisResult(analysis)
      onImageAnalysis(analysis.description)

      toast({
        title: "Re-analysis Complete",
        description: "Your image has been analyzed again with updated results!",
      })
    } catch (error) {
      console.error("Re-analysis failed:", error)
      toast({
        title: "Re-analysis Failed",
        description: "Could not re-analyze the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [uploadedFile, analyzeImage, onImageAnalysis, toast])

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {!uploadedImage ? (
              <>
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats.join(",")}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />

                  <div className="space-y-4">
                    <motion.div
                      animate={{
                        scale: dragActive ? 1.1 : 1,
                        rotate: dragActive ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    </motion.div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Upload Reference Image</h3>
                      <p className="text-muted-foreground mb-4">Drag and drop an image here, or click to browse</p>

                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button variant="outline" size="sm" disabled={isUploading}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <Button variant="outline" size="sm" disabled={isUploading}>
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Supported formats: {acceptedFormats.join(", ")}</p>
                      <p>Maximum size: {maxFileSize}MB</p>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                      >
                        <div className="text-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-sm font-medium">Uploading...</p>
                          <Progress value={uploadProgress} className="w-32" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Uploaded Image Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Reference Image</h3>
                    <div className="flex items-center gap-2">
                      <Button onClick={reanalyzeImage} variant="outline" size="sm" disabled={isAnalyzing}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Re-analyze
                      </Button>
                      <Button onClick={clearImage} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Reference"
                      className="w-full h-64 object-cover"
                    />

                    {/* Analysis Overlay */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                        >
                          <div className="text-center text-white">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            >
                              <Zap className="h-8 w-8 mx-auto mb-2" />
                            </motion.div>
                            <p className="text-sm font-medium">Analyzing image...</p>
                            <p className="text-xs opacity-75">Detecting style, colors, and items</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Analysis Results */}
                <AnimatePresence>
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Analysis Results</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(analysisResult.confidence * 100)}% confidence
                        </Badge>
                      </div>

                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {/* Generated Description */}
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Shirt className="h-4 w-4" />
                                Generated Description
                              </h4>
                              <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded border">
                                {analysisResult.description}
                              </p>
                            </div>

                            {/* Detected Items */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Detected Items</h4>
                              <div className="flex flex-wrap gap-1">
                                {analysisResult.detectedItems.map((item, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Colors */}
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Detected Colors
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {analysisResult.colors.map((color, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Style & Occasion */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Style</h4>
                                <Badge variant="secondary">{analysisResult.style}</Badge>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Occasion</h4>
                                <Badge variant="secondary">{analysisResult.occasion}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Tips */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                💡 <strong>Tips for better results:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use clear, well-lit images</li>
                <li>Focus on single clothing items or complete outfits</li>
                <li>Avoid cluttered backgrounds</li>
                <li>Higher resolution images provide better analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
