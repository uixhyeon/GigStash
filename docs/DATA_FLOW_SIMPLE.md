# 데이터 흐름 - 초간단 버전

## 🎯 핵심 개념: 2가지 데이터 소스

```
데이터 출처가 2가지입니다:

1️⃣ Mock 모드        2️⃣ Firebase 모드
   (개발용)            (실제 운영용)

로컬 JSON 파일    ← API_CONFIG.mode → Google 클라우드 DB
(내 컴퓨터)                            (인터넷 서버)
```

---

## 📍 구체적인 경로

### 파일/데이터 구조

```
프로젝트 구조:
.
├── .env                          ← Firebase 자격증명 저장 🔐
├── src/
│   ├── config/
│   │   ├── firebase.config.js   ← Firebase 초기화 (db 생성)
│   │   └── api.config.js        ← Mode 선택 (mock or firebase)
│   │
│   ├── api/
│   │   ├── reservationService.js ← 어느 쪽 데이터 쓸지 결정
│   │   ├── customerService.js
│   │   └── lockerService.js
│   │
│   ├── data/                     ← Mock 모드 데이터
│   │   ├── reservations.json     (147개)
│   │   ├── customers.json        (15개)
│   │   ├── lockers.json          (1000개)
│   │   └── events.json           (48개)
│   │
│   └── stores/
│       └── dataStore.js          ← 전체 앱에서 공유하는 저장소
│
└── (Google Firebase 클라우드)    ← Firebase 모드 데이터
    gigstash-91197.firebaseapp.com
    └─ Firestore
       ├─ reservations (147개)
       ├─ customers (15개)
       ├─ lockers (1000개)
       └─ events (48개)
```

---

## 🔄 데이터 로드 과정

### 🟢 Mock 모드 (개발 중)

```
Step 1: App 시작
         ↓
Step 2: api.config.js 확인
        mode = 'mock' ✓
         ↓
Step 3: reservationService.getAll() 실행
         ↓
Step 4: JSON 파일 로드
        src/data/reservations.json → 메모리로
         ↓
Step 5: JavaScript로 필터링/정렬
         ↓
Step 6: dataStore에 저장
         ↓
Step 7: Vue 컴포넌트에서 사용
        computed(() => dataStore.reservations)
         ↓
Step 8: 테이블 렌더링
```

### 🔵 Firebase 모드 (실제 운영)

```
Step 1: App 시작
         ↓
Step 2: api.config.js 확인
        mode = 'firebase' ✓
         ↓
Step 3: .env 파일에서 Firebase 자격증명 로드
        VITE_FIREBASE_API_KEY
        VITE_FIREBASE_PROJECT_ID
        ...등
         ↓
Step 4: firebase.config.js 실행
        → initializeApp(firebaseConfig)
        → const db = getFirestore(app)
         ↓
Step 5: reservationService.getAll() 실행
         ↓
Step 6: Firestore 쿼리 실행
        const q = query(collection(db, 'reservations'), ...)
        const snapshot = await getDocs(q)
         ↓
Step 7: 결과를 JavaScript 객체로 변환
         ↓
Step 8: dataStore에 저장
         ↓
Step 9: Vue 컴포넌트에서 사용
         ↓
Step 10: 테이블 렌더링
```

---

## 🎛️ 모드 전환 방법

### 방법 1: 코드에서

```javascript
// src/config/api.config.js
export const API_CONFIG = {
  mode: 'firebase',  // ← 'mock'으로 바꾸면 로컬 JSON 사용
}
```

### 방법 2: 콘솔에서 실시간 전환

```javascript
// 브라우저 DevTools (F12) → Console 탭에서 실행:

window.__TOGGLE_API_MODE__()  // mock ↔ firebase 즉시 전환
window.__GIGSTASH_API_CONFIG__ // 현재 설정 확인
```

---

## 🔐 .env 파일 역할

```env
# Firebase 자격증명
VITE_FIREBASE_API_KEY=AIzaSyDZMwpE-vd_Cdknrnb5VN27krjRDwiknkk
VITE_FIREBASE_PROJECT_ID=gigstash-91197
VITE_FIREBASE_AUTH_DOMAIN=gigstash-91197.firebaseapp.com
...

# API 설정
VITE_API_MODE=firebase
VITE_API_BASE_URL=http://localhost:3000/api
```

**중요:**
- `.env`는 Git에 커밋하면 안 됨 (보안)
- `.gitignore`에 `.env` 등록되어 있음
- 실제 배포 시 다른 자격증명 사용

---

## 📊 각 파일의 역할

| 파일 | 용도 | 구체적 역할 |
|------|------|-----------|
| `.env` | 환경 변수 | Firebase 자격증명 저장 |
| `firebase.config.js` | Firebase 초기화 | db 객체 생성 |
| `api.config.js` | 모드 선택 | Mock vs Firebase 결정 |
| `reservationService.js` | API 계층 | 데이터 조회 로직 |
| `customerService.js` | API 계층 | 고객 데이터 조회 |
| `lockerService.js` | API 계층 | 사물함 데이터 조회 |
| `dataStore.js` | 상태 관리 | 앱 전체 데이터 공유 |
| `src/data/*.json` | Mock 데이터 | 로컬 테스트용 |

---

## 🌐 Firebase가 API인가?

**YES!** Firebase는 구글이 제공하는 "백엔드 서비스"입니다.

```
일반적인 구조:
Vue.js (프론트) ← HTTP API → 우리 서버 (백엔드) ← 데이터베이스

Firebase 구조:
Vue.js (프론트) ← Firebase SDK → Google 서버 (데이터베이스)
                 (REST/WebSocket)

핵심:
- Firebase SDK = 네트워크 통신 라이브러리
- Google 서버 = 백엔드 + 데이터베이스 (모두 포함)
```

**우리 코드에서는:**
```javascript
// Firebase에 직접 쿼리 (백엔드 서버 없음)
const snapshot = await getDocs(query(collection(db, 'reservations')))
// ↑ Firebase SDK가 자동으로 Google 서버와 통신
```

---

## 💡 실제 데이터 흐름 예시

### 예약관리 페이지 열기 (Firebase 모드)

```
1. User가 예약관리 페이지 클릭
   ↓
2. ReservationView.vue 로드
   ↓
3. 컴포넌트에서 dataStore.reservations 읽으려고 함
   ↓
4. 데이터가 없으면 App.vue의 onMounted() 재실행
   ↓
5. reservationService.getAll() 호출
   ↓
6. API_CONFIG.mode 확인 → 'firebase'
   ↓
7. firebase.config.js의 db 사용
   ↓
8. query(collection(db, 'reservations')) 생성
   ↓
9. getDocs() 실행
   ↓
10. 🌐 Google 서버로 HTTP 요청 전송
           (자동으로 Firebase SDK가 처리)
   ↓
11. Google 서버에서 데이터 조회
    (Firestore DB에서 reservations 컬렉션의 모든 문서)
   ↓
12. 응답 받기 (JSON 형식)
    ↓
13. JavaScript에서 객체로 변환
    ↓
14. dataStore.setReservations(data) 저장
    ↓
15. ReservationView.vue 자동 리렌더링
    (computed로 감시 중)
    ↓
16. 테이블에 147개 예약 데이터 표시 ✓
```

---

## 🚀 개발 vs 운영

```
개발 중:
  api.config.js: mode = 'mock'
  → 로컬 JSON 파일 사용
  → 인터넷 연결 불필요
  → 빠른 테스트

운영 중:
  api.config.js: mode = 'firebase'
  → Google Firebase 클라우드 사용
  → 영구 저장
  → 여러 사용자 동시 지원
  → 자동 백업
```

---

## 📝 정리

| 요소 | 설명 |
|------|------|
| **데이터 저장소** | 2가지: 로컬 JSON vs Google Firebase |
| **모드 선택** | `api.config.js`의 `mode` 변수 |
| **Firebase 자격증명** | `.env` 파일에 저장 |
| **DB 초기화** | `firebase.config.js`에서 `db` 객체 생성 |
| **데이터 조회** | API 서비스 계층 (reservationService 등) |
| **전체 앱 공유** | Pinia의 `dataStore.js` |
| **화면 표시** | Vue 컴포넌트에서 dataStore 참조 |

이제 전체 구조가 명확해야 합니다! 🎉
