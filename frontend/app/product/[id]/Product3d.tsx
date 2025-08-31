"use client"

import React from "react"
import { useRef, useState, useEffect } from "react"

import type { User } from "@/types.ts"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, Environment, PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useCart } from "@/app/context/CartContext"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Truck,
  ShoppingBag,
  Shield,
  User2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { authService } from "@/lib/api-auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type * as THREE from "three"
import SlidingCart from "@/components/sliding-cart"
import type { Product } from "@/lib/ProductApi"

// Define user type
type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

// 3D Model Component
function TShirt({
  mousePosition,
  selectedColor,
  modelUrl,
}: { mousePosition: { x: number; y: number }; selectedColor: string; modelUrl: string }) {
  const meshRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(modelUrl)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = (mousePosition.x - 0.5) * Math.PI * 0.5
      meshRef.current.rotation.x = (mousePosition.y - 0.5) * Math.PI * 0.2
    }
  })

  return (
    <group ref={meshRef} scale={[0.6, 0.6, 0.6]} position={[0, -0.5, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// Mouse tracker component
function MouseTracker({ onMouseMove }: { onMouseMove: (position: { x: number; y: number }) => void }) {
  const { size } = useThree()

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth
      const y = event.clientY / window.innerHeight
      onMouseMove({ x, y })
    }

    // Add mouse event listener to the entire window
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [onMouseMove])

  return (
    <mesh position={[0, 0, -10]} visible={false}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

interface Props {
  product: Product
}

export default function Product3d({ product }: Props) {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const pathname = usePathname()
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [selectedColor, setSelectedColor] = useState("black")
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedFabric, setSelectedFabric] = useState("cotton")
  const [quantity, setQuantity] = useState(1)
  const [leftColumnHovered, setLeftColumnHovered] = useState(false)
  const [rightColumnHovered, setRightColumnHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const { cartItems, addToCart, loading: cartLoading } = useCart()
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Slide system - 0 is always 3D view, 1+ are images/videos
  const [currentSlide, setCurrentSlide] = useState(0)

  // Preload images state
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Add this state near the other useState declarations
  const [threeDModelError, setThreeDModelError] = useState(false)

  // Get 3D model URL from media table (for the Canvas)
  const threeDModelUrl = React.useMemo(() => {
    // First try to find 3D model in media
    const threeDMedia = product.media?.find((media) => media.media_type === "3d")
    if (threeDMedia) {
      return threeDMedia.media_url.startsWith("http") ? threeDMedia.media_url : `${threeDMedia.media_url}`
    }

    // Fallback to image_url if it's a .glb file
    if (product.image_url && product.image_url.endsWith(".glb")) {
      return product.image_url.startsWith("http") ? product.image_url : `${product.image_url}`
    }

    // Default fallback 3D model
    return "/assets/3d/duck.glb"
  }, [product.media, product.image_url])

  // Create product images array from backend media data - enhanced version
  const productImages = React.useMemo(() => {
    const images: string[] = []

    // Helper function to handle both absolute URLs and relative paths from Django
    const getImageUrl = (url: string) => {
      if (!url) return "/placeholder.svg?height=600&width=600"
      if (url.startsWith("http")) return url
      if (url.startsWith("/")) return url
      return `/${url}`
    }

    // Add primary image first
    const primaryMedia = product.media?.find((media) => media.is_primary && media.media_type === "image")
    if (primaryMedia) {
      images.push(getImageUrl(primaryMedia.media_url))
    }

    // Add other media images (excluding primary to avoid duplicates)
    product.media?.forEach((media) => {
      if (media.media_type === "image" && !media.is_primary) {
        images.push(getImageUrl(media.media_url))
      }
    })

    // Add videos from media table
    product.media?.forEach((media) => {
      if (media.media_type === "video") {
        images.push(getImageUrl(media.media_url))
      }
    })

    // Only use image_url as fallback if no media images are available
    if (images.length === 0 && product.image_url && !product.image_url.endsWith(".glb")) {
      images.push(getImageUrl(product.image_url))
    }

    // If still no images, add a placeholder
    if (images.length === 0) {
      images.push("/placeholder.svg?height=600&width=600")
    }

    return images
  }, [product.media, product.image_url])

  // Total slides = 1 (3D view) + number of images
  const totalSlides = 1 + productImages.length

  // Preload all images on component mount
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = productImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous" // Avoid CORS issues
          img.onload = resolve
          img.onerror = () => {
            // If image fails to load, resolve anyway to not block the loading
            console.warn(`Failed to preload image: ${src}`)
            resolve(src)
          }
          img.src = src
        })
      })

      try {
        await Promise.all(imagePromises)
        setImagesLoaded(true)
      } catch (error) {
        console.error("Error preloading images:", error)
        setImagesLoaded(true) // Set to true anyway to not block the UI
      }
    }

    if (productImages.length > 0) {
      preloadImages()
    } else {
      setImagesLoaded(true)
    }
  }, [productImages])

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isCartOpen])

  const navigateToProfile = () => {
    router.push("/profile")
  }

  const navigateToHistory = () => {
    router.push("/history")
  }

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const userData: User = await authService.getProfile()

      const formattedUser: UserType = {
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username || "No Name",
        isLoggedIn: true,
      }

      setUser(formattedUser)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()

      // Clear user state immediately
      setUser(null)

      // Optionally redirect or refresh the current route without reload
      router.replace(pathname)

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Logout error",
        description: "Something went wrong while logging out.",
        duration: 3000,
      })
    }
  }

  const colors = [
    { name: "black", label: "Midnight Black", color: "#1a1a1a" },
    { name: "white", label: "Pure White", color: "#f5f5f5" },
    { name: "navy", label: "Navy Blue", color: "#1e3a8a" },
    { name: "gray", label: "Stone Gray", color: "#6b7280" },
  ]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const fabrics = [
    { name: "cotton", label: "100% Organic Cotton", price: 0 },
    { name: "bamboo", label: "Bamboo Blend", price: 15 },
    { name: "hemp", label: "Hemp Cotton", price: 20 },
    { name: "modal", label: "Modal Silk", price: 25 },
  ]

  // Use product data from Django API
  const basePrice = product.base_price
  const fabricPrice = fabrics.find((f) => f.name === selectedFabric)?.price || 0
  const totalPrice = basePrice + fabricPrice

  const handleAddToCart = async () => {
    if (!product?.id) {
      toast({
        title: "Error",
        description: "Product information is missing",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setAddingToCart(true)

    try {
      // Find matching variant based on selected options
      const matchingVariant = product.variants?.find(
        (variant) => variant.size === selectedSize && (variant.color === selectedColor || !variant.color),
      )

      await addToCart(product.id, matchingVariant?.id, quantity)

      toast({
        title: "Added to Cart!",
        description: `${quantity}x ${product.name} in ${colors.find((c) => c.name === selectedColor)?.label}, Size ${selectedSize}`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted ? "Item removed from your wishlist" : "Item saved to your wishlist",
      duration: 2000,
    })
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  const getCurrentImageIndex = () => currentSlide - 1
  const showPrev = () => setCurrentSlide((prev) => Math.max(0, prev - 1))
  const showNext = () => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-orange-900/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-white hover:text-orange-500" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold tracking-wider transition-opacity font-creepster duration-500 pl-10"
            style={{
              fontFamily: "'October Crow', cursive",
              letterSpacing: "0.2em",
            }}
          >
            DXRKICE
          </Link>
          <div className="flex items-center gap-2 pr-10">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            {user && (
              // Authenticated user - show cart and profile
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsCartOpen(true)}
                  className="relative hover:bg-orange-500/20 transition-colors duration-200"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-black text-xs">
                    {itemCount}
                  </Badge>
                  <span className="sr-only">Shopping cart</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-full hover:bg-orange-500/10 transition-all duration-300 group"
                    >
                      <User2 className="h-5 w-5 group-hover:text-orange-400 transition-colors" />
                      {/* Notification dot - only show if there are notifications */}
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-orange-500 border-2 border-black rounded-full"></div>
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-black/95 backdrop-blur-sm border border-orange-500/30 shadow-2xl shadow-orange-500/10"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault()
                    }}
                    sideOffset={8}
                  >
                    <div className="px-4 py-3 border-b border-orange-500/20">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <DropdownMenuItem
                        onClick={navigateToProfile}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <User2 className="mr-3 h-4 w-4 text-orange-500" />
                        Profile Settings
                      </DropdownMenuItem>

                      <DropdownMenuItem className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer">
                        <Bell className="mr-3 h-4 w-4 text-orange-500" />
                        Notifications
                        <Badge className="ml-auto bg-orange-500 text-black text-xs">3</Badge>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={navigateToHistory}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <ShoppingBag className="mr-3 h-4 w-4 text-orange-500" />
                        Order History
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={navigateToProfile}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <ShoppingBag className="mr-3 h-4 w-4 text-orange-500" />
                        My Orders
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={navigateToProfile}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <Heart className="mr-3 h-4 w-4 text-orange-500" />
                        Wishlist
                      </DropdownMenuItem>
                    </div>

                    <div className="border-t border-orange-500/20 py-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sliding Cart Component */}
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <div className="pt-16">
        {/* Background 3D Canvas - Only show when on slide 0 (3D view) */}
        {currentSlide === 0 && (
          <div className="fixed inset-0 top-16 z-0">
            {threeDModelUrl && !threeDModelError ? (
              <Canvas className="pointer-events-none">
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="studio" />
                <TShirt mousePosition={mousePosition} selectedColor={selectedColor} modelUrl={threeDModelUrl} />
                <MouseTracker onMouseMove={setMousePosition} />
              </Canvas>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold mb-2">3D Model Not Available</h3>
                  <p className="text-gray-400">This product doesn't have a 3D model yet.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="relative z-10 grid grid-cols-12 min-h-screen">
          {/* Left Column - Product Details */}
          <div
            className={`col-span-3 p-8 pt-0 min-h-screen transition-all duration-500 ease-in-out ${
              rightColumnHovered ? "opacity-30 blur-sm" : "opacity-100 blur-0"
            }`}
            onMouseEnter={() => setLeftColumnHovered(true)}
            onMouseLeave={() => setLeftColumnHovered(false)}
          >
            <div className="space-y-6 max-w-sm">
              <div className="pt-8">
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 mb-4">{product.category}</Badge>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-400 text-lg">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.average_rating || 4) ? "fill-orange-500 text-orange-500" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">({product.review_count || 127} reviews)</span>
              </div>

              <div className="text-4xl font-bold text-orange-500">
                ${Number(totalPrice).toFixed(2)}
                {fabricPrice > 0 && (
                  <span className="text-lg text-gray-400 ml-2">
                    (+${fabricPrice} for {fabrics.find((f) => f.name === selectedFabric)?.label})
                  </span>
                )}
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Premium quality materials</li>
                  <li>• Sustainable and ethically made</li>
                  <li>• Perfect fit and comfort</li>
                  <li>• Durable construction</li>
                  <li>• Easy care instructions</li>
                  {product.fabric && <li>• Made with {product.fabric}</li>}
                  {product.color && <li>• Available in {product.color}</li>}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Care Instructions</h3>
                <p className="text-gray-400 text-sm">
                  Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Free shipping over $75
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  30-day returns
                </div>
              </div>

              {/* Product Info */}
              {product.created_by_name && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400">
                    Created by: <span className="text-orange-400">{product.created_by_name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Interactive Overlay */}
          <div className="col-span-6"></div>
          <div className="fixed left-1/4 right-1/4 top-16 bottom-0 z-10">
            {/* Content based on current slide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Image display for slides 1+ */}
                {currentSlide > 0 && productImages.length > 0 && (
                  <div className="relative bottom-12 w-full max-w-lg">
                    {!imagesLoaded ? (
                      <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-gray-400">Loading images...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Find corresponding media data for this image */}
                        {(() => {
                          const currentImageUrl = productImages[getCurrentImageIndex()]
                          const mediaData = product.media?.find((media) => {
                            const mediaUrl = media.media_url.startsWith("http")
                              ? media.media_url
                              : `/${media.media_url}`
                            return mediaUrl === currentImageUrl
                          })

                          // Handle different media types
                          if (mediaData?.media_type === "video") {
                            return (
                              <div className="relative">
                                <video
                                  className="w-full h-auto max-h-96 rounded-lg shadow-lg object-contain mx-auto"
                                  controls
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                >
                                  <source src={currentImageUrl} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-blue-500/80 text-white text-xs px-2 py-1">VIDEO</Badge>
                                </div>
                              </div>
                            )
                          } else if (mediaData?.media_type === "3d") {
                            return (
                              <div className="relative">
                                <img
                                  src={currentImageUrl || "/placeholder.svg?height=400&width=400"}
                                  alt={`3D model preview ${getCurrentImageIndex() + 1}`}
                                  className="w-full h-auto max-h-96 rounded-lg shadow-lg object-contain mx-auto"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                                  }}
                                />
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-purple-500/80 text-white text-xs px-2 py-1">3D MODEL</Badge>
                                </div>
                              </div>
                            )
                          } else {
                            return (
                              <div className="relative">
                                <img
                                  src={currentImageUrl || "/placeholder.svg?height=400&width=400"}
                                  alt={`Product image ${getCurrentImageIndex() + 1}`}
                                  className="w-full h-auto max-h-96 rounded-lg shadow-lg object-contain mx-auto"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                                  }}
                                />
                                {mediaData?.is_primary && (
                                  <div className="absolute top-2 right-2">
                                    <Badge className="bg-orange-500/80 text-white text-xs px-2 py-1">★ PRIMARY</Badge>
                                  </div>
                                )}
                              </div>
                            )
                          }
                        })()}
                      </>
                    )}
                  </div>
                )}

                {/* Navigation Arrows - Always visible */}
                <button
                  onClick={showPrev}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={showNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Enhanced slide indicator dots */}
                <div className="absolute bottom-[15vh] left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-30 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                  {Array.from({ length: totalSlides }).map((_, index) => {
                    // Get media info for this slide
                    let slideLabel = "3D View"

                    if (index === 0) {
                      // Check if we actually have a 3D model
                      const hasThreeDModel =
                        product.media?.some((media) => media.media_type === "3d") ||
                        (product.image_url && product.image_url.endsWith(".glb"))
                      slideLabel = hasThreeDModel ? "3D View" : "Product View"
                    } else {
                      const imageIndex = index - 1
                      const currentImageUrl = productImages[imageIndex]
                      const mediaData = product.media?.find((media) => {
                        const mediaUrl = media.media_url.startsWith("http") ? media.media_url : `/${media.media_url}`
                        return mediaUrl === currentImageUrl
                      })

                      if (mediaData?.media_type === "video") {
                        slideLabel = `Video ${imageIndex + 1}`
                      } else if (mediaData?.is_primary) {
                        slideLabel = `Primary Image`
                      } else {
                        slideLabel = `Image ${imageIndex + 1}`
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          index === currentSlide ? "bg-orange-500 scale-125" : "bg-white/50 hover:bg-white/80"
                        }`}
                        title={slideLabel}
                      >
                        <span className="sr-only">{slideLabel}</span>
                      </button>
                    )
                  })}

                  {/* Slide counter */}
                  <div className="ml-2 text-white/80 text-xs font-medium">
                    {currentSlide + 1} / {totalSlides}
                  </div>
                </div>

                {/* Floating Action Buttons - Fixed position at the bottom center */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
                  <Button
                    onClick={handleWishlist}
                    size="icon"
                    className={`w-14 h-14 rounded-full transition-all duration-300 cursor-pointer ${
                      isWishlisted
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    size="icon"
                    className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-black transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {addingToCart ? (
                      <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart className="w-7 h-7" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customization */}
          <div
            className={`col-span-3 p-8 transition-all duration-500 ease-in-out ${
              leftColumnHovered ? "opacity-30 blur-sm" : "opacity-100 blur-0"
            }`}
            onMouseEnter={() => setRightColumnHovered(true)}
            onMouseLeave={() => setRightColumnHovered(false)}
          >
            <div className="space-y-8 sticky top-24">
              {/* Color Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Color</h3>
                <div className="grid grid-cols-2 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedColor === color.name
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-600"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm">{color.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedSize === size
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <Button variant="link" className="text-orange-500 p-0 h-auto text-sm">
                  Size Guide
                </Button>
              </div>

              {/* Fabric Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fabric</h3>
                <div className="space-y-2">
                  {fabrics.map((fabric) => (
                    <button
                      key={fabric.name}
                      onClick={() => setSelectedFabric(fabric.name)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                        selectedFabric === fabric.name
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{fabric.label}</span>
                        {fabric.price > 0 && <span className="text-sm text-orange-500">+${fabric.price}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-gray-700"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-gray-700"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {addingToCart ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </div>
                  ) : (
                    `Add to Cart - $${(totalPrice * quantity).toFixed(2)}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-current" : ""}`} />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
              </div>

              {/* Summary */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Color:</span>
                      <span>{colors.find((c) => c.name === selectedColor)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span>{selectedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fabric:</span>
                      <span>{fabrics.find((f) => f.name === selectedFabric)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                    <Separator className="bg-gray-700 my-2" />
                    <div className="flex justify-between font-semibold text-orange-500">
                      <span>Total:</span>
                      <span>${(totalPrice * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
