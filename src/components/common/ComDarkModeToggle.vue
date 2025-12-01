<template>
  <button
    class="flex items-center justify-center w-10 h-10 border-none rounded bg-transparent text-gray-600 cursor-pointer transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-white"
    @click="toggleDarkMode"
    :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
    :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
  >
    <transition name="fade" mode="out-in">
      <svg
        v-if="isDark"
        key="moon"
        class="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      <svg v-else key="sun" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </transition>
  </button>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggleDarkMode } = useDarkMode()

//============================================
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
