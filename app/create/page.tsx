"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Upload, PenLine, Loader2, ShoppingCart, Heart } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ImageUploader } from "@/components/image-uploader"
import { CostEstimator } from "@/components/cost-estimator"
import { CostBreakdown } from "@/components/cost-breakdown"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/Header"


export default function CreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("voice")
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<{ url: string; file: File } | null>(null)
  const [costEstimate, setCostEstimate] = useState<number | null>(null)
  const [costBreakdown, setCostBreakdown] = useState<any | null>(null)
  const { toast } = useToast()

  const handleTranscription = (text: string) => {
    setPrompt(text)
  }

  const handleImageUpload = (imageUrl: string, file: File) => {
    setReferenceImage({ url: imageUrl, file })
  }

  const handleImageAnalysis = (analysis: string) => {
    setPrompt(analysis)
  }

  const handleCostEstimation = (cost: number, breakdown: any) => {
    setCostEstimate(cost)
    setCostBreakdown(breakdown)

    toast({
      title: "Cost Estimate Complete",
      description: `Estimated manufacturing cost: $${cost.toFixed(2)}`,
    })
  }

  const generateDesign = async () => {
    if (!prompt) return

    setIsGenerating(true)
    setCostEstimate(null)
    setCostBreakdown(null)

    try {
      const response = await fetch("/api/generate-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          referenceImageUrl: referenceImage?.url || null,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedDesign(data.imageUrl)

      toast({
        title: "Design Generated",
        description: "Your custom clothing design has been created!",
      })
    } catch (error) {
      console.error("Error generating design:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating your design. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const addToCart = () => {
    toast({
      title: "Added to Cart",
      description: "Your custom design has been added to your cart!",
    })
  }

  const addToWishlist = () => {
    toast({
      title: "Added to Wishlist",
      description: "Your custom design has been saved to your wishlist!",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <><Header></Header></>
      <br></br><br></br>
      <h1 className="text-3xl font-bold mb-8">Create Your Custom Design</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <VoiceRecorder onTranscription={handleTranscription} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ImageUploader onImageUpload={handleImageUpload} onImageAnalysis={handleImageAnalysis} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="Describe your perfect clothing item in detail..."
                    className="min-h-[150px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div>
            <p className="font-medium mb-2">Your prompt:</p>
            <Card className="bg-muted">
              <CardContent className="py-4">
                {prompt || "No prompt yet. Use one of the input methods above."}
              </CardContent>
            </Card>
          </div>

          <Button className="w-full" size="lg" disabled={!prompt || isGenerating} onClick={generateDesign}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Design...
              </>
            ) : (
              "Generate Design"
            )}
          </Button>

          {prompt && !isGenerating && <CostEstimator prompt={prompt} onEstimationComplete={handleCostEstimation} />}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Generated Design</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {generatedDesign ? (
                <img
                  src={generatedDesign || "/placeholder.svg"}
                  alt="Generated clothing design"
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[3/4] flex items-center justify-center bg-muted text-muted-foreground">
                  Your design will appear here
                </div>
              )}
            </CardContent>
          </Card>

          {generatedDesign && (
            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" className="w-full" onClick={addToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={addToWishlist}>
                <Heart className="mr-2 h-4 w-4" />
                Save Design
              </Button>
            </div>
          )}

          {costEstimate !== null && costBreakdown && <CostBreakdown cost={costEstimate} breakdown={costBreakdown} />}
        </div>
      </div>
    </div>
  )
}
