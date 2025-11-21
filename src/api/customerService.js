// 고객 API 서비스
import apiClient from './index'
import { API_CONFIG } from '@/config/api.config'
import customersData from '@/data/customers.json'

const mockResponse = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), API_CONFIG.mockDelay)
  })
}

export const customerService = {
  // 전체 고객 조회
  async getAll(params = {}) {
    if (API_CONFIG.mode === 'mock') {
      let filtered = [...customersData.customers]

      // 멤버십 레벨 필터링
      if (params.membershipLevel) {
        filtered = filtered.filter((c) => c.membershipLevel === params.membershipLevel)
      }

      // 검색어 필터링 (이름, 전화번호, 이메일)
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.phone.includes(params.search) ||
            c.email.toLowerCase().includes(searchLower)
        )
      }

      // 정렬 (최근 가입순)
      filtered.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))

      return mockResponse(filtered)
    } else {
      return apiClient.get('/customers', { params })
    }
  },

  // 고객 상세 조회
  async getById(id) {
    if (API_CONFIG.mode === 'mock') {
      const customer = customersData.customers.find((c) => c.id === id)
      if (!customer) {
        return Promise.reject(new Error('고객을 찾을 수 없습니다.'))
      }
      return mockResponse(customer)
    } else {
      return apiClient.get(`/customers/${id}`)
    }
  },

  // 고객 생성
  async create(data) {
    if (API_CONFIG.mode === 'mock') {
      const newCustomer = {
        id: `C${String(customersData.customers.length + 1).padStart(3, '0')}`,
        ...data,
        membershipLevel: data.membershipLevel || 'bronze',
        registeredAt: new Date().toISOString(),
        totalReservations: 0,
        activeReservations: 0,
        lastReservation: null
      }
      customersData.customers.push(newCustomer)
      return mockResponse(newCustomer)
    } else {
      return apiClient.post('/customers', data)
    }
  },

  // 고객 수정
  async update(id, data) {
    if (API_CONFIG.mode === 'mock') {
      const index = customersData.customers.findIndex((c) => c.id === id)
      if (index === -1) {
        return Promise.reject(new Error('고객을 찾을 수 없습니다.'))
      }
      const updated = {
        ...customersData.customers[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      customersData.customers[index] = updated
      return mockResponse(updated)
    } else {
      return apiClient.patch(`/customers/${id}`, data)
    }
  },

  // 고객 삭제
  async delete(id) {
    if (API_CONFIG.mode === 'mock') {
      const index = customersData.customers.findIndex((c) => c.id === id)
      if (index === -1) {
        return Promise.reject(new Error('고객을 찾을 수 없습니다.'))
      }
      const deleted = customersData.customers.splice(index, 1)[0]
      return mockResponse(deleted)
    } else {
      return apiClient.delete(`/customers/${id}`)
    }
  },

  // 전화번호로 고객 조회
  async getByPhone(phone) {
    if (API_CONFIG.mode === 'mock') {
      const customer = customersData.customers.find((c) => c.phone === phone)
      if (!customer) {
        return Promise.reject(new Error('고객을 찾을 수 없습니다.'))
      }
      return mockResponse(customer)
    } else {
      return apiClient.get('/customers/phone', { params: { phone } })
    }
  },

  // 고객 예약 이력 조회
  async getReservationHistory(id) {
    if (API_CONFIG.mode === 'mock') {
      // 이 부분은 reservationService와 연동 필요
      // 여기서는 간단히 mock 데이터 반환
      const mockHistory = [
        {
          id: 'R001',
          date: '2025-01-10',
          lockerNumber: 'A-102',
          status: 'completed'
        }
      ]
      return mockResponse(mockHistory)
    } else {
      return apiClient.get(`/customers/${id}/reservations`)
    }
  },

  // 멤버십 레벨 업데이트
  async updateMembershipLevel(id, level) {
    if (API_CONFIG.mode === 'mock') {
      const customer = customersData.customers.find((c) => c.id === id)
      if (!customer) {
        return Promise.reject(new Error('고객을 찾을 수 없습니다.'))
      }
      customer.membershipLevel = level
      return mockResponse(customer)
    } else {
      return apiClient.patch(`/customers/${id}/membership`, { level })
    }
  }
}
