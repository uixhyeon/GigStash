<template>
  <div v-if="isDev" class="fixed bottom-6 right-6 z-[9999]">
    <!-- Toggle Button -->
    <button
      class="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white border-none cursor-pointer shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl active:scale-95"
      @click="isOpen = !isOpen"
      :title="isOpen ? '닫기' : '열기'"
    >
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>

    <!-- Panel -->
    <transition name="slide">
      <div
        v-if="isOpen"
        class="absolute bottom-20 right-0 w-96 max-h-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-center p-4 pl-6 bg-gradient-to-r from-primary to-accent text-white"
        >
          <h3 class="m-0 text-lg font-bold">🛠️ API Debug Panel</h3>
          <button
            class="bg-none border-none text-white text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            @click="isOpen = false"
          >
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto max-h-96">
          <!-- API 모드 -->
          <div class="mb-6">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white m-0 mb-3">API Mode</h4>
            <div class="flex gap-2 mb-3">
              <button
                :class="[
                  'flex-1 px-4 py-3 rounded text-sm font-medium transition-all border-2',
                  apiConfig.mode === 'mock'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200',
                ]"
                @click="setMode('mock')"
              >
                📦 Mock
              </button>
              <button
                :class="[
                  'flex-1 px-4 py-3 rounded text-sm font-medium transition-all border-2',
                  apiConfig.mode === 'real'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200',
                ]"
                @click="setMode('real')"
              >
                🌐 Real
              </button>
            </div>
            <div
              class="flex justify-between items-center p-3 bg-gray-200 dark:bg-slate-700 rounded text-sm"
            >
              <span class="text-gray-600 dark:text-gray-300">현재 모드:</span>
              <span
                :class="['font-bold', apiConfig.mode === 'mock' ? 'text-accent' : 'text-primary']"
                >{{ apiConfig.mode.toUpperCase() }}</span
              >
            </div>
          </div>

          <!-- API 설정 -->
          <div class="mb-6">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white m-0 mb-3">
              API Configuration
            </h4>
            <div class="mb-3">
              <span class="text-sm text-gray-600 dark:text-gray-300 block mb-2 min-w-24"
                >Base URL:</span
              >
              <input
                v-model="apiConfig.baseURL"
                class="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-2 focus:outline-offset-2 focus:outline-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                type="text"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-300">Mock Delay:</span>
              <input
                v-model.number="apiConfig.mockDelay"
                class="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-2 focus:outline-offset-2 focus:outline-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                type="number"
                min="0"
              />
              <span class="text-sm text-gray-600 dark:text-gray-300">ms</span>
            </div>
          </div>

          <!-- API 테스트 -->
          <div class="mb-6">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white m-0 mb-3">
              Quick API Test
            </h4>
            <div class="flex flex-col gap-2 mb-4">
              <button
                class="px-4 py-3 rounded text-sm font-medium bg-primary text-white border-none cursor-pointer transition-all hover:bg-blue-700 active:scale-98 dark:hover:bg-blue-600"
                @click="testLockers"
              >
                <span>🔒 Test Lockers</span>
              </button>
              <button
                class="px-4 py-3 rounded text-sm font-medium bg-primary text-white border-none cursor-pointer transition-all hover:bg-blue-700 active:scale-98 dark:hover:bg-blue-600"
                @click="testReservations"
              >
                <span>📅 Test Reservations</span>
              </button>
              <button
                class="px-4 py-3 rounded text-sm font-medium bg-primary text-white border-none cursor-pointer transition-all hover:bg-blue-700 active:scale-98 dark:hover:bg-blue-600"
                @click="testStats"
              >
                <span>📊 Test Stats</span>
              </button>
            </div>

            <!-- 테스트 결과 -->
            <div v-if="testResult" class="bg-gray-200 dark:bg-slate-700 rounded overflow-hidden">
              <div class="flex justify-between items-center p-2 px-3 bg-white dark:bg-slate-600">
                <span
                  :class="[
                    'text-sm font-medium',
                    testResult.success ? 'text-accent' : 'text-error',
                  ]"
                >
                  {{ testResult.success ? '✅ Success' : '❌ Error' }}
                </span>
                <span class="text-xs text-gray-600 dark:text-gray-300"
                  >{{ testResult.time }}ms</span
                >
              </div>
              <pre
                class="p-3 m-0 text-xs text-gray-900 dark:text-gray-100 max-h-48 overflow-y-auto bg-white dark:bg-slate-600"
                >{{ testResult.data }}</pre
              >
            </div>
          </div>

          <!-- 다크모드 -->
          <div class="mb-6">
            <h4 class="text-base font-semibold text-gray-900 dark:text-white m-0 mb-3">Theme</h4>
            <button
              class="w-full px-4 py-3 rounded text-sm font-medium border-2 border-gray-200 bg-white text-gray-900 cursor-pointer transition-all hover:border-accent hover:text-accent dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:text-accent"
              @click="toggleDarkMode"
            >
              <span v-if="isDark">🌙 Dark Mode</span>
              <span v-else>☀️ Light Mode</span>
            </button>
          </div>

          <!-- Console Tips -->
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white m-0 mb-3">
              💡 Console Commands
            </h4>
            <code
              class="block p-2 px-3 bg-gray-200 dark:bg-slate-700 rounded text-xs text-primary dark:text-accent mb-2 font-mono"
              >window.__GIGSTASH_API_CONFIG__</code
            >
            <code
              class="block p-2 px-3 bg-gray-200 dark:bg-slate-700 rounded text-xs text-primary dark:text-accent font-mono"
              >window.__TOGGLE_API_MODE__()</code
            >
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { API_CONFIG, toggleApiMode } from '@/config/api.config'
import { useDarkMode } from '@/composables/useDarkMode'
import { lockerService } from '@/api/lockerService'
import { reservationService } from '@/api/reservationService'
import { statsService } from '@/api/statsService'

const isDev = import.meta.env.DEV
const isOpen = ref(false)
const testResult = ref(null)
const apiConfig = API_CONFIG
const { isDark, toggleDarkMode } = useDarkMode()

const setMode = (mode) => {
  apiConfig.mode = mode
  console.log(`🔄 API Mode changed to: ${mode}`)
}

const testApi = async (name, apiCall) => {
  testResult.value = null
  const startTime = performance.now()

  try {
    const response = await apiCall()
    const endTime = performance.now()

    testResult.value = {
      success: true,
      time: Math.round(endTime - startTime),
      data: JSON.stringify(response.data, null, 2),
    }

    console.log(`✅ ${name} Test Success:`, response.data)
  } catch (error) {
    const endTime = performance.now()

    testResult.value = {
      success: false,
      time: Math.round(endTime - startTime),
      data: error.message,
    }

    console.error(`❌ ${name} Test Failed:`, error)
  }
}

const testLockers = () => testApi('Lockers', () => lockerService.getAll())
const testReservations = () => testApi('Reservations', () => reservationService.getAll())
const testStats = () => testApi('Stats', () => statsService.getDashboard())
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 200ms ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
