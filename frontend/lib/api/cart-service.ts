import { toast } from "@/hooks/use-toast"

// Define cart item type
export type CartItemType = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  product_id?: string
}

// API base URL - should be set in your environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function to get auth token
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  }
  return null
}

// Helper function for API requests
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error: ${response.status}`)
    }

    // For DELETE requests, we might not have JSON response
    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Cart API service
export const CartService = {
  // Get cart items
  async getCart(): Promise<CartItemType[]> {
    try {
      const data = await fetchWithAuth("/api/cart/")
      return data.items || []
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      toast({
        title: "Failed to load cart",
        description: "Please try again later",
        variant: "destructive",
      })
      return []
    }
  },

  // Add item to cart
  async addToCart(productId: string, quantity = 1, size?: string, color?: string): Promise<CartItemType[]> {
    try {
      const data = await fetchWithAuth("/api/cart/add/", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          quantity,
          size,
          color,
        }),
      })

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      })

      return data.items || []
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      toast({
        title: "Failed to add item",
        description: "Please try again later",
        variant: "destructive",
      })
      throw error
    }
  },

  // Update cart item quantity
  async updateQuantity(itemId: string, quantity: number): Promise<CartItemType[]> {
    try {
      const data = await fetchWithAuth(`/api/cart/update/${itemId}/`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      })

      return data.items || []
    } catch (error) {
      console.error("Failed to update cart item:", error)
      toast({
        title: "Failed to update item",
        description: "Please try again later",
        variant: "destructive",
      })
      throw error
    }
  },

  // Remove item from cart
  async removeItem(itemId: string): Promise<CartItemType[]> {
    try {
      const data = await fetchWithAuth(`/api/cart/remove/${itemId}/`, {
        method: "DELETE",
      })

      return data?.items || []
    } catch (error) {
      console.error("Failed to remove cart item:", error)
      toast({
        title: "Failed to remove item",
        description: "Please try again later",
        variant: "destructive",
      })
      throw error
    }
  },

  // Clear cart
  async clearCart(): Promise<void> {
    try {
      await fetchWithAuth("/api/cart/clear/", {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast({
        title: "Failed to clear cart",
        description: "Please try again later",
        variant: "destructive",
      })
      throw error
    }
  },

  // Get cart summary (totals)
  async getCartSummary(): Promise<{
    subtotal: number
    shipping: number
    tax: number
    total: number
    item_count: number
  }> {
    try {
      return await fetchWithAuth("/api/cart/summary/")
    } catch (error) {
      console.error("Failed to get cart summary:", error)
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        item_count: 0,
      }
    }
  },

  // Checkout
  async checkout(): Promise<{ order_id: string }> {
    try {
      const data = await fetchWithAuth("/api/orders/create/", {
        method: "POST",
      })

      return data
    } catch (error) {
      console.error("Checkout failed:", error)
      toast({
        title: "Checkout failed",
        description: "Please try again later",
        variant: "destructive",
      })
      throw error
    }
  },
}
