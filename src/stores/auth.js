import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = computed(() => user.value !== null)

  // Load user from localStorage on store initialization
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (e) {
      console.error('Failed to parse saved user:', e)
      localStorage.removeItem('user')
    }
  }

  // Actions
  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const logout = () => {
    clearUser()
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    logout
  }
})