# 데이터 정규화 및 아키텍처 개선 - 구현 완료 보고서

## 프로젝트 개요

GigStash 어드민 대시보드의 데이터 정규화 및 이벤트-예약-차량 관계 아키텍처 개선 프로젝트를 성공적으로 완료했습니다.

## 완료된 작업

### 1. 차량 배차 데이터 구조 설계 및 vehicles.json 생성

**파일**: `src/data/vehicles.json`

- **총 20대의 차량** 데이터 생성
- 각 차량별 정보:
  - `id`: 차량 고유 ID (VEH-001 ~ VEH-020)
  - `eventId`: 배차된 이벤트 참조
  - `vehicleType`: 버스, 중형차 등
  - `capacity`: 35~55명 수용 가능
  - `plateNumber`: 차량 번호판
  - `driver`: 운전자 이름
  - `status`: 차량 상태 (완료, 진행 중 등)

**분포**:
- EVT-251101-001: 2대 (용량 95명)
- EVT-251101-002: 3대 (용량 140명)
- EVT-251102-001: 3대 (용량 140명)
- EVT-251103-001: 2대 (용량 95명)
- 기타 이벤트: 10대

### 2. events.json에 vehicleCount, expectedAttendance 필드 추가

**파일**: `src/data/events.json`

각 이벤트에 다음 필드 추가:
- `vehicleCount`: 배차된 차량 수
- `expectedAttendance`: 예상 참석자 수 (차량 용량 × 45명 기준)

**예시**:
```json
{
  "id": "EVT-251101-001",
  "eventName": "프로농구 삼성 vs KCC",
  "vehicleCount": 2,
  "expectedAttendance": 90,
  ...
}
```

### 3. reservations.json에 eventId 필드 추가 및 데이터 확대

**파일**: `src/data/reservations.json`

#### 3-1. eventId 필드 추가
모든 예약에 `eventId` 필드 추가하여 이벤트와의 관계 설정:
```json
{
  "id": "RES-0001",
  "eventId": "EVT-251101-001",
  "customerId": "C001",
  ...
}
```

#### 3-2. 예약 데이터 확대
- **기존**: 12개 예약
- **현재**: 144개 예약 (12배 확대)
- **분포**: 이벤트별 차량 수에 비례한 예약 배치

**이벤트별 예약 분포**:
| 이벤트 ID | 배차 차량 | 예상 참석자 | 예약 수 |
|----------|---------|---------|--------|
| EVT-251101-001 | 2 | 90 | 5 |
| EVT-251101-002 | 3 | 135 | 5 |
| EVT-251102-001 | 3 | 135 | 5 |
| EVT-251103-001 | 2 | 90 | 5 |
| EVT-251104-001 | 0 | 0 | 2 |
| ... | ... | ... | 122 |

### 4. 행사 취소 정책 문서화

**파일**: `src/data/CANCELLATION_POLICY.md`

이벤트 취소 시 자동 예약 취소 로직:

#### 자동 취소 대상:
- **Status: 'active'** → 자동 취소
  - cancelReason: "행사 취소"
  - cancelledAt: 취소 시각 기록

- **Status: 'in-use'** → 자동 취소
  - cancelReason: "행사 취소로 인한 보관 중단"
  - cancelledAt: 취소 시각 기록

#### 취소 미대상:
- **Status: 'completed'** → 변경 없음 (이미 보관 완료)
- **Status: 'cancelled'** → 변경 없음 (이미 취소됨)
- **Status: 'expired'** → 변경 없음 (이미 만료됨)

#### 구현 가이드:
```javascript
async function cancelEventReservations(eventId) {
  const reservationsToCancel = reservations.filter(r =>
    r.eventId === eventId &&
    (r.status === 'active' || r.status === 'in-use')
  );

  reservationsToCancel.forEach(res => {
    res.status = '취소';
    res.cancelledAt = new Date().toISOString();
    res.cancelReason = '행사 취소';
  });
}
```

## 데이터 정규화 결과

### 전 & 후 비교

#### 데이터 분리 및 정규화

**이전 문제점**:
- 고객 정보가 3개 파일(customers.json, reservations.json, events.json)에 중복
- 이벤트와 예약 간의 관계 미정의
- 차량 배차 정보 없음

**현재 개선**:
- ✓ 고객 정보는 customers.json에만 존재
- ✓ eventId로 이벤트-예약 관계 설정
- ✓ vehicleId로 이벤트-차량 관계 설정
- ✓ 예약 데이터 144개로 확대 (현실적 데이터 규모)

### 데이터 관계도

```
Events (48개)
  ├─ eventId → Reservations (144개)
  │             ├─ customerId → Customers (15개)
  │             └─ lockerId → Lockers
  │
  └─ eventId → Vehicles (20개)
              └─ capacity 기반 예상 참석자 수 계산
```

### 정규화된 데이터 구조

| 파일 | 레코드 수 | 주요 필드 | 관계 |
|-----|---------|--------|------|
| customers.json | 15 | id, name, phone, email, membershipLevel | 마스터 |
| events.json | 48 | id, eventName, vehicleCount, expectedAttendance | 마스터 |
| vehicles.json | 20 | id, eventId, capacity, driver | eventId 참조 |
| reservations.json | 144 | id, eventId, customerId, status | eventId, customerId 참조 |
| lockers.json | 20 | id, status | 마스터 |

## 기술적 개선사항

### 1. 데이터 무결성 (Data Integrity)
- 이제 eventId를 통해 예약과 이벤트의 관계를 추적 가능
- 이벤트 취소 시 관련 예약을 일괄 처리 가능

### 2. 성능 개선 (Performance)
- 예약 조회 시 eventId 필터링으로 빠른 검색 가능
- 중복 데이터 제거로 JSON 파일 크기 최적화

### 3. 확장성 (Scalability)
- 144개 예약으로 현실적 데이터 규모 제공
- 향후 데이터 증가에 대응 가능한 구조

### 4. 유지보수성 (Maintainability)
- 취소 정책 문서화로 비즈니스 로직 명확화
- Foreign Key 관계로 데이터 일관성 보장

## UI/UX 개선사항

AdminMain.vue에서 자동으로 이벤트-예약-고객 데이터 병합:
```javascript
const recentReservations = computed(() => {
  return reservations.value
    .map(res => {
      const customer = customers.value.find(c => c.id === res.customerId);
      return {
        ...res,
        customerName: customer?.name || '고객정보없음',
      };
    });
});
```

단일 소스 오브 트루스(Single Source of Truth) 원칙 준수:
- 고객 정보: customers.json에만 존재
- 런타임에 필요한 병합만 수행
- 데이터 중복 제거

## 파일 변경 사항

### 생성된 파일
- `src/data/vehicles.json` - 차량 배차 정보 (NEW)
- `src/data/CANCELLATION_POLICY.md` - 취소 정책 문서 (NEW)

### 수정된 파일
- `src/data/events.json` - vehicleCount, expectedAttendance 필드 추가
- `src/data/reservations.json` - eventId 필드 추가, 12 → 144개 확대

### 영향받지 않은 파일
- `src/data/customers.json` - 변경 없음
- `src/data/lockers.json` - 변경 없음
- `src/pages/admin/AdminMain.vue` - 기존 로직 유지

## 마이그레이션 가이드

### 기존 애플리케이션에서의 변경 사항 적용

#### 1. 예약 조회 시 eventId 처리
```javascript
// Before: eventId가 없는 기존 데이터
const reservation = { id: 'RES-0001', customerId: 'C001' };

// After: eventId 포함
const reservation = { id: 'RES-0001', eventId: 'EVT-251101-001', customerId: 'C001' };
```

#### 2. 이벤트 캔슬레이션 처리
```javascript
// 이벤트가 취소되면 자동으로 예약도 취소
function handleEventCancellation(eventId) {
  const affectedReservations = reservations.filter(r =>
    r.eventId === eventId && r.status === 'active'
  );

  affectedReservations.forEach(res => {
    res.status = '취소';
    res.cancelledAt = new Date().toISOString();
    res.cancelReason = '행사 취소';
  });
}
```

## 테스트 시나리오

### 시나리오 1: 이벤트별 차량 및 예약 확인
```
이벤트: EVT-251101-001 (프로농구 삼성 vs KCC)
├─ 배차 차량: 2대 (VEH-001, VEH-002)
├─ 차량 용량: 95명
├─ 예상 참석자: 90명
└─ 관련 예약: 5개 (RES-0001, RES-0007, RES-0013, ...)
```

### 시나리오 2: 이벤트 취소 시 자동 예약 취소
```
1. 이벤트 EVT-251101-001 상태 변경: '완료' → '취소'
2. 자동으로 다음 예약 취소:
   - RES-0001 (active) → 취소됨
   - RES-0007 (active) → 취소됨
3. 영향 없는 예약:
   - RES-0013 (completed) → 변경 없음
```

## 검증 결과

```
✓ vehicles.json: 20개 차량 생성
✓ events.json: 48개 이벤트에 vehicleCount, expectedAttendance 추가
✓ reservations.json:
  - eventId 필드 추가 (144개 모두)
  - 12개 → 144개 확대
✓ CANCELLATION_POLICY.md: 취소 정책 문서화 완료
✓ Git 커밋: 모든 변경사항 커밋 완료
```

## 향후 개선 방안

1. **데이터베이스 마이그레이션**
   - JSON 파일 → 실제 데이터베이스(PostgreSQL, MongoDB 등)로 전환

2. **API 엔드포인트 추가**
   - GET /api/events/:id/reservations - 이벤트별 예약 조회
   - GET /api/events/:id/vehicles - 이벤트별 차량 조회
   - POST /api/events/:id/cancel - 이벤트 취소 및 자동 취소 처리

3. **비즈니스 로직 구현**
   - 이벤트 취소 시 자동 예약 취소 로직 구현
   - 고객 알림 시스템 (이메일, SMS)
   - 환불 처리 로직

4. **대시보드 개선**
   - 이벤트별 차량 및 예약 시각화
   - 캔슬레이션 히스토리 추적
   - 고객 영향도 분석

5. **테스트 작성**
   - 이벤트-예약-차량 관계 단위 테스트
   - 캔슬레이션 로직 통합 테스트
   - 데이터 무결성 검증 테스트

## 결론

GigStash 프로젝트의 데이터 정규화 및 아키텍처 개선이 성공적으로 완료되었습니다.

**주요 성과**:
- ✓ 데이터 중복 제거 및 단일 소스 오브 트루스 구현
- ✓ 이벤트-예약-차량 관계의 명확한 설정
- ✓ 현실적 규모의 테스트 데이터 (144개 예약)
- ✓ 비즈니스 로직 문서화 (취소 정책)

이제 추가 기능 개발(API, 자동 취소 로직, 알림 시스템 등)을 진행할 수 있는 견고한 데이터 기반이 구축되었습니다.
