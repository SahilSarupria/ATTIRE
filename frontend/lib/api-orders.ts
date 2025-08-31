import { authService } from "./api-auth"


export interface Address {
  first_name: string
  last_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

export interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    image_url: string
    description: string
  }
  variant?: {
    id: string
    size: string
    color: string
    price: number
  }
  quantity: number
  unit_price: number
  total_price: number
  customizations?: any
  manufacturing_status: string
}

export interface Order {
  id: string
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  payment_status: string
  shipping_address: Address
  billing_address: Address
  estimated_delivery: string
  tracking_number?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface CreateOrderRequest {
  shipping_address: Address
  billing_address: Address
  payment_method_id?: string
}

export interface CreateOrderResponse {
  order: Order
  client_secret: string
}

class OrderService {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/`)
      const data = await response.json()
      return data.orders
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/`)
      const data = await response.json()
      return data.order
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error)
      throw error
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/create/`, {
        method: "POST",
        body: JSON.stringify(orderData),
      })
      return await response.json()
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel/`, {
        method: "POST",
      })
      return await response.json()
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error)
      throw error
    }
  }
}

export const orderService = new OrderService()
