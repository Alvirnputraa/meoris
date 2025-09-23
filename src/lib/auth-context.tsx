"use client";
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, AuthUser } from './auth'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage synchronously to avoid first-render null
  const [user, setUser] = useState<AuthUser | null>(() => auth.getCurrentUser())
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const loggedInUser = await auth.login(email, password)
      setUser(loggedInUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await auth.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
