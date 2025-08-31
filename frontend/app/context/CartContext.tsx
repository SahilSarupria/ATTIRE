"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import axiosInstance from "@/lib/axios" // axios withCredentials = true

export interface CartItem {
  id: string
  product: any
  variant: any
  quantity: number
  name: string
  price: number
  image: string
  size?: string
  color?: string
  // add other fields if needed
}

interface CartContextValue {
  cartItems: CartItem[]
  loading: boolean
  error: string | null
  fetchCart: () => Promise<void>
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  updateItemColor: (itemId: string, color: string) => Promise<void>
  updateItemSize: (itemId: string, size: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  cartTotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("cart/")
      const normalizedItems: CartItem[] = res.data.items.map((item: any) => ({
        id: item.id,
        product: item.product,
        variant: item.variant,
        quantity: item.quantity > 0 ? item.quantity : 1,
        name: item.product.name,
        price: Number.parseFloat(item.product.base_price) || 0,
        image: item.product.image_url || "/placeholder.svg",
        size: item.size || null,
        color: item.color || item.product.color || null,
      }))

      setCartItems(normalizedItems)
      setError(null)
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Not logged in, clear cart
        setCartItems([])
      } else {
        setError("Failed to load cart")
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, variantId?: string, quantity = 1) => {
    try {
      const data: any = { product_id: productId, quantity }
      if (variantId) data.variant_id = variantId
      const res = await axiosInstance.post("cart/add/", data)
      // Update local cart by refetch or add/replace item locally
      await fetchCart()
    } catch (err) {
      setError("Failed to add to cart")
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
  try {
    if (quantity <= 0) {
      // Call delete API or reuse your existing removeItem logic
      await axiosInstance.delete("cart/remove/", { params: { itemId } })
      setCartItems((items) => items.filter((item) => item.id !== itemId))
    } else {
      // Update quantity in backend
      await axiosInstance.put(`cart/${itemId}/update/`, { quantity })
      setCartItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      )
    }
  } catch {
    setError("Failed to update quantity")
  }
}


  const updateItemColor = async (itemId: string, color: string) => {
    try {
      // Update color on the backend
      await axiosInstance.put(`cart/${itemId}/update/`, { color })

      // Update local state immediately for better UX
      setCartItems((items) => items.map((item) => (item.id === itemId ? { ...item, color } : item)))
    } catch (err) {
      setError("Failed to update color")
      // Optionally revert the local change by refetching
      await fetchCart()
    }
  }

  const updateItemSize = async (itemId: string, size: string) => {
    try {
      // Update size on the backend
      await axiosInstance.put(`cart/${itemId}/update/`, { size })

      // Update local state immediately for better UX
      setCartItems((items) => items.map((item) => (item.id === itemId ? { ...item, size } : item)))
    } catch (err) {
      setError("Failed to update size")
      // Optionally revert the local change by refetching
      await fetchCart()
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await axiosInstance.delete("cart/remove/", { params: { itemId } })
      setCartItems((items) => items.filter((item) => item.id !== itemId))
    } catch {
      setError("Failed to remove item")
    }
  }

  const clearCart = async () => {
    try {
      await axiosInstance.delete("cart/clear/")
      setCartItems([])
    } catch {
      setError("Failed to clear cart")
    }
  }

  // Optionally load cart on mount:
  useEffect(() => {
    fetchCart()
  }, [])

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        updateItemColor,
        updateItemSize,
        removeItem,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook for easy usage
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}

export { CartContext }
