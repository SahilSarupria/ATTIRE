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
  Plus,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Factory,
  Package,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { adminService, type ManufacturingOrder } from "@/lib/api-admin"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function AdminManufacturingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [orders, setOrders] = useState<ManufacturingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [priorityFilter, setPriorityFilter] = useState("medium")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ManufacturingOrder | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const ordersPerPage = 10

  const [newOrder, setNewOrder] = useState({
    product_id: "",
    quantity: 1,
    priority: "medium",
    notes: "",
  })

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, priorityFilter])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getManufacturingOrders({
        page: currentPage,
        status: statusFilter,
        priority: priorityFilter,
      })

      setOrders(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / ordersPerPage))
    } catch (error) {
      console.error("Error fetching manufacturing orders:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load manufacturing orders"
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminService.createManufacturingOrder(newOrder)
      toast({
        title: "Manufacturing order created",
        description: "New manufacturing order has been created successfully",
      })
      setIsCreateDialogOpen(false)
      setNewOrder({ product_id: "", quantity: 1, priority: "medium", notes: "" })
      fetchOrders()
    } catch (error) {
      console.error("Error creating manufacturing order:", error)
      toast({
        title: "Error",
        description: "Failed to create manufacturing order",
        variant: "destructive",
      })
    }
  }

  const handleEditOrder = (order: ManufacturingOrder) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    try {
      await adminService.updateManufacturingOrder(editingOrder.id, {
        quantity: editingOrder.quantity,
        status: editingOrder.status,
        priority: editingOrder.priority,
        notes: editingOrder.notes,
      })

      toast({
        title: "Manufacturing order updated",
        description: "Order has been updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingOrder(null)
      fetchOrders()
    } catch (error) {
      console.error("Error updating manufacturing order:", error)
      toast({
        title: "Error",
        description: "Failed to update manufacturing order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", label: "Pending" },
      in_progress: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", label: "In Progress" },
      completed: { color: "bg-green-500/20 text-green-400 border-green-500/40", label: "Completed" },
      cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/40", label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-gray-500/20 text-gray-400 border-gray-500/40", label: "Low" },
      medium: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", label: "Medium" },
      high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/40", label: "High" },
      urgent: { color: "bg-red-500/20 text-red-400 border-red-500/40", label: "Urgent" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium

    return (
      <Badge className={config.color}>
        {priority === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Failed to Load Manufacturing Orders</h2>
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
            <h1 className="text-2xl font-bold">Manufacturing Management</h1>
            <p className="text-gray-400">Manage production orders and manufacturing workflow</p>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-black">
            <Plus className="mr-2 h-4 w-4" />
            New Manufacturing Order
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filters</CardTitle>
            <CardDescription className="text-gray-400">
              Filter manufacturing orders by status and priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Manufacturing Orders</CardTitle>
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
                <Factory className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No manufacturing orders found</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Order
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-800/50">
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Est. Completion</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-800/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800">
                                {order.product.image_url ? (
                                  <Image
                                    src={order.product.image_url || "/placeholder.svg"}
                                    alt={order.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                    <Package className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{order.product.name}</div>
                                <div className="text-xs text-gray-500">ID: {order.id.slice(-8)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{order.quantity}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {formatDate(order.estimated_completion)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(order.created_at)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)}>
                                <Edit className="h-4 w-4" />
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

        {/* Create Manufacturing Order Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create Manufacturing Order</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new manufacturing order for production
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product_id">Product ID</Label>
                <Input
                  id="product_id"
                  value={newOrder.product_id}
                  onChange={(e) => setNewOrder({ ...newOrder, product_id: e.target.value })}
                  placeholder="Enter product ID"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({ ...newOrder, quantity: Number.parseInt(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newOrder.priority}
                  onValueChange={(value) => setNewOrder({ ...newOrder, priority: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Additional notes or requirements"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
                  Create Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Manufacturing Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Edit Manufacturing Order</DialogTitle>
              <DialogDescription className="text-gray-400">Update manufacturing order details</DialogDescription>
            </DialogHeader>
            {editingOrder && (
              <form onSubmit={handleUpdateOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_quantity">Quantity</Label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    min="1"
                    value={editingOrder.quantity}
                    onChange={(e) => setEditingOrder({ ...editingOrder, quantity: Number.parseInt(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={editingOrder.status}
                    onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_priority">Priority</Label>
                  <Select
                    value={editingOrder.priority}
                    onValueChange={(value) => setEditingOrder({ ...editingOrder, priority: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea
                    id="edit_notes"
                    value={editingOrder.notes}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    placeholder="Additional notes or requirements"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
                    Update Order
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
