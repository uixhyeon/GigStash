# App.vue와 Stores 폴더 - 완전 가이드

## 📋 목차
1. 파일 구조 및 역할
2. 데이터 흐름
3. App.vue의 역할
4. stores/dataStore.js의 역할
5. stores/auth.js의 역할
6. Vue의 Composition API 이해
7. 실제 데이터 이동 과정
8. 전체 애플리케이션 생명주기

---

## 📁 Part 1: 파일 구조 및 역할

### 전체 구조

```
src/
├── main.js                  ← 앱의 진짜 시작점
├── App.vue                  ← 모든 컴포넌트의 부모
│
├── config/
│   ├── firebase.config.js   ← Firebase 초기화
│   └── api.config.js        ← API 모드 선택
│
├── api/
│   ├── reservationService.js
│   ├── customerService.js
│   └── lockerService.js
│
├── stores/
│   ├── auth.js              ← 인증 상태 저장소
│   └── dataStore.js         ← 데이터 저장소
│
├── router/
│   └── index.js             ← 라우팅 설정
│
├── layouts/
│   ├── AdminLayout.vue      ← 관리자 레이아웃
│   └── workerLayout.vue     ← 근로자 레이아웃
│
├── pages/
│   ├── admin/
│   │   ├── AdminMain.vue
│   │   ├── ReservationView.vue
│   │   └── ...
│   └── worker/
│       └── ...
│
└── data/
    ├── lockers.json
    ├── reservations.json
    └── ...
```

---

## 🎯 Part 2: 각 파일의 역할 (상세)

### main.js - 앱의 진짜 시작점

```javascript
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'  // ← Pinia 상태 관리
import App from './App.vue'          // ← 최상위 컴포넌트
import router from './router'        // ← 라우팅

const app = createApp(App)

// Pinia 플러그인 추가
app.use(createPinia())  // ← 이게 있어야 useDataStore() 등을 쓸 수 있음

// 라우터 추가
app.use(router)

// 마운트
app.mount('#app')  // ← index.html의 <div id="app"></div>에 마운트
```

**흐름:**
```
1. main.js 실행
2. Vue 앱 생성
3. Pinia 추가 (상태 관리)
4. 라우터 추가 (페이지 이동)
5. App.vue를 #app div에 마운트
6. App.vue의 onMounted() 실행
7. 전체 앱 시작!
```

---

### App.vue - 모든 것의 부모

```vue
<script setup>
import { onMounted } from 'vue'
import { useDataStore } from './stores/dataStore'  // ← 중요!
import { reservationService } from './api/reservationService'
import { customerService } from './api/customerService'
import eventsData from './data/events.json'

// 데이터스토어 가져오기
const dataStore = useDataStore()

// 예약 정규화 함수
const normalizeReservations = (reservations, events) => {
  // 행사 상태에 따라 예약 상태 변경
  return reservations.map(reservation => {
    const event = events.find(e => e.id === reservation.eventId)
    if (event?.status === '취소') {
      return { ...reservation, status: 'cancelled' }
    }
    if (event?.status === '종료') {
      return { ...reservation, status: 'completed' }
    }
    return reservation
  })
}

// 앱 시작 시 데이터 로드
onMounted(async () => {
  try {
    // 1️⃣ API에서 데이터 가져오기
    //    (Mock 또는 Firebase 중 선택)
    const [reservationsRes, customersRes] = await Promise.all([
      reservationService.getAll(),    // ← API 호출
      customerService.getAll()        // ← API 호출
    ])

    // 2️⃣ 행사 데이터 (항상 로컬)
    const events = eventsData.events

    // 3️⃣ 데이터 정규화
    const normalizedReservations = normalizeReservations(
      reservationsRes.data,
      events
    )

    // 4️⃣ 데이터스토어에 저장!
    //    이제 모든 컴포넌트에서 이 데이터에 접근 가능
    dataStore.setReservations(normalizedReservations)
    dataStore.setCustomers(customersRes.data)
    dataStore.setEvents(events)

  } catch (err) {
    console.error('Failed to load initial data:', err)
    dataStore.setError(err)
  }
})

// 다크모드도 초기화
import { useDarkMode } from './composables/useDarkMode'
const { initDarkMode } = useDarkMode()
onMounted(() => initDarkMode())
</script>

<template>
  <!-- 라우터가 결정한 컴포넌트를 여기 표시 -->
  <RouterView />
</template>
```

**App.vue의 역할:**
```
1️⃣ 모든 컴포넌트의 부모
   └─ 전체 앱의 레이아웃 정의

2️⃣ 초기화 담당 (onMounted)
   └─ 앱 시작 시 데이터 로드

3️⃣ 데이터스토어 연결
   └─ 자식 컴포넌트들이 데이터 접근 가능

4️⃣ 라우터 뷰 표시
   └─ 페이지 이동 시 컴포넌트 변경
```

---

### stores/dataStore.js - 전체 앱의 데이터 저장소

```javascript
// src/stores/dataStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
  // ==================== 상태 (State) ====================

  // 맵 구조로 저장 (O(1) 빠른 조회)
  const reservationMap = ref(new Map())  // id → 예약 객체
  const customerMap = ref(new Map())     // id → 고객 객체
  const eventMap = ref(new Map())        // id → 행사 객체

  // 순서 유지용 배열
  const reservationIds = ref([])
  const customerIds = ref([])
  const eventIds = ref([])

  // 로딩/에러 상태
  const isLoading = ref(false)
  const error = ref(null)

  // ==================== 계산 속성 (Getters) ====================

  // 모든 예약을 배열로 반환
  const reservations = computed(() => {
    return reservationIds.value.map(id => reservationMap.value.get(id))
  })

  // 모든 고객을 배열로 반환
  const customers = computed(() => {
    return customerIds.value.map(id => customerMap.value.get(id))
  })

  // 모든 행사를 배열로 반환
  const events = computed(() => {
    return eventIds.value.map(id => eventMap.value.get(id))
  })

  // 활성 예약만 반환
  const activeReservations = computed(() => {
    return reservations.value.filter(r => r.status === 'active')
  })

  // 예약 통계
  const reservationStats = computed(() => {
    const total = reservations.value.length
    const active = activeReservations.value.length
    const completed = reservations.value.filter(r => r.status === 'completed').length
    const cancelled = reservations.value.filter(r => r.status === 'cancelled').length

    return { total, active, completed, cancelled }
  })

  // ==================== 액션 (Actions) ====================

  // 예약 데이터 일괄 설정
  const setReservations = (reservations) => {
    reservationMap.value.clear()
    reservationIds.value = []

    reservations.forEach(reservation => {
      reservationMap.value.set(reservation.id, { ...reservation })
      reservationIds.value.push(reservation.id)
    })
  }

  // 고객 데이터 일괄 설정
  const setCustomers = (customers) => {
    customerMap.value.clear()
    customerIds.value = []

    customers.forEach(customer => {
      customerMap.value.set(customer.id, { ...customer })
      customerIds.value.push(customer.id)
    })
  }

  // 행사 데이터 일괄 설정
  const setEvents = (events) => {
    eventMap.value.clear()
    eventIds.value = []

    events.forEach(event => {
      eventMap.value.set(event.id, { ...event })
      eventIds.value.push(event.id)
    })
  }

  // 예약 추가
  const addReservation = (reservation) => {
    reservationMap.value.set(reservation.id, reservation)
    if (!reservationIds.value.includes(reservation.id)) {
      reservationIds.value.push(reservation.id)
    }
  }

  // 예약 수정
  const updateReservation = (id, data) => {
    if (!reservationMap.value.has(id)) {
      throw new Error(`예약 ${id}를 찾을 수 없습니다`)
    }
    const updated = {
      ...reservationMap.value.get(id),
      ...data,
      updatedAt: new Date().toISOString()
    }
    reservationMap.value.set(id, updated)
    return updated
  }

  // 예약 삭제
  const deleteReservation = (id) => {
    reservationMap.value.delete(id)
    reservationIds.value = reservationIds.value.filter(rid => rid !== id)
  }

  // 에러 처리
  const setError = (err) => {
    error.value = err
  }

  const clearError = () => {
    error.value = null
  }

  // ==================== 반환 ====================

  return {
    // State
    reservationMap, customerMap, eventMap,
    reservationIds, customerIds, eventIds,
    isLoading, error,

    // Getters
    reservations, customers, events,
    activeReservations, reservationStats,

    // Actions
    setReservations, setCustomers, setEvents,
    addReservation, updateReservation, deleteReservation,
    setError, clearError,
  }
})
```

**dataStore의 역할:**
```
1️⃣ 데이터 저장
   ├─ reservationMap: 예약 데이터
   ├─ customerMap: 고객 데이터
   └─ eventMap: 행사 데이터

2️⃣ 계산된 값 제공 (computed)
   ├─ reservations: 배열 형태로 반환
   ├─ activeReservations: 필터링된 데이터
   └─ reservationStats: 통계 계산

3️⃣ 데이터 변경 (actions)
   ├─ setReservations: 데이터 저장
   ├─ updateReservation: 데이터 수정
   └─ deleteReservation: 데이터 삭제

4️⃣ 반응성 (reactivity)
   └─ 데이터 변경 시 자동으로 UI 업데이트
```

---

### stores/auth.js - 인증 상태 저장소

```javascript
// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 현재 로그인 사용자 정보
  const currentUser = ref(null)
  const isAuthenticated = ref(false)
  const userRole = ref(null)  // 'admin' 또는 'worker'

  // 로그인
  const login = (user) => {
    currentUser.value = user
    isAuthenticated.value = true
    userRole.value = user.role
  }

  // 로그아웃
  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    userRole.value = null
  }

  return {
    currentUser,
    isAuthenticated,
    userRole,
    login,
    logout,
  }
})
```

**auth.js의 역할:**
```
사용자 인증 상태 관리
├─ 로그인 여부
├─ 현재 사용자 정보
└─ 사용자 역할 (admin/worker)
```

---

## 🔄 Part 3: 데이터 흐름 (상세)

### 전체 흐름도

```
1️⃣ main.js 실행
   ↓
2️⃣ Vue 앱 생성
   ↓
3️⃣ App.vue 마운트
   ↓
4️⃣ App.vue의 onMounted() 실행
   ↓
5️⃣ 데이터스토어 가져오기: useDataStore()
   ↓
6️⃣ API 호출: reservationService.getAll()
   ├─ Mock 모드: src/data/reservations.json 로드
   └─ Firebase 모드: Google 서버에서 조회
   ↓
7️⃣ 데이터 정규화 (행사 상태 반영)
   ↓
8️⃣ 데이터스토어에 저장: dataStore.setReservations()
   ↓
9️⃣ 자식 컴포넌트가 데이터 접근
   └─ const reservations = computed(() => dataStore.reservations)
   ↓
🔟 UI 렌더링
```

---

### 구체적인 예시: 예약관리 페이지

#### 1단계: App.vue에서 데이터 준비

```javascript
// App.vue의 onMounted()
onMounted(async () => {
  // ← 여기서 데이터 로드
  const reservationsRes = await reservationService.getAll()

  // ← 데이터스토어에 저장
  dataStore.setReservations(reservationsRes.data)
})
```

#### 2단계: 예약관리 페이지가 데이터 읽음

```vue
<!-- ReservationView.vue -->
<script setup>
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

// 데이터스토어에서 데이터 가져오기
const reservations = computed(() => dataStore.reservations)
</script>

<template>
  <table>
    <tbody>
      <!-- reservations은 App.vue에서 로드한 데이터! -->
      <tr v-for="reservation in reservations" :key="reservation.id">
        <td>{{ reservation.id }}</td>
        <td>{{ reservation.customerId }}</td>
        <td>{{ reservation.status }}</td>
      </tr>
    </tbody>
  </table>
</template>
```

#### 3단계: 사용자가 예약 상태 변경

```javascript
// ReservationView.vue에서 예약 완료 버튼 클릭
const completeReservation = async (id) => {
  // 1️⃣ Firebase에 변경 요청
  await reservationService.complete(id)

  // 2️⃣ 로컬 데이터스토어도 업데이트
  dataStore.updateReservation(id, { status: 'completed' })
}
```

#### 4단계: UI 자동 업데이트

```
dataStore.updateReservation() 호출
  ↓
dataStore의 reservationMap 변경
  ↓
computed(reservations) 감시 중 → 변경 감지!
  ↓
ReservationView.vue 자동 리렌더링
  ↓
테이블의 해당 행의 상태가 "완료"로 변경됨 ✓
```

---

## 🎓 Part 4: Vue의 Composition API 이해

### setup() 함수와 <script setup>

```javascript
// 전통적인 방식 (Options API)
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// 새로운 방식 (Composition API with <script setup>)
<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>
```

**<script setup> 장점:**
- 더 간결한 코드
- 반응성 관리가 명확
- 성능 최적화

### ref() vs computed()

```javascript
import { ref, computed } from 'vue'

// ref: 변경 가능한 상태
const count = ref(0)
count.value++  // ← .value로 접근

// computed: 계산된 값 (읽기 전용)
const doubled = computed(() => count.value * 2)
// 자동으로 count 변경 감시!
// count가 변경되면 doubled도 자동 업데이트

// 템플릿에서는 .value 없이 사용
{{ count }}     // 0
{{ doubled }}   // 0
// count 변경
{{ count }}     // 1
{{ doubled }}   // 2 (자동 업데이트!)
```

---

## 🔗 Part 5: 컴포넌트와 데이터스토어의 연결

### 단계별 연결 과정

```
1️⃣ App.vue에서 데이터 로드
   dataStore.setReservations(data)

2️⃣ 자식 컴포넌트에서 dataStore 가져오기
   const dataStore = useDataStore()

3️⃣ 컴포넌트에서 데이터 읽기
   const reservations = computed(() => dataStore.reservations)

4️⃣ 템플릿에서 표시
   <div v-for="r in reservations">{{ r.id }}</div>

5️⃣ 데이터 변경
   dataStore.updateReservation(id, { status: 'completed' })

6️⃣ 자동 UI 업데이트 ✓
```

### 구체적인 코드

```vue
<!-- 부모: App.vue -->
<script setup>
import { useDataStore } from './stores/dataStore'
import { reservationService } from './api/reservationService'

const dataStore = useDataStore()

onMounted(async () => {
  const data = await reservationService.getAll()
  dataStore.setReservations(data.data)  // ← 데이터 저장
})
</script>

<!-- 자식: ReservationView.vue -->
<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

// App.vue에서 저장한 데이터에 접근!
const reservations = computed(() => dataStore.reservations)
</script>

<template>
  <tr v-for="r in reservations">{{ r.id }}</tr>
</template>
```

---

## 📊 Part 6: 데이터 흐름 다이어그램

```
┌─────────────────────────────────────────────────┐
│              main.js                            │
│         (앱 시작, Pinia 초기화)                │
└────────────────────┬────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │      App.vue           │
        │  (모든 컴포넌트의 부모) │
        │                        │
        │  onMounted():          │
        │  1. API 호출          │
        │  2. 데이터로드         │
        │  3. Store 저장         │
        └────────────┬───────────┘
                     │
        ┌────────────────────────┐
        │  stores/dataStore.js   │
        │ (전체 앱의 데이터 저장)│
        │                        │
        │ reservations ← 예약    │
        │ customers ← 고객       │
        │ events ← 행사          │
        └────────────┬───────────┘
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
  ┌─────────┐   ┌─────────┐   ┌─────────┐
  │Reservation│ │Customer│ │Event    │
  │View      │ │View    │ │View     │
  │          │ │        │ │         │
  │useDataStore│ │...   │ │...      │
  │computed() │ │      │ │        │
  └─────────┘   └─────────┘   └─────────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
              반응적 업데이트
              (자동 리렌더링)
```

---

## 🎯 Part 7: 실제 동작 예시

### 시나리오: "예약 완료" 버튼 클릭

```
1️⃣ 사용자가 ReservationView.vue의 "완료" 버튼 클릭
   ↓
2️⃣ Vue 이벤트 핸들러 실행
   const completeReservation = async (id) => { ... }
   ↓
3️⃣ API 호출 (Firebase에 변경 요청)
   await reservationService.complete(id)
   ↓
4️⃣ Firebase 서버에서 예약 상태 변경
   └─ reservations collection의 해당 문서 업데이트
   ↓
5️⃣ API 응답 수신
   └─ 변경된 예약 데이터 반환
   ↓
6️⃣ 로컬 데이터스토어도 업데이트
   dataStore.updateReservation(id, { status: 'completed' })
   ↓
7️⃣ dataStore의 reservationMap 변경
   └─ reservationMap.set(id, updatedReservation)
   ↓
8️⃣ computed(reservations) 자동 감지!
   └─ dataStore.reservations 값이 변경됨
   ↓
9️⃣ ReservationView.vue 자동 리렌더링
   └─ computed(() => dataStore.reservations) 재실행
   ↓
🔟 테이블 업데이트
   └─ 해당 행의 상태가 "완료"로 표시
   ↓
1️⃣1️⃣ 사용자 화면에 반영 ✓
```

---

## 🏗️ Part 8: 아키텍처 요약

```
계층별 구조:

┌─────────────────────────────────────┐
│  UI 계층 (Vue 컴포넌트)              │
│  ├─ ReservationView.vue            │
│  ├─ CustomerView.vue               │
│  └─ EventView.vue                  │
│      │ 데이터 읽기/쓰기             │
│      ↓                             │
├─────────────────────────────────────┤
│  상태 관리 (Pinia - dataStore)      │
│  ├─ reservations                   │
│  ├─ customers                      │
│  └─ events                         │
│      │ setReservations(),          │
│      │ updateReservation() 등      │
│      ↓                             │
├─────────────────────────────────────┤
│  API 계층 (서비스)                  │
│  ├─ reservationService             │
│  ├─ customerService                │
│  └─ lockerService                  │
│      │ Mock vs Firebase 결정        │
│      ↓                             │
├─────────────────────────────────────┤
│  데이터 소스                        │
│  ├─ Mock: src/data/*.json          │
│  └─ Firebase: Google 서버           │
└─────────────────────────────────────┘
```

---

## 🎓 Part 9: 초기화 순서 정확히 이해하기

### 앱 시작부터 화면 표시까지

```
⏱️ 0초: npm run dev 실행
  ↓
⏱️ 100ms: main.js 로드
  ↓
⏱️ 200ms: createApp(App) 실행
  ├─ createPinia() 추가
  ├─ createRouter() 추가
  └─ app.mount('#app')
  ↓
⏱️ 300ms: App.vue 렌더링
  ↓
⏱️ 400ms: App.vue의 onMounted() 호출
  ├─ useDataStore() 호출
  │  └─ 새로운 Store 인스턴스 생성
  ├─ reservationService.getAll() 호출
  │  ├─ API_CONFIG.mode 체크
  │  ├─ Mock: JSON 로드 (~100ms)
  │  └─ Firebase: 서버 요청 (~500-2000ms)
  └─ dataStore.setReservations(data)
  ↓
⏱️ 500ms: 데이터 저장 완료
  └─ reservationMap에 저장됨
  ↓
⏱️ 600ms: Router에서 현재 경로의 컴포넌트 로드
  └─ ReservationView.vue 렌더링
  ↓
⏱️ 700ms: ReservationView.vue의 computed() 실행
  ├─ useDataStore() 호출
  ├─ const reservations = computed(() => dataStore.reservations)
  └─ 데이터 접근 성공! (App.vue에서 이미 저장함)
  ↓
⏱️ 800ms: 템플릿 렌더링
  ├─ <tr v-for="r in reservations">
  ├─ 147개 예약 테이블 생성
  └─ DOM에 추가
  ↓
⏱️ 900ms: 화면 표시 완료 ✓
  └─ 사용자가 예약관리 페이지 보임
```

---

## 💡 Part 10: 핵심 정리

### 파일별 역할 정리표

| 파일 | 역할 | 중요도 |
|------|------|--------|
| `main.js` | 앱 시작, Pinia 초기화 | ⭐⭐⭐ |
| `App.vue` | 모든 컴포넌트의 부모, 데이터 로드 | ⭐⭐⭐ |
| `stores/dataStore.js` | 전체 앱의 데이터 저장소 | ⭐⭐⭐ |
| `stores/auth.js` | 인증 상태 저장소 | ⭐⭐ |
| `pages/*.vue` | 실제 페이지 컴포넌트 | ⭐⭐⭐ |
| `api/*.js` | API 호출 로직 | ⭐⭐⭐ |

### 데이터 흐름 핵심

```
API 호출 → 데이터스토어 저장 → 컴포넌트가 읽기 → UI 업데이트

App.vue         dataStore         ReservationView
    │               │                    │
    ├─ getAll() ────→ setReservations() │
    │               │                    │
    │               └─────── reservations (computed)
    │                                    │
    │                           {{ reservations }}
    │                                    │
    │                        <테이블 렌더링>
```

### Pinia의 역할

```
Pinia = Vue의 공식 상태 관리 라이브러리

Props로 데이터 전달하는 대신:
  Parent → Child → GrandChild → GrandGrandChild (깊음!)

Pinia로 관리하면:
  Parent ──┐
  Child ───┼→ Store ←── 모두 직접 접근 가능!
  GrandChild ┤
  ...─────┘
```

이제 App.vue와 stores의 완벽한 흐름을 이해했을 것입니다! 🎉
