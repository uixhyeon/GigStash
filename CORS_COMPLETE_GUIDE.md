# CORS 완전 가이드 - 처음부터 끝까지

## 📚 CORS가 필요한 이유 (웹 보안의 기본)

### 🔒 같은 출처 정책 (Same-Origin Policy)

**브라우저의 기본 보안 규칙:**
```
"다른 출처(도메인)에서 온 데이터는 받지 않겠다"

예시:
https://example.com 에서 실행 중인 JavaScript는
https://api.other.com 으로 요청을 보낼 수 없다!
```

**왜 이런 규칙이 있을까?**

```
상황 1: 은행 사기 (이 규칙이 없다면)

1. 사용자가 bank.com 접속
   - 계좌: 1,000,000원
   - 쿠키에 인증 정보 저장

2. 사용자가 evil.com 클릭 (악의적 사이트)

3. evil.com의 JavaScript 코드:
   ```javascript
   // 규칙이 없으면 이게 작동함 (위험!)
   fetch('https://bank.com/transfer', {
     method: 'POST',
     body: JSON.stringify({
       to: '해커 계좌',
       amount: 1000000  // 모든 돈 전송!
     }),
     credentials: 'include'  // 쿠키도 함께 전송
   })
   ```

4. bank.com 서버는 유효한 쿠키를 봤으므로 거래 승인
   → 사용자 돈이 모두 사라짐! 😱

이를 "CSRF (Cross-Site Request Forgery)" 공격이라고 합니다.
```

**같은 출처 정책이 있으면:**
```
evil.com 의 JavaScript가 bank.com으로 요청을 보내려고 하면
브라우저가 이를 차단함!

"다른 도메인이야. 나 못 보냈어!"
→ 보안 유지! ✓
```

---

## 🌐 Part 1: 출처(Origin)란?

### 출처의 3가지 요소

```
https://api.example.com:8080/path/to/resource
└─┬─┘  └──┬──┘ └──┬──┘
 프로토콜   호스트  포트

"출처(Origin)" = 프로토콜 + 호스트 + 포트
```

### 출처 비교 예시

```javascript
// 기준: https://example.com

https://example.com              // ✅ 같은 출처 (포트 기본값 443)
https://example.com:443          // ✅ 같은 출처
https://example.com/path         // ✅ 같은 출처 (경로는 상관없음)
https://api.example.com          // ❌ 다른 출처 (서브도메인 다름)
https://example.com:8080         // ❌ 다른 출처 (포트 다름)
http://example.com               // ❌ 다른 출처 (프로토콜 다름)
https://example.org              // ❌ 다른 출처 (도메인 다름)
```

---

## 🚫 Part 2: 같은 출처 정책의 제한

### 제한되는 것들

```javascript
// ❌ 차단되는 요청들:

// 1. AJAX 요청 (fetch, axios)
fetch('https://api.other.com/data')
  .catch(error => console.error('CORS 에러!')) // 실패

// 2. XMLHttpRequest
const xhr = new XMLHttpRequest()
xhr.open('GET', 'https://api.other.com/data')
xhr.send()  // CORS 에러!

// 3. WebSocket (실시간 통신)
const ws = new WebSocket('wss://socket.other.com')
// CORS 에러!
```

### 제한되지 않는 것들 (기술)

```javascript
// ✅ 차단되지 않는 것들:

// 1. <img> 태그
<img src="https://api.other.com/image.jpg" />  // 작동 ✓

// 2. <script> 태그
<script src="https://api.other.com/script.js"></script>  // 작동 ✓

// 3. <link> 태그
<link rel="stylesheet" href="https://api.other.com/style.css" />  // 작동 ✓

// 4. <form> 태그의 form submission
<form action="https://api.other.com/submit" method="POST">
  // 작동 ✓ (하지만 응답을 읽을 수 없음)
</form>

// 5. 서버 사이 통신
// Node.js나 Python 같은 백엔드에서는 CORS 문제 없음!
// (브라우저에서만 문제임)
```

**왜 이 차이가 생길까?**
```
CORS 제한의 원인: JavaScript에서 응답을 읽을 수 있는가?

❌ JavaScript가 응답을 읽을 수 있는 경우 → CORS 필요
fetch('https://api.other.com/data')
  .then(res => res.json())  // ← JavaScript에서 응답 읽음!
  .then(data => console.log(data))

✅ JavaScript가 응답을 읽을 수 없는 경우 → CORS 불필요
<img src="https://api.other.com/image.jpg" />  // ← 이미지만 표시, 읽지 않음

✅ 서버 통신 → CORS 불필요
Node.js: fetch('https://api.other.com/data')  // 차단 없음!
```

---

## ✅ Part 3: CORS (Cross-Origin Resource Sharing)

### CORS란?

```
"다른 출처의 요청을 안전하게 허용하는 메커니즘"

브라우저:
"다른 도메인으로부터의 요청이 왔는데,
 그 서버가 '괜찮다'고 명시적으로 허용해야만
 응답 데이터를 JavaScript에게 전달해 줄게"
```

### CORS 동작 과정 (상세)

#### 시나리오: 우리 앱이 Firebase에 요청

```
1️⃣ 우리 앱 (http://localhost:3000)
   ↓ GET 요청
   https://firestore.googleapis.com/v1/projects/gigstash-91197/...

2️⃣ 브라우저가 요청 전에 "출처 다른데 괜찮아?" 확인
   요청 헤더에 자동으로 추가:
   ```
   Origin: http://localhost:3000
   ```

3️⃣ Firebase 서버가 응답:
   응답 헤더에 자동으로 추가:
   ```
   Access-Control-Allow-Origin: *
   // 또는
   Access-Control-Allow-Origin: http://localhost:3000
   ```
   의미: "모든 출처(*)에서의 요청을 허용한다" 또는 "이 출처만 허용"

4️⃣ 브라우저 확인
   Access-Control-Allow-Origin이 있으면:
   "좋아, 응답을 JavaScript에게 전달해 줄게" ✓

   없으면:
   "안 돼, CORS 에러!" ❌
```

### HTTP 헤더 상세 설명

#### 요청 헤더 (브라우저가 자동 추가)
```http
GET /api/reservations HTTP/1.1
Host: firestore.googleapis.com
Origin: http://localhost:3000  ← 중요! 어디서 요청했는지 알림
User-Agent: Mozilla/5.0...
```

#### 응답 헤더 (서버가 명시해야 함)
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000  ← 중요! 허용 여부
Access-Control-Allow-Methods: GET, POST, PUT, DELETE  ← 허용 메서드
Access-Control-Allow-Headers: Content-Type, Authorization  ← 허용 헤더
Access-Control-Max-Age: 86400  ← 캐시 시간
Content-Type: application/json

[응답 본문]
```

---

## 🎯 Part 4: CORS 에러 해결

### CORS 에러의 증상

```javascript
// 브라우저 콘솔에 보이는 에러:

❌ Access to XMLHttpRequest at 'https://api.example.com'
   from origin 'http://localhost:3000'
   has been blocked by CORS policy:
   Response to preflight request doesn't have required
   'Access-Control-Allow-Origin' header.
```

**해석:**
```
"localhost:3000 에서 api.example.com 에 요청했는데
 서버가 Access-Control-Allow-Origin 응답 헤더를 안 줬어요"
```

---

### 해결 방법 1: 서버에서 CORS 허용 (정상적)

**Express.js 예시:**
```javascript
// 서버 코드 (우리가 제어 가능)
const cors = require('cors')
const express = require('express')

const app = express()

// 모든 출처 허용
app.use(cors())

// 또는 특정 출처만 허용
app.use(cors({
  origin: 'http://localhost:3000',  // 우리 앱만 허용
  credentials: true
}))

app.get('/api/reservations', (req, res) => {
  res.json({ data: [...] })
})
```

응답에 자동으로 `Access-Control-Allow-Origin` 헤더 추가됨 ✓

---

### 해결 방법 2: CORS 프록시 사용 (임시 방편)

```javascript
// 개발 중일 때만 사용
const corsProxy = 'https://cors-anywhere.herokuapp.com/'
const apiUrl = 'https://api.example.com/data'

fetch(corsProxy + apiUrl)  // 프록시 서버를 통해 요청
  .then(res => res.json())
  .then(data => console.log(data))
```

**문제:**
- 프로덕션에서는 작동 안 함
- 프록시 서버에 의존
- 성능 저하

**권장하지 않음** ❌

---

### 해결 방법 3: 백엔드 서버 사용 (정석)

```
우리 Vue 앱 (localhost:3000)
  ↓ CORS 없이 요청 (같은 출처)
우리 백엔드 서버 (localhost:3001)
  ↓ 출처 제약 없음
외부 API (api.example.com)
```

**코드 예시:**
```javascript
// Vue에서 (우리 서버로 요청)
fetch('http://localhost:3001/api/reservations')
  // CORS 문제 없음! 같은 도메인(localhost)이니까

// 우리 서버 (Node.js)에서
app.get('/api/reservations', async (req, res) => {
  const data = await fetch('https://api.example.com/reservations')
  // 이 요청은 CORS 제약 없음! (서버 간 통신이니까)
  res.json(data)
})
```

---

## 🔥 Part 5: 우리 프로젝트에서 CORS는?

### Firebase는 CORS를 지원함! ✅

```javascript
// 이 코드가 작동함:
fetch('https://firestore.googleapis.com/v1/projects/gigstash-91197/...')
  .then(res => res.json())
  .then(data => console.log(data))

// 왜? Firebase 서버가 응답에 추가함:
// Access-Control-Allow-Origin: *
```

**또는 Firebase SDK를 사용하면:**
```javascript
import { getDocs, collection, query } from 'firebase/firestore'

const snapshot = await getDocs(query(collection(db, 'reservations')))
// Firebase SDK가 자동으로 CORS를 처리해 줌!
// (내부적으로는 HTTP 요청이지만, SDK가 모든 복잡한 부분을 처리)
```

### 우리가 CORS 에러를 안 받는 이유

```
1️⃣ Firebase가 CORS 지원
   → Google 서버가 "모든 출처에서 요청 OK" 설정
   → Access-Control-Allow-Origin: * 응답

2️⃣ Firebase SDK 사용
   → SDK가 CORS 처리를 자동으로 해 줌
   → 우리는 신경 쓸 필요 없음!

3️⃣ Mock 모드는 로컬 JSON
   → 네트워크 요청 자체가 없음
   → CORS 문제 발생 불가
```

---

## 📊 Part 6: CORS 시나리오 비교

### 시나리오 1: 우리 REST API 서버 + 프론트엔드 분리

```
우리 Vue 앱
(http://localhost:3000)
  ↓ fetch('http://localhost:3001/api/reservations')
우리 Express 서버
(http://localhost:3001)
  ↓ app.use(cors())
  ↓ 응답에 자동으로 CORS 헤더 추가
우리 Vue 앱
  ✓ 데이터 수신 성공
```

**CORS 처리:** Express의 `cors()` 미들웨어가 처리

---

### 시나리오 2: 외부 API 직접 사용 (우리 상황)

```
우리 Vue 앱
(http://localhost:3000)
  ↓ Firebase SDK 사용
Firebase 서버
(firestore.googleapis.com)
  ↓ 자동으로 CORS 헤더 포함
우리 Vue 앱
  ✓ 데이터 수신 성공
```

**CORS 처리:** Firebase가 자동으로 처리

---

### 시나리오 3: CORS 없는 외부 API (문제 발생)

```
우리 Vue 앱
(http://localhost:3000)
  ↓ fetch('https://api.no-cors.com/data')
API 서버 (CORS 미지원)
(https://api.no-cors.com)
  ↓ Access-Control-Allow-Origin 헤더 없음
  ↓ 또는 다른 출처는 거부
우리 Vue 앱
  ❌ CORS 에러! 데이터 수신 실패
```

**CORS 처리:**
- 방법 1: API 제공자에게 CORS 지원 요청
- 방법 2: 우리 백엔드 서버를 프록시로 사용
- 방법 3: CORS 프록시 서비스 사용 (임시)

---

## 🛠️ Part 7: 개발 중 CORS 문제 디버깅

### 증상 확인

```javascript
// 브라우저 DevTools (F12) → Console 확인

Access to XMLHttpRequest at 'https://api.example.com/data'
from origin 'http://localhost:3000'
has been blocked by CORS policy
```

### 원인 파악

```javascript
// Network 탭에서 요청 확인

Request Headers:
Origin: http://localhost:3000

Response Headers:
❌ Access-Control-Allow-Origin: ... (없음!)
❌ Access-Control-Allow-Methods: ... (없음!)
```

### 해결 순서

```
1️⃣ API 서버가 CORS 지원하는가?
   → 공식 문서 확인

2️⃣ 응답 헤더에 Access-Control-Allow-Origin이 있는가?
   → Network 탭에서 확인

3️⃣ 허용된 출처가 우리 도메인인가?
   → Access-Control-Allow-Origin: http://localhost:3000

4️⃣ 문제 해결:
   a) API 제공자 CORS 설정 확인
   b) 우리 백엔드 프록시 추가
   c) 환경 설정 변경 (개발/프로덕션)
```

---

## 📋 Part 8: Preflight 요청 (심화)

### Preflight란?

```
복잡한 요청을 보내기 전에
"이 요청 괜찮을까?" 미리 확인하는 것

브라우저가 자동으로 처리함!
```

### Preflight 요청이 발생하는 경우

```javascript
// ❌ 이 요청은 preflight가 필요함:

fetch('https://api.example.com/data', {
  method: 'POST',  // GET이 아닌 다른 메서드
  headers: {
    'Content-Type': 'application/json',  // 기본 헤더가 아님
    'Authorization': 'Bearer token123'   // 커스텀 헤더
  },
  body: JSON.stringify({ ... })
})
```

### Preflight 과정

```
1️⃣ 브라우저가 OPTIONS 메서드로 먼저 요청
   OPTIONS /api/data HTTP/1.1
   Host: api.example.com
   Origin: http://localhost:3000
   Access-Control-Request-Method: POST  ← "POST 괜찮아?"
   Access-Control-Request-Headers: Content-Type, Authorization

2️⃣ 서버가 응답
   HTTP/1.1 200 OK
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization
   Access-Control-Max-Age: 86400

3️⃣ 브라우저 확인
   "좋아, 이제 실제 POST 요청 보낼게"

4️⃣ 실제 POST 요청 전송
```

**결과:** 같은 요청이 총 2번 전송됨 (OPTIONS + POST)
- 성능에 영향을 줄 수 있음
- 하지만 보안을 위해 필요함

---

## 🎓 Part 9: 정리표

| 개념 | 설명 |
|------|------|
| **Same-Origin Policy** | 브라우저의 기본 보안 규칙: 다른 출처 거부 |
| **CSRF** | 악의적 사이트가 우리 계좌를 조작하는 공격 |
| **CORS** | 출처가 다른 요청을 안전하게 허용 |
| **Origin** | 프로토콜 + 호스트 + 포트 |
| **Access-Control-Allow-Origin** | 서버의 응답 헤더, 어떤 출처를 허용하는지 명시 |
| **Preflight** | 복잡한 요청 전에 미리 보내는 OPTIONS 요청 |
| **Firebase** | CORS 지원해서 우리는 신경 안 써도 됨 ✓ |

---

## 🚀 Part 10: 실제 예시

### ✅ CORS 성공한 예시

```javascript
// 우리 프로젝트에서
const reservations = await getDocs(
  query(collection(db, 'reservations'))
)
// 성공! Firebase가 CORS 지원하니까
```

**브라우저 Console:**
```
이 요청들은 정상 작동:
GET https://firestore.googleapis.com/v1/projects/gigstash-91197/...  200 OK ✓
```

---

### ❌ CORS 실패한 예시 (만약)

```javascript
// 만약 우리가 CORS 미지원 API 사용했다면
const data = await fetch('https://api-no-cors.com/reservations')

// 브라우저 Console에서:
// ❌ Access to fetch at 'https://api-no-cors.com/reservations'
//    from origin 'http://localhost:3000'
//    has been blocked by CORS policy
```

---

## 💡 핵심 정리

```
CORS의 목적: 보안을 유지하면서 다른 도메인의 요청 허용

기본 규칙:
1. 같은 도메인 → CORS 필요 없음 (언제나 작동)
2. 다른 도메인 → CORS 필요
   - 서버가 "응답"에 허용 명시해야 함
   - 브라우저가 확인 후 데이터 제공

우리 프로젝트:
- Firebase가 CORS 지원 → 문제 없음 ✓
- Mock 모드는 로컬 → CORS 문제 없음 ✓
- 우리는 신경 쓸 필요 없음! 🎉
```

---

## 📚 추가 학습 자료

**CORS 관련 HTTP 메서드:**
- GET: 데이터 조회 (CORS 간단함)
- POST: 데이터 생성 (preflight 발생 가능)
- PUT: 데이터 수정 (preflight 발생)
- DELETE: 데이터 삭제 (preflight 발생)
- OPTIONS: 허용 여부 확인 (CORS 관련)

**관련 개념:**
- CSP (Content Security Policy): CORS보다 더 강력한 보안
- Cookies + CORS: 쿠키 공유는 별도 설정 필요
- WebSocket: 다른 메커니즘의 CORS 처리

이제 CORS를 완벽하게 이해했을 것입니다! 🎉
