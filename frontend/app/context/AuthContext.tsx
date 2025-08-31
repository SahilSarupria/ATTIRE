"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@/types"
import { http } from "@/lib/http";
import { authService, type AuthResponse, type LoginData, type RegisterData } from "@/lib/api-auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Cache profile data for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  const isAuthenticated = !!user
  // Safe admin check - ensure user exists and has admin properties
  const isAdmin = user ? user.is_staff === true || user.role === "admin" : false

  // Debounced token refresh to prevent multiple simultaneous calls
  const refreshTokenWithDebounce = useCallback(
    debounce(async () => {
      try {
        await authService.refreshToken()
      } catch (error) {
        console.error("Token refresh failed:", error)
        setUser(null)
        throw error
      }
    }, 1000),
    [],
  )

  // Fetch user profile with caching
  const fetchProfile = useCallback(
    async (force = false) => {
      const now = Date.now()

      // Use cache if data is fresh and not forced
      if (!force && user && now - lastFetch < CACHE_DURATION) {
        return user
      }

      try {
        const userData = await authService.getProfile()
        console.log("Fetched user data:", userData) // Debug log
        setUser(userData)
        setLastFetch(now)
        return userData
      } catch (error) {
        console.error("Profile fetch failed:", error)
        setUser(null)
        throw error
      }
    },
    [user, lastFetch],
  )

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const loginData: LoginData = { email, password }
      const response: AuthResponse = await authService.login(loginData)
      setUser(response.user)
      setLastFetch(Date.now())
      // no localStorage set - using cookies only
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async ({ email, password, password_confirm }: RegisterData) => {
  setIsLoading(true)
  try {
    const registerData: RegisterData = { email, password, password_confirm }
    const response: AuthResponse = await authService.register(registerData)
    setUser(response.user)
    setLastFetch(Date.now())
  } catch (error) {
    console.error("Registration failed:", error)
    throw error
  } finally {
    setIsLoading(false)
  }
}, [])


  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      setUser(null)
      setLastFetch(0)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    await fetchProfile(true)
  }, [fetchProfile])

  const checkAuth = useCallback(async () => {
    if (isLoading) return

    try {
      await fetchProfile()
    } catch (error) {
      // Silently fail - user is not authenticated
    }
  }, [fetchProfile, isLoading])

  // Initial auth check
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        await fetchProfile()
      } catch (error) {
        // User is not authenticated
        console.log("User not authenticated on init")
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Periodic token refresh (every 14 minutes)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(
      async () => {
        try {
          await refreshTokenWithDebounce()
        } catch (error) {
          console.error("Periodic token refresh failed:", error)
        }
      },
      14 * 60 * 1000,
    ) // 14 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshTokenWithDebounce])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshUser,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null

  return ((...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }) as T
}
