"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Square, Hand, Trash2, Download, Undo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BoundingBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  isActive: boolean
}

interface SegmentationResult {
  id: string
  bbox: number[]
  polygon: number[][]
  mask_base64: string
  confidence: number
  area: number
}

interface InteractiveSegmentationCanvasProps {
  imageUrl: string
  onSegmentationComplete?: (results: SegmentationResult[]) => void
  onBoundingBoxChange?: (boxes: BoundingBox[]) => void
  className?: string
}

export function InteractiveSegmentationCanvas({
  imageUrl,
  onSegmentationComplete,
  onBoundingBoxChange,
  className = "",
}: InteractiveSegmentationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // State management
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null)
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([])
  const [segmentationResults, setSegmentationResults] = useState<SegmentationResult[]>([])
  const [isSegmenting, setIsSegmenting] = useState(false)
  const [mode, setMode] = useState<"draw" | "pan">("draw")
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 })

  // Initialize canvas and image
  useEffect(() => {
    if (imageRef.current && canvasRef.current && containerRef.current) {
      const img = imageRef.current
      const canvas = canvasRef.current
      const container = containerRef.current

      const handleImageLoad = () => {
        const containerRect = container.getBoundingClientRect()
        const maxWidth = containerRect.width
        const maxHeight = containerRect.height

        // Calculate display dimensions while maintaining aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight
        let displayWidth = maxWidth
        let displayHeight = maxWidth / aspectRatio

        if (displayHeight > maxHeight) {
          displayHeight = maxHeight
          displayWidth = maxHeight * aspectRatio
        }

        // Set image dimensions
        img.style.width = `${displayWidth}px`
        img.style.height = `${displayHeight}px`

        // Set canvas dimensions to match displayed image
        canvas.width = displayWidth
        canvas.height = displayHeight
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`

        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
        setCanvasDimensions({
          width: displayWidth,
          height: displayHeight,
        })

        redrawCanvas()
      }

      if (img.complete) {
        handleImageLoad()
      } else {
        img.addEventListener("load", handleImageLoad)
        return () => img.removeEventListener("load", handleImageLoad)
      }
    }
  }, [imageUrl])

  // Convert canvas coordinates to image coordinates
  const canvasToImageCoords = useCallback(
    (canvasX: number, canvasY: number) => {
      const scaleX = imageDimensions.width / canvasDimensions.width
      const scaleY = imageDimensions.height / canvasDimensions.height
      return {
        x: Math.round(canvasX * scaleX),
        y: Math.round(canvasY * scaleY),
      }
    },
    [imageDimensions, canvasDimensions],
  )

  // Convert image coordinates to canvas coordinates
  const imageToCanvasCoords = useCallback(
    (imageX: number, imageY: number) => {
      const scaleX = canvasDimensions.width / imageDimensions.width
      const scaleY = canvasDimensions.height / imageDimensions.height
      return {
        x: imageX * scaleX,
        y: imageY * scaleY,
      }
    },
    [imageDimensions, canvasDimensions],
  )

  // Redraw canvas with all bounding boxes and segmentation results
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw segmentation masks
    segmentationResults.forEach((result) => {
      if (result.polygon && result.polygon.length > 0) {
        const canvasPolygon = result.polygon.map(([x, y]) => {
          const canvasCoords = imageToCanvasCoords(x, y)
          return [canvasCoords.x, canvasCoords.y]
        })

        // Draw filled polygon
        ctx.fillStyle = `rgba(0, 123, 255, 0.3)`
        ctx.strokeStyle = `rgba(0, 123, 255, 0.8)`
        ctx.lineWidth = 2

        ctx.beginPath()
        canvasPolygon.forEach(([x, y], index) => {
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    })

    // Draw bounding boxes
    boundingBoxes.forEach((box) => {
      ctx.strokeStyle = box.isActive ? "#ff6b35" : "#007bff"
      ctx.lineWidth = box.isActive ? 3 : 2
      ctx.setLineDash(box.isActive ? [] : [5, 5])
      ctx.strokeRect(box.x, box.y, box.width, box.height)

      // Draw corner handles for active box
      if (box.isActive) {
        ctx.fillStyle = "#ff6b35"
        const handleSize = 6
        const corners = [
          [box.x, box.y],
          [box.x + box.width, box.y],
          [box.x + box.width, box.y + box.height],
          [box.x, box.y + box.height],
        ]
        corners.forEach(([x, y]) => {
          ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
        })
      }
    })

    // Draw current box being drawn
    if (currentBox) {
      ctx.strokeStyle = "#ff6b35"
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height)
    }
  }, [boundingBoxes, currentBox, segmentationResults, imageToCanvasCoords])

  // Redraw when dependencies change
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (mode !== "draw") return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setIsDrawing(true)
      setCurrentBox({
        id: `box_${Date.now()}`,
        x,
        y,
        width: 0,
        height: 0,
        isActive: true,
      })
    },
    [mode],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentBox) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const currentX = event.clientX - rect.left
      const currentY = event.clientY - rect.top

      setCurrentBox({
        ...currentBox,
        width: currentX - currentBox.x,
        height: currentY - currentBox.y,
      })
    },
    [isDrawing, currentBox],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentBox) return

    // Only add box if it has meaningful size
    if (Math.abs(currentBox.width) > 10 && Math.abs(currentBox.height) > 10) {
      // Normalize the box (handle negative width/height)
      const normalizedBox = {
        ...currentBox,
        x: currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
        y: currentBox.height < 0 ? currentBox.y + currentBox.height : currentBox.y,
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
      }

      setBoundingBoxes((prev) => [...prev, normalizedBox])

      // Trigger segmentation for this box
      performSegmentation(normalizedBox)
    }

    setIsDrawing(false)
    setCurrentBox(null)
  }, [isDrawing, currentBox])

  // Perform segmentation for a bounding box
  const performSegmentation = async (box: BoundingBox) => {
    setIsSegmenting(true)

    try {
      // Convert canvas coordinates to image coordinates
      const imageCoords = canvasToImageCoords(box.x, box.y)
      const imageSize = canvasToImageCoords(box.width, box.height)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/segment-bbox`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          bbox: [imageCoords.x, imageCoords.y, imageSize.x, imageSize.y],
          box_id: box.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Segmentation failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.segments) {
        const newSegments: SegmentationResult[] = result.segments.map((segment: any) => ({
          id: `${box.id}_${segment.id}`,
          bbox: segment.bbox,
          polygon: segment.polygon,
          mask_base64: segment.mask_base64,
          confidence: segment.confidence,
          area: segment.area,
        }))

        setSegmentationResults((prev) => [...prev, ...newSegments])

        if (onSegmentationComplete) {
          onSegmentationComplete(newSegments)
        }

        toast({
          title: "Segmentation Complete",
          description: `Found ${newSegments.length} segments in the selected area`,
        })
      }
    } catch (error) {
      console.error("Segmentation error:", error)
      toast({
        title: "Segmentation Failed",
        description: "Could not segment the selected area. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSegmenting(false)
    }
  }

  // Clear all boxes and results
  const clearAll = () => {
    setBoundingBoxes([])
    setSegmentationResults([])
    setCurrentBox(null)
    if (onBoundingBoxChange) {
      onBoundingBoxChange([])
    }
  }

  // Undo last box
  const undoLast = () => {
    setBoundingBoxes((prev) => {
      const newBoxes = prev.slice(0, -1)
      if (onBoundingBoxChange) {
        onBoundingBoxChange(newBoxes)
      }
      return newBoxes
    })
    // Also remove corresponding segmentation results
    setSegmentationResults((prev) => {
      const lastBoxId = boundingBoxes[boundingBoxes.length - 1]?.id
      return prev.filter((result) => !result.id.startsWith(lastBoxId))
    })
  }

  // Export segmentation results
  const exportResults = () => {
    const dataStr = JSON.stringify(segmentationResults, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "segmentation_results.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Button
            variant={mode === "draw" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("draw")}
            disabled={isSegmenting}
          >
            <Square className="h-4 w-4 mr-2" />
            Draw Box
          </Button>
          <Button
            variant={mode === "pan" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("pan")}
            disabled={isSegmenting}
          >
            <Hand className="h-4 w-4 mr-2" />
            Pan
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={undoLast} disabled={boundingBoxes.length === 0 || isSegmenting}>
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={boundingBoxes.length === 0 || isSegmenting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportResults}
            disabled={segmentationResults.length === 0 || isSegmenting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Status */}
        <div className="mb-4 text-sm text-muted-foreground">
          {isSegmenting && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Segmenting selected area...
            </div>
          )}
          {!isSegmenting && (
            <div>
              Boxes: {boundingBoxes.length} | Segments: {segmentationResults.length} | Mode: {mode}
            </div>
          )}
        </div>

        {/* Canvas Container */}
        <div ref={containerRef} className="relative w-full h-96 border rounded-lg overflow-hidden bg-gray-100">
          <img
            ref={imageRef}
            src={imageUrl || "/placeholder.svg"}
            alt="Segmentation target"
            className="absolute top-0 left-0 object-contain pointer-events-none"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 ${mode === "draw" ? "cursor-crosshair" : "cursor-grab"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Instructions */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Instructions:</strong> Click and drag to draw a bounding box around the area you want to segment.
            The system will automatically detect and segment objects within the box.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
