# 🏗️ GigStash 서비스 아키텍처 가이드

**Firebase Firestore 전용 버전**

> 이 문서는 리팩토링된 서비스 구조를 설명합니다. 모든 Mock 모드 로직이 제거되었으며, Firebase Firestore만 사용합니다.

---

## 📋 목차

1. [전체 구조](#전체-구조)
2. [서비스 레이어](#서비스-레이어)
3. [각 서비스 상세 설명](#각-서비스-상세-설명)
4. [데이터 흐름](#데이터-흐름)
5. [사용 예시](#사용-예시)
6. [주요 개선사항](#주요-개선사항)

---

## 전체 구조

```
┌─────────────────────────────────────┐
│      Vue 컴포넌트 (Pages)            │
│  (DashboardView, ReservationView..)  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Pinia 상태 관리 (dataStore)     │
│  (예약, 고객, 사물함 데이터 보유)      │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Service Layer (src/api)         │
│  ┌─────────────────────────────────┐ │
│  │ - reservationService            │ │
│  │ - customerService               │ │
│  │ - lockerService                 │ │
│  │ - statsService                  │ │
│  └─────────────────────────────────┘ │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Firebase Firestore SDK             │
│  (firebaseApp, db instance)          │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Cloud Firestore 데이터베이스        │
│  (컬렉션 관리, 문서 저장소)           │
└─────────────────────────────────────┘
```

---

## 서비스 레이어

### 📂 파일 구조

```
src/api/
├── reservationService.js  (예약 관리)
├── customerService.js     (고객 관리)
├── lockerService.js       (사물함 관리)
└── statsService.js        (통계)
```

### 🎯 각 서비스의 역할

| 서비스 | 역할 | 주요 기능 |
|--------|------|---------|
| **reservationService** | 예약 데이터 관리 | CRUD, 상태 변경, 실시간 업데이트 |
| **customerService** | 고객 데이터 관리 | CRUD, 검색, 멤버십 관리 |
| **lockerService** | 사물함 데이터 관리 | CRUD, 상태 변경, 예약 관리 |
| **statsService** | 통계 및 대시보드 | 집계 데이터, 분석 정보 |

---

## 각 서비스 상세 설명

### 1️⃣ reservationService

**용도**: 예약 정보 관리 및 조회

**Firebase 컬렉션**: `reservations`

#### 메서드

```javascript
// 전체 예약 조회
getAll(params = {})
// params: { status, customerId, lockerId }

// 단건 조회
getById(id)

// 예약 생성
create(data)

// 예약 수정
update(id, data)

// 예약 취소
cancel(id, reason)

// 예약 완료
complete(id)

// 오늘 예약
getToday()

// 활성 예약
getActive()

// 실시간 리스너
onReservationChange(callback)
```

#### 사용 예시

```javascript
// 활성 예약 조회
const activeRes = await reservationService.getActive()
console.log(activeRes.data) // 활성 예약 배열

// 예약 생성
const newRes = await reservationService.create({
  customerId: 'CUST-000001',
  lockerId: 'VEH-001-S01',
  eventId: 'EVT-001',
  startTime: new Date(),
  endTime: new Date(Date.now() + 3600000),
  purpose: '짐 보관'
})

// 예약 취소
await reservationService.cancel('RES-000001', '개인 사유')

// 실시간 모니터링
const unsubscribe = reservationService.onReservationChange((data) => {
  console.log('예약 변경:', data)
})
// cleanup: unsubscribe()
```

---

### 2️⃣ customerService

**용도**: 고객 정보 관리

**Firebase 컬렉션**: `customers`

#### 메서드

```javascript
// 전체 고객 조회
getAll(params = {})
// params: { membershipLevel, search }

// 단건 조회
getById(id)

// 고객 생성
create(data)

// 고객 정보 수정
update(id, data)

// 고객 삭제 (soft delete)
delete(id)

// 전화번호로 검색
getByPhone(phone)

// 멤버십 레벨 변경
updateMembershipLevel(id, level)

// 실시간 리스너
onCustomerChange(callback)
```

#### 사용 예시

```javascript
// 모든 고객 조회 (멤버십 레벨 필터)
const goldRes = await customerService.getAll({
  membershipLevel: 'gold'
})

// 고객 검색
const searchRes = await customerService.getAll({
  search: '010-1234-5678' // 이름, 이메일, 전화번호 검색 가능
})

// 고객 생성
const newCustomer = await customerService.create({
  name: '김철수',
  email: 'kim@example.com',
  phone: '010-1234-5678'
})

// 멤버십 업그레이드
await customerService.updateMembershipLevel('CUST-000001', 'platinum')

// 실시간 고객 변경 모니터링
const unsubscribe = customerService.onCustomerChange((data) => {
  console.log('고객 변경:', data)
})
```

---

### 3️⃣ lockerService

**용도**: 사물함 상태 관리

**Firebase 컬렉션**: `lockers`

#### 메서드

```javascript
// 전체 사물함 조회
getAll(params = {})
// params: { status, vehicleId, size }

// 단건 조회
getById(id)

// 차량별 사물함 조회
getByVehicleId(vehicleId)

// 상태 변경
updateStatus(id, status)

// 온도 업데이트
updateTemperature(id, temperature)

// 예약 할당
assignReservation(id, reservationId)

// 예약 해제
releaseReservation(id)

// 사용 가능한 사물함 조회
getAvailable(size = null)

// 실시간 리스너 - 차량별
onVehicleLockers(vehicleId, callback)

// 실시간 리스너 - 사물함별
onLockerStatusChange(lockerId, callback)
```

#### 사용 예시

```javascript
// 특정 차량의 모든 사물함
const vehicleRes = await lockerService.getByVehicleId('VEH-001')
console.log(vehicleRes.data) // 50개 사물함

// 사용 가능한 소형 사물함 조회
const availRes = await lockerService.getAvailable('small')

// 사물함 상태 변경
await lockerService.updateStatus('VEH-001-S01', 'maintenance')

// 예약 할당
await lockerService.assignReservation('VEH-001-S01', 'RES-000001')

// 예약 해제 (반납 시)
await lockerService.releaseReservation('VEH-001-S01')

// 온도 업데이트 (센서 데이터)
await lockerService.updateTemperature('VEH-001-M01', 4.5)

// 특정 차량의 사물함 실시간 모니터링
const unsubscribe1 = lockerService.onVehicleLockers('VEH-001', (data) => {
  console.log('차량 VEH-001 사물함 변경:', data)
})

// 특정 사물함 상태 모니터링
const unsubscribe2 = lockerService.onLockerStatusChange('VEH-001-S01', (data) => {
  console.log('사물함 VEH-001-S01 변경:', data)
})
```

---

### 4️⃣ statsService

**용도**: 통계 및 분석 데이터

**데이터 소스**: 다른 서비스들을 조합하여 집계

#### 메서드

```javascript
// 대시보드 통계
getDashboard()

// 사물함 크기별 통계
getLockerSizeStats()

// 차량별 통계
getVehicleStats()

// 고객 멤버십 통계
getMembershipStats()

// 예약 상태 통계
getReservationStats()

// 시간대별 예약 통계
getHourlyReservationStats(date)

// 사용률 이력
getUsageHistory(period)
```

#### 사용 예시

```javascript
// 대시보드 통계
const dashRes = await statsService.getDashboard()
console.log(dashRes.data)
// {
//   totalLockers: 1000,
//   availableLockers: 450,
//   inUseLockers: 500,
//   usageRate: 50,
//   todayReservations: 25,
//   totalCustomers: 565,
//   ...
// }

// 크기별 통계
const sizeRes = await statsService.getLockerSizeStats()
// { small: {total, available, inUse}, medium: {...}, large: {...} }

// 차량별 통계
const vehicleRes = await statsService.getVehicleStats()
// [
//   { vehicleId: 'VEH-001', total: 50, available: 20, inUse: 30, usageRate: 60 },
//   ...
// ]

// 멤버십별 고객 분포
const memberRes = await statsService.getMembershipStats()
// { bronze: 100, silver: 200, gold: 150, platinum: 115 }

// 시간대별 예약 (특정 날짜)
const hourlyRes = await statsService.getHourlyReservationStats('2025-12-01')
// [
//   { hour: 0, reservations: 2, pickups: 1 },
//   { hour: 1, reservations: 0, pickups: 0 },
//   ...
// ]

// 7일간 사용률 이력
const historyRes = await statsService.getUsageHistory('7d')
// [
//   { date: '2025-11-25', reservations: 15, revenue: 75000 },
//   ...
// ]
```

---

## 데이터 흐름

### 예약 생성 흐름

```
Vue Component
    ↓
reservationService.create({...})
    ↓
Firebase SDK
    ↓
Firestore Collections: reservations
    ↓
Document ID 생성 및 저장
    ↓
응답: { id: 'RES-XXX', ...data }
    ↓
Pinia dataStore.setReservations()
    ↓
모든 구독 컴포넌트 자동 업데이트
```

### 실시간 데이터 업데이트 흐름

```
Firebase onSnapshot() 리스너
    ↓
(감시 중인 컬렉션 변경 감지)
    ↓
콜백 함수 호출 with 새로운 데이터
    ↓
Pinia store 업데이트
    ↓
구독하는 Vue 컴포넌트 자동 렌더링
```

---

## 사용 예시

### 예시 1: 대시보드 페이지

```javascript
// views/DashboardView.vue

import { ref, onMounted } from 'vue'
import { statsService } from '@/api/statsService'

export default {
  setup() {
    const stats = ref(null)
    const loading = ref(true)

    onMounted(async () => {
      try {
        const res = await statsService.getDashboard()
        stats.value = res.data
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        loading.value = false
      }
    })

    return { stats, loading }
  }
}
```

### 예시 2: 사물함 관리 페이지

```javascript
// views/LockerManageView.vue

import { ref, onMounted, onUnmounted } from 'vue'
import { lockerService } from '@/api/lockerService'

export default {
  setup() {
    const vehicleId = 'VEH-001'
    const lockers = ref([])
    let unsubscribe = null

    onMounted(() => {
      // 실시간 감시 시작
      unsubscribe = lockerService.onVehicleLockers(vehicleId, (data) => {
        lockers.value = data
      })
    })

    onUnmounted(() => {
      // 리스너 정리
      if (unsubscribe) unsubscribe()
    })

    const updateStatus = async (lockerId, status) => {
      try {
        await lockerService.updateStatus(lockerId, status)
        // 실시간 업데이트로 자동 반영됨
      } catch (err) {
        console.error('Failed to update status:', err)
      }
    }

    return { lockers, updateStatus }
  }
}
```

### 예시 3: 고객 검색

```javascript
// views/CustomerView.vue

import { ref } from 'vue'
import { customerService } from '@/api/customerService'

export default {
  setup() {
    const searchText = ref('')
    const customers = ref([])
    const loading = ref(false)

    const search = async () => {
      if (!searchText.value) return

      loading.value = true
      try {
        const res = await customerService.getAll({
          search: searchText.value
        })
        customers.value = res.data
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        loading.value = false
      }
    }

    return { searchText, customers, search, loading }
  }
}
```

---

## 주요 개선사항

### ✅ Mock 모드 완전 제거

**이전 (문제)**
```javascript
if (API_CONFIG.mode === 'mock') {
  // 100줄 Mock 로직
  let filtered = [...mockData]
  filtered.sort(...)
  return mockResponse(filtered)
} else {
  // Firebase 로직
}
```

**이후 (개선)**
```javascript
// Firebase만 처리
const q = query(collection(db, COLLECTION), ...constraints)
const snapshot = await getDocs(q)
return { data: snapshot.docs.map(d => ({...})) }
```

### ✅ 코드 단순화

- **Mock 로직 제거**: ~200줄 감소
- **중복 제거**: 같은 기능 두 번 작성 제거
- **유지보수성 증대**: 한 가지 데이터소스만 관리

### ✅ 실시간 기능 강화

```javascript
// 모든 서비스에 실시간 리스너 추가
onReservationChange(callback)
onCustomerChange(callback)
onVehicleLockers(vehicleId, callback)
onLockerStatusChange(lockerId, callback)
```

### ✅ 더 나은 문서화

```javascript
/**
 * 전체 예약 조회
 * @param {Object} params - 필터 파라미터
 * @param {string} params.status - 예약 상태
 * @returns {Promise<{data: Array}>} 예약 배열
 */
async getAll(params = {})
```

### ✅ 일관된 에러 처리

모든 메서드에서 표준화된 try-catch 사용
```javascript
try {
  // Firebase 작업
} catch (error) {
  console.error('serviceName.methodName error:', error)
  throw error
}
```

### ✅ Firestore 최적화

- `orderBy` + `where` 문제 해결 (클라이언트 정렬)
- 불필요한 쿼리 제거
- 배치 작업 지원 (statsService)

---

## 📚 추가 참고

- [Firebase Firestore 공식 문서](https://firebase.google.com/docs/firestore)
- [Pinia 상태 관리](../src/stores/README.md)
- [컴포넌트 사용 예시](../src/components/README.md)

---

**마지막 업데이트**: 2025-12-01
**버전**: Firebase 전용 (v2.0)
