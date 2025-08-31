"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authService } from "@/lib/api-auth"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import SlidingCart from "@/components/sliding-cart"
import type { User } from "@/types"
import Link from "next/link"
import {
  Bell,
    Eye,
  Heart,
  Share2,
  Star,
  Plus,
  LogOut,
  Minus,
  ShoppingBag,
  User2,
  Ruler,
  MessageCircle,
  Zap,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"

import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/ProductApi"

const colors = [
  { name: "Midnight Black", value: "#000000", available: true },
  { name: "Storm Gray", value: "#6B7280", available: true },
  { name: "Crimson Red", value: "#DC2626", available: false },
  { name: "Ocean Blue", value: "#2563EB", available: true },
  { name: "Forest Green", value: "#059669", available: true },
]

type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

const sizes = [
  { name: "XS", available: true, stock: 3 },
  { name: "S", available: true, stock: 8 },
  { name: "M", available: true, stock: 12 },
  { name: "L", available: true, stock: 5 },
  { name: "XL", available: true, stock: 2 },
  { name: "XXL", available: false, stock: 0 },
]

const reviews = [
  {
    id: 1,
    name: "Alex Chen",
    rating: 5,
    comment: "Absolutely love this piece! The quality is exceptional and the fit is perfect.",
    date: "2024-01-15",
    verified: true,
    helpful: 24,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    rating: 4,
    comment: "Great quality and style. Runs slightly large, so consider sizing down.",
    date: "2024-01-10",
    verified: true,
    helpful: 18,
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    rating: 5,
    comment: "This is my third purchase from DXRKICE. Never disappoints!",
    date: "2024-01-08",
    verified: true,
    helpful: 31,
  },
]

const relatedProducts = [
  {
    id: 1,
    name: "Urban Hoodie",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Street Joggers",
    price: 69.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Minimal Tee",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Denim Jacket",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
  },
]

interface Props {
  product: Product
}

export default function ProductNormal({ product }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [selectedSize, setSelectedSize] = useState(sizes[2])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const { cartItems, addToCart, loading: cartLoading } = useCart()
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const imageRef = useRef<HTMLDivElement>(null)

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

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {}

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const navigateToProfile = () => {
    router.push("/profile")
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
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

  // Handle both absolute URLs and relative paths from Django
  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg?height=600&width=600"
    if (url.startsWith("http")) return url
    if (url.startsWith("/")) return url
    return `/${url}`
  }

  // Create product images array from backend media data - enhanced for normal products
  const productImages = React.useMemo(() => {
    const images: string[] = []

    // Add primary image first
    const primaryMedia = product.media?.find((media) => media.is_primary && media.media_type === "image")
    if (primaryMedia) {
      images.push(getImageUrl(primaryMedia.media_url))
    }

    // Add other media images (excluding primary to avoid duplicates, and excluding 3D models)
    product.media?.forEach((media) => {
      if (media.media_type === "image" && !media.is_primary) {
        images.push(getImageUrl(media.media_url))
      }
    })

    // Add videos from media table (they can be displayed as thumbnails with play button)
    product.media?.forEach((media) => {
      if (media.media_type === "video") {
        images.push(getImageUrl(media.media_url))
      }
    })

    // Only use image_url as fallback if no media images are available AND it's not a 3D model file
    if (images.length === 0 && product.image_url && !product.image_url.endsWith(".glb")) {
      images.push(getImageUrl(product.image_url))
    }

    // If still no images, add a placeholder
    if (images.length === 0) {
      images.push("/placeholder.svg?height=600&width=600")
    }

    return images
  }, [product.media, product.image_url])

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
      const matchingVariant = product.variants?.find((variant) => {
        const sizeName = typeof variant.size === "string" ? variant.size : (variant.size as { name: string }).name

        return sizeName === selectedSize.name && (variant.color === selectedColor.name || !variant.color)
      })

      await addToCart(product.id, matchingVariant?.id, quantity)

      toast({
        title: "Added to Cart!",
        description: `${quantity}x ${product.name} in ${colors.find((c) => c.name === selectedColor.name)?.name}, Size ${selectedSize}`,
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

  const navigateToHistory = () => {
    router.push("/history")
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted ? "Item removed from your wishlist" : "Item saved to your wishlist",
      duration: 2000,
    })
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

  const averageRating = product.average_rating || 4.5

  // Make sure selectedImage is within bounds when images change
  useEffect(() => {
    if (selectedImage >= productImages.length) {
      setSelectedImage(0)
    }
  }, [productImages, selectedImage])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-orange-900/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
          <nav className="hidden md:flex gap-6">
            <Link href="#NewArrival" className="text-sm font-medium hover:underline underline-offset-4">
              New Arrivals
            </Link>
            <Link href="#Collection" className="text-sm font-medium hover:underline underline-offset-4">
              Collection
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Trending
            </Link>
            <Link href="how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-2 pr-10">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            {user && (
              // Authenticated user - show cart and profile
              <>
                {/* <CartButton></CartButton> */}
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
      </motion.header>
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="container mx-auto px-4 pt-24 pb-8 py-8">
        {/* 3-Column Layout */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Left Column - Product Details */}
          <motion.div
            className="lg:col-span-4 space-y-6"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <motion.div
                className="flex items-center gap-2 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">{product.category}</Badge>
                {product.fabric && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/40">{product.fabric}</Badge>
                )}
              </motion.div>

              <motion.h1
                className="text-3xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {product.name}
              </motion.h1>

              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          i < Math.floor(averageRating) ? "fill-orange-500 text-orange-500" : "text-gray-600"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm text-gray-400 ml-2">
                  {averageRating.toFixed(1)} ({product.review_count || 0} reviews)
                </span>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="text-3xl font-bold text-orange-500">${Number(product.base_price).toFixed(2)}</span>
                {product.base_price > 100 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${(product.base_price * 1.25).toFixed(2)}
                    </span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/40">20% OFF</Badge>
                  </>
                )}
              </motion.div>

              <motion.p
                className="text-gray-300 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                {product.description}
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              className="grid grid-cols-1 gap-4 pt-6 border-t border-gray-800"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              {[
                { icon: Shield, title: "2-Year Warranty", desc: "Quality guaranteed" },
                { icon: Truck, title: "Free Shipping", desc: "Orders over $100" },
                { icon: RefreshCw, title: "Easy Returns", desc: "30-day policy" },
                { icon: MessageCircle, title: "24/7 Support", desc: "Always here to help" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02, x: 5 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.9 + index * 0.1 }}
                >
                  <motion.div
                    className="p-2 rounded-lg bg-orange-500/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-5 w-5 text-orange-400" />
                  </motion.div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-gray-400">{feature.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Center Column - Product Images */}
          <motion.div
            className="lg:col-span-4 space-y-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <motion.div
                ref={imageRef}
                className="relative aspect-square overflow-hidden rounded-2xl bg-black cursor-crosshair"
                style={{
                  transformStyle: "preserve-3d",
                }}
                animate={cartAnimation ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const currentImageUrl = productImages[selectedImage]
                    const mediaData = product.media?.find((media) => getImageUrl(media.media_url) === currentImageUrl)

                    // Handle video media type
                    if (mediaData?.media_type === "video") {
                      return (
                        <video
                          className="w-full h-full object-cover"
                          controls
                          autoPlay={false}
                          loop
                          muted={true}
                          playsInline
                        >
                          <source src={currentImageUrl} type="video/mp4" />
                        </video>
                      )
                    }

                    // Default image display
                    return (
                      <Image
                        src={currentImageUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=600&width=600"
                        }}
                      />
                    )
                  })()}
                </motion.div>
                {/* Overlay Controls */}
                <motion.div
                  className="absolute top-4 right-4 flex flex-col gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 backdrop-blur">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-black border-orange-500/30">
                      <Image
                        src={productImages[selectedImage] || "/placeholder.svg"}
                        alt="Product Image Fullscreen"
                        width={800}
                        height={800}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </motion.div>
              </motion.div>
            </div>

            {/* Thumbnail Gallery */}
            <motion.div
              className="flex gap-2 overflow-x-auto pb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {productImages.map((image, index) => {
                // Find corresponding media data for this image
                const mediaData = product.media?.find((media) => getImageUrl(media.media_url) === image)

                return (
                  <motion.button
                    key={index}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-orange-500 ring-2 ring-orange-500/30"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedImage(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />

                    {/* Media type indicators */}
                    {mediaData?.media_type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        {/* <Play className="h-4 w-4 text-white" /> */}
                      </div>
                    )}
                    {mediaData?.is_primary && (
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-orange-500/80 text-white text-xs px-1 py-0">★</Badge>
                      </div>
                    )}

                    {/* Placeholder indicator */}
                    {image.includes("placeholder.svg") && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        {/* <Camera className="h-4 w-4 text-gray-400" /> */}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Right Column - Actions & Selection */}
          <motion.div
            className="lg:col-span-4 space-y-6"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Color Selection */}
            <motion.div
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Color: {selectedColor.name}</h3>
                <span className="text-sm text-gray-400">
                  {colors.filter((c) => c.available).length} colors available
                </span>
              </div>
              <div className="flex gap-3">
                {colors.map((color, index) => (
                  <motion.button
                    key={color.name}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name
                        ? "border-orange-500 ring-2 ring-orange-500/30"
                        : "border-gray-600 hover:border-gray-400"
                    } ${!color.available ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => color.available && setSelectedColor(color)}
                    disabled={!color.available}
                    whileHover={color.available ? { scale: 1.1, rotate: 5 } : {}}
                    whileTap={color.available ? { scale: 0.95 } : {}}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                  >
                    {selectedColor.name === color.name && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                    {!color.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-0.5 bg-gray-400 rotate-45" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Size Selection */}
            <motion.div
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Size: {selectedSize.name}</h3>
                <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                  <Ruler className="mr-1 h-4 w-4" />
                  Size Guide
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size, index) => (
                  <motion.button
                    key={size.name}
                    className={`relative p-3 rounded-lg border transition-all ${
                      selectedSize.name === size.name
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : size.available
                          ? "border-gray-600 hover:border-gray-400"
                          : "border-gray-700 opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => size.available && setSelectedSize(size)}
                    disabled={!size.available}
                    whileHover={size.available ? { scale: 1.05 } : {}}
                    whileTap={size.available ? { scale: 0.95 } : {}}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                  >
                    <div className="text-center">
                      <div className="font-medium">{size.name}</div>
                      {size.available && size.stock <= 5 && (
                        <motion.div
                          className="text-xs text-orange-400 mt-1"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          Only {size.stock} left
                        </motion.div>
                      )}
                    </div>
                    {!size.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-gray-400 rotate-45" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Quantity */}
            <motion.div
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <h3 className="font-medium">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-600 rounded-lg">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.span
                    className="w-12 text-center font-medium"
                    key={quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {quantity}
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
                <span className="text-sm text-gray-400">{selectedSize.stock} in stock</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              <div className="flex gap-3">
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-medium h-12"
                    onClick={handleAddToCart}
                  >
                    <motion.div className="flex items-center gap-2" animate={cartAnimation ? { x: [0, 10, 0] } : {}}>
                      <ShoppingBag className="h-5 w-5" />
                      Add to Cart - ${(product.base_price * quantity).toFixed(2)}
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="icon"
                    variant="outline"
                    className={`h-12 w-12 border-gray-600 ${
                      isWishlisted ? "text-red-500 border-red-500" : "hover:text-red-500"
                    }`}
                    onClick={handleWishlist}
                  >
                    <motion.div animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                      <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="icon" variant="outline" className="h-12 w-12 border-gray-600 hover:text-orange-400">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black h-12"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Buy Now - Express Checkout
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
