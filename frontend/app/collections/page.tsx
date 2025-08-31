"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { fetchAllProducts, type Product } from "@/lib/ProductApi"
import { authService } from "@/lib/api-auth"
import type { User } from "@/types"
import Link from "next/link"
import SlidingCart from "@/components/sliding-cart"

import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {
  Bell,
  Search,
  Grid3X3,
  List,
  Heart,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  User2,
  Star,
  SlidersHorizontal,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

// Extended product type for UI compatibility
interface UIProduct extends Product {
  numericId: number
  originalPrice: number
  image: string
  colors: string[]
  sizes: string[]
  rating: number
  reviews: number
  isNew: boolean
  onSale: boolean
  price: number
  subcategory: string
}

// Map backend categories to display names
const categoryMap = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  hoodie: "Hoodies",
  jacket: "Jackets",
  pant: "Pants",
}

const colorMap = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#6B7280",
  grey: "#6B7280",
  navy: "#1E3A8A",
  blue: "#3B82F6",
  beige: "#F5F5DC",
  khaki: "#C3B091",
  olive: "#808000",
  pink: "#EC4899",
  green: "#10B981",
  cream: "#FFFDD0",
  red: "#EF4444",
  charcoal: "#374151",
  sage: "#9CA3AF",
  brown: "#92400E",
  indigo: "#4F46E5",
  natural: "#F5F5DC",
  heather: "#9CA3AF",
  military: "#556B2F",
}

// Function to get image URL with enhanced logic - fixed for direct product access
const getImageUrl = (product: Product): string => {
  // First, try to find primary image or video in media table
  const primaryMedia = product.media?.find(
    (media: any) => media.is_primary && (media.media_type === "image" || media.media_type === "video"),
  )

  if (primaryMedia) {
    const mediaUrl = primaryMedia.media_url
    if (mediaUrl.startsWith("http")) return mediaUrl
    if (mediaUrl.startsWith("/")) return mediaUrl
    return `/${mediaUrl}`
  }

  // If no primary media, use the first available image/video
  const firstMedia = product.media?.find((media: any) => media.media_type === "image" || media.media_type === "video")

  if (firstMedia) {
    const mediaUrl = firstMedia.media_url
    if (mediaUrl.startsWith("http")) return mediaUrl
    if (mediaUrl.startsWith("/")) return mediaUrl
    return `/${mediaUrl}`
  }

  // Fallback to product image_url
  if (product.image_url) {
    if (product.image_url.startsWith("http")) return product.image_url
    if (product.image_url.startsWith("/")) return product.image_url
    return `/${product.image_url}`
  }

  // Final fallback to placeholder
  return "/placeholder.svg"
}

export default function AllProductsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [productsLoading, setProductsLoading] = useState<boolean>(true)
  const pathname = usePathname()
  const { cartItems, addToCart } = useCart()
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Product state
  const [allProducts, setAllProducts] = useState<UIProduct[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filter and UI state
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 400])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showOnSale, setShowOnSale] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])
  const { toast } = useToast()
  const [selectedColor, setSelectedColor] = useState("black")
      const [selectedSize, setSelectedSize] = useState("M")
      const [selectedFabric, setSelectedFabric] = useState("cotton")
      const [quantity, setQuantity] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const gridControls = useAnimationControls()
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({})

  // User state
  const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const normalizeColor = (color: string) => color.toLowerCase().replace(/[^a-z]/g, "") //remove spaces, punctuation, etc.

  const findClosestColor = (inputColor: string): string => {
    const normalizedInput = normalizeColor(inputColor)

    // Exact match first
    const exactMatch = Object.keys(colorMap).find((key) => normalizeColor(key) === normalizedInput)
    if (exactMatch) return exactMatch

    // Partial match
    const partialMatch = Object.keys(colorMap).find(
      (key) => normalizedInput.includes(normalizeColor(key)) || normalizeColor(key).includes(normalizedInput),
    )
    if (partialMatch) return partialMatch

    return "black" // fallback
  }

  // Fetch ALL products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true)
      setError(null)

      try {
        // Fetch ALL products without category filter
        const products = await fetchAllProducts()

        // Transform products to match expected format for UI and get images
        const transformedProducts = products.map((product) => {
          const closestColor = product.color ? findClosestColor(product.color) : "black"
          const imageUrl = getImageUrl(product) // Remove await here

          return {
            ...product,
            numericId: Number.parseInt(product.id.replace(/-/g, "").slice(0, 8), 16),
            originalPrice: product.base_price * 1.2,
            image: imageUrl,
            colors: [closestColor],
            sizes: ["S", "M", "L", "XL"],
            rating: product.average_rating || 4.5,
            reviews: product.review_count || 0,
            isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            onSale: Math.random() > 0.7,
            price: product.base_price,
            subcategory: product.category,
          }
        })

        setAllProducts(transformedProducts) // Remove await here too
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products")
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [toast])

  // Handle add to cart
  const handleAddToCart = async (product: UIProduct, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!product.id) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        variant: "destructive",
      })
      return
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }))

    try {
      // Use the first available variant or create a default one
      const selectedVariant = {
        id: `${product.id}-default`,
        size: "M", // Default size
        color: product.colors[0] || "black", // First available color
        price: product.base_price,
        stock: 10, // Assume stock is available
      }

      
      const matchingVariant = product.variants?.find(
        (variant) => variant.size === selectedSize && (variant.color === selectedColor || !variant.color),
      )

      await addToCart(product.id, matchingVariant?.id, quantity)


      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }))
    }
  }

  // Enhanced smooth animation when filters toggle
  useEffect(() => {
    const animateGrid = async () => {
      setIsAnimating(true)

      if (!showFilters) {
        await gridControls.start({
          width: "100%",
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 25,
            mass: 0.8,
            duration: 1.2,
          },
        })
      } else {
        await gridControls.start({
          width: "calc(100% - 88px)",
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 25,
            mass: 0.8,
            duration: 1.0,
          },
        })
      }

      setTimeout(() => setIsAnimating(false), 200)
    }

    animateGrid()
  }, [showFilters, gridControls])

  // Helper function for string similarity
  function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator)
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Filter products based on all filters
  const filteredProducts = useMemo(() => {
    let products = [...allProducts]

    // Enhanced search with fuzzy matching
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()

      const productsWithScore = products.map((product) => {
        let score = 0
        const name = product.name.toLowerCase()
        const category = product.category.toLowerCase()
        const fabric = product.fabric?.toLowerCase() || ""

        // Exact matches get highest score
        if (name.includes(query)) score += 100
        if (category.includes(query)) score += 80
        if (fabric.includes(query)) score += 60

        // Word-based matching
        const queryWords = query.split(" ").filter((word) => word.length > 0)
        const nameWords = name.split(" ")
        const allWords = [...nameWords, category, fabric]

        queryWords.forEach((queryWord) => {
          allWords.forEach((word) => {
            if (word.includes(queryWord)) {
              score += 50
            } else if (queryWord.length > 2) {
              const similarity = calculateSimilarity(queryWord, word)
              if (similarity > 0.6) score += Math.floor(similarity * 30)
            }
          })
        })

        if (name.startsWith(query)) score += 40

        const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i")
        if (wordBoundaryRegex.test(name)) score += 30

        return { ...product, searchScore: score }
      })

      products = productsWithScore
        .filter((product) => product.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore)
        .map(({ searchScore, ...product }) => product)
    }

    // Apply price filter
    products = products.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply color filter
    if (selectedColors.length > 0) {
      products = products.filter((product) => product.colors.some((color) => selectedColors.includes(color)))
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      products = products.filter((product) => product.sizes.some((size) => selectedSizes.includes(size)))
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      products = products.filter((product) => selectedCategories.includes(product.category))
    }

    // Apply sale filter
    if (showOnSale) {
      products = products.filter((product) => product.onSale)
    }

    // Apply new filter
    if (showNew) {
      products = products.filter((product) => product.isNew)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        products.sort((a, b) => b.price - a.price)
        break
      case "rating":
        products.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        // Featured - keep original order
        break
    }

    return products
  }, [
    allProducts,
    searchQuery,
    priceRange,
    selectedColors,
    selectedSizes,
    selectedCategories,
    showOnSale,
    showNew,
    sortBy,
  ])

  // Handle sorting animation
  useEffect(() => {
    setIsSorting(true)
    const timer = setTimeout(() => setIsSorting(false), 600)
    return () => clearTimeout(timer)
  }, [sortBy])

  // Search suggestions
  useEffect(() => {
    if (searchQuery && filteredProducts.length === 0) {
      const allTerms = allProducts.flatMap((product) => [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        product.fabric?.toLowerCase() || "",
        ...product.colors,
      ])

      const suggestions = allTerms
        .filter((term) => calculateSimilarity(searchQuery.toLowerCase(), term) > 0.4)
        .slice(0, 3)

      setSearchSuggestions(suggestions)
    } else {
      setSearchSuggestions([])
    }
  }, [searchQuery, filteredProducts.length, allProducts])

  // Get available colors from current products
  const availableColors = useMemo(() => {
    const colors = [...new Set(allProducts.flatMap((product) => product.colors))]
    return colors.filter((color) => color && colorMap[color as keyof typeof colorMap])
  }, [allProducts])

  // Get available categories from current products
  const availableCategories = useMemo(() => {
    const categories = [...new Set(allProducts.map((product) => product.category))]
    return categories.sort()
  }, [allProducts])

  const toggleWishlist = (productId: string) => {
    const numericId = Number.parseInt(productId.replace(/-/g, "").slice(0, 8), 16)
    setWishlist((prev) => (prev.includes(numericId) ? prev.filter((id) => id !== numericId) : [...prev, numericId]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 400])
    setSelectedColors([])
    setSelectedSizes([])
    setSelectedCategories([])
    setShowOnSale(false)
    setShowNew(false)
  }

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
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username || " ",
        isLoggedIn: true,
      }

      setUser(formattedUser)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
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

  useEffect(() => {
    fetchUserProfile()
  }, [])

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

  // Show loading state
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-orange-900/30">
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
          </div>
        </header>

        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-xl">Loading all products...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading products</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-orange-900/30">
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
      </header>
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Search and Controls Section */}
      <section className="sticky top-14 z-40 bg-black/95 backdrop-blur pt-2 border-b border-orange-900/30">
        <div className="container mx-auto px-4 pb-0 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:text-orange-500">
                ← Back
              </Button>
              <h1 className="text-3xl font-bold">All Products</h1>
              <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                {filteredProducts.length} items
              </Badge>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-left justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border border-gray-700 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none block md:hidden"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 relative top-10">
          {/* Filters Sidebar */}
          <AnimatePresence mode="wait">
            {showFilters && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1],
                  }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />

                {/* Filter Sidebar */}
                <motion.div
                  initial={{
                    x: -420,
                    opacity: 0,
                    scale: 0.92,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: -420,
                    opacity: 0,
                    scale: 0.92,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 28,
                    mass: 0.9,
                    duration: 1.0,
                  }}
                  className="w-80 z-50 lg:relative lg:z-auto"
                >
                  <div className="sticky top-8">
                    <Card className="group bg-gray-900/95 backdrop-blur-xl border-gray-800 shadow-2xl lg:bg-gray-900/50 lg:backdrop-blur-none lg:shadow-none">
                      <CardContent className="p-6">
                        <motion.div
                          className="flex items-center justify-between mb-6"
                          initial={{ y: -15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.15,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h3 className="text-lg font-semibold">Filters</h3>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                              Clear All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowFilters(false)}
                              className="lg:hidden"
                            >
                              ✕
                            </Button>
                          </div>
                        </motion.div>

                        {/* Categories */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.15,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Categories</h4>
                          <div className="space-y-2 grid grid-cols-2">
                            {availableCategories.map((category, index) => (
                              <motion.div
                                key={category}
                                className="flex items-center space-x-2"
                                initial={{ x: -25, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                  delay: 0.2 + index * 0.05,
                                  duration: 0.4,
                                  ease: [0.4, 0.0, 0.2, 1],
                                }}
                              >
                                <Checkbox
                                  id={`category-${category}`}
                                  checked={selectedCategories.includes(category)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCategories([...selectedCategories, category])
                                    } else {
                                      setSelectedCategories(selectedCategories.filter((c) => c !== category))
                                    }
                                  }}
                                />
                                <label htmlFor={`category-${category}`} className="text-sm capitalize">
                                  {categoryMap[category as keyof typeof categoryMap] || category}
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Price Range */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.2,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Price Range</h4>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={400}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </motion.div>

                        {/* Colors */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.35,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Colors</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {availableColors.map((color, index) => (
                              <motion.button
                                key={color}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  delay: 0.4 + index * 0.03,
                                  duration: 0.4,
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                                whileHover={{
                                  scale: 1.15,
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (selectedColors.includes(color)) {
                                    setSelectedColors(selectedColors.filter((c) => c !== color))
                                  } else {
                                    setSelectedColors([...selectedColors, color])
                                  }
                                }}
                                className={cn(
                                  "w-8 h-8 rounded-full border-2 transition-all duration-300",
                                  selectedColors.includes(color)
                                    ? "border-orange-500 scale-110 shadow-lg shadow-orange-500/30"
                                    : "border-gray-600 hover:border-gray-400",
                                )}
                                style={{ backgroundColor: colorMap[color as keyof typeof colorMap] }}
                                title={color}
                              />
                            ))}
                          </div>
                        </motion.div>

                        {/* Sizes */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.45,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Sizes</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {["XS", "S", "M", "L", "XL", "XXL"].map((size, index) => (
                              <motion.button
                                key={size}
                                initial={{ y: 25, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                  delay: 0.5 + index * 0.04,
                                  duration: 0.4,
                                  ease: [0.4, 0.0, 0.2, 1],
                                }}
                                whileHover={{
                                  scale: 1.08,
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (selectedSizes.includes(size)) {
                                    setSelectedSizes(selectedSizes.filter((s) => s !== size))
                                  } else {
                                    setSelectedSizes([...selectedSizes, size])
                                  }
                                }}
                                className={cn(
                                  "p-2 text-sm border rounded transition-all duration-300",
                                  selectedSizes.includes(size)
                                    ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/20"
                                    : "border-gray-700 hover:border-gray-600",
                                )}
                              >
                                {size}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Special Filters */}
                        <motion.div
                          className="space-y-4"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.6,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Special</h4>
                          <div className="space-y-2">
                            <motion.div
                              className="flex items-center space-x-2"
                              initial={{ x: -25, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                delay: 0.65,
                                duration: 0.4,
                                ease: [0.4, 0.0, 0.2, 1],
                              }}
                            >
                              <Checkbox
                                id="on-sale"
                                checked={showOnSale}
                                onCheckedChange={(checked) => setShowOnSale(checked === true)}
                              />
                              <label htmlFor="on-sale" className="text-sm">
                                On Sale
                              </label>
                            </motion.div>
                            <motion.div
                              className="flex items-center space-x-2"
                              initial={{ x: -25, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                delay: 0.7,
                                duration: 0.4,
                                ease: [0.4, 0.0, 0.2, 1],
                              }}
                            >
                              <Checkbox
                                id="new-arrivals"
                                checked={showNew}
                                onCheckedChange={(checked) => setShowNew(checked === true)}
                              />
                              <label htmlFor="new-arrivals" className="text-sm">
                                New Arrivals
                              </label>
                            </motion.div>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <motion.div
            animate={gridControls}
            className="flex-1 min-w-0"
            style={{
              width: showFilters ? "calc(100% - 88px)" : "100%",
              willChange: "width",
            }}
          >
            {filteredProducts.length === 0 ? (
              <motion.div
                className="text-center py-16"
                animate={{
                  opacity: isAnimating ? 0.7 : 1,
                  scale: isAnimating ? 0.98 : 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              >
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                    : "Try adjusting your filters or search terms"}
                </p>

                {searchSuggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Did you mean:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(suggestion)}
                          className="text-orange-400 border-orange-500/50 hover:bg-orange-500/10"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className={cn(
                  "grid gap-6 w-full",
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
                )}
                animate={{
                  opacity: isAnimating || isSorting ? 0.85 : 1,
                  scale: isAnimating || isSorting ? 0.98 : 1,
                }}
                transition={{
                  duration: isSorting ? 0.6 : 0.4,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              >
                <AnimatePresence mode="wait">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={`${product.id}-${sortBy}`}
                      layout
                      initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.92,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          delay: isSorting ? index * 0.03 : index * 0.02,
                          duration: isSorting ? 0.5 : 0.4,
                          ease: [0.4, 0.0, 0.2, 1],
                        },
                      }}
                      exit={{
                        opacity: 0,
                        y: -30,
                        scale: 0.92,
                        transition: {
                          duration: 0.3,
                          ease: [0.4, 0.0, 1, 1],
                        },
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        },
                      }}
                      className="group cursor-pointer w-full"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      <Card className="group bg-gradient-to-br black border border-gray-800 rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all duration-500 hover:border-orange-500/70 h-full backdrop-blur-md">
                        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                          <motion.img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{
                              duration: 0.6,
                              ease: [0.4, 0.0, 0.2, 1],
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.isNew && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                              >
                                <Badge className="bg-orange-500 text-black shadow">New</Badge>
                              </motion.div>
                            )}
                            {product.onSale && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                              >
                                <Badge className="bg-red-500 text-white shadow">Sale</Badge>
                              </motion.div>
                            )}
                          </div>

                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 hover:bg-black/60 rounded-full shadow"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleWishlist(product.id)
                              }}
                            >
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Heart
                                  className={cn(
                                    "w-4 h-4 transition-colors duration-300",
                                    wishlist.includes(product.numericId) ? "fill-red-500 text-red-500" : "text-white",
                                  )}
                                />
                              </motion.div>
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          {/* Category & Rating */}
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <Badge variant="outline" className="text-xs rounded-md px-2">
                              {categoryMap[product.category as keyof typeof categoryMap] ||
                                product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                              <span className="text-xs">
                                {product.rating.toFixed(1)} ({product.reviews})
                              </span>
                            </div>
                          </div>

                          {/* Product Title */}
                          <h3 className="font-semibold text-lg group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-orange-500">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            {product.onSale && (
                              <span className="text-sm text-gray-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Color Options */}
                          <div className="flex items-center gap-1">
                            {product.colors.slice(0, 4).map((color, colorIndex) => (
                              <motion.div
                                key={color}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.1 + colorIndex * 0.05,
                                  duration: 0.3,
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                }}
                                className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
                                style={{
                                  backgroundColor: colorMap[color as keyof typeof colorMap] || "#000000",
                                }}
                              />
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              disabled={addingToCart[product.id]}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-orange-500 hover:bg-orange-600 text-black shadow rounded-full px-4 flex-1"
                              onClick={(e) => handleAddToCart(product, e)}
                            >
                              <motion.div
                                className="flex items-center justify-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {addingToCart[product.id] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Quick Add
                                  </>
                                )}
                              </motion.div>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
