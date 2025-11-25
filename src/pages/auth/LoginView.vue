<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Login container -->
    <div class="relative z-10 w-full max-w-md px-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 dark:bg-gray-800">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 3h7v7H3V3zm2 2v3h3V5H5zm7-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm7-2h7v7h-7v-7zm2 2v3h3v-3h-3z"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">GigStash</h1>
          <p class="text-gray-600 dark:text-gray-400">로그인</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email input -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              이메일
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
              required
            />
          </div>

          <!-- Password input -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              비밀번호
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
              required
            />
          </div>

          <!-- Remember email checkbox -->
          <div class="flex items-center gap-2">
            <input
              id="rememberEmail"
              v-model="rememberEmail"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer dark:border-gray-600 dark:bg-gray-700"
            />
            <label
              for="rememberEmail"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              아이디 저장
            </label>
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400"
          >
            {{ error }}
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isLoading">로그인</span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              로그인 중...
            </span>
          </button>
        </form>

        <!-- Demo info -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-600 dark:text-gray-400 text-center mb-3">테스트 계정:</p>
          <div class="space-y-3 text-xs bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <!-- Admin account -->
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">관리자</p>
              <p class="text-gray-600 dark:text-gray-400">
                <span class="font-medium">이메일:</span> admin@example.com
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                <span class="font-medium">비밀번호:</span> 1
                <!-- <span class="font-medium">비밀번호:</span> admin123 -->
              </p>
            </div>
            <!-- Worker account -->
            <div class="pt-2 border-t border-gray-300 dark:border-gray-600">
              <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">기사</p>
              <p class="text-gray-600 dark:text-gray-400">
                <span class="font-medium">이메일:</span> worker@example.com
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                <span class="font-medium">비밀번호:</span> 1
                <!-- <span class="font-medium">비밀번호:</span> worker123 -->
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-white/80 text-sm mt-8">
        &copy; 2024 GigStash. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const isLoading = ref(false)
const error = ref('')
const rememberEmail = ref()

// 로컬스토리지에서 저장된 이메일 복원
onMounted(() => {
  const savedEmail = localStorage.getItem('savedEmail')
  const savedRememberEmail = localStorage.getItem('rememberEmail')

  if (savedEmail && savedRememberEmail === 'true') {
    form.value.email = savedEmail
    rememberEmail.value = true
  }
})

// 테스트 계정 정보
const testAccounts = {
  'admin@example.com': {
    password: '1',
    // password: 'admin123',
    id: 1,
    name: '김관리',
    role: 'admin',
  },
  'worker@example.com': {
    password: '1',
    // password: 'worker123',
    id: 2,
    name: '박기사',
    role: 'worker',
  },
}

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if account exists
    const account = testAccounts[form.value.email]
    if (account && account.password === form.value.password) {
      // 아이디 저장 처리
      if (rememberEmail.value) {
        localStorage.setItem('savedEmail', form.value.email)
        localStorage.setItem('rememberEmail', 'true')
      } else {
        localStorage.removeItem('savedEmail')
        localStorage.removeItem('rememberEmail')
      }

      // Set auth user with role
      authStore.setUser({
        id: account.id,
        email: form.value.email,
        name: account.name,
        role: account.role, // 'admin' 또는 'worker'
      })

      // 역할에 따라 다른 대시보드로 이동
      if (account.role === 'admin') {
        router.push('/admin/adminMain')
      } else if (account.role === 'worker') {
        router.push('/worker/workerMain')
      }
    } else {
      error.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
  } catch (e) {
    error.value = '로그인 중 오류가 발생했습니다.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/variables.scss';

:root {
  --primary: #{$color-primary};
}
</style>
