"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mic, Square, Loader2, Trash2, MicOff, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface RealTimeVoiceRecorderProps {
  onTranscription: (text: string) => void
  onFinalTranscription?: (text: string) => void
  className?: string
}

// Speech Recognition types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  serviceURI: string
  grammars: any
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function RealTimeVoiceRecorder({
  onTranscription,
  onFinalTranscription,
  className = "",
}: RealTimeVoiceRecorderProps) {
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isUserEditing, setIsUserEditing] = useState(false)
  const [isSpeechDetected, setIsSpeechDetected] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-detect language based on browser/system settings
  const getAutoLanguage = useCallback(() => {
    const browserLang = navigator.language || navigator.languages?.[0] || "en-US"
    return browserLang
  }, [])

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = getAutoLanguage()
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setIsProcessing(false)
      setIsSpeechDetected(false)
    }

    recognition.onspeechstart = () => {
      setIsSpeechDetected(true)
    }

    recognition.onspeechend = () => {
      setIsSpeechDetected(false)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (isUserEditing) return // Don't update if user is manually editing

      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          final += transcript
          setConfidence(result[0].confidence)
        } else {
          interim += transcript
        }
      }

      setInterimTranscript(interim)

      if (final) {
        setFinalTranscript((prev) => {
          const newFinal = prev + final
          setWordCount(newFinal.split(" ").filter((word) => word.length > 0).length)
          const fullText = newFinal + interim
          setCurrentTranscript(fullText)
          onTranscription(fullText)
          if (onFinalTranscription) {
            onFinalTranscription(newFinal)
          }
          return newFinal
        })
      } else {
        const fullTranscript = finalTranscript + interim
        setCurrentTranscript(fullTranscript)
        onTranscription(fullTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsProcessing(false)
      setIsSpeechDetected(false)

      if (event.error === "no-speech") {
        // Auto-restart if no speech detected
        if (isListening) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start()
              } catch (error) {
                console.log("Recognition restart failed:", error)
              }
            }
          }, 1000)
        }
      } else if (event.error === "network") {
        toast({
          title: "Network Error",
          description: "Speech recognition failed due to network issues. Please try again.",
          variant: "destructive",
        })
      } else if (event.error === "not-allowed") {
        toast({
          title: "Permission Denied",
          description: "Microphone access is required for voice input.",
          variant: "destructive",
        })
        stopListening()
      }
    }

    recognition.onend = () => {
      setIsProcessing(false)
      setIsSpeechDetected(false)

      // Auto-restart if still supposed to be listening
      if (isListening) {
        restartTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              console.log("Recognition restart failed:", error)
            }
          }
        }, 100)
      }
    }

    return recognition
  }, [
    isSupported,
    getAutoLanguage,
    isListening,
    finalTranscript,
    isUserEditing,
    onTranscription,
    onFinalTranscription,
    toast,
  ])

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    try {
      recognitionRef.current = initializeSpeechRecognition()
      if (recognitionRef.current) {
        setIsProcessing(true)
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive",
      })
    }
  }, [isSupported, initializeSpeechRecognition, toast])

  const stopListening = useCallback(() => {
    setIsListening(false)
    setIsProcessing(false)
    setIsSpeechDetected(false)

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const clearTranscript = useCallback(() => {
    setCurrentTranscript("")
    setFinalTranscript("")
    setInterimTranscript("")
    setWordCount(0)
    setConfidence(0)
    onTranscription("")
    if (textareaRef.current) {
      textareaRef.current.value = ""
    }
  }, [onTranscription])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Handle manual text editing
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value
      setCurrentTranscript(newText)
      setFinalTranscript(newText)
      setInterimTranscript("")
      setWordCount(newText.split(" ").filter((word) => word.length > 0).length)
      onTranscription(newText)
    },
    [onTranscription],
  )

  const handleTextFocus = useCallback(() => {
    setIsUserEditing(true)
  }, [])

  const handleTextBlur = useCallback(() => {
    setIsUserEditing(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [])

  // Google Assistant-style visual indicator
  const GoogleAssistantVisual = () => (
    <div className="flex items-center justify-center">
      {isListening ? (
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${isSpeechDetected ? "bg-blue-500" : "bg-gray-400"}`}
              animate={{
                height: isSpeechDetected ? [4, 16, 4] : [4, 8, 4],
                opacity: isSpeechDetected ? [0.4, 1, 0.4] : [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      ) : (
        <MicOff className="h-4 w-4 text-gray-400" />
      )}
    </div>
  )

  const fullTranscript = finalTranscript + interimTranscript

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={toggleListening}
                  disabled={!isSupported || isProcessing}
                  size="lg"
                  className={`${
                    isListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isListening ? (
                    <Square className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                  <span className="ml-2">
                    {isProcessing ? "Starting..." : isListening ? "Stop Recording" : "Start Recording"}
                  </span>
                </Button>

                {currentTranscript && (
                  <Button onClick={clearTranscript} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Google Assistant-style visual indicator */}
              <div className="flex items-center gap-3">
                <GoogleAssistantVisual />
                {isListening && (
                  <Badge variant="destructive" className="animate-pulse">
                    Listening
                  </Badge>
                )}
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-2 flex-wrap">
              {wordCount > 0 && <Badge variant="secondary">{wordCount} words</Badge>}

              {confidence > 0 && (
                <Badge variant="outline" className={confidence > 0.8 ? "text-green-600" : "text-yellow-600"}>
                  {Math.round(confidence * 100)}% confidence
                </Badge>
              )}

              <Badge variant="outline" className="text-xs">
                Auto-detected: {getAutoLanguage()}
              </Badge>
            </div>

            {/* Editable transcript display */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Live Transcript (Editable)</span>
              </div>

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={currentTranscript}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                  onBlur={handleTextBlur}
                  placeholder={
                    isListening
                      ? "Listening... Start speaking or type here to edit"
                      : "Click 'Start Recording' to begin voice input or type your prompt here"
                  }
                  className="min-h-[12px] resize-none bg-muted/30 border-muted-foreground/20 focus:border-primary"
                />

                {/* Show interim results overlay when not editing */}
                {!isUserEditing && interimTranscript && (
                  <div className="absolute inset-0 pointer-events-none p-3 text-muted-foreground/60 italic">
                    <span style={{ visibility: "hidden" }}>{finalTranscript}</span>
                    <span>{interimTranscript}</span>
                    {isListening && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        className="inline-block w-0.5 h-4 bg-primary ml-1"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            {/* <div className="text-xs text-muted-foreground space-y-1">
              <p>
                💡 <strong>Tips:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Speak clearly and the transcript will appear in real-time</li>
                <li>You can edit the text manually while recording</li>
                <li>Language is automatically detected from your browser settings</li>
                <li>The visual indicator shows when speech is detected</li>
              </ul>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
