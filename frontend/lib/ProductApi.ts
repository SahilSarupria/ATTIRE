// ProductApi.ts - Updated for Django backend
export interface ProductVariant {
  id: string
  product: string
  size: string
  color?: string
  sku?: string
  price: number
  inventory: number
  is_active: boolean
}

// Add this new interface for ProductMedia
export interface ProductMedia {
  id: string
  media_url: string
  media_type: 'image' | '3d' | 'video'
  is_primary: boolean
  uploaded_at: string
  product_id: string
}

// Update the existing Product interface to include media
export interface Product {
  id: string
  name: string
  description: string
  image_url: string
  base_price: number
  category: string
  fabric?: string
  color?: string
  is_active: boolean
  is_3d: boolean
  created_by_name?: string
  created_at: string
  updated_at: string
  variants: ProductVariant[]
  media?: ProductMedia[]  // Add this line
  average_rating: number
  review_count: number
}

export interface ProductCreateUpdateInput {
  name: string
  description: string
  category: string
  base_price: number
  fabric?: string
  color?: string
  is_3d?: boolean
  image?: File
  is_active?: boolean
}

// Your Django backend URL

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

export interface PaginatedProductResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export async function fetchProducts(category?: string, search?: string): Promise<PaginatedProductResponse> {
  const params = new URLSearchParams()
  if (category) params.append("category", category)
  if (search) params.append("search", search)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/?${params.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Add a helper function to get just the products array
export async function fetchProductsArray(category?: string, search?: string): Promise<Product[]> {
  const response = await fetchProducts(category, search)
  return response.results
}

// NEW: Function to fetch ALL products without any category filter
export async function fetchAllProducts(search?: string): Promise<Product[]> {
  const params = new URLSearchParams()
  if (search) params.append("search", search)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/?${params.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch all products: ${res.status} ${res.statusText}`)
  }

  const response: PaginatedProductResponse = await res.json()
  return response.results
}

// NEW: Function to fetch ALL products with pagination support
export async function fetchAllProductsPaginated(
  search?: string,
  page?: number,
  limit?: number,
): Promise<PaginatedProductResponse> {
  const params = new URLSearchParams()
  if (search) params.append("search", search)
  if (page) params.append("page", page.toString())
  if (limit) params.append("limit", limit.toString())

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/?${params.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch all products: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function fetchProductById(productId: string): Promise<Product> {
  console.log(`Fetching product with ID: ${productId}`)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  })

  if (!res.ok) {
    console.error(`Failed to fetch product ${productId}: ${res.status} ${res.statusText}`)
    throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`)
  }

  const product = await res.json()
  console.log(`Successfully fetched product: ${product.name}`)
  return product
}

// Debug function to list all products
export async function debugListProducts(): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/products/`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch debug products: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Debug function to get a specific product
export async function debugGetProduct(productId: string): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/products/${productId}/`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(`Failed to fetch debug product: ${JSON.stringify(errorData)}`)
  }

  return res.json()
}

// Admin-only APIs: require JWT token string passed as `token`
export async function createProduct(data: ProductCreateUpdateInput, token: string): Promise<Product> {
  const formData = new FormData()
  formData.append("name", data.name)
  formData.append("description", data.description)
  formData.append("category", data.category)
  formData.append("base_price", data.base_price.toString())
  if (data.fabric) formData.append("fabric", data.fabric)
  if (data.color) formData.append("color", data.color)
  if (data.is_3d !== undefined) formData.append("is_3d", data.is_3d ? "true" : "false")
  if (data.image) formData.append("image", data.image)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/create/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NOTE: Don't set Content-Type when using FormData; browser sets it automatically
    },
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to create product")
  }

  return res.json()
}

export async function updateProduct(
  productId: string,
  data: ProductCreateUpdateInput,
  token: string,
): Promise<Product> {
  const formData = new FormData()
  if (data.name) formData.append("name", data.name)
  if (data.description) formData.append("description", data.description)
  if (data.category) formData.append("category", data.category)
  if (data.base_price !== undefined) formData.append("base_price", data.base_price.toString())
  if (data.fabric) formData.append("fabric", data.fabric)
  if (data.color) formData.append("color", data.color)
  if (data.is_3d !== undefined) formData.append("is_3d", data.is_3d ? "true" : "false")
  if (data.is_active !== undefined) formData.append("is_active", data.is_active ? "true" : "false")
  if (data.image) formData.append("image", data.image)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/update/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to update product")
  }

  return res.json()
}

export async function deleteProduct(productId: string, token: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/delete/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to delete product")
  }
}
