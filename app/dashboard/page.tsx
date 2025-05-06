"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import MainPage from "@/components/main-page"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/")
    }
  }, [router])

  return <MainPage />
}
