"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

interface AddToCartButtonProps {
  productId: string
  size?: string
  color?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export default function AddToCartButton({
  productId,
  size,
  color,
  className = "",
  variant = "default",
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addToCart(productId, quantity, size, color)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isAdding} variant={variant} className={`${className}`}>
      {isAdding ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Adding...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </div>
      )}
    </Button>
  )
}
