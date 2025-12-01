/**
 * 사물함 관리 서비스
 *
 * Mock 모드 + Firebase Firestore 이중 지원
 */

import { API_CONFIG } from '@/config/api.config'
import lockersData from '@/data/lockers.json'

// Firebase Imports
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  orderBy
} from 'firebase/firestore'
import { db } from '@/config/firebase.config'

const COLLECTION = 'lockers'

// Mock 응답 시뮬레이션
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
      let filtered = [...lockersData.lockers]

      if (params.status) {
        filtered = filtered.filter((l) => l.status === params.status)
      }
      if (params.vehicleId) {
        filtered = filtered.filter((l) => l.vehicleId === params.vehicleId)
      }
      if (params.size) {
        filtered = filtered.filter((l) => l.size === params.size)
      }

      return mockResponse(filtered)
    } else {
      // Firebase 모드
      try {
        const constraints = []

        if (params.status) {
          constraints.push(where('status', '==', params.status))
        }
        if (params.vehicleId) {
          constraints.push(where('vehicleId', '==', params.vehicleId))
        }
        if (params.size) {
          constraints.push(where('size', '==', params.size))
        }

        const q = query(collection(db, COLLECTION), ...constraints, orderBy('number'))
        const snapshot = await getDocs(q)

        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        }
      } catch (error) {
        console.error('lockerService.getAll error:', error)
        throw error
      }
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
      try {
        const docSnap = await getDoc(doc(db, COLLECTION, id))
        if (!docSnap.exists()) {
          throw new Error('사물함을 찾을 수 없습니다.')
        }
        return { data: { id: docSnap.id, ...docSnap.data() } }
      } catch (error) {
        console.error('lockerService.getById error:', error)
        throw error
      }
    }
  },

  // 차량별 사물함 조회
  async getByVehicleId(vehicleId) {
    return this.getAll({ vehicleId })
  },

  // 사물함 상태 변경
  async updateStatus(id, status) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === id)
      if (!locker) {
        return Promise.reject(new Error('사물함을 찾을 수 없습니다.'))
      }
      locker.status = status
      locker.updatedAt = new Date().toISOString()
      return mockResponse(locker)
    } else {
      try {
        await updateDoc(doc(db, COLLECTION, id), {
          status,
          updatedAt: new Date().toISOString()
        })
        return this.getById(id)
      } catch (error) {
        console.error('lockerService.updateStatus error:', error)
        throw error
      }
    }
  },

  // 온도 업데이트
  async updateTemperature(id, temperature) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === id)
      if (!locker) {
        return Promise.reject(new Error('사물함을 찾을 수 없습니다.'))
      }
      locker.temperature = temperature
      locker.lastUpdated = new Date().toISOString()
      return mockResponse(locker)
    } else {
      try {
        await updateDoc(doc(db, COLLECTION, id), {
          temperature,
          lastUpdated: new Date().toISOString()
        })
        return this.getById(id)
      } catch (error) {
        console.error('lockerService.updateTemperature error:', error)
        throw error
      }
    }
  },

  // 온도 이력 조회
  async getTemperatureHistory(id, period = '24h') {
    const hours = period === '24h' ? 24 : period === '7d' ? 168 : 24
    const history = Array.from({ length: hours }, (_, i) => ({
      time: new Date(Date.now() - (hours - 1 - i) * 3600000).toISOString(),
      temperature: 3 + Math.random() * 2
    }))
    return mockResponse(history)
  },

  // 예약 할당
  async assignReservation(id, reservationId) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === id)
      if (!locker) {
        return Promise.reject(new Error('사물함을 찾을 수 없습니다.'))
      }
      locker.currentReservation = reservationId
      locker.status = 'in-use'
      return mockResponse(locker)
    } else {
      try {
        await updateDoc(doc(db, COLLECTION, id), {
          currentReservation: reservationId,
          status: 'in-use'
        })
        return this.getById(id)
      } catch (error) {
        console.error('lockerService.assignReservation error:', error)
        throw error
      }
    }
  },

  // 예약 해제
  async releaseReservation(id) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === id)
      if (!locker) {
        return Promise.reject(new Error('사물함을 찾을 수 없습니다.'))
      }
      locker.currentReservation = null
      locker.status = 'available'
      return mockResponse(locker)
    } else {
      try {
        await updateDoc(doc(db, COLLECTION, id), {
          currentReservation: null,
          status: 'available'
        })
        return this.getById(id)
      } catch (error) {
        console.error('lockerService.releaseReservation error:', error)
        throw error
      }
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
      try {
        const constraints = [where('status', '==', 'available')]
        if (size) {
          constraints.push(where('size', '==', size))
        }
        const q = query(collection(db, COLLECTION), ...constraints)
        const snapshot = await getDocs(q)

        return {
          data: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        }
      } catch (error) {
        console.error('lockerService.getAvailable error:', error)
        throw error
      }
    }
  },

  // 실시간 차량별 사물함 리스너
  onVehicleLockers(vehicleId, callback) {
    if (API_CONFIG.mode === 'mock') {
      const lockers = lockersData.lockers.filter((l) => l.vehicleId === vehicleId)
      callback(lockers)
      return () => {}
    } else {
      try {
        const q = query(collection(db, COLLECTION), where('vehicleId', '==', vehicleId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          callback(data)
        })
        return unsubscribe
      } catch (error) {
        console.error('lockerService.onVehicleLockers error:', error)
        return () => {}
      }
    }
  },

  // 실시간 사물함 상태 변경 리스너
  onLockerStatusChange(lockerId, callback) {
    if (API_CONFIG.mode === 'mock') {
      const locker = lockersData.lockers.find((l) => l.id === lockerId)
      if (locker) callback(locker)
      return () => {}
    } else {
      try {
        const unsubscribe = onSnapshot(doc(db, COLLECTION, lockerId), (d) => {
          if (d.exists()) {
            callback({ id: d.id, ...d.data() })
          }
        })
        return unsubscribe
      } catch (error) {
        console.error('lockerService.onLockerStatusChange error:', error)
        return () => {}
      }
    }
  }
}
