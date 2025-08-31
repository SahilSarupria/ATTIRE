export interface AuthResponse {
  user: any
  message?: string
}

export interface LoginData {
  email: string
  password: string
}

export type RegisterData = {
  email: string
  password: string
  password_confirm: string
}


class AuthService {
  // Make authenticated requests with automatic retry
  async authenticatedFetch(url: string, options: RequestInit = {}) {
    const defaultOptions: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    let response = await fetch(url, defaultOptions)

    // If unauthorized, try to refresh token once
    if (response.status === 401) {
      try {
        await this.refreshToken()
        response = await fetch(url, defaultOptions)
      } catch (error) {
        throw new Error("Authentication failed")
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed: ${response.status} - ${errorText}`)
    }

    return response
  }

  async login(userData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Login failed")
      }

      const data = await response.json()

      // If the response doesn't include user data, fetch it separately
      if (!data.user) {
        const userProfile = await this.getProfile()
        return {
          user: userProfile,
          message: data.message || "Login successful",
        }
      }

      return data
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || "Registration failed")
      }

      const data = await response.json()

      // If the response doesn't include user data, fetch it separately
      if (!data.user) {
        const userProfile = await this.getProfile()
        return {
          user: userProfile,
          message: data.message || "Registration successful",
        }
      }

      return data
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  async refreshToken(): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }
  }

  async getProfile(): Promise<any> {
    const response = await this.authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`)
    return response.json()
  }

  async logout(): Promise<void> {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`, {
      method: "POST",
      credentials: "include",
    })
  }
}

export const authService = new AuthService()
