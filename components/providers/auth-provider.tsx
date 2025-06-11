"use client"

import type React from "react"
import { createContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/db/schema"
import { API_ENDPOINTS, ROUTES } from "@/lib/constants"
import { isValidEmail } from "@/lib/utils"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    position: "overall-coordinator" | "head-coordinator" | "core-coordinator" | "executive" | "members",
  ) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  isLoading: boolean
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const isAuthenticated = !!user

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
          } catch (error) {
            console.error("Failed to parse stored user:", error)
            localStorage.removeItem("user")
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  // Route protection
  useEffect(() => {
    if (!isInitialized) return

    const publicRoutes = [ROUTES.home, ROUTES.login, ROUTES.register, ROUTES.projects, ROUTES.team]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    if (!user && !isPublicRoute) {
      router.push(ROUTES.login)
    } else if (user && [ROUTES.login, ROUTES.register].includes(pathname as "/login" || "/register")) {
      router.push(ROUTES.dashboard)
    }
  }, [user, pathname, isInitialized, router])

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address")
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      try {
        setIsLoading(true)

        const response = await fetch(API_ENDPOINTS.auth.login, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = "Login failed"

          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch {
            // If response is not JSON, use the text as error message
            errorMessage = errorText.includes("<!DOCTYPE") ? "Server error - please try again" : errorText
          }

          throw new Error(errorMessage)
        }

        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))

        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${data.user.name}`,
        })

        router.push(ROUTES.dashboard)
      } catch (error) {
        console.error("Login error:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router, toast],
  )

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      position: "overall-coordinator" | "head-coordinator" | "core-coordinator" | "executive" | "members",
    ) => {
      if (!name || name.length < 2) {
        throw new Error("Name must be at least 2 characters long")
      }

      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address")
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      try {
        setIsLoading(true)

        const response = await fetch(API_ENDPOINTS.auth.register, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, position }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Registration failed" }))
          throw new Error(errorData.error || "Registration failed")
        }

        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))

        toast({
          title: "Welcome to RobotiX!",
          description: `Account created successfully for ${name}`,
        })

        router.push(ROUTES.dashboard)
      } catch (error) {
        console.error("Registration error:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router, toast],
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("user")
    router.push(ROUTES.home)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }, [router, toast])

  const updateUser = useCallback(async (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        console.error("Failed to update user on server")
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }, [])

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    isAuthenticated,
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
