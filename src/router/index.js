import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import WorkerLayout from '../layouts/workerLayout.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 로그인 페이지
    {
      path: '/',
      name: 'login',
      component: () => import('../pages/auth/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    // 관리자 페이지  (사이드바 레이아웃 적용)
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'adminMain',
          name: 'adminMain',
          component: () => import('../pages/admin/AdminMain.vue'),
          meta: { title: '대시보드', role: 'admin' },
        },
        {
          path: 'event-management',
          name: 'adminEventManagement',
          component: () => import('../pages/admin/EventView.vue'),
          meta: { title: '행사관리', role: 'admin' },
        },
        {
          path: 'reservations',
          name: 'adminReservations',
          component: () => import('../pages/admin/ReservationView.vue'),
          meta: { title: '예약관리', role: 'admin' },
        },
        {
          path: 'monitoring',
          name: 'adminMonitoring',
          component: () => import('../pages/admin/MonitoringView.vue'),
          meta: { title: '모니터링', role: 'admin' },
        },
        {
          path: 'demo',
          name: 'adminComponentDemo',
          component: () => import('../pages/admin/ComponentDemo.vue'),
          meta: { title: '설정', role: 'admin' },
        },
      ],
    },

    // 기사 페이지 ===================================
    {
      path: '/worker/workerMain',
      component: () => import('../layouts/workerLayout.vue'),
      children: [
        {
          path: '',
          name: 'WorkerWork',
          component: () => import('../pages/worker/WorkerMain.vue'),
        },
        {
          path: 'calendar',
          name: 'WorkerCalendar',
          component: () => import('../pages/worker/Calendar.vue'),
        },
        {
          path: 'edit-profile',
          name: 'WorkerEditProfile',
          component: () => import('../pages/worker/EditProfile.vue'),
        },
        {
          path: 'salary-detail',
          name: 'WorkerSalaryDetail',
          component: () => import('../pages/worker/SalaryDetail.vue'),
        },
        {
          path: 'settings',
          name: 'WorkerSettings',
          component: () => import('../pages/worker/WorkerSettings.vue'),
        },
        {
          path: 'remain-customer',
          name: 'WorkerRemainCustomer',
          component: () => import('../pages/worker/RemainCustomer.vue'),
        },
        {
          path: 'qr-code',
          name: 'WorkerQrCode',
          component: () => import('../pages/worker/QrCode.vue'),
        },
      ],
    },
    // 404 처리 =============================
    {
      path: '/:pathMatch(.*)*', //모든 정의되지 않은 경로 캐치
      redirect: () => {
        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
          return '/'
        }
        return authStore.userRole === 'admin' ? '/admin/adminMain' : '/worker/workerMain'
      },
    },
  ],
})

//  인증 및 역할 검증
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  // 인증이 필요한 페이지인 경우
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
    return
  }

  // 역할 기반 접근 제어
  if (to.meta.role && userRole !== to.meta.role) {
    // 권한이 없으면 홈으로 리다이렉트
    next('/')
    return
  }

  // 로그인 페이지 접근 시 (이미 로그인한 경우)
  if (to.path === '/' && isAuthenticated) {
    // 역할에 따라 다른 페이지로 리다이렉트
    if (userRole === 'admin') {
      next('/admin/adminMain')
    } else if (userRole === 'worker') {
      next('/worker/workerMain')
    } else {
      next('/')
    }
    return
  }

  next()
})

export default router
