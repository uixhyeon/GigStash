# 🚀 GUIDE 0 - 여기서 시작하세요!

**GigStash 프로젝트의 완전한 이해를 위한 최종 요약 가이드**

---

## 📌 이 문서를 읽어야 하는 사람

- GigStash 프로젝트에 처음 참여하는 개발자
- 프로젝트 구조와 데이터 흐름을 빠르게 이해하고 싶은 사람
- 앞으로 코드를 수정할 때 어디를 건드려야 하는지 알고 싶은 사람

---

## 🎯 이 가이드로 배울 수 있는 것

```
✅ GigStash의 전체 아키텍처 이해
✅ 데이터가 어떻게 흘러가는지 이해
✅ Mock 모드와 Firebase 모드의 차이
✅ App.vue와 Stores의 관계 이해
✅ CORS가 무엇인지, 왜 필요한지 이해
✅ 각 폴더와 파일의 역할 정확히 파악
```

---

## 📚 가이드 로드맵

```
START: GUIDE_0_START_HERE.md (이 문서)
  ↓
├─ 📖 COMPLETE_GUIDE.md
│   (7가지 핵심 요소 상세 분석)
│
├─ 🔐 CORS_COMPLETE_GUIDE.md
│   (웹 보안과 CORS 이해)
│
└─ 🔄 APP_VUE_STORES_FLOW.md
    (App.vue와 Stores의 관계)

총 학습 시간: 약 2-3시간
```

---

## 🌍 Part 0: GigStash는 무엇인가?

### 프로젝트 개요

```
GigStash = 기사(근로자)의 짐을 보관하는 서비스

실제 사용 시나리오:
1. 기사: "기사 앱에서 예약 신청"
2. 고객: "사물함에 짐 맡김"
3. 기사: "짐을 회수"

필요한 것들:
✅ 예약 관리 시스템
✅ 사물함 관리 시스템
✅ 고객 관리 시스템
✅ 행사 관리 시스템
```

### 기술 스택

```
프론트엔드:
├─ Vue 3 (UI 프레임워크)
├─ Vite (빌드 도구)
├─ Pinia (상태 관리)
├─ Tailwind CSS (스타일링)
└─ Firebase SDK (데이터 통신)

백엔드:
└─ Firebase Firestore (클라우드 데이터베이스)

개발 도구:
├─ Node.js
├─ npm
└─ Git
```

---

## 🏗️ Part 1: 전체 구조 - 한눈에 보기

### 프로젝트 폴더 구조

```
GigStash/
├── src/
│   ├── main.js              ← 앱의 시작점
│   ├── App.vue              ← 최상위 컴포넌트
│   │
│   ├── config/              ← 설정 폴더
│   │   ├── firebase.config.js   (Firebase 초기화)
│   │   └── api.config.js        (API 모드 선택)
│   │
│   ├── api/                 ← API 서비스 폴더
│   │   ├── reservationService.js
│   │   ├── customerService.js
│   │   └── lockerService.js
│   │
│   ├── stores/              ← 데이터 저장소 (Pinia)
│   │   ├── dataStore.js         (데이터 저장)
│   │   └── auth.js              (인증 저장)
│   │
│   ├── pages/               ← 페이지 컴포넌트
│   │   ├── admin/
│   │   │   ├── AdminMain.vue
│   │   │   ├── ReservationView.vue
│   │   │   └── ...
│   │   └── worker/
│   │       └── ...
│   │
│   ├── data/                ← Mock 테스트 데이터
│   │   ├── lockers.json (1000개)
│   │   ├── customers.json (15개)
│   │   ├── reservations.json (147개)
│   │   └── events.json (48개)
│   │
│   └── router/              ← 라우팅 설정
│       └── index.js
│
├── .env                     ← Firebase 자격증명 (보안!)
├── package.json
└── vite.config.js
```

---

## 🔄 Part 2: 데이터 흐름 - 3단계 요약

### 1️⃣ 앱 시작 (초기화)

```
main.js 실행
  ↓
Vue 앱 생성
  ↓
App.vue 마운트
  ↓
App.vue의 onMounted() 자동 실행
  ├─ useDataStore() 호출 (Pinia Store 가져오기)
  │
  ├─ reservationService.getAll() 호출 (API 호출)
  │  ├─ Mock 모드: src/data/reservations.json 로드
  │  └─ Firebase 모드: Google 서버에서 조회
  │
  ├─ customerService.getAll() 호출 (API 호출)
  │
  └─ dataStore.setReservations(data) 저장
     └─ 모든 자식 컴포넌트에서 접근 가능!
```

### 2️⃣ 페이지 렌더링

```
사용자가 "예약관리" 페이지 클릭
  ↓
ReservationView.vue 렌더링
  ↓
useDataStore() 호출
  ↓
computed(() => dataStore.reservations) 사용
  └─ App.vue에서 이미 저장한 데이터 접근!
  ↓
테이블 렌더링
  └─ 예약 147개 표시 ✓
```

### 3️⃣ 데이터 변경 (상호작용)

```
사용자가 "예약 완료" 버튼 클릭
  ↓
reservationService.complete(id) 호출
  ├─ Firebase: 서버에서 데이터 수정
  └─ 응답 수신
  ↓
dataStore.updateReservation(id, {...}) 호출
  └─ 로컬 데이터 수정
  ↓
computed가 변경 감지
  └─ 자동으로 테이블 리렌더링 ✓
```

---

## 🎛️ Part 3: 핵심 3가지 개념

### 개념 1️⃣: 데이터 출처 (2가지 모드)

```
┌─────────────────────────────────────┐
│      API_CONFIG.mode                │
│  (src/config/api.config.js)         │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ↓                ↓
   'mock' 모드      'firebase' 모드
       │                │
   ┌───────────┐   ┌──────────────┐
   │ JSON 파일 │   │ Firebase 서버 │
   │ (로컬)    │   │ (클라우드)    │
   │           │   │              │
   │ lockers   │   │ Firestore DB │
   │ customers │   │ - lockers    │
   │ reserv... │   │ - customers  │
   │ events    │   │ - reserv...  │
   └───────────┘   │ - events     │
                   └──────────────┘
```

**선택 기준:**
- **Mock**: 개발 중 빠른 테스트, 인터넷 불필요
- **Firebase**: 실제 운영, 다중 사용자, 영구 저장

**모드 전환:**
```javascript
// 방법 1: 코드에서
// src/config/api.config.js
mode: 'firebase'  // ← 'mock' 또는 'firebase'

// 방법 2: 콘솔에서 (즉시 전환)
window.__TOGGLE_API_MODE__()  // F12 → Console
```

---

### 개념 2️⃣: Pinia 상태 관리 (데이터 공유)

```
Props로 전달하는 대신:
┌─────────┐        ┌─────────┐        ┌─────────┐
│ Parent  │─Props─>│ Child   │─Props─>│GrandC   │
└─────────┘        └─────────┘        └─────────┘
                                       (깊음! 복잡!)

Pinia로 관리 (권장):
        ┌────────────────┐
        │ Pinia Store    │
        │ (dataStore.js) │
        └────┬───────────┘
             │
    ┌────────┼────────┐
    ↓        ↓        ↓
┌────────┐┌────────┐┌────────┐
│Parent  ││Child   ││WorkerM │
└────────┘└────────┘└────────┘
(모두 직접 접근 가능!)
```

**Pinia의 역할:**
```
데이터 저장 → 계산 → 변경 → 자동 업데이트

const reservations = computed(
  () => dataStore.reservations  // 자동 감시
)
// dataStore.reservations이 변경되면
// computed가 자동으로 다시 실행됨
// → UI가 자동으로 업데이트됨 ✓
```

---

### 개념 3️⃣: CORS (웹 보안)

```
브라우저의 기본 규칙:
"다른 도메인(출처)의 데이터는 받지 않겠다"

왜? CSRF 공격 방지:

예: 악의적 사이트 attack
1. 사용자가 bank.com 접속 (인증됨)
2. 같은 브라우저에서 evil.com 클릭
3. evil.com의 악의적 JavaScript:

   fetch('https://bank.com/transfer', {
     method: 'POST',
     body: { to: '해커 계좌', amount: 1000000 }
     credentials: 'include'  // 쿠키도 함께!
   })

4. 브라우저가 규칙 없으면:
   "유효한 쿠키 있네? 거래 승인!"
   → 사용자 돈 모두 도용됨! 😱

해결: CORS (Cross-Origin Resource Sharing)
1. 브라우저가 요청 전에 확인:
   "evil.com에서 bank.com으로 요청?
    bank.com 서버가 허용했어?"

2. bank.com 서버 응답:
   "no way! evil.com은 거부"
   또는
   "응, 우리 도메인만 허용"

3. 결과: 악의적 요청 차단! ✓
```

**우리 프로젝트:**
```
Firebase가 CORS 지원함
→ 응답 헤더에 자동으로 포함:
   Access-Control-Allow-Origin: *

결과: CORS 에러 없음! ✓
```

---

## 🔑 Part 4: 핵심 파일 5가지

### 파일 1️⃣: .env (Firebase 자격증명)

```env
VITE_FIREBASE_API_KEY=AIzaSyDZMwpE-vd_Cdknrnb5VN27krjRDwiknkk
VITE_FIREBASE_PROJECT_ID=gigstash-91197
VITE_FIREBASE_AUTH_DOMAIN=gigstash-91197.firebaseapp.com
...
```

**역할:**
- Firebase 프로젝트의 "집 주소"
- 우리 앱을 Google의 Firebase 서버와 연결

**주의:**
- 🔐 보안 정보 (절대 Git에 커밋 금지!)
- .gitignore에 등록되어 있음

---

### 파일 2️⃣: firebase.config.js (Firebase 초기화)

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // ← .env에서 가져옴
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)  // ← 중요!
```

**역할:**
- .env의 자격증명으로 Firebase 초기화
- `db` 객체 생성 (다른 파일에서 사용)

**다른 파일에서 사용:**
```javascript
import { db } from '@/config/firebase.config'

const snapshot = await getDocs(query(collection(db, 'reservations')))
//                                            ↑ 이 db!
```

---

### 파일 3️⃣: api.config.js (모드 선택)

```javascript
export const API_CONFIG = reactive({
  mode: 'firebase',  // 'mock' 또는 'firebase'
})

// 콘솔에서 즉시 전환
window.__TOGGLE_API_MODE__()
```

**역할:**
- Mock vs Firebase 중 어느 것을 사용할지 결정
- 개발 도구로 런타임에 전환 가능

---

### 파일 4️⃣: reservationService.js (API 호출)

```javascript
export const reservationService = {
  async getAll(params = {}) {
    if (API_CONFIG.mode === 'mock') {
      // Mock: JSON 파일 사용
      let filtered = [...reservationsData.reservations]
      // JavaScript로 필터링/정렬
      return mockResponse(filtered)

    } else {
      // Firebase: Google 서버 사용
      const q = query(
        collection(db, 'reservations'),  // db는 firebase.config.js에서
        ...constraints
      )
      const snapshot = await getDocs(q)
      return { data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) }
    }
  }
}
```

**역할:**
- Mode에 따라 다른 데이터 소스에서 조회
- 모든 API 서비스가 이 패턴 따름

---

### 파일 5️⃣: stores/dataStore.js (전체 앱의 데이터)

```javascript
export const useDataStore = defineStore('data', () => {
  const reservationMap = ref(new Map())
  const reservationIds = ref([])

  const reservations = computed(() => {
    return reservationIds.value.map(id => reservationMap.value.get(id))
  })

  const setReservations = (reservations) => {
    // 데이터 저장
    reservations.forEach(r => {
      reservationMap.value.set(r.id, r)
      reservationIds.value.push(r.id)
    })
  }

  return { reservations, setReservations, ... }
})
```

**역할:**
- App.vue에서 로드한 데이터를 모든 컴포넌트에 공유
- computed로 자동 감시 (데이터 변경 시 UI 자동 업데이트)

**사용:**
```javascript
// 모든 컴포넌트에서
const dataStore = useDataStore()
const reservations = computed(() => dataStore.reservations)
```

---

## 🚀 Part 5: 실제 동작 시나리오

### 시나리오: 사용자가 예약관리 페이지 열기

```
⏱️ 0초: 사용자가 앱 접속
  ↓
⏱️ 100ms: main.js 실행
  ├─ Vue 앱 생성
  ├─ Pinia 초기화
  └─ App.vue 마운트
  ↓
⏱️ 200ms: App.vue의 onMounted() 실행
  ├─ useDataStore() 호출
  └─ reservationService.getAll() 호출
  ↓
⏱️ 300ms: API_CONFIG.mode 체크
  ├─ Mock: JSON 로드 (~100ms)
  └─ Firebase: 서버 쿼리 (~500-2000ms)
  ↓
⏱️ 400ms: 데이터 수신
  └─ dataStore.setReservations(data)
  ↓
⏱️ 500ms: Router에서 페이지 로드
  └─ ReservationView.vue 렌더링
  ↓
⏱️ 600ms: ReservationView에서 데이터 읽기
  ├─ useDataStore() 호출
  ├─ const reservations = computed(() => dataStore.reservations)
  └─ 테이블 렌더링
  ↓
⏱️ 700ms: 화면에 표시 ✓
  └─ 147개 예약 테이블 완성!
```

---

## 📊 Part 6: 파일 수정 가이드

### "이 기능을 수정하려면 어디를 건드려야 하나?"

#### Q1: 예약 데이터를 보여주는 방식을 변경하고 싶다

```
변경 대상: ReservationView.vue
파일 위치: src/pages/admin/ReservationView.vue

이유: 화면에 데이터를 표시하는 부분이 여기에 있기 때문
```

#### Q2: Firebase에서 가져오는 데이터를 필터링하고 싶다

```
변경 대상: reservationService.js
파일 위치: src/api/reservationService.js

이유: API 호출 시 데이터를 필터링하는 부분이 여기에 있기 때문
```

#### Q3: Mock 데이터를 수정하고 싶다

```
변경 대상: reservations.json
파일 위치: src/data/reservations.json

이유: Mock 모드에서 사용하는 테스트 데이터가 여기에 있기 때문
```

#### Q4: Firebase 자격증명을 변경하고 싶다

```
변경 대상: .env
파일 위치: .env (프로젝트 루트)

이유: Firebase 연결 정보가 여기에 있기 때문

주의: 절대 Git에 커밋하지 마세요!
```

#### Q5: Mock vs Firebase를 전환하고 싶다

```
변경 방법 1: 코드에서
파일: src/config/api.config.js
변경: mode: 'firebase' ↔ 'mock'

변경 방법 2: 콘솔에서 (권장)
window.__TOGGLE_API_MODE__()  // F12 → Console
```

---

## 🎓 Part 7: 다음 학습 단계

### 초급 (이 문서 수준)

```
✅ 전체 구조 이해
✅ 데이터 흐름 이해
✅ Mock vs Firebase 차이 이해
✅ 파일별 역할 이해
```

### 중급 (다음 단계)

```
📖 COMPLETE_GUIDE.md 읽기
  └─ 각 파일의 상세한 코드 이해

🔐 CORS_COMPLETE_GUIDE.md 읽기
  └─ 웹 보안 원리 심화 이해

🔄 APP_VUE_STORES_FLOW.md 읽기
  └─ App.vue와 Stores의 관계 상세 이해
```

### 고급 (숙달)

```
✅ 코드 수정 시 영향 범위 예측 가능
✅ 새로운 기능 추가 위치 결정 가능
✅ 버그 원인 추적 가능
✅ 성능 최적화 가능
```

---

## 💡 Part 8: 자주 묻는 질문

### Q: Firebase가 API인가요?

**A:** 네, Firebase는 Google이 제공하는 "Backend-as-a-Service (BaaS)"입니다.
- 일반 REST API: 우리가 서버를 만들어야 함
- Firebase: Google이 제공하는 서버 (우리는 SDK로 사용)

### Q: Mock 모드는 왜 있나요?

**A:** 개발 중 빠른 테스트를 위해서입니다.
- Firebase는 인터넷 필요 (느림)
- Mock은 메모리 사용 (빠름)
- 초기 개발에는 Mock, 테스트 후 Firebase로 전환

### Q: 데이터스토어(Pinia)는 필수인가요?

**A:** 필수는 아니지만, 권장합니다.
- Props로 계속 전달하면 코드가 복잡함 (Props drilling)
- Pinia로 관리하면 모든 컴포넌트에서 직접 접근 가능
- 코드 유지보수가 훨씬 쉬움

### Q: CORS 에러가 나면 어떻게 하나요?

**A:** 우리 프로젝트에서는 발생하지 않습니다.
- Firebase가 CORS 지원함
- Mock 모드는 네트워크 요청이 없음

만약 다른 API 사용 시:
1. API 제공자가 CORS 지원하는지 확인
2. 우리 백엔드 프록시 서버 구축
3. CORS 프록시 서비스 사용 (임시)

---

## 🔗 Part 9: 전체 맵핑 (파일 → 역할 → 수정 방법)

```
변경하고 싶은 것          파일 위치                  수정 방법
─────────────────────────────────────────────────────────────
화면에 보이는 데이터  → src/pages/admin/*.vue    → 컴포넌트 수정
데이터 조회 방식       → src/api/*.js             → 쿼리 수정
데이터 저장소          → src/stores/dataStore.js  → 상태 추가/수정
Firebase 연결          → .env                      → 자격증명 변경
API 모드 선택          → src/config/api.config.js → mode 값 변경
Mock 테스트 데이터     → src/data/*.json          → JSON 수정
라우팅                 → src/router/index.js      → 경로 추가/수정
```

---

## 🎯 Part 10: 체크리스트 (이해도 확인)

### 기본 이해도 확인

```
□ GigStash가 무엇인지 설명할 수 있다
□ 프로젝트의 폴더 구조를 그릴 수 있다
□ Mock vs Firebase의 차이를 설명할 수 있다
□ App.vue가 언제 데이터를 로드하는지 알고 있다
□ dataStore의 역할을 설명할 수 있다
□ Pinia가 무엇인지 설명할 수 있다
□ CORS가 무엇이고 왜 필요한지 알고 있다
```

### 실무 준비도 확인

```
□ 예약 데이터를 수정하려면 어디를 건드릴지 알고 있다
□ Mock 테스트 데이터를 추가할 수 있다
□ Firebase와 Mock을 전환할 수 있다
□ 새로운 기능을 추가할 위치를 결정할 수 있다
□ 데이터 흐름을 따라가며 버그를 추적할 수 있다
□ 코드 수정이 다른 부분에 미치는 영향을 예측할 수 있다
□ 성능 문제를 원인까지 추적할 수 있다
```

---

## 📚 Part 11: 다른 가이드로 이동

```
GUIDE 0: START_HERE (현재 위치) ← 전체 요약
  ↓
GUIDE 1: COMPLETE_GUIDE.md ← 상세 설명
  ↓
GUIDE 2: CORS_COMPLETE_GUIDE.md ← 웹 보안
  ↓
GUIDE 3: APP_VUE_STORES_FLOW.md ← 심화
  ↓
실제 코드 수정 시작! 🚀
```

---

## ✨ 최종 요약

### 이 문서에서 배운 3가지 핵심

```
1️⃣ 구조
   - 7가지 폴더/파일이 어떻게 연결되는가
   - .env → firebase.config.js → api → dataStore → Vue 컴포넌트

2️⃣ 흐름
   - 앱 시작 → 데이터 로드 → 화면 표시 → 데이터 변경
   - App.vue에서 로드한 데이터가 모든 컴포넌트에서 공유됨

3️⃣ 선택
   - Mock (개발용) vs Firebase (운영용)
   - api.config.js의 mode 값으로 전환
```

### 이제 할 수 있는 것

```
✅ 코드를 읽을 때 전체 맥락을 이해
✅ 버그가 생기면 어디를 확인할지 알기
✅ 새 기능을 어디에 추가할지 결정
✅ 코드 수정의 영향 범위 예측
✅ 팀원과 기술 대화 가능
```

---

## 🚀 다음 단계

```
1️⃣ COMPLETE_GUIDE.md 읽기 (30분)
   └─ 각 파일의 상세한 역할 이해

2️⃣ CORS_COMPLETE_GUIDE.md 읽기 (20분)
   └─ 웹 보안과 CORS 개념 이해

3️⃣ APP_VUE_STORES_FLOW.md 읽기 (30분)
   └─ App.vue와 Stores의 관계 심화

4️⃣ 실제 코드 열어보기 (30분)
   └─ src/App.vue, stores/dataStore.js,
      api/reservationService.js 차례로 읽기

5️⃣ 작은 수정부터 시작 (1시간)
   └─ Mock 데이터 수정 → Firebase 배포 테스트
```

---

## 📞 도움이 필요하면

```
이 문서가 명확하지 않은 부분:
→ COMPLETE_GUIDE.md의 해당 섹션 확인

코드 수정 방법을 모를 때:
→ 이 문서의 "Part 6: 파일 수정 가이드" 참고

웹 보안에 대해 궁금할 때:
→ CORS_COMPLETE_GUIDE.md 읽기

App.vue와 Stores 관계가 이해 안 될 때:
→ APP_VUE_STORES_FLOW.md의 "Part 7: 실제 동작 예시" 참고
```

---

**축하합니다! 이제 GigStash의 기본을 마쳤습니다!** 🎉

다음은 COMPLETE_GUIDE.md에서 각 부분을 깊이 있게 학습해보세요.

Happy Coding! 💻
