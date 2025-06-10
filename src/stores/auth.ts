import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

const API_URL = import.meta.env.VITE_API_URL

interface User {
  id: number
  name: string
  username: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token')
  }),

  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const response = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials)
        })

        if (!response.ok) {
          throw new Error('Login failed')
        }

        const data = await response.json()
        
        // Assuming the API returns a token and user data
        this.setToken(data.token)
        this.setUser(data.user)
        
        return data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
      this.isAuthenticated = true
    },

    async logout() {
      try {
        const response = await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Logout failed')
        }

        // Clear local state regardless of API response
        this.user = null
        this.token = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
        toast.success("Terima kasih!", {
          description: "Anda berhasil keluar dari akun Anda.",
        });
      } catch (error) {
        console.error('Logout error:', error)
        // Still clear local state even if API call fails
        this.user = null
        this.token = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
      }
    }
  },

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated
  }
}) 