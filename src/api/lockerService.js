// 사물함 API 서비스
import apiClient from './index'
import { API_CONFIG } from '@/config/api.config'

// Mock 데이터 import
import lockersData from '@/data/lockers.json'

// Mock 응답 시뮬레이션 (실제 API 호출처럼 Promise 반환)
const mockResponse = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data })
    }, API_CONFIG.mockDelay)
  })
}

// 사물함 API
export const lockerService = {
  // 전체 사물함 조회
  async getAll(params = {}) {
    if (API_CONFIG.mode === 'mock') {
      // Mock 모드: 로컬 데이터 반환
      let filtered = [...lockersData.lockers]

      // 필터링 로직 (실제 API와 동일하게)
      if (params.status) {
        filtered = filtered.filter((l) => l.status === params.status)
      }
      if (params.location) {
        filtered = filtered.filter((l) => l.location === params.location)
      }
      if (params.size) {
        filtered = filtered.filter((l) => l.size === params.size)
      }

      return mockResponse(filtered)
    } else {
      // Real 모드: 실제 API 호출
      return apiClient.get('/lockers', { params })
    }
  },

  // 사물함 상세 조회
  async getById(id) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === id)
      if (!locker) {
        return Promise.reject(new Error('사물함을 찾을 수 없습니다.'))
      }
      return mockResponse(locker)
    } else {
      return apiClient.get(`/lockers/${id}`)
    }
  },

  // 사물함 상태 변경
  async updateStatus(id, status) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === id)
      if (!locker) {
        return Promise.reject(new Error('사물함을 찾을 수 없습니다.'))
      }
      // Mock 데이터 업데이트 (실제로는 메모리에만 저장됨)
      locker.status = status
      return mockResponse(locker)
    } else {
      return apiClient.patch(`/lockers/${id}/status`, { status })
    }
  },

  // 온도 이력 조회
  async getTemperatureHistory(id, period = '24h') {
    if (API_CONFIG.mode === 'mock') {
      // Mock 온도 데이터 생성 (24시간 기준)
      const hours = period === '24h' ? 24 : period === '7d' ? 168 : 24
      const history = Array.from({ length: hours }, (_, i) => ({
        time: new Date(Date.now() - (hours - 1 - i) * 3600000).toISOString(),
        temperature: 3 + Math.random() * 2 // 3~5도 사이
      }))
      return mockResponse(history)
    } else {
      return apiClient.get(`/lockers/${id}/temperature`, { params: { period } })
    }
  },

  // 위치별 사물함 조회
  async getByLocation(location) {
    if (API_CONFIG.mode === 'mock') {
      const filtered = lockersData.lockers.filter((l) => l.location === location)
      return mockResponse(filtered)
    } else {
      return apiClient.get('/lockers', { params: { location } })
    }
  },

  // 사용 가능한 사물함 조회
  async getAvailable(size = null) {
    if (API_CONFIG.mode === 'mock') {
      let filtered = lockersData.lockers.filter((l) => l.status === 'available')
      if (size) {
        filtered = filtered.filter((l) => l.size === size)
      }
      return mockResponse(filtered)
    } else {
      const params = { status: 'available' }
      if (size) params.size = size
      return apiClient.get('/lockers', { params })
    }
  }
}
