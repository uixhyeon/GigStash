// 통계 API 서비스
import apiClient from './index'
import { API_CONFIG } from '@/config/api.config'
import lockersData from '@/data/lockers.json'
import reservationsData from '@/data/reservations.json'
import customersData from '@/data/customers.json'

const mockResponse = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), API_CONFIG.mockDelay)
  })
}

export const statsService = {
  // 대시보드 통계
  async getDashboard() {
    if (API_CONFIG.mode === 'mock') {
      const totalLockers = lockersData.lockers.length
      const availableLockers = lockersData.lockers.filter((l) => l.status === 'available').length
      const inUseLockers = lockersData.lockers.filter((l) => l.status === 'in-use').length
      const maintenanceLockers = lockersData.lockers.filter(
        (l) => l.status === 'maintenance'
      ).length
      const brokenLockers = lockersData.lockers.filter((l) => l.status === 'broken').length

      const today = new Date().toISOString().split('T')[0]
      const todayReservations = reservationsData.reservations.filter((r) =>
        r.startTime.startsWith(today)
      ).length

      const activeReservations = reservationsData.reservations.filter(
        (r) => r.status === 'active'
      ).length

      const completedToday = reservationsData.reservations.filter(
        (r) => r.status === 'completed' && r.completedAt && r.completedAt.startsWith(today)
      ).length

      const usageRate = ((inUseLockers / totalLockers) * 100).toFixed(1)

      const stats = {
        totalLockers,
        availableLockers,
        inUseLockers,
        maintenanceLockers,
        brokenLockers,
        usageRate: parseFloat(usageRate),
        todayReservations,
        activeReservations,
        todayPickups: completedToday,
        totalCustomers: customersData.customers.length,
        revenueToday: todayReservations * 5000, // 가정: 건당 5000원
        revenueMonth: reservationsData.reservations.length * 5000
      }

      return mockResponse(stats)
    } else {
      return apiClient.get('/stats/dashboard')
    }
  },

  // 사용률 이력
  async getUsageHistory(period = '7d') {
    if (API_CONFIG.mode === 'mock') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 7

      // Mock 사용률 데이터 (날짜별)
      const history = Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - (days - 1 - i) * 86400000)
        const dateStr = date.toISOString().split('T')[0]

        return {
          date: dateStr,
          usage: 50 + Math.random() * 30, // 50~80% 사이
          reservations: Math.floor(5 + Math.random() * 15), // 5~20건
          revenue: Math.floor((5 + Math.random() * 15) * 5000)
        }
      })

      return mockResponse(history)
    } else {
      return apiClient.get('/stats/usage', { params: { period } })
    }
  },

  // 시간대별 사용 통계
  async getHourlyUsage(date = null) {
    if (API_CONFIG.mode === 'mock') {
      // Mock 시간대별 데이터 (0~23시)
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        reservations: Math.floor(Math.random() * 10),
        pickups: Math.floor(Math.random() * 8)
      }))

      return mockResponse(hourlyData)
    } else {
      return apiClient.get('/stats/hourly', { params: { date } })
    }
  },

  // 사물함 크기별 통계
  async getLockerSizeStats() {
    if (API_CONFIG.mode === 'mock') {
      const sizeStats = {
        small: {
          total: lockersData.lockers.filter((l) => l.size === 'small').length,
          available: lockersData.lockers.filter(
            (l) => l.size === 'small' && l.status === 'available'
          ).length,
          inUse: lockersData.lockers.filter((l) => l.size === 'small' && l.status === 'in-use')
            .length
        },
        medium: {
          total: lockersData.lockers.filter((l) => l.size === 'medium').length,
          available: lockersData.lockers.filter(
            (l) => l.size === 'medium' && l.status === 'available'
          ).length,
          inUse: lockersData.lockers.filter((l) => l.size === 'medium' && l.status === 'in-use')
            .length
        },
        large: {
          total: lockersData.lockers.filter((l) => l.size === 'large').length,
          available: lockersData.lockers.filter(
            (l) => l.size === 'large' && l.status === 'available'
          ).length,
          inUse: lockersData.lockers.filter((l) => l.size === 'large' && l.status === 'in-use')
            .length
        }
      }

      return mockResponse(sizeStats)
    } else {
      return apiClient.get('/stats/locker-size')
    }
  },

  // 위치별 통계
  async getLocationStats() {
    if (API_CONFIG.mode === 'mock') {
      const locations = [...new Set(lockersData.lockers.map((l) => l.location))]

      const locationStats = locations.map((location) => {
        const lockers = lockersData.lockers.filter((l) => l.location === location)
        const available = lockers.filter((l) => l.status === 'available').length
        const inUse = lockers.filter((l) => l.status === 'in-use').length

        return {
          location,
          total: lockers.length,
          available,
          inUse,
          usageRate: ((inUse / lockers.length) * 100).toFixed(1)
        }
      })

      return mockResponse(locationStats)
    } else {
      return apiClient.get('/stats/location')
    }
  },

  // 고객 멤버십 통계
  async getMembershipStats() {
    if (API_CONFIG.mode === 'mock') {
      const membershipStats = {
        bronze: customersData.customers.filter((c) => c.membershipLevel === 'bronze').length,
        silver: customersData.customers.filter((c) => c.membershipLevel === 'silver').length,
        gold: customersData.customers.filter((c) => c.membershipLevel === 'gold').length,
        platinum: customersData.customers.filter((c) => c.membershipLevel === 'platinum').length
      }

      return mockResponse(membershipStats)
    } else {
      return apiClient.get('/stats/membership')
    }
  },

  // 예약 상태별 통계
  async getReservationStats() {
    if (API_CONFIG.mode === 'mock') {
      const reservationStats = {
        active: reservationsData.reservations.filter((r) => r.status === 'active').length,
        completed: reservationsData.reservations.filter((r) => r.status === 'completed').length,
        cancelled: reservationsData.reservations.filter((r) => r.status === 'cancelled').length,
        expired: reservationsData.reservations.filter((r) => r.status === 'expired').length
      }

      return mockResponse(reservationStats)
    } else {
      return apiClient.get('/stats/reservations')
    }
  }
}
