import { notFound } from "next/navigation"
import ProductNormal from "./ProductNormal"
import Product3d from "./Product3d"
import { fetchProductById, debugGetProduct, type Product } from "@/lib/ProductApi"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params

  let product: Product

  try {
    // First try the main API endpoint
    console.log(`Attempting to fetch product with ID: ${id}`)
    product = await fetchProductById(id)
  } catch (error) {
    console.error("Main API failed, trying debug endpoint:", error)

    try {
      // If main API fails, try debug endpoint
      product = await debugGetProduct(id)
    } catch (debugError) {
      console.error("Debug API also failed:", debugError)
      notFound()
    }
  }

  // Check if product exists and is active
  if (!product) {
    console.error("Product not found or inactive")
    notFound()
  }

  console.log(`Product loaded: ${product.name}, is_3d: ${product.is_3d}`)

  // Route based on is_3d boolean value
  if (product.is_3d) {
    return <Product3d product={product} />
  } else {
    return <ProductNormal product={product} />
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params

  try {
    const product = await fetchProductById(id)
    return {
      title: `${product.name} | DXRKICE`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.image_url],
      },
    }
  } catch {
    return {
      title: "Product Not Found | DXRKICE",
    }
  }
}
