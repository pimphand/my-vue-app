import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import { authMiddleware } from './middleware/auth'
import AbsensiView from '@/views/absen/AbsensiView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
   //auth
   {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true }
    },
    {
      path: '/',
      name: 'home',
      component: DashboardView,
      meta: { public: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { public: false }
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { public: false }
    },
    //absensi
    {
      path: '/absensi',
      name: 'absensi',
      component: AbsensiView,
      meta: { public: false }
    }
  ]
})

// Apply middleware
router.beforeEach(authMiddleware)

export default router 