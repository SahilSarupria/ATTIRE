"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LogOut,
  ShoppingBag,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

export default function Header() {
  const router = useRouter()
  const { toast } = useToast()
  const [headerVisible, setHeaderVisible] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current + 5) {
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY.current - 5) {
        setHeaderVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
    toast({ title: "Logged out", description: "You have been successfully logged out." })
  }

  const navigateToProfile = () => router.push("/profile")

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur transition-all duration-500 ${
        headerVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-10 text-white">
        <Link href="/dashboard" className="text-xl font-bold">ATTIRE</Link>

        <nav className="hidden md:flex gap-6">
          <Link href="#" className="text-sm hover:underline">New Arrivals</Link>
          <Link href="#" className="text-sm hover:underline">Women</Link>
          <Link href="#" className="text-sm hover:underline">Men</Link>
          <Link href="#" className="text-sm hover:underline">Accessories</Link>
          <Link href="#" className="text-sm hover:underline">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-sm text-gray-500">
                  {user.email}
                </DropdownMenuLabel>
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
          <Button size="icon" variant="ghost">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button className="md:hidden" size="icon" variant="ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}
