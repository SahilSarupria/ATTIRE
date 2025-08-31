"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Loader2, Save, Trash, AlertCircle } from "lucide-react"
import Image from "next/image"
import { adminService } from "@/lib/api-admin"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    base_price: "",
    fabric: "",
    color: "",
    is_3d: false,
    image_file: null as File | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setFormData((prev) => ({ ...prev, image_file: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setPreviewImage(null)
    setFormData((prev) => ({ ...prev, image_file: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    if (!formData.base_price || Number(formData.base_price) <= 0) {
      newErrors.base_price = "Valid price is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData object for file upload
      const submitData = new FormData()
      submitData.append("name", formData.name.trim())
      submitData.append("description", formData.description.trim())
      submitData.append("category", formData.category)
      submitData.append("base_price", formData.base_price)
      submitData.append("fabric", formData.fabric.trim())
      submitData.append("color", formData.color.trim())
      submitData.append("is_3d", formData.is_3d.toString())

      if (formData.image_file) {
        submitData.append("image", formData.image_file)
      }

      await adminService.createProduct(submitData)

      toast({
        title: "Product created",
        description: `"${formData.name}" has been successfully created`,
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create product"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription className="text-gray-400">Enter the core details about the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Urban Minimalist Tee"
                      className={`bg-gray-800 border-gray-700 ${errors.name ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Essential organic cotton t-shirt with a relaxed fit and clean lines."
                      className={`bg-gray-800 border-gray-700 min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.description && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger
                        className={`bg-gray-800 border-gray-700 ${errors.category ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="dress">Dress</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="footwear">Footwear</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.category}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price ($) *</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      placeholder="49.99"
                      className={`bg-gray-800 border-gray-700 ${errors.base_price ? "border-red-500" : ""}`}
                      required
                    />
                    {errors.base_price && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.base_price}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Details */}
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription className="text-gray-400">Additional information about the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fabric">Fabric</Label>
                    <Input
                      id="fabric"
                      name="fabric"
                      value={formData.fabric}
                      onChange={handleInputChange}
                      placeholder="Organic Cotton"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Black"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <Separator className="my-4 bg-gray-800" />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_3d"
                      checked={formData.is_3d}
                      onCheckedChange={(checked) => handleCheckboxChange("is_3d", checked === true)}
                    />
                    <Label
                      htmlFor="is_3d"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      3D Product View
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload a high-quality product image (max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6 cursor-pointer hover:border-orange-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <div className="relative w-full aspect-square mb-4">
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Product preview"
                          fill
                          className="object-contain rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearImage()
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-sm text-gray-400 text-center">
                          Click to upload or drag and drop
                          <br />
                          SVG, PNG, JPG or GIF (max. 5MB)
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Submit */}
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Product Preview</CardTitle>
                  <CardDescription className="text-gray-400">Review your product before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-black p-4 border border-gray-800">
                    <div className="space-y-4">
                      {formData.name && <h3 className="text-xl font-bold text-white">{formData.name}</h3>}

                      {formData.category && (
                        <div className="inline-block bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-1 rounded-md text-xs">
                          {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                        </div>
                      )}

                      {formData.description && <p className="text-sm text-gray-400">{formData.description}</p>}

                      {formData.base_price && (
                        <div className="text-2xl font-bold text-orange-500">
                          ${Number.parseFloat(formData.base_price).toFixed(2)}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs">
                        {formData.fabric && <span className="bg-gray-800 px-2 py-1 rounded">{formData.fabric}</span>}
                        {formData.color && <span className="bg-gray-800 px-2 py-1 rounded">{formData.color}</span>}
                        {formData.is_3d && (
                          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-1 rounded">
                            3D View
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Product
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="text-sm text-gray-400">
                <p>* Required fields</p>
                <p className="mt-2">
                  Products marked as "3D" will use the interactive 3D viewer on the product page. Make sure you have a
                  compatible 3D model available.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
