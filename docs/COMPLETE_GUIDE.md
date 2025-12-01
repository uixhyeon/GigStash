# GigStash 완전 가이드 - 처음부터 끝까지

## 📚 Part 1: 전체 구조 정리

### 🎯 핵심: 3가지 폴더와 그들의 역할

```
프로젝트 구조 (3개 핵심 폴더):

1️⃣ src/config/     ← 설정 폴더 (Firebase, API 모드)
2️⃣ src/api/        ← 데이터 조회 폴더 (Mock vs Firebase 결정)
3️⃣ src/data/       ← 테스트 데이터 폴더 (Mock 모드용)

+ .env 파일         ← Firebase 자격증명 저장 (보안)
```

---

## 🔍 Part 2: 각 요소 상세 분석

### 1️⃣ .env 파일 (Firebase 자격증명)

```env
# Firebase 자격증명 - Google에서 제공
VITE_FIREBASE_API_KEY=AIzaSyDZMwpE-vd_Cdknrnb5VN27krjRDwiknkk
VITE_FIREBASE_PROJECT_ID=gigstash-91197
VITE_FIREBASE_AUTH_DOMAIN=gigstash-91197.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=gigstash-91197.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=512678869188
VITE_FIREBASE_APP_ID=1:512678869188:web:a8e9ea80667d7dbebcb191
```

**이게 뭐냐:**
- Firebase 프로젝트의 "집 주소" 같은 것
- 우리 앱이 Google Firebase 서버를 찾아가기 위한 정보
- **보안**: Git에 커밋하면 안 됨 (누구나 우리 데이터에 접근 가능)

**실제 동작:**
```javascript
// firebase.config.js에서
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY  // ← .env에서 값 읽음
  //      ↑ Vite 문법 (import.meta.env)
}
```

---

### 2️⃣ src/config/firebase.config.js (Firebase 초기화)

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... 더 많은 설정
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firestore 데이터베이스 인스턴스 생성 (중요!)
export const db = getFirestore(app)

// 컬렉션 이름들
export const FIRESTORE_COLLECTIONS = {
  LOCKERS: 'lockers',        // 1000개 사물함
  CUSTOMERS: 'customers',    // 15개 고객
  RESERVATIONS: 'reservations', // 147개 예약
  EVENTS: 'events',          // 48개 행사
  VEHICLES: 'vehicles'       // 20개 차량
}
```

**이게 뭐냐:**
- `.env`의 자격증명으로 Firebase 앱 초기화
- **`db` 객체 생성** (가장 중요!)
- 이 `db`를 다른 파일들이 import해서 사용

**핵심:**
```javascript
// 다른 파일에서 사용
import { db } from '@/config/firebase.config'

const snapshot = await getDocs(query(collection(db, 'reservations')))
//                                                  ↑ 이 db가 바로 firebase.config.js에서 생성한 것!
```

---

### 3️⃣ src/config/api.config.js (모드 선택)

```javascript
import { reactive } from 'vue'

export const API_CONFIG = reactive({
  mode: 'firebase',  // ← 'mock' 또는 'firebase' (중요!)
  baseURL: 'http://localhost:3000/api',
  mockDelay: 500
})

// 개발 도구: 콘솔에서 즉시 전환
export const toggleApiMode = () => {
  API_CONFIG.mode = API_CONFIG.mode === 'mock' ? 'firebase' : 'mock'
  console.log(`🔄 API Mode switched to: ${API_CONFIG.mode}`)
}

// DevTools에 노출
if (import.meta.env.DEV) {
  window.__TOGGLE_API_MODE__ = toggleApiMode
  window.__GIGSTASH_API_CONFIG__ = API_CONFIG
}
```

**이게 뭐냐:**
- "로컬 JSON 쓸까? Firebase 쓸까?" 결정
- `reactive` = Vue에서 실시간으로 변경 감시

**사용 예:**
```javascript
if (API_CONFIG.mode === 'mock') {
  // 로컬 JSON 사용
} else {
  // Firebase 사용
}
```

---

### 4️⃣ src/api/ 폴더 (API 서비스 계층)

예: `reservationService.js`

```javascript
import { API_CONFIG } from '@/config/api.config'
import { db } from '@/config/firebase.config'
import reservationsData from '@/data/reservations.json'

export const reservationService = {
  async getAll(params = {}) {
    // ========== 모드 1: Mock (로컬 JSON) ==========
    if (API_CONFIG.mode === 'mock') {
      let filtered = [...reservationsData.reservations]

      // JavaScript로 필터링
      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status)
      }

      // JavaScript로 정렬
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      // 500ms 대기 (마치 네트워크 요청처럼)
      return mockResponse(filtered)

    // ========== 모드 2: Firebase ==========
    } else {
      try {
        // firebase.config.js에서 가져온 db 사용
        const constraints = []

        if (params.status) {
          constraints.push(where('status', '==', params.status))
        }

        // Firestore 쿼리 구성
        const q = query(
          collection(db, 'reservations'),  // ← db는 firebase.config.js에서 온 것
          ...constraints
        )

        // Firebase 서버로 쿼리 실행 (자동으로 Google 서버에 HTTP 요청)
        const snapshot = await getDocs(q)

        // 결과를 JavaScript 객체로 변환
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

**흐름:**
```
API_CONFIG.mode 체크
    ↓
'mock' → JSON 메모리 로드 → JavaScript 필터링/정렬
    ↓
'firebase' → Firebase 쿼리 → Google 서버 요청 → 응답 받기
```

---

### 5️⃣ src/data/ 폴더 (Mock 테스트 데이터)

```
src/data/
├── lockers.json (1000개)
├── customers.json (15개)
├── reservations.json (147개)
├── events.json (48개)
└── vehicles.json (20개)
```

**이게 뭐냐:**
- Mock 모드에서만 사용
- JSON 파일 형식
- 메모리로 로드 (매우 빠름)

**예시:**
```json
// lockers.json
{
  "lockers": [
    {
      "id": "VEH-001-S01",
      "vehicleId": "VEH-001",
      "size": "small",
      "status": "available",
      "temperature": 4.2
    },
    // ... 999개 더
  ]
}
```

---

### 6️⃣ src/stores/dataStore.js (전체 앱 데이터 저장소)

```javascript
export const useDataStore = defineStore('data', () => {
  // 상태
  const reservationMap = ref(new Map())
  const customerMap = ref(new Map())
  const eventMap = ref(new Map())

  const reservationIds = ref([])
  const customerIds = ref([])
  const eventIds = ref([])

  // 계산 속성 (배열로 반환)
  const reservations = computed(() => {
    return reservationIds.value.map(id => reservationMap.value.get(id))
  })

  const customers = computed(() => {
    return customerIds.value.map(id => customerMap.value.get(id))
  })

  // 액션 (데이터 저장)
  const setReservations = (reservations) => {
    reservationMap.value.clear()
    reservationIds.value = []

    reservations.forEach(reservation => {
      reservationMap.value.set(reservation.id, { ...reservation })
      reservationIds.value.push(reservation.id)
    })
  }

  const setCustomers = (customers) => {
    // ... 비슷한 로직
  }

  return {
    reservations,
    customers,
    events,
    setReservations,
    setCustomers,
    setEvents,
    // ... 더 많은 메서드
  }
})
```

**이게 뭐냐:**
- 전체 앱이 공유하는 "데이터 저장소"
- API 서비스에서 데이터를 여기에 저장
- Vue 컴포넌트에서 여기서 데이터를 읽음

**사용:**
```javascript
// Vue 컴포넌트에서
const dataStore = useDataStore()

// 예약 목록 읽기
const reservations = computed(() => dataStore.reservations)

// 또는 직접 접근
{{ dataStore.reservations }}
```

---

### 7️⃣ App.vue (초기화 진입점)

```javascript
import { onMounted } from 'vue'
import { useDataStore } from './stores/dataStore'
import { reservationService } from './api/reservationService'
import { customerService } from './api/customerService'
import eventsData from './data/events.json'

const dataStore = useDataStore()

const normalizeReservations = (reservations, events) => {
  // 행사 상태에 따라 예약 상태 자동 변경
  return reservations.map(reservation => {
    const event = events.find(e => e.id === reservation.eventId)

    if (event?.status === '취소' && reservation.status !== 'cancelled') {
      return { ...reservation, status: 'cancelled' }
    }

    if (event?.status === '종료' && !['completed', 'cancelled'].includes(reservation.status)) {
      return { ...reservation, status: 'completed' }
    }

    return reservation
  })
}

// 앱 시작 시 데이터 로드 (한 번만)
onMounted(async () => {
  try {
    // 예약, 고객 데이터 동시 조회
    const [reservationsRes, customersRes] = await Promise.all([
      reservationService.getAll(),      // ← API_CONFIG.mode에 따라 Mock 또는 Firebase
      customerService.getAll()          // ← API_CONFIG.mode에 따라 Mock 또는 Firebase
    ])

    // 행사 데이터 (항상 로컬 JSON)
    const events = eventsData.events

    // 예약 데이터 정규화
    const normalizedReservations = normalizeReservations(reservationsRes.data, events)

    // 데이터스토어에 저장 (전체 앱에서 접근 가능)
    dataStore.setReservations(normalizedReservations)
    dataStore.setCustomers(customersRes.data)
    dataStore.setEvents(events)

  } catch (err) {
    console.error('Failed to load initial data:', err)
    dataStore.setError(err)
  }
})
```

**흐름:**
```
App 시작
  ↓
onMounted() 실행
  ↓
reservationService.getAll() 호출
  ↓
API_CONFIG.mode 체크
  ├─ 'mock' → src/data/reservations.json 로드
  └─ 'firebase' → Firebase 서버에서 조회
  ↓
결과를 dataStore에 저장
  ↓
전체 앱에서 dataStore 접근 가능
```

---

## 📊 Part 3: 데이터 흐름 완전 이해

### 시나리오: 사용자가 "예약관리" 페이지 클릭

#### 🟢 Mock 모드 흐름:
```
1. ReservationView.vue 렌더링
2. dataStore.reservations 필요
3. 비어있음 → App.vue의 onMounted() 실행
4. reservationService.getAll() 호출
5. API_CONFIG.mode === 'mock' 체크 ✓
6. src/data/reservations.json 파일 읽음
7. 메모리에 로드 (매우 빠름)
8. JavaScript로 필터링/정렬
9. mockResponse() → 500ms 지연 시뮬레이션
10. dataStore.setReservations(data)
11. ReservationView.vue 자동 리렌더링
12. 테이블에 147개 예약 표시 ✓
```

**소요 시간:** ~600ms

---

#### 🔵 Firebase 모드 흐름:
```
1. ReservationView.vue 렌더링
2. dataStore.reservations 필요
3. 비어있음 → App.vue의 onMounted() 실행
4. reservationService.getAll() 호출
5. API_CONFIG.mode === 'firebase' 체크 ✓
6. .env 파일에서 Firebase 자격증명 읽음
   ├─ VITE_FIREBASE_API_KEY
   ├─ VITE_FIREBASE_PROJECT_ID
   └─ ...
7. firebase.config.js 설정으로 db 객체 준비
8. Firestore 쿼리 구성:
   const q = query(collection(db, 'reservations'))
9. getDocs(q) 실행
10. 🌐 Google Firebase 서버로 HTTP 요청 (자동)
    POST https://firestore.googleapis.com/v1/projects/gigstash-91197/databases/(default)/documents/reservations
11. Google 서버에서 쿼리 실행 (Firestore DB)
12. 응답 받기 (JSON 형식)
13. 결과를 JavaScript 객체로 변환
14. JavaScript로 필터링/정렬 (필요시)
15. dataStore.setReservations(data)
16. ReservationView.vue 자동 리렌더링
17. 테이블에 147개 예약 표시 ✓
```

**소요 시간:** ~1000-2000ms (네트워크 지연 포함)

---

## 🎓 Part 4: 모드 전환

### 전환 방법 1: 코드에서

```javascript
// src/config/api.config.js
export const API_CONFIG = reactive({
  mode: 'firebase',  // ← 'mock' 또는 'firebase' 변경
})
```

변경 후 앱 새로고침 필요

---

### 전환 방법 2: 콘솔에서 (권장 - 즉시 반영)

```javascript
// 브라우저 DevTools 열기: F12 또는 Ctrl+Shift+I
// Console 탭에서:

window.__TOGGLE_API_MODE__()  // 즉시 전환! (mock ↔ firebase)

// 확인:
window.__GIGSTASH_API_CONFIG__.mode  // 현재 모드 확인
```

변경 후 페이지 새로고침하면 새 모드로 데이터 로드

---

## 💾 Part 5: 데이터 저장 위치

### Mock 모드 (로컬)
```
메모리 (RAM)
  └─ 프로세스 종료 시 사라짐
  └─ 새로고침하면 src/data/*.json에서 다시 로드
```

### Firebase 모드 (클라우드)
```
Google Firebase 서버
  ├─ Firestore Database
  │  ├─ lockers (1000개 문서)
  │  ├─ customers (15개 문서)
  │  ├─ reservations (147개 문서)
  │  ├─ events (48개 문서)
  │  └─ vehicles (20개 문서)
  │
  └─ 영구 저장 (서버에 영원히 저장됨)
```

---

## ⚡ Part 6: Firebase vs REST API

### 일반적인 REST API 구조
```
우리 앱 (Vue.js)
  ↓ HTTP 요청
우리 서버 (Node.js/Python/Java 등)
  ↓ SQL 쿼리
데이터베이스 (MySQL/PostgreSQL 등)
  ↓ 응답
우리 앱에 데이터 반환
```

**장점:** 완전히 커스터마이징 가능
**단점:** 서버를 직접 구축하고 관리해야 함

---

### Firebase 구조 (우리가 사용 중)
```
우리 앱 (Vue.js)
  ↓ Firebase SDK
Google Firebase 서버 (모든 기능 포함)
  ├─ 데이터베이스 (Firestore)
  ├─ 인증 (Authentication)
  ├─ 스토리지 (Cloud Storage)
  ├─ 호스팅 (Hosting)
  └─ ...
  ↓ 응답
우리 앱에 데이터 반환
```

**장점:** 서버 구축 불필요, 즉시 사용 가능
**단점:** Firebase의 제한 사항만 사용 가능

---

## 🔐 Part 7: 보안 주의사항

### ✅ 안전한 방법 (현재)
```
.env 파일 (로컬)
  → .gitignore에 등록 (Git 커밋 안 함)
  → 비밀유지 ✓
```

### ❌ 위험한 방법
```javascript
// 절대 하지 말 것!
const firebaseConfig = {
  apiKey: 'AIzaSyDZMwpE-vd_Cdknrnb5VN27krjRDwiknkk',  // ← 그냥 코드에 쓰면 안 됨!
  projectId: 'gigstash-91197',  // ← 누구나 Git에서 볼 수 있음
}
```

---

## ✨ Part 8: 요약 표

| 요소 | 파일 | 역할 |
|------|------|------|
| **자격증명** | `.env` | Firebase 프로젝트 찾기 |
| **초기화** | `firebase.config.js` | Firebase 앱 생성, db 객체 생성 |
| **모드 선택** | `api.config.js` | Mock vs Firebase 결정 |
| **데이터 조회** | `reservationService.js` 등 | Mode에 따라 다른 소스에서 조회 |
| **데이터 저장소** | `dataStore.js` | 전체 앱이 공유 |
| **테스트 데이터** | `src/data/*.json` | Mock 모드용 |
| **초기화** | `App.vue` | 앱 시작 시 데이터 로드 |

---

이제 다음 섹션에서 **CORS**를 설명하겠습니다!
