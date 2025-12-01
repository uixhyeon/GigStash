# GigStash 아키텍처 가이드

## 📊 전체 데이터 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                       Vue 컴포넌트 (Pages)                        │
│                   (ReservationView.vue 등)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
         ┌───────────────────────────────────────────┐
         │      Pinia 데이터스토어 (dataStore.js)     │
         │  - reservations: 예약 데이터 배열          │
         │  - customers: 고객 데이터 배열            │
         │  - events: 행사 데이터 배열               │
         └────────────┬────────────────────────────┘
                      │
                      ↓
    ┌─────────────────────────────────────────┐
    │  API 서비스 계층 (src/api/)              │
    │  ┌─────────────────────────────────────┐│
    │  │ reservationService.getAll()         ││
    │  │ customerService.getAll()            ││
    │  │ lockerService.getAll()              ││
    │  └──────┬──────────────────────────────┘│
    │         │                                │
    │         ↓ API_CONFIG.mode 체크          │
    │   ┌─────────────────┐                   │
    │   │ 'mock' 모드     │  'firebase' 모드 │
    │   └─────────────────┘                   │
    └─────────────────────────────────────────┘
         │                          │
         ↓                          ↓
  ┌────────────────┐        ┌──────────────────┐
  │ src/data/      │        │  Firebase SDK    │
  │ *.json 파일    │        │  (Firestore)     │
  │                │        │                  │
  │ lockers.json   │        │ ┌──────────────┐ │
  │ customers.json │        │ │ Firestore DB │ │
  │ reservations   │        │ │              │ │
  │ .json          │        │ │ collections: │ │
  │ events.json    │        │ │ - lockers    │ │
  └────────────────┘        │ │ - customers  │ │
                            │ │ - reserv..  │ │
                            │ │ - events    │ │
                            │ └──────────────┘ │
                            └──────────────────┘
```

---

## 🔧 폴더 구조 설명

### 1️⃣ **src/config/** - 설정 파일들

#### `firebase.config.js` (Firebase 초기화)
```javascript
// Firebase 자격증명 로드 (.env에서)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... 등
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firestore 인스턴스 생성 (중요!)
export const db = getFirestore(app)

// 컬렉션 이름 정의
export const FIRESTORE_COLLECTIONS = {
  LOCKERS: 'lockers',
  CUSTOMERS: 'customers',
  RESERVATIONS: 'reservations',
  EVENTS: 'events'
}
```

**역할:** Firebase를 초기화하고 `db` 객체 생성 (다른 서비스에서 사용)

---

#### `api.config.js` (API 모드 설정)
```javascript
export const API_CONFIG = {
  mode: 'firebase',  // 또는 'mock'
  baseURL: 'http://localhost:3000/api',
  mockDelay: 500
}

// 개발 도구 - 콘솔에서 모드 전환
window.__TOGGLE_API_MODE__()
```

**역할:** Mock 데이터 vs Firebase 중 어느 것을 사용할지 결정

---

### 2️⃣ **src/api/** - API 서비스 계층

#### `reservationService.js` 구조 (예시)

```javascript
import { API_CONFIG } from '@/config/api.config'
import { db } from '@/config/firebase.config'
import reservationsData from '@/data/reservations.json'

export const reservationService = {
  async getAll(params = {}) {
    if (API_CONFIG.mode === 'mock') {
      // ===== 모드 1: 로컬 JSON 사용 =====
      let filtered = [...reservationsData.reservations]

      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status)
      }

      // 메모리에서 정렬
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      // 지연 시뮬레이션
      return mockResponse(filtered)  // 500ms 대기

    } else {
      // ===== 모드 2: Firebase Firestore 사용 =====
      try {
        // Firestore 쿼리 구성
        const constraints = []
        if (params.status) {
          constraints.push(where('status', '==', params.status))
        }

        // 쿼리 실행 (서버에서 필터링)
        const q = query(
          collection(db, 'reservations'),  // db는 firebase.config.js에서 가져옴
          ...constraints
        )
        const snapshot = await getDocs(q)

        // 결과 변환
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))

        // 클라이언트에서 정렬
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        return { data }

      } catch (error) {
        console.error('Firebase 오류:', error)
        throw error
      }
    }
  }
}
```

---

### 3️⃣ **src/data/** - 로컬 JSON 데이터 (Mock 모드용)

```
src/data/
├── lockers.json        (1000개 사물함)
├── customers.json      (15개 고객)
├── reservations.json   (147개 예약)
├── events.json         (48개 행사)
└── vehicles.json       (20개 차량)
```

**역할:** API_CONFIG.mode === 'mock' 일 때 사용되는 데이터

---

### 4️⃣ **Pinia 데이터스토어** (src/stores/dataStore.js)

```javascript
export const useDataStore = defineStore('data', () => {
  // 상태 (데이터 저장소)
  const reservationMap = ref(new Map())  // id -> 예약 객체
  const customerMap = ref(new Map())     // id -> 고객 객체

  // 계산 속성 (실시간 조회)
  const reservations = computed(() => {
    return reservationIds.value.map(id => reservationMap.value.get(id))
  })

  // 액션 (데이터 변경)
  const setReservations = (reservations) => {
    reservationMap.value.clear()
    reservations.forEach(r => reservationMap.value.set(r.id, r))
  }

  return { reservations, setReservations, ... }
})
```

**역할:** 앱 전체에서 공유되는 데이터 저장소

---

### 5️⃣ **.env** - 환경 변수

```env
# Firebase 자격증명
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=gigstash-91197
VITE_FIREBASE_AUTH_DOMAIN=...

# API 설정
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_MODE=firebase  # 'firebase' 또는 'mock'
```

**역할:** 보안 정보와 설정값을 환경변수로 관리

---

## 🔄 데이터 흐름 상세 예시

### 예약관리 페이지 로드 시

```
1️⃣ App.vue의 onMounted() 실행
   ↓
2️⃣ reservationService.getAll() 호출
   ↓
3️⃣ API_CONFIG.mode 체크
   │
   ├─ 'mock' → JSON 파일에서 읽기
   │
   └─ 'firebase' → Firebase Firestore에서 쿼리
                    (import.meta.env.VITE_FIREBASE_* 사용)
   ↓
4️⃣ dataStore.setReservations(data) 저장
   ↓
5️⃣ ReservationView.vue 에서 computed로 데이터 읽기
   ↓
6️⃣ 테이블에 렌더링
```

---

## 🎯 Firebase는 API인가?

**YES, Firebase는 일종의 "Backend-as-a-Service (BaaS)" API입니다.**

```
                        Traditional REST API
    ┌─────────────────────────────────────┐
    │  우리 서버                          │
    │  POST /api/reservations            │
    │  GET /api/customers                │
    └─────────────────────────────────────┘

                        Firebase (Google 제공)
    ┌─────────────────────────────────────┐
    │  Firebase Firestore                │
    │  - 데이터베이스 역할                │
    │  - 인증 역할                       │
    │  - 실시간 동기화                   │
    │  - 자동 확장                       │
    └─────────────────────────────────────┘
```

**차이점:**
- **REST API**: 우리가 구축한 백엔드 서버
- **Firebase**: Google이 제공하는 클라우드 데이터베이스 서비스

우리 코드에서는 Firebase SDK를 직접 사용하여 Firebase와 통신합니다.

---

## 💾 데이터 저장 구조

### Mock 모드 (로컬 JSON)
```
메모리에만 존재 (페이지 새로고침 시 초기 상태로 리셋)
└─ src/data/lockers.json
└─ src/data/customers.json
└─ src/data/reservations.json
```

### Firebase 모드 (클라우드)
```
Google Firebase 서버에 영구 저장
└─ Firestore Database
   ├─ lockers (컬렉션)
   │  └─ VEH-001-S01 (문서) → { id, vehicleId, size, status, ... }
   │  └─ VEH-001-S02
   │  └─ ... 998개 더
   ├─ customers (컬렉션)
   ├─ reservations (컬렉션)
   └─ events (컬렉션)
```

---

## 🔌 연결 구조 다이어그램

```
.env 파일
├─ VITE_FIREBASE_API_KEY ────┐
├─ VITE_FIREBASE_PROJECT_ID──┼──→ firebase.config.js
├─ VITE_FIREBASE_AUTH_DOMAIN─┤   │
└─ ...                        │   → const db = getFirestore(app)
                              │
                              └──→ api 서비스들
                                  ├─ reservationService
                                  ├─ customerService
                                  └─ lockerService

                                  각 서비스에서:
                                  ```
                                  if (API_CONFIG.mode === 'firebase') {
                                    const q = query(collection(db, ...))
                                    //          ↑ firebase.config.js에서 가져온 db
                                  }
                                  ```
```

---

## 🎓 Mock vs Firebase 전환 방법

### 방법 1: 코드에서 변경
```javascript
// src/config/api.config.js
export const API_CONFIG = {
  mode: 'firebase',  // ← 변경: 'mock'이면 로컬 JSON 사용
}
```

### 방법 2: 브라우저 콘솔에서 실시간 전환
```javascript
// 브라우저 콘솔
window.__TOGGLE_API_MODE__()  // mock ↔ firebase 전환

// 현재 설정 확인
window.__GIGSTASH_API_CONFIG__
```

---

## ✅ 요약

| 요소 | 역할 | 위치 |
|------|------|------|
| **.env** | Firebase 자격증명 저장 | 프로젝트 루트 |
| **firebase.config.js** | Firebase 초기화, db 객체 생성 | src/config/ |
| **api.config.js** | Mock vs Firebase 모드 선택 | src/config/ |
| **reservationService** | API 호출 (Mock/Firebase 둘 다 지원) | src/api/ |
| **dataStore.js** | 데이터 저장소 (전앱 공유) | src/stores/ |
| **JSON 파일들** | Mock 모드 데이터 | src/data/ |
| **Firestore** | Firebase 데이터베이스 (클라우드) | Google 서버 |

---

## 🚀 실행 흐름 (완전한 예시)

### Mock 모드
```
1. App.vue 로드 → onMounted()
2. reservationService.getAll() 호출
3. API_CONFIG.mode === 'mock' 확인
4. ✓ lockers.json 메모리로 로드
5. ✓ 필터링 & 정렬 (JavaScript에서)
6. ✓ mockResponse(filtered) → 500ms 대기
7. ✓ dataStore.setReservations(data)
8. ✓ ReservationView.vue에서 출력
```

### Firebase 모드
```
1. App.vue 로드 → onMounted()
2. reservationService.getAll() 호출
3. API_CONFIG.mode === 'firebase' 확인
4. ✓ .env의 VITE_FIREBASE_API_KEY 로드
5. ✓ firebase.config.js 설정으로 db 객체 준비
6. ✓ Firestore 쿼리 실행 (Google 서버)
7. ✓ 결과를 메모리로 로드
8. ✓ 클라이언트에서 정렬
9. ✓ dataStore.setReservations(data)
10. ✓ ReservationView.vue에서 출력
```

이 구조를 이해하면 전체 데이터 흐름이 명확해집니다!
