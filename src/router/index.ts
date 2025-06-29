import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import { authMiddleware } from './middleware/auth'
import AbsensiView from '@/views/absen/AbsensiView.vue'
import ProductView from '@/views/product/ProductView.vue'
import Brand from '@/views/product/brand/Brand.vue'
import OrderView from '@/views/order/OrderView.vue'
import OrderDetailView from '@/views/order/OrderDetailView.vue'
import CategoryView from '@/views/product/category/CategoryView.vue'


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
    },
    //product
    {
      path: '/products',
      name: 'products',
      component: ProductView,
      meta: { public: false }
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/views/product/ProductDetailView.vue'),
      meta: { public: false }
    },
    {
      path: '/products/create',
      name: 'product-create',
      component: () => import('@/views/product/ProductCreateView.vue'),
      meta: { public: false }
    },
    {
      path:'/categories',
      name: 'categories',
      component: CategoryView,
      meta: { public: false }
    },
    {
      path:'/brands',
      name: 'brands',
      component: Brand,
      meta: { public: false }
    }, {
      path: '/orders',
      name: 'orders',
      component: OrderView,
      meta: { public: false }
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: OrderDetailView,
      meta: { public: false }
    }
  ]
})

// Apply middleware
router.beforeEach(authMiddleware)

export default router 