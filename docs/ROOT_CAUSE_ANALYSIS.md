# 📋 데이터 표시 문제 원인 분석 보고서

**작성일**: 2025-12-01
**대상**: Dashboard(대시보드), Reservation Management(예약관리) 데이터 미표시 문제
**상태**: 원인 파악 완료, 해결책 제시

---

## 🎯 문제 현황

| 페이지 | 상태 | 데이터 | 원인 |
|--------|------|--------|------|
| **Dashboard (대시보드)** | ❌ BROKEN | 0건 표시 | Firebase 데이터 로드 불일치 |
| **Reservation (예약관리)** | ❌ BROKEN | 0건 표시 | Firebase 데이터 로드 불일치 |
| **Event (행사관리)** | ✅ WORKING | 정상 표시 | 로컬 JSON 파일 사용 |
| **Monitoring (모니터링)** | ✅ WORKING | 정상 표시 | 로컬 JSON 파일 사용 |

---

## 🔍 근본 원인 (Root Cause)

### 1️⃣ **주요 원인: 상태(Status) 값 불일치**

#### Firebase에 저장된 상태 값
**파일**: `scripts/generate-reservations-extra.js` (Line 18)
```javascript
const statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
```

**현재 Firebase 데이터**:
- `pending` (예정)
- `confirmed` ⚠️ **UI에 없는 상태**
- `active` (활성)
- `completed` (완료)
- `cancelled` (취소)

#### UI에서 기대하는 상태 값
**파일**: `src/pages/admin/ReservationView.vue` (Line 443-449)
```javascript
const statusMap = {
  active: '활성',
  waiting: '대기',        // ⚠️ Firebase에 없음
  completed: '완료',
  cancelled: '취소',
  pending: '예정',
}
```

**UI 기대값**:
- `active` (활성)
- `waiting` ⚠️ **Firebase에 없는 상태**
- `completed` (완료)
- `cancelled` (취소)
- `pending` (예정)

#### 문제점
```
Firebase: pending, confirmed, active, completed, cancelled
UI:       pending, waiting, active, completed, cancelled
          ✓        ✗       ✓      ✓         ✓
```

- Firebase에는 **`confirmed`** 존재 → UI statusMap에 없음 → 상태 표시 실패
- UI에는 **`waiting`** 기대 → Firebase에 없음 → 대기 중 카운트 항상 0

---

### 2️⃣ **데이터 로드 경로 차이**

#### ✅ Event Management (정상 작동)
```
App.vue (Line 59)
  ↓
eventsData.events (로컬 JSON 파일)
  ↓
dataStore.setEvents()
  ↓
EventView.vue에서 정상 표시
```

**로컬 JSON events.json의 상태 값**: `'예정'`, `'진행 중'`, `'종료'`, `'취소'` (한글)

#### ❌ Reservation Management (데이터 미표시)
```
App.vue (Line 50)
  ↓
reservationService.getAll()
  ↓
Firebase collection 'reservations'
  ↓
상태: ['pending', 'confirmed', 'active', 'completed', 'cancelled']
  ↓
ReservationView.vue statusMap과 불일치
  ↓
상태 표시 실패 → 데이터 카운트 오류
```

---

### 3️⃣ **데이터 로드 불완전 (Missing Locker Data)**

**파일**: `src/App.vue` (Line 48-71)
```javascript
onMounted(async () => {
  try {
    const [reservationsRes, customersRes] = await Promise.all([
      reservationService.getAll(),      // ✓ 로드됨
      customerService.getAll()          // ✓ 로드됨
    ])
    const events = eventsData.events    // ✓ 로드됨
    // ❌ lockerService.getAll() 없음!

    dataStore.setReservations(normalizedReservations)
    dataStore.setCustomers(customersRes.data)
    dataStore.setEvents(events)
    // ❌ dataStore.setLockers() 없음!
  }
})
```

**문제점**:
- Locker 데이터가 초기화되지 않음
- Dashboard에서 사물함 통계 표시 불가
- 모니터링 페이지도 로컬 JSON만 사용하므로 실시간 사물함 데이터 없음

---

## 📊 문제 발생 메커니즘

```
1. generate-reservations-extra.js 실행
   ↓
2. 300개 예약 생성 (상태: pending, confirmed, active, completed, cancelled)
   ↓
3. Firebase 'reservations' 컬렉션에 저장 (447개 총합)
   ↓
4. App.vue 마운트 시 reservationService.getAll() 호출
   ↓
5. Firebase에서 447개 데이터 조회 (상태값 그대로)
   ↓
6. normalizeReservations() 함수 실행 (이벤트 연결)
   ↓
7. dataStore.setReservations()에 저장
   ↓
8. ReservationView.vue 렌더링
   ↓
9. statusMap 조회:
   - 'confirmed' 상태 → statusMap에 없음 → undefined
   - 'waiting' 필터링 → Firebase에 없음 → 0건
   ↓
10. 데이터 표시 오류
    - 전체 예약: 0건 (또는 부분 표시)
    - 활성: N건
    - 대기: 0건 (항상)
    - 완료: M건
```

---

## 🔧 해결 방안

### **방안 A: Firebase 데이터 정규화 (권장)**

**장점**:
- 근본적인 해결
- 향후 유사 문제 예방
- 데이터 일관성 보장

**단계**:

1. **generate-reservations-extra.js 수정** (Line 18)
```javascript
// 변경 전
const statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']

// 변경 후
const statuses = ['pending', 'waiting', 'active', 'completed', 'cancelled']
```

2. **App.vue에서 normalizeReservations() 함수 확인**
```javascript
// 이미 존재하는 함수를 통해 상태값 변환 가능
const normalizedReservations = normalizeReservations(reservationsRes.data, events)
```

3. **Firebase의 'confirmed' 예약 데이터 일괄 업데이트**
```javascript
// scripts/fix-reservation-statuses.js 생성하여 실행
// 기존 'confirmed' → 'waiting'으로 변환
```

---

### **방안 B: UI statusMap 확장 (임시 해결)**

**장점**:
- 즉시 적용 가능
- 기존 Firebase 데이터 유지

**단점**:
- 불명확한 상태 값 ('confirmed' vs 'waiting')
- 향후 유지보수 복잡성 증가

**구현**:

[ReservationView.vue](src/pages/admin/ReservationView.vue#L443-L449) 수정:
```javascript
const statusMap = {
  active: '활성',
  waiting: '대기',
  confirmed: '확정',        // ← 추가
  completed: '완료',
  cancelled: '취소',
  pending: '예정',
}
```

---

### **방안 C: normalizeReservations() 함수로 상태값 매핑**

**장점**:
- 중앙화된 데이터 변환
- 모든 예약 데이터 일관성 보장

**단점**:
- 기존 함수 수정 필요
- 테스트 추가 필요

**구현** (App.vue Line 51-57):
```javascript
const normalizedReservations = normalizeReservations(reservationsRes.data, events)
  .map(res => ({
    ...res,
    status: res.status === 'confirmed' ? 'waiting' : res.status
  }))
```

---

### **방안 D: Locker 데이터 로드 추가**

**필수 구현** (App.vue Line 48-71):
```javascript
onMounted(async () => {
  try {
    const [reservationsRes, customersRes, lockersRes] = await Promise.all([
      reservationService.getAll(),
      customerService.getAll(),
      lockerService.getAll()            // ← 추가
    ])
    const events = eventsData.events
    const normalizedReservations = normalizeReservations(reservationsRes.data, events)

    dataStore.setReservations(normalizedReservations)
    dataStore.setCustomers(customersRes.data)
    dataStore.setLockers(lockersRes.data)  // ← 추가
    dataStore.setEvents(events)
  } catch (err) {
    console.error('Failed to load initial data:', err)
    dataStore.setError(err)
  }
})
```

---

## 📋 권장 조치 순서

### **우선순위 1 (CRITICAL - 즉시 적용)**
1. ✅ **Locker 데이터 로드 추가** (방안 D)
   - 파일: [App.vue](src/App.vue#L48-L71)
   - 영향도: Dashboard, Monitoring 페이지 완전성
   - 소요시간: 5분

### **우선순위 2 (HIGH - 동일 세션 내 완료)**
2. ✅ **Firebase 데이터 정규화** (방안 A)
   - 단계 1: generate-reservations-extra.js 수정
   - 단계 2: 기존 'confirmed' 데이터 일괄 업데이트 스크립트 생성
   - 단계 3: 스크립트 실행하여 Firebase 데이터 정정
   - 소요시간: 15분

### **우선순위 3 (MEDIUM - 데이터 정규화 후)**
3. 📝 **statusMap 재검증**
   - UI statusMap이 모든 가능한 상태값을 포함하는지 확인
   - ReservationView.vue 통계 계산 로직 재검증

---

## 🧪 검증 방법

### **문제 확인**
```bash
# Firebase Console에서 확인
# Collection: reservations
# 샘플 문서의 status 필드 값 확인
# → 'pending', 'confirmed', 'active', 'completed', 'cancelled' 혼재
```

### **해결 후 검증**
```javascript
// Browser DevTools Console
const stats = await statsService.getDashboard()
console.log(stats.data)
// 기대값: {
//   totalReservations: 447,
//   active: N,
//   waiting: M,      // 이제 0이 아닌 실제 값
//   completed: X,
//   cancelled: Y
// }
```

---

## 📌 주요 발견사항

| 항목 | 상태 | 설명 |
|------|------|------|
| **Firebase 데이터** | ❌ 오류 | 'confirmed' 상태 사용 (UI와 불일치) |
| **UI StatusMap** | ❌ 불완전 | 'waiting' 기대하나 Firebase에 없음 |
| **Event 페이지** | ✅ 정상 | 로컬 JSON 사용으로 상태값 일관 |
| **Locker 초기화** | ❌ 미상 | App.vue에서 로드하지 않음 |
| **데이터 정규화** | ⚠️ 부분 | normalizeReservations() 존재하나 상태값 변환 미적용 |

---

## 💡 결론

**데이터가 보이지 않는 이유는 상태(Status) 값 불일치 때문입니다.**

- **Firebase**: `pending`, `confirmed`, `active`, `completed`, `cancelled` 사용
- **UI**: `pending`, `waiting`, `active`, `completed`, `cancelled` 기대

이로 인해:
1. `confirmed` 상태 예약 → UI statusMap에 매칭 실패
2. `waiting` 상태 필터 → Firebase에 0건 반환
3. 통계 계산 오류 → Dashboard와 Reservation 페이지 데이터 미표시

**해결책**: 방안 A (Firebase 데이터 정규화) + 방안 D (Locker 로드 추가) 동시 적용 권장

---

**다음 단계**: 원인 분석을 바탕으로 해결책 구현 진행
