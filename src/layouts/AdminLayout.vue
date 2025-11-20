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
        isSidebarCollapsed ? 'lg:w-16' : 'lg:w-56',
        // 모바일: 열기/닫기
        isMobileMenuOpen ? 'translate-x-0 w-56' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- 사이드바 헤더 -->
      <div class="h-16 px-4 flex items-center border-b border-gray-200 dark:border-slate-700">
        <transition name="fade" mode="out-in">
          <h2
            v-if="!isSidebarCollapsed"
            key="full"
            class="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent text-center whitespace-nowrap"
          >
            🧊 ChillBox
          </h2>
          <h2 v-else key="icon" class="text-xl text-center w-full">🧊</h2>
        </transition>
      </div>

      <!-- 네비게이션 -->
      <nav class="flex-1 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg',
            'text-gray-700 dark:text-slate-300 font-medium transition-all duration-200 whitespace-nowrap',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600',
            'hover:text-blue-600 dark:hover:text-cyan-400 hover:shadow-md',
            isSidebarCollapsed ? 'justify-center px-2' : ''
          ]"
          active-class="!bg-gradient-to-r !from-blue-600 !to-cyan-500 dark:!from-cyan-500 dark:!to-blue-600 !text-white !shadow-lg !shadow-blue-500/50 dark:!shadow-cyan-500/30"
        >
          <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="flex-1">{{ item.label }}</span>
          </transition>
        </RouterLink>

        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent mx-3 my-2"></div>

        <RouterLink
          v-for="item in secondaryMenuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg',
            'text-gray-700 dark:text-slate-300 font-medium transition-all duration-200 whitespace-nowrap',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600',
            'hover:text-blue-600 dark:hover:text-cyan-400 hover:shadow-md',
            isSidebarCollapsed ? 'justify-center px-2' : ''
          ]"
          active-class="!bg-gradient-to-r !from-blue-600 !to-cyan-500 dark:!from-cyan-500 dark:!to-blue-600 !text-white !shadow-lg !shadow-blue-500/50 dark:!shadow-cyan-500/30"
        >
          <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="flex-1">{{ item.label }}</span>
          </transition>
        </RouterLink>
      </nav>

    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <div
      :class="[
        'flex-1 flex flex-col transition-all duration-200',
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
      ]"
    >
      <!-- 상단 헤더 -->
      <header
        class="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 px-6 h-16 flex items-center shadow-sm"
      >
        <div class="flex justify-between items-center w-full">
          <!-- 헤더 왼쪽: 접기/펼치기 버튼 + 로고 박스 + 페이지 타이틀 -->
          <div class="flex items-center gap-3">
            <!-- 데스크톱 사이드바 접기/펼치기 버튼 (제일 왼쪽) -->
            <button
              @click="toggleSidebar"
              :title="collapseButtonTitle"
              class="hidden lg:flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-lg text-gray-700 dark:text-slate-200 hover:from-blue-600 hover:to-cyan-500 dark:hover:from-cyan-500 dark:hover:to-blue-600 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <span class="text-lg font-bold">
                {{ isSidebarCollapsed ? '▶' : '◀' }}
              </span>
            </button>

            <!-- 로고 박스 (사이드바 펼쳐있을 때만 표시) -->
            <div
              v-if="!isSidebarCollapsed"
              class="hidden lg:flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-gray-200 dark:border-slate-600 transition-all duration-200"
            >
              <span class="text-2xl">🧊</span>
            </div>

            <!-- 모바일 메뉴 버튼 -->
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

            <!-- 페이지 타이틀 -->
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              {{ pageTitle }}
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <DarkModeToggle />

            <!-- 프로필 영역 -->
            <div class="relative">
              <button
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-full cursor-pointer transition-all duration-200 hover:from-blue-600 hover:to-cyan-500 dark:hover:from-cyan-500 dark:hover:to-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-cyan-500/30 group"
              >
                <span class="text-xl">👤</span>
                <span class="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-white">
                  {{ authStore.user?.name || '관리자' }}
                </span>
              </button>

              <!-- 프로필 드롭다운 메뉴 -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isProfileMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-950 border border-gray-200 dark:border-slate-700 py-2 z-50"
                >
                  <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ authStore.user?.name || '관리자' }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ authStore.user?.email || 'admin@example.com' }}
                    </p>
                  </div>
                </div>
              </transition>
            </div>

            <!-- 로그아웃 버튼 (제일 우측) -->
            <button
              @click="confirmLogout"
              class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 hover:shadow-lg hover:shadow-red-500/30"
              :title="'로그아웃'"
            >
              <span class="text-lg">🚪</span>
              <span class="text-sm">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 페이지 콘텐츠 -->
      <main class="flex-1 p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- API 디버그 패널 -->
    <ApiDebugPanel />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'
import ApiDebugPanel from '@/components/dev/ApiDebugPanel.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const isProfileMenuOpen = ref(false)

const menuItems = [
  { path: '/dashboard', icon: '📊', label: '대시보드' },
  { path: '/reservations', icon: '📅', label: '예약관리' },
  { path: '/event-management', icon: '🎯', label: '행사관리' },
  { path: '/monitoring', icon: '📡', label: '모니터링' }
]

const secondaryMenuItems = [
  { path: '/demo', icon: '🎨', label: '컴포넌트' },
  { path: '/icon-demo', icon: '✨', label: '3D 아이콘' }
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

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false
}

const collapseButtonTitle = computed(() =>
  isSidebarCollapsed.value ? '사이드바 펼치기' : '사이드바 접기'
)

const pageTitle = computed(() => {
  const titles = {
    dashboard: '대시보드',
    reservations: '예약관리',
    'event-management': '행사관리',
    monitoring: '모니터링',
    demo: '컴포넌트 데모',
    'icon-demo': '3D 아이콘'
  }
  return titles[route.name] || 'GigStash'
})

const confirmLogout = () => {
  const isConfirmed = window.confirm('정말 로그아웃하시겠습니까?')
  if (isConfirmed) {
    handleLogout()
  }
}

const handleLogout = () => {
  isProfileMenuOpen.value = false
  authStore.logout()
  router.push('/login')
}

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