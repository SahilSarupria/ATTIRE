"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mic,
  Upload,
  PenLine,
  Loader2,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  X,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { RealTimeVoiceRecorder } from "@/components/voice-recorder"
import { ImageUploader } from "@/components/image-uploader"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/Header"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/types"
import { InteractiveClothingViewer } from "@/components/interactive-clothing-viewer"
import { SizeGuide } from "@/components/size-guide"

const suggestions = [
  "black cotton hoodie",
  "floral print summer dress",
  "red velvet jacket",
  "white graphic tee",
  "vintage denim jacket",
  "silk evening gown",
  "wool winter coat",
  "linen summer shirt",
  "leather biker jacket",
  "cashmere sweater",
]

const keywords = [
  "cotton",
  "silk",
  "wool",
  "linen",
  "denim",
  "leather",
  "cashmere",
  "velvet",
  "black",
  "white",
  "red",
  "blue",
  "green",
  "pink",
  "yellow",
  "purple",
  "hoodie",
  "dress",
  "jacket",
  "shirt",
  "coat",
  "sweater",
  "pants",
  "skirt",
  "vintage",
  "modern",
  "casual",
  "formal",
  "summer",
  "winter",
  "spring",
  "fall",
]

const randomPrompts = [
  "A flowing bohemian maxi dress with intricate embroidery",
  "Minimalist black turtleneck with clean lines",
  "Vintage-inspired leather jacket with brass hardware",
  "Cozy oversized cardigan in neutral tones",
  "Elegant silk blouse with delicate pleating",
  "Streetwear hoodie with bold graphic design",
  "Classic trench coat with modern details",
  "Romantic floral sundress for summer",
]

// Define user type to match your main page
type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

interface ClothingItem {
  id: string
  category: string
  name: string
  confidence: number
  bbox: number[]
  polygon: number[][]
  price: number
  mask_base64: string
  type: string
  fabric: string
  color: string
  manufacturingNote?: string
  selectedSize?: string
  quantity?: number
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  fabric_recommendations?: Array<{
    fabric_id: string
    fabric_name: string
    fabric_type: string
    estimated_price: number
    price_per_yard: number
    recommendation_score: number
    is_premium: boolean
    is_sustainable: boolean
    sustainability_score: number
    durability_score: number
    comfort_score: number
  }>
}

export default function CreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("text")
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<{ url: string; file: File } | null>(null)
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedFabric, setSelectedFabric] = useState<any>(null)
  const [outfitElements, setOutfitElements] = useState<ClothingItem[]>([])
  const [selectedElement, setSelectedElement] = useState<ClothingItem | null>(null)
  const [isAnalyzingOutfit, setIsAnalyzingOutfit] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
  const [recentPrompts, setRecentPrompts] = useState<string[]>([])
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])
  const [showTooltip, setShowTooltip] = useState(false)
  const [detectedItems, setDetectedItems] = useState<ClothingItem[]>([])
  const [activePanel, setActivePanel] = useState<"prompt" | "details">("prompt")
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>("M")
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState<string>("domestic")
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(14)

  // Add authentication state
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const handleVoiceTranscription = (text: string) => {
    setPrompt(text)
    setInput(text)
  }

  const getSuggestion = (input: string) => {
    if (!input) return ""
    const match = suggestions.find((s) => s.toLowerCase().startsWith(input.toLowerCase()))
    return match && match.toLowerCase() !== input.toLowerCase() ? match : ""
  }

  const detectKeywords = (text: string) => {
    const words = text.toLowerCase().split(/\s+/)
    const detected = keywords.filter((keyword) => words.some((word) => word.includes(keyword.toLowerCase())))
    return [...new Set(detected)].slice(0, 6) // Limit to 6 keywords
  }

  const addToRecentPrompts = (prompt: string) => {
    if (prompt.trim() && !recentPrompts.includes(prompt)) {
      const updated = [prompt, ...recentPrompts.slice(0, 4)] // Keep only 5 recent
      setRecentPrompts(updated)
      localStorage.setItem("recentPrompts", JSON.stringify(updated))
    }
  }

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * randomPrompts.length)
    return randomPrompts[randomIndex]
  }

  const handleRandomPrompt = () => {
    const random = getRandomPrompt()
    setPrompt(random)
    setInput(random)
  }

  const suggestion = getSuggestion(input)

  const calculateDeliveryTime = (
    baseItem: ClothingItem | null,
    selectedFabric: any,
    quantity: number,
    location = "domestic",
  ) => {
    let baseDays = 14 // Base custom design manufacturing time

    // Complexity factors
    if (baseItem) {
      // Add days based on item complexity
      const complexityMap: { [key: string]: number } = {
        dress: 3,
        gown: 5,
        suit: 4,
        jacket: 3,
        coat: 4,
        shirt: 1,
        blouse: 2,
        "t-shirt": 0,
        hoodie: 2,
        sweater: 2,
        pants: 2,
        jeans: 1,
        skirt: 1,
        shorts: 1,
      }

      const itemType = baseItem.category?.toLowerCase() || baseItem.type?.toLowerCase() || ""
      const complexityDays = complexityMap[itemType] || 2
      baseDays += complexityDays
    }

    // Fabric complexity
    if (selectedFabric) {
      if (selectedFabric.is_premium) baseDays += 2
      if (selectedFabric.fabric_type?.toLowerCase().includes("silk")) baseDays += 1
      if (selectedFabric.fabric_type?.toLowerCase().includes("leather")) baseDays += 3
      if (selectedFabric.fabric_type?.toLowerCase().includes("wool")) baseDays += 1
    }

    // Quantity impact
    if (quantity > 1) {
      baseDays += Math.min(Math.floor(quantity / 2), 5) // Max 5 extra days for quantity
    }

    // Manufacturing notes complexity
    if (baseItem?.manufacturingNote && baseItem.manufacturingNote.length > 50) {
      baseDays += 2 // Custom modifications add time
    }

    // Location/shipping time
    const shippingDays = location === "international" ? 7 : location === "express" ? 2 : 3

    return {
      manufacturing: baseDays,
      shipping: shippingDays,
      total: baseDays + shippingDays,
    }
  }

  // Authentication function matching your main page pattern
  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`, {
        method: "GET",
        credentials: "include", // Important: include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const userData: User = await response.json()
      const formattedUser: UserType = {
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username || "No Name",
        isLoggedIn: true,
      }

      setUser(formattedUser)
    } catch (error) {
      console.error("Authentication error:", error)
      setUser(null)
      // Don't redirect automatically - let the user view the page in read-only mode
    } finally {
      setIsLoading(false)
    }
  }

  // Django backend API functions with authentication
  const saveDesignSession = async (designData: {
    prompt: string
    imageUrl: string
    referenceImageUrl?: string
    outfitElements: any[]
    detectedKeywords: string[]
  }) => {
    // Check if still loading authentication
    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Checking authentication status...",
        variant: "default",
      })
      return null
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your design.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return null
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/save-design-session/`, {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: designData.prompt,
          generated_image_url: designData.imageUrl,
          reference_image_url: designData.referenceImageUrl,
          outfit_elements: designData.outfitElements,
          detected_keywords: designData.detectedKeywords,
          created_at: new Date().toISOString(),
        }),
      })

      if (response.status === 401 || response.status === 403) {
        // Handle authentication error
        toast({
          title: "Authentication Error",
          description: "Please log in to save your design.",
          variant: "destructive",
        })
        return null
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to save design session")
      }

      return data.session_id
    } catch (error) {
      console.error("Error saving design session:", error)
      toast({
        title: "Save Failed",
        description: "Could not save your design session. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  const loadDesignSession = async (sessionId: string) => {
    // Check if still loading authentication
    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Checking authentication status...",
        variant: "default",
      })
      return null
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to load your design.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return null
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/load-design-session/${sessionId}/`,
        {
          method: "GET",
          credentials: "include", // Include cookies
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.status === 401 || response.status === 403) {
        // Handle authentication error
        toast({
          title: "Authentication Error",
          description: "Please log in to load your design.",
          variant: "destructive",
        })
        return null
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to load design session")
      }

      return data
    } catch (error) {
      console.error("Error loading design session:", error)
      toast({
        title: "Load Failed",
        description: "Could not load the design session. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  useEffect(() => {
    // Load recent prompts from localStorage
    const saved = localStorage.getItem("recentPrompts")
    if (saved) {
      setRecentPrompts(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Detect keywords as user types
    const detected = detectKeywords(prompt)
    setDetectedKeywords(detected)
  }, [prompt])

  // Check authentication on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Scroll to top on mobile when panel switches
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 // lg breakpoint
    if (isMobile && activePanel === "details") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [activePanel])

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
    // Check if imageUrl is provided
    if (!imageUrl) {
      console.warn("No image URL provided for analysis")
      return
    }

    // Check if still loading authentication
    if (isLoading) {
      return
    }

    // Check if user is authenticated
    if (!user) {
      return
    }

    setIsAnalyzingOutfit(true)
    try {
      const response = await fetch(`/api/analyze-outfit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          image_url: imageUrl,
          prompt: prompt,
        }),
      })

      if (response.status === 401 || response.status === 403) {
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze outfit")
      }

      // Update both outfit elements and detected items
      const enrichedElements = await Promise.all(
        (data.elements || []).map(async (element: any) => {
          const clothingType = element?.analysis?.clothing_type || element?.type || element?.category

          try {
            // Fetch fabric recommendations
            const recRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products/fabric-recommendations/?clothing_type=${encodeURIComponent(clothingType)}`,
            )
            const recJson = await recRes.json()
            const topFabric = recJson?.recommendations?.[0]

            // Predict price
            let predictedPrice = element.price ?? 0
            if (topFabric?.fabric_id) {
              const priceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/calculate-fabric-price/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fabric_id: topFabric.fabric_id,
                  clothing_type: clothingType,
                }),
              })
              const priceJson = await priceRes.json()
              predictedPrice = priceJson?.predicted_price ?? predictedPrice
            }

            return {
              ...element,
              fabric_recommendations: recJson?.recommendations ?? [],
              predicted_price: predictedPrice,
              selected_fabric_id: topFabric?.fabric_id ?? null,
              quantity: 1,
            }
          } catch (err) {
            console.error("Error enriching element with fabric and price", err)
            return element
          }
        }),
      )

      setOutfitElements(enrichedElements)
      setDetectedItems(data.detected_items || [])
      setIsCanvasReady(true)
      setForceRedrawTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Error analyzing outfit:", error)
    } finally {
      setIsAnalyzingOutfit(false)
    }
  }

  const handleItemClick = (item: ClothingItem) => {
    setSelectedElement(item)
    setActivePanel("details")
    setQuantity(item.quantity || 1)
    toast({
      title: "Item Selected",
      description: `Selected ${item.name} - $${item.price}`,
    })
  }

  const handleAddItemToCart = (item: ClothingItem) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return
    }

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart!`,
    })
  }

  const handleAddItemToWishlist = (item: ClothingItem) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save to wishlist.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return
    }

    toast({
      title: "Added to Wishlist",
      description: `${item.name} has been saved to your wishlist!`,
    })
  }

  const generateDesign = async () => {
    if (!prompt) return

    // Check if still loading authentication
    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Checking authentication status...",
        variant: "default",
      })
      return
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate designs.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return
    }

    // Add to recent prompts before generating
    addToRecentPrompts(prompt)

    setIsGenerating(true)
    setIsCanvasReady(false) // Reset when generation starts
    setOutfitElements([])
    setSelectedElement(null)

    try {
      // Step 1: Generate the design
      const response = await fetch(`/api/generate-design`, {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          referenceImageUrl: referenceImage?.url || null,
        }),
      })

      if (response.status === 401 || response.status === 403) {
        // Handle authentication error
        toast({
          title: "Authentication Error",
          description: "Please log in to generate designs.",
          variant: "destructive",
        })
        router.push("/login?redirect=/create")
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate design")
      }

      setGeneratedDesign(data.imageUrl)
      setActivePanel("prompt")

      // Step 2: Analyze outfit elements (optional, no error handling needed)
      await analyzeOutfitElements(data.imageUrl || data.image_url || data.generated_image_url)

      // Step 3: Save the design session with all data (including any analyzed elements)
      const sessionId = await saveDesignSession({
        prompt,
        imageUrl: data.imageUrl,
        referenceImageUrl: referenceImage?.url,
        outfitElements: data.outfitElements, // This will include any elements from analysis
        detectedKeywords,
      })

      if (sessionId) {
        // Store session ID for future reference
        localStorage.setItem("lastDesignSessionId", sessionId)
        // Optional: Update URL with the new session ID without page reload
        const url = new URL(window.location.href)
        url.searchParams.set("session", sessionId)
        window.history.replaceState({}, "", url)
      }

      toast({
        title: "Design Generated",
        description: "Your custom clothing design has been created and saved!",
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
    // Check if still loading authentication
    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Checking authentication status...",
        variant: "default",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return
    }

    toast({
      title: "Added to Cart",
      description: "Your custom design has been added to your cart!",
    })
  }

  const addToWishlist = () => {
    // Check if still loading authentication
    if (isLoading) {
      toast({
        title: "Please Wait",
        description: "Checking authentication status...",
        variant: "default",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save to wishlist.",
        variant: "destructive",
      })
      router.push("/login?redirect=/create")
      return
    }

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

  // Add this useEffect to handle loading a design session from URL params
  useEffect(() => {
    // Only try to load session if user is authenticated and not still loading
    if (!isLoading && user) {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get("session")
      if (sessionId) {
        loadDesignFromHistory(sessionId)
      }
    }
  }, [user, isLoading]) // Add isLoading as dependency

  // 👇 Add this signal in your component state
  const [forceRedrawTrigger, setForceRedrawTrigger] = useState(0)

  const loadDesignFromHistory = async (sessionId: string) => {
    const sessionData = await loadDesignSession(sessionId)
    if (sessionData) {
      setPrompt(sessionData.prompt)
      setInput(sessionData.prompt)
      setGeneratedDesign(sessionData.generated_image_url)
      setOutfitElements(sessionData.outfit_elements || [])
      setDetectedKeywords(sessionData.detected_keywords || [])
      console.log("✅ Loaded outfit elements:", sessionData.outfit_elements) // <== ADD THIS

      if (sessionData.reference_image_url) {
        setReferenceImage({
          url: sessionData.reference_image_url,
          file: null as any,
        })
      }

      const img = new Image()
      img.src = sessionData.generated_image_url
      img.onload = () => {
        console.log("✅ Image from session loaded:", img.width, img.height)
        setForceRedrawTrigger((prev) => prev + 1) // 💥 Force canvas redraw
        toast({
          title: "Design Loaded",
          description: "Your previous design session has been restored!",
        })
      }
    }
  }

  // Recalculate delivery time when item details change
  useEffect(() => {
    if (selectedElement) {
      const deliveryCalc = calculateDeliveryTime(selectedElement, selectedFabric, quantity, deliveryLocation)
      setEstimatedDeliveryDays(deliveryCalc.total)
    }
  }, [selectedElement, selectedFabric, quantity, deliveryLocation])

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
      <>
        <Header></Header>
      </>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 relative overflow-hidden mt-16 sm:mt-16 lg:mt-12">
        {/* Prompt Panel */}
        <div
          className={`space-y-4 sm:space-y-6 transition-all duration-300 ease-in-out ${
            activePanel === "prompt"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full pointer-events-none absolute"
          }`}
        >
          <div>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Create Your Custom Design</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Use voice, upload an image, or describe your perfect clothing item
              </p>
            </div>
            {/* {user && <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.name}!</p>} */}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Design Input</h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 h-auto">
              <TabsTrigger value="text" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <PenLine className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <RealTimeVoiceRecorder
                    onTranscription={handleVoiceTranscription}
                    onFinalTranscription={(text) => {
                      setPrompt(text)
                      setInput(text)
                    }}
                  />
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
                  {/* Input area with tooltip */}
                  <TooltipProvider>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium whitespace-nowrap">Describe your design</label>
                        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={(e) => {
                                // Only handle click on touch devices
                                if (window.matchMedia("(pointer: coarse)").matches) {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setTooltipOpen((prev) => !prev)
                                }
                              }}
                              onMouseEnter={() => {
                                if (!window.matchMedia("(pointer: coarse)").matches) {
                                  setTooltipOpen(true)
                                }
                              }}
                              onMouseLeave={() => {
                                if (!window.matchMedia("(pointer: coarse)").matches) {
                                  setTooltipOpen(false)
                                }
                              }}
                            >
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            sideOffset={8}
                            className="max-w-[70vw] sm:max-w-[16rem] break-words whitespace-normal text-sm p-2 leading-snug"
                          >
                            <p>
                              Be specific about materials, colors, style, and occasion. Use Tab to accept suggestions.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {/* Random prompt button when input is empty */}
                        <div className="ml-auto">
                          {!prompt && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRandomPrompt}
                              className="text-xs bg-transparent"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              <span className="sm:hidden">Random</span>
                              <span className="hidden sm:inline">Generate Random Prompt</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="relative w-full">
                    {/* Ghost suggestion overlay */}
                    <Textarea
                      ref={textareaRef}
                      placeholder="Describe your perfect clothing item in detail..."
                      className="min-h-[100px] sm:min-h-[120px] resize-none overflow-hidden relative z-10 bg-transparent text-sm sm:text-base"
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value)
                        setInput(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && suggestion) {
                          e.preventDefault()
                          setPrompt(suggestion)
                          setInput(suggestion)
                        }
                      }}
                    />
                    {suggestion && prompt && (
                      <div
                        className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words"
                        style={{
                          padding: "0.5rem 0.75rem", // px-3 py-2 in exact pixels
                          fontSize: "0.875rem", // text-sm
                          lineHeight: "1.25rem", // text-sm line height
                          fontFamily: "inherit",
                          fontWeight: "inherit",
                          letterSpacing: "inherit",
                          border: "1px solid transparent", // invisible border to match textarea
                          borderRadius: "0.375rem", // rounded-md
                          minHeight: "120px",
                          overflow: "hidden",
                          resize: "none",
                        }}
                      >
                        <span style={{ visibility: "hidden" }}>{prompt}</span>
                        <span className="text-muted-foreground/40">{suggestion.slice(prompt.length)}</span>
                      </div>
                    )}
                  </div>

                  {/* Keyword chips */}
                  {detectedKeywords.length > 0 && (
                    <div className="space-y-2 pt-2 lg:pt-4">
                      <p className="text-xs font-medium text-muted-foreground">Detected keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {detectedKeywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="text-xs px-2 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => {
                              if (!prompt.toLowerCase().includes(keyword.toLowerCase())) {
                                const newPrompt = prompt ? `${prompt} ${keyword}` : keyword
                                setPrompt(newPrompt)
                                setInput(newPrompt)
                              }
                            }}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent prompts */}
                  {recentPrompts.length > 0 && !prompt && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Recent prompts:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRecentPrompts([])
                            localStorage.removeItem("recentPrompts")
                          }}
                          className="text-xs h-6 px-2"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {recentPrompts.map((recentPrompt, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-md border bg-muted/30 hover:bg-muted cursor-pointer transition-colors group"
                            onClick={() => {
                              setPrompt(recentPrompt)
                              setInput(recentPrompt)
                            }}
                          >
                            <p className="text-xs text-muted-foreground truncate flex-1 pr-2">{recentPrompt}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                const updated = recentPrompts.filter((_, i) => i !== index)
                                setRecentPrompts(updated)
                                localStorage.setItem("recentPrompts", JSON.stringify(updated))
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div>
            <p className="font-medium mb-2">Your prompt:</p>
            <Card className="bg-muted">
              <CardContent className="py-4 break-words">
                {prompt || "No prompt yet. Use one of the input methods above."}
              </CardContent>
            </Card>
          </div>

          <Button
            className="w-full text-sm sm:text-base py-3 sm:py-4"
            size="lg"
            disabled={!prompt || isGenerating}
            onClick={user ? generateDesign : () => router.push("/login?redirect=/create")}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Generating...</span>
              </>
            ) : !user ? (
              <span className="text-xs sm:text-sm">Log in to Generate Design</span>
            ) : (
              <span className="text-xs sm:text-sm">Generate Design</span>
            )}
          </Button>
        </div>

        {/* Main Design Area */}
        <div className="space-y-6 relative">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">Generated Design</h2>
            {generatedDesign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={activePanel === "prompt" ? toggleToDetailsPanel : toggleToPromptPanel}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                {activePanel === "prompt" ? (
                  <>
                    <span>Details</span>
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Back</span>
                  </>
                )}
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
                  <div className="w-full">
                    <InteractiveClothingViewer
                      imageUrl={generatedDesign}
                      detectedItems={outfitElements}
                      onItemClick={handleItemClick}
                      onAddToCart={handleAddItemToCart}
                      onAddToWishlist={handleAddItemToWishlist}
                      triggerRedraw={forceRedrawTrigger}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="w-full text-sm sm:text-base py-3"
                  onClick={user ? addToCart : () => router.push("/login?redirect=/create")}
                >
                  <ShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {user ? "Add Full Outfit" : "Log in to Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-sm sm:text-base py-3 bg-transparent"
                  onClick={user ? addToWishlist : () => router.push("/login?redirect=/create")}
                >
                  <Heart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {user ? "Save Full Outfit" : "Log in to Save"}
                </Button>
              </div>
            </>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
                  {generatedDesign ? (
                    <img
                      src={generatedDesign || "/placeholder.svg"}
                      alt="Generated design"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      Your design will appear here
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Updated Details Panel - Mobile Optimized */}
        {activePanel === "details" && (
          <div className="space-y-3 sm:space-y-6 relative transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Item Details</h2>
            </div>

            {selectedElement ? (
              <div className="space-y-3 sm:space-y-6">
                {/* Clean Item Header - Mobile Optimized */}
                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{selectedElement.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {selectedElement.category} • {Math.round(selectedElement.confidence * 100)}% match
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl font-bold transition-all duration-300">
                          ${selectedFabric ? selectedFabric.estimated_price : selectedElement.price}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedFabric ? selectedFabric.fabric_name : "Base price"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Minimalist Fabric Selection - Mobile Optimized */}
                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Fabric</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Choose your material</p>
                    </div>

                    {selectedElement.fabric_recommendations && selectedElement.fabric_recommendations.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {selectedElement.fabric_recommendations.map((fabric) => (
                          <div
                            key={fabric.fabric_id}
                            className={`group relative border rounded-lg transition-all duration-200 ${
                              selectedFabric?.fabric_id === fabric.fabric_id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            {/* Clickable Header - Mobile Optimized */}
                            <div
                              className="p-3 sm:p-4 cursor-pointer"
                              onClick={() =>
                                setSelectedFabric((prev) => (prev?.fabric_id === fabric.fabric_id ? null : fabric))
                              }
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div
                                    className={`w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                                      selectedFabric?.fabric_id === fabric.fabric_id
                                        ? "bg-primary"
                                        : "bg-muted group-hover:bg-primary/30"
                                    }`}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm sm:text-base truncate">
                                      {fabric.fabric_name}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground capitalize">
                                      {fabric.fabric_type}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                  <div className="flex gap-1 flex-wrap">
                                    {fabric.is_premium && (
                                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                        Premium
                                      </Badge>
                                    )}
                                    {fabric.is_sustainable && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                        Eco
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm sm:text-base">${fabric.estimated_price}</div>
                                    <div className="text-xs text-muted-foreground">${fabric.price_per_yard}/yd</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expandable Panel - Mobile Optimized */}
                            {selectedFabric?.fabric_id === fabric.fabric_id && (
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-3 sm:mb-4 pt-3 sm:pt-4">
                                  {[
                                    { label: "Sustainability", value: fabric.sustainability_score },
                                    { label: "Durability", value: fabric.durability_score },
                                    { label: "Comfort", value: fabric.comfort_score },
                                  ].map((metric) => (
                                    <div key={metric.label}>
                                      <div className="text-xs sm:text-sm font-medium mb-1">
                                        {Math.round(metric.value * 100)}%
                                      </div>
                                      <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                          className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                                          style={{ width: `${Math.round(metric.value * 100)}%` }}
                                        />
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Size Selector - Mobile Optimized */}
                                <div className="mb-3 sm:mb-4">
                                  <h5 className="font-medium mb-2 text-sm sm:text-base">Size</h5>
                                  <div className="flex gap-1.5 sm:gap-2">
                                    {["XS", "S", "M", "L", "XL"].map((size) => (
                                      <Button
                                        key={size}
                                        variant={selectedElement.selectedSize === size ? "default" : "outline"}
                                        className={`flex-1 transition-all duration-200 text-xs sm:text-sm py-1.5 sm:py-2 h-auto ${
                                          selectedElement.selectedSize === size ? "shadow-sm" : ""
                                        }`}
                                        onClick={() => {
                                          setSelectedElement((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  selectedSize: prev.selectedSize === size ? undefined : size,
                                                  manufacturingNote:
                                                    prev.selectedSize === size ? "" : prev.manufacturingNote || "",
                                                }
                                              : null,
                                          )
                                        }}
                                      >
                                        {size}
                                      </Button>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-center">
                                    <Button
                                      variant="link"
                                      className="text-xs text-muted-foreground h-auto p-0"
                                      onClick={() => setShowSizeGuide(true)}
                                    >
                                      Size guide
                                    </Button>
                                  </div>
                                </div>

                                {/* Manufacturing Note & Action Buttons - Mobile Optimized */}
                                {selectedElement.selectedSize && (
                                  <div className="animate-in slide-in-from-top-2 duration-200">
                                    <h5 className="font-medium mb-2 text-sm sm:text-base">Manufacturing Note</h5>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                                      Add any personalization requests (optional)
                                    </p>

                                    <textarea
                                      className="w-full p-2 sm:p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
                                      rows={3}
                                      placeholder="e.g., Make sleeves slightly longer, add pocket on left side, adjust neckline..."
                                      value={selectedElement.manufacturingNote || ""}
                                      onChange={(e) => {
                                        setSelectedElement((prev) =>
                                          prev ? { ...prev, manufacturingNote: e.target.value } : null,
                                        )
                                      }}
                                      maxLength={400}
                                    />

                                    <div className="flex justify-between items-center mt-2 gap-2">
                                      <p className="text-xs text-muted-foreground flex-1">
                                        Keep changes minimal - the generated image will be used as reference
                                      </p>
                                      <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {(selectedElement.manufacturingNote || "").length}/400
                                      </span>
                                    </div>

                                    {/* Quantity Selector - Mobile Optimized */}
                                    <div className="mb-3 sm:mb-4 mt-3 sm:mt-4">
                                      <h5 className="font-medium mb-2 text-sm sm:text-base">Quantity</h5>
                                      <div className="flex items-center gap-3 justify-center">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                          disabled={quantity <= 1}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="min-w-[3rem] text-center font-medium text-sm sm:text-base">
                                          {quantity}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setQuantity(quantity + 1)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Expected Delivery Time - Mobile Optimized */}
                                    <div className="mb-3 sm:mb-4 mt-3 sm:mt-4">
                                      <h5 className="font-medium mb-2 text-sm sm:text-base">Expected Delivery</h5>
                                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium">Total Time</span>
                                          <span className="text-lg font-bold text-primary">
                                            {estimatedDeliveryDays} days
                                          </span>
                                        </div>

                                        {selectedElement && (
                                          <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex justify-between">
                                              <span>Custom manufacturing</span>
                                              <span>
                                                {
                                                  calculateDeliveryTime(
                                                    selectedElement,
                                                    selectedFabric,
                                                    quantity,
                                                    deliveryLocation,
                                                  ).manufacturing
                                                }{" "}
                                                days
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Shipping & handling</span>
                                              <span>
                                                {
                                                  calculateDeliveryTime(
                                                    selectedElement,
                                                    selectedFabric,
                                                    quantity,
                                                    deliveryLocation,
                                                  ).shipping
                                                }{" "}
                                                days
                                              </span>
                                            </div>
                                            {selectedElement.manufacturingNote &&
                                              selectedElement.manufacturingNote.length > 50 && (
                                                <div className="flex justify-between text-amber-600">
                                                  <span>Custom modifications</span>
                                                  <span>+2 days</span>
                                                </div>
                                              )}
                                            {quantity > 1 && (
                                              <div className="flex justify-between text-blue-600">
                                                <span>Multiple items</span>
                                                <span>+{Math.min(Math.floor(quantity / 2), 5)} days</span>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-3 pt-2 border-t border-border/50">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium">Shipping Location</span>
                                          </div>
                                          <div className="flex gap-1.5">
                                            {[
                                              { value: "express", label: "Express", days: "+2 days" },
                                              { value: "domestic", label: "Standard", days: "+3 days" },
                                              { value: "international", label: "International", days: "+7 days" },
                                            ].map((option) => (
                                              <Button
                                                key={option.value}
                                                variant={deliveryLocation === option.value ? "default" : "outline"}
                                                className="flex-1 text-xs py-1.5 h-auto flex flex-col gap-0.5"
                                                onClick={() => setDeliveryLocation(option.value)}
                                              >
                                                <span>{option.label}</span>
                                                <span className="text-xs opacity-70">{option.days}</span>
                                              </Button>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-border/50">
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Info className="h-3 w-3" />
                                            <span>
                                              Estimated delivery:{" "}
                                              {new Date(
                                                Date.now() + estimatedDeliveryDays * 24 * 60 * 60 * 1000,
                                              ).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-3 sm:pt-4 border-t border-border/50 mt-3 sm:mt-4">
                                      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-3">
                                        <div className="flex-1 min-w-0">
                                          <h6 className="font-medium text-sm sm:text-base">Ready to order</h6>
                                          <p className="text-xs sm:text-sm text-muted-foreground">
                                            Size {selectedElement.selectedSize}
                                            {selectedElement.manufacturingNote && " • Custom notes added"}
                                          </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <div className="text-lg sm:text-xl font-bold">${fabric.estimated_price}</div>
                                          <div className="text-xs text-muted-foreground">Final price</div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                        <Button
                                          onClick={() => handleAddItemToCart(selectedElement)}
                                          className="flex-1 text-sm py-2.5"
                                          size="sm"
                                        >
                                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                          Add to Cart
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleAddItemToWishlist(selectedElement)}
                                          className="flex-1 text-sm py-2.5"
                                          size="sm"
                                        >
                                          Buy Now
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <div className="text-center">
                          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs sm:text-sm text-muted-foreground">Loading fabric options...</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-muted-foreground">
                    <Info className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium mb-2">No item selected</p>
                    <p className="text-xs sm:text-sm">Click on a clothing item in the design to view its details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {detectedItems.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">How to Use</h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>• Hover over any clothing item to highlight it</li>
                  <li>• Click on an item to view its details and pricing</li>
                  <li>• Choose from available fabric options</li>
                  <li>• Add individual items or the full outfit to your cart</li>
                  <li>• Save items or the full outfit to your wishlist</li>
                </ul>
              </div>
            )}
            <SizeGuide
              isOpen={showSizeGuide}
              onClose={() => setShowSizeGuide(false)}
              clothingType={selectedElement?.category || selectedElement?.type || "shirt"}
              selectedSize={selectedElement?.selectedSize}
              onSizeSelect={(size) => {
                setSelectedElement((prev) => (prev ? { ...prev, selectedSize: size } : null))
                setShowSizeGuide(false)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
