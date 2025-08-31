"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { fetchProductsArray, type Product } from "@/lib/ProductApi"
import { authService } from "@/lib/api-auth"
import type { User } from "@/types"
import Link from "next/link"
import SlidingCart from "@/components/sliding-cart"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {
  Search,
  Heart,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  User2,
  Star,
  Trash2,
  Loader2,
  Filter,
  SortAsc,
  Sparkles,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

interface WishlistItem extends Product {
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
  addedAt: Date
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

// Enhanced getImageUrl function
const getImageUrl = (product: any) => {
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

  // Fallback to product image_url
  if (product.image_url) {
    if (product.image_url.startsWith("http")) return product.image_url
    if (product.image_url.startsWith("/")) return product.image_url
    return `/${product.image_url}`
  }

  // Fallback to item image
  if (product.image) {
    if (product.image.startsWith("http")) return product.image
    if (product.image.startsWith("/")) return product.image
    return `/${product.image}`
  }

  // Final fallback to placeholder
  return "/placeholder.svg"
}



// Glitch text effect
const GlitchText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 text-red-500 opacity-70 animate-pulse"
        style={{ transform: "translate(-1px, -1px)" }}
      >
        {children}
      </span>
      <span
        className="absolute top-0 left-0 text-blue-500 opacity-70 animate-pulse"
        style={{ transform: "translate(1px, 1px)" }}
      >
        {children}
      </span>
    </div>
  )
}

export default function WishlistPage() {
  const router = useRouter()
  const { cartItems, addToCart } = useCart()
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const { toast } = useToast()

  // State
  const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({})
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  const controls = useAnimationControls()

  // Mock wishlist data - replace with actual API call
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - replace with actual wishlist fetch
        const mockWishlistIds = ["prod-1", "prod-2", "prod-3", "prod-4", "prod-5"]
        const products = await fetchProductsArray()

        const wishlistProducts = products.slice(0, 5).map((product, index) => ({
          ...product,
          numericId: Number.parseInt(product.id.replace(/-/g, "").slice(0, 8), 16),
          originalPrice: product.base_price * 1.2,
          image: getImageUrl(product),
          colors: ["black", "white", "gray"],
          sizes: ["S", "M", "L", "XL"],
          rating: product.average_rating || 4.5,
          reviews: product.review_count || Math.floor(Math.random() * 100),
          isNew: Math.random() > 0.7,
          onSale: Math.random() > 0.6,
          price: product.base_price,
          subcategory: product.category,
          addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        }))

        setWishlistItems(wishlistProducts)
      } catch (error) {
        console.error("Error loading wishlist:", error)
        toast({
          title: "Error",
          description: "Failed to load wishlist items",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [toast])

  // Filter and sort wishlist items
  const filteredItems = useMemo(() => {
    let items = [...wishlistItems]

    // Search filter
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (filterBy !== "all") {
      items = items.filter((item) => item.category === filterBy)
    }

    // Sort
    switch (sortBy) {
      case "newest":
        items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
        break
      case "oldest":
        items.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
        break
      case "price-low":
        items.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        items.sort((a, b) => b.price - a.price)
        break
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return items
  }, [wishlistItems, searchQuery, filterBy, sortBy])

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    setRemovingItems((prev) => new Set(prev).add(productId))

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setWishlistItems((prev) => prev.filter((item) => item.id !== productId))

      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      })
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  // Add to cart from wishlist
  const handleAddToCart = async (product: WishlistItem, e: React.MouseEvent) => {
    e.stopPropagation()

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }))

    try {
      await addToCart(product.id, `${product.id}-default`, 1)

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }))
    }
  }

  // Bulk actions
  const handleBulkRemove = async () => {
    const itemsToRemove = Array.from(selectedItems)
    setRemovingItems(new Set(itemsToRemove))

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setWishlistItems((prev) => prev.filter((item) => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
      setShowBulkActions(false)

      toast({
        title: "Items removed",
        description: `${itemsToRemove.length} items removed from wishlist`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove items",
        variant: "destructive",
      })
    } finally {
      setRemovingItems(new Set())
    }
  }

  const handleBulkAddToCart = async () => {
    const itemsToAdd = wishlistItems.filter((item) => selectedItems.has(item.id))

    try {
      for (const item of itemsToAdd) {
        await addToCart(item.id, `${item.id}-default`, 1)
      }

      setSelectedItems(new Set())
      setShowBulkActions(false)

      toast({
        title: "Added to cart",
        description: `${itemsToAdd.length} items added to cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to cart",
        variant: "destructive",
      })
    }
  }

  // User profile fetch
  const fetchUserProfile = async () => {
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
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Logout error",
        description: "Something went wrong while logging out.",
        variant: "destructive",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <GlitchText className="text-2xl font-bold">Loading Wishlist...</GlitchText>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Header */}
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
            <Button variant="ghost" size="icon" className="text-orange-500">
              <Heart className="w-5 h-5 fill-current" />
            </Button>

            {user && (
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
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-full hover:bg-orange-500/10"
                    >
                      <User2 className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-black/95 backdrop-blur-sm border border-orange-500/30"
                  >
                    <div className="px-4 py-3 border-b border-orange-500/20">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300">
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Content */}
      <main className="pt-16 relative z-10">
        
        {/* Controls */}
        <section className="sticky top-16 z-40 bg-black/95 backdrop-blur border-b border-orange-900/30 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" onClick={() => router.back()} className="text-white hover:text-orange-500">
                  ← Back
                </Button>

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="tshirt">T-Shirts</SelectItem>
                    <SelectItem value="hoodie">Hoodies</SelectItem>
                    <SelectItem value="jacket">Jackets</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">{selectedItems.size} items selected</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (selectedItems.size === filteredItems.length) {
                            setSelectedItems(new Set())
                          } else {
                            setSelectedItems(new Set(filteredItems.map((item) => item.id)))
                          }
                        }}
                      >
                        {selectedItems.size === filteredItems.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkAddToCart}
                        disabled={selectedItems.size === 0}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkRemove}
                        disabled={selectedItems.size === 0}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowBulkActions(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Wishlist Items */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            {filteredItems.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="w-24 h-24 mx-auto mb-6 text-gray-600"
                >
                  <Heart className="w-full h-full" />
                </motion.div>
                <GlitchText className="text-3xl font-bold mb-4">
                  {searchQuery ? "No matching items" : "Your wishlist is empty"}
                </GlitchText>
                <p className="text-gray-400 mb-8">
                  {searchQuery ? "Try adjusting your search terms" : "Start adding items you love to see them here"}
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover Products
                </Button>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
                <AnimatePresence>
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        rotate: -10,
                        transition: { duration: 0.3 },
                      }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      className="group cursor-pointer"
                      onClick={() => router.push(`/product/${item.id}`)}
                    >
                      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 hover:border-orange-500/70 transition-all duration-500 overflow-hidden relative">
                        {/* Selection Checkbox */}
                        {showBulkActions && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-3 left-3 z-20"
                          >
                            <Button
                              size="sm"
                              variant={selectedItems.has(item.id) ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation()
                                const newSelected = new Set(selectedItems)
                                if (selectedItems.has(item.id)) {
                                  newSelected.delete(item.id)
                                } else {
                                  newSelected.add(item.id)
                                }
                                setSelectedItems(newSelected)
                              }}
                              className="w-8 h-8 p-0 rounded-full"
                            >
                              {selectedItems.has(item.id) ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500 }}
                                >
                                  ✓
                                </motion.div>
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </motion.div>
                        )}

                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <motion.img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />

                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {item.isNew && <Badge className="bg-orange-500 text-black">New</Badge>}
                            {item.onSale && <Badge className="bg-red-500 text-white">Sale</Badge>}
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => handleAddToCart(item, e)}
                              disabled={addingToCart[item.id]}
                              className="bg-orange-500 hover:bg-orange-600 text-black"
                            >
                              {addingToCart[item.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ShoppingCart className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromWishlist(item.id)
                              }}
                              disabled={removingItems.has(item.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {removingItems.has(item.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          {/* Category & Rating */}
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-400">
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                              <span className="text-xs">{item.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Product Name */}
                          <h3 className="font-semibold text-lg group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                            {item.name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-orange-500">${Number(item.price).toFixed(2)}</span>
                            {item.onSale && (
                              <span className="text-sm text-gray-400 line-through">
                                ${item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Added Date */}
                          <p className="text-xs text-gray-500">Added {item.addedAt.toLocaleDateString()}</p>

                          {/* Colors */}
                          <div className="flex items-center gap-1">
                            {item.colors.slice(0, 3).map((color, colorIndex) => (
                              <div
                                key={color}
                                className="w-4 h-4 rounded-full border border-gray-600"
                                style={{ backgroundColor: colorMap[color as keyof typeof colorMap] }}
                              />
                            ))}
                            {item.colors.length > 3 && (
                              <span className="text-xs text-gray-400">+{item.colors.length - 3}</span>
                            )}
                          </div>
                        </CardContent>

                        {/* Glitch effect overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 3,
                          }}
                        />
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
