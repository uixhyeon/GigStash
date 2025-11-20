import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    // 관리자 페이지들 (사이드바 레이아웃 적용)
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: '대시보드' }
        },
        {
          path: 'event-management',
          name: 'event-management',
          component: () => import('../views/EventManagementView.vue'),
          meta: { title: '행사관리' }
        },
        {
          path: 'reservations',
          name: 'reservations',
          component: () => import('../views/ReservationManagementView.vue'),
          meta: { title: '예약관리' }
        },
        {
          path: 'monitoring',
          name: 'monitoring',
          component: () => import('../views/MonitoringView.vue'),
          meta: { title: '모니터링' }
        },
        {
          path: 'demo',
          name: 'demo',
          component: () => import('../views/ComponentDemo.vue')
        },
        {
          path: 'icon-demo',
          name: 'icon-demo',
          component: () => import('../views/IconDemo.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
