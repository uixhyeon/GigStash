import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 전체 설명
 * - Store의 역할: 사용자 정보, 로그인 상태 관리
 * - 역할 종류: 'admin' (관리자), 'worker' (기사)
 * - localStorage 저장: 새로고침 후에도 상태 유지
 */
export const useAuthStore = defineStore('auth', () => {
  /**
   * State (상태)
   */
  // user: 사용자 정보 구조 { id, email, name, role }, null=미로그인
  const user = ref(null)

  // isAuthenticated: 로그인 여부 검증 (true/false)
  const isAuthenticated = computed(() => user.value !== null)

  // userRole: 역할 반환 ('admin' | 'worker' | null)
  const userRole = computed(() => user.value?.role || null)

  /**
   * 초기화
   * - localStorage에서 저장된 사용자 정보 복원
   * - 새로고침 후에도 로그인 상태 유지
   */
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (e) {
      console.error('Failed to parse saved user:', e)
      localStorage.removeItem('user')
    }
  }

  /**
   * Actions (액션)
   */
  // setUser: 파라미터 { id, email, name, role }, 로그인 성공 시 호출
  // 사용 예: authStore.setUser({ id: 1, email: 'admin@example.com', name: '김관리', role: 'admin' })
  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // clearUser: user 상태 null 설정, localStorage에서 삭제
  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  // logout: clearUser() 호출 (wrapper 함수)
  const logout = () => {
    clearUser()
  }

  /**
   * 반환값
   * - user: 현재 사용자 정보 객체
   * - isAuthenticated: 로그인 여부
   * - userRole: 사용자 역할
   * - setUser: 사용자 정보 저장 (로그인)
   * - clearUser: 사용자 정보 삭제 (내부용)
   * - logout: 로그아웃 처리
   */
  return {
    user,
    isAuthenticated,
    userRole,
    setUser,
    clearUser,
    logout
  }
})
