# 데이터 무결성 관리 가이드

## 개요

GigStash 프로젝트의 데이터는 다음과 같은 엔티티 관계를 가집니다:

```
Event (행사)
  ├─ Vehicle (차량) * 1 ~ 7대
  │   └─ Locker (사물함) * 50개
  │       └─ Reservation (예약) * N개
  └─ Reservation (예약) * N개
       ├─ Locker
       └─ Customer (고객)
```

**핵심 무결성 규칙:**
- 각 예약의 사물함은 **반드시 그 행사에 배치된 차량에 속한 사물함**이어야 함
- 예: Event A의 예약은 Event A의 차량(VEH-001, VEH-002, ...)에 속한 사물함만 사용 가능

---

## 문제 진단

### 이전 상황 (2025-12-03)

| 항목 | 수치 |
|------|------|
| 전체 예약 | 4,660개 |
| **무결성 정상** | **337개 (7.23%)** |
| **무결성 오류** | **4,323개 (92.77%)** |

### 근본 원인

데이터 생성 로직에서 예약 생성 시:
1. 행사의 예약 개수만 계산 ❌
2. 행사의 차량 목록은 확인하지 않음 ❌
3. 무작위 사물함을 할당 ❌

**결과:** 대부분의 예약이 해당 행사의 차량에 속하지 않은 사물함으로 할당됨

---

## 추가 수정 사항 (2025-12-03 오후)

### 예약 시간 데이터 정합성 개선

**문제:** 모든 예약의 startTime/endTime이 2025-12-03 ~ 2025-12-04로 고정
- 행사 날짜(eventDate)와 무관하게 설정됨
- 데이터 의미가 맞지 않음

**해결:** 예약 시간을 행사 날짜 기반으로 수정
```bash
npm run data:fix-times
```

**수정 규칙:**
- startTime: 행사 날짜의 09:00:00 UTC
- endTime: 행사 다음날의 18:00:00 UTC (33시간 보관)

**결과:**
- 866개 예약 모두 수정 완료
- 데이터 정합성 개선
- 행사 관리에서 예약 건수 정확성 향상

---

## 해결 방안 3가지

### 방안 1: 예약 데이터 재생성 (올바른 로직)

**목표:** 모든 예약 데이터를 올바른 비즈니스 로직으로 재생성

**알고리즘:**
```javascript
for (각 행사) {
  1. 행사에 배치된 차량 목록 조회
  2. 각 차량의 사물함 목록 취합
  3. 행사의 모든 예약을 라운드-로빈으로 사물함에 할당
}
```

**실행 방법:**
```bash
npm run data:regenerate
# 또는
node scripts/regenerate-reservations-correct.js
```

**결과:**
```
변경 전: 4,660개 예약 중 7.23% 정상 (337개)
변경 후: 866개 예약 중 100% 정상 (866개)

개선율: +92.77%
```

**장점:**
- ✅ 100% 무결성 달성
- ✅ 비즈니스 로직 완벽히 준수
- ✅ 향후 신규 예약도 올바른 로직으로 생성

**단점:**
- ⚠️ 3,794개 예약이 제거됨 (차량 미배치 행사 관련)
- ⚠️ 과거 예약 데이터 일부 손실

---

### 방안 2: 데이터 생성 스크립트 검증

**목표:** 새로운 데이터 생성 시 무결성을 자동으로 검증

**검증 항목:**

1. **외래키 검증**
   ```
   Vehicle → Event (모두 유효한가?)
   Locker → Vehicle (모두 유효한가?)
   Reservation → Event/Locker/Customer (모두 유효한가?)
   ```

2. **비즈니스 로직 검증**
   ```
   각 예약: Event → Vehicle → Locker 체인이 성립하는가?
   ```

3. **데이터 일관성 검증**
   ```
   ID 중복 없음 (id, eventId, vehicleId, lockerId, customerId)
   NULL 값 없음 (필수 필드)
   ```

4. **통계 분석**
   ```
   행사별 차량 분포
   차량별 사물함 분포
   사물함 활용률
   ```

**실행 방법:**
```bash
npm run data:validate
# 또는
node scripts/validate-data-integrity.js
```

**결과 예시:**
```
✅ 외래키 검증: 100% 유효
✅ 비즈니스 로직: 100% 정상
✅ 데이터 일관성: 중복/NULL 없음
📊 사물함 활용률: 86.60%
```

**활용:**
- 개발 시 데이터 확인 도구로 사용
- CI/CD 파이프라인에 통합 가능
- 버그 재현 후 검증에 사용

---

### 방안 3: 자동화된 테스트 검증

**목표:** 모든 데이터 변경 후 자동 검증 수행

**테스트 범위:**

| 테스트 | 검증 항목 | 기준 |
|--------|---------|------|
| 데이터 로드 | 모든 파일 로드 가능 | 5개 모두 성공 |
| 데이터 구조 | 필수 필드 존재 | 100% |
| 외래키 | 참조 유효성 | 100% |
| 비즈니스 로직 | 예약 무결성 | 100% |
| 일관성 | ID 고유성, NULL 체크 | 100% |
| 분포 | 모든 행사/차량에 자원 배치 | 0개 미배치 |
| 성능 | 1000회 조인 쿼리 시간 | < 5초 |

**실행 방법:**
```bash
npm run data:test
# 또는
node scripts/test-data-validation.js
```

**결과 예시:**
```
✅ 통과: 25개
❌ 실패: 0개
⚠️  경고: 1개 (사물함 활용률 86.60%)

🎉 모든 테스트 통과!
```

**CI/CD 통합:**
```bash
# 빌드 전에 자동 실행
npm run data:test && npm run build
```

---

## 실행 명령어

### 예약 시간 수정 (신규)
```bash
# 예약 시간을 행사 날짜 기반으로 수정
npm run data:fix-times

# 또는
node scripts/fix-reservation-times.js
```

### 일일 검증
```bash
# 모든 데이터 검증 (권장)
npm run data:validate

# 자동 테스트 실행
npm run data:test
```

### 데이터 재생성 (주의!)
```bash
# 예약 데이터만 재생성 (100% 무결성 적용)
npm run data:regenerate

# 결과 확인
npm run data:validate
```

### 순차 검증 (권장)
```bash
# 1. 현재 상태 검증
npm run data:validate

# 2. 자동화 테스트
npm run data:test

# 3. 예약 시간 수정 (선택사항)
npm run data:fix-times

# 4. 빌드 확인
npm run build
```

---

## 데이터 무결성 규칙

### 반드시 지켜야 할 규칙

1. **행사-차량 배치**
   ```
   ❌ 잘못된 경우: 행사에 차량이 배치되지 않음
   ✅ 올바른 경우: 모든 행사는 최소 1대의 차량 배치
   ```

2. **차량-사물함 배치**
   ```
   ❌ 잘못된 경우: 차량에 사물함이 없음
   ✅ 올바른 경우: 모든 차량은 최소 50개의 사물함 보유
   ```

3. **예약-사물함-차량-행사 체인**
   ```
   ❌ 잘못된 경우:
   Reservation(EVT-A) → Locker → Vehicle(EVT-B)

   ✅ 올바른 경우:
   Reservation(EVT-A) → Locker → Vehicle(EVT-A)
   ```

4. **데이터 고유성**
   ```
   ❌ 잘못된 경우: ID 중복
   ✅ 올바른 경우: 모든 ID는 고유함
   ```

---

## 문제 해결 가이드

### 무결성 검증 실패 시

```bash
# 1. 현재 상태 확인
npm run data:validate

# 2. 문제 식별
# 출력된 오류 메시지 분석

# 3. 해결책 적용
# - 외래키 오류: 데이터 수정 또는 재생성
# - 비즈니스 로직 오류: 예약 재생성 (npm run data:regenerate)
# - 데이터 일관성 오류: 중복 ID 또는 NULL 값 수정

# 4. 재검증
npm run data:validate
npm run data:test
```

### 자동 테스트 실패 시

```bash
# 1. 테스트 실행
npm run data:test

# 2. 실패 항목 확인
# 실패한 테스트와 메시지 읽기

# 3. 원인별 해결
실패 항목        | 원인              | 해결 방법
요청 없음         | 데이터 로드 실패   | 파일 경로 확인
구조 검증 실패    | 필수 필드 누락    | 필드명 확인 및 추가
외래키 실패      | 잘못된 참조       | 데이터 수정
비즈니스 로직     | 예약 할당 오류     | 데이터 재생성
분포 검증 실패    | 미배치 자원       | 데이터 재생성
```

---

## 모니터링 및 유지보수

### 정기점검 체크리스트

- [ ] 주 1회: `npm run data:validate` 실행
- [ ] 주 1회: `npm run data:test` 실행
- [ ] 신규 예약 생성 후: 검증 실행
- [ ] 차량 배치 변경 후: 검증 실행
- [ ] 사물함 추가/제거 후: 검증 실행

### 알림 설정 (권장)

package.json에 훅 추가:
```json
"husky": {
  "hooks": {
    "pre-commit": "npm run data:test",
    "pre-push": "npm run data:validate && npm run data:test"
  }
}
```

---

## 성능 최적화

### 현재 성능

```
데이터 크기:
- 행사: 42개
- 차량: 109대
- 사물함: 1,000개
- 고객: 436명
- 예약: 866개

조인 성능:
- 1,000회 조인: < 1초
- 맵 기반 조회: O(1) 복잡도
```

### 개선 권장사항

1. **대규모 데이터 확장 시**
   ```javascript
   // 인덱싱 추가
   const eventIndex = new Map()
   const vehicleIndex = new Map()
   ```

2. **캐싱 적용**
   ```javascript
   // 메모이제이션 사용
   const memoizedGetLocker = (lockerId) => {
     if (!cache.has(lockerId)) {
       cache.set(lockerId, lockerMap.get(lockerId))
     }
     return cache.get(lockerId)
   }
   ```

---

## 참고 자료

### 스크립트 위치
- 재생성: `scripts/regenerate-reservations-correct.js` (npm run data:regenerate)
- 검증: `scripts/validate-data-integrity.js` (npm run data:validate)
- 테스트: `scripts/test-data-validation.js` (npm run data:test)
- 시간 수정: `scripts/fix-reservation-times.js` (npm run data:fix-times)

### 데이터 파일 위치
- 행사: `src/data/events.js`
- 차량: `src/data/vehicles.js`
- 사물함: `src/data/lockers.js`
- 고객: `src/data/customers.js`
- 예약: `src/data/reservations.js`

### 관련 컴포넌트
- 예약 관리: `src/pages/admin/ReservationView.vue`
- 모니터링: `src/pages/admin/MonitoringView.vue`
- 데이터 스토어: `src/stores/dataStore.js`

---

## FAQ

### Q: 예약 데이터를 재생성해도 괜찮을까요?
**A:** 네, 안전합니다. 재생성 전에 필요한 데이터는 백업하세요.

### Q: 검증은 얼마나 자주 해야 하나요?
**A:** 주 1회는 권장합니다. 데이터 변경 후에는 항상 실행하세요.

### Q: 자동 테스트가 실패하면?
**A:** 데이터 재생성(`npm run data:regenerate`) 또는 손상된 데이터 수정 필요합니다.

### Q: 새로운 행사를 추가하면?
**A:** 1. 행사 추가 2. 차량 배치 3. 예약 생성 후 `npm run data:validate` 실행

### Q: 예약 시간을 수정하려면?
**A:** `npm run data:fix-times` 실행 후 `npm run data:validate`로 검증

---

## 최종 상태

### 2025-12-03 (최종 업데이트)

| 항목 | 상태 | 수치 |
|------|------|------|
| **무결성** | ✅ | 100% (866/866) |
| **예약 시간 정합성** | ✅ | 행사 날짜 기반 수정 완료 |
| **데이터 검증** | ✅ | 26/26 테스트 통과 |
| **빌드** | ✅ | 성공 (6.91초) |
| **사물함 활용률** | ✅ | 86.60% (866/1000) |

### 개선 이력

```
[1차] 데이터 무결성 개선 (3가지 방안)
  - 예약 데이터 재생성 (866건)
  - 데이터 검증 도구
  - 자동화 테스트

[2차] 데이터 정합성 개선
  - 예약 시간을 행사 날짜 기반으로 수정
  - 행사 관리의 예약 건수 표시 정확성 향상
```
