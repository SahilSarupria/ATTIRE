"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  Package,
  Clock,
  DollarSign,
  User,
} from "lucide-react"
import { adminService, type AdminOrder } from "@/lib/api-admin"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

export default function AdminOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // Updated default value to "all"
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  const ordersPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getOrders({
        page: currentPage,
        search: searchTerm,
        status: statusFilter,
      })

      setOrders(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / ordersPerPage))
    } catch (error) {
      console.error("Error fetching orders:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load orders"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchOrders()
  }

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus)
      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      })
      fetchOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", label: "Pending" },
      processing: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", label: "Processing" },
      shipped: { color: "bg-purple-500/20 text-purple-400 border-purple-500/40", label: "Shipped" },
      delivered: { color: "bg-green-500/20 text-green-400 border-green-500/40", label: "Delivered" },
      cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/40", label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Failed to Load Orders</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchOrders} className="bg-orange-500 hover:bg-orange-600 text-black">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-gray-400">View and manage customer orders</p>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Order Search & Filters</CardTitle>
            <CardDescription className="text-gray-400">Find orders by customer or order ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <Button type="submit" variant="secondary" disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem> {/* Updated value to "all" */}
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Orders</CardTitle>
            <CardDescription className="text-gray-400">
              {loading ? "Loading..." : `${totalCount} orders found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No orders found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-800/50">
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-800/50">
                          <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">
                                  {order.user.first_name} {order.user.last_name}
                                </div>
                                <div className="text-xs text-gray-500">{order.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span>{order.items.length} items</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">
                                ${Number(order.total).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {formatDate(order.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedOrder && `Order #${selectedOrder.id.slice(-8)} - ${formatDate(selectedOrder.created_at)}`}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Status Update */}
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Order Status</h3>
                    <p className="text-sm text-gray-400">Update the current status of this order</p>
                  </div>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[200px] bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <span className="ml-2">
                          {selectedOrder.user.first_name} {selectedOrder.user.last_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="ml-2">{selectedOrder.user.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-gray-400">Order ID:</span>
                        <span className="ml-2">#{selectedOrder.id.slice(-8)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <span className="ml-2 font-semibold text-green-400">
                          ${Number(selectedOrder.total).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                          <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-600">
                            {item.product.image_url ? (
                              <Image
                                src={item.product.image_url || "/placeholder.svg"}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${Number(item.unit_price).toFixed(2)}</div>
                            <div className="text-sm text-gray-400">each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
