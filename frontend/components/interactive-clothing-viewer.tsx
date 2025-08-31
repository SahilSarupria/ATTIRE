"use client"

import type React from "react"
import { Maximize } from "lucide-react"

import { useEffect, useRef, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ClothingItem {
  id: string
  category?: string
  name?: string
  confidence?: number
  bbox?: number[]
  polygon: [number, number][]
  price?: number
  mask_base64?: string
  type?: string
  fabric?: string
  color?: string
  coordinates?: { x: number; y: number; width: number; height: number }
  // Enhanced analysis properties from high-quality segmentation
  analysis?: {
    area_pixels: number
    coverage_percent: number
    dimensions: {
      width: number
      height: number
      aspect_ratio: number
    }
    bounding_box: {
      x: number
      y: number
      width: number
      height: number
    }
    color: {
      rgb: [number, number, number]
      hex: string
      name: string
      category?: string
      uniformity?: number
    }
    clothing_type: string
    position: {
      center_x: number
      center_y: number
      relative_position: string
    }
    edge_quality?: number
    perimeter_smoothness?: number
  }
}

interface InteractiveClothingViewerProps {
  imageUrl: string
  detectedItems: ClothingItem[]
  onItemClick?: (item: ClothingItem) => void
  onAddToCart?: (item: ClothingItem) => void
  onAddToWishlist?: (item: ClothingItem) => void
  triggerRedraw?: number
  renderMode?: "svg" | "canvas"
}

export function InteractiveClothingViewer({
  imageUrl,
  detectedItems,
  onItemClick,
  onAddToCart,
  onAddToWishlist,
  triggerRedraw,
  renderMode = "canvas", // Changed from "svg" to "canvas"
}: InteractiveClothingViewerProps) {
  const [hoveredItem, setHoveredItem] = useState<ClothingItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showImageModal, setShowImageModal] = useState(false)

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // High-precision point-in-polygon test
  const isPointInPolygon = useCallback((point: [number, number], polygon: [number, number][]): boolean => {
    if (polygon.length < 3) return false

    const [x, y] = point
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]
      const [xj, yj] = polygon[j]

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }

    return inside
  }, [])

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowImageModal(false)
    }
  }

  if (showImageModal) {
    document.addEventListener("keydown", handleKeyDown)
  }

  return () => {
    document.removeEventListener("keydown", handleKeyDown)
  }
}, [showImageModal])


  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || !detectedItems.length) return

      const rect = imageRef.current.getBoundingClientRect()
      const scaleX = imageDimensions.width / rect.width
      const scaleY = imageDimensions.height / rect.height

      const x = (event.clientX - rect.left) * scaleX
      const y = (event.clientY - rect.top) * scaleY

      setMousePosition({ x: event.clientX, y: event.clientY })

      // Check which item is being hovered with high precision
      const hoveredItem = detectedItems.find(
        (item) => Array.isArray(item.polygon) && isPointInPolygon([x, y], item.polygon)
      )


      setHoveredItem(hoveredItem || null)
    },
    [detectedItems, imageDimensions, isPointInPolygon],
  )

  const handleItemClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || !detectedItems.length) return

      const rect = imageRef.current.getBoundingClientRect()
      const scaleX = imageDimensions.width / rect.width
      const scaleY = imageDimensions.height / rect.height

      const x = (event.clientX - rect.left) * scaleX
      const y = (event.clientY - rect.top) * scaleY

      const clickedItem = detectedItems.find(
  (item) => Array.isArray(item.polygon) && isPointInPolygon([x, y], item.polygon)
)


      if (clickedItem) {
        setSelectedItem(clickedItem)
        onItemClick?.(clickedItem)

        // Enhanced toast with more details
        const itemName = clickedItem.analysis?.clothing_type || clickedItem.name || `Item ${clickedItem.id}`
        const price = clickedItem.price ? `$${clickedItem.price}` : "Price not available"

        toast({
          title: "Item Selected",
          description: `${itemName} - ${price}`,
        })
      } else {
        setSelectedItem(null)
      }
    },
    [detectedItems, imageDimensions, isPointInPolygon, onItemClick, toast],
  )

  // High-quality SVG rendering
  const renderSVGOverlay = useCallback(() => {
    if (!detectedItems.length || !imageDimensions.width || !imageDimensions.height) return null

    const { width, height } = imageDimensions

    return (
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ mixBlendMode: "normal" }}
      >
        {/* Render hovered item with high-quality orange border */}
        {hoveredItem && Array.isArray(hoveredItem.polygon) && (
          <g>
            {/* Fill with subtle transparency */}
            <polygon
              points={hoveredItem.polygon.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="rgba(255, 102, 0, 0.15)"
              stroke="none"
            />
            {/* High-quality stroke */}
            <polygon
              points={hoveredItem.polygon.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="none"
              stroke="#ff6600"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Render selected item with blue border */}
        {selectedItem && selectedItem !== hoveredItem && Array.isArray(selectedItem.polygon) && (
          <g>
            <polygon
              points={selectedItem.polygon.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="rgba(0, 102, 255, 0.1)"
              stroke="none"
            />
            <polygon
              points={selectedItem.polygon.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="none"
              stroke="#0066ff"
              strokeWidth="2"
              strokeDasharray="8,4"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Render all other items with subtle borders */}
        {detectedItems
  .filter((item) => item !== hoveredItem && item !== selectedItem && Array.isArray(item.polygon))
  .map((item) => (
            <polygon
              key={item.id}
              points={item.polygon.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="rgba(59, 130, 246, 0.05)"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              strokeDasharray="4,2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </svg>
    )
  }, [hoveredItem, selectedItem, detectedItems, imageDimensions])

  // High-quality Canvas rendering (alternative)
  const renderCanvasOverlay = useCallback(() => {
  if (!detectedItems.length || !canvasRef.current || !imageRef.current) return

  const canvas = canvasRef.current
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const img = imageRef.current
  const rect = img.getBoundingClientRect()

  // Set canvas size to match displayed image
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  // Scale context for high DPI
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const scaleX = rect.width / imageDimensions.width
  const scaleY = rect.height / imageDimensions.height

  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height)

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  // 🔍 Warn about any malformed polygons
  const brokenItems = detectedItems.filter(item => !Array.isArray(item.polygon))
  if (brokenItems.length > 0) {
    console.warn("🚨 Detected items with invalid polygon data:", brokenItems)
  }

  // Draw all non-hovered/selected items
  detectedItems
    .filter((item) => item !== hoveredItem && item !== selectedItem && Array.isArray(item.polygon))
    .forEach((item) => {
      const scaledPolygon = item.polygon.map(([x, y]) => [x * scaleX, y * scaleY])

      ctx.fillStyle = "rgba(59, 130, 246, 0.05)"
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 2])

      ctx.beginPath()
      scaledPolygon.forEach(([x, y], index) => {
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })

  // Draw selected item
  if (selectedItem && selectedItem !== hoveredItem && Array.isArray(selectedItem.polygon)) {
    const scaledPolygon = selectedItem.polygon.map(([x, y]) => [x * scaleX, y * scaleY])

    ctx.fillStyle = "rgba(0, 102, 255, 0.1)"
    ctx.beginPath()
    scaledPolygon.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = "#0066ff"
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.stroke()
  }

  // Draw hovered item
  if (hoveredItem && Array.isArray(hoveredItem.polygon)) {
    const scaledPolygon = hoveredItem.polygon.map(([x, y]) => [x * scaleX, y * scaleY])

    ctx.fillStyle = "rgba(255, 102, 0, 0.15)"
    ctx.beginPath()
    scaledPolygon.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = "#ff6600"
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.stroke()
  }
}, [hoveredItem, selectedItem, detectedItems, imageDimensions])

useEffect(() => {
  const observer = new ResizeObserver(() => {
    if (renderMode === "canvas") {
      renderCanvasOverlay()
    }
  })

  if (imageRef.current) {
    observer.observe(imageRef.current)
  }

  return () => observer.disconnect()
}, [renderCanvasOverlay, renderMode])


  // Update canvas when items change
  useEffect(() => {
    if (renderMode === "canvas") {
      renderCanvasOverlay()
    }
  }, [hoveredItem, selectedItem, detectedItems, renderMode, renderCanvasOverlay, triggerRedraw])

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      })
    }
  }, [])

  // Enhanced tooltip component
  const renderTooltip = () => {
  if (!hoveredItem) return null

  const itemName = hoveredItem.analysis?.clothing_type || hoveredItem.name || `Item ${hoveredItem.id}`
  const containerRect = containerRef.current?.getBoundingClientRect()
  const color = hoveredItem.analysis?.color || { name: "Unknown", hex: "#000000" }
  const coverage = hoveredItem.analysis?.coverage_percent || 0
  const confidence = hoveredItem.confidence || (hoveredItem.analysis ? 0.9 : 0.8)
  const edgeQuality = hoveredItem.analysis?.edge_quality || 0
  const price = hoveredItem.price ? `$${hoveredItem.price}` : null

  const tooltipWidth = 220
const tooltipHeight = 110

if (!containerRef.current || !containerRect) return null

const scrollTop = containerRef.current.scrollTop
const scrollLeft = containerRef.current.scrollLeft

const containerTop = containerRect.top
const containerLeft = containerRect.left
const containerHeight = containerRef.current.clientHeight
const containerWidth = containerRef.current.clientWidth

// Compute position inside container
const relativeY = mousePosition.y - containerTop + scrollTop
const relativeX = mousePosition.x - containerLeft + scrollLeft

// Safe area
const maxTop = containerHeight - tooltipHeight - 12
const minTop = 12

const preferredTop = relativeY - tooltipHeight - 12
const fallbackTop = relativeY + 12

const top = preferredTop > minTop ? preferredTop : Math.min(fallbackTop, maxTop)

const left = Math.max(
  12,
  Math.min(relativeX - tooltipWidth / 2, containerWidth - tooltipWidth - 12)
)


  return (
    <div
      className="absolute bg-black/90 text-white px-3 py-2 rounded-md text-xs sm:text-sm pointer-events-none z-10 shadow-xl backdrop-blur-sm max-w-[75vw] sm:max-w-xs leading-tight"
      style={{
  top,
  left,
  width: `${tooltipWidth}px`,
  position: "absolute", // ❗ important so positioning works within viewport
}}

    >
      <div className="font-semibold text-sm mb-1">{itemName}</div>
      <div className="text-xs opacity-90 mb-1 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color.hex }}></span>
        {color.name} | {coverage.toFixed(1)}% coverage
      </div>
      <div className="text-xs opacity-75"> • Edge: ${(edgeQuality * 100).toFixed(1)}%
  <br />
  <span className="hidden lg:inline">Click for details</span>
</div>

      {price && <div className="text-xs font-semibold text-green-400 mt-1">{price}</div>}
    </div>
  )
}


  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative cursor-crosshair"
        style={{ width: "fit-content" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={handleItemClick}
      >
    <button
  onClick={() => setShowImageModal(true)}
  className="absolute top-2 right-2 z-20 p-1 rounded-md bg-black/60 text-white hover:bg-black/80 transition"
  title="View Fullscreen"
>
  <Maximize className="w-4 h-4" />
</button>



        <img
          ref={imageRef}
          src={imageUrl || "/placeholder.svg"}
          alt="Interactive clothing design"
          className="pointer-events-none select-none max-w-full h-auto"
          style={{ imageRendering: "high-quality" }}
          onLoad={handleImageLoad}
        />

        {/* High-quality overlay rendering - Canvas prioritized */}
        {imageDimensions.width > 0 && (
          <>
            {renderMode === "canvas" ? (
              <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
            ) : (
              renderSVGOverlay()
            )}
          </>
        )}

        {/* Enhanced hover tooltip */}
        {renderTooltip()}
      </div>
      {showImageModal && (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4 sm:px-0"
    onClick={() => setShowImageModal(false)} // 👈 dismiss on backdrop click
  >
    <div
      className="relative max-w-full max-h-full"
      onClick={(e) => e.stopPropagation()} // 👈 prevent inside click from closing
    >
      {/* <button
        onClick={() => setShowImageModal(false)}
        className="absolute top-2 right-2 z-50 p-2 bg-black/60 text-white rounded-md hover:bg-black"
        title="Close"
      >
        ✕
      </button> */}
      <img
        src={imageUrl}
        alt="Fullscreen Clothing Design"
        className="max-w-full max-h-[90vh] rounded shadow-lg"
      />
    </div>
  </div>
)}



    </div>
  )
}
