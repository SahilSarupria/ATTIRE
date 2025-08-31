"use client"

import { useState } from "react"
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SlidingCartProps {
  isOpen: boolean
  onClose: () => void
}

// Available sizes in order
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

// Enhanced function to get image URL with primary media priority
const getImageUrl = (item: any) => {
  // First, try to find primary image or video in media table
  const primaryMedia = item.product?.media?.find(
    (media: any) => media.is_primary && (media.media_type === "image" || media.media_type === "video"),
  )

  if (primaryMedia) {
    const mediaUrl = primaryMedia.media_url
    if (mediaUrl.startsWith("http")) return mediaUrl
    if (mediaUrl.startsWith("/")) return mediaUrl
    return `/${mediaUrl}`
  }

  // Fallback to product image_url
  if (item.product?.image_url) {
    if (item.product.image_url.startsWith("http")) return item.product.image_url
    if (item.product.image_url.startsWith("/")) return item.product.image_url
    return `/${item.product.image_url}`
  }

  // Fallback to item image
  if (item.image) {
    if (item.image.startsWith("http")) return item.image
    if (item.image.startsWith("/")) return item.image
    return `/${item.image}`
  }

  // Final fallback to placeholder
  return "/placeholder.svg"
}

// Smart function to get available colors from product variants
const getAvailableColors = (item: any) => {
  // Try to get colors from product variants first
  if (item.product?.variants && Array.isArray(item.product.variants)) {
    const uniqueColors = new Set()
    const colorOptions: { name: string; value: string }[] = []

    item.product.variants.forEach((variant: any) => {
      if (variant.color && !uniqueColors.has(variant.color)) {
        uniqueColors.add(variant.color)
        // Map color names to hex values (you can expand this mapping)
        const colorMap: Record<string, string> = {
          black: "#000000",
          white: "#FFFFFF",
          red: "#EF4444",
          blue: "#3B82F6",
          green: "#10B981",
          gray: "#6B7280",
          orange: "#F97316",
          purple: "#8B5CF6",
          pink: "#EC4899",
          yellow: "#EAB308",
          navy: "#1E3A8A",
          brown: "#A3A3A3",
        }

        const colorValue = colorMap[variant.color.toLowerCase()] || "#6B7280"
        colorOptions.push({
          name: variant.color,
          value: colorValue,
        })
      }
    })

    if (colorOptions.length > 0) {
      return colorOptions
    }
  }

  // Fallback to default colors if no variants available
  return [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Red", value: "#EF4444" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
  ]
}

// Smart function to get available sizes from product variants
const getAvailableSizes = (item: any) => {
  if (item.product?.variants && Array.isArray(item.product.variants)) {
    const uniqueSizes = new Set()
    item.product.variants.forEach((variant: any) => {
      if (variant.size) {
        const sizeName = typeof variant.size === "string" ? variant.size : variant.size.name
        if (sizeName && SIZES.includes(sizeName)) {
          uniqueSizes.add(sizeName)
        }
      }
    })

    if (uniqueSizes.size > 0) {
      // Return sizes in the correct order
      return SIZES.filter((size) => uniqueSizes.has(size))
    }
  }

  // Fallback to all sizes if no variants available
  return SIZES
}

// Smart function to get recommended size based on user preferences or most popular
const getRecommendedSize = (item: any) => {
  const availableSizes = getAvailableSizes(item)

  // Try to get from user preferences (you can implement this based on your user system)
  // For now, we'll use "M" as default or the middle size from available sizes
  if (availableSizes.includes("M")) {
    return "M"
  }

  // If M is not available, return the middle size
  const middleIndex = Math.floor(availableSizes.length / 2)
  return availableSizes[middleIndex] || "M"
}

export default function SlidingCart({ isOpen, onClose }: SlidingCartProps) {
  const { toast } = useToast()
  const { cartItems, updateQuantity, removeItem, clearCart, updateItemColor, updateItemSize } = useCart()
  const router = useRouter()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = (): void => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Close the cart and navigate to checkout
    setTimeout(() => {
      setIsLoading(false)
      onClose()
      router.push("/checkout")
    }, 500)
  }

  const handleItemClick = (productId: string) => {
    onClose()
    router.push(`/product/${productId}`)
  }

  const handleColorChange = (itemId: string, color: string) => {
    if (updateItemColor) {
      updateItemColor(itemId, color)
    }
  }

  const handleSizeChange = (itemId: string, newSize: string) => {
    if (updateItemSize) {
      updateItemSize(itemId, newSize)
    }
  }

  const getSizeIndex = (size: string, availableSizes: string[]) => {
    return availableSizes.indexOf(size)
  }

  const changeSizeByDirection = (
    itemId: string,
    currentSize: string,
    direction: "prev" | "next",
    availableSizes: string[],
  ) => {
    const currentIndex = getSizeIndex(currentSize, availableSizes)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : 0
    } else {
      newIndex = currentIndex < availableSizes.length - 1 ? currentIndex + 1 : availableSizes.length - 1
    }

    if (newIndex !== currentIndex) {
      handleSizeChange(itemId, availableSizes[newIndex])
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sliding Cart Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 lg:w-1/4 bg-black border-l border-orange-900/30 z-50 flex flex-col"
            style={{
              boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-900/30">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-bold text-white">
                  Shopping Cart
                  {totalItems > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-black hover:bg-orange-600">{totalItems}</Badge>
                  )}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close cart</span>
              </Button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {cartItems.length > 0 ? (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.map((item) => {
                      const availableColors = getAvailableColors(item)
                      const availableSizes = getAvailableSizes(item)
                      const recommendedSize = getRecommendedSize(item)
                      const currentSize = item.size || recommendedSize

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                        >
                          <div className="flex gap-4">
                            {/* Product Image - Clickable with enhanced image handling */}
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className="h-20 w-20 rounded-md overflow-hidden bg-gray-700 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleItemClick(item.product?.id || item.id)}
                              >
                                <img
                                  src={getImageUrl(item) || "/placeholder.svg"}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                  }}
                                />
                              </div>

                              {/* Enhanced Color Selection - Below Image */}
                              <div className="grid grid-cols-4 gap-1 w-fit">
                                {availableColors.slice(0, 8).map((color) => (
                                  <button
                                    key={color.name}
                                    onClick={() => handleColorChange(item.id, color.name)}
                                    className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${
                                      item.color === color.name
                                        ? "border-orange-500 shadow-lg ring-2 ring-orange-500/30"
                                        : "border-gray-500 hover:border-gray-300"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                              {availableColors.length > 8 && (
                                <span className="text-xs text-gray-400">+{availableColors.length - 8} more</span>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-medium text-white text-sm line-clamp-2 mb-2 cursor-pointer hover:text-orange-400 transition-colors"
                                onClick={() => handleItemClick(item.product?.id || item.id)}
                              >
                                {item.name}
                              </h3>

                              {/* Enhanced Size Selection */}
                              <div className="mb-3">
                                <span className="text-xs text-gray-400 block mb-2">
                                  Size: {availableSizes.length} available
                                </span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => changeSizeByDirection(item.id, currentSize, "prev", availableSizes)}
                                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 p-0"
                                    disabled={getSizeIndex(currentSize, availableSizes) === 0}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <span
                                    className={`mx-2 px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                                      currentSize === recommendedSize
                                        ? "bg-green-500 text-black"
                                        : "bg-gray-600 text-white"
                                    }`}
                                    title={currentSize === recommendedSize ? "Recommended size" : ""}
                                  >
                                    {currentSize}
                                    {currentSize === recommendedSize && " ★"}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => changeSizeByDirection(item.id, currentSize, "next", availableSizes)}
                                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 p-0"
                                    disabled={getSizeIndex(currentSize, availableSizes) === availableSizes.length - 1}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                                {availableSizes.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Available: {availableSizes.join(", ")}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                {(() => {
                                  const unitPrice = Number(item.product?.base_price ?? item.price) || 0
                                  return <span className="text-orange-400 font-semibold">${unitPrice.toFixed(2)}</span>
                                })()}

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove item</span>
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 border-orange-500/50 hover:bg-orange-500/20"
                              >
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Decrease quantity</span>
                              </Button>
                              <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 border-orange-500/50 hover:bg-orange-500/20"
                              >
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Increase quantity</span>
                              </Button>
                            </div>
                            <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-orange-900/30 p-6 bg-gray-800/30">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal ({totalItems} items)</span>
                        <span className="text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Shipping</span>
                        <span className="text-white">
                          {shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">${tax.toFixed(2)}</span>
                      </div>
                      <Separator className="bg-orange-900/30" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-white">Total</span>
                        <span className="text-orange-400">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Free Shipping Progress */}
                    {shipping > 0 && (
                      <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="text-xs text-orange-400 mb-1">
                          Add ${(100 - subtotal).toFixed(2)} more for free shipping
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full bg-orange-500 text-black hover:bg-orange-600 font-semibold py-3"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Checkout
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="w-full border-gray-600 hover:bg-gray-800"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty Cart State */
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-6">Add some items to get started</p>
                    <Button onClick={onClose} className="bg-orange-500 text-black hover:bg-orange-600">
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
