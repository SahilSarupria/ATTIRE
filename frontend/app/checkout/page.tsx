"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import axiosInstance from "@/lib/axios"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Truck,
  CheckCircle,
  ShieldCheck,
  Instagram,
  Twitter,
  MapPin,
  Mail,
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
} from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// Define constants and types
const STEPS = {
  SHIPPING: 0,
  PAYMENT: 1,
  REVIEW: 2,
  CONFIRMATION: 3,
}

type StepType = (typeof STEPS)[keyof typeof STEPS]

interface SavedAddress {
  id: string
  type: "shipping" | "billing"
  first_name: string
  last_name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zip_code: string
  country: string
  is_default: boolean
  created_at: string
}

interface ShippingMethod {
  id: string
  name: string
  price: number
  estimatedDelivery: string
}

interface PaymentMethod {
  id: string
  name: string
  type: "card" | "paypal" | "applepay" | "googlepay"
  last4?: string
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  company?: string
}

interface BillingInfo {
  sameAsShipping: boolean
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  company?: string
}

interface CardInfo {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

export default function CheckoutPageEnhanced() {
  // Hooks
  const router = useRouter()
  const { toast } = useToast()
  const { cartItems, loading, clearCart } = useCart()

  // State
  const [currentStep, setCurrentStep] = useState<StepType>(STEPS.SHIPPING)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string>("")
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>("")
  const [showNewShippingForm, setShowNewShippingForm] = useState<boolean>(false)
  const [showNewBillingForm, setShowNewBillingForm] = useState<boolean>(false)
  const [addressesLoading, setAddressesLoading] = useState<boolean>(true)

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    company: "",
  })

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    sameAsShipping: true,
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    company: "",
  })

  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("standard")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card")
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({})
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})

  // Constants
  const shippingMethods: ShippingMethod[] = [
    {
      id: "standard",
      name: "Standard Shipping",
      price: 5.99,
      estimatedDelivery: "3-5 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      price: 12.99,
      estimatedDelivery: "1-2 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      price: 24.99,
      estimatedDelivery: "Next business day",
    },
  ]

  const paymentMethods: PaymentMethod[] = [
    { id: "card", name: "Credit / Debit Card", type: "card" },
    { id: "paypal", name: "PayPal", type: "paypal" },
    { id: "applepay", name: "Apple Pay", type: "applepay" },
    { id: "googlepay", name: "Google Pay", type: "googlepay" },
  ]

  // Calculations
  const subtotal: number = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems: number = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const tax: number = subtotal * 0.08
  const shippingCost: number = (() => {
    const method = shippingMethods.find((m) => m.id === selectedShippingMethod)
    return method ? method.price : 0
  })()
  const totalPrice: number = subtotal + tax + shippingCost

  // Fetch saved addresses on component mount
  useEffect(() => {
    fetchSavedAddresses()
  }, [])

  // Auto-save address when form is filled
  useEffect(() => {
    if (
      shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode &&
      !selectedShippingAddressId
    ) {
      const timeoutId = setTimeout(() => {
        autoSaveAddress("shipping", shippingInfo)
      }, 2000) // Auto-save after 2 seconds of no changes

      return () => clearTimeout(timeoutId)
    }
  }, [shippingInfo, selectedShippingAddressId])

  useEffect(() => {
    if (
      !billingInfo.sameAsShipping &&
      billingInfo.firstName &&
      billingInfo.lastName &&
      billingInfo.address &&
      billingInfo.city &&
      billingInfo.state &&
      billingInfo.zipCode &&
      !selectedBillingAddressId
    ) {
      const timeoutId = setTimeout(() => {
        autoSaveAddress("billing", billingInfo)
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [billingInfo, selectedBillingAddressId])


  let timeout: NodeJS.Timeout

  useEffect(() => {
    if (cartItems.length === 0 && currentStep !== STEPS.CONFIRMATION) {
      timeout = setTimeout(() => {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      })
    }, 500) // 500ms delay — you can adjust as needed
    }
     return () => clearTimeout(timeout)
  }, [cartItems.length, currentStep])

  // Address Management Functions
  const fetchSavedAddresses = async () => {
    try {
      setAddressesLoading(true)
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/addresses/`)
      setSavedAddresses(response.data)

      // Auto-select default addresses
      const defaultShipping = response.data.find((addr: SavedAddress) => addr.type === "shipping" && addr.is_default)
      const defaultBilling = response.data.find((addr: SavedAddress) => addr.type === "billing" && addr.is_default)

      if (defaultShipping) {
        setSelectedShippingAddressId(defaultShipping.id)
        populateShippingFromSaved(defaultShipping)
      } else if (response.data.length === 0) {
        setShowNewShippingForm(true)
      }

      if (defaultBilling) {
        setSelectedBillingAddressId(defaultBilling.id)
        setBillingInfo((prev) => ({ ...prev, sameAsShipping: false }))
        populateBillingFromSaved(defaultBilling)
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      setShowNewShippingForm(true) // Show form if no addresses exist
    } finally {
      setAddressesLoading(false)
    }
  }

  const autoSaveAddress = async (type: "shipping" | "billing", addressData: any) => {
    try {
      const payload = {
        type,
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        company: addressData.company || "",
        address1: addressData.address,
        address2: "",
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zipCode,
        country: addressData.country,
        is_default: savedAddresses.filter((addr) => addr.type === type).length === 0,
      }

      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/addresses/`, payload)

      setSavedAddresses((prev) => [...prev, response.data])

      if (type === "shipping") {
        setSelectedShippingAddressId(response.data.id)
      } else {
        setSelectedBillingAddressId(response.data.id)
      }

      toast({
        title: "Address Saved",
        description: `Your ${type} address has been saved for future use.`,
      })
    } catch (error) {
      console.error("Error auto-saving address:", error)
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/addresses/${addressId}/delete/`)
      setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressId))

      if (selectedShippingAddressId === addressId) {
        setSelectedShippingAddressId("")
        setShowNewShippingForm(true)
      }
      if (selectedBillingAddressId === addressId) {
        setSelectedBillingAddressId("")
        setShowNewBillingForm(true)
      }

      toast({
        title: "Address Deleted",
        description: "Address has been removed from your account.",
      })
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const populateShippingFromSaved = (address: SavedAddress) => {
    setShippingInfo({
      firstName: address.first_name,
      lastName: address.last_name,
      email: shippingInfo.email, // Keep existing email
      phone: shippingInfo.phone, // Keep existing phone
      address: address.address1,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country,
      company: address.company || "",
    })
  }

  const populateBillingFromSaved = (address: SavedAddress) => {
    setBillingInfo((prev) => ({
      ...prev,
      firstName: address.first_name,
      lastName: address.last_name,
      address: address.address1,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country,
      company: address.company || "",
    }))
  }

  const handleShippingAddressSelect = (addressId: string) => {
    setSelectedShippingAddressId(addressId)
    const address = savedAddresses.find((addr) => addr.id === addressId)
    if (address) {
      populateShippingFromSaved(address)
    }
    setShowNewShippingForm(false)
  }

  const handleBillingAddressSelect = (addressId: string) => {
    setSelectedBillingAddressId(addressId)
    const address = savedAddresses.find((addr) => addr.id === addressId)
    if (address) {
      populateBillingFromSaved(address)
    }
    setShowNewBillingForm(false)
  }

  // Helper functions
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length <= 2) {
      return v
    }

    return `${v.substring(0, 2)}/${v.substring(2, 4)}`
  }

  const validateShippingForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!shippingInfo.firstName.trim()) errors.firstName = "First name is required"
    if (!shippingInfo.lastName.trim()) errors.lastName = "Last name is required"
    if (!shippingInfo.email.trim()) errors.email = "Email is required"
    if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email)) errors.email = "Invalid email format"
    if (!shippingInfo.phone.trim()) errors.phone = "Phone number is required"
    if (!shippingInfo.address.trim()) errors.address = "Address is required"
    if (!shippingInfo.city.trim()) errors.city = "City is required"
    if (!shippingInfo.state.trim()) errors.state = "State is required"
    if (!shippingInfo.zipCode.trim()) errors.zipCode = "ZIP code is required"

    setShippingErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePaymentForm = (): boolean => {
    if (selectedPaymentMethod !== "card") return true

    const errors: Record<string, string> = {}

    if (!cardInfo.cardNumber.trim()) errors.cardNumber = "Card number is required"
    if (!/^\d{16}$/.test(cardInfo.cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Invalid card number"
    }

    if (!cardInfo.cardName.trim()) errors.cardName = "Name on card is required"

    if (!cardInfo.expiryDate.trim()) errors.expiryDate = "Expiry date is required"
    if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiryDate)) {
      errors.expiryDate = "Invalid format (MM/YY)"
    }

    if (!cardInfo.cvv.trim()) errors.cvv = "CVV is required"
    if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
      errors.cvv = "Invalid CVV"
    }

    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Event handlers
  const handleNextStep = (): void => {
    if (currentStep === STEPS.SHIPPING) {
      if (!validateShippingForm()) return

      if (billingInfo.sameAsShipping) {
        setBillingInfo({
          ...billingInfo,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
          company: shippingInfo.company,
        })
      }

      setCurrentStep(STEPS.PAYMENT)
    } else if (currentStep === STEPS.PAYMENT) {
      if (!validatePaymentForm()) return
      setCurrentStep(STEPS.REVIEW)
    } else if (currentStep === STEPS.REVIEW) {
      handlePlaceOrder()
    }
  }

  const handlePrevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePlaceOrder = async (): Promise<void> => {
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("orders/create/", {
        shipping_address: shippingInfo,
        billing_address: billingInfo,
        shipping_address_id: selectedShippingAddressId,
        billing_address_id: selectedBillingAddressId,
      })

      const { order, client_secret } = response.data

      setOrderId(order.order_number)
      setCurrentStep(STEPS.CONFIRMATION)
      await clearCart()

      toast({
        title: "Order Placed Successfully",
        description: `Your order #${order.order_number} has been placed.`,
      })
    } catch (error: any) {
      console.error("Error placing order:", error.response?.data || error.message)
      toast({
        title: "Order Failed",
        description: error.response?.data?.error || "There was an error placing your order.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))

    if (shippingErrors[name]) {
      setShippingErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleBillingInfoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setBillingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setCardInfo((prev) => ({ ...prev, [name]: value }))

    if (paymentErrors[name]) {
      setPaymentErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formattedValue = formatCardNumber(e.target.value)
    setCardInfo((prev) => ({ ...prev, cardNumber: formattedValue }))

    if (paymentErrors.cardNumber) {
      setPaymentErrors((prev) => ({ ...prev, cardNumber: "" }))
    }
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formattedValue = formatExpiryDate(e.target.value)
    setCardInfo((prev) => ({ ...prev, expiryDate: formattedValue }))

    if (paymentErrors.expiryDate) {
      setPaymentErrors((prev) => ({ ...prev, expiryDate: "" }))
    }
  }

  const handleSameAsShippingChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = e.target.checked
    setBillingInfo((prev) => ({ ...prev, sameAsShipping: checked }))
    if (checked) {
      setSelectedBillingAddressId("")
      setShowNewBillingForm(false)
    }
  }

  const handleContinueShopping = (): void => {
    router.push("/dashboard")
  }

  const handleViewOrderDetails = (): void => {
    router.push(`/orders/${orderId}`)
  }

  // Render saved address card
  const renderAddressCard = (address: SavedAddress, type: "shipping" | "billing") => (
    <motion.div
      key={address.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
        (type === "shipping" ? selectedShippingAddressId : selectedBillingAddressId) === address.id
          ? "border-orange-500 bg-orange-500/10"
          : "border-gray-700 bg-gray-900 hover:border-gray-600"
      }`}
      onClick={() =>
        type === "shipping" ? handleShippingAddressSelect(address.id) : handleBillingAddressSelect(address.id)
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <RadioGroupItem
            value={address.id}
            id={address.id}
            className="mt-1"
            checked={(type === "shipping" ? selectedShippingAddressId : selectedBillingAddressId) === address.id}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {address.type === "shipping" ? (
                <Home className="h-4 w-4 text-orange-400" />
              ) : (
                <Building className="h-4 w-4 text-orange-400" />
              )}
              <span className="font-medium text-white">
                {address.first_name} {address.last_name}
              </span>
              {address.is_default && (
                <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                  Default
                </Badge>
              )}
            </div>
            {address.company && <p className="text-sm text-gray-400 mb-1">{address.company}</p>}
            <p className="text-sm text-gray-400">
              {address.address1}
              {address.address2 && `, ${address.address2}`}
            </p>
            <p className="text-sm text-gray-400">
              {address.city}, {address.state} {address.zip_code}
            </p>
            <p className="text-sm text-gray-400">{address.country}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              // Edit functionality can be added here
            }}
            className="h-8 w-8 p-0 hover:bg-gray-800"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              deleteAddress(address.id)
            }}
            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )

  // Main return statement
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

        {/* Step Indicator */}
        {currentStep !== STEPS.CONFIRMATION && (
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[
                { name: "Shipping", step: STEPS.SHIPPING },
                { name: "Payment", step: STEPS.PAYMENT },
                { name: "Review", step: STEPS.REVIEW },
              ].map((step, index, steps) => (
                <div key={step.name} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.step ? "bg-orange-500 text-black" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {currentStep > step.step ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
                  </div>

                  <span
                    className={`ml-2 text-sm font-medium ${currentStep >= step.step ? "text-white" : "text-gray-500"}`}
                  >
                    {step.name}
                  </span>

                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 md:w-32 h-1 mx-2 ${
                        currentStep > step.step ? "bg-orange-500" : "bg-gray-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shipping Step */}
            {currentStep === STEPS.SHIPPING && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Contact Information</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={shippingInfo.email}
                            onChange={handleShippingInfoChange}
                            placeholder="john.doe@example.com"
                            className={`bg-gray-900 border-gray-700 ${shippingErrors.email ? "border-red-500" : ""}`}
                          />
                          {shippingErrors.email && <p className="text-xs text-red-500">{shippingErrors.email}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={shippingInfo.phone}
                            onChange={handleShippingInfoChange}
                            placeholder="(123) 456-7890"
                            className={`bg-gray-900 border-gray-700 ${shippingErrors.phone ? "border-red-500" : ""}`}
                          />
                          {shippingErrors.phone && <p className="text-xs text-red-500">{shippingErrors.phone}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">Shipping Address</h3>
                        {savedAddresses.filter((addr) => addr.type === "shipping").length > 0 &&
                          !showNewShippingForm && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowNewShippingForm(true)}
                              className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New
                            </Button>
                          )}
                      </div>

                      {addressesLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse bg-gray-800 h-20 rounded-lg" />
                          ))}
                        </div>
                      ) : (
                        <>
                          {/* Saved Addresses */}
                          {savedAddresses.filter((addr) => addr.type === "shipping").length > 0 &&
                            !showNewShippingForm && (
                              <div className="space-y-3 group">
                                <RadioGroup
  value={selectedShippingAddressId}
  onValueChange={handleShippingAddressSelect}
>
                                {savedAddresses
                                  .filter((addr) => addr.type === "shipping")
                                  .map((address) => renderAddressCard(address, "shipping"))}
                                  </RadioGroup>
                              </div>
                            )}

                          {/* New Address Form */}
                          {(showNewShippingForm ||
                            savedAddresses.filter((addr) => addr.type === "shipping").length === 0) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-900/50"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white">New Shipping Address</h4>
                                {savedAddresses.filter((addr) => addr.type === "shipping").length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewShippingForm(false)}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="firstName">First Name</Label>
                                  <Input
                                    id="firstName"
                                    name="firstName"
                                    value={shippingInfo.firstName}
                                    onChange={handleShippingInfoChange}
                                    placeholder="John"
                                    className={`bg-gray-900 border-gray-700 ${
                                      shippingErrors.firstName ? "border-red-500" : ""
                                    }`}
                                  />
                                  {shippingErrors.firstName && (
                                    <p className="text-xs text-red-500">{shippingErrors.firstName}</p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name</Label>
                                  <Input
                                    id="lastName"
                                    name="lastName"
                                    value={shippingInfo.lastName}
                                    onChange={handleShippingInfoChange}
                                    placeholder="Doe"
                                    className={`bg-gray-900 border-gray-700 ${shippingErrors.lastName ? "border-red-500" : ""}`}
                                  />
                                  {shippingErrors.lastName && (
                                    <p className="text-xs text-red-500">{shippingErrors.lastName}</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="company">Company (Optional)</Label>
                                <Input
                                  id="company"
                                  name="company"
                                  value={shippingInfo.company}
                                  onChange={handleShippingInfoChange}
                                  placeholder="Company Name"
                                  className="bg-gray-900 border-gray-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="address">Street Address</Label>
                                <Input
                                  id="address"
                                  name="address"
                                  value={shippingInfo.address}
                                  onChange={handleShippingInfoChange}
                                  placeholder="123 Main St"
                                  className={`bg-gray-900 border-gray-700 ${shippingErrors.address ? "border-red-500" : ""}`}
                                />
                                {shippingErrors.address && (
                                  <p className="text-xs text-red-500">{shippingErrors.address}</p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  name="city"
                                  value={shippingInfo.city}
                                  onChange={handleShippingInfoChange}
                                  placeholder="New York"
                                  className={`bg-gray-900 border-gray-700 ${shippingErrors.city ? "border-red-500" : ""}`}
                                />
                                {shippingErrors.city && <p className="text-xs text-red-500">{shippingErrors.city}</p>}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="state">State / Province</Label>
                                  <Input
                                    id="state"
                                    name="state"
                                    value={shippingInfo.state}
                                    onChange={handleShippingInfoChange}
                                    placeholder="NY"
                                    className={`bg-gray-900 border-gray-700 ${shippingErrors.state ? "border-red-500" : ""}`}
                                  />
                                  {shippingErrors.state && (
                                    <p className="text-xs text-red-500">{shippingErrors.state}</p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                                  <Input
                                    id="zipCode"
                                    name="zipCode"
                                    value={shippingInfo.zipCode}
                                    onChange={handleShippingInfoChange}
                                    placeholder="10001"
                                    className={`bg-gray-900 border-gray-700 ${shippingErrors.zipCode ? "border-red-500" : ""}`}
                                  />
                                  {shippingErrors.zipCode && (
                                    <p className="text-xs text-red-500">{shippingErrors.zipCode}</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                  id="country"
                                  name="country"
                                  value={shippingInfo.country}
                                  onChange={handleShippingInfoChange}
                                  placeholder="United States"
                                  className="bg-gray-900 border-gray-700"
                                />
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">Billing Address</h3>
                        {savedAddresses.filter((addr) => addr.type === "billing").length > 0 &&
                          !showNewBillingForm &&
                          !billingInfo.sameAsShipping && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowNewBillingForm(true)}
                              className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New
                            </Button>
                          )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sameAsShipping"
                          checked={billingInfo.sameAsShipping}
                          onChange={handleSameAsShippingChange}
                          className="rounded border-gray-700 bg-gray-900 text-orange-500 focus:ring-orange-500"
                        />
                        <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                      </div>

                      {!billingInfo.sameAsShipping && (
                        <>
                          {/* Saved Billing Addresses */}
                          {savedAddresses.filter((addr) => addr.type === "billing").length > 0 &&
                            !showNewBillingForm && (
                              <div className="space-y-3 group">
                                <RadioGroup
  value={selectedShippingAddressId}
  onValueChange={handleShippingAddressSelect}
>
                                {savedAddresses
                                  .filter((addr) => addr.type === "billing")
                                  .map((address) => renderAddressCard(address, "billing"))}
                                  </RadioGroup>
                              </div>
                            )}

                          {/* New Billing Address Form */}
                          {(showNewBillingForm ||
                            savedAddresses.filter((addr) => addr.type === "billing").length === 0) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-900/50"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white">New Billing Address</h4>
                                {savedAddresses.filter((addr) => addr.type === "billing").length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewBillingForm(false)}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="billingFirstName">First Name</Label>
                                  <Input
                                    id="billingFirstName"
                                    name="firstName"
                                    value={billingInfo.firstName}
                                    onChange={handleBillingInfoChange}
                                    placeholder="John"
                                    className="bg-gray-900 border-gray-700"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="billingLastName">Last Name</Label>
                                  <Input
                                    id="billingLastName"
                                    name="lastName"
                                    value={billingInfo.lastName}
                                    onChange={handleBillingInfoChange}
                                    placeholder="Doe"
                                    className="bg-gray-900 border-gray-700"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="billingCompany">Company (Optional)</Label>
                                <Input
                                  id="billingCompany"
                                  name="company"
                                  value={billingInfo.company}
                                  onChange={handleBillingInfoChange}
                                  placeholder="Company Name"
                                  className="bg-gray-900 border-gray-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="billingAddress">Street Address</Label>
                                <Input
                                  id="billingAddress"
                                  name="address"
                                  value={billingInfo.address}
                                  onChange={handleBillingInfoChange}
                                  placeholder="123 Main St"
                                  className="bg-gray-900 border-gray-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="billingCity">City</Label>
                                <Input
                                  id="billingCity"
                                  name="city"
                                  value={billingInfo.city}
                                  onChange={handleBillingInfoChange}
                                  placeholder="New York"
                                  className="bg-gray-900 border-gray-700"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="billingState">State / Province</Label>
                                  <Input
                                    id="billingState"
                                    name="state"
                                    value={billingInfo.state}
                                    onChange={handleBillingInfoChange}
                                    placeholder="NY"
                                    className="bg-gray-900 border-gray-700"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="billingZipCode">ZIP / Postal Code</Label>
                                  <Input
                                    id="billingZipCode"
                                    name="zipCode"
                                    value={billingInfo.zipCode}
                                    onChange={handleBillingInfoChange}
                                    placeholder="10001"
                                    className="bg-gray-900 border-gray-700"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="billingCountry">Country</Label>
                                <Input
                                  id="billingCountry"
                                  name="country"
                                  value={billingInfo.country}
                                  onChange={handleBillingInfoChange}
                                  placeholder="United States"
                                  className="bg-gray-900 border-gray-700"
                                />
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Order Summary</h3>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.name}</p>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <span>Qty: {item.quantity}</span>
                                {item.size && <span className="ml-2">Size: {item.size}</span>}
                                {item.color && <span className="ml-2">Color: {item.color}</span>}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-orange-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-gray-700" />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal ({totalItems} items)</span>
                          <span className="text-white">${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping</span>
                          <span className="text-white">Calculated next</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tax</span>
                          <span className="text-white">${tax.toFixed(2)}</span>
                        </div>

                        <Separator className="bg-gray-700" />

                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-orange-400">${(subtotal + tax).toFixed(2)}+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Step - Keep existing payment step code */}
            {currentStep === STEPS.PAYMENT && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Shipping Method */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Shipping Method</h3>

                      <RadioGroup
                        value={selectedShippingMethod}
                        onValueChange={setSelectedShippingMethod}
                        className="space-y-3"
                      >
                        {shippingMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              selectedShippingMethod === method.id
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 bg-gray-900"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={method.id} id={method.id} className="text-orange-500" />
                              <div>
                                <Label htmlFor={method.id} className="font-medium text-white">
                                  {method.name}
                                </Label>
                                <p className="text-sm text-gray-400">{method.estimatedDelivery}</p>
                              </div>
                            </div>
                            <span className="font-medium text-orange-400">${method.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Payment Method</h3>

                      <Tabs value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="w-full">
                        <TabsList className="grid grid-cols-4 bg-gray-900">
                          <TabsTrigger value="card" className="data-[state=active]:bg-orange-500/20">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Card
                          </TabsTrigger>
                          <TabsTrigger value="paypal" className="data-[state=active]:bg-orange-500/20">
                            PayPal
                          </TabsTrigger>
                          <TabsTrigger value="applepay" className="data-[state=active]:bg-orange-500/20">
                            Apple Pay
                          </TabsTrigger>
                          <TabsTrigger value="googlepay" className="data-[state=active]:bg-orange-500/20">
                            Google Pay
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="card" className="pt-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                value={cardInfo.cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                className={`bg-gray-900 border-gray-700 ${
                                  paymentErrors.cardNumber ? "border-red-500" : ""
                                }`}
                              />
                              {paymentErrors.cardNumber && (
                                <p className="text-xs text-red-500">{paymentErrors.cardNumber}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cardName">Name on Card</Label>
                              <Input
                                id="cardName"
                                name="cardName"
                                value={cardInfo.cardName}
                                onChange={handleCardInfoChange}
                                placeholder="John Doe"
                                className={`bg-gray-900 border-gray-700 ${
                                  paymentErrors.cardName ? "border-red-500" : ""
                                }`}
                              />
                              {paymentErrors.cardName && (
                                <p className="text-xs text-red-500">{paymentErrors.cardName}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                  id="expiryDate"
                                  name="expiryDate"
                                  value={cardInfo.expiryDate}
                                  onChange={handleExpiryDateChange}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className={`bg-gray-900 border-gray-700 ${
                                    paymentErrors.expiryDate ? "border-red-500" : ""
                                  }`}
                                />
                                {paymentErrors.expiryDate && (
                                  <p className="text-xs text-red-500">{paymentErrors.expiryDate}</p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  name="cvv"
                                  value={cardInfo.cvv}
                                  onChange={handleCardInfoChange}
                                  placeholder="123"
                                  maxLength={4}
                                  className={`bg-gray-900 border-gray-700 ${paymentErrors.cvv ? "border-red-500" : ""}`}
                                />
                                {paymentErrors.cvv && <p className="text-xs text-red-500">{paymentErrors.cvv}</p>}
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="paypal" className="pt-4">
                          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 text-center">
                            <p className="text-gray-400 mb-4">
                              You will be redirected to PayPal to complete your payment after reviewing your order.
                            </p>
                            <img src="/placeholder.svg?height=40&width=150" alt="PayPal" className="h-10 mx-auto" />
                          </div>
                        </TabsContent>

                        <TabsContent value="applepay" className="pt-4">
                          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 text-center">
                            <p className="text-gray-400 mb-4">
                              You will be prompted to complete your payment with Apple Pay after reviewing your order.
                            </p>
                            <img src="/placeholder.svg?height=40&width=150" alt="Apple Pay" className="h-10 mx-auto" />
                          </div>
                        </TabsContent>

                        <TabsContent value="googlepay" className="pt-4">
                          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 text-center">
                            <p className="text-gray-400 mb-4">
                              You will be prompted to complete your payment with Google Pay after reviewing your order.
                            </p>
                            <img src="/placeholder.svg?height=40&width=150" alt="Google Pay" className="h-10 mx-auto" />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Order Summary</h3>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.name}</p>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <span>Qty: {item.quantity}</span>
                                {item.size && <span className="ml-2">Size: {item.size}</span>}
                                {item.color && <span className="ml-2">Color: {item.color}</span>}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-orange-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-gray-700" />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal ({totalItems} items)</span>
                          <span className="text-white">${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping</span>
                          <span className="text-white">${shippingCost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tax</span>
                          <span className="text-white">${tax.toFixed(2)}</span>
                        </div>

                        <Separator className="bg-gray-700" />

                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-orange-400">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Step - Keep existing review step code */}
            {currentStep === STEPS.REVIEW && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Review Your Order</h3>

                      <div className="space-y-4">
                        {/* Shipping Information */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <h4 className="font-medium text-white mb-2 flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-orange-400" />
                            Shipping Information
                          </h4>
                          <p className="text-sm text-gray-400">
                            {shippingInfo.firstName} {shippingInfo.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{shippingInfo.email}</p>
                          <p className="text-sm text-gray-400">{shippingInfo.phone}</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                          </p>
                          <p className="text-sm text-gray-400">{shippingInfo.country}</p>
                        </div>

                        {/* Shipping Method */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <h4 className="font-medium text-white mb-2 flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-orange-400" />
                            Shipping Method
                          </h4>
                          <p className="text-sm text-gray-400">
                            {shippingMethods.find((m) => m.id === selectedShippingMethod)?.name} - $
                            {shippingMethods.find((m) => m.id === selectedShippingMethod)?.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400">
                            Estimated Delivery:{" "}
                            {shippingMethods.find((m) => m.id === selectedShippingMethod)?.estimatedDelivery}
                          </p>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <h4 className="font-medium text-white mb-2 flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-orange-400" />
                            Payment Method
                          </h4>
                          {selectedPaymentMethod === "card" ? (
                            <div>
                              <p className="text-sm text-gray-400">{cardInfo.cardName}</p>
                              <p className="text-sm text-gray-400">**** **** **** {cardInfo.cardNumber.slice(-4)}</p>
                              <p className="text-sm text-gray-400">Expires: {cardInfo.expiryDate}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">
                              {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name}
                            </p>
                          )}
                        </div>

                        {/* Billing Address (if different) */}
                        {!billingInfo.sameAsShipping && (
                          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                            <h4 className="font-medium text-white mb-2">Billing Address</h4>
                            <p className="text-sm text-gray-400">
                              {billingInfo.firstName} {billingInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              {billingInfo.address}, {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
                            </p>
                            <p className="text-sm text-gray-400">{billingInfo.country}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-white">Order Summary</h3>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.name}</p>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <span>Qty: {item.quantity}</span>
                                {item.size && <span className="ml-2">Size: {item.size}</span>}
                                {item.color && <span className="ml-2">Color: {item.color}</span>}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-orange-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-gray-700" />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal ({totalItems} items)</span>
                          <span className="text-white">${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping</span>
                          <span className="text-white">${shippingCost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tax</span>
                          <span className="text-white">${tax.toFixed(2)}</span>
                        </div>

                        <Separator className="bg-gray-700" />

                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-orange-400">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2 text-orange-400" />
                        Secure Checkout
                      </div>
                      <p className="text-xs text-gray-500">
                        Your payment information is processed securely. We do not store credit card details nor have
                        access to your credit card information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === STEPS.CONFIRMATION && (
              <div className="max-w-2xl mx-auto text-center space-y-6 py-8">
                <div className="flex justify-center">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </div>

                <h2 className="text-3xl font-bold text-white">Thank You for Your Order!</h2>

                <p className="text-gray-400">
                  Your order #{orderId} has been placed successfully. We've sent a confirmation email to{" "}
                  {shippingInfo.email}.
                </p>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-left">
                  <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Order Number</span>
                      <span className="text-white">{orderId}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Order Date</span>
                      <span className="text-white">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping Method</span>
                      <span className="text-white">
                        {shippingMethods.find((m) => m.id === selectedShippingMethod)?.name}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Payment Method</span>
                      <span className="text-white">
                        {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name}
                      </span>
                    </div>

                    <Separator className="bg-gray-700 my-2" />

                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-orange-400">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={handleViewOrderDetails} className="bg-orange-500 text-black hover:bg-orange-600">
                    View Order Details
                  </Button>

                  <Button
                    onClick={handleContinueShopping}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-800"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < STEPS.CONFIRMATION && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrevStep}
              variant="outline"
              disabled={currentStep === STEPS.SHIPPING || isLoading}
              className="border-gray-600 hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={isLoading}
              className="bg-orange-500 text-black hover:bg-orange-600"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {currentStep === STEPS.REVIEW ? "Processing..." : "Loading..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {currentStep === STEPS.REVIEW ? "Place Order" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
      <footer className="w-full border-t border-orange-900/30 bg-black py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">DXRKICE</h3>
              <p className="max-w-[250px] text-sm text-gray-400">
                Sustainable, ethical fashion for the modern individual.
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={() => window.open("https://www.instagram.com/", "_blank")}
                  size="icon"
                  variant="ghost"
                  className="hover:text-orange-500 transition-colors duration-300"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
                <Button
                  onClick={() => window.open("https://twitter.com/", "_blank")}
                  size="icon"
                  variant="ghost"
                  className="hover:text-orange-500 transition-colors duration-300"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Women
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Men
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span className="text-gray-400">123 Fashion St, Design District, CA 90210</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 shrink-0" />
                  <span className="text-gray-400">hello@DXRKICE.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2023 DXRKICE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
