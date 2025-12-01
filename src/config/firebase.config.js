/**
 * Firebase 설정
 *
 * Firebase 프로젝트 생성 후 다음 정보를 입력하세요:
 * 1. Firebase Console에서 프로젝트 생성
 * 2. Firestore Database 활성화 (한국 리전 선택)
 * 3. 웹 앱 추가
 * 4. 아래 firebaseConfig 업데이트
 */

// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app'
// import { getFirestore } from 'firebase/firestore'

// export const firebaseConfig = {
//   apiKey: process.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
//   authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
//   projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
//   storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
//   messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
//   appId: process.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
// }
// const app = initializeApp(firebaseConfig)
// export const db = getFirestore(app)
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase 초기화는 export 전에 딱 1번
const app = initializeApp(firebaseConfig)

// Firestore 인스턴스 export
export const db = getFirestore(app)

/**
 * Firestore 컬렉션 구조
 *
 * lockers/
 *   ├─ {lockerId}/
 *   │  ├─ id: "L001-S001"
 *   │  ├─ vehicleId: "VEH-001"
 *   │  ├─ size: "small"
 *   │  ├─ status: "available" | "in-use" | "maintenance" | "broken"
 *   │  ├─ position: "front-left"
 *   │  ├─ temperature: 4.2
 *   │  ├─ features: ["냉장", "RFID"]
 *   │  ├─ currentReservation: "RES2501100001" | null
 *   │  └─ lastMaintenance: timestamp
 *
 * vehicles/
 *   ├─ {vehicleId}/
 *   │  ├─ id: "VEH-001"
 *   │  ├─ eventId: "EVT251101001"
 *   │  ├─ vehicleType: "버스"
 *   │  ├─ capacity: 50
 *   │  ├─ plateNumber: "서울12가1234"
 *   │  ├─ driver: "김운전"
 *   │  ├─ status: "완료"
 *   │  ├─ lockerCapacity: 50
 *   │  └─ filledLockers: 25
 *
 * reservations/
 *   ├─ {reservationId}/
 *   │  ├─ id: "RES2501100001"
 *   │  ├─ eventId: "EVT251101001"
 *   │  ├─ customerId: "C001"
 *   │  ├─ lockerId: "L001-S001"
 *   │  ├─ status: "active" | "completed" | "cancelled"
 *   │  ├─ startTime: timestamp
 *   │  ├─ endTime: timestamp
 *   │  └─ createdAt: timestamp
 *
 * alerts/
 *   ├─ {alertId}/
 *   │  ├─ id: "ALR001"
 *   │  ├─ eventId: "EVT251101001"
 *   │  ├─ vehicleId: "VEH-001"
 *   │  ├─ type: "locker_full" | "low_temperature" | "maintenance_needed"
 *   │  ├─ severity: "high" | "medium" | "low"
 *   │  ├─ message: "사물함이 가득 찼습니다"
 *   │  ├─ read: false
 *   │  └─ createdAt: timestamp
 */

export const FIRESTORE_COLLECTIONS = {
  LOCKERS: 'lockers',
  VEHICLES: 'vehicles',
  RESERVATIONS: 'reservations',
  ALERTS: 'alerts',
  CUSTOMERS: 'customers',
  EVENTS: 'events',
}

// export { db, firebaseConfig }
