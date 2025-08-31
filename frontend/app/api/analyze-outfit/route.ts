import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt } = await req.json()

    if (!imageUrl) {
      return Response.json({ error: "No image URL provided" }, { status: 400 })
    }

    // Call our Python segmentation service
    const response = await fetch("http://localhost:5000/segment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        prompt: prompt || "",
      }),
    })

    if (!response.ok) {
      throw new Error(`Segmentation service error: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform the data to match our frontend expectations
    const elements = data.segmentedItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.category,
      price: item.price,
      fabric: "Cotton Blend", // Default fabric
      color: "Multi-Color", // Default color
      coordinates: {
        x: item.bbox[0],
        y: item.bbox[1],
        width: item.bbox[2],
        height: item.bbox[3],
      },
      polygon: item.polygon,
      confidence: item.confidence,
      category: item.category,
      bbox: item.bbox,
      mask_base64: item.mask_base64,
    }))

    return Response.json({
      elements: elements,
      metadata: {
        totalItems: data.totalItems,
        dominantColors: ["mixed"],
        complexity: "moderate",
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
          type: "shirt",
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
