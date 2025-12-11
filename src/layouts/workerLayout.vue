<template>
  <div
    class="h-screen w-full max-w-[480px] fixed top-0 left-1/2 -translate-x-1/2 overflow-hidden bg-white dark:bg-black"
  >
    <!-- 헤더 -->
    <header
      class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[68px] z-20 flex items-center"
      style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
    >
      <div class="flex items-center gap-3 justify-center w-full px-4">
        <!-- 왼쪽: GigStash 로고 -->
        <button @click="goToHome" >
          <span
            class="text-white font-bold text-2xl"
            style="
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
    <main 
      class="bg-gray-100 w-full h-full pt-[68px] pb-5 dark:bg-gray-900 scrollbar-hide"
      :class="isQrCodePage ? 'overflow-hidden' : 'overflow-y-auto'"
    >
      <router-view></router-view>
    </main>

    <!-- 하단 네비게이션 바 -->
    <nav
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[68px] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 flex items-center"
    >
      <div class="flex items-center justify-center w-full gap-16">
        <!-- 내급여 -->
        <router-link
          to="/worker/workerMain/salary-detail"
          :class="[
            'flex items-center justify-center w-14 h-14 rounded-full transition-colors',
            isActiveRoute('/worker/workerMain/salary-detail')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          ]"
        >
          <i class="fi fi-rr-wallet text-[27px] leading-none"></i>
        </router-link>

        <!-- 홈 -->
        <router-link
          to="/worker/workerMain"
          :class="[
            'relative flex items-center justify-center w-[72px] h-[72px] -translate-y-3 rounded-full shadow-lg transition-transform duration-150',
            isHomeActive
              ? 'bg-[#1e3a8a] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]'
              : 'bg-[#1e40af] text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]',
          ]"
        >
          <i class="fi fi-rr-home text-[27px] leading-none"></i>
        </router-link>

        <!-- 마이페이지 -->
        <router-link
          to="/worker/workerMain/settings"
          :class="[
            'flex items-center justify-center w-14 h-14 rounded-full transition-colors',
            isActiveRoute('/worker/workerMain/settings')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          ]"
        >
          <i class="fi fi-rr-user text-[27px] leading-none"></i>
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

// QrCode 페이지 여부 확인
const isQrCodePage = computed(() => {
  return route.path.includes('/qr-code')
})
</script>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none !important; /* Chrome, Safari, Opera */
  width: 0 !important;
  height: 0 !important;
}

.scrollbar-hide::-webkit-scrollbar-track {
  display: none !important;
}

.scrollbar-hide::-webkit-scrollbar-thumb {
  display: none !important;
}
</style>
