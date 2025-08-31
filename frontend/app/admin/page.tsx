"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  Layers,
  Settings,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Factory,
  Bell,
} from "lucide-react"
import { adminService, type AdminStats } from "@/lib/api-admin"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    products3D: 0,
    productsWithoutImage: 0,
    categoryStats: {},
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard statistics"
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

  const adminMenuItems = [
    {
      title: "Products",
      description: "Manage your product catalog",
      icon: Package,
      path: "/admin/products",
      color: "text-orange-500",
      stats: `${stats.totalProducts} total`,
    },
    {
      title: "Orders",
      description: "View and manage customer orders",
      icon: ShoppingCart,
      path: "/admin/orders",
      color: "text-blue-500",
      stats: `${stats.pendingOrders} pending`,
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: Users,
      path: "/admin/users",
      color: "text-green-500",
      stats: `${stats.totalUsers} registered`,
    },
    {
      title: "Analytics",
      description: "View sales and performance analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "text-purple-500",
      stats: `$${stats.monthlyRevenue.toFixed(2)} this month`,
    },
    {
      title: "Manufacturing",
      description: "Manage production and manufacturing",
      icon: Factory,
      path: "/admin/manufacturing",
      color: "text-yellow-500",
      stats: "Production orders",
    },
    {
      title: "Notifications",
      description: "Manage notification templates and campaigns",
      icon: Bell,
      path: "/admin/notifications",
      color: "text-red-500",
      stats: "Email templates",
    },
    {
      title: "Settings",
      description: "Configure store settings",
      icon: Settings,
      path: "/admin/settings",
      color: "text-gray-400",
      stats: "System config",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Dashboard Error</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchDashboardStats} className="bg-orange-500 hover:bg-orange-600 text-black">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome to your comprehensive store management dashboard</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                <TrendingUp className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <ShoppingCart className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <Users className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <Package className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.activeProducts}</div>
                <Package className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">3D Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.products3D}</div>
                <Layers className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <ShoppingCart className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Products Without Images</CardTitle>
              <CardDescription className="text-gray-400">Products that need images uploaded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{stats.productsWithoutImage}</div>
                <Button
                  onClick={() => router.push("/admin/products?filter=noimage")}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription className="text-gray-400">Products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.categoryStats || {}).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminMenuItems.map((item, index) => (
            <Card
              key={index}
              className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => router.push(item.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md bg-gray-800 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{item.title}</CardTitle>
                    <div className="text-xs text-gray-500 mt-1">{item.stats}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
