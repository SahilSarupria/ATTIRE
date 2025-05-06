import type { NextRequest } from "next/server"
import { generateText } from "ai"
import { replicate } from "@ai-sdk/replicate"

export async function POST(req: NextRequest) {
  try {
    // Get the image file from the request
    const formData = await req.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return Response.json({ error: "No image file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Convert the buffer to a base64 string
    const base64Image = buffer.toString("base64")

    // Use Replicate's LLaVA model to analyze the image
    const { text: analysis } = await generateText({
      model: replicate("yorickvp/llava-13b"),
      prompt:
        "Describe this clothing item in detail. Include the style, color, pattern, material, and any distinctive features. Format the response as a detailed description that could be used to recreate this item.",
      image: base64Image,
    })

    return Response.json({
      analysis,
      enhancedPrompt: `Create a clothing design similar to this: ${analysis}. Make it photorealistic and high-quality.`,
    })
  } catch (error) {
    console.error("Image analysis error:", error)
    return Response.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
