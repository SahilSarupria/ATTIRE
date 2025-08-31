"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react"
import { adminService, type AnalyticsData } from "@/lib/api-admin"
import { Button } from "@/components/ui/button"

export default function AdminAnalyticsPage() {
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getAnalytics({ period })
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load analytics"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Analytics Error</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchAnalytics} className="bg-orange-500 hover:bg-orange-600 text-black">
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
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your store's performance and insights</p>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${analytics?.revenue.monthly.reduce((sum, item) => sum + item.amount, 0).toFixed(2) || "0.00"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {analytics?.orders.monthly.reduce((sum, item) => sum + item.count, 0) || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +8% from last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                New Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {analytics?.users.registrations.reduce((sum, item) => sum + item.count, 0) || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +15% from last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                $
                {analytics && analytics.orders.monthly.reduce((sum, item) => sum + item.count, 0) > 0
                  ? (
                      analytics.revenue.monthly.reduce((sum, item) => sum + item.amount, 0) /
                      analytics.orders.monthly.reduce((sum, item) => sum + item.count, 0)
                    ).toFixed(2)
                  : "0.00"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +5% from last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Revenue Trend
              </CardTitle>
              <CardDescription className="text-gray-400">Daily revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Revenue chart visualization</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Order Volume
              </CardTitle>
              <CardDescription className="text-gray-400">Daily orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Order volume chart visualization</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription className="text-gray-400">Best performing products by sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.products.topSelling.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-400">{product.sales} sales</div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sales data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription className="text-gray-400">Sales by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.products.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {category.category.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{category.category}</div>
                        <div className="text-sm text-gray-400">{category.count} products</div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
