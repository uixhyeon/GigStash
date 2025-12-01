/**
 * 고객 관리 서비스 (Firebase Firestore)
 *
 * Firebase를 데이터 소스로 사용하는 고객 관리 API
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

const COLLECTION = 'customers'

export const customerService = {
  /**
   * 전체 고객 조회
   * @param {Object} params - 필터 파라미터
   * @param {string} params.membershipLevel - 멤버십 레벨 필터
   * @param {string} params.search - 검색어 (이름, 이메일, 전화번호)
   * @returns {Promise<{data: Array}>} 고객 배열
   */
  async getAll(params = {}) {
    try {
      const constraints = []

      if (params.membershipLevel) {
        constraints.push(where('membershipLevel', '==', params.membershipLevel))
      }

      const q = query(collection(db, COLLECTION), ...constraints)
      const snapshot = await getDocs(q)

      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // 검색어 필터링 (클라이언트에서 수행)
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        data = data.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.phone.includes(params.search) ||
            c.email.toLowerCase().includes(searchLower)
        )
      }

      // 정렬 (최근 가입순)
      data.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))

      return { data }
    } catch (error) {
      console.error('customerService.getAll error:', error)
      throw error
    }
  },

  /**
   * 고객 상세 조회
   * @param {string} id - 고객 ID
   * @returns {Promise<{data: Object}>} 고객 정보
   */
  async getById(id) {
    try {
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      if (!docSnap.exists()) {
        throw new Error('고객을 찾을 수 없습니다.')
      }
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('customerService.getById error:', error)
      throw error
    }
  },

  /**
   * 고객 생성
   * @param {Object} data - 고객 데이터
   * @returns {Promise<{data: Object}>} 생성된 고객
   */
  async create(data) {
    try {
      const newCustomer = {
        ...data,
        membershipLevel: data.membershipLevel || 'bronze',
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalReservations: 0,
        activeReservations: 0,
        lastReservation: null
      }
      const docRef = await addDoc(collection(db, COLLECTION), newCustomer)
      return { data: { id: docRef.id, ...newCustomer } }
    } catch (error) {
      console.error('customerService.create error:', error)
      throw error
    }
  },

  /**
   * 고객 정보 수정
   * @param {string} id - 고객 ID
   * @param {Object} data - 수정할 데이터
   * @returns {Promise<{data: Object}>} 수정된 고객
   */
  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(db, COLLECTION, id), updateData)
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('customerService.update error:', error)
      throw error
    }
  },

  /**
   * 고객 삭제
   * @param {string} id - 고객 ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        status: 'deleted',
        deletedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('customerService.delete error:', error)
      throw error
    }
  },

  /**
   * 전화번호로 고객 조회
   * @param {string} phone - 전화번호
   * @returns {Promise<{data: Object}>} 고객 정보
   */
  async getByPhone(phone) {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('phone', '==', phone)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        throw new Error('고객을 찾을 수 없습니다.')
      }

      const doc = snapshot.docs[0]
      return { data: { id: doc.id, ...doc.data() } }
    } catch (error) {
      console.error('customerService.getByPhone error:', error)
      throw error
    }
  },

  /**
   * 멤버십 레벨 업데이트
   * @param {string} id - 고객 ID
   * @param {string} level - 멤버십 레벨
   * @returns {Promise<{data: Object}>} 수정된 고객
   */
  async updateMembershipLevel(id, level) {
    try {
      const updateData = {
        membershipLevel: level,
        updatedAt: serverTimestamp()
      }
      await updateDoc(doc(db, COLLECTION, id), updateData)
      const docSnap = await getDoc(doc(db, COLLECTION, id))
      return { data: { id: docSnap.id, ...docSnap.data() } }
    } catch (error) {
      console.error('customerService.updateMembershipLevel error:', error)
      throw error
    }
  },

  /**
   * 실시간 고객 변경 리스너
   * @param {Function} callback - 데이터 변경 시 호출될 콜백
   * @returns {Function} 리스너 해제 함수
   */
  onCustomerChange(callback) {
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('registeredAt', 'desc')
      )
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        callback(data)
      })
      return unsubscribe
    } catch (error) {
      console.error('customerService.onCustomerChange error:', error)
      return () => {}
    }
  }
}
