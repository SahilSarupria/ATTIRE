// This is a simplified auth utility for demo purposes
// In a real application, you would use a proper authentication library

// User type
export type User = {
  id?: string
  email: string
  name: string
  isLoggedIn: boolean
  avatar?: string
  phone?: string
  address?: string
  bio?: string
}

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, you would validate credentials against a backend
  // For demo, we'll just create a user object
  const user: User = {
    id: Math.random().toString(36).substring(2, 9),
    email,
    name: email.split("@")[0],
    isLoggedIn: true,
  }

  // Store in localStorage
  localStorage.setItem("user", JSON.stringify(user))

  return user
}

// Signup function
export const signup = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, you would create a user in your backend
  // For demo, we'll just create a user object
  const user: User = {
    id: Math.random().toString(36).substring(2, 9),
    email,
    name: email.split("@")[0],
    isLoggedIn: true,
  }

  // Store in localStorage
  localStorage.setItem("user", JSON.stringify(user))

  return user
}

// Logout function
export const logout = (): void => {
  localStorage.removeItem("user")
}

// Get current user
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem("user")
  if (userData) {
    return JSON.parse(userData)
  }
  return null
}

// Update user profile
export const updateUserProfile = (userData: Partial<User>): User => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("No user logged in")
  }

  const updatedUser = { ...currentUser, ...userData }
  localStorage.setItem("user", JSON.stringify(updatedUser))

  return updatedUser
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser()
  return !!user && user.isLoggedIn
}
