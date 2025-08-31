"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Hash,
  MapPin,
  Star,
  Download,
  MessageCircle,
  Copy,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/api-auth"

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    image?: string
  }
  variant?: {
    id: string
    size?: string
    color?: string
  }
  quantity: number
  unit_price: string
  total_price: string
  customizations?: any
  manufacturing_status: "pending" | "in_production" | "completed"
}

interface Order {
  id: string
  order_number: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  subtotal: string
  tax: string
  shipping: string
  total: string
  currency: string
  shipping_address: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billing_address: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  estimated_delivery?: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

interface OrderDetailPageProps {
  params: {
    orderId: string
  }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.orderId])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.orderId}/`)

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        throw new Error("Failed to fetch order")
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    try {
      setIsCancelling(true)
      const response = await authService.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/cancel/`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel order")
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder)

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      })
    } catch (error: any) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const copyTrackingNumber = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number)
      toast({
        title: "Copied!",
        description: "Tracking number copied to clipboard",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
      case "processing":
        return "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
      case "shipped":
        return "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
      case "delivered":
        return "bg-green-500/20 text-green-400 hover:bg-green-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 hover:bg-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
      case "paid":
        return "bg-green-500/20 text-green-400 hover:bg-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 hover:bg-red-500/30"
      case "refunded":
        return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
    }
  }

  const getManufacturingStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
      case "in_production":
        return "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 hover:bg-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
    }
  }

  const canCancelOrder = (order: Order) => {
    return order.status !== "shipped" && order.status !== "delivered" && order.status !== "cancelled"
  }

  const getTimelineSteps = (order: Order) => {
    const baseSteps = [
      {
        id: "placed",
        title: "Order Placed",
        description: "We've received your order",
        date: order.created_at,
        completed: true,
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      },
    ]

    if (order.status !== "pending" && order.status !== "cancelled") {
      baseSteps.push({
        id: "confirmed",
        title: "Order Confirmed",
        description: "Payment processed successfully",
        date: order.updated_at,
        completed: true,
        icon: CheckCircle,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      })
    }

    if (["processing", "shipped", "delivered"].includes(order.status)) {
      baseSteps.push({
        id: "processing",
        title: "In Production",
        description: "Your items are being crafted",
        date: order.updated_at,
        completed: true,
        icon: Package,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      })
    }

    if (["shipped", "delivered"].includes(order.status)) {
      baseSteps.push({
        id: "shipped",
        title: "Shipped",
        description: order.tracking_number ? `Tracking: ${order.tracking_number}` : "On its way to you",
        date: order.updated_at,
        completed: true,
        icon: Truck,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
      })
    }

    if (order.status === "delivered") {
      baseSteps.push({
        id: "delivered",
        title: "Delivered",
        description: "Order completed successfully",
        date: order.updated_at,
        completed: true,
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      })
    }

    if (order.status === "cancelled") {
      baseSteps.push({
        id: "cancelled",
        title: "Order Cancelled",
        description: "This order has been cancelled",
        date: order.updated_at,
        completed: true,
        icon: XCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      })
    }

    return baseSteps
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          </div>
          <div className="text-xl font-medium text-white mb-2">Loading Order Details</div>
          <div className="text-gray-400">Please wait while we fetch your order information</div>
        </div>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
            <p className="text-gray-400">The order you're looking for doesn't exist or you don't have access to it.</p>
          </div>
          <Button onClick={() => router.push("/profile")} className="bg-orange-500 text-black hover:bg-orange-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
        </div>
      </div>
    )
  }

  const timelineSteps = getTimelineSteps(order)
  const isCompleted = order.status === "delivered"
  const isCancelled = order.status === "cancelled"

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Order #{order.order_number}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Placed{" "}
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  <span>{order.items.length} items</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Badge className={`${getStatusColor(order.status)} px-4 py-2 text-sm font-medium`}>
                {getStatusIcon(order.status)}
                <span className="ml-2 capitalize">{order.status.replace("_", " ")}</span>
              </Badge>
              <Badge className={`${getPaymentStatusColor(order.payment_status)} px-4 py-2 text-sm font-medium`}>
                <CreditCard className="h-4 w-4" />
                <span className="ml-2 capitalize">{order.payment_status}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success/Completion Message */}
        {isCompleted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Order Delivered Successfully!</h3>
                    <p className="text-green-400">
                      Your order was delivered on{" "}
                      {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : "schedule"}.
                      We hope you love your purchase!
                    </p>
                  </div>
                </div>
                {isCompleted && (
                  <div className="mt-4 flex gap-3">
                    <Button variant="outline" className="border-green-500/50 hover:bg-green-500/20">
                      <Star className="h-4 w-4 mr-2" />
                      Leave a Review
                    </Button>
                    <Button variant="outline" className="border-green-500/50 hover:bg-green-500/20">
                      <Package className="h-4 w-4 mr-2" />
                      Reorder Items
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Cancellation Message */}
        {isCancelled && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Order Cancelled</h3>
                    <p className="text-red-400">
                      This order was cancelled. If you have any questions, please contact our support team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Order Timeline */}
            <Card className="bg-gray-900/50 border-orange-900/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-orange-400" />
                  Order Progress
                </CardTitle>
                <CardDescription>Track your order from placement to delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const isLast = index === timelineSteps.length - 1

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4"
                      >
                        {!isLast && <div className="absolute left-4 top-12 w-0.5 h-12 bg-gray-700" />}

                        <div
                          className={`h-8 w-8 rounded-full ${step.bgColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <StepIcon className={`h-4 w-4 ${step.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">{step.title}</h4>
                            <span className="text-sm text-gray-400">{new Date(step.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{step.description}</p>

                          {step.id === "shipped" && order.tracking_number && (
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={copyTrackingNumber}
                                className="border-purple-500/50 hover:bg-purple-500/20"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Tracking
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/50 hover:bg-purple-500/20"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Track Package
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-gray-900/50 border-orange-900/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Package className="h-6 w-6 mr-3 text-orange-400" />
                  Order Items
                </CardTitle>
                <CardDescription>
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} in this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="h-24 w-24 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                        <img
                          src={item.product.image || "/placeholder.svg?height=96&width=96"}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-lg mb-2">{item.product.name}</h3>
                        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Hash className="h-3 w-3 mr-1" />
                            Qty: {item.quantity}
                          </span>
                          {item.variant?.size && <span>Size: {item.variant.size}</span>}
                          {item.variant?.color && <span>Color: {item.variant.color}</span>}
                        </div>
                        <Badge className={getManufacturingStatusColor(item.manufacturing_status)}>
                          <Package className="h-3 w-3 mr-1" />
                          {item.manufacturing_status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xl text-orange-400 mb-1">
                          ${Number.parseFloat(item.total_price).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          ${Number.parseFloat(item.unit_price).toFixed(2)} each
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="bg-gray-900/50 border-orange-900/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-orange-400" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-white mb-4 text-lg">Delivery Address</h4>
                    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                      <p className="font-medium text-white text-lg">
                        {order.shipping_address.firstName} {order.shipping_address.lastName}
                      </p>
                      <p className="text-gray-300">{order.shipping_address.address}</p>
                      <p className="text-gray-300">
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                      </p>
                      <p className="text-gray-300">{order.shipping_address.country}</p>

                      <Separator className="bg-gray-700" />

                      <div className="space-y-2">
                        <div className="flex items-center text-gray-300">
                          <Phone className="h-4 w-4 mr-3 text-orange-400" />
                          <span>{order.shipping_address.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Mail className="h-4 w-4 mr-3 text-orange-400" />
                          <span>{order.shipping_address.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-4 text-lg">Delivery Information</h4>
                    <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                      {order.estimated_delivery && (
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-3 text-orange-400" />
                          <div>
                            <p className="text-white font-medium">Estimated Delivery</p>
                            <p className="text-gray-400">{new Date(order.estimated_delivery).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}

                      {order.tracking_number && (
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 mr-3 text-orange-400" />
                          <div>
                            <p className="text-white font-medium">Tracking Number</p>
                            <p className="text-gray-400 font-mono">{order.tracking_number}</p>
                          </div>
                        </div>
                      )}

                      {order.notes && (
                        <div>
                          <h5 className="font-medium text-white mb-2 flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2 text-orange-400" />
                            Special Instructions
                          </h5>
                          <p className="text-gray-400 bg-gray-700/50 rounded-lg p-3">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gray-900/50 border-orange-900/30 sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>${Number.parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>${Number.parseFloat(order.shipping).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>${Number.parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-orange-400">
                      ${Number.parseFloat(order.total).toFixed(2)} {order.currency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900/50 border-orange-900/30">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canCancelOrder(order) && (
                  <Button variant="destructive" className="w-full" onClick={handleCancelOrder} disabled={isCancelling}>
                    {isCancelling ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cancelling...
                      </div>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full border-orange-500/50 hover:bg-orange-500/20"
                  onClick={() => {
                    toast({
                      title: "Download Receipt",
                      description: "Receipt download functionality would be implemented here.",
                    })
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-orange-500/50 hover:bg-orange-500/20"
                  onClick={() => {
                    toast({
                      title: "Contact Support",
                      description: "Support contact functionality would be implemented here.",
                    })
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>

                {isCompleted && (
                  <>
                    <Separator className="bg-gray-700" />
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-medium"
                      onClick={() => {
                        toast({
                          title: "Reorder",
                          description: "Reorder functionality would be implemented here.",
                        })
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Reorder Items
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card className="bg-gray-900/50 border-orange-900/30">
              <CardHeader>
                <CardTitle className="text-xl">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <MessageCircle className="h-4 w-4 mr-3 text-orange-400" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-gray-400">Available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 mr-3 text-orange-400" />
                    <div>
                      <p className="font-medium">1-800-SUPPORT</p>
                      <p className="text-gray-400">Mon-Fri 9AM-6PM</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 mr-3 text-orange-400" />
                    <div>
                      <p className="font-medium">support@store.com</p>
                      <p className="text-gray-400">Response within 24hrs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
