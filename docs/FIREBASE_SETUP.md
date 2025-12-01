# Firebase 설정 가이드

GigStash 프로젝트에서 Firebase(Firestore)를 사용하여 **사물함 데이터 실시간 관리** 및 **Alert 시스템**을 구현합니다.

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com)에 접속
2. Google 계정으로 로그인

### 1.2 새 프로젝트 생성
1. **"프로젝트 생성"** 클릭
2. 프로젝트 이름: `GigStash` (또는 원하는 이름)
3. **계속** 클릭
4. Google 애널리틱스 활성화 (선택사항)
5. **프로젝트 생성** 클릭

## 2. Firestore Database 설정

### 2.1 Firestore 활성화
1. Firebase Console에서 좌측 메뉴 **"Firestore Database"** 선택
2. **"데이터베이스 만들기"** 클릭
3. 지역 선택: **asia-northeast1 (도쿄)** 또는 **asia-southeast1 (싱가포르)** 권장
4. 보안 규칙: **테스트 모드로 시작** (개발용, 나중에 변경)
5. **데이터베이스 만들기** 클릭

### 2.2 Firestore 보안 규칙 설정 (선택사항)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개발 환경: 모든 접근 허용 (테스트용)
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }

    // 프로덕션: 인증된 사용자만 접근
    // match /lockers/{document=**} {
    //   allow read: if request.auth != null;
    //   allow write: if request.auth != null && request.auth.token.role == 'admin';
    // }
  }
}
```

## 3. 웹 앱 설정

### 3.1 웹 앱 추가
1. Firebase Console에서 **"프로젝트 설정"** (상단 우측)
2. **"내 앱"** 탭
3. **"앱 추가"** 클릭 → **웹** 선택
4. 앱 닉네임: `GigStash Web` 입력
5. **앱 등록** 클릭

### 3.2 Firebase 설정 정보 복사
다음과 같은 코드가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 4. 프로젝트 설정

### 4.1 .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 위의 설정 정보를 입력합니다:

```bash
# Firebase 설정
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# API 설정 (현재는 mock 모드 사용)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_MODE=mock
```

### 4.2 npm 패키지 설치
```bash
npm install
```

## 5. Firestore 컬렉션 구조

### 5.1 수동으로 컬렉션 생성 (선택사항)
Firebase Console에서 다음 컬렉션을 생성합니다:

#### lockers 컬렉션
```javascript
{
  "id": "L001-S001",
  "number": "VEH-001-S001",
  "vehicleId": "VEH-001",
  "section": "Small",
  "position": "front-left",
  "size": "small",
  "location": "VEH-001 (서울12가1234) - 앞칸 왼쪽",
  "status": "available",
  "temperature": 4.2,
  "features": ["냉장", "RFID"],
  "currentReservation": null,
  "lastMaintenance": timestamp
}
```

#### vehicles 컬렉션
```javascript
{
  "id": "VEH-001",
  "eventId": "EVT251101001",
  "vehicleType": "버스",
  "capacity": 50,
  "plateNumber": "서울12가1234",
  "driver": "김운전",
  "status": "완료",
  "lockerCapacity": 50,
  "filledLockers": 25
}
```

#### reservations 컬렉션
```javascript
{
  "id": "RES2501100001",
  "eventId": "EVT251101001",
  "customerId": "C001",
  "lockerId": "L001-S001",
  "status": "active",
  "startTime": timestamp,
  "endTime": timestamp,
  "createdAt": timestamp
}
```

#### alerts 컬렉션
```javascript
{
  "id": "ALR001",
  "eventId": "EVT251101001",
  "vehicleId": "VEH-001",
  "type": "locker_full",
  "severity": "high",
  "message": "사물함이 가득 찼습니다",
  "read": false,
  "createdAt": timestamp
}
```

## 6. 데이터 마이그레이션 (선택사항)

JSON 데이터를 Firestore로 마이그레이션하려면:

```bash
# 마이그레이션 스크립트 실행
node scripts/migrate-to-firestore.js
```

## 7. API 모드 전환

### 7.1 Mock 모드 (개발용, 기본값)
- 로컬 JSON 데이터 사용
- Firebase 설정 불필요
- 오프라인에서도 작동

```bash
VITE_API_MODE=mock
```

### 7.2 Firebase 모드 (프로덕션)
- Firestore 데이터 사용
- 실시간 업데이트 지원
- 다중 사용자 동기화

```bash
VITE_API_MODE=firebase
```

## 8. 실행

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build
```

## 9. 주요 기능

### 9.1 실시간 사물함 모니터링
```javascript
// onVehicleLockers를 사용하여 실시간 업데이트
lockerService.onVehicleLockers('VEH-001', (lockers) => {
  console.log('차량별 사물함 업데이트:', lockers)
})
```

### 9.2 실시간 예약 상태 변경
```javascript
// onReservationStatusChange를 사용하여 실시간 업데이트
reservationService.onReservationStatusChange('RES2501100001', (reservation) => {
  console.log('예약 상태 변경:', reservation)
})
```

### 9.3 Alert 시스템
```javascript
// 사물함이 가득 찬 경우 자동으로 alert 생성
// Firebase Cloud Functions를 통해 구현
```

## 10. 문제 해결

### 10.1 "Missing or insufficient permissions" 에러
- Firebase Console의 "Firestore Database" → "규칙" 탭에서 보안 규칙 확인
- 테스트 모드에서는 모든 접근이 허용되어야 함

### 10.2 "Failed to initialize Firebase"
- .env 파일의 설정 정보가 정확한지 확인
- Firebase Console에서 웹 앱 설정 정보 다시 확인

### 10.3 실시간 업데이트가 작동하지 않음
- Firestore Database 활성화 확인
- 보안 규칙에서 읽기/쓰기 권한 확인
- 브라우저 콘솔에서 에러 메시지 확인

## 11. 참고자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 웹 SDK](https://firebase.google.com/docs/firestore/client/libraries)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Functions 가이드](https://firebase.google.com/docs/functions)

## 12. 다음 단계

1. **Cloud Functions 설정**: Alert 시스템 자동화
   ```bash
   firebase init functions
   npm install --prefix functions
   ```

2. **Authentication 추가**: 사용자 인증 및 권한 관리
   ```javascript
   import { getAuth } from 'firebase/auth'
   ```

3. **Cloud Storage 활성화**: 고객 이미지 저장
   ```javascript
   import { getStorage } from 'firebase/storage'
   ```

4. **Analytics 활성화**: 사용자 행동 분석
   ```javascript
   import { getAnalytics } from 'firebase/analytics'
   ```
