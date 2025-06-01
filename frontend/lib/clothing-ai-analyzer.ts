// Custom AI model for clothing analysis
import { ServerClothingAnalyzer } from "./server-clothing-analyzer"

export interface ClothingElement {
  id: string
  name: string
  type: "top" | "bottom" | "outerwear" | "footwear" | "accessory"
  price: number
  fabric: string
  color: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
}

export interface AnalysisResult {
  elements: ClothingElement[]
  totalItems: number
  dominantColors: string[]
  estimatedComplexity: "simple" | "moderate" | "complex"
}

export const ClothingAIAnalyzer = ServerClothingAnalyzer
