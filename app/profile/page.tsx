"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, CreditCard, Edit, LogOut, Mail, MapPin, Phone, Save, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Extended user type with profile information
type UserProfile = {
  email: string
  name: string
  isLoggedIn: boolean
  avatar?: string
  phone?: string
  address?: string
  bio?: string
  orders?: Order[]
  wishlist?: WishlistItem[]
}

type Order = {
  id: string
  date: string
  status: string
  total: number
  items: OrderItem[]
}

type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

type WishlistItem = {
  id: string
  name: string
  price: number
  image: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  })

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: "ORD-1234",
      date: "2023-05-15",
      status: "Delivered",
      total: 129.99,
      items: [
        {
          id: "ITEM-1",
          name: "Essential Tee - Black",
          price: 49.99,
          quantity: 2,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: "ITEM-2",
          name: "Relaxed Fit Jeans",
          price: 79.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
    },
    {
      id: "ORD-5678",
      date: "2023-04-22",
      status: "Delivered",
      total: 89.99,
      items: [
        {
          id: "ITEM-3",
          name: "Oversized Hoodie - Gray",
          price: 89.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
    },
  ]

  // Mock wishlist data
  const mockWishlist: WishlistItem[] = [
    {
      id: "WISH-1",
      name: "Premium Wool Coat",
      price: 199.99,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "WISH-2",
      name: "Leather Ankle Boots",
      price: 149.99,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "WISH-3",
      name: "Cashmere Scarf",
      price: 79.99,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)

      // Merge with mock data for demo purposes
      const enhancedUser = {
        ...parsedUser,
        phone: parsedUser.phone || "555-123-4567",
        address: parsedUser.address || "123 Fashion St, Design District, CA 90210",
        bio: parsedUser.bio || "Fashion enthusiast with a passion for sustainable clothing.",
        orders: mockOrders,
        wishlist: mockWishlist,
      }

      setUser(enhancedUser)
      setFormData({
        name: enhancedUser.name || "",
        email: enhancedUser.email || "",
        phone: enhancedUser.phone || "",
        address: enhancedUser.address || "",
        bio: enhancedUser.bio || "",
      })
    } else {
      // Redirect to login if no user data found
      router.push("/")
    }
    setLoading(false)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = () => {
    if (!user) return

    // Update user data
    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      bio: formData.bio,
    }

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setEditMode(false)

    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const removeFromWishlist = (id: string) => {
    if (!user || !user.wishlist) return

    const updatedWishlist = user.wishlist.filter((item) => item.id !== id)
    const updatedUser = { ...user, wishlist: updatedWishlist }

    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    toast({
      title: "Item removed",
      description: "Item removed from your wishlist.",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-gray-200">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-xl font-bold">
            ATTIRE
          </button>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">My Account</h1>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="mt-4 md:mt-0">
            Back to Shopping
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent p-0">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-white data-[state=active]:bg-transparent"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-white data-[state=active]:bg-transparent"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-white data-[state=active]:bg-transparent"
            >
              Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="bg-gray-900 border-gray-800 col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">Manage your personal information</CardDescription>
                  </div>
                  <Button onClick={() => setEditMode(!editMode)} variant="outline" size="sm" className="h-8 gap-1">
                    {editMode ? (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Save</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled
                            className="bg-gray-800 border-gray-700 opacity-70"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400">Full Name</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-400">Email</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{user.phone}</p>
                          <p className="text-sm text-gray-400">Phone</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{user.address}</p>
                          <p className="text-sm text-gray-400">Address</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Bio</p>
                        <p>{user.bio}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {editMode && (
                    <div className="flex w-full justify-end gap-4">
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} className="bg-white text-black hover:bg-gray-200">
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>

              <Card className="bg-gray-900 border-gray-800 h-fit">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription className="text-gray-400">Update your profile image</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.avatar || "/placeholder.svg?height=128&width=128"} />
                    <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="w-full gap-2">
                    <Camera className="h-4 w-4" />
                    Change Picture
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription className="text-gray-400">Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-gray-800 p-4">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>
            {user.orders && user.orders.length > 0 ? (
              <div className="space-y-6">
                {user.orders.map((order) => (
                  <Card key={order.id} className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <CardDescription className="text-gray-400">
                            Placed on {new Date(order.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${
                              order.status === "Delivered"
                                ? "bg-green-900/20 text-green-400"
                                : order.status === "Shipped"
                                  ? "bg-blue-900/20 text-blue-400"
                                  : "bg-yellow-900/20 text-yellow-400"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="font-medium">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="h-20 w-20 rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-400">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Track Order
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-800 p-8 text-center">
                <p className="text-gray-400">You haven&apos;t placed any orders yet.</p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 bg-white text-black hover:bg-gray-200"
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <h2 className="text-2xl font-bold">My Wishlist</h2>
            {user.wishlist && user.wishlist.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {user.wishlist.map((item) => (
                  <Card key={item.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-48 w-full object-cover"
                      />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 p-4">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-400">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex w-full gap-2">
                        <Button className="flex-1 bg-white text-black hover:bg-gray-200">Add to Cart</Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-800 p-8 text-center">
                <p className="text-gray-400">Your wishlist is empty.</p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 bg-white text-black hover:bg-gray-200"
                >
                  Discover Products
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="container text-center">
          <p className="text-sm text-gray-400">© 2023 ATTIRE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
