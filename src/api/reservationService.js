/**
 * 예약 관리 서비스 (Firebase Firestore)
 *
 * Firebase를 데이터 소스로 사용하는 예약 관리 API
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
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase.config'

const COLLECTION = 'reservations'

export const reservationService = {
  /**
   * 전체 예약 조회
   * @param {Object} params - 필터 파라미터
   * @param {string} params.status - 예약 상태 필터
   * @param {string} params.customerId - 고객 ID 필터
   * @param {string} params.lockerId - 사물함 ID 필터
   * @returns {Promise<{data: Array}>} 예약 배열
   */
  async getAll(params = {}) {
    try {
      const constraints = []

      if (params.status) {
        constraints.push(where('status', '==', params.status))
      }
      if (params.customerId) {
        constraints.push(where('customerId', '==', params.customerId))
      }
      if (params.lockerId) {
        constraints.push(where('lockerId', '==', params.lockerId))
      }

      // Firestore 제한: 여러 constraints가 있으면 orderBy 사용 불가
      const queryConstraints = constraints.length === 0
        ? [orderBy('createdAt', 'desc')]
        : []

      const q = query(
        collection(db, COLLECTION),
        ...constraints,
        ...queryConstraints
      )
      const snapshot = await getDocs(q)

      // constraints가 있으면 클라이언트에서 정렬
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      if (constraints.length > 0) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return { data }
    } catch (error) {
      console.error('reservationService.getAll error:', error)
      throw error
    }
  },

  /**
   * 예약 상세 조회
   * @param {string} id - 예약 ID
   * @returns {Promise<{data: Object}>} 예약 정보
   */
  async getById(id) {
    try {
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      if (!docSnap.exists()) {
        throw new Error('예약을 찾을 수 없습니다.')
      }
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('reservationService.getById error:', error)
      throw error
    }
  },

  /**
   * 예약 생성
   * @param {Object} data - 예약 데이터
   * @returns {Promise<{data: Object}>} 생성된 예약
   */
  async create(data) {
    try {
      const newReservation = {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        accessCode: String(Math.floor(1000 + Math.random() * 9000)),
      }
      const docRef = await addDoc(collection(db, COLLECTION), newReservation)
      return { data: { id: docRef.id, ...newReservation } }
    } catch (error) {
      console.error('reservationService.create error:', error)
      throw error
    }
  },

  /**
   * 예약 수정
   * @param {string} id - 예약 ID
   * @param {Object} data - 수정할 데이터
   * @returns {Promise<{data: Object}>} 수정된 예약
   */
  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(doc(db, COLLECTION, id), updateData)
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('reservationService.update error:', error)
      throw error
    }
  },

  /**
   * 예약 취소
   * @param {string} id - 예약 ID
   * @param {string} reason - 취소 사유
   * @returns {Promise<{data: Object}>} 취소된 예약
   */
  async cancel(id, reason) {
    try {
      const updateData = {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelReason: reason,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(db, COLLECTION, id), updateData)
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('reservationService.cancel error:', error)
      throw error
    }
  },

  /**
   * 예약 완료 처리
   * @param {string} id - 예약 ID
   * @returns {Promise<{data: Object}>} 완료된 예약
   */
  async complete(id) {
    try {
      const updateData = {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(db, COLLECTION, id), updateData)
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('reservationService.complete error:', error)
      throw error
    }
  },

  /**
   * 오늘의 예약 조회
   * @returns {Promise<{data: Array}>} 오늘의 예약 배열
   */
  async getToday() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const q = query(
        collection(db, COLLECTION),
        where('startTime', '>=', today),
        where('startTime', '<', tomorrow)
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // 클라이언트에서 정렬
      data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

      return { data }
    } catch (error) {
      console.error('reservationService.getToday error:', error)
      throw error
    }
  },

  /**
   * 활성 예약 조회
   * @returns {Promise<{data: Array}>} 활성 예약 배열
   */
  async getActive() {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('status', '==', 'active')
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // 클라이언트에서 정렬 (최신순)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return { data }
    } catch (error) {
      console.error('reservationService.getActive error:', error)
      throw error
    }
  },

  /**
   * 실시간 예약 변경 리스너
   * @param {Function} callback - 데이터 변경 시 호출될 콜백
   * @returns {Function} 리스너 해제 함수
   */
  onReservationChange(callback) {
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
      )
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(data)
      })
      return unsubscribe
    } catch (error) {
      console.error('reservationService.onReservationChange error:', error)
      return () => {}
    }
  }
}
