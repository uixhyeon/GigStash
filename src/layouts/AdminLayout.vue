<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
    <!-- 오버레이 (모바일용) -->
    <div
      v-if="isMobileMenuOpen"
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
    ></div>

    <!-- 사이드바 -->
    <aside
      :class="[
        'fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700',
        'flex flex-col transition-all duration-200 z-30 shadow-lg dark:shadow-slate-950/50',
        // 데스크톱: 접기/펼치기
        'lg:translate-x-0',
        isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
        // 모바일: 열기/닫기
        isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- 사이드바 헤더 -->
      <div class="p-6 border-b border-gray-200 dark:border-slate-700">
        <transition name="fade" mode="out-in">
          <h2
            v-if="!isSidebarCollapsed"
            key="full"
            class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent text-center whitespace-nowrap"
          >
            🧊 ChillBox
          </h2>
          <h2 v-else key="icon" class="text-2xl text-center">🧊</h2>
        </transition>
      </div>

      <!-- 네비게이션 -->
      <nav class="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-xl',
            'text-gray-700 dark:text-slate-300 font-medium transition-all duration-200 whitespace-nowrap',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600',
            'hover:text-blue-600 dark:hover:text-cyan-400 hover:shadow-md',
            isSidebarCollapsed ? 'justify-center px-3' : ''
          ]"
          active-class="!bg-gradient-to-r !from-blue-600 !to-cyan-500 dark:!from-cyan-500 dark:!to-blue-600 !text-white !shadow-lg !shadow-blue-500/50 dark:!shadow-cyan-500/30"
        >
          <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="flex-1">{{ item.label }}</span>
          </transition>
        </RouterLink>

        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent mx-6 my-4"></div>

        <RouterLink
          v-for="item in secondaryMenuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-xl',
            'text-gray-700 dark:text-slate-300 font-medium transition-all duration-200 whitespace-nowrap',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600',
            'hover:text-blue-600 dark:hover:text-cyan-400 hover:shadow-md',
            isSidebarCollapsed ? 'justify-center px-3' : ''
          ]"
          active-class="!bg-gradient-to-r !from-blue-600 !to-cyan-500 dark:!from-cyan-500 dark:!to-blue-600 !text-white !shadow-lg !shadow-blue-500/50 dark:!shadow-cyan-500/30"
        >
          <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="flex-1">{{ item.label }}</span>
          </transition>
        </RouterLink>
      </nav>

      <!-- 사이드바 푸터 -->
      <div class="p-4 border-t border-gray-200 dark:border-slate-700">
        <button
          @click="toggleSidebar"
          :title="collapseButtonTitle"
          class="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl text-gray-700 dark:text-slate-200 text-lg font-semibold transition-all duration-200 hover:from-blue-600 hover:to-cyan-500 dark:hover:from-cyan-500 dark:hover:to-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-cyan-500/30"
        >
          <span v-if="!isSidebarCollapsed">◀</span>
          <span v-else>▶</span>
        </button>
      </div>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <div
      :class="[
        'flex-1 flex flex-col transition-all duration-200',
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      ]"
    >
      <!-- 상단 헤더 -->
      <header
        class="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 px-8 py-4 shadow-sm"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <button
              @click="toggleSidebar"
              class="lg:hidden p-2 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              {{ pageTitle }}
            </h1>
          </div>

          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <div
              class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-full cursor-pointer transition-all duration-200 hover:from-blue-600 hover:to-cyan-500 dark:hover:from-cyan-500 dark:hover:to-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-cyan-500/30 group"
            >
              <span class="text-xl">👤</span>
              <span class="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-white">
                관리자
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- 페이지 콘텐츠 -->
      <main class="flex-1 p-8 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- API 디버그 패널 -->
    <ApiDebugPanel />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'
import ApiDebugPanel from '@/components/dev/ApiDebugPanel.vue'

const route = useRoute()
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

const menuItems = [
  { path: '/dashboard', icon: '📊', label: '대시보드' },
  { path: '/lockers', icon: '🔒', label: '사물함 관리' },
  { path: '/reservations', icon: '📅', label: '예약 관리' },
  { path: '/customers', icon: '👥', label: '고객 관리' },
  { path: '/statistics', icon: '📈', label: '통계 분석' }
]

const secondaryMenuItems = [
  { path: '/demo', icon: '🎨', label: '컴포넌트' },
  { path: '/icon-demo', icon: '✨', label: '3D 아이콘' },
  { path: '/settings', icon: '⚙️', label: '설정' }
]

const toggleSidebar = () => {
  // 화면 크기 체크
  const isLargeScreen = window.innerWidth >= 1024

  if (isLargeScreen) {
    // 데스크톱: 접기/펼치기
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value)
  } else {
    // 모바일: 열기/닫기
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const collapseButtonTitle = computed(() =>
  isSidebarCollapsed.value ? '사이드바 펼치기' : '사이드바 접기'
)

const pageTitle = computed(() => {
  const titles = {
    dashboard: '대시보드',
    lockers: '사물함 관리',
    reservations: '예약 관리',
    customers: '고객 관리',
    statistics: '통계 분석',
    demo: '컴포넌트 데모',
    'icon-demo': '3D 아이콘',
    settings: '설정'
  }
  return titles[route.name] || 'ChillBox'
})

// 초기화: localStorage에서 사이드바 상태 복원
const initSidebar = () => {
  const saved = localStorage.getItem('sidebarCollapsed')
  if (saved !== null) {
    isSidebarCollapsed.value = saved === 'true'
  }
}

initSidebar()
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dark .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>