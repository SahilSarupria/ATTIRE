"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile  } from "@/hooks/use-mobile"

// Define the product type
type Product = {
  id: number
  name: string
  description: string
  price: string
  image: string
  brand: string
  color: string
}

export default function CircularCarousel() {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Structured Coat",
      description: "Premium wool blend with minimalist design. Our signature piece for the modern wardrobe.",
      price: "$249.99",
      image: "/jjk-megumi-1.png",
      brand: "LIMI",
      color: "bg-yellow-500",
    },
    {
      id: 2,
      name: "Draped Dress",
      description: "Flowing silk blend with asymmetrical cut. Elegant draping for a sophisticated silhouette.",
      price: "$189.99",
      image: "/jjk-megumi-1.png",
      brand: "Y's",
      color: "bg-red-500",
    },
    {
      id: 3,
      name: "Avant-garde Jacket",
      description: "Japanese cotton with architectural details. Redefining contemporary outerwear.",
      price: "$329.99",
      image: "/jjk-megumi-1.png",
      brand: "Yohji",
      color: "bg-gray-400",
    },
    {
      id: 4,
      name: "Minimalist Blouse",
      description: "Organic linen with clean lines. Effortless elegance for everyday wear.",
      price: "$149.99",
      image: "/jjk-megumi-1.png",
      brand: "S'YTE",
      color: "bg-blue-500",
    },
    {
      id: 5,
      name: "Structured Pants",
      description: "Technical fabric with innovative cut. Modern tailoring for the urban explorer.",
      price: "$179.99",
      image: "/jjk-megumi-1.png",
      brand: "LIMI",
      color: "bg-green-500",
    },
    {
      id: 6,
      name: "Oversized Sweater",
      description: "Luxurious cashmere blend with relaxed fit. Comfort meets sophistication.",
      price: "$219.99",
      image: "/jjk-megumi-1.png",
      brand: "Y's",
      color: "bg-purple-500",
    },
    {
      id: 7,
      name: "Asymmetric Skirt",
      description: "Premium wool gabardine with unique silhouette. Artful design for the fashion-forward.",
      price: "$159.99",
      image: "/jjk-megumi-1.png",
      brand: "Yohji",
      color: "bg-amber-500",
    },
  ])

  const [position, setPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentDelta, setCurrentDelta] = useState(0)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  // Number of visible items based on screen size
  const getVisibleItems = () => {
    if (isMobile) return 2
    return 5
  }

  const visibleItems = getVisibleItems()
  const itemWidth = 100 / visibleItems

  // Handle next/previous navigation
  const handleNext = () => {
    setPosition((prev) => {
      const newPosition = prev - itemWidth
      // If we've scrolled past the end, loop back to start
      if (Math.abs(newPosition) >= products.length * itemWidth) {
        return 0
      }
      return newPosition
    })
  }

  const handlePrev = () => {
    setPosition((prev) => {
      const newPosition = prev + itemWidth
      // If we've scrolled back to the start, loop to end
      if (newPosition > 0) {
        return -(products.length - visibleItems) * itemWidth
      }
      return newPosition
    })
  }

  // Mouse/touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setAutoScrollEnabled(false)
    setStartX(e.pageX)
    setCurrentDelta(0)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // If dragged far enough, move to next/prev
    if (currentDelta > 50) {
      handlePrev()
    } else if (currentDelta < -50) {
      handleNext()
    }

    setTimeout(() => setAutoScrollEnabled(true), 3000)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const delta = e.pageX - startX
    setCurrentDelta(delta)
  }

  // Auto scroll effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoScrollEnabled) {
      interval = setInterval(() => {
        handleNext()
      }, 5000)
    }

    return () => clearInterval(interval)
  }, [autoScrollEnabled])

  // Add to cart handler
  const addToCart = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })
  }

  // Create a duplicated array for infinite scrolling effect
  const extendedProducts = [...products, ...products, ...products]

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Navigation buttons */}
      <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous</span>
        </Button>
      </div>

      <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="flex w-full cursor-grab select-none items-center justify-start overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className="flex"
          style={{
            width: `${extendedProducts.length * itemWidth}%`,
          }}
          animate={{
            x: `${position}%`,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            if (info.offset.x > 100) {
              handlePrev()
            } else if (info.offset.x < -100) {
              handleNext()
            }
          }}
        >
          {extendedProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="relative flex-shrink-0 px-2"
              style={{ width: `${itemWidth}%` }}
            >
              <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-900">
                {/* Main image */}
                <div className="absolute inset-0 h-full w-full overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Brand overlay */}
                <div className="absolute bottom-0 left-0 p-3">
                  <div className="text-xl font-bold text-white">{product.brand}</div>
                </div>

                {/* Hover overlay - Split design like reference image */}
                <div className="absolute inset-0 flex opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {/* Left colored section with text */}
                  <div className={`w-1/2 ${product.color} p-4 flex flex-col justify-between`}>
                    <div>
                      <h3 className="text-lg font-bold text-black">{product.brand}</h3>
                      <div className="mt-1 text-sm font-medium text-black">{product.name}</div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-black/80">{product.description}</p>
                      <div className="text-sm font-bold text-black">{product.price}</div>
                      <Button
                        onClick={() => addToCart(product)}
                        size="sm"
                        variant="outline"
                        className="mt-2 border-black bg-transparent text-black hover:bg-black hover:text-white"
                      >
                        <ShoppingBag className="mr-2 h-3 w-3" />
                        Add to cart
                      </Button>
                    </div>
                  </div>

                  {/* Right section with image */}
                  <div className="w-1/2 bg-black">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Indicator dots */}
      <div className="mt-6 flex justify-center gap-2">
        {products.map((_, index) => {
          // Calculate if this dot represents the current visible section
          const dotPosition = -index * itemWidth
          const isActive = position <= dotPosition && position > dotPosition - itemWidth

          return (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${isActive ? "bg-white w-4" : "bg-gray-600"}`}
              onClick={() => {
                setPosition(-index * itemWidth)
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}
