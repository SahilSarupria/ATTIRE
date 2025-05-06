import type { NextRequest } from "next/server"
import { generateText } from "ai"
import { replicate } from "@ai-sdk/replicate"

export async function POST(req: NextRequest) {
  try {
    // Get the audio file from the request
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer())

    // Convert the buffer to a base64 string
    const base64Audio = buffer.toString("base64")

    // Use Replicate's Whisper model to transcribe the audio
    const { text } = await generateText({
      model: replicate("vaibhavs10/incredibly-fast-whisper"),
      prompt: base64Audio,
    })

    return Response.json({ transcript: text })
  } catch (error) {
    console.error("Transcription error:", error)
    return Response.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
