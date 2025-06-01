"use client"

import { useEffect, useRef, useState } from "react"
import type { User } from '@/types.ts';
import SlidingCart from "@/components/sliding-cart"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  LogOut,
  ShoppingBag,
  User2,
} from "lucide-react"
import { authService } from '@/lib/api-auth';
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
  const scrollThreshold = 50
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false)
const handleGoToNewArrival = () => {
    // Navigate to '/' with hash but disable automatic scroll
    router.push('/#NewArrival', { scroll: false });
  };

  // This effect listens for pathname/hash changes and triggers scroll if needed
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#NewArrival') {
      // Wait for the DOM to paint/render
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // delay slightly to allow render
    }
  }, [/* optionally, listen to route changes here */]);



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

  const navigateToProfile = () => router.push("/profile")

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
     <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur transition-all duration-500 ${
        headerVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-10 text-white">
        <Link href="/dashboard" className="october-crow-text text-xl font-bold">DXRKICE</Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/#NewArrival" className="text-sm hover:underline">New Arrivals</Link>
          <Link href="#" className="text-sm hover:underline">Collection</Link>
          <Link href="#" className="text-sm hover:underline">Create</Link>
          <Link href="#" className="text-sm hover:underline">About</Link>
        </nav>


        <div className="flex items-center gap-4">
          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsCartOpen(true)}
                            className="relative hover:bg-orange-500/20 transition-colors duration-200"
                          >
                            <ShoppingBag className="h-5 w-5" />
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
        </div>
      </div>
    </header>
    <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
