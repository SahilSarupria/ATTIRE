"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CuboidIcon as Cube,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Package,
} from "lucide-react"
import Image from "next/image"
import { adminService } from "@/lib/api-admin"
import type { Product } from "@/lib/ProductApi"

export default function AdminProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [error, setError] = useState<string | null>(null)

  const productsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getProducts({
        page: currentPage,
        search: searchTerm,
        category: searchParams.get("filter") === "noimage" ? "" : undefined,
      })
      console.log("Fetched products response:", data)


      setProducts(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / productsPerPage))
    } catch (error) {
      console.error("Error fetching products:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load products"
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await adminService.deleteProduct(id)
      toast({
        title: "Product deleted",
        description: `"${name}" has been successfully deleted`,
      })
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const url = new URL(window.location.href)
    url.searchParams.set("page", newPage.toString())
    window.history.pushState({}, "", url.toString())
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Failed to Load Products</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchProducts} className="bg-orange-500 hover:bg-orange-600 text-black">
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
            <h1 className="text-2xl font-bold">Product Management</h1>
            <p className="text-gray-400">Manage your store's product catalog</p>
          </div>

          <Button
            onClick={() => router.push("/admin/products/new")}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Product Search</CardTitle>
            <CardDescription className="text-gray-400">Find products by name, description, or category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Products</CardTitle>
            <CardDescription className="text-gray-400">
              {loading ? "Loading..." : `${totalCount} products found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No products found</p>
                <Button
                  onClick={() => router.push("/admin/products/new")}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-800/50">
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                          <div className="flex items-center">
                            Name
                            {sortField === "name" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                          <div className="flex items-center">
                            Category
                            {sortField === "category" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("base_price")}>
                          <div className="flex items-center">
                            Price
                            {sortField === "base_price" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                          </div>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-800/50">
                          <TableCell>
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-800">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-800 border-gray-700">
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{Number(product.base_price).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {product.is_3d && (
                                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                                  <Cube className="h-3 w-3 mr-1" />
                                  3D
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.is_active ? "default" : "secondary"}
                              className={
                                product.is_active
                                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/40"
                              }
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => router.push(`/product/${product.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id, product.name)}
                                className="hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
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
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
      </div>
    </div>
  )
}
