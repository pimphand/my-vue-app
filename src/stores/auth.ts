import { defineStore } from 'pinia'

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
        const response = await fetch('https://absensi.dmpt.my.id/api/login', {
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

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    }
  },

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated
  }
}) 