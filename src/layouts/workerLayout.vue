<template>
  <div
    class="h-screen w-full max-w-[480px] fixed top-0 left-1/2 -translate-x-1/2 overflow-hidden bg-white dark:bg-black"
  >
    <!-- 헤더 -->
    <header
      class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20"
      style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
    >
      <div class="flex items-center gap-3 justify-center p-4 pb-2">
        <!-- 왼쪽: GigStash 로고 -->
        <button @click="goToHome" >
          <span
            class="text-white font-bold text-2xl"
            style="
              padding-bottom: 50px;
              font-family:
                -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
              letter-spacing: -0.5px;
            "
          >
            GigStash
          </span>
        </button>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="bg-gray-100 overflow-y-auto w-full h-full pt-[68px] pb-[72px] dark:bg-gray-900">
      <router-view></router-view>
    </main>

    <!-- 하단 네비게이션 바 -->
    <nav
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40"
    >
      <div class="flex items-center justify-around py-2">
        <!-- 내급여 -->
        <router-link
          to="/worker/workerMain/salary-detail"
          :class="[
            'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
            isActiveRoute('/worker/workerMain/salary-detail')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          ]"
        >
          <i class="fi fi-rr-wallet text-xl leading-none"></i>
          <span
            class="text-xs"
            :class="isActiveRoute('/worker/workerMain/salary-detail') ? 'font-medium' : ''"
            >내급여</span
          >
        </router-link>

        <!-- 홈 -->
        <router-link
          to="/worker/workerMain"
          :class="[
            'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
            isHomeActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          ]"
        >
          <i class="fi fi-rr-home text-xl leading-none"></i>
          <span class="text-xs" :class="isHomeActive ? 'font-medium' : ''">홈</span>
        </router-link>

        <!-- 마이페이지 -->
        <router-link
          to="/worker/workerMain/settings"
          :class="[
            'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
            isActiveRoute('/worker/workerMain/settings')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          ]"
        >
          <i class="fi fi-rr-user text-xl leading-none"></i>
          <span
            class="text-xs"
            :class="isActiveRoute('/worker/workerMain/settings') ? 'font-medium' : ''"
            >마이페이지</span
          >
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const goToHome = () => {
  router.push({ name: 'WorkerWork' })
}

const goToProfile = () => {
  router.push({ name: 'WorkerSettings' })
}

// 현재 라우트가 특정 경로와 일치하는지 확인
const isActiveRoute = (path) => {
  return route.path === path
}

// 홈 탭 활성화 여부 (정확히 /worker/workerMain이거나 하위 페이지가 아닌 경우)
const isHomeActive = computed(() => {
  return (
    route.path === '/worker/workerMain' ||
    route.path === '/worker/workerMain/' ||
    (route.path.startsWith('/worker/workerMain') &&
      !route.path.includes('/salary-detail') &&
      !route.path.includes('/settings') &&
      !route.path.includes('/calendar') &&
      !route.path.includes('/edit-profile'))
  )
})
</script>
