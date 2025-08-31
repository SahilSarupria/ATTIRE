import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return Response.json({ error: "No task ID provided" }, { status: 400 })
    }

    // Check status from our Python service
    const response = await fetch(`http://localhost:5000/status/${taskId}`)

    if (!response.ok) {
      throw new Error(`Status check error: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform the response to match frontend expectations
    if (data.status === "completed") {
      const elements =
        data.segmentedItems?.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.category,
          price: item.price,
          fabric: "Cotton Blend",
          color: "Multi-Color",
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
        })) || []

      return Response.json({
        status: "completed",
        imageUrl: data.imageUrl,
        elements: elements,
        metadata: {
          totalItems: data.totalItems || 0,
          dominantColors: ["mixed"],
          complexity: "moderate",
        },
      })
    }

    return Response.json({
      status: data.status,
      message: data.message,
    })
  } catch (error) {
    console.error("Status check error:", error)
    return Response.json({ error: "Failed to check generation status" }, { status: 500 })
  }
}
