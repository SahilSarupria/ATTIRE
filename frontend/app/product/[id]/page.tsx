"use client"

import { useRef, useState, useEffect } from "react"
import type { User } from '@/types.ts';
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, Environment, PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, ShoppingCart, ArrowLeft, Truck, ShoppingBag, Shield, User2, LogOut } from "lucide-react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { authService } from '@/lib/api-auth';
import { notFound } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type * as THREE from "three"
import SlidingCart from "@/components/sliding-cart"

// Product data - in a real app, this would come from a database
const products = [
  {
    id: 1,
    name: "Urban Minimalist Tee",
    description: "Essential organic cotton t-shirt with a relaxed fit and clean lines.",
    category: "Essentials",
    price: 49.99,
    image: "/jjk-megumi-1.png",
    color: "orange",
  },
  {
    id: 2,
    name: "Structured Denim Jacket",
    description: "Timeless denim jacket with a modern cut and sustainable production.",
    category: "Outerwear",
    price: 129.99,
    image: "/favicon.png",
    color: "red",
  },
  {
    id: 3,
    name: "Tailored Wool Trousers",
    description: "Premium wool trousers with a tailored fit and subtle texture.",
    category: "Bottoms",
    price: 89.99,
    image: "/jjk-megumi-1.png",
    color: "gray",
  },
  {
    id: 4,
    name: "Oversized Linen Shirt",
    description: "Breathable linen shirt with an oversized silhouette for effortless style.",
    category: "Tops",
    price: 69.99,
    image: "/pant.png",
    color: "orange",
  },
  {
    id: 5,
    name: "Structured Blazer",
    description: "Versatile blazer with clean lines and a contemporary fit.",
    category: "Outerwear",
    price: 159.99,
    image: "/jjk-megumi-1.png",
    color: "red",
  },
  {
    id: 6,
    name: "Relaxed Chino Pants",
    description: "Comfortable chinos with a relaxed fit and sustainable cotton blend.",
    category: "Bottoms",
    price: 79.99,
    image: "/pant.png",
    color: "gray",
  },
  {
    id: 7,
    name: "Merino Wool Sweater",
    description: "Luxurious merino wool sweater with a timeless design and exceptional comfort.",
    category: "Knitwear",
    price: 119.99,
    image: "/jjk-megumi-1.png",
    color: "orange",
  },
  {
    id: 8,
    name: "Utility Cargo Pants",
    description: "Functional cargo pants with a modern silhouette and durable construction.",
    category: "Bottoms",
    price: 99.99,
    image: "/pant.png",
    color: "red",
  },
]

// Define user type
type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}


// 3D T-Shirt Component
function TShirt({ mousePosition, selectedColor }: { mousePosition: { x: number; y: number }; selectedColor: string }) {
  const meshRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF("/assets/3d/toji6.glb")

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = (mousePosition.x - 0.5) * Math.PI * 0.5
      meshRef.current.rotation.x = (mousePosition.y - 0.5) * Math.PI * 0.2
    }
  })

  return (
    <group ref={meshRef} scale={[0.6, 0.6, 0.6]} position={[0, -0.5, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// Mouse tracker component
function MouseTracker({ onMouseMove }: { onMouseMove: (position: { x: number; y: number }) => void }) {
  const { size } = useThree()

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth
      const y = event.clientY / window.innerHeight
      onMouseMove({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [onMouseMove])

  return null
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
const { toast } = useToast()
  const productId = params?.id ? Number.parseInt(params.id as string) : null
  const product = productId ? products.find((p) => p.id === productId) : null
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [selectedColor, setSelectedColor] = useState("black")
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedFabric, setSelectedFabric] = useState("cotton")
  const [quantity, setQuantity] = useState(1)
  const [leftColumnHovered, setLeftColumnHovered] = useState(false)
  const [rightColumnHovered, setRightColumnHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)



useEffect(() => {
  if (isCartOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  return () => {
    document.body.style.overflow = ''
  }
}, [isCartOpen])

  // If product not found, show 404
  if (!product) {
    notFound()
  }

   const navigateToProfile = () => {
    router.push("/profile")
  }

  const fetchUserProfile = async () => {
         setIsLoading(true);
         try {
           const userData: User = await authService.getProfile();
     
           const formattedUser: UserType = {
             email: userData.email,
             name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username || "No Name",
             isLoggedIn: true,
           };
     
           setUser(formattedUser);
         } catch (error) {
           setUser(null);
         } finally {
           setIsLoading(false);
         }
       };

  useEffect(() => {
             fetchUserProfile();
           }, []);

  const handleLogout = async () => {
           try {
             await authService.logout();
         
             // Clear user state immediately
             setUser(null);
         
             // Optionally redirect or refresh the current route without reload
             router.replace(pathname);
         
             toast({
               title: "Logged out",
               description: "You have been successfully logged out.",
               duration: 3000,
             });
           } catch (error) {
             console.error("Logout failed:", error);
             toast({
               title: "Logout error",
               description: "Something went wrong while logging out.",
               duration: 3000,
             });
           }
         };

  const colors = [
    { name: "black", label: "Midnight Black", color: "#1a1a1a" },
    { name: "white", label: "Pure White", color: "#f5f5f5" },
    { name: "navy", label: "Navy Blue", color: "#1e3a8a" },
    { name: "gray", label: "Stone Gray", color: "#6b7280" },
  ]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const fabrics = [
    { name: "cotton", label: "100% Organic Cotton", price: 0 },
    { name: "bamboo", label: "Bamboo Blend", price: 15 },
    { name: "hemp", label: "Hemp Cotton", price: 20 },
    { name: "modal", label: "Modal Silk", price: 25 },
  ]

  const basePrice = product.price
  const fabricPrice = fabrics.find((f) => f.name === selectedFabric)?.price || 0
  const totalPrice = basePrice + fabricPrice

  const handleAddToCart = () => {
    console.log("Added to cart:", { product, selectedColor, selectedSize, selectedFabric, quantity, totalPrice })
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-orange-900/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-white hover:text-orange-500" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold tracking-wider transition-opacity font-creepster duration-500 pl-10"
            style={{
              fontFamily: "'October Crow', cursive",
              letterSpacing: "0.2em",
            }}
          >
            DXRKICE
          </Link>
          <div className="flex items-center gap-2 pr-10">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsCartOpen(true)}
                          className="relative hover:bg-orange-500/20 transition-colors duration-200"
                        >
                          <ShoppingBag className="h-5 w-5" />
                           {/* Cart item count badge */}
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-black text-xs">
                            3
                          </Badge>
                          <span className="sr-only">Shopping cart</span>
                        </Button>
                        {user && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="relative">
                                            <User2 className="h-5 w-5" />
                                            <span className="sr-only">User menu</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                          <DropdownMenuLabel className="font-normal text-sm text-gray-500">{user.email}</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={navigateToProfile}>Profile</DropdownMenuItem>
                                          <DropdownMenuItem onClick={navigateToProfile}>Orders</DropdownMenuItem>
                                          <DropdownMenuItem onClick={navigateToProfile}>Wishlist</DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
          </div>
        </div>
      </header>
{/* Sliding Cart Component */}
            <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <div className="pt-16 grid grid-cols-12">
        {/* Center Column - 3D Model */}
        <div className="fixed inset-0 top-16 z-10 pointer-events-none">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-2/3 h-full relative pointer-events-auto">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="studio" />
                <TShirt mousePosition={mousePosition} selectedColor={selectedColor} />
                <MouseTracker onMouseMove={setMousePosition} />
              </Canvas>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <Button
                onClick={handleWishlist}
                size="icon"
                className={`w-14 h-14 rounded-full transition-all duration-300 ${
                  isWishlisted
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>

              <Button
                onClick={handleAddToCart}
                size="icon"
                className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-black transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="w-7 h-7" />
              </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-12">
          {/* Left Column - Product Details */}
          <div
            className={`col-span-3 p-8 pt-0 min-h-screen transition-all duration-500 ease-in-out ${
              rightColumnHovered ? "opacity-30 blur-sm" : "opacity-100 blur-0"
            }`}
            onMouseEnter={() => setLeftColumnHovered(true)}
            onMouseLeave={() => setLeftColumnHovered(false)}
          >
            <div className="space-y-6 max-w-sm">
              <div className="pt-8">
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 mb-4">{product.category}</Badge>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-400 text-lg">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? "fill-orange-500 text-orange-500" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">(127 reviews)</span>
              </div>

              <div className="text-4xl font-bold text-orange-500">
                ${totalPrice.toFixed(2)}
                {fabricPrice > 0 && (
                  <span className="text-lg text-gray-400 ml-2">
                    (+${fabricPrice} for {fabrics.find((f) => f.name === selectedFabric)?.label})
                  </span>
                )}
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Relaxed fit with dropped shoulders</li>
                  <li>• Pre-shrunk for consistent sizing</li>
                  <li>• Reinforced seams for durability</li>
                  <li>• Tagless for comfort</li>
                  <li>• Ethically manufactured</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Care Instructions</h3>
                <p className="text-gray-400 text-sm">
                  Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Free shipping over $75
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  30-day returns
                </div>
              </div>
            </div>
          </div>

          {/* Center spacer */}
          <div className="col-span-6"></div>

          {/* Right Column - Customization */}
          <div
            className={`col-span-3 p-8 transition-all duration-500 ease-in-out ${
              leftColumnHovered ? "opacity-30 blur-sm" : "opacity-100 blur-0"
            }`}
            onMouseEnter={() => setRightColumnHovered(true)}
            onMouseLeave={() => setRightColumnHovered(false)}
          >
            <div className="space-y-8 sticky top-24">
              {/* Color Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Color</h3>
                <div className="grid grid-cols-2 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedColor === color.name
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-600"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm">{color.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedSize === size
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <Button variant="link" className="text-orange-500 p-0 h-auto text-sm">
                  Size Guide
                </Button>
              </div>

              {/* Fabric Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fabric</h3>
                <div className="space-y-2">
                  {fabrics.map((fabric) => (
                    <button
                      key={fabric.name}
                      onClick={() => setSelectedFabric(fabric.name)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                        selectedFabric === fabric.name
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{fabric.label}</span>
                        {fabric.price > 0 && <span className="text-sm text-orange-500">+${fabric.price}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-gray-700"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-gray-700"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3" size="lg">
                  Add to Cart - ${(totalPrice * quantity).toFixed(2)}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-current" : ""}`} />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
              </div>

              {/* Summary */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Color:</span>
                      <span>{colors.find((c) => c.name === selectedColor)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span>{selectedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fabric:</span>
                      <span>{fabrics.find((f) => f.name === selectedFabric)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                    <Separator className="bg-gray-700 my-2" />
                    <div className="flex justify-between font-semibold text-orange-500">
                      <span>Total:</span>
                      <span>${(totalPrice * quantity).toFixed(2)}</span>
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
