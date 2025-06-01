"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Define cart item type
type CartItemType = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

interface SlidingCartProps {
  isOpen: boolean
  onClose: () => void
}

export default function SlidingCart({ isOpen, onClose }: SlidingCartProps) {
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItemType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock cart data - in real app, this would come from context/state management
  useEffect(() => {
    // Simulate loading cart items
    setCartItems([
      {
        id: "CART-1",
        name: "Premium Cotton T-Shirt",
        price: 49.99,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80",
        size: "M",
        color: "Black",
      },
      {
        id: "CART-2",
        name: "Designer Hoodie",
        price: 89.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
        size: "L",
        color: "Orange",
      },
      {
        id: "CART-3",
        name: "Slim Fit Jeans",
        price: 129.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
        size: "32",
        color: "Dark Blue",
      },
    ])
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id)
      return
    }

    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))

    toast({
      title: "Cart Updated",
      description: "Item quantity has been updated.",
      duration: 2000,
    })
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))

    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
      duration: 2000,
    })
  }

  const clearCart = () => {
    setCartItems([])

    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
      duration: 2000,
    })
  }

  const handleCheckout = () => {
    setIsLoading(true)

    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false)
      onClose()
      toast({
        title: "Checkout Initiated",
        description: "Redirecting to checkout page...",
        duration: 3000,
      })
    }, 2000)
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

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
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">{item.name}</h3>
                            <div className="flex gap-2 text-xs text-gray-400 mb-2">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-orange-400 font-semibold">${item.price.toFixed(2)}</span>
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
                    ))}
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
