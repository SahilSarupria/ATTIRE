"use client"

import { useEffect, useRef, useState } from "react"
import type { User } from '@/types.ts';
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ArrowRight, Instagram, LogOut, Mail, MapPin, ShoppingBag, Twitter, User2 } from "lucide-react"
import NewArrivalsCarousel from "@/components/new-arrivals-carousel"
import { motion } from "framer-motion"
import Head from "next/head"
import { authService } from '@/lib/api-auth';
import SlidingCart from "@/components/sliding-cart"
import { Badge } from "@/components/ui/badge"
import LoginPage from "@/components/login-page";
import CartButton from "@/components/cart-button";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Custom styles for orange theme
const orangeGlow = {
  boxShadow: "0 0 15px 2px rgba(249, 115, 22, 0.15)",
  transition: "all 0.3s ease",
}


//
const categories = [
  { title: "Tshirts", image: "/tshirt.jpg", slug: "tshirt" },
  { title: "Shirts", image: "/shirt.jpg", slug: "shirt" },
  { title: "Hoodies", image: "/hoodie.jpg", slug: "hoodie" },
  { title: "Jackets", image: "/jacket.jpg", slug: "jacket" },
  { title: "Pants", image: "/pant.jpg", slug: "pant" },
]

// Define user type
type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

export default function MainPage() {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false);

  const { toast } = useToast()
  const [scrollY, setScrollY] = useState(0)
  const [headerVisible, setHeaderVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const scrollThreshold = 50
  const [isLoading, setIsLoading] = useState<boolean>(false);
const pathname = usePathname();
  const [titleTransition, setTitleTransition] = useState(0)
  const [user, setUser] = useState<UserType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
const [showButtons, setShowButtons] = useState(false);




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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)

      // Determine if we're scrolling up or down
      if (currentScrollY > lastScrollY.current + 5) {
        // Added small threshold to prevent jitter
        // Scrolling down
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY.current - 5) {
        // Scrolling up
        setHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY

      // Calculate title transition value (0 to 1)
      if (heroSectionRef.current) {
        const heroHeight = heroSectionRef.current.offsetHeight
        const transitionPoint = heroHeight * 0.5
        const transitionValue = Math.min(1, Math.max(0, currentScrollY / transitionPoint))
        setTitleTransition(transitionValue)
      }
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


  const navigateToProfile = () => {
    router.push("/profile")
  }

  const handleStartCreating = () => {
    router.push("/create")
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



  // Calculate hero section opacity and transform based on scroll position
  const heroOpacity = Math.max(0, 1 - scrollY / 500)
  const heroTransform = `translateY(${scrollY * 0.3}px)`
  useEffect(() => {
  fetchUserProfile();
}, []);

useEffect(() => {
    // Delay showing buttons by 500ms (adjust as needed)
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 500);

    return () => clearTimeout(timer); // cleanup on unmount
  }, []);

  if (!showButtons) {
    return null; // or a placeholder/spinner
  }
console.log("Current user:", user);
  return (
    <div className="flex min-h-screen mx-auto flex-col bg-black text-white">
      <Head>
        <link rel="preload" href="/favicon.png" as="image" />
        <link href="https://fonts.cdnfonts.com/css/october-crow" rel="stylesheet" />
      </Head>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-orange-900/30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80 transition-all duration-500 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-wider transition-opacity font-creepster duration-500 pl-10"
            style={{
              fontFamily: "'October Crow', cursive",
              opacity: titleTransition,
              color: titleTransition > 0.5 ? "#f97316" : "white",
              letterSpacing: "0.2em",
              textShadow: titleTransition > 0.5 ? "0 0 10px rgba(249, 115, 22, 0.4)" : "none",
            }}
          >
            DXRKICE
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#NewArrival" className="text-sm font-medium hover:underline underline-offset-4">
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
          <div className="flex items-center gap-4 pr-10">
            {user === undefined ? (
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
                    3
                  </Badge>
                  <span className="sr-only">Shopping cart</span>
                </Button>

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
              </>
            ) : (
              // Not authenticated - show login and signup buttons
              <div className="flex items-center gap-2">
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

          </div>
        </div>
      </header>
      {/* Sliding Cart Component */}
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <main className="flex-1 pt-6 lg:pt-16">
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <section
            ref={heroSectionRef}
            className="relative h-[90vh] sm:h-[100vh] w-full px-4 md:px-8 lg:px-12 flex items-center justify-center"
            style={{
              opacity: heroOpacity,
              transform: heroTransform,
              visibility: heroOpacity <= 0.05 ? "hidden" : "visible",
              transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90"></div>

            <div
              className="relative 
  w-full
  max-w-[95vw]
  sm:max-w-[600px]
  md:max-w-[900px]
  lg:max-w-[1300px]
  mx-auto 
  overflow-hidden 
  rounded-2xl 
  shadow-2xl
  aspect-auto
  min-h-[500px]
  sm:aspect-[4/3]
  md:aspect-[3/2] 
  lg:aspect-[2/1]"
              style={{ boxShadow: "0 0 40px rgba(249, 115, 22, 0.5)" }}
            >
              {/* Background image/video */}
              <div className="absolute inset-0 bg-black/80 z-0">
                <video ref={videoRef} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-70">
                  <source src="/placeholder-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center p-4 sm:p-8 sm:pt-8 md:p-12 h-full">
                {/* Centered content */}
                <div className="flex flex-col text-center items-center justify-center space-y-6 max-w-2xl pt-6 pl-2">
                  {/* <h1
                    className="text-6xl md:text-8xl font-bold mb-4 tracking-wider transition-all duration-500"
                    style={{
                      fontFamily: "'October Crow', cursive",
                      opacity: 1 - titleTransition,
                      transform: `scale(${1 - titleTransition * 0.3}) translateY(${titleTransition * -20}px)`,
                      color: "white",
                      letterSpacing: "0.2em",
                      textShadow:
                        "0 0 4px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 120, 0, 0.6)",
                    }}
                  >
                    DXRKICE
                  </h1> */}
                  <img
  src="/favicon.png"
  alt="DXRKICE"
  onLoad={() => setImageLoaded(true)}
  style={{
    opacity: 1, // always visible
    transform: `scale(${1 - titleTransition * 0.3}) translateY(${titleTransition * 30}px)`,
    transition: "transform 0.5s ease-in-out", // keep other transitions
    filter:  `
        drop-shadow(0 0 4px rgba(255, 165, 0, 0.3))
        drop-shadow(0 0 6px rgba(255, 140, 0, 0.37))
        drop-shadow(0 0 19px rgba(255, 72, 0, 0.4))
      `,
    maxWidth: "75%",
    display: "block",
  }}
/>



                  <p className="text-gray-300 max-w-md">
                    The premium clothing brand created for modern individuals who value style, comfort, and
                    sustainability.
                  </p>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                    <Button
                      onClick={handleStartCreating}
                      className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-black px-10 py-3 text-sm font-medium text-white border border-orange-500 transition-all duration-300 hover:bg-orange-500 hover:text-black"
                    >
                      <span className="relative z-10">Start Creating</span>
                      <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                      <span className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-r from-orange-600/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                    <Link href="/how-it-works">
                      <Button
                        variant="outline"
                        className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm sm:px-10 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </motion.section>
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center justify-center text-center lg:text-left p-10">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
                    New Collection
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Elevate Your Style with Timeless Essentials
                  </h1>
                  <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Discover our latest collection of sustainable, ethically-made clothing designed for comfort and
                    style.
                  </p>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button
                      onClick={() => {
                        toast({
                          title: "Shop Now",
                          description: "Redirecting to collection page...",
                          duration: 3000,
                        })
                      }}
                      className="bg-orange-500 text-black hover:bg-orange-600 transition-all duration-300"
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Explore Collection",
                          description: "Redirecting to collection page...",
                          duration: 3000,
                        })
                      }}
                      variant="outline"
                      className="border-white hover:bg-gray-800"
                    >
                      Explore Collection
                    </Button>
                  </div>
                </div>
                <img
                  alt="Hero Image"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  height="550"
                  src="/time.jpeg?height=550&width=800"
                  width="800"
                />
              </div>
            </div>
          </section>
        </motion.section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center space-y-4">
              <div className="inline-block rounded-full bg-orange-500/20 border border-orange-500/40 px-4 py-1 text-sm text-orange-400 tracking-wide">
                Featured Categories
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-gray-100">Shop By Category</h2>
              <p className="max-w-2xl mx-auto text-gray-400 md:text-lg">
                Browse our curated collections designed for every occasion.
              </p>
            </div>

            {/* First Row: 3 Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {categories.slice(0, 3).map((cat) => (
                <div
                  key={cat.slug}
                  className="w-[280px] group relative overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
                >
                  <a href={`/collection/category/${cat.slug}`} className="block group">
                    <img
                      src={cat.image || "/placeholder.svg"}
                      alt={cat.title}
                      className="h-[280px] w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white tracking-wide uppercase">{cat.title}</h3>
                        {/* <Button
              onClick={() => router.push(`/category/${cat.slug}`)}
              variant="link"
              className="p-0 text-white hover:underline inline-flex items-center"
            >
              Shop Now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button> */}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            {/* Second Row: 2 Cards Centered */}
            <div className="flex justify-center gap-6 mt-10 flex-wrap">
              {categories.slice(3, 5).map((cat) => (
                <div
                  key={cat.slug}
                  className="w-[280px] group relative overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
                >
                  <a href={`/collection/category/${cat.slug}`} className="block group">
                    <img
                      src={cat.image || "/placeholder.svg"}
                      alt={cat.title}
                      className="h-[280px] w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white tracking-wide uppercase">{cat.title}</h3>
                        {/* <Button
              onClick={() => router.push(`/category/${cat.slug}`)}
              variant="link"
              className="p-0 text-white hover:underline inline-flex items-center"
            >
              Shop Now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button> */}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
                  Our Story
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Crafted with Care, Designed for Life
                </h2>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Founded in 2020, DXRKICE was born from a passion for sustainable fashion and timeless design. We
                  believe in creating clothing that not only looks good but feels good to wear and is good for the
                  planet.
                </p>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Every piece in our collection is ethically made using sustainable materials and production methods,
                  ensuring that your wardrobe can be both stylish and responsible.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    onClick={() => {
                      toast({
                        title: "Learn More",
                        description: "Redirecting to about page...",
                        duration: 3000,
                      })
                    }}
                    variant="outline"
                    className="border-white hover:bg-gray-800"
                  >
                    Learn More About Us
                  </Button>
                </div>
              </div>
              <img
                alt="Brand Story"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                height="550"
                src="/Darkwear.jpg?height=550&width=550"
                style={{ objectPosition: 'center 0px' }}
                width="550"
              />
            </div>
          </div>
        </section>
        <section
          id="NewArrival"
          className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800 scroll-mt-[-100px]"
        >
          <div className="container mx-auto px-4 md:px-6">
            <NewArrivalsCarousel />
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => {
                  toast({
                    title: "View All Products",
                    description: "Redirecting to products page...",
                    duration: 3000,
                  })
                }}
                className="bg-orange-500 text-black hover:bg-orange-600 transition-all duration-300"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-sm text-orange-400">
                  Stay Connected
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Join Our Community</h2>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Subscribe to our newsletter for exclusive offers, style tips, and first access to new collections.
                </p>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-900 border-orange-900/50 focus:border-orange-500 text-white form-input-highlight"
                  />
                  <Button
                    onClick={() => {
                      toast({
                        title: "Subscribed!",
                        description: "You've been added to our newsletter.",
                        duration: 3000,
                      })
                    }}
                    type="submit"
                    className="bg-orange-500 text-black hover:bg-orange-600 transition-all duration-300"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img
                  alt="Community Image 1"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center"
                  height="250"
                  src="/community2.jpeg?height=250&width=250"
                  width="250"
                />
                <img
                  alt="Community Image 2"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center"
                  height="250"
                  src="/community1.jpeg?height=250&width=250"
                  width="250"
                />
                <img
                  alt="Community Image 3"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center"
                  height="250"
                  src="/community3.jpeg?height=250&width=250"
                  width="250"
                />
                <img
                  alt="Community Image 4"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center"
                  height="250"
                  src="/community4.jpeg?height=250&width=250"
                  width="250"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
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
