/**
 * 예약 관리 서비스
 *
 * Mock 모드 + Firebase Firestore 이중 지원
 */

import apiClient from './index'
import { API_CONFIG } from '@/config/api.config'
import reservationsData from '@/data/reservations.json'

// Firebase Imports
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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase.config'

const COLLECTION = 'reservations'

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
      // Firebase 모드
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

        // orderBy는 constraint가 없을 때만 쿼리에 포함
        const queryConstraints = constraints.length === 0
          ? [orderBy('createdAt', 'desc')]
          : []

        const q = query(
          collection(db, COLLECTION),
          ...constraints,
          ...queryConstraints
        )
        const snapshot = await getDocs(q)

        // constraint가 있으면 클라이언트에서 정렬
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        if (constraints.length > 0) {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }

        return { data }
      } catch (error) {
        console.error('reservationService.getAll error:', error)
        throw error
      }
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
      // 원본 데이터 복제 후 수정 (불변성 유지)
      reservationsData.reservations = [...reservationsData.reservations, newReservation]
      return mockResponse(newReservation)
    } else {
      try {
        const newReservation = {
          ...data,
          status: 'active',
          createdAt: serverTimestamp(),
          accessCode: String(Math.floor(1000 + Math.random() * 9000)),
        }
        const docRef = await addDoc(collection(db, COLLECTION), newReservation)
        return { data: { id: docRef.id, ...newReservation } }
      } catch (error) {
        console.error('reservationService.create error:', error)
        throw error
      }
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
      // 배열 복제 후 수정 (불변성 유지)
      reservationsData.reservations = [
        ...reservationsData.reservations.slice(0, index),
        updated,
        ...reservationsData.reservations.slice(index + 1)
      ]
      return mockResponse(updated)
    } else {
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
    }
  },

  // 예약 취소
  async cancel(id, reason) {
    if (API_CONFIG.mode === 'mock') {
      const index = reservationsData.reservations.findIndex((r) => r.id === id)
      if (index === -1) {
        return Promise.reject(new Error('예약을 찾을 수 없습니다.'))
      }
      const updated = {
        ...reservationsData.reservations[index],
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: reason
      }
      // 배열 복제 후 수정 (불변성 유지)
      reservationsData.reservations = [
        ...reservationsData.reservations.slice(0, index),
        updated,
        ...reservationsData.reservations.slice(index + 1)
      ]
      return mockResponse(updated)
    } else {
      try {
        const updateData = {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          cancelReason: reason
        }
        await updateDoc(doc(db, COLLECTION, id), updateData)
        const docSnap = await getDoc(doc(db, COLLECTION, id))
        return { data: { id: docSnap.id, ...docSnap.data() } }
      } catch (error) {
        console.error('reservationService.cancel error:', error)
        throw error
      }
    }
  },

  // 예약 완료 처리
  async complete(id) {
    if (API_CONFIG.mode === 'mock') {
      const index = reservationsData.reservations.findIndex((r) => r.id === id)
      if (index === -1) {
        return Promise.reject(new Error('예약을 찾을 수 없습니다.'))
      }
      const updated = {
        ...reservationsData.reservations[index],
        status: 'completed',
        completedAt: new Date().toISOString()
      }
      // 배열 복제 후 수정 (불변성 유지)
      reservationsData.reservations = [
        ...reservationsData.reservations.slice(0, index),
        updated,
        ...reservationsData.reservations.slice(index + 1)
      ]
      return mockResponse(updated)
    } else {
      try {
        const updateData = {
          status: 'completed',
          completedAt: serverTimestamp()
        }
        await updateDoc(doc(db, COLLECTION, id), updateData)
        const docSnap = await getDoc(doc(db, COLLECTION, id))
        return { data: { id: docSnap.id, ...docSnap.data() } }
      } catch (error) {
        console.error('reservationService.complete error:', error)
        throw error
      }
    }
  },

  // 오늘의 예약 조회
  async getToday() {
    if (API_CONFIG.mode === 'mock') {
      const today = new Date().toISOString().split('T')[0]
      const filtered = reservationsData.reservations.filter((r) => r.startTime.startsWith(today))
      return mockResponse(filtered)
    } else {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // where 조건만 사용하고 orderBy는 클라이언트에서 처리
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
    }
  },

  // 활성 예약 조회
  async getActive() {
    if (API_CONFIG.mode === 'mock') {
      const filtered = reservationsData.reservations.filter((r) => r.status === 'active')
      return mockResponse(filtered)
    } else {
      try {
        // where 조건만 사용하고 orderBy는 클라이언트에서 처리
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
    }
  },
}
