# Firebase 통합 구현 요약

## 🎯 개요

GigStash 프로젝트에 **Firebase Firestore** 기반 실시간 데이터 관리 시스템을 설계하고 구현했습니다.

**목표:**
- 사물함 데이터 실시간 동기화
- 예약 상태 실시간 모니터링
- Alert 시스템 자동화
- 다중 사용자 동시 접근 지원

---

## 📦 구현 완료 항목

### 1. Firebase 설정 구조 ✅

**생성된 파일:**
- `src/config/firebase.config.js` - Firebase 설정 및 컬렉션 구조 정의
- `src/lib/firebase.js` - Firebase 초기화 및 emulator 설정
- `.env.example` - 환경 변수 템플릿

**특징:**
- 다중 컬렉션 지원 (lockers, vehicles, reservations, alerts, customers, events)
- 개발/프로덕션 모드 분리
- Emulator 지원 (로컬 개발용)

### 2. API 서비스 모더나이제이션 ✅

#### lockerService.js
```javascript
// 현재: Mock 모드 지원
// 이후: Firebase Firestore 쿼리 추가 가능

주요 메서드:
- getAll(params) - 전체 사물함 조회 (필터링 지원)
- getById(id) - 상세 조회
- getByVehicleId(vehicleId) - 차량별 조회
- updateStatus(id, status) - 상태 변경
- updateTemperature(id, temperature) - 온도 업데이트
- assignReservation(id, reservationId) - 예약 할당
- releaseReservation(id) - 예약 해제
- getAvailable(size) - 사용 가능 사물함 조회
```

#### reservationService.js
```javascript
// 현재: Mock 모드 지원
// 이후: Firebase Firestore 실시간 업데이트 추가 가능

주요 메서드:
- getAll(params) - 전체 예약 조회
- getById(id) - 상세 조회
- create(data) - 예약 생성
- update(id, data) - 예약 수정
- cancel(id, reason) - 예약 취소
- complete(id) - 예약 완료
- getToday() - 오늘 예약
- getActive() - 활성 예약
```

### 3. 문서화 ✅

**docs/FIREBASE_SETUP.md**
- Firebase 프로젝트 생성 단계별 가이드
- Firestore 데이터베이스 설정 방법
- 보안 규칙 예제
- 웹 앱 설정 및 API 키 발급 절차
- 컬렉션 구조 및 필드 정의
- 문제 해결 가이드

---

## 🏗️ 아키텍처

### 데이터 흐름

```
┌─────────────────────────────────────┐
│      Vue 3 Components               │
│  (Admin/Worker Pages)               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Pinia Data Store (dataStore.js)   │
│  (State Management & Normalization) │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      API Services Layer             │
│  - lockerService.js                 │
│  - reservationService.js            │
│  - vehicleService.js (TBD)          │
│  - alertService.js (TBD)            │
└────────────┬────────────────────────┘
             │
        ┌────┴────┐
        │          │
   ┌────▼──┐   ┌──▼──────┐
   │ Mock  │   │ Firebase │
   │ Mode  │   │ Firestore│
   │ JSON  │   │          │
   └───────┘   └──────────┘
```

### Mock vs Firebase 모드

**현재 (Mock 모드)**
- 로컬 JSON 파일에서 데이터 로드
- API_CONFIG.mode = 'mock'
- 개발/테스트용으로 최적화

**미래 (Firebase 모드)**
- Firestore에서 실시간 데이터 동기화
- API_CONFIG.mode = 'firebase'
- 프로덕션 배포용

---

## 📊 Firestore 컬렉션 설계

### lockers 컬렉션
```json
{
  "id": "L001-S001",
  "number": "VEH-001-S001",
  "vehicleId": "VEH-001",
  "section": "Small",
  "position": "front-left",
  "size": "small",
  "location": "VEH-001 (서울12가1234) - 앞칸 왼쪽",
  "status": "available|in-use|maintenance|broken",
  "temperature": 4.2,
  "features": ["냉장", "RFID"],
  "currentReservation": null,
  "lastMaintenance": timestamp,
  "lastUpdated": timestamp
}
```

**인덱싱 전략:**
```
복합 인덱스:
- (vehicleId, status)
- (status, size)
- (status, number)
```

### vehicles 컬렉션
```json
{
  "id": "VEH-001",
  "eventId": "EVT251101001",
  "vehicleType": "버스",
  "capacity": 50,
  "plateNumber": "서울12가1234",
  "driver": "김운전",
  "status": "완료|준비중|운행중",
  "lockerCapacity": 50,
  "filledLockers": 25,
  "createdAt": timestamp
}
```

### reservations 컬렉션
```json
{
  "id": "RES2501100001",
  "eventId": "EVT251101001",
  "customerId": "C001",
  "lockerId": "L001-S001",
  "status": "active|completed|cancelled",
  "startTime": timestamp,
  "endTime": timestamp,
  "itemDescription": "샌드위치",
  "accessCode": "1234",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### alerts 컬렉션
```json
{
  "id": "ALR001",
  "eventId": "EVT251101001",
  "vehicleId": "VEH-001",
  "type": "locker_full|low_temperature|maintenance_needed|reservation_full",
  "severity": "high|medium|low",
  "message": "사물함이 가득 찼습니다",
  "read": false,
  "metadata": {
    "filledCount": 50,
    "totalCapacity": 50
  },
  "createdAt": timestamp
}
```

---

## 🚀 Firebase 마이그레이션 단계

### Phase 1 (완료) ✅
- [x] Firebase 설정 구조 설계
- [x] Mock 모드 유지
- [x] 서비스 레이어 최적화
- [x] 빌드 성공

### Phase 2 (예정)
- [ ] Firebase 패키지 설치 (`npm install firebase`)
- [ ] env 파일 설정 (Firebase 프로젝트 정보)
- [ ] lockerService.js Firebase 쿼리 추가
- [ ] reservationService.js Firebase 실시간 업데이트 추가
- [ ] onSnapshot 리스너 구현

### Phase 3 (예정)
- [ ] alertService.js 구현 (Alert 생성/관리)
- [ ] Cloud Functions 배포 (자동 alert 생성)
- [ ] firestore.rules 설정 (보안)
- [ ] Authentication 통합

### Phase 4 (예정)
- [ ] 성능 최적화 (인덱싱, 쿼리 최적화)
- [ ] 오프라인 지원 (IndexedDB)
- [ ] 분석 대시보드 (Firebase Analytics)

---

## 💾 차량당 50개 사물함 구조

**설계 (사이즈 기반):**
- Small: 25개 (일반 물품)
- Medium: 15개 (중형 물품)
- Large: 10개 (대형 물품)
- **총 50개/차량 × 20개 차량 = 1,000개 locker**

**ID 규칙:**
```
VEH-001-S001  (첫 번째 차량, Small 섹션, 첫 번째)
VEH-001-M001  (첫 번째 차량, Medium 섹션, 첫 번째)
VEH-001-L001  (첫 번째 차량, Large 섹션, 첫 번째)
```

---

## 🔧 설정 방법

### 1. Firebase 프로젝트 생성
```bash
# docs/FIREBASE_SETUP.md 참고
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# Firebase 설정 정보 입력
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase 패키지 설치
```bash
npm install firebase
```

### 4. API 모드 전환
```bash
# .env
VITE_API_MODE=firebase  # 또는 'mock'
```

### 5. 실행
```bash
npm run dev  # 개발 모드
npm run build  # 프로덕션 빌드
```

---

## 🔒 보안 규칙 (Firestore)

**개발 환경 (테스트용):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```

**프로덕션 환경 (권장):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // 특정 역할 기반 접근
    match /lockers/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /alerts/{document=**} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isOwnerOrAdmin(resource.data.userId);
    }
  }

  function isAuthenticated() {
    return request.auth != null;
  }

  function isAdmin() {
    return request.auth.token.admin == true;
  }

  function isOwnerOrAdmin(userId) {
    return request.auth.uid == userId || isAdmin();
  }
}
```

---

## 📈 성능 고려사항

### Firestore 최적화

**인덱싱:**
```
자동 인덱싱:
- vehicleId
- status
- size
- createdAt

복합 인덱싱 (필요시):
- (vehicleId, status)
- (status, size)
```

**쿼리 최적화:**
```javascript
// ❌ 나쁜 예: 모든 문서 로드
const allLockers = await getDocs(collection(db, 'lockers'))

// ✅ 좋은 예: 필터링된 쿼리
const availableLockers = await getDocs(
  query(collection(db, 'lockers'),
    where('status', '==', 'available'),
    where('vehicleId', '==', 'VEH-001')
  )
)
```

**배치 작업:**
```javascript
// 여러 문서 업데이트 (배치)
const batch = writeBatch(db)
lockers.forEach(locker => {
  batch.update(doc(db, 'lockers', locker.id), {
    status: 'available'
  })
})
await batch.commit()
```

---

## 🧪 테스트

### Mock 모드 테스트
```bash
npm run dev
# 로컬 JSON 데이터로 모든 기능 테스트
```

### Firebase 모드 테스트
```bash
# Firebase Emulator Suite 설치
npm install -g firebase-tools

# Emulator 실행
firebase emulators:start

# .env에서 설정
VITE_API_MODE=firebase
```

---

## 📚 참고자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 웹 SDK](https://firebase.google.com/docs/firestore/client/libraries)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Functions 가이드](https://firebase.google.com/docs/functions)
- [GigStash ERD](./ERD.md)

---

## ✨ 주요 특징

1. **Mock/Firebase 이중 지원**
   - 개발: JSON 데이터 사용
   - 프로덕션: Firestore 실시간 동기화

2. **확장 가능한 구조**
   - 새로운 서비스 추가 용이
   - 컬렉션 확장 가능

3. **완전한 문서화**
   - 설정 가이드
   - 컬렉션 스키마
   - 쿼리 예제

4. **개발자 친화적**
   - Emulator 지원
   - 자동 타입 체크
   - 명확한 에러 처리

---

## 🎓 학습 포인트

이 구현을 통해 다음을 배울 수 있습니다:

- ✅ Firebase Firestore 설계 및 구조화
- ✅ 실시간 데이터베이스 쿼리 최적화
- ✅ Mock/실제 API 이중 지원 패턴
- ✅ 클라우드 데이터베이스 보안 규칙
- ✅ 대규모 데이터 관리 (1000+ 문서)
- ✅ 컬렉션 관계형 설계

---

## 📝 다음 단계

1. **Firebase 프로젝트 생성** (docs/FIREBASE_SETUP.md)
2. **env 파일 구성**
3. **Firebase 패키지 설치**
4. **lockerService.js 업그레이드**
5. **실시간 리스너 구현**
6. **Alert 시스템 개발**
7. **Cloud Functions 배포**

---

**작성 날짜:** 2025년 12월 1일
**버전:** 1.0.0
**상태:** 설계 완료, 개발 준비 완료
