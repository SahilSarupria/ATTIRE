// context/CartContext.tsx
"use client"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const API_BASE = "http://localhost:8000/api/cart"

type CartItemType = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

type CartContextType = {
  items: CartItemType[]
  fetchCart: () => Promise<void>
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItemType[]>([])

  const fetchCart = async () => {
    const res = await axios.get(`${API_BASE}`)
    setItems(res.data.items)
  }

  const addItem = async (productId: string, variantId?: string, quantity = 1) => {
    const res = await axios.post(`${API_BASE}/add`, { product_id: productId, variant_id: variantId, quantity })
    await fetchCart()
  }

  const updateItem = async (itemId: string, quantity: number) => {
    await axios.put(`${API_BASE}/update/${itemId}`, { quantity })
    await fetchCart()
  }

  const removeItem = async (itemId: string) => {
    await axios.delete(`${API_BASE}/remove?itemId=${itemId}`)
    await fetchCart()
  }

  const clearCart = async () => {
    await axios.delete(`${API_BASE}/clear`)
    await fetchCart()
  }

  useEffect(() => {
    fetchCart()
  }, [])

  return (
    <CartContext.Provider value={{ items, fetchCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
