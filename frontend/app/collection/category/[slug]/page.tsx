"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"

import { authService } from '@/lib/api-auth';
import type { User } from '@/types.ts';
import Link from "next/link"
import SlidingCart from "@/components/sliding-cart"

import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import {
  Search,
  Grid3X3,
  List,
  Heart,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  User2,
  Star,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

// Expanded product data with many more products
const allProducts = [
  // T-Shirts (12 products)
  {
    id: 1,
    name: "Urban Minimalist Tee",
    category: "tshirt",
    subcategory: "basic-tee",
    price: 49.99,
    originalPrice: 59.99,
    image: "/tshirt.jpg",
    colors: ["black", "white", "gray"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 127,
    isNew: true,
    onSale: true,
  },
  {
    id: 2,
    name: "Vintage Band Tee",
    category: "tshirt",
    subcategory: "graphic-tee",
    price: 39.99,
    originalPrice: 49.99,
    image: "/tshirt.jpg",
    colors: ["black", "gray"],
    sizes: ["S", "M", "L"],
    rating: 4.3,
    reviews: 89,
    isNew: false,
    onSale: true,
  },
  {
    id: 3,
    name: "Premium Cotton Tee",
    category: "tshirt",
    subcategory: "premium-tee",
    price: 59.99,
    originalPrice: 59.99,
    image: "/tshirt.jpg",
    colors: ["white", "navy", "olive"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviews: 156,
    isNew: true,
    onSale: false,
  },
  {
    id: 16,
    name: "Retro Graphic Tee",
    category: "tshirt",
    subcategory: "graphic-tee",
    price: 44.99,
    originalPrice: 54.99,
    image: "/tshirt.jpg",
    colors: ["black", "white", "red"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.4,
    reviews: 203,
    isNew: false,
    onSale: true,
  },
  {
    id: 17,
    name: "Organic Hemp Tee",
    category: "tshirt",
    subcategory: "premium-tee",
    price: 69.99,
    originalPrice: 69.99,
    image: "/tshirt.jpg",
    colors: ["sage", "cream", "gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    reviews: 145,
    isNew: true,
    onSale: false,
  },
  {
    id: 18,
    name: "Pocket Tee Classic",
    category: "tshirt",
    subcategory: "basic-tee",
    price: 34.99,
    originalPrice: 39.99,
    image: "/tshirt.jpg",
    colors: ["navy", "white", "gray"],
    sizes: ["S", "M", "L"],
    rating: 4.2,
    reviews: 178,
    isNew: false,
    onSale: true,
  },
  {
    id: 19,
    name: "Oversized Drop Shoulder Tee",
    category: "tshirt",
    subcategory: "basic-tee",
    price: 54.99,
    originalPrice: 54.99,
    image: "/tshirt.jpg",
    colors: ["black", "beige", "pink"],
    sizes: ["M", "L", "XL"],
    rating: 4.6,
    reviews: 234,
    isNew: true,
    onSale: false,
  },
  {
    id: 20,
    name: "Tie-Dye Festival Tee",
    category: "tshirt",
    subcategory: "graphic-tee",
    price: 42.99,
    originalPrice: 52.99,
    image: "/tshirt.jpg",
    colors: ["blue", "pink", "green"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.1,
    reviews: 167,
    isNew: false,
    onSale: true,
  },
  {
    id: 21,
    name: "Bamboo Fiber Tee",
    category: "tshirt",
    subcategory: "premium-tee",
    price: 64.99,
    originalPrice: 64.99,
    image: "/tshirt.jpg",
    colors: ["white", "charcoal", "sage"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviews: 189,
    isNew: true,
    onSale: false,
  },
  {
    id: 22,
    name: "Striped Long Sleeve Tee",
    category: "tshirt",
    subcategory: "basic-tee",
    price: 47.99,
    originalPrice: 57.99,
    image: "/tshirt.jpg",
    colors: ["navy", "black", "red"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.3,
    reviews: 156,
    isNew: false,
    onSale: true,
  },
  {
    id: 23,
    name: "Henley Neck Tee",
    category: "tshirt",
    subcategory: "basic-tee",
    price: 52.99,
    originalPrice: 52.99,
    image: "/tshirt.jpg",
    colors: ["gray", "navy", "olive"],
    sizes: ["M", "L", "XL"],
    rating: 4.5,
    reviews: 198,
    isNew: true,
    onSale: false,
  },
  {
    id: 24,
    name: "Vintage Wash Tee",
    category: "tshirt",
    subcategory: "graphic-tee",
    price: 41.99,
    originalPrice: 49.99,
    image: "/tshirt.jpg",
    colors: ["black", "gray", "brown"],
    sizes: ["S", "M", "L"],
    rating: 4.4,
    reviews: 134,
    isNew: false,
    onSale: true,
  },

  // Shirts (10 products)
  {
    id: 4,
    name: "Classic Oxford Shirt",
    category: "shirt",
    subcategory: "dress-shirt",
    price: 79.99,
    originalPrice: 89.99,
    image: "/shirt.jpg",
    colors: ["white", "blue", "pink"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviews: 203,
    isNew: false,
    onSale: true,
  },
  {
    id: 5,
    name: "Casual Linen Shirt",
    category: "shirt",
    subcategory: "casual-shirt",
    price: 69.99,
    originalPrice: 79.99,
    image: "/shirt.jpg",
    colors: ["white", "beige", "blue"],
    sizes: ["M", "L", "XL", "XXL"],
    rating: 4.4,
    reviews: 134,
    isNew: true,
    onSale: true,
  },
  {
    id: 6,
    name: "Flannel Check Shirt",
    category: "shirt",
    subcategory: "flannel",
    price: 64.99,
    originalPrice: 64.99,
    image: "/shirt.jpg",
    colors: ["red", "blue", "green"],
    sizes: ["S", "M", "L"],
    rating: 4.5,
    reviews: 98,
    isNew: false,
    onSale: false,
  },
  {
    id: 25,
    name: "Chambray Work Shirt",
    category: "shirt",
    subcategory: "casual-shirt",
    price: 74.99,
    originalPrice: 84.99,
    image: "/shirt.jpg",
    colors: ["blue", "gray", "black"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviews: 167,
    isNew: true,
    onSale: true,
  },
  {
    id: 26,
    name: "Poplin Dress Shirt",
    category: "shirt",
    subcategory: "dress-shirt",
    price: 89.99,
    originalPrice: 89.99,
    image: "/shirt.jpg",
    colors: ["white", "blue", "gray"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviews: 245,
    isNew: false,
    onSale: false,
  },
  {
    id: 27,
    name: "Corduroy Overshirt",
    category: "shirt",
    subcategory: "casual-shirt",
    price: 94.99,
    originalPrice: 104.99,
    image: "/shirt.jpg",
    colors: ["brown", "navy", "olive"],
    sizes: ["M", "L", "XL"],
    rating: 4.6,
    reviews: 189,
    isNew: true,
    onSale: true,
  },
  {
    id: 28,
    name: "Denim Work Shirt",
    category: "shirt",
    subcategory: "casual-shirt",
    price: 79.99,
    originalPrice: 79.99,
    image: "/shirt.jpg",
    colors: ["blue", "black"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 156,
    isNew: false,
    onSale: false,
  },
  {
    id: 29,
    name: "Plaid Flannel Shirt",
    category: "shirt",
    subcategory: "flannel",
    price: 67.99,
    originalPrice: 77.99,
    image: "/shirt.jpg",
    colors: ["red", "green", "blue"],
    sizes: ["S", "M", "L"],
    rating: 4.3,
    reviews: 134,
    isNew: false,
    onSale: true,
  },
  {
    id: 30,
    name: "Cuban Collar Shirt",
    category: "shirt",
    subcategory: "casual-shirt",
    price: 72.99,
    originalPrice: 72.99,
    image: "/shirt.jpg",
    colors: ["white", "navy", "sage"],
    sizes: ["M", "L", "XL"],
    rating: 4.4,
    reviews: 178,
    isNew: true,
    onSale: false,
  },
  {
    id: 31,
    name: "Twill Button Down",
    category: "shirt",
    subcategory: "dress-shirt",
    price: 84.99,
    originalPrice: 94.99,
    image: "/shirt.jpg",
    colors: ["white", "blue", "pink"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviews: 203,
    isNew: false,
    onSale: true,
  },

  // Hoodies (8 products)
  {
    id: 7,
    name: "Essential Pullover Hoodie",
    category: "hoodie",
    subcategory: "pullover",
    price: 89.99,
    originalPrice: 99.99,
    image: "/hoodie.jpg",
    colors: ["black", "gray", "navy"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviews: 245,
    isNew: true,
    onSale: true,
  },
  {
    id: 8,
    name: "Zip-Up Hoodie",
    category: "hoodie",
    subcategory: "zip-up",
    price: 94.99,
    originalPrice: 94.99,
    image: "/hoodie.jpg",
    colors: ["black", "charcoal"],
    sizes: ["M", "L", "XL"],
    rating: 4.6,
    reviews: 167,
    isNew: false,
    onSale: false,
  },
  {
    id: 9,
    name: "Oversized Hoodie",
    category: "hoodie",
    subcategory: "oversized",
    price: 99.99,
    originalPrice: 109.99,
    image: "/hoodie.jpg",
    colors: ["cream", "pink", "sage"],
    sizes: ["S", "M", "L"],
    rating: 4.7,
    reviews: 189,
    isNew: true,
    onSale: true,
  },
  {
    id: 32,
    name: "Heavyweight Pullover",
    category: "hoodie",
    subcategory: "pullover",
    price: 104.99,
    originalPrice: 114.99,
    image: "/hoodie.jpg",
    colors: ["black", "navy", "olive"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.9,
    reviews: 234,
    isNew: true,
    onSale: true,
  },
  {
    id: 33,
    name: "Cropped Zip Hoodie",
    category: "hoodie",
    subcategory: "zip-up",
    price: 87.99,
    originalPrice: 87.99,
    image: "/hoodie.jpg",
    colors: ["gray", "pink", "black"],
    sizes: ["S", "M", "L"],
    rating: 4.4,
    reviews: 156,
    isNew: false,
    onSale: false,
  },
  {
    id: 34,
    name: "Vintage Wash Hoodie",
    category: "hoodie",
    subcategory: "oversized",
    price: 92.99,
    originalPrice: 102.99,
    image: "/hoodie.jpg",
    colors: ["charcoal", "brown", "sage"],
    sizes: ["M", "L", "XL"],
    rating: 4.5,
    reviews: 178,
    isNew: false,
    onSale: true,
  },
  {
    id: 35,
    name: "Tech Fleece Hoodie",
    category: "hoodie",
    subcategory: "pullover",
    price: 119.99,
    originalPrice: 119.99,
    image: "/hoodie.jpg",
    colors: ["black", "gray", "navy"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.8,
    reviews: 267,
    isNew: true,
    onSale: false,
  },
  {
    id: 36,
    name: "Sherpa Lined Hoodie",
    category: "hoodie",
    subcategory: "zip-up",
    price: 109.99,
    originalPrice: 119.99,
    image: "/hoodie.jpg",
    colors: ["brown", "black", "navy"],
    sizes: ["M", "L", "XL"],
    rating: 4.7,
    reviews: 198,
    isNew: false,
    onSale: true,
  },

  // Jackets (9 products)
  {
    id: 10,
    name: "Denim Jacket",
    category: "jacket",
    subcategory: "denim",
    price: 129.99,
    originalPrice: 149.99,
    image: "/jacket.jpg",
    colors: ["blue", "black"],
    sizes: ["M", "L", "XL"],
    rating: 4.5,
    reviews: 112,
    isNew: false,
    onSale: true,
  },
  {
    id: 11,
    name: "Bomber Jacket",
    category: "jacket",
    subcategory: "bomber",
    price: 159.99,
    originalPrice: 159.99,
    image: "/jacket.jpg",
    colors: ["black", "olive", "navy"],
    sizes: ["S", "M", "L"],
    rating: 4.8,
    reviews: 87,
    isNew: true,
    onSale: false,
  },
  {
    id: 12,
    name: "Leather Jacket",
    category: "jacket",
    subcategory: "leather",
    price: 299.99,
    originalPrice: 349.99,
    image: "/jacket.jpg",
    colors: ["black", "brown"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.9,
    reviews: 76,
    isNew: false,
    onSale: true,
  },
  {
    id: 37,
    name: "Varsity Jacket",
    category: "jacket",
    subcategory: "bomber",
    price: 174.99,
    originalPrice: 194.99,
    image: "/jacket.jpg",
    colors: ["navy", "black", "red"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviews: 145,
    isNew: true,
    onSale: true,
  },
  {
    id: 38,
    name: "Trucker Jacket",
    category: "jacket",
    subcategory: "denim",
    price: 119.99,
    originalPrice: 129.99,
    image: "/jacket.jpg",
    colors: ["blue", "black", "gray"],
    sizes: ["M", "L", "XL"],
    rating: 4.4,
    reviews: 167,
    isNew: false,
    onSale: true,
  },
  {
    id: 39,
    name: "Moto Leather Jacket",
    category: "jacket",
    subcategory: "leather",
    price: 349.99,
    originalPrice: 349.99,
    image: "/jacket.jpg",
    colors: ["black", "brown"],
    sizes: ["S", "M", "L"],
    rating: 4.9,
    reviews: 89,
    isNew: true,
    onSale: false,
  },
  {
    id: 40,
    name: "Coach Jacket",
    category: "jacket",
    subcategory: "bomber",
    price: 144.99,
    originalPrice: 164.99,
    image: "/jacket.jpg",
    colors: ["black", "navy", "olive"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 134,
    isNew: false,
    onSale: true,
  },
  {
    id: 41,
    name: "Sherpa Denim Jacket",
    category: "jacket",
    subcategory: "denim",
    price: 139.99,
    originalPrice: 139.99,
    image: "/jacket.jpg",
    colors: ["blue", "black"],
    sizes: ["M", "L", "XL"],
    rating: 4.7,
    reviews: 178,
    isNew: true,
    onSale: false,
  },
  {
    id: 42,
    name: "Suede Bomber",
    category: "jacket",
    subcategory: "bomber",
    price: 189.99,
    originalPrice: 209.99,
    image: "/jacket.jpg",
    colors: ["brown", "navy", "olive"],
    sizes: ["S", "M", "L"],
    rating: 4.8,
    reviews: 156,
    isNew: false,
    onSale: true,
  },

  // Pants (12 products)
  {
    id: 13,
    name: "Slim Fit Jeans",
    category: "pant",
    subcategory: "jeans",
    price: 89.99,
    originalPrice: 99.99,
    image: "/pant.jpg",
    colors: ["blue", "black", "gray"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.4,
    reviews: 234,
    isNew: false,
    onSale: true,
  },
  {
    id: 14,
    name: "Chino Pants",
    category: "pant",
    subcategory: "chinos",
    price: 79.99,
    originalPrice: 89.99,
    image: "/pant.jpg",
    colors: ["khaki", "navy", "black"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviews: 178,
    isNew: true,
    onSale: true,
  },
  {
    id: 15,
    name: "Cargo Pants",
    category: "pant",
    subcategory: "cargo",
    price: 99.99,
    originalPrice: 109.99,
    image: "/pant.jpg",
    colors: ["olive", "black", "khaki"],
    sizes: ["M", "L", "XL"],
    rating: 4.3,
    reviews: 145,
    isNew: false,
    onSale: true,
  },
  {
    id: 43,
    name: "Straight Leg Jeans",
    category: "pant",
    subcategory: "jeans",
    price: 94.99,
    originalPrice: 104.99,
    image: "/pant.jpg",
    colors: ["blue", "black", "gray"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 189,
    isNew: true,
    onSale: true,
  },
  {
    id: 44,
    name: "Wide Leg Chinos",
    category: "pant",
    subcategory: "chinos",
    price: 84.99,
    originalPrice: 84.99,
    image: "/pant.jpg",
    colors: ["beige", "navy", "olive"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.4,
    reviews: 167,
    isNew: false,
    onSale: false,
  },
  {
    id: 45,
    name: "Tactical Cargo Pants",
    category: "pant",
    subcategory: "cargo",
    price: 109.99,
    originalPrice: 119.99,
    image: "/pant.jpg",
    colors: ["black", "olive", "gray"],
    sizes: ["M", "L", "XL"],
    rating: 4.7,
    reviews: 203,
    isNew: true,
    onSale: true,
  },
  {
    id: 46,
    name: "Raw Denim Jeans",
    category: "pant",
    subcategory: "jeans",
    price: 124.99,
    originalPrice: 124.99,
    image: "/pant.jpg",
    colors: ["blue", "black"],
    sizes: ["S", "M", "L"],
    rating: 4.8,
    reviews: 145,
    isNew: true,
    onSale: false,
  },
  {
    id: 47,
    name: "Pleated Trousers",
    category: "pant",
    subcategory: "chinos",
    price: 89.99,
    originalPrice: 99.99,
    image: "/pant.jpg",
    colors: ["charcoal", "navy", "brown"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.3,
    reviews: 134,
    isNew: false,
    onSale: true,
  },
  {
    id: 48,
    name: "Utility Joggers",
    category: "pant",
    subcategory: "cargo",
    price: 74.99,
    originalPrice: 84.99,
    image: "/pant.jpg",
    colors: ["black", "gray", "olive"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.2,
    reviews: 178,
    isNew: false,
    onSale: true,
  },
  {
    id: 49,
    name: "Vintage Wash Jeans",
    category: "pant",
    subcategory: "jeans",
    price: 97.99,
    originalPrice: 107.99,
    image: "/pant.jpg",
    colors: ["blue", "gray", "black"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviews: 156,
    isNew: false,
    onSale: true,
  },
  {
    id: 50,
    name: "Corduroy Pants",
    category: "pant",
    subcategory: "chinos",
    price: 92.99,
    originalPrice: 92.99,
    image: "/pant.jpg",
    colors: ["brown", "navy", "olive"],
    sizes: ["M", "L", "XL"],
    rating: 4.5,
    reviews: 167,
    isNew: true,
    onSale: false,
  },
  {
    id: 51,
    name: "Tech Cargo Shorts",
    category: "pant",
    subcategory: "cargo",
    price: 67.99,
    originalPrice: 77.99,
    image: "/pant.jpg",
    colors: ["black", "khaki", "navy"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.4,
    reviews: 189,
    isNew: true,
    onSale: true,
  },
]

const categoryMap = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  hoodie: "Hoodies",
  jacket: "Jackets",
  pant: "Pants",
}

const subcategoryMap = {
  "basic-tee": "Basic Tees",
  "graphic-tee": "Graphic Tees",
  "premium-tee": "Premium Tees",
  "dress-shirt": "Dress Shirts",
  "casual-shirt": "Casual Shirts",
  flannel: "Flannel Shirts",
  pullover: "Pullover Hoodies",
  "zip-up": "Zip-Up Hoodies",
  oversized: "Oversized Hoodies",
  denim: "Denim Jackets",
  bomber: "Bomber Jackets",
  leather: "Leather Jackets",
  jeans: "Jeans",
  chinos: "Chinos",
  cargo: "Cargo Pants",
}

const colorMap = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#6B7280",
  navy: "#1E3A8A",
  blue: "#3B82F6",
  beige: "#F5F5DC",
  khaki: "#C3B091",
  olive: "#808000",
  pink: "#EC4899",
  green: "#10B981",
  cream: "#FFFDD0",
  red: "#EF4444",
  charcoal: "#374151",
  sage: "#9CA3AF",
  brown: "#92400E",
}

export default function CategoryCollectionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 400])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [showOnSale, setShowOnSale] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])
  const { toast } = useToast()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const gridControls = useAnimationControls()
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])

  // Enhanced smooth animation when filters toggle
  useEffect(() => {
    const animateGrid = async () => {
      setIsAnimating(true)

      if (!showFilters) {
        // Smooth expansion animation when filters close
        await gridControls.start({
          width: "100%",
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 25,
            mass: 0.8,
            duration: 1.2,
          },
        })
      } else {
        // Smooth contraction when filters open
        await gridControls.start({
          width: "calc(100% - 88px)",
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 25,
            mass: 0.8,
            duration: 1.0,
          },
        })
      }

      // Add a small delay before allowing new animations
      setTimeout(() => setIsAnimating(false), 200)
    }

    animateGrid()
  }, [showFilters, gridControls])

  // Helper function for string similarity
  function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Filter products based on category slug and filters
  const filteredProducts = useMemo(() => {
    let products = allProducts.filter((product) => product.category === slug)

    // Enhanced search with fuzzy matching and relevance scoring
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()

      // Calculate search relevance score for each product
      const productsWithScore = products.map((product) => {
        let score = 0
        const name = product.name.toLowerCase()
        const category = categoryMap[product.category as keyof typeof categoryMap].toLowerCase()
        const subcategory = subcategoryMap[product.subcategory as keyof typeof subcategoryMap].toLowerCase()

        // Exact matches get highest score
        if (name.includes(query)) score += 100
        if (category.includes(query)) score += 80
        if (subcategory.includes(query)) score += 60

        // Word-based matching
        const queryWords = query.split(" ").filter((word) => word.length > 0)
        const nameWords = name.split(" ")
        const allWords = [...nameWords, category, subcategory]

        queryWords.forEach((queryWord) => {
          allWords.forEach((word) => {
            // Exact word match
            if (word.includes(queryWord)) {
              score += 50
            }
            // Fuzzy matching using simple similarity
            else if (queryWord.length > 2) {
              const similarity = calculateSimilarity(queryWord, word)
              if (similarity > 0.6) score += Math.floor(similarity * 30)
            }
          })
        })

        // Bonus for starting with query
        if (name.startsWith(query)) score += 40

        // Bonus for word boundaries
        const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i")
        if (wordBoundaryRegex.test(name)) score += 30

        return { ...product, searchScore: score }
      })

      // Filter products with score > 0 and sort by relevance
      products = productsWithScore
        .filter((product) => product.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore)
        .map(({ searchScore, ...product }) => product)
    }

    // Apply price filter
    products = products.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply color filter
    if (selectedColors.length > 0) {
      products = products.filter((product) => product.colors.some((color) => selectedColors.includes(color)))
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      products = products.filter((product) => product.sizes.some((size) => selectedSizes.includes(size)))
    }

    // Apply subcategory filter
    if (selectedSubcategories.length > 0) {
      products = products.filter((product) => selectedSubcategories.includes(product.subcategory))
    }

    // Apply sale filter
    if (showOnSale) {
      products = products.filter((product) => product.onSale)
    }

    // Apply new filter
    if (showNew) {
      products = products.filter((product) => product.isNew)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        products.sort((a, b) => b.price - a.price)
        break
      case "rating":
        products.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        // Featured - keep original order
        break
    }

    return products
  }, [slug, searchQuery, priceRange, selectedColors, selectedSizes, selectedSubcategories, showOnSale, showNew, sortBy])

  // Handle sorting animation
  useEffect(() => {
    setIsSorting(true)
    const timer = setTimeout(() => setIsSorting(false), 600)
    return () => clearTimeout(timer)
  }, [sortBy])

  useEffect(() => {
    if (searchQuery && filteredProducts.length === 0) {
      const allTerms = allProducts
        .filter((product) => product.category === slug)
        .flatMap((product) => [
          product.name.toLowerCase(),
          categoryMap[product.category as keyof typeof categoryMap].toLowerCase(),
          subcategoryMap[product.subcategory as keyof typeof subcategoryMap].toLowerCase(),
          ...product.colors,
        ])

      const suggestions = allTerms
        .filter((term) => calculateSimilarity(searchQuery.toLowerCase(), term) > 0.4)
        .slice(0, 3)

      setSearchSuggestions(suggestions)
    } else {
      setSearchSuggestions([])
    }
  }, [searchQuery, filteredProducts.length, slug])

  const availableSubcategories = useMemo(() => {
    const subcategories = [
      ...new Set(allProducts.filter((product) => product.category === slug).map((product) => product.subcategory)),
    ]
    return subcategories
  }, [slug])


  const availableColors = useMemo(() => {
    const colors = [
      ...new Set(allProducts.filter((product) => product.category === slug).flatMap((product) => product.colors)),
    ]
    return colors
  }, [slug])

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 400])
    setSelectedColors([])
    setSelectedSizes([])
    setSelectedSubcategories([])
    setShowOnSale(false)
    setShowNew(false)
  }

  const navigateToProfile = () => {
    router.push("/profile")
  }

  const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

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
       
       useEffect(() => {
           fetchUserProfile();
         }, []);


  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isCartOpen])

  if (!slug || !categoryMap[slug as keyof typeof categoryMap]) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-orange-900/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
          <nav className="hidden md:flex gap-6">
            <Link href="/#NewArrival" className="text-sm font-medium hover:underline underline-offset-4">
              New Arrivals
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Collection
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Create
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
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
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Search and Controls Section */}
      <section className="sticky top-14 z-40 bg-black/95 backdrop-blur pt-2 border-b border-orange-900/30">
        <div className="container mx-auto px-4 pb-0 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-white hover:text-orange-500"
              >
                ← Back
              </Button>
              <h1 className="text-3xl font-bold">{categoryMap[slug as keyof typeof categoryMap]}</h1>
              <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                {filteredProducts.length} items
              </Badge>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-left justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border border-gray-700 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 relative top-10">
          {/* Filters Sidebar */}
          <AnimatePresence mode="wait">
            {showFilters && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1],
                  }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />

                {/* Filter Sidebar */}
                <motion.div
                  initial={{
                    x: -420,
                    opacity: 0,
                    scale: 0.92,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: -420,
                    opacity: 0,
                    scale: 0.92,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 28,
                    mass: 0.9,
                    duration: 1.0,
                  }}
                  className="w-80 z-50 lg:relative lg:z-auto"
                >
                  <div className="sticky top-8">
                    <Card className="group bg-gray-900/95 backdrop-blur-xl border-gray-800 shadow-2xl lg:bg-gray-900/50 lg:backdrop-blur-none lg:shadow-none">
                      <CardContent className="p-6">
                        <motion.div
                          className="flex items-center justify-between mb-6"
                          initial={{ y: -15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.15,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h3 className="text-lg font-semibold">Filters</h3>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                              Clear All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowFilters(false)}
                              className="lg:hidden"
                            >
                              ✕
                            </Button>
                          </div>
                        </motion.div>

                        {/* Price Range */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.2,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Price Range</h4>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={400}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </motion.div>

                        {/* Subcategories */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.25,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Type</h4>
                          <div className="space-y-2">
                            {availableSubcategories.map((subcategory, index) => (
                              <motion.div
                                key={subcategory}
                                className="flex items-center space-x-2"
                                initial={{ x: -25, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                  delay: 0.3 + index * 0.04,
                                  duration: 0.4,
                                  ease: [0.4, 0.0, 0.2, 1],
                                }}
                              >
                                <Checkbox
                                  id={subcategory}
                                  checked={selectedSubcategories.includes(subcategory)}
                                  onCheckedChange={(checked) => {
                                    if (checked === true) {
                                      setSelectedSubcategories([...selectedSubcategories, subcategory])
                                    } else {
                                      setSelectedSubcategories(selectedSubcategories.filter((s) => s !== subcategory))
                                    }
                                  }}
                                />
                                <label htmlFor={subcategory} className="text-sm">
                                  {subcategoryMap[subcategory as keyof typeof subcategoryMap]}
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Colors */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.35,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Colors</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {availableColors.map((color, index) => (
                              <motion.button
                                key={color}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  delay: 0.4 + index * 0.03,
                                  duration: 0.4,
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                                whileHover={{
                                  scale: 1.15,
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (selectedColors.includes(color)) {
                                    setSelectedColors(selectedColors.filter((c) => c !== color))
                                  } else {
                                    setSelectedColors([...selectedColors, color])
                                  }
                                }}
                                className={cn(
                                  "w-8 h-8 rounded-full border-2 transition-all duration-300",
                                  selectedColors.includes(color)
                                    ? "border-orange-500 scale-110 shadow-lg shadow-orange-500/30"
                                    : "border-gray-600 hover:border-gray-400",
                                )}
                                style={{ backgroundColor: colorMap[color as keyof typeof colorMap] }}
                                title={color}
                              />
                            ))}
                          </div>
                        </motion.div>

                        {/* Sizes */}
                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.45,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Sizes</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {["XS", "S", "M", "L", "XL", "XXL"].map((size, index) => (
                              <motion.button
                                key={size}
                                initial={{ y: 25, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                  delay: 0.5 + index * 0.04,
                                  duration: 0.4,
                                  ease: [0.4, 0.0, 0.2, 1],
                                }}
                                whileHover={{
                                  scale: 1.08,
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (selectedSizes.includes(size)) {
                                    setSelectedSizes(selectedSizes.filter((s) => s !== size))
                                  } else {
                                    setSelectedSizes([...selectedSizes, size])
                                  }
                                }}
                                className={cn(
                                  "p-2 text-sm border rounded transition-all duration-300",
                                  selectedSizes.includes(size)
                                    ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/20"
                                    : "border-gray-700 hover:border-gray-600",
                                )}
                              >
                                {size}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Special Filters */}
                        <motion.div
                          className="space-y-4"
                          initial={{ y: 25, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.6,
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                          }}
                        >
                          <h4 className="font-medium">Special</h4>
                          <div className="space-y-2">
                            <motion.div
                              className="flex items-center space-x-2"
                              initial={{ x: -25, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                delay: 0.65,
                                duration: 0.4,
                                ease: [0.4, 0.0, 0.2, 1],
                              }}
                            >
                              <Checkbox
                                id="on-sale"
                                checked={showOnSale}
                                onCheckedChange={(checked) => setShowOnSale(checked === true)}
                              />
                              <label htmlFor="on-sale" className="text-sm">
                                On Sale
                              </label>
                            </motion.div>
                            <motion.div
                              className="flex items-center space-x-2"
                              initial={{ x: -25, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                delay: 0.7,
                                duration: 0.4,
                                ease: [0.4, 0.0, 0.2, 1],
                              }}
                            >
                              <Checkbox
                                id="new-arrivals"
                                checked={showNew}
                                onCheckedChange={(checked) => setShowNew(checked === true)}
                              />
                              <label htmlFor="new-arrivals" className="text-sm">
                                New Arrivals
                              </label>
                            </motion.div>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <motion.div
            animate={gridControls}
            className="flex-1 min-w-0"
            style={{
              width: showFilters ? "calc(100% - 88px)" : "100%",
              willChange: "width",
            }}
          >
            {filteredProducts.length === 0 ? (
              <motion.div
                className="text-center py-16"
                animate={{
                  opacity: isAnimating ? 0.7 : 1,
                  scale: isAnimating ? 0.98 : 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              >
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                    : "Try adjusting your filters or search terms"}
                </p>

                {searchSuggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Did you mean:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(suggestion)}
                          className="text-orange-400 border-orange-500/50 hover:bg-orange-500/10"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className={cn(
                  "grid gap-6 w-full",
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
                )}
                animate={{
                  opacity: isAnimating || isSorting ? 0.85 : 1,
                  scale: isAnimating || isSorting ? 0.98 : 1,
                }}
                transition={{
                  duration: isSorting ? 0.6 : 0.4,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              >
                <AnimatePresence mode="wait">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={`${product.id}-${sortBy}`}
                      layout
                      initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.92,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          delay: isSorting ? index * 0.03 : index * 0.02,
                          duration: isSorting ? 0.5 : 0.4,
                          ease: [0.4, 0.0, 0.2, 1],
                        },
                      }}
                      exit={{
                        opacity: 0,
                        y: -30,
                        scale: 0.92,
                        transition: {
                          duration: 0.3,
                          ease: [0.4, 0.0, 1, 1],
                        },
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        },
                      }}
                      className="group cursor-pointer w-full"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      <Card className="group bg-gradient-to-br black border border-gray-800 rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all duration-500 hover:border-orange-500/70 h-full backdrop-blur-md">
                        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                          <motion.img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{
                              duration: 0.6,
                              ease: [0.4, 0.0, 0.2, 1],
                            }}
                          />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.isNew && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                              >
                                <Badge className="bg-orange-500 text-black shadow">New</Badge>
                              </motion.div>
                            )}
                            {product.onSale && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                              >
                                <Badge className="bg-red-500 text-white shadow">Sale</Badge>
                              </motion.div>
                            )}
                          </div>

                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <Button
      size="icon"
      variant="ghost"
      className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 hover:bg-black/60 rounded-full shadow"
      onClick={(e) => {
        e.stopPropagation()
        toggleWishlist(product.id)
      }}
    >
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Heart
          className={cn(
            "w-4 h-4 transition-colors duration-300",
            wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-white",
          )}
        />
      </motion.div>
    </Button>
                          </div>

                          {/* Wishlist Button */}
                          {/* Quick Add to Cart */}
                          
                        </div>

                        <CardContent className="p-4 space-y-3">
                          {/* Subcategory & Rating */}
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <Badge variant="outline" className="text-xs rounded-md px-2">
                              {subcategoryMap[product.subcategory as keyof typeof subcategoryMap]}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                              <span className="text-xs">
                                {product.rating} ({product.reviews})
                              </span>
                            </div>
                          </div>

                          {/* Product Title */}
                          <h3 className="font-semibold text-lg group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-orange-500">${product.price}</span>
                            {product.onSale && (
                              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                            )}
                          </div>

                          {/* Color Options */}
                          <div className="flex items-center gap-1">
                            {product.colors.slice(0, 4).map((color, colorIndex) => (
                              <motion.div
                                key={color}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.1 + colorIndex * 0.05,
                                  duration: 0.3,
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                }}
                                className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
                                style={{ backgroundColor: colorMap[color as keyof typeof colorMap] }}
                              />
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black hover:bg-orange-600 text-white shadow rounded-full px-4"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Add to cart logic
                              }}
                            >
                              <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Quick Add
                              </motion.div>
                            </Button>
                            <Button
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black hover:bg-orange-600 text-white shadow rounded-full px-4"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Add to cart logic
                              }}
                            >
                              <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Buy Now
                              </motion.div>
                            </Button>
                          </div>
                          
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
