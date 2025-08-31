"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Calendar,
  ImageIcon,
  Sparkles,
  ChevronRight,
  Loader2,
  Download,
  Share2,
  Eye,
  Clock,
  Palette,
  Star,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/Header"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "@/types"

interface DesignSession {
  session_id: string
  prompt: string
  generated_image_url: string
  reference_image_url?: string
  detected_keywords: string[]
  created_at: string
  is_favorite: boolean
  outfit_elements_count: number
}

type UserType = {
  email: string
  name: string
  isLoggedIn: boolean
}

export default function PromptHistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<DesignSession[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set())

  // Authentication function
  const fetchUserProfile = async () => {
    setIsAuthLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const userData: User = await response.json()

      const formattedUser: UserType = {
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username || "No Name",
        isLoggedIn: true,
      }

      setUser(formattedUser)
    } catch (error) {
      console.error("Authentication error:", error)
      setUser(null)
      router.push("/login?redirect=/prompt-history")
    } finally {
      setIsAuthLoading(false)
    }
  }

  const fetchPromptHistory = async (pageNum = 1) => {
    if (isAuthLoading || !user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/prompt-history/?page=${pageNum}&limit=20`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401 || response.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your prompt history.",
          variant: "destructive",
        })
        router.push("/login?redirect=/prompt-history")
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch prompt history")
      }

      if (pageNum === 1) {
        setSessions(data.sessions)
      } else {
        setSessions((prev) => [...prev, ...data.sessions])
      }

      setHasNext(data.has_next)
      setPage(pageNum)
    } catch (error) {
      console.error("Error fetching prompt history:", error)
      toast({
        title: "Load Failed",
        description: "Could not load your prompt history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDesignSession = (sessionId: string) => {
    router.push(`/create?session=${sessionId}`)
  }

  const toggleFavorite = async (sessionId: string) => {
    if (isAuthLoading || !user) return

    setFavoriteLoading((prev) => new Set(prev).add(sessionId))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/toggle-favorite/${sessionId}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401 || response.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Please log in to update favorites.",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle favorite")
      }

      setSessions((prev) =>
        prev.map((session) =>
          session.session_id === sessionId ? { ...session, is_favorite: !session.is_favorite } : session,
        ),
      )

      toast({
        title: data.is_favorite ? "Added to Favorites" : "Removed from Favorites",
        description: "Your preference has been updated.",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Update Failed",
        description: "Could not update favorite status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFavoriteLoading((prev) => {
        const newSet = new Set(prev)
        newSet.delete(sessionId)
        return newSet
      })
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchPromptHistory()
    }
  }, [user, isAuthLoading])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Header />
        <br />
        <br />
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Header />
        <br />
        <br />
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">Please log in to view your prompt history.</p>
                <Button onClick={() => router.push("/login?redirect=/prompt-history")} className="w-full">
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Header />
      <br />
      <br />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Design History
            </h1>
            <p className="text-muted-foreground mt-2">View and recreate your previous design sessions</p>
            <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.name}! ✨</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Designs</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Favorites</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{sessions.filter((s) => s.is_favorite).length}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">With Reference</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {sessions.filter((s) => s.reference_image_url).length}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {
                  sessions.filter((s) => {
                    const oneWeekAgo = new Date()
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                    return new Date(s.created_at) > oneWeekAgo
                  }).length
                }
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4"
                >
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">No Design History</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any designs yet. Start creating to see your history here.
                </p>
                <Button onClick={() => router.push("/create")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Your First Design
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {sessions.map((session, index) => (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setHoveredCard(session.session_id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <motion.img
                          src={session.generated_image_url || "/placeholder.svg"}
                          alt="Generated design"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          whileHover={{ scale: 1.05 }}
                        />

                        {/* Overlay on hover */}
                        <AnimatePresence>
                          {hoveredCard === session.session_id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
                            >
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => loadDesignSession(session.session_id)}
                                className="backdrop-blur-sm"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                                <Download className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Favorite button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(session.session_id)}
                          disabled={favoriteLoading.has(session.session_id)}
                          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all ${
                            session.is_favorite
                              ? "bg-red-500/20 text-red-500"
                              : "bg-black/20 text-white hover:bg-red-500/20 hover:text-red-500"
                          }`}
                        >
                          {favoriteLoading.has(session.session_id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className={`h-4 w-4 ${session.is_favorite ? "fill-current" : ""}`} />
                          )}
                        </motion.button>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {session.reference_image_url && (
                            <Badge variant="secondary" className="backdrop-blur-sm text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Ref
                            </Badge>
                          )}
                          {session.outfit_elements_count > 0 && (
                            <Badge variant="secondary" className="backdrop-blur-sm text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {session.outfit_elements_count}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <p className="text-xs font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {session.prompt}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getRelativeTime(session.created_at)}
                          </div>
                        </div>

                        {session.detected_keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {session.detected_keywords.slice(0, 2).map((keyword) => (
                              <Badge
                                key={keyword}
                                variant="outline"
                                className="text-xs hover:bg-primary/10 transition-colors"
                              >
                                {keyword}
                              </Badge>
                            ))}
                            {session.detected_keywords.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{session.detected_keywords.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="w-full text-xs py-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                            variant="outline"
                            size="sm"
                            onClick={() => loadDesignSession(session.session_id)}
                          >
                            Recreate
                            <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {hasNext && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchPromptHistory(page + 1)}
                  className="hover:scale-105 transition-transform"
                >
                  Load More Designs
                </Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
