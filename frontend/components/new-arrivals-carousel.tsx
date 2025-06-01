"use client"

import { useEffect, useRef, useState } from "react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import { ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

import ProductPage from "@/components/product-page"




type Product = {
  id: number
  name: string
  description: string
  category: string
  price: string
  image: string
  color: "orange" | "red" | "gray"
}

const products: Product[] = [
  { id: 1, name: "Urban Minimalist Tee", description: "Essential organic cotton t-shirt with a relaxed fit and clean lines.", category: "Essentials", price: "$49.99", image: "/jjk-megumi-1.png", color: "orange" },
  { id: 2, name: "Structured Denim Jacket", description: "Timeless denim jacket with a modern cut and sustainable production.", category: "Outerwear", price: "$129.99", image: "/favicon.png", color: "red" },
  { id: 3, name: "Tailored Wool Trousers", description: "Premium wool trousers with a tailored fit and subtle texture.", category: "Bottoms", price: "$89.99", image: "/jjk-megumi-1.png", color: "gray" },
  { id: 4, name: "Oversized Linen Shirt", description: "Breathable linen shirt with an oversized silhouette for effortless style.", category: "Tops", price: "$69.99", image: "/pant.png", color: "orange" },
  { id: 5, name: "Structured Blazer", description: "Versatile blazer with clean lines and a contemporary fit.", category: "Outerwear", price: "$159.99", image: "/jjk-megumi-1.png", color: "red" },
  { id: 6, name: "Relaxed Chino Pants", description: "Comfortable chinos with a relaxed fit and sustainable cotton blend.", category: "Bottoms", price: "$79.99", image: "/pant.png", color: "gray" },
  { id: 7, name: "Merino Wool Sweater", description: "Luxurious merino wool sweater with a timeless design and exceptional comfort.", category: "Knitwear", price: "$119.99", image: "/jjk-megumi-1.png", color: "orange" },
  { id: 8, name: "Utility Cargo Pants", description: "Functional cargo pants with a modern silhouette and durable construction.", category: "Bottoms", price: "$99.99", image: "/pant.png", color: "red" }
]

const colorMap = {
  orange: "bg-orange-500",
  red: "bg-red-600",
  gray: "bg-gray-500"
}

export default function NewArrivalsCarousel() {
  const { toast } = useToast()
  const router = useRouter()
  const sliderContainerRef = useRef<HTMLDivElement | null>(null)
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null)
  const [activeProductId, setActiveProductId] = useState<number | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
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
  })

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    const startAutoplay = () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current)
      autoplayTimer.current = setInterval(() => {
        instanceRef.current?.next()
      }, 4000)
    }

    const stopAutoplay = () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current)
        autoplayTimer.current = null
      }
    }

    if (activeProductId === null) startAutoplay()
    else stopAutoplay()

    return () => stopAutoplay()
  }, [activeProductId, instanceRef])

  useEffect(() => {
    const container = sliderContainerRef.current
    if (!container) return

    const stopAutoplay = () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current)
    }

    const startAutoplay = () => {
      if (activeProductId === null) {
        if (autoplayTimer.current) clearInterval(autoplayTimer.current)
        autoplayTimer.current = setInterval(() => {
          instanceRef.current?.next()
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
  }, [activeProductId, instanceRef])

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
      duration: 4000
    })
  }

    const handleViewMore = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/product/${product.id}`)
  }



  const handleDrawerOpen = (productId: number) => {
    setActiveProductId(productId)
  }

  const handleDrawerClose = () => {
    setActiveProductId(null)
  }

  return (
    <div ref={sliderContainerRef} className="relative w-full py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
          New Arrivals
        </div>
        <div className="ml-auto flex space-x-2">
          <Button onClick={() => instanceRef.current?.prev()} variant="outline" size="icon" className="rounded-full border-orange-500/50 hover:bg-orange-500/10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button onClick={() => instanceRef.current?.next()} variant="outline" size="icon" className="rounded-full border-orange-500/50 hover:bg-orange-500/10">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <div key={product.id} className="keen-slider__slide">
            <div className="px-2">
              <div
                className="relative overflow-hidden rounded-lg bg-black aspect-[3/4] group cursor-pointer"
                onClick={() => {
                  if (isTouchDevice) {
                    setActiveProductId(prev => (prev === product.id ? null : product.id))
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
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className={cn(
                    "absolute inset-0 flex transition-transform duration-500 ease-out",
                    activeProductId === product.id ? "translate-x-0" : "-translate-x-full"
                  )}
                >
                  <div className={cn("w-1/2 h-full p-4 flex flex-col justify-between", colorMap[product.color])}>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1">{product.category}</div>
                      <h3 className="text-lg font-bold mb-2 text-black">{product.name}</h3>
                      <p className="text-xs text-black/80 line-clamp-4">{product.description}</p>
                    </div>
                    <div className="mt-auto">
  <div className="text-lg font-bold text-black mb-2">{product.price}</div>
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
    >
      <ShoppingBag className="h-4 w-4 mr-2" />
      Add to Cart
    </Button>
  </div>
</div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
