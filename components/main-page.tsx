"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ChevronRight,
  Instagram,
  LogOut,
  Mail,
  MapPin,
  ShoppingBag,
  Twitter,
  User,
} from "lucide-react"

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

// Define user type
type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

export default function MainPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [scrollY, setScrollY] = useState(0)
  const [headerVisible, setHeaderVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const scrollThreshold = 50
  const [titleTransition, setTitleTransition] = useState(0)
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      // Redirect to login if no user data found
      router.push("/")
    }
  }, [router])

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

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const navigateToProfile = () => {
    router.push("/profile")
  }

  const handleStartCreating = () => {
    router.push("/create")
  }

  // Calculate hero section opacity and transform based on scroll position
  const heroOpacity = Math.max(0, 1 - scrollY / 500)
  const heroTransform = `translateY(${scrollY * 0.3}px)`

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 transition-all duration-500 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold transition-opacity duration-500 pl-10"
            style={{ opacity: titleTransition }}
          >
            ATTIRE
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              New Arrivals
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Women
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Men
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Accessories
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
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
            <Button size="icon" variant="ghost">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
            </Button>
            <Button className="md:hidden" size="icon" variant="ghost">
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
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-16">
        <section
          ref={heroSectionRef}
          className="relative w-full h-[calc(100vh-64px)]"
          style={{
            opacity: heroOpacity,
            transform: heroTransform,
            visibility: heroOpacity <= 0.05 ? "hidden" : "visible",
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="absolute inset-0 bg-black">
            <video ref={videoRef} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-70">
              <source src="/placeholder-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1
  className="text-6xl md:text-8xl font-bold mb-8 transition-all duration-500"
  style={{
    opacity: 1 - titleTransition,
    transform: `scale(${1 - titleTransition * 0.3}) translateY(${titleTransition * -20}px)`,
    color: 'white', // Text color
    textShadow: '0 0 4px white, 0 0 10px white, 0 0 500000px white' // White border effect
  }}
>
  ATTIRE
</h1>
<div className="flex flex-col gap-2 min-[400px]:flex-row">

            <Button
  onClick={handleStartCreating}
  className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white px-10 py-3 text-sm font-medium text-black transition-all duration-300 hover:bg-black hover:text-white"
>
  <span className="relative z-10">Start Creating</span>
  <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
{/* 
  <span className="absolute inset-0 pointer-events-none z-0">
 
    <span className="absolute top-0 left-0 h-[2px] w-full overflow-hidden">
      <span className="block h-full w-full bg-white shadow-[0_0_15px_5px_rgba(34,211,238,0.7)] group-hover:animate-[traceTop_4s_linear_infinite]"></span>
    </span>

    <span className="absolute top-0 right-0 h-full w-[2px] overflow-hidden">
      <span className="block h-full w-full bg-white shadow-[0_0_15px_5px_rgba(34,211,238,0.7)] group-hover:animate-[traceRight_4s_linear_infinite]"></span>
    </span>

    <span className="absolute bottom-0 right-0 h-[2px] w-full overflow-hidden">
      <span className="block h-full w-full bg-white shadow-[0_0_15px_5px_rgba(34,211,238,0.7)] group-hover:animate-[traceBottom_4s_linear_infinite]"></span>
    </span>

    <span className="absolute bottom-0 left-0 h-full w-[2px] overflow-hidden">
      <span className="block h-full w-full bg-white shadow-[0_0_15px_5px_rgba(34,211,238,0.7)] group-hover:animate-[traceLeft_4s_linear_infinite]"></span>
    </span>
  </span>
*/}
</Button>
<Link href="/how-it-works">
                    <Button
                      variant="outline"
                      className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                      Learn More
                    </Button>
                  </Link>
                  </div>
{/* Sequential glow animation for border tracing */}
<style jsx>{`
  @keyframes traceTop {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    40% {
      transform: translateX(100%);
      opacity: 1;
    }
    50%, 100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes traceRight {
    0%, 25% {
      transform: translateY(-100%);
      opacity: 0;
    }
    35% {
      opacity: 1;
    }
    65% {
      transform: translateY(100%);
      opacity: 1;
    }
    75%, 100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  @keyframes traceBottom {
    0%, 50% {
      transform: translateX(100%);
      opacity: 0;
    }
    60% {
      opacity: 1;
    }
    90% {
      transform: translateX(-100%);
      opacity: 1;
    }
    100% {
      transform: translateX(-100%);
      opacity: 0.5;
    }
  }

  @keyframes traceLeft {
    0%, 75% {
      transform: translateY(100%);
      opacity: 0;
    }
    85% {
      opacity: 1;
    }
    95%, 100% {
      transform: translateY(-100%);
      opacity: 0.5;
    }
  }

  /* Stagger the animation timing */
  span:nth-child(1) {
    animation-delay: 0s;
  }
  span:nth-child(2) {
    animation-delay: 1s; /* Delay the right border */
  }
  span:nth-child(3) {
    animation-delay: 2s; /* Delay the bottom border */
  }
  span:nth-child(4) {
    animation-delay: 3s; /* Delay the left border */
  }
`}</style>





          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm">New Collection</div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Elevate Your Style with Timeless Essentials
                </h1>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover our latest collection of sustainable, ethically-made clothing designed for comfort and style.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    onClick={() => {
                      toast({
                        title: "Shop Now",
                        description: "Redirecting to collection page...",
                      })
                    }}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Explore Collection",
                        description: "Redirecting to collection page...",
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm">Featured Categories</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Shop By Category</h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Browse our curated collections designed for every occasion
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-lg shadow-lg">
                <img
                  alt="Women's Collection"
                  className="h-[300px] w-full object-cover transition-transform group-hover:scale-105"
                  height="300"
                  src="/women.jpeg?height=300&width=400"
                  width="400"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div>
                    <h3 className="text-xl font-medium text-white">Women</h3>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Women's Collection",
                          description: "Redirecting to women's collection...",
                        })
                      }}
                      variant="link"
                      className="p-0 text-white"
                    >
                      Shop Now
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg shadow-lg">
                <img
                  alt="Men's Collection"
                  className="h-[300px] w-full object-cover transition-transform group-hover:scale-105"
                  height="300"
                  src="/men.jpeg?height=300&width=400"
                  width="400"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div>
                    <h3 className="text-xl font-medium text-white">Men</h3>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Men's Collection",
                          description: "Redirecting to men's collection...",
                        })
                      }}
                      variant="link"
                      className="p-0 text-white"
                    >
                      Shop Now
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg shadow-lg">
                <img
                  alt="Accessories Collection"
                  className="h-[300px] w-full object-cover transition-transform group-hover:scale-105"
                  height="300"
                  src="/accessories.jpeg?height=300&width=400"
                  width="400"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div>
                    <h3 className="text-xl font-medium text-white">Accessories</h3>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Accessories Collection",
                          description: "Redirecting to accessories collection...",
                        })
                      }}
                      variant="link"
                      className="p-0 text-white"
                    >
                      Shop Now
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm">Our Story</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Crafted with Care, Designed for Life
                </h2>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Founded in 2020, ATTIRE was born from a passion for sustainable fashion and timeless design. We
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
                src="/crafted.jpeg?height=550&width=550"
                width="550"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">New Arrivals</h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover our latest pieces, fresh off the design table
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="group relative overflow-hidden rounded-lg bg-gray-900 shadow-lg">
                  <img
                    alt={`Product ${item}`}
                    className="h-[300px] w-full object-cover transition-transform group-hover:scale-105"
                    height="300"
                    src={`/jjk-megumi-1.png?height=300&width=250&text=Product+${item}`}
                    width="250"
                  />
                  <div className="p-4">
                    <h3 className="font-medium">Essential Tee</h3>
                    <p className="text-sm text-gray-400">Organic Cotton</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-medium">$49.99</span>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Added to cart",
                            description: `Essential Tee added to your cart`,
                          })
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span className="sr-only">Add to cart</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  toast({
                    title: "View All Products",
                    description: "Redirecting to products page...",
                  })
                }}
                className="bg-white text-black hover:bg-gray-200"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black border-t border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm">Stay Connected</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Join Our Community</h2>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Subscribe to our newsletter for exclusive offers, style tips, and first access to new collections.
                </p>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-900 border-gray-700 text-white form-input-highlight"
                  />
                  <Button
                    onClick={() => {
                      toast({
                        title: "Subscribed!",
                        description: "You've been added to our newsletter.",
                      })
                    }}
                    type="submit"
                    className="bg-white text-black hover:bg-gray-200"
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
      <footer className="w-full border-t border-gray-800 bg-black py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">ATTIRE</h3>
              <p className="max-w-[250px] text-sm text-gray-400">
                Sustainable, ethical fashion for the modern individual.
              </p>
              <div className="flex space-x-4">
                <Button onClick={() => window.open("https://www.instagram.com/", "_blank")} size="icon" variant="ghost">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
                <Button onClick={() => window.open("https://twitter.com/", "_blank")} size="icon" variant="ghost">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Women
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Men
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
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
                  <span className="text-gray-400">hello@attire.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2023 ATTIRE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}