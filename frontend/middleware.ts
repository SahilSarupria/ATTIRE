import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    try {
      // Check authentication by calling the profile endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`, {
        headers: {
          // Forward all cookies from the request
          Cookie: request.headers.get("cookie") || "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // If not authenticated, redirect to login
        console.log("Middleware: Not authenticated, redirecting to login")
        return NextResponse.redirect(new URL("/login?redirect=/admin", request.url))
      }

      const userData = await response.json()
      console.log("Middleware: User data:", userData)

      // Check if user is admin - be more flexible with the check
      const isAdmin = userData.is_staff === true || userData.role === "admin"

      if (!isAdmin) {
        console.log("Middleware: Not admin, redirecting to unauthorized")
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }

      console.log("Middleware: Admin access granted")
      // Allow access if admin
      return NextResponse.next()
    } catch (error) {
      console.error("Admin middleware error:", error)
      return NextResponse.redirect(new URL("/login?redirect=/admin", request.url))
    }
  }

  // Continue for non-admin routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
