"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import { ChevronLeft, ChevronRight, Eye, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { fetchProductsArray, type Product } from "@/lib/ProductApi"
import { useCart } from "@/app/context/CartContext"

const colorMap = {
  orange: "bg-orange-500",
  red: "bg-red-600",
  gray: "bg-gray-500",
}

// Function to determine color based on product properties
const getProductColor = (product: Product): "orange" | "red" | "gray" => {
  // if (product.color) {
  //   if (product.color.toLowerCase().includes("orange")) return "orange"
  //   if (product.color.toLowerCase().includes("red")) return "red"
  //   return "gray"
  // }
  // Fallback based on category or price
  if (product.category.toLowerCase().includes("jacket") || product.base_price < 60) return "orange"
  if (product.category.toLowerCase().includes("pant") || product.base_price > 120) return "red"
  return "gray"
}

// Enhanced function to get image URL with primary media priority
const getImageUrl = (product: Product) => {
  // First, try to find primary image or video in media table
  const primaryMedia = product.media?.find(
    (media) => media.is_primary && (media.media_type === "image" || media.media_type === "video"),
  )

  if (primaryMedia) {
    const mediaUrl = primaryMedia.media_url
    if (mediaUrl.startsWith("http")) return mediaUrl
    if (mediaUrl.startsWith("/")) return mediaUrl
    return `/${mediaUrl}`
  }

  // Fallback to image_url if no primary media found
  if (product.image_url) {
    if (product.image_url.startsWith("http")) return product.image_url
    if (product.image_url.startsWith("/")) return product.image_url
    return `/${product.image_url}`
  }

  // Final fallback to placeholder
  return "/placeholder.svg"
}

export default function NewArrivalsCarousel() {
  const { toast } = useToast()
  const router = useRouter()
  const sliderContainerRef = useRef<HTMLDivElement | null>(null)
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { cartItems, addToCart, loading: cartLoading } = useCart()
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({})

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        console.log("Fetching products...")
        const fetchedProducts = await fetchProductsArray()

        console.log("Fetched products:", fetchedProducts)
        console.log("Type of fetchedProducts:", typeof fetchedProducts)
        console.log("Is array:", Array.isArray(fetchedProducts))

        // Ensure we have an array
        if (Array.isArray(fetchedProducts)) {
          // Take only the first 8 products for the carousel
          setProducts(fetchedProducts.slice(0, 8))
        } else {
          console.error("fetchProductsArray did not return an array:", fetchedProducts)
          setProducts([])
          toast({
            title: "Error",
            description: "Invalid product data format",
            variant: "destructive",
            duration: 3000,
          })
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setProducts([])
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [toast])

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 1,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2, spacing: 15 },
      },
      "(min-width: 768px)": {
        slides: { perView: 3, spacing: 15 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 4, spacing: 15 },
      },
    },
    created: (s) => {
      // Ensure smooth infinite loop by duplicating slides
      s.update()
    },
  })

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    const startAutoplay = () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current)
      autoplayTimer.current = setInterval(() => {
        if (instanceRef.current) {
          instanceRef.current.next()
        }
      }, 4000)
    }

    const stopAutoplay = () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current)
        autoplayTimer.current = null
      }
    }

    if (activeProductId === null && products.length > 0) startAutoplay()
    else stopAutoplay()

    return () => stopAutoplay()
  }, [activeProductId, instanceRef, products.length])

  useEffect(() => {
    const container = sliderContainerRef.current
    if (!container) return

    const stopAutoplay = () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current)
    }

    const startAutoplay = () => {
      if (activeProductId === null && products.length > 0) {
        if (autoplayTimer.current) clearInterval(autoplayTimer.current)
        autoplayTimer.current = setInterval(() => {
          if (instanceRef.current) {
            instanceRef.current.next()
          }
        }, 4000)
      }
    }

    container.addEventListener("mouseenter", stopAutoplay)
    container.addEventListener("mouseleave", startAutoplay)
    container.addEventListener("touchstart", stopAutoplay)
    container.addEventListener("touchend", startAutoplay)

    return () => {
      container.removeEventListener("mouseenter", stopAutoplay)
      container.removeEventListener("mouseleave", startAutoplay)
      container.removeEventListener("touchstart", stopAutoplay)
      container.removeEventListener("touchend", startAutoplay)
    }
  }, [activeProductId, instanceRef, products.length])

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!product?.id) {
      toast({
        title: "Error",
        description: "Product information is missing",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Set loading state for this specific product
    setAddingToCart((prev) => ({ ...prev, [product.id]: true }))

    try {
      // Find the first available variant or use undefined for default
      const firstVariant = product.variants?.[0]

      // Add to cart with quantity of 1
      await addToCart(product.id, firstVariant?.id, 1)

      toast({
        title: "Added to Cart!",
        description: `${product.name} added to your cart`,
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
      // Clear loading state for this product
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }))
    }
  }

  const handleViewMore = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/product/${product.id}`)
  }

  const handleDrawerOpen = (productId: string) => {
    setActiveProductId(productId)
  }

  const handleDrawerClose = () => {
    setActiveProductId(null)
  }

  const handlePrevious = () => {
    if (instanceRef.current) {
      instanceRef.current.prev()
    }
  }

  const handleNext = () => {
    if (instanceRef.current) {
      instanceRef.current.next()
    }
  }

  if (loading) {
    return (
      <div className="relative w-full py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
            New Arrivals
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-2">
              <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[3/4] animate-pulse">
                <div className="w-full h-full bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="relative w-full py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
            New Arrivals
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">No products available</div>
      </div>
    )
  }

  return (
    <div ref={sliderContainerRef} className="relative w-full py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
          New Arrivals
        </div>
        <div className="ml-auto flex space-x-2">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="icon"
            className="rounded-full border-orange-500/50 hover:bg-orange-500/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleNext}
            variant="outline"
            size="icon"
            className="rounded-full border-orange-500/50 hover:bg-orange-500/10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div ref={sliderRef} className="keen-slider">
        {products.map((product) => {
          const productColor = getProductColor(product)
          return (
            <div key={product.id} className="keen-slider__slide">
              <div className="px-2">
                <div
                  className="relative overflow-hidden rounded-lg bg-black aspect-[3/4] group cursor-pointer"
                  onClick={() => {
                    if (isTouchDevice) {
                      setActiveProductId((prev) => (prev === product.id ? null : product.id))
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isTouchDevice) handleDrawerOpen(product.id)
                  }}
                  onMouseLeave={() => {
                    if (!isTouchDevice) handleDrawerClose()
                  }}
                >
                  <img
                    src={getImageUrl(product) || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 flex transition-transform duration-500 ease-out",
                      activeProductId === product.id ? "translate-x-0" : "-translate-x-full",
                    )}
                  >
                    <div className={cn("w-1/2 h-full p-4 flex flex-col justify-between", colorMap[productColor])}>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1">{product.category}</div>
                        <h3 className="text-lg font-bold mb-2 text-black">{product.name}</h3>
                        <p className="text-xs text-black/80 line-clamp-4">{product.description}</p>
                      </div>
                      <div className="mt-auto">
                        <div className="text-lg font-bold text-black mb-2">
                          ${Number(product.base_price).toFixed(2)}
                        </div>
                        <div className="space-y-2">
                          <Button
                            onClick={(e) => handleViewMore(product, e)}
                            className="w-full bg-black text-white hover:bg-black/80"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View More
                          </Button>
                          <Button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-full bg-black text-white hover:bg-black/80"
                            size="sm"
                            disabled={addingToCart[product.id]}
                          >
                            {addingToCart[product.id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
