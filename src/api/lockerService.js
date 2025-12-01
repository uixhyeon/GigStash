/**
 * 사물함 관리 서비스 (Firebase Firestore)
 *
 * Firebase를 데이터 소스로 사용하는 사물함 관리 API
 * Mock 모드 제거 - Firebase 전용
 */

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

export const lockerService = {
  /**
   * 전체 사물함 조회
   * @param {Object} params - 필터 파라미터
   * @param {string} params.status - 사물함 상태 필터
   * @param {string} params.vehicleId - 차량 ID 필터
   * @param {string} params.size - 사물함 크기 필터
   * @returns {Promise<{data: Array}>} 사물함 배열
   */
  async getAll(params = {}) {
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

      // Firestore 제한: 여러 constraints가 있으면 orderBy 사용 불가
      const queryConstraints = constraints.length === 0
        ? [orderBy('number')]
        : []

      const q = query(
        collection(db, COLLECTION),
        ...constraints,
        ...queryConstraints
      )
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // constraints가 있으면 클라이언트에서 정렬
      if (constraints.length > 0) {
        data.sort((a, b) => (a.number || a.id).localeCompare(b.number || b.id))
      }

      return { data }
    } catch (error) {
      console.error('lockerService.getAll error:', error)
      throw error
    }
  },

  /**
   * 사물함 상세 조회
   * @param {string} id - 사물함 ID
   * @returns {Promise<{data: Object}>} 사물함 정보
   */
  async getById(id) {
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
  },

  /**
   * 차량별 사물함 조회
   * @param {string} vehicleId - 차량 ID
   * @returns {Promise<{data: Array}>} 차량의 사물함 배열
   */
  async getByVehicleId(vehicleId) {
    return this.getAll({ vehicleId })
  },

  /**
   * 사물함 상태 변경
   * @param {string} id - 사물함 ID
   * @param {string} status - 새로운 상태
   * @returns {Promise<{data: Object}>} 업데이트된 사물함
   */
  async updateStatus(id, status) {
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
  },

  /**
   * 온도 업데이트
   * @param {string} id - 사물함 ID
   * @param {number} temperature - 온도
   * @returns {Promise<{data: Object}>} 업데이트된 사물함
   */
  async updateTemperature(id, temperature) {
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
  },

  /**
   * 예약 할당
   * @param {string} id - 사물함 ID
   * @param {string} reservationId - 예약 ID
   * @returns {Promise<{data: Object}>} 업데이트된 사물함
   */
  async assignReservation(id, reservationId) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        currentReservation: reservationId,
        status: 'in-use',
        updatedAt: new Date().toISOString()
      })
      return this.getById(id)
    } catch (error) {
      console.error('lockerService.assignReservation error:', error)
      throw error
    }
  },

  /**
   * 예약 해제
   * @param {string} id - 사물함 ID
   * @returns {Promise<{data: Object}>} 업데이트된 사물함
   */
  async releaseReservation(id) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        currentReservation: null,
        status: 'available',
        updatedAt: new Date().toISOString()
      })
      return this.getById(id)
    } catch (error) {
      console.error('lockerService.releaseReservation error:', error)
      throw error
    }
  },

  /**
   * 사용 가능한 사물함 조회
   * @param {string} size - 사물함 크기 (옵션)
   * @returns {Promise<{data: Array}>} 사용 가능한 사물함 배열
   */
  async getAvailable(size = null) {
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
  },

  /**
   * 실시간 차량별 사물함 리스너
   * @param {string} vehicleId - 차량 ID
   * @param {Function} callback - 데이터 변경 시 호출될 콜백
   * @returns {Function} 리스너 해제 함수
   */
  onVehicleLockers(vehicleId, callback) {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('vehicleId', '==', vehicleId)
      )
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(data)
      })
      return unsubscribe
    } catch (error) {
      console.error('lockerService.onVehicleLockers error:', error)
      return () => {}
    }
  },

  /**
   * 실시간 사물함 상태 변경 리스너
   * @param {string} lockerId - 사물함 ID
   * @param {Function} callback - 데이터 변경 시 호출될 콜백
   * @returns {Function} 리스너 해제 함수
   */
  onLockerStatusChange(lockerId, callback) {
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
