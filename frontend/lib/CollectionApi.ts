

export interface ProductVariant {
  id: string
  size: string
  color: string
  sku: string
  price: number
  inventory: number
  is_active: boolean
}

class ProductService {
  async getProducts(params?: {
    category?: string
    search?: string
  }): Promise<ProductType[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.category) searchParams.append("category", params.category)
      if (params?.search) searchParams.append("search", params.search)

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }

  async getProduct(id: string): Promise<ProductType> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Product not found")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching product:", error)
      throw error
    }
  }
}

// Re-export everything from ProductApi for compatibility
export * from "./ProductApi"

// Create a productService-like object for backward compatibility
import { fetchProductsArray, fetchProductById, type Product as ProductType } from "./ProductApi"

export const productService = {
  async getProducts(params?: {
    category?: string
    search?: string
  }): Promise<ProductType[]> {
    return fetchProductsArray(params?.category, params?.search)
  },

  async getProduct(id: string): Promise<ProductType> {
    return fetchProductById(id)
  },
}

// Re-export the Product type
export type { ProductType as Product }
