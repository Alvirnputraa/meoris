import { supabase } from './supabase'
import { userDb } from './database'

export interface AuthUser {
  id: string
  email: string
  nama: string
}

export const auth = {
  // Login with email and password
  async login(email: string, password: string) {
    try {
      // First, verify credentials against our users table
      const user = await userDb.getByEmail(email)

      if (!user) {
        throw new Error('User not found')
      }

      if (user.password !== password) {
        throw new Error('Invalid password')
      }

      // Create session data (in a real app, you'd use proper session management)
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        nama: user.nama
      }

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(authUser))

      return authUser
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Logout
  async logout() {
    try {
      localStorage.removeItem('user')
      return true
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  // Get current user
  getCurrentUser(): AuthUser | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  }
}
