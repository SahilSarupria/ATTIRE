"use client"

import { useEffect, useRef, useState } from "react"
import type { User } from '@/types.ts';
import { useCart } from "@/app/context/CartContext";
import SlidingCart from "@/components/sliding-cart"
import { motion,AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Bell,
  Heart,
  LogOut,
  ShoppingBag,
  User2,
  Menu,
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
  const [titleTransition, setTitleTransition] = useState(0)
const { cartItems } = useCart(); // inside your component
const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0); // total quantity
  const scrollThreshold = 50
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false)
const mobileMenuRef = useRef<HTMLDivElement | null>(null)
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(e.target as Node)
    ) {
      setMobileMenuOpen(false);
    }
  };

  const handleScroll = () => {
    setMobileMenuOpen(false);
  };

  // Attach listeners
  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("scroll", handleScroll);

  // Scroll lock toggle
  if (mobileMenuOpen) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }

  // Clean up
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("scroll", handleScroll);
    document.body.classList.remove("overflow-hidden"); // always clean this up
  };
}, [mobileMenuOpen]);



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
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username || " ",
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
  const navigateToHistory = () => {
    router.push("/history")
  }
    const navigateToWishlist = () => {
    router.push("/wishlist")
  }

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
        <Link href="/" className="october-crow-text text-xl font-bold">DXRKICE</Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/#NewArrival" className="text-sm font-medium hover:underline underline-offset-4">
              New Arrivals
            </Link>
            <Link href="/#Collection" className="text-sm font-medium hover:underline underline-offset-4">
              Collection
            </Link>
            <Link href="trending" className="text-sm font-medium hover:underline underline-offset-4">
              Trending
            </Link>
            <Link href="how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
<div className="flex items-center gap-4 pr-0 sm:pr-4 md:pr-8 lg:pr-10">

            {isLoading ? (
              // or user === null && loading ?
              // Optionally a spinner or empty div to avoid flicker
              <div style={{ width: 120, height: 40 }} />
            ) : user ? (
              // Authenticated user - show cart and profile
              <>
                {/* <CartButton></CartButton> */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsCartOpen(true)}
                  className="relative hover:bg-orange-500/20 transition-colors duration-200"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-black text-xs">
                    {itemCount}
                  </Badge>
                  <span className="sr-only">Shopping cart</span>
                </Button>
                <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-full hover:bg-orange-500/10 transition-all duration-300 group"
                    >
                      <User2 className="h-5 w-5 group-hover:text-orange-400 transition-colors" />
                      {/* Notification dot - only show if there are notifications */}
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-orange-500 border-2 border-black rounded-full"></div>
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-black/95 backdrop-blur-sm border border-orange-500/30 shadow-2xl shadow-orange-500/10"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault()
                    }}
                    sideOffset={8}
                  >
                    <div className="px-4 py-3 border-b border-orange-500/20">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <DropdownMenuItem
                        onClick={navigateToProfile}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <User2 className="mr-3 h-4 w-4 text-orange-500" />
                        Profile Settings
                      </DropdownMenuItem>

                      <DropdownMenuItem className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer">
                        <Bell className="mr-3 h-4 w-4 text-orange-500" />
                        Notifications
                        <Badge className="ml-auto bg-orange-500 text-black text-xs">3</Badge>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={navigateToHistory}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <ShoppingBag className="mr-3 h-4 w-4 text-orange-500" />
                        Design History
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={navigateToProfile}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <ShoppingBag className="mr-3 h-4 w-4 text-orange-500" />
                        My Orders
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={navigateToWishlist}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-orange-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <Heart className="mr-3 h-4 w-4 text-orange-500" />
                        Wishlist
                      </DropdownMenuItem>
                    </div>

                    <div className="border-t border-orange-500/20 py-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </>
            ) : (
              // Not authenticated - show login and signup buttons
              <div className="hidden md:flex items-center gap-2">
                <Button
                  onClick={() => router.push("/login?tab=login")}
                  variant="ghost"
                  className="text-sm font-medium hover:text-orange-400 transition-colors duration-200"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push("/login?tab=signup")}
                  className="bg-orange-500 text-black hover:bg-orange-600 transition-all duration-300 text-sm font-medium px-4 py-2"
                >
                  Sign Up
                </Button>
              </div>
            )}
            <Button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden p-2 text-white hover:text-orange-400"
  variant="ghost"
>
  <Menu />
</Button>

          </div>
        </div>
      </header>

      {/* Overlay + Sidebar */}
<AnimatePresence>
  {mobileMenuOpen && (
    <>
      {/* Blur + darken background, but under sidebar */}
      <motion.div
        className="fixed inset-0 z-40 backdrop-blur-sm bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar - above blurred content */}
      <motion.div
  ref={mobileMenuRef}
  className="fixed top-0 left-0 z-50 h-full w-64 bg-black/95 shadow-xl border-r border-orange-500/20 p-6 flex flex-col"
  initial={{ x: "-100%" }}
  animate={{ x: 0 }}
  exit={{ x: "-100%" }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
{/* Sidebar Brand */}
<div
  className="text-3xl font-bold tracking-wider font-creepster mb-6"
  style={{
    fontFamily: "'October Crow', cursive",
    color: "#f97316",
    letterSpacing: "0.2em",
    textShadow: "0 0 10px rgba(249, 115, 22, 0.4)",
  }}
>
  DXRKICE
</div>
{/* Scrollable middle content */}
<div className="flex-1 flex flex-col space-y-4 text-sm font-medium overflow-y-auto">
  <Link href="/#NewArrival" className="hover:text-orange-400">
    New Arrivals
  </Link>
  <Link href="/#Collection" className="hover:text-orange-400">
    Collection
  </Link>
  <Link href="trending" className="hover:text-orange-400">
    Trending
  </Link>
  <Link href="how-it-works" className="hover:text-orange-400">
    About
  </Link>

  {user && (
    <>
      <button onClick={navigateToProfile} className="text-left hover:text-orange-400">
        Profile Settings
      </button>
      <div className="flex items-center justify-between hover:text-orange-400 text-left">
      <button onClick={() => {}} className="flex-1 text-left">
        Notifications
      </button>
      <Badge className="bg-orange-500 text-black text-xs">3</Badge>
    </div>
      <button onClick={navigateToHistory} className="text-left hover:text-orange-400">
        Design History
      </button>
      <button onClick={navigateToWishlist} className="text-left hover:text-orange-400">
        Wishlist
      </button>
    </>
  )}
</div>

{/* Bottom section - sticks to bottom now */}
<div className="pt-6 border-t border-orange-500/20">
  {user ? (
    <>
      <div className="text-white text-sm mb-2">
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-gray-400">{user.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-red-400 hover:text-red-300"
      >
        Sign Out
      </button>
    </>
  ) : (
    <div className="flex flex-col space-y-2">
      <Button
        onClick={() => router.push("/login?tab=login")}
        variant="ghost"
        className="text-sm font-medium hover:text-orange-400"
      >
        Login
      </Button>
      <Button
        onClick={() => router.push("/login?tab=signup")}
        className="bg-orange-500 text-black hover:bg-orange-600 text-sm font-medium px-4 py-2"
      >
        Sign Up
      </Button>
    </div>
  )}
</div>

      </motion.div>
    </>
  )}
</AnimatePresence>

    <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
