"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"

export function useAdminGuard() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Mark that we've completed the initial check
    if (!hasChecked) {
      setHasChecked(true)
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      router.push("/login?redirect=/admin")
      return
    }

    // If authenticated but not admin, redirect to unauthorized
    if (isAuthenticated && !isAdmin) {
      console.log("Authenticated but not admin, redirecting to unauthorized")
      router.push("/unauthorized")
      return
    }

    // If admin, allow access
    if (isAuthenticated && isAdmin) {
      console.log("Admin access granted")
    }
  }, [isLoading, isAuthenticated, isAdmin, router, hasChecked])

  return {
    isAdmin: isAdmin && hasChecked,
    isLoading: isLoading || !hasChecked,
    user,
  }
}
