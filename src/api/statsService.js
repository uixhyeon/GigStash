/**
 * 통계 서비스 (Firebase Firestore)
 *
 * Firebase를 데이터 소스로 사용하는 대시보드 통계 API
 * Mock 모드 제거 - Firebase 전용
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore'
import { db } from '@/config/firebase.config'
import { reservationService } from './reservationService'
import { customerService } from './customerService'
import { lockerService } from './lockerService'

export const statsService = {
  /**
   * 대시보드 통계
   * @returns {Promise<{data: Object}>} 대시보드 통계 데이터
   */
  async getDashboard() {
    try {
      // 사물함 통계
      const lockersRes = await lockerService.getAll()
      const totalLockers = lockersRes.data.length
      const availableLockers = lockersRes.data.filter((l) => l.status === 'available').length
      const inUseLockers = lockersRes.data.filter((l) => l.status === 'in-use').length
      const maintenanceLockers = lockersRes.data.filter((l) => l.status === 'maintenance').length
      const brokenLockers = lockersRes.data.filter((l) => l.status === 'broken').length

      // 예약 통계
      const reservationsRes = await reservationService.getAll()
      const today = new Date().toISOString().split('T')[0]
      const todayReservations = reservationsRes.data.filter((r) =>
        r.startTime.toString().startsWith(today)
      ).length
      const activeReservations = reservationsRes.data.filter((r) => r.status === 'active').length
      const completedToday = reservationsRes.data.filter(
        (r) => r.status === 'completed' && r.completedAt && r.completedAt.toString().startsWith(today)
      ).length

      // 고객 통계
      const customersRes = await customerService.getAll()
      const totalCustomers = customersRes.data.length

      // 계산
      const usageRate = totalLockers > 0 ? ((inUseLockers / totalLockers) * 100).toFixed(1) : 0
      const revenueToday = todayReservations * 5000 // 가정: 건당 5000원
      const revenueMonth = reservationsRes.data.length * 5000

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
        totalCustomers,
        revenueToday,
        revenueMonth,
      }

      return { data: stats }
    } catch (error) {
      console.error('statsService.getDashboard error:', error)
      throw error
    }
  },

  /**
   * 사물함 크기별 통계
   * @returns {Promise<{data: Object}>} 크기별 통계
   */
  async getLockerSizeStats() {
    try {
      const lockersRes = await lockerService.getAll()
      const lockers = lockersRes.data

      const sizeStats = {
        small: {
          total: lockers.filter((l) => l.size === 'small').length,
          available: lockers.filter((l) => l.size === 'small' && l.status === 'available').length,
          inUse: lockers.filter((l) => l.size === 'small' && l.status === 'in-use').length,
        },
        medium: {
          total: lockers.filter((l) => l.size === 'medium').length,
          available: lockers.filter((l) => l.size === 'medium' && l.status === 'available').length,
          inUse: lockers.filter((l) => l.size === 'medium' && l.status === 'in-use').length,
        },
        large: {
          total: lockers.filter((l) => l.size === 'large').length,
          available: lockers.filter((l) => l.size === 'large' && l.status === 'available').length,
          inUse: lockers.filter((l) => l.size === 'large' && l.status === 'in-use').length,
        },
      }

      return { data: sizeStats }
    } catch (error) {
      console.error('statsService.getLockerSizeStats error:', error)
      throw error
    }
  },

  /**
   * 차량별 통계
   * @returns {Promise<{data: Array}>} 차량별 통계
   */
  async getVehicleStats() {
    try {
      const lockersRes = await lockerService.getAll()
      const lockers = lockersRes.data

      // 차량별로 그룹화
      const vehicleMap = new Map()
      lockers.forEach((locker) => {
        if (!vehicleMap.has(locker.vehicleId)) {
          vehicleMap.set(locker.vehicleId, [])
        }
        vehicleMap.get(locker.vehicleId).push(locker)
      })

      const vehicleStats = Array.from(vehicleMap.entries()).map(([vehicleId, vehicleLockers]) => {
        const available = vehicleLockers.filter((l) => l.status === 'available').length
        const inUse = vehicleLockers.filter((l) => l.status === 'in-use').length
        const usageRate = vehicleLockers.length > 0
          ? ((inUse / vehicleLockers.length) * 100).toFixed(1)
          : 0

        return {
          vehicleId,
          total: vehicleLockers.length,
          available,
          inUse,
          usageRate: parseFloat(usageRate),
        }
      })

      return { data: vehicleStats }
    } catch (error) {
      console.error('statsService.getVehicleStats error:', error)
      throw error
    }
  },

  /**
   * 고객 멤버십 통계
   * @returns {Promise<{data: Object}>} 멤버십별 통계
   */
  async getMembershipStats() {
    try {
      const customersRes = await customerService.getAll()
      const customers = customersRes.data

      const membershipStats = {
        bronze: customers.filter((c) => c.membershipLevel === 'bronze').length,
        silver: customers.filter((c) => c.membershipLevel === 'silver').length,
        gold: customers.filter((c) => c.membershipLevel === 'gold').length,
        platinum: customers.filter((c) => c.membershipLevel === 'platinum').length,
      }

      return { data: membershipStats }
    } catch (error) {
      console.error('statsService.getMembershipStats error:', error)
      throw error
    }
  },

  /**
   * 예약 상태별 통계
   * @returns {Promise<{data: Object}>} 상태별 통계
   */
  async getReservationStats() {
    try {
      const reservationsRes = await reservationService.getAll()
      const reservations = reservationsRes.data

      const reservationStats = {
        pending: reservations.filter((r) => r.status === 'pending').length,
        confirmed: reservations.filter((r) => r.status === 'confirmed').length,
        active: reservations.filter((r) => r.status === 'active').length,
        completed: reservations.filter((r) => r.status === 'completed').length,
        cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      }

      return { data: reservationStats }
    } catch (error) {
      console.error('statsService.getReservationStats error:', error)
      throw error
    }
  },

  /**
   * 시간대별 예약 통계
   * @param {string} date - 조회 날짜 (YYYY-MM-DD)
   * @returns {Promise<{data: Array}>} 시간대별 통계
   */
  async getHourlyReservationStats(date = null) {
    try {
      const reservationsRes = await reservationService.getAll()
      const targetDate = date || new Date().toISOString().split('T')[0]
      const dayReservations = reservationsRes.data.filter((r) =>
        r.startTime.toString().startsWith(targetDate)
      )

      // 시간별로 그룹화
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourReservations = dayReservations.filter((r) => {
          const reservationHour = new Date(r.startTime).getHours()
          return reservationHour === hour
        })

        return {
          hour,
          reservations: hourReservations.length,
          pickups: hourReservations.filter((r) => r.status === 'completed').length,
        }
      })

      return { data: hourlyData }
    } catch (error) {
      console.error('statsService.getHourlyReservationStats error:', error)
      throw error
    }
  },

  /**
   * 사용률 이력
   * @param {string} period - 조회 기간 ('7d' | '30d')
   * @returns {Promise<{data: Array}>} 기간별 사용률
   */
  async getUsageHistory(period = '7d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 7
      const reservationsRes = await reservationService.getAll()
      const reservations = reservationsRes.data

      const history = Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - (days - 1 - i) * 86400000)
        const dateStr = date.toISOString().split('T')[0]

        const dayReservations = reservations.filter((r) =>
          r.startTime.toString().startsWith(dateStr)
        )

        return {
          date: dateStr,
          reservations: dayReservations.length,
          revenue: dayReservations.length * 5000,
        }
      })

      return { data: history }
    } catch (error) {
      console.error('statsService.getUsageHistory error:', error)
      throw error
    }
  }
}
