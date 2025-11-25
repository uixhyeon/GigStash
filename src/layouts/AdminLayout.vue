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
        isMobileMenuOpen ? 'translate-x-0 w-56' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- 사이드바 헤더 -->
      <div
        class="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700"
      >
        <!-- 모바일에서는 항상 보임, 데스크톱에서는 !isSidebarCollapsed일 때만 보임 -->
        <h2
          class="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent text-center whitespace-nowrap flex-1 lg:hidden"
        >
          GigStash
        </h2>
        <transition name="fade" mode="out-in">
          <h2
            v-if="!isSidebarCollapsed"
            key="full"
            class="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent text-center whitespace-nowrap flex-1 hidden lg:block"
          >
            GigStash
          </h2>
        </transition>
        <!-- 데스크탑 사이드바 토글 버튼 -->
        <button
          @click="toggleSidebarDesktop"
          class="hidden lg:flex items-center justify-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all text-gray-600 dark:text-gray-400"
          :title="collapseButtonTitle"
        >
          <!-- 접기 아이콘 (펼쳐진 상태) - 왼쪽 화살표 -->
          <i v-if="!isSidebarCollapsed" class="fa fa-chevron-left"></i>
          <!-- 펴기 아이콘 (접힌 상태) - 햄버거바 -->
          <i v-else class="fa fa-bars"></i>
        </button>
      </div>

      <!-- 네비게이션 -->
      <nav
        class="flex-1 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600"
      >
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg',
            'text-gray-700 dark:text-slate-300 font-medium transition-all duration-200 whitespace-nowrap',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600',
            'hover:text-blue-600 dark:hover:text-cyan-400 hover:shadow-md',
            isSidebarCollapsed ? 'lg:justify-center lg:px-2' : '',
          ]"
          active-class="!bg-gradient-to-r !from-blue-600 !to-cyan-500 dark:!from-cyan-500 dark:!to-blue-600 !text-white !shadow-lg !shadow-blue-500/50 dark:!shadow-cyan-500/30"
        >
          <span class="text-xl flex-shrink-0">
            <component v-if="typeof item.icon !== 'string'" :is="item.icon" class="w-5 h-5 mr-3" />
            <i v-else :class="[item.icon, `mr-3`]"></i>
          </span>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="flex-1 block lg:hidden xxl:block">{{ item.label }}</span>
          </transition>
        </RouterLink>

        <div
          class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent mx-3 my-2"
        ></div>

        <RouterLink
          v-for="item in secondaryMenuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg',
            'text-gray-700 dark:text-slate-300 font-medium transition-all duration-200 whitespace-nowrap',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700 dark:hover:to-slate-600',
            'hover:text-blue-600 dark:hover:text-cyan-400 hover:shadow-md',
            isSidebarCollapsed ? 'lg:justify-center lg:px-2' : '',
          ]"
          active-class="!bg-gradient-to-r !from-blue-600 !to-cyan-500 dark:!from-cyan-500 dark:!to-blue-600 !text-white !shadow-lg !shadow-blue-500/50 dark:!shadow-cyan-500/30"
        >
          <span class="text-xl flex-shrink-0">
            <component v-if="typeof item.icon !== 'string'" :is="item.icon" class="w-5 h-5 mr-3" />
            <i v-else :class="[item.icon, `mr-3`]"></i>
          </span>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="flex-1 block lg:hidden xxl:block">{{ item.label }}</span>
          </transition>
        </RouterLink>
      </nav>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <div
      :class="[
        'flex-1 flex flex-col transition-all duration-200',
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56',
      ]"
    >
      <!-- 상단 헤더 -->
      <header
        class="sticky top-0 z-20 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 h-16 flex items-center shadow-sm"
      >
        <div class="flex justify-between items-center w-full">
          <!-- 모바일 햄버거 버튼 -->
          <button
            @click="toggleSidebar"
            class="lg:hidden w-12 h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all active:bg-gray-300 dark:active:bg-slate-600"
            title="사이드바 토글"
          >
            <i class="fa fa-bars text-2xl text-gray-600 dark:text-gray-300"></i>
          </button>

          <!-- 페이지 타이틀 -->
          <h1 class="text-xl" style="color: #1e293b">
            {{ pageTitle }}
          </h1>

          <!-- 헤더 오른쪽: 서치 + 다크모드 + 유저 프로필 -->
          <div class="flex items-center gap-4">
            <!-- 검색 박스 -->
            <div
              class="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-full"
            >
              <i class="fa fa-search text-gray-600 dark:text-gray-300"></i>
              <input
                type="text"
                placeholder="메뉴 검색"
                class="bg-transparent text-sm placeholder-gray-500 dark:placeholder-gray-400 outline-none w-40 text-gray-900 dark:text-white text-right"
              />
            </div>

            <!-- 다크모드 토글 -->
            <DarkModeToggle />

            <!-- 알림 아이콘 -->
            <!-- <button
              class="relative p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all text-gray-600 dark:text-gray-300"
            >
              <i class="fi fi-rr-bell text-xl"></i>
            </button> -->

            <!-- 프로필 영역 -->
            <div class="relative">
              <button
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all text-gray-700 dark:text-gray-300"
              >
                <span class="text-2xl">
                  <div
                    class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300"
                  >
                    {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : '관' }}
                  </div></span
                >
                <span class="font-medium text-gray-700 dark:text-gray-300">
                  {{ authStore.user?.name || '관리자' }}
                </span>
                <i class="fi fi-br-caret-down"></i>
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
                  <button
                    @click="confirmLogout"
                    class="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-all"
                  >
                    로그아웃
                  </button>
                </div>
              </transition>
            </div>
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
  {
    name: 'adminMain',
    path: '/admin/adminMain',
    icon: 'fa fa-chart-line',
    label: '대시보드',
  },
  {
    name: 'adminReservations',
    path: '/admin/reservations',
    icon: 'fa fa-clipboard-list',
    label: '예약관리',
  },
  {
    name: 'adminEventManagement',
    path: '/admin/event-management',
    icon: 'fa fa-calendar',
    label: '행사관리',
  },
  {
    name: 'adminMonitoring',
    path: '/admin/monitoring',
    icon: 'fa fa-bar-chart',
    label: '모니터링',
  },
]
const secondaryMenuItems = [
  { name: 'adminComponentDemo', path: '/admin/demo', icon: 'fa fa-cog', label: '설정' },
]

// menuItems과 secondaryMenuItems을 통합하여 route.name -> label 매핑
const allMenuItems = [...menuItems, ...secondaryMenuItems]
const menuLabelsMap = Object.fromEntries(allMenuItems.map((item) => [item.name, item.label]))

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

// 데스크탑용 사이드바 토글 버튼용 함수
const toggleSidebarDesktop = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value)
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false
}

const collapseButtonTitle = computed(() =>
  isSidebarCollapsed.value ? '사이드바 펼치기' : '사이드바 접기',
)

const pageTitle = computed(() => {
  console.log('route.name:' + route.name)
  return menuLabelsMap[route.name] || ''
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
