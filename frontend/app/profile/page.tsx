"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Edit,
  Heart,
  LogOut,
  MapPin,
  Package,
  Save,
  Settings,
  ShoppingBag,
  Trash,
  User,
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import SlidingCart from "@/components/sliding-cart"

// Custom styles for orange theme
const orangeGlow = {
  boxShadow: "0 0 15px 2px rgba(249, 115, 22, 0.15)",
  transition: "all 0.3s ease",
}

// Define user type
type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
  avatar?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

// Define order type
type OrderType = {
  id: string
  date: string
  status: string
  total: number
  items: {
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
}

// Define wishlist item type
type WishlistItemType = {
  id: string
  name: string
  price: number
  image: string
}

// Define address type
type AddressType = {
  id: string
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

// Define payment method type
type PaymentMethodType = {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<OrderType[]>([])
  const [wishlist, setWishlist] = useState<WishlistItemType[]>([])
  const [addresses, setAddresses] = useState<AddressType[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([])
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    accountAlerts: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null)
  const [editingPayment, setEditingPayment] = useState<PaymentMethodType | null>(null)
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  })
  const [newPayment, setNewPayment] = useState({
    type: "Visa",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    name: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditedUser(parsedUser)
    } else {
      // Redirect to login if no user data found
      router.push("/")
    }

    // Simulate fetching data from API
    setTimeout(() => {
      // Mock orders data
      setOrders([
        {
          id: "ORD-12345",
          date: "2023-11-15",
          status: "Delivered",
          total: 129.99,
          items: [
            {
              id: "ITEM-1",
              name: "Premium Cotton T-Shirt",
              quantity: 2,
              price: 49.99,
              image: "/placeholder.svg?height=80&width=80",
            },
            {
              id: "ITEM-2",
              name: "Designer Hoodie",
              quantity: 1,
              price: 30.01,
              image: "/placeholder.svg?height=80&width=80",
            },
          ],
        },
        {
          id: "ORD-12346",
          date: "2023-12-01",
          status: "Processing",
          total: 89.99,
          items: [
            {
              id: "ITEM-3",
              name: "Slim Fit Jeans",
              quantity: 1,
              price: 89.99,
              image: "/placeholder.svg?height=80&width=80",
            },
          ],
        },
      ])

      // Mock wishlist data
      setWishlist([
        {
          id: "WISH-1",
          name: "Leather Jacket",
          price: 199.99,
          image: "/placeholder.svg?height=100&width=100",
        },
        {
          id: "WISH-2",
          name: "Winter Boots",
          price: 149.99,
          image: "/placeholder.svg?height=100&width=100",
        },
        {
          id: "WISH-3",
          name: "Cashmere Scarf",
          price: 79.99,
          image: "/placeholder.svg?height=100&width=100",
        },
      ])

      // Mock addresses data
      setAddresses([
        {
          id: "ADDR-1",
          name: "Home",
          street: "123 Fashion St",
          city: "Design District",
          state: "CA",
          zip: "90210",
          country: "United States",
          isDefault: true,
        },
        {
          id: "ADDR-2",
          name: "Work",
          street: "456 Corporate Ave",
          city: "Business Bay",
          state: "NY",
          zip: "10001",
          country: "United States",
          isDefault: false,
        },
      ])

      // Mock payment methods data
      setPaymentMethods([
        {
          id: "PAY-1",
          type: "Visa",
          last4: "4242",
          expiry: "12/25",
          isDefault: true,
        },
        {
          id: "PAY-2",
          type: "Mastercard",
          last4: "8888",
          expiry: "06/24",
          isDefault: false,
        },
      ])

      setIsLoading(false)
    }, 1000)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    })
  }

  const handleSaveProfile = () => {
    if (editedUser) {
      setUser(editedUser)
      localStorage.setItem("user", JSON.stringify(editedUser))
      setIsEditing(false)

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        duration: 3000,
      })
    }
  }

  const handleRemoveWishlistItem = (id: string) => {
    setWishlist(wishlist.filter((item) => item.id !== id))

    toast({
      title: "Item removed",
      description: "Item has been removed from your wishlist.",
      duration: 3000,
    })
  }

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(
      addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    )

    toast({
      title: "Default address updated",
      description: "Your default shipping address has been updated.",
      duration: 3000,
    })
  }

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter((address) => address.id !== id))

    toast({
      title: "Address removed",
      description: "The address has been removed from your account.",
      duration: 3000,
    })
  }

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )

    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated.",
      duration: 3000,
    })
  }

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))

    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account.",
      duration: 3000,
    })
  }

  const handleUpdateNotifications = (key: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value,
    })

    toast({
      title: "Notification preferences updated",
      description: "Your notification preferences have been updated.",
      duration: 3000,
    })
  }

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const address: AddressType = {
      id: `ADDR-${Date.now()}`,
      ...newAddress,
      isDefault: addresses.length === 0,
    }

    setAddresses([...addresses, address])
    setNewAddress({
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
    })
    setShowAddressForm(false)

    toast({
      title: "Address added",
      description: "Your new address has been added successfully.",
      duration: 3000,
    })
  }

  const handleAddPayment = () => {
    if (
      !newPayment.cardNumber ||
      !newPayment.expiryMonth ||
      !newPayment.expiryYear ||
      !newPayment.cvv ||
      !newPayment.name
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const payment: PaymentMethodType = {
      id: `PAY-${Date.now()}`,
      type: newPayment.type,
      last4: newPayment.cardNumber.slice(-4),
      expiry: `${newPayment.expiryMonth}/${newPayment.expiryYear.slice(-2)}`,
      isDefault: paymentMethods.length === 0,
    }

    setPaymentMethods([...paymentMethods, payment])
    setNewPayment({
      type: "Visa",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      name: "",
    })
    setShowPaymentForm(false)

    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully.",
      duration: 3000,
    })
  }

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setShowPasswordForm(false)

    toast({
      title: "Password changed",
      description: "Your password has been changed successfully.",
      duration: 3000,
    })
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-orange-500 text-2xl">Loading...</div>
          <div className="text-gray-400">Please wait while we load your profile</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen mx-auto flex-col bg-black text-white">
<header
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-orange-900/30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80 transition-all duration-500 `}
      >
        <div className="container flex h-16 items-center justify-between">
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
                    <div className="flex items-center gap-4">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

       {/* Sliding Cart Component */}
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-1 pt-24 pb-12 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <Tabs defaultValue="profile" className="flex flex-col lg:flex-row gap-8 ">
            {/* Sidebar with Profile Info and Navigation */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <Card className="bg-gray-900/50 border-orange-900/30 sticky top-28 h-[50vh]">
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center">
                    {/* <Avatar className="h-24 w-24 mb-4" style={orangeGlow}>
                      <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={user.name} />
                      <AvatarFallback className="bg-orange-500/20 text-orange-500 text-2xl">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar> */}
                    <CardTitle className="text-2xl font-bold text-center">{user.name}</CardTitle>
                    <CardDescription className="text-gray-400 text-center">{user.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <TabsList className="grid grid-cols-1 w-full bg-transparent space-y-2">
                    <TabsTrigger
                      value="profile"
                      className="w-full justify-start data-[state=active]:bg-orange-500 data-[state=active]:text-black hover:bg-orange-500/20 transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="w-full justify-start data-[state=active]:bg-orange-500 data-[state=active]:text-black hover:bg-orange-500/20 transition-all duration-200"
                    >
                      <Package className="h-4 w-4 mr-3" />
                      Orders
                    </TabsTrigger>
                    <TabsTrigger
                      value="wishlist"
                      className="w-full justify-start data-[state=active]:bg-orange-500 data-[state=active]:text-black hover:bg-orange-500/20 transition-all duration-200"
                    >
                      <Heart className="h-4 w-4 mr-3" />
                      Wishlist
                    </TabsTrigger>
                    <TabsTrigger
                      value="addresses"
                      className="w-full justify-start data-[state=active]:bg-orange-500 data-[state=active]:text-black hover:bg-orange-500/20 transition-all duration-200"
                    >
                      <MapPin className="h-4 w-4 mr-3" />
                      Addresses
                    </TabsTrigger>
                    <TabsTrigger
                      value="payment"
                      className="w-full justify-start data-[state=active]:bg-orange-500 data-[state=active]:text-black hover:bg-orange-500/20 transition-all duration-200"
                    >
                      <CreditCard className="h-4 w-4 mr-3" />
                      Payment
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="w-full justify-start data-[state=active]:bg-orange-500 data-[state=active]:text-black hover:bg-orange-500/20 transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0">
                <Card className="bg-gray-900/50 border-orange-900/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Personal Information</CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="border-orange-500/50 hover:bg-orange-500/20"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false)
                            setEditedUser(user)
                          }}
                          className="border-gray-500/50 hover:bg-gray-500/20"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveProfile}
                          className="bg-orange-500 text-black hover:bg-orange-600"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editedUser?.name || ""}
                            onChange={(e) => setEditedUser((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                            className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                          />
                        ) : (
                          <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">{user.name}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editedUser?.email || ""}
                            onChange={(e) =>
                              setEditedUser((prev) => (prev ? { ...prev, email: e.target.value } : null))
                            }
                            className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                          />
                        ) : (
                          <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">{user.email}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editedUser?.phone || ""}
                            onChange={(e) =>
                              setEditedUser((prev) => (prev ? { ...prev, phone: e.target.value } : null))
                            }
                            className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                            {user.phone || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6 bg-orange-900/30" />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="border-orange-500/50 hover:bg-orange-500/20"
                          onClick={() => setShowPasswordForm(true)}
                        >
                          Change Password
                        </Button>
                        <Button
                          variant="outline"
                          className="border-orange-500/50 hover:bg-orange-500/20"
                          onClick={() => {
                            toast({
                              title: "Two-Factor Authentication",
                              description: "Two-factor authentication setup would be implemented here.",
                              duration: 3000,
                            })
                          }}
                        >
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                    </div>

                    {/* Password Change Modal */}
                    {showPasswordForm && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="bg-gray-900 border-orange-900/30 w-full max-w-md mx-4">
                          <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Enter your current password and choose a new one</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-password">Current Password</Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                                }
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm New Password</Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                }
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPasswordForm(false)
                                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-orange-500 text-black hover:bg-orange-600"
                              onClick={handleChangePassword}
                            >
                              Change Password
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-0">
                <Card className="bg-gray-900/50 border-orange-900/30">
                  <CardHeader>
                    <CardTitle className="text-2xl">Order History</CardTitle>
                    <CardDescription>View and track your orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <Card key={order.id} className="bg-gray-800/50 border-orange-900/20">
                            <CardHeader className="pb-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    Order #{order.id}
                                    <Badge
                                      className={
                                        order.status === "Delivered"
                                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                          : order.status === "Processing"
                                            ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                                            : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                      }
                                    >
                                      {order.status}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription>
                                    Placed on {new Date(order.date).toLocaleDateString()}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-lg">${order.total.toFixed(2)}</div>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-orange-400 hover:text-orange-300"
                                    onClick={() => {
                                      toast({
                                        title: "Order Details",
                                        description: `Viewing details for order ${order.id}`,
                                        duration: 3000,
                                      })
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                                    <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                                      <img
                                        src={item.image || "/placeholder.svg"}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{item.name}</div>
                                      <div className="text-sm text-gray-400">Quantity: {item.quantity}</div>
                                      <div className="text-sm font-medium">${item.price.toFixed(2)}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 border-t border-orange-900/20 pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/50 hover:bg-orange-500/20"
                                onClick={() => {
                                  toast({
                                    title: "Track Order",
                                    description: `Tracking information for order ${order.id}`,
                                    duration: 3000,
                                  })
                                }}
                              >
                                Track Order
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/50 hover:bg-orange-500/20"
                                onClick={() => {
                                  toast({
                                    title: "Order Receipt",
                                    description: `Downloading receipt for order ${order.id}`,
                                    duration: 3000,
                                  })
                                }}
                              >
                                Download Receipt
                              </Button>
                              {order.status === "Delivered" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500/50 hover:bg-orange-500/20"
                                  onClick={() => {
                                    toast({
                                      title: "Reorder Items",
                                      description: `Adding items from order ${order.id} to cart`,
                                      duration: 3000,
                                    })
                                  }}
                                >
                                  Reorder
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                        <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
                        <Button
                          className="bg-orange-500 text-black hover:bg-orange-600"
                          onClick={() => router.push("/dashboard")}
                        >
                          Start Shopping
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="mt-0">
                <Card className="bg-gray-900/50 border-orange-900/30">
                  <CardHeader>
                    <CardTitle className="text-2xl">My Wishlist</CardTitle>
                    <CardDescription>Items you've saved for later ({wishlist.length} items)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {wishlist.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                          <Card
                            key={item.id}
                            className="bg-gray-800/50 border-orange-900/20 group hover:border-orange-500/50 transition-all duration-300"
                          >
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-red-400 hover:text-red-300 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                onClick={() => handleRemoveWishlistItem(item.id)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Remove from wishlist</span>
                              </Button>
                              <div className="h-48 w-full overflow-hidden rounded-t-lg">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
                              <p className="text-orange-400 text-lg font-semibold mb-4">${item.price.toFixed(2)}</p>
                              <Button
                                className="w-full bg-orange-500 text-black hover:bg-orange-600 transition-colors duration-300"
                                onClick={() => {
                                  toast({
                                    title: "Added to Cart",
                                    description: `${item.name} has been added to your cart.`,
                                    duration: 3000,
                                  })
                                }}
                              >
                                Add to Cart
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Heart className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-400 mb-6">Save items you love to your wishlist.</p>
                        <Button
                          className="bg-orange-500 text-black hover:bg-orange-600"
                          onClick={() => router.push("/dashboard")}
                        >
                          Discover Products
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-0">
                <Card className="bg-gray-900/50 border-orange-900/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Shipping Addresses</CardTitle>
                      <CardDescription>Manage your shipping addresses</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="border-orange-500/50 hover:bg-orange-500/20"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Add New Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <Card key={address.id} className="bg-gray-800/50 border-orange-900/20">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {address.name}
                                  {address.isDefault && (
                                    <Badge className="bg-orange-500/20 text-orange-400">Default</Badge>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-white"
                                    onClick={() => {
                                      setEditingAddress(address)
                                      setNewAddress(address)
                                      setShowAddressForm(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-300"
                                    onClick={() => handleRemoveAddress(address.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-gray-300 space-y-1">
                                <p className="font-medium">{address.street}</p>
                                <p>
                                  {address.city}, {address.state} {address.zip}
                                </p>
                                <p>{address.country}</p>
                              </div>
                            </CardContent>
                            {!address.isDefault && (
                              <CardFooter className="border-t border-orange-900/20 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500/50 hover:bg-orange-500/20"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  Set as Default
                                </Button>
                              </CardFooter>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <MapPin className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No addresses saved</h3>
                        <p className="text-gray-400 mb-6">Add a shipping address to your account.</p>
                        <Button
                          className="bg-orange-500 text-black hover:bg-orange-600"
                          onClick={() => setShowAddressForm(true)}
                        >
                          Add Address
                        </Button>
                      </div>
                    )}

                    {/* Address Form Modal */}
                    {showAddressForm && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="bg-gray-900 border-orange-900/30 w-full max-w-lg">
                          <CardHeader>
                            <CardTitle>{editingAddress ? "Edit Address" : "Add New Address"}</CardTitle>
                            <CardDescription>
                              {editingAddress ? "Update your address information" : "Enter your address information"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="address-name">Address Name</Label>
                              <Input
                                id="address-name"
                                value={newAddress.name}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Home, Work"
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="street">Street Address</Label>
                              <Input
                                id="street"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
                                placeholder="123 Main Street"
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  value={newAddress.city}
                                  onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                                  placeholder="New York"
                                  className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                  id="state"
                                  value={newAddress.state}
                                  onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                                  placeholder="NY"
                                  className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="zip">ZIP Code</Label>
                                <Input
                                  id="zip"
                                  value={newAddress.zip}
                                  onChange={(e) => setNewAddress((prev) => ({ ...prev, zip: e.target.value }))}
                                  placeholder="10001"
                                  className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <select
                                  id="country"
                                  value={newAddress.country}
                                  onChange={(e) => setNewAddress((prev) => ({ ...prev, country: e.target.value }))}
                                  className="w-full p-2 rounded-md bg-gray-800 border border-orange-900/30 focus:border-orange-500 text-white"
                                >
                                  <option value="United States">United States</option>
                                  <option value="Canada">Canada</option>
                                  <option value="United Kingdom">United Kingdom</option>
                                  <option value="Australia">Australia</option>
                                </select>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddressForm(false)
                                setEditingAddress(null)
                                setNewAddress({
                                  name: "",
                                  street: "",
                                  city: "",
                                  state: "",
                                  zip: "",
                                  country: "United States",
                                })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-orange-500 text-black hover:bg-orange-600"
                              onClick={
                                editingAddress
                                  ? () => {
                                      const updatedAddresses = addresses.map((addr) =>
                                        addr.id === editingAddress.id
                                          ? {
                                              ...newAddress,
                                              id: editingAddress.id,
                                              isDefault: editingAddress.isDefault,
                                            }
                                          : addr,
                                      )
                                      setAddresses(updatedAddresses)
                                      setShowAddressForm(false)
                                      setEditingAddress(null)
                                      setNewAddress({
                                        name: "",
                                        street: "",
                                        city: "",
                                        state: "",
                                        zip: "",
                                        country: "United States",
                                      })
                                      toast({
                                        title: "Address updated",
                                        description: "Your address has been updated successfully.",
                                        duration: 3000,
                                      })
                                    }
                                  : handleAddAddress
                              }
                            >
                              {editingAddress ? "Update Address" : "Add Address"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payment" className="mt-0">
                <Card className="bg-gray-900/50 border-orange-900/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Payment Methods</CardTitle>
                      <CardDescription>Manage your payment methods</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="border-orange-500/50 hover:bg-orange-500/20"
                      onClick={() => setShowPaymentForm(true)}
                    >
                      Add Payment Method
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {paymentMethods.length > 0 ? (
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <Card key={method.id} className="bg-gray-800/50 border-orange-900/20">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-3">
                                  <div className="h-8 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded flex items-center justify-center text-black text-xs font-bold">
                                    {method.type.slice(0, 4).toUpperCase()}
                                  </div>
                                  {method.type} •••• {method.last4}
                                  {method.isDefault && (
                                    <Badge className="bg-orange-500/20 text-orange-400">Default</Badge>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-300"
                                    onClick={() => handleRemovePayment(method.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-gray-300">
                                <p>Expires: {method.expiry}</p>
                              </div>
                            </CardContent>
                            {!method.isDefault && (
                              <CardFooter className="border-t border-orange-900/20 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500/50 hover:bg-orange-500/20"
                                  onClick={() => handleSetDefaultPayment(method.id)}
                                >
                                  Set as Default
                                </Button>
                              </CardFooter>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <CreditCard className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No payment methods saved</h3>
                        <p className="text-gray-400 mb-6">Add a payment method to your account.</p>
                        <Button
                          className="bg-orange-500 text-black hover:bg-orange-600"
                          onClick={() => setShowPaymentForm(true)}
                        >
                          Add Payment Method
                        </Button>
                      </div>
                    )}

                    {/* Payment Form Modal */}
                    {showPaymentForm && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="bg-gray-900 border-orange-900/30 w-full max-w-lg">
                          <CardHeader>
                            <CardTitle>Add Payment Method</CardTitle>
                            <CardDescription>Enter your payment information</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="card-type">Card Type</Label>
                              <select
                                id="card-type"
                                value={newPayment.type}
                                onChange={(e) => setNewPayment((prev) => ({ ...prev, type: e.target.value }))}
                                className="w-full p-2 rounded-md bg-gray-800 border border-orange-900/30 focus:border-orange-500 text-white"
                              >
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="American Express">American Express</option>
                                <option value="Discover">Discover</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="card-number">Card Number</Label>
                              <Input
                                id="card-number"
                                value={newPayment.cardNumber}
                                onChange={(e) =>
                                  setNewPayment((prev) => ({
                                    ...prev,
                                    cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16),
                                  }))
                                }
                                placeholder="1234 5678 9012 3456"
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardholder-name">Cardholder Name</Label>
                              <Input
                                id="cardholder-name"
                                value={newPayment.name}
                                onChange={(e) => setNewPayment((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="John Doe"
                                className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry-month">Month</Label>
                                <select
                                  id="expiry-month"
                                  value={newPayment.expiryMonth}
                                  onChange={(e) => setNewPayment((prev) => ({ ...prev, expiryMonth: e.target.value }))}
                                  className="w-full p-2 rounded-md bg-gray-800 border border-orange-900/30 focus:border-orange-500 text-white"
                                >
                                  <option value="">MM</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                      {String(i + 1).padStart(2, "0")}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="expiry-year">Year</Label>
                                <select
                                  id="expiry-year"
                                  value={newPayment.expiryYear}
                                  onChange={(e) => setNewPayment((prev) => ({ ...prev, expiryYear: e.target.value }))}
                                  className="w-full p-2 rounded-md bg-gray-800 border border-orange-900/30 focus:border-orange-500 text-white"
                                >
                                  <option value="">YYYY</option>
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={String(new Date().getFullYear() + i)}>
                                      {new Date().getFullYear() + i}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  value={newPayment.cvv}
                                  onChange={(e) =>
                                    setNewPayment((prev) => ({
                                      ...prev,
                                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                                    }))
                                  }
                                  placeholder="123"
                                  className="bg-gray-800 border-orange-900/30 focus:border-orange-500"
                                />
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPaymentForm(false)
                                setNewPayment({
                                  type: "Visa",
                                  cardNumber: "",
                                  expiryMonth: "",
                                  expiryYear: "",
                                  cvv: "",
                                  name: "",
                                })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button className="bg-orange-500 text-black hover:bg-orange-600" onClick={handleAddPayment}>
                              Add Payment Method
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0">
                <Card className="bg-gray-900/50 border-orange-900/30">
                  <CardHeader>
                    <CardTitle className="text-2xl">Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-6">Notification Preferences</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="order-updates" className="text-base font-medium">
                              Order Updates
                            </Label>
                            <p className="text-sm text-gray-400">Receive notifications about your orders</p>
                          </div>
                          <Switch
                            id="order-updates"
                            checked={notifications.orderUpdates}
                            onCheckedChange={(checked) => handleUpdateNotifications("orderUpdates", checked)}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="promotions" className="text-base font-medium">
                              Promotions & Discounts
                            </Label>
                            <p className="text-sm text-gray-400">
                              Receive notifications about sales and special offers
                            </p>
                          </div>
                          <Switch
                            id="promotions"
                            checked={notifications.promotions}
                            onCheckedChange={(checked) => handleUpdateNotifications("promotions", checked)}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="new-arrivals" className="text-base font-medium">
                              New Arrivals
                            </Label>
                            <p className="text-sm text-gray-400">Be the first to know about new products</p>
                          </div>
                          <Switch
                            id="new-arrivals"
                            checked={notifications.newArrivals}
                            onCheckedChange={(checked) => handleUpdateNotifications("newArrivals", checked)}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="account-alerts" className="text-base font-medium">
                              Account Alerts
                            </Label>
                            <p className="text-sm text-gray-400">Receive important account notifications</p>
                          </div>
                          <Switch
                            id="account-alerts"
                            checked={notifications.accountAlerts}
                            onCheckedChange={(checked) => handleUpdateNotifications("accountAlerts", checked)}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-8 bg-orange-900/30" />

                    <div>
                      <h3 className="text-lg font-medium mb-6">Language & Region</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <select
                            id="language"
                            className="w-full p-3 rounded-md bg-gray-800 border border-orange-900/30 focus:border-orange-500 text-white"
                            defaultValue="en"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <select
                            id="currency"
                            className="w-full p-3 rounded-md bg-gray-800 border border-orange-900/30 focus:border-orange-500 text-white"
                            defaultValue="usd"
                          >
                            <option value="usd">USD ($)</option>
                            <option value="eur">EUR (€)</option>
                            <option value="gbp">GBP (£)</option>
                            <option value="jpy">JPY (¥)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-8 bg-orange-900/30" />

                    <div>
                      <h3 className="text-lg font-medium mb-6">Privacy & Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Profile Visibility</Label>
                            <p className="text-sm text-gray-400">Make your profile visible to other users</p>
                          </div>
                          <Switch className="data-[state=checked]:bg-orange-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Data Analytics</Label>
                            <p className="text-sm text-gray-400">Help us improve by sharing usage data</p>
                          </div>
                          <Switch defaultChecked className="data-[state=checked]:bg-orange-500" />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-8 bg-orange-900/30" />

                    <div>
                      <h3 className="text-lg font-medium mb-6 text-red-400">Danger Zone</h3>
                      <div className="space-y-4 p-6 bg-red-950/20 border border-red-900/30 rounded-lg">
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-400">Delete Account</h4>
                          <p className="text-sm text-gray-400">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          className="bg-red-900/50 hover:bg-red-900/70 text-red-300 border-red-700"
                          onClick={() => {
                            toast({
                              title: "Delete Account",
                              description: "Account deletion confirmation would appear here.",
                              duration: 3000,
                            })
                          }}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </main>

      <footer className="w-full border-t border-orange-900/30 bg-black py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">© 2023 DXRKICE. All rights reserved.</div>
            <div className="flex space-x-4">
              <Link href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-300">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
