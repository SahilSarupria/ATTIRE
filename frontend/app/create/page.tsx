"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Upload, PenLine, Loader2, ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ImageUploader } from "@/components/image-uploader"
import { useToast } from "@/hooks/use-toast"
import { InteractiveOutfitViewer } from "@/components/interactive-outfit-viewer"
import { OutfitDetailsPanel } from "@/components/outfit-details-panel"
import Header from "@/components/Header"

export default function CreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("text")
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<{ url: string; file: File } | null>(null)
  const { toast } = useToast()
  const [outfitElements, setOutfitElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [isAnalyzingOutfit, setIsAnalyzingOutfit] = useState(false)

  // Panel state management - only one panel can be open at a time, but one must always be open
  const [activePanel, setActivePanel] = useState<"prompt" | "details">("prompt")

  const handleTranscription = (text: string) => {
    setPrompt(text)
  }

  const handleImageUpload = (imageUrl: string, file: File) => {
    setReferenceImage({ url: imageUrl, file })
  }

  const handleImageAnalysis = (analysis: string) => {
    setPrompt(analysis)
  }

  const analyzeOutfitElements = async (imageUrl: string) => {
    setIsAnalyzingOutfit(true)

    try {
      const response = await fetch("/api/analyze-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          prompt,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setOutfitElements(data.elements)
    } catch (error) {
      console.error("Error analyzing outfit:", error)
      toast({
        title: "Analysis Failed",
        description: "Could not analyze outfit elements. You can still add the full design to cart.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingOutfit(false)
    }
  }

  // const handleElementClick = (element) => {
  //   setSelectedElement(element)
  //   // Automatically open details panel when element is clicked
  //   setActivePanel("details")
  // }

  // const handleAddElementToCart = (element) => {
  //   toast({
  //     title: "Added to Cart",
  //     description: `${element.name} has been added to your cart!`,
  //   })
  // }

  // const handleAddElementToWishlist = (element) => {
  //   toast({
  //     title: "Added to Wishlist",
  //     description: `${element.name} has been saved to your wishlist!`,
  //   })
  // }

  const generateDesign = async () => {
    if (!prompt) return

    setIsGenerating(true)
    setOutfitElements([])
    setSelectedElement(null)

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

      // Keep prompt panel open after generation
      setActivePanel("prompt")

      // Analyze the generated outfit for interactive elements
      await analyzeOutfitElements(data.imageUrl)

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

  const toggleToPromptPanel = () => {
    setActivePanel("prompt")
  }

  const toggleToDetailsPanel = () => {
    setActivePanel("details")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <><Header></Header></>
      <br></br><br></br>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Your Custom Design</h1>
          <p className="text-muted-foreground mt-2">
            Use voice, upload an image, or describe your perfect clothing item
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative overflow-hidden">
        {/* Prompt Panel */}
        <div
          className={`space-y-6 transition-all duration-300 ease-in-out ${
            activePanel === "prompt"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full pointer-events-none absolute"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Design Input</h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
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
        </div>

        {/* Main Design Area */}
        <div className="space-y-6 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generated Design</h2>
            {generatedDesign && (
              <Button
                variant="outline"
                size="icon"
                onClick={activePanel === "prompt" ? toggleToDetailsPanel : toggleToPromptPanel}
                className="flex items-center gap-2"
              >
                {activePanel === "prompt" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {generatedDesign ? (
            <>
              <Card className="overflow-hidden">
                <CardContent className="p-0 relative">
                  {isAnalyzingOutfit && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Analyzing outfit elements...</p>
                      </div>
                    </div>
                  )}
                  {/* <InteractiveOutfitViewer
                    imageUrl={generatedDesign}
                    outfitElements={outfitElements}
                    onElementClick={handleElementClick}
                  /> */}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" className="w-full" onClick={addToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add Full Outfit to Cart
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={addToWishlist}>
                  <Heart className="mr-2 h-4 w-4" />
                  Save Full Outfit
                </Button>
              </div>
            </>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[3/4] flex items-center justify-center bg-muted text-muted-foreground">
                  Your design will appear here
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details Panel */}
        <div
          className={`space-y-6 relative transition-all duration-300 ease-in-out ${
            activePanel === "details"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full pointer-events-none absolute"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Item Details</h2>
          </div>

          {/* <OutfitDetailsPanel
            selectedElement={selectedElement}
            onAddToCart={handleAddElementToCart}
            onAddToWishlist={handleAddElementToWishlist}
          /> */}

          {outfitElements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">How to Use</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Hover over any clothing item to highlight it</li>
                <li>• Click on an item to view its details and pricing</li>
                <li>• Add individual items or the full outfit to your cart</li>
                <li>• Save items or the full outfit to your wishlist</li>
              </ul>
            </div>
          )}

          {/* {outfitElements.length > 0 && ( */}
            {/* // <div>
            //   <h3 className="text-lg font-semibold mb-3">Detected Items</h3>
            //   <div className="space-y-2">
            //     {outfitElements.map((element) => (
            //       // <Card
            //       //   key={element.id}
            //       //   className={`cursor-pointer transition-colors ${
            //       //     selectedElement?.id === element.id ? "ring-2 ring-primary" : "hover:bg-muted"
            //       //   }`}
            //       //   onClick={() => handleElementClick(element)}
            //       // >
            //       //   <CardContent className="p-3">
            //       //     <div className="flex justify-between items-center">
            //       //       <span className="font-medium">{element.name}</span>
            //       //       <span className="text-sm font-bold">${element.price.toFixed(2)}</span>
            //       //     </div>
            //       //     <div className="text-xs text-muted-foreground mt-1">
            //       //       {element.fabric} • {element.color}
            //       //     </div>
            //       //   </CardContent>
            //       // </Card>
            //     ))}
            //   </div>
            // </div> */}
          {/* )} */}
        </div>
      </div>
    </div>
  )
}
