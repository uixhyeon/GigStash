/**
 * Firebase 설정
 *
 * Firebase 프로젝트 생성 후 다음 정보를 입력하세요:
 * 1. Firebase Console에서 프로젝트 생성
 * 2. Firestore Database 활성화 (한국 리전 선택)
 * 3. 웹 앱 추가
 * 4. 아래 firebaseConfig 업데이트
 */

// export const firebaseConfig = {
//   apiKey: process.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
//   authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
//   projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
//   storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
//   messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
//   appId: process.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID'
// }

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDZMwpE-vd_Cdknrnb5VN27krjRDwiknkk',
  authDomain: 'gigstash-91197.firebaseapp.com',
  projectId: 'gigstash-91197',
  storageBucket: 'gigstash-91197.firebasestorage.app',
  messagingSenderId: '512678869188',
  appId: '1:512678869188:web:a8e9ea80667d7dbebcb191',
  measurementId: 'G-5ZMJM5CKWH',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)
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

export { db, firebaseConfig }
