"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart } from "lucide-react"

interface OutfitElement {
  id: string
  name: string
  price: number
  fabric: string
  color: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface OutfitDetailsPanelProps {
  selectedElement: OutfitElement | null
  onAddToCart: (element: OutfitElement) => void
  onAddToWishlist: (element: OutfitElement) => void
}

export function OutfitDetailsPanel({ selectedElement, onAddToCart, onAddToWishlist }: OutfitDetailsPanelProps) {
  if (!selectedElement) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Click on any clothing item to view details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{selectedElement.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Price:</span>
            <span className="text-lg font-bold">${selectedElement.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Fabric:</span>
            <Badge variant="outline">{selectedElement.fabric}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Color:</span>
            <Badge variant="outline">{selectedElement.color}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="w-full" onClick={() => onAddToCart(selectedElement)}>
            <ShoppingCart className="mr-1 h-3 w-3" />
            Add to Cart
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onAddToWishlist(selectedElement)}>
            <Heart className="mr-1 h-3 w-3" />
            Wishlist
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>This item is part of your custom design and will be manufactured to order.</p>
        </div>
      </CardContent>
    </Card>
  )
}
