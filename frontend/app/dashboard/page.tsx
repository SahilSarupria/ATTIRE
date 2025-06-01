"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import MainPage from "@/components/main-page"

export default function DashboardPage() {
  const router = useRouter()
  return <MainPage />
}
