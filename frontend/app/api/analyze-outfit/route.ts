import type { NextRequest } from "next/server"
import { ServerClothingAnalyzer } from "@/lib/server-clothing-analyzer"

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt } = await req.json()

    if (!imageUrl) {
      return Response.json({ error: "No image URL provided" }, { status: 400 })
    }

    // Initialize our server-side analyzer
    const analyzer = new ServerClothingAnalyzer()

    // Analyze the clothing based on prompt and context
    const analysis = await analyzer.analyzeImage(imageUrl, prompt || "")

    // Return the detected elements
    return Response.json({
      elements: analysis.elements,
      metadata: {
        totalItems: analysis.totalItems,
        dominantColors: analysis.dominantColors,
        complexity: analysis.estimatedComplexity,
      },
    })
  } catch (error) {
    console.error("Outfit analysis error:", error)

    // Return a fallback response
    return Response.json({
      elements: [
        {
          id: "fallback_item",
          name: "Custom Design",
          type: "top",
          price: 89.99,
          fabric: "Cotton Blend",
          color: "Multi-Color",
          coordinates: {
            x: 20,
            y: 20,
            width: 60,
            height: 60,
          },
          confidence: 0.7,
        },
      ],
      metadata: {
        totalItems: 1,
        dominantColors: ["mixed"],
        complexity: "moderate",
      },
    })
  }
}
