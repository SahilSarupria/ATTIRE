"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Mic } from "lucide-react"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
}

export function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    audioChunks.current = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })

      setLoading(true)

      try {
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.webm")

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.text) {
          onTranscription(data.text)
        } else {
          console.error("No transcription text received.")
        }
      } catch (err) {
        console.error("Transcription failed", err)
      } finally {
        setLoading(false)
      }
    }

    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="space-y-2">
      <Button onClick={recording ? stopRecording : startRecording} disabled={loading} variant="secondary">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transcribing...
          </>
        ) : recording ? (
          "Stop Recording"
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Record Voice
          </>
        )}
      </Button>
    </div>
  )
}
