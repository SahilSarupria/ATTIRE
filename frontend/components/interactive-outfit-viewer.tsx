"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface OutfitElement {
  id: string
  name: string
  price: number
  fabric: string
  color: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface InteractiveOutfitViewerProps {
  imageUrl: string
  outfitElements: OutfitElement[]
  onElementClick: (element: OutfitElement) => void
}

export function InteractiveOutfitViewer({ imageUrl, outfitElements, onElementClick }: InteractiveOutfitViewerProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  return (
    <div className="relative w-full">
      <img
        src={imageUrl || "/placeholder.svg"}
        alt="Generated outfit"
        className="w-full h-auto"
        style={{ display: "block" }}
      />

      {/* Interactive overlay elements */}
      {outfitElements.map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-pointer transition-all duration-200 ${
            hoveredElement === element.id
              ? "bg-primary/20 border-2 border-primary"
              : "bg-transparent border-2 border-transparent hover:bg-primary/10 hover:border-primary/50"
          }`}
          style={{
            left: `${element.coordinates.x}%`,
            top: `${element.coordinates.y}%`,
            width: `${element.coordinates.width}%`,
            height: `${element.coordinates.height}%`,
          }}
          onMouseEnter={() => setHoveredElement(element.id)}
          onMouseLeave={() => setHoveredElement(null)}
          onClick={() => onElementClick(element)}
        >
          {hoveredElement === element.id && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs font-medium whitespace-nowrap z-10 shadow-md">
              {element.name}
            </div>
          )}
        </div>
      ))}

      {/* Instructions overlay when no elements are detected */}
      {outfitElements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="bg-background/90 p-4 text-center">
            <p className="text-sm text-muted-foreground">Analyzing clothing elements...</p>
          </Card>
        </div>
      )}
    </div>
  )
}
