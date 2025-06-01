"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/cart-context"

export default function CartButton() {
  const { totalItems, openCart } = useCart()

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={openCart}
      className="relative hover:bg-orange-500/20 transition-colors duration-200"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-black text-xs">
          {totalItems}
        </Badge>
      )}
      <span className="sr-only">Shopping cart</span>
    </Button>
  )
}
