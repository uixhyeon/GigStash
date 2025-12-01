/**
 * Firebase 초기화 및 기본 설정
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { firebaseConfig } from '@/config/firebase.config'

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firestore 초기화
export const db = getFirestore(app)

// Firebase Auth 초기화
export const auth = getAuth(app)

// 개발 환경에서 Emulator 사용 (선택사항)
if (process.env.NODE_ENV === 'development' && !window.__FIREBASE_EMULATOR_CONNECTED__) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectAuthEmulator(auth, 'http://localhost:9099')
    window.__FIREBASE_EMULATOR_CONNECTED__ = true
  } catch (e) {
    // Emulator가 실행 중이지 않으면 무시
    console.log('Firebase Emulator not running. Using production database.')
  }
}

export default app
