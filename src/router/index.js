import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    // 관리자 페이지들 (사이드바 레이아웃 적용)
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: 'lockers',
          name: 'lockers',
          component: () => import('../views/DashboardView.vue') // 임시로 Dashboard 사용
        },
        {
          path: 'reservations',
          name: 'reservations',
          component: () => import('../views/DashboardView.vue') // 임시로 Dashboard 사용
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('../views/DashboardView.vue') // 임시로 Dashboard 사용
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('../views/DashboardView.vue') // 임시로 Dashboard 사용
        },
        {
          path: 'demo',
          name: 'demo',
          component: () => import('../views/ComponentDemo.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/AboutView.vue') // 임시로 About 사용
        },
        {
          path: 'icon-demo',
          name: 'icon-demo',
          component: () => import('../views/IconDemo.vue')
        }
      ]
    }
  ]
})

export default router
