// 예약 API 서비스
import apiClient from './index'
import { API_CONFIG } from '@/config/api.config'
import reservationsData from '@/data/reservations.json'

const mockResponse = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), API_CONFIG.mockDelay)
  })
}

export const reservationService = {
  // 전체 예약 조회
  async getAll(params = {}) {
    if (API_CONFIG.mode === 'mock') {
      let filtered = [...reservationsData.reservations]

      // 상태 필터링
      if (params.status) {
        filtered = filtered.filter((r) => r.status === params.status)
      }

      // 날짜 필터링
      if (params.date) {
        filtered = filtered.filter((r) => r.startTime.startsWith(params.date))
      }

      // 고객 ID 필터링
      if (params.customerId) {
        filtered = filtered.filter((r) => r.customerId === params.customerId)
      }

      // 사물함 ID 필터링
      if (params.lockerId) {
        filtered = filtered.filter((r) => r.lockerId === params.lockerId)
      }

      // 정렬 (최신순)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return mockResponse(filtered)
    } else {
      return apiClient.get('/reservations', { params })
    }
  },

  // 예약 상세 조회
  async getById(id) {
    if (API_CONFIG.mode === 'mock') {
      const reservation = reservationsData.reservations.find((r) => r.id === id)
      if (!reservation) {
        return Promise.reject(new Error('예약을 찾을 수 없습니다.'))
      }
      return mockResponse(reservation)
    } else {
      return apiClient.get(`/reservations/${id}`)
    }
  },

  // 예약 생성
  async create(data) {
    if (API_CONFIG.mode === 'mock') {
      const newReservation = {
        id: `R${String(reservationsData.reservations.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        accessCode: String(Math.floor(1000 + Math.random() * 9000)),
      }
      reservationsData.reservations.push(newReservation)
      return mockResponse(newReservation)
    } else {
      return apiClient.post('/reservations', data)
    }
  },

  // 예약 수정
  async update(id, data) {
    if (API_CONFIG.mode === 'mock') {
      const index = reservationsData.reservations.findIndex((r) => r.id === id)
      if (index === -1) {
        return Promise.reject(new Error('예약을 찾을 수 없습니다.'))
      }
      const updated = {
        ...reservationsData.reservations[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      reservationsData.reservations[index] = updated
      return mockResponse(updated)
    } else {
      return apiClient.patch(`/reservations/${id}`, data)
    }
  },

  // 예약 취소
  async cancel(id, reason) {
    if (API_CONFIG.mode === 'mock') {
      const reservation = reservationsData.reservations.find((r) => r.id === id)
      if (!reservation) {
        return Promise.reject(new Error('예약을 찾을 수 없습니다.'))
      }
      reservation.status = 'cancelled'
      reservation.cancelledAt = new Date().toISOString()
      reservation.cancelReason = reason
      return mockResponse(reservation)
    } else {
      return apiClient.patch(`/reservations/${id}/cancel`, { reason })
    }
  },

  // 예약 완료 처리
  async complete(id) {
    if (API_CONFIG.mode === 'mock') {
      const reservation = reservationsData.reservations.find((r) => r.id === id)
      if (!reservation) {
        return Promise.reject(new Error('예약을 찾을 수 없습니다.'))
      }
      reservation.status = 'completed'
      reservation.completedAt = new Date().toISOString()
      return mockResponse(reservation)
    } else {
      return apiClient.patch(`/reservations/${id}/complete`)
    }
  },

  // 오늘의 예약 조회
  async getToday() {
    if (API_CONFIG.mode === 'mock') {
      const today = new Date().toISOString().split('T')[0]
      const filtered = reservationsData.reservations.filter((r) => r.startTime.startsWith(today))
      return mockResponse(filtered)
    } else {
      return apiClient.get('/reservations/today')
    }
  },

  // 활성 예약 조회
  async getActive() {
    if (API_CONFIG.mode === 'mock') {
      const filtered = reservationsData.reservations.filter((r) => r.status === 'active')
      return mockResponse(filtered)
    } else {
      return apiClient.get('/reservations', { params: { status: 'active' } })
    }
  },
}
