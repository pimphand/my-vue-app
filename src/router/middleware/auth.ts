import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const authMiddleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isLoggedIn

  // Routes that require authentication
  const requiresAuth = !to.meta.public

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && isAuthenticated) {
    // Redirect to dashboard if trying to access login while authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
} 