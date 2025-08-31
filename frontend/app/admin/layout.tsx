"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Package, Settings, Menu, X, Home, LogOut, ShoppingCart, Users, BarChart3, Factory, Bell } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  //const { isAdmin, isLoading } = useAdminGuard()

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Manufacturing",
      href: "/admin/manufacturing",
      icon: Factory,
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      router.push("/login")
    }
  }

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen bg-black text-white">
  //       <div className="flex flex-col items-center gap-4">
  //         <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
  //         <p className="text-gray-400">Verifying admin access...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!isAdmin) {
  //   return null // useAdminGuard will redirect to unauthorized
  // }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="border-gray-700">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="text-xl font-bold text-orange-500 october-crow"
              style={{
                fontFamily: "'October Crow', cursive",
                letterSpacing: "0.2em",
              }}
            >
              DXRKICE
            </span>
            <span className="text-xs bg-orange-500 text-black px-2 py-0.5 rounded">Admin</span>
          </Link>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin" // only exact match
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-orange-500/10 text-orange-500" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Separator className="my-4 bg-gray-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">{user?.email || "Fetching..."}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        {children}
      </div>
    </div>
  )
}
