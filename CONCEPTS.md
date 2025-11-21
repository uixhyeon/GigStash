# GigStash 프로젝트 개념 정리 (Q&A 형식)

---

## 목차
1. [폴더 구조](#1-폴더-구조)
2. [라우팅](#2-라우팅)
3. [동적 임포트](#3-동적-임포트)
4. [네이밍 규칙](#4-네이밍-규칙)
5. [인증 및 권한](#5-인증-및-권한)
6. [Auth Store](#6-auth-store)
7. [Navigation Guard](#7-navigation-guard)
8. [로그인 흐름](#8-로그인-흐름)
9. [데이터 전달](#9-데이터-전달)
10. [Redirect](#10-redirect)

---

## 1. 폴더 구조

### Q: 왜 pages, auth, admin, worker 폴더로 나눴나요?
**A:** 역할별 폴더 구조로 코드 조직화를 명확하게 하기 위해서입니다.

```
before (문제점):
src/views/              # 뭐가 뭔지 불명확
├── LoginView.vue       # 어느 역할의 것?
├── DashboardView.vue   # 어느 역할의 것?
└── HomeView.vue

after (개선):
src/pages/
├── auth/               # 인증 관련 (명확함!)
│   └── LoginView.vue
├── admin/              # 관리자 전용 (명확함!)
│   ├── AdminMain.vue
│   ├── EventManagementView.vue
│   └── ...
└── worker/             # 기사 전용 (명확함!)
    ├── WorkerMain.vue
    ├── Jobs.vue
    └── ...
```

### Q: pages 폴더 아래에 다시 auth, admin, worker를 만든 이유는?
**A:** 역할별 페이지를 한 곳에서 관리하기 위해서입니다.

```javascript
// 구조의 장점
pages/                  // 라우팅되는 모든 페이지의 중앙 허브
├── auth/              // 로그인 관련
├── admin/             // 관리자 페이지들
└── worker/            // 기사 페이지들

// 장점:
1. 역할별로 바로 찾을 수 있음
2. 페이지 추가 시 올바른 폴더에 넣기 쉬움
3. 폴더명만 봐도 용도를 알 수 있음
```

### Q: layouts는 뭐고 왜 따로 두나요?
**A:** 여러 페이지에서 공유하는 "틀"을 저장합니다.

```javascript
// 예시: AdminLayout은 관리자 페이지들의 공통 틀
AdminLayout.vue
├── 헤더 (모든 관리자 페이지에서 동일)
├── 사이드바 (모든 관리자 페이지에서 동일)
└── <RouterView />  (여기에 각 페이지 컴포넌트 표시)

// pages/admin/DashboardView.vue
// pages/admin/EventManagementView.vue
// → 모두 AdminLayout 안에 표시됨
```

### Q: components는 pages와 뭐가 다른가요?
**A:** 크기와 재사용성의 차이입니다.

```javascript
// pages: 큰 단위, 라우터에 등록
pages/admin/AdminMain.vue       // 전체 페이지 (라우터에 등록)

// components: 작은 단위, 여러 곳에서 재사용
components/common/BaseButton.vue  // 버튼 (어디든 재사용)
components/common/StatusChip.vue   // 상태 표시 (어디든 재사용)

// AdminMain.vue에서 사용
<BaseButton />
<StatusChip />
```

---

## 2. 라우팅

### Q: 라우팅(Routing)이 뭔가요?
**A:** 사용자가 입력한 URL에 따라 다른 페이지를 보여주는 기능입니다.

```javascript
// 예시
사용자: /admin/adminMain 입력
       ↓
라우터: "어? 이 경로는 AdminMain.vue를 보여줘야 하나?"
       ↓
AdminMain.vue 표시
```

### Q: path와 name의 차이가 뭔가요?
**A:** path는 URL이고, name은 프로그래밍에서 사용하는 별명입니다.

```javascript
{
  path: '/admin/adminMain',    // 사용자가 주소창에 입력하는 것
  name: 'adminMain',           // 코드에서 이름으로 이동할 때 사용
  component: AdminMain
}

// 사용자 방식
window.location = '/admin/adminMain'

// 개발자 방식 (더 좋음)
router.push({ name: 'adminMain' })

// 개발자 방식의 장점
// path를 변경해도 name이 같으면 코드 수정 불필요
```

### Q: children이 뭔가요?
**A:** 부모 경로 안에 자식 경로를 넣는 구조입니다.

```javascript
{
  path: '/admin',              // 부모 경로
  component: AdminLayout,      // 부모 레이아웃
  children: [
    {
      path: 'adminMain',       // 상대경로 (full: /admin/adminMain)
      component: AdminMain
    },
    {
      path: 'event-management',// 상대경로 (full: /admin/event-management)
      component: EventManagement
    }
  ]
}

// URL 조합:
부모: /admin
자식1: /admin + /adminMain = /admin/adminMain
자식2: /admin + /event-management = /admin/event-management
```

### Q: meta는 뭐예요?
**A:** 라우트에 대한 추가 정보를 저장하는 곳입니다.

```javascript
{
  path: '/admin/adminMain',
  component: AdminMain,
  meta: {
    title: '대시보드',          // 페이지 제목 (SEO, 브라우저 탭)
    requiresAuth: true,         // 로그인 필수 여부
    role: 'admin'              // 필요한 사용자 역할
  }
}

// Navigation Guard에서 사용
if (to.meta.requiresAuth && !isAuthenticated) {
  next('/login')  // 로그인 필요하면 로그인 페이지로
}

if (to.meta.role && userRole !== to.meta.role) {
  next('/')  // 역할이 맞지 않으면 홈으로
}
```

### Q: 라우트명 규칙은 어떻게 정하나요?
**A:** `역할 + 기능명` 형식으로 통일했습니다.

```javascript
// 관리자 라우트
name: 'adminMain'              // admin + Main
name: 'adminEventManagement'   // admin + EventManagement
name: 'adminReservations'      // admin + Reservations

// 기사 라우트
name: 'workerMain'             // worker + Main
name: 'workerJobs'             // worker + Jobs
name: 'workerCalendar'         // worker + Calendar

// 장점:
1. 이름만 봐도 어느 역할의 라우트인지 알 수 있음
2. 같은 기능이 여러 역할에 있을 때 구분 가능
3. IDE 자동완성에서 검색하기 쉬움
```

---

## 3. 동적 임포트

### Q: 동적 임포트가 뭔가요?
**A:** 페이지 컴포넌트를 "필요할 때만" 로드하는 방식입니다.

```javascript
// 정적 임포트 (항상 로드)
import AdminMain from '@/pages/admin/AdminMain.vue'
component: AdminMain

// 동적 임포트 (필요할 때만 로드) - 현재 프로젝트
component: () => import('@/pages/admin/AdminMain.vue')

// 실제 동작
앱 시작: AdminMain.vue를 안 로드
사용자가 /admin/adminMain 접근: 그때 로드 ✓
```

### Q: 동적 임포트의 장점이 뭔가요?
**A:** 초기 로딩 속도가 빨라집니다.

```javascript
// 정적 임포트 시
번들 크기: 500KB (모든 페이지 포함)
초기 로딩 시간: 느림 (모든 것을 로드해야 함)

// 동적 임포트 시
번들 크기: 150KB (필요한 것만)
초기 로딩 시간: 빠름 (핵심만 로드)
사용자 방문 시: 해당 페이지 50KB 추가 로드

결과: 70% 번들 크기 감소 → 더 빠른 사용자 경험
```

### Q: 동적 임포트의 단점이 뭔가요?
**A:** 오타 감지가 어렵습니다.

```javascript
// 정적 임포트 (오류 즉시 감지)
import AdminMain from '@/pages/admin/AdminMain.vue'
// 파일이 없으면 IDE 빨간 줄 표시

// 동적 임포트 (런타임에 발견)
component: () => import('@/pages/admin/AdminMian.vue')  // 오타!
// IDE는 모르고, 사용자가 페이지 방문할 때 에러 발생
```

### Q: 우리 프로젝트는 왜 동적 임포트를 선택했나요?
**A:** 성능(속도)을 더 중시했기 때문입니다.

```javascript
// 선택 기준
소규모 프로젝트 (라우트 10개): 정적 임포트 (안정성)
대규모 프로젝트 (라우트 50개+): 동적 임포트 (성능) ← 우리 프로젝트

// 우리 프로젝트의 라우트 개수
admin: 6개
worker: 3개
총: ~10개

// 규모는 소규모지만, 앞으로 확장될 것을 고려해 동적 임포트 선택
```

---

## 4. 네이밍 규칙

### Q: 파일명, 라우트명, 컴포넌트명 규칙이 다른가요?
**A:** 네, 각각 다른 규칙이 있습니다.

```javascript
// 파일명 (PascalCase)
AdminMain.vue                    // PascalCase
EventManagementView.vue          // PascalCase
BaseButton.vue                   // PascalCase
→ 규칙: 첫 글자 대문자, 단어 이어붙이기

// 라우트 경로 (kebab-case)
path: '/admin/event-management'  // kebab-case
path: '/worker/jobs'             // kebab-case
→ 규칙: 모두 소문자, 단어는 하이픈으로

// 라우트 이름 (camelCase)
name: 'adminMain'                // camelCase
name: 'adminEventManagement'     // camelCase
name: 'workerJobs'               // camelCase
→ 규칙: 첫 글자 소문자, 다음 단어 첫 글자 대문자

// 정리:
파일명: AdminMain.vue
경로: /admin/admin-main (만약 경로가 있다면)
라우트명: adminMain
```

### Q: 왜 이렇게 다르게 정하나요?
**A:** 각 곳의 기술 스펙이 다르기 때문입니다.

```javascript
// Vue 컴포넌트 파일명: PascalCase (Vue 공식 가이드)
AdminMain.vue

// URL 경로: kebab-case (웹 표준)
/admin/event-management

// 자바스크립트 변수명: camelCase (JS 관례)
name: 'adminMain'
```

---

## 5. 인증 및 권한

### Q: 인증(Authentication)과 권한(Authorization)이 뭐가 다른가요?
**A:** 본인 확인 vs 접근 제어입니다.

```javascript
// 인증 (Authentication): "너가 맞니?"
로그인 성공 → user 객체가 생김 → isAuthenticated = true

// 권한 (Authorization): "넌 여기 들어올 수 있니?"
role = 'admin' → /admin/* 접근 가능
role = 'worker' → /worker/* 접근 가능
role = null (미로그인) → 로그인 페이지만 접근 가능
```

### Q: 우리 프로젝트의 역할은 몇 개인가요?
**A:** 3가지입니다.

```javascript
1. 'admin' (관리자)
   - 접근 가능: /admin/*
   - 테스트: admin@example.com

2. 'worker' (기사)
   - 접근 가능: /worker/*
   - 테스트: worker@example.com

3. null (미로그인)
   - 접근 가능: / (로그인 페이지)만
```

---

## 6. Auth Store

### Q: Auth Store가 뭔가요?
**A:** 전역으로 사용자 정보를 관리하는 중앙 저장소입니다.

```javascript
// 위치: src/stores/auth.js

// 역할:
1. 사용자 정보 저장 (로그인 후)
2. 로그인 여부 확인
3. 사용자 역할 확인
4. 로그아웃 처리

// 특징:
- 어디서나 접근 가능 (import해서 사용)
- localStorage에 자동 저장 (새로고침 후에도 유지)
- Pinia 라이브러리 사용
```

### Q: Auth Store의 구조가 뭔가요?
**A:** State(상태), Actions(기능)으로 나뉩니다.

```javascript
// State (상태)
const user = ref(null)           // 사용자 정보 객체
const isAuthenticated = ref()    // 로그인 여부
const userRole = computed()      // 사용자 역할

// Actions (기능)
setUser(userData)                // 로그인 처리
clearUser()                      // 로그아웃 처리
logout()                         // 로그아웃 wrapper
```

### Q: 사용자 정보는 어떻게 생겼나요?
**A:** 이런 구조입니다.

```javascript
// 로그인 전
user = null

// 로그인 후 (admin@example.com으로 로그인)
user = {
  id: 1,
  email: 'admin@example.com',
  name: '김관리',
  role: 'admin'
}

// 로그아웃
user = null
```

### Q: Auth Store는 어디에 저장되나요?
**A:** 2곳에 저장됩니다.

```javascript
// 1. 메모리 (RAM)
const user = ref(null)
→ 앱 실행 중에만 유지
→ 새로고침하면 사라짐 (localStorage에서 복원)

// 2. localStorage (브라우저 저장소)
localStorage.setItem('user', JSON.stringify(userData))
→ 브라우저를 닫아도 유지
→ 새로고침 후에도 유지
→ F12 > Application > LocalStorage에서 확인 가능
```

### Q: Auth Store는 어떻게 사용하나요?
**A:** 이렇게 사용합니다.

```javascript
// import
import { useAuthStore } from '@/stores/auth'

// 사용
const authStore = useAuthStore()

// 조회
authStore.user              // { id, email, name, role }
authStore.isAuthenticated   // true / false
authStore.userRole          // 'admin' / 'worker' / null

// 수정
authStore.setUser({ ... })  // 로그인
authStore.logout()          // 로그아웃
```

### Q: 여러 컴포넌트에서 Auth Store를 사용하면 데이터가 공유되나요?
**A:** 네, 같은 데이터를 공유합니다.

```javascript
// AdminMain.vue에서
const authStore = useAuthStore()
authStore.user.name  // '김관리'

// EventManagementView.vue에서
const authStore = useAuthStore()
authStore.user.name  // '김관리' (같은 데이터!)

// 같은 전역 저장소를 사용하기 때문
```

---

## 7. Navigation Guard

### Q: Navigation Guard가 뭔가요?
**A:** 페이지 이동 전에 검증하는 기능입니다.

```javascript
// 위치: src/router/index.js

router.beforeEach((to, _from, next) => {
  // 페이지 이동 전에 항상 실행됨
  // to: 이동할 페이지
  // next(): 이동을 계속 진행

  // 검증 로직
  if (조건) {
    next('/login')  // 다른 페이지로 이동
  } else {
    next()          // 계속 진행
  }
})
```

### Q: Navigation Guard에서 뭘 검증하나요?
**A:** 3가지를 검증합니다.

```javascript
// 1. 인증 여부 (로그인했나?)
if (to.meta.requiresAuth && !isAuthenticated) {
  next('/login')  // 미로그인이면 로그인 페이지로
}

// 2. 권한 여부 (역할이 맞나?)
if (to.meta.role && userRole !== to.meta.role) {
  next('/')  // 권한 없으면 홈으로
}

// 3. 이미 로그인한 상태에서 로그인 페이지 접근 (리다이렉트)
if (to.path === '/login' && isAuthenticated) {
  if (userRole === 'admin') {
    next('/admin/adminMain')
  } else if (userRole === 'worker') {
    next('/worker/workerMain')
  }
}
```

### Q: 실제 동작 흐름은 어떻게 되나요?
**A:** 단계별로 진행됩니다.

```javascript
// 예시 1: 미로그인 상태에서 /admin/adminMain 접근
사용자: /admin/adminMain 입력
       ↓
beforeEach 실행
       ↓
Step 1: to.meta.requiresAuth (true) && !isAuthenticated (true)
        → 조건 만족!
        ↓
next('/login')  // 로그인 페이지로 이동
       ↓
로그인 페이지 표시

// 예시 2: admin 로그인 후 /worker/workerMain 접근
사용자: /worker/workerMain 입력
       ↓
beforeEach 실행
       ↓
Step 1: 인증 확인 (OK, 로그인됨)
       ↓
Step 2: to.meta.role ('worker') && userRole ('admin') 다름
        → 조건 만족!
        ↓
next('/')  // 홈으로 이동
       ↓
홈 페이지 표시

// 예시 3: admin 로그인 후 /admin/adminMain 접근
사용자: /admin/adminMain 입력
       ↓
beforeEach 실행
       ↓
Step 1: 인증 확인 (OK, 로그인됨)
Step 2: 권한 확인 (OK, admin 맞음)
Step 3: 로그인 페이지 체크 (아님)
       ↓
next()  // 계속 진행
       ↓
/admin/adminMain 페이지 표시
```

---

## 8. 로그인 흐름

### Q: 로그인할 때 뭐가 일어나나요?
**A:** 단계별로 이렇게 진행됩니다.

```
Step 1: 로그인 페이지 (/login, 즉 /)
        ↓
        사용자가 admin@example.com 입력

Step 2: LoginView.vue에서 계정 검증
        ↓
        testAccounts 객체에서 확인
        ↓
        admin@example.com 찾음 ✓

Step 3: authStore.setUser() 호출
        ↓
        user 객체 메모리에 저장
        ↓
        localStorage에도 저장

Step 4: router.push('/admin/adminMain') 호출
        ↓
        라우터가 경로 이동

Step 5: beforeEach 가드 실행
        ↓
        인증 확인: ✓ (user 존재)
        권한 확인: ✓ (role = 'admin')
        ↓
        next() 진행

Step 6: /admin/adminMain 페이지 표시
        ↓
        AdminMain.vue에서 authStore.user 접근 가능
```

### Q: 로그인 페이지에서 계정을 어떻게 검증하나요?
**A:** testAccounts 객체를 사용합니다.

```javascript
// LoginView.vue에 정의된 테스트 계정
const testAccounts = {
  'admin@example.com': {
    password: 'admin123',
    id: 1,
    name: '김관리',
    role: 'admin'
  },
  'worker@example.com': {
    password: 'worker123',
    id: 2,
    name: '박기사',
    role: 'worker'
  }
}

// 로그인 시 검증
const account = testAccounts[form.value.email]
if (account && account.password === form.value.password) {
  // 로그인 성공
  authStore.setUser({
    id: account.id,
    email: form.value.email,
    name: account.name,
    role: account.role
  })
  router.push(`/${account.role}/...`)
}
```

---

## 9. 데이터 전달

### Q: LoginView에서 AdminMain으로 데이터를 전달할 수 있나요?
**A:** Props는 불가능하지만 다른 방법들이 있습니다.

```javascript
// ❌ 불가능: Props
// LoginView와 AdminMain은 부모-자식 관계가 아님 (라우터로 분리됨)

// ✅ 가능: Auth Store (추천)
// ✅ 가능: Route Query
// ✅ 가능: Route Params
```

### Q: Auth Store를 사용하는 방법은?
**A:** 이렇게 합니다.

```javascript
// LoginView.vue에서 저장
const authStore = useAuthStore()
authStore.setUser({
  id: 1,
  email: 'admin@example.com',
  name: '김관리',
  role: 'admin'
})

// AdminMain.vue에서 사용
const authStore = useAuthStore()
console.log(authStore.user.name)        // '김관리'
console.log(authStore.userRole)         // 'admin'
console.log(authStore.isAuthenticated)  // true
```

### Q: Auth Store가 최고의 방법인 이유는?
**A:** 3가지 이유입니다.

```javascript
// 1. 새로고침 후에도 데이터 유지
새로고침 전: authStore.user = { ... }
새로고침 후: localStorage에서 복원 → authStore.user 그대로 존재

// 2. 어디서나 접근 가능
LoginView: authStore 접근 ✓
AdminMain: authStore 접근 ✓
EventManagement: authStore 접근 ✓
다른 컴포넌트 어디든: authStore 접근 ✓

// 3. 보안
Route Query: URL에 노출됨 (위험)
Route Params: 새로고침 시 소실
Auth Store: localStorage에 안전하게 저장
```

### Q: Route Query를 사용하면 어떻게 되나요?
**A:** 이런 식으로 동작합니다.

```javascript
// LoginView.vue에서 이동
router.push({
  path: '/admin/adminMain',
  query: { userName: '김관리', userEmail: 'admin@example.com' }
})

// URL이 이렇게 됨
/admin/adminMain?userName=김관리&userEmail=admin@example.com

// AdminMain.vue에서 사용
const route = useRoute()
console.log(route.query.userName)   // '김관리'

// 문제점:
// 1. 비밀 정보는 URL에 노출됨 (위험)
// 2. 새로고침 하면 쿼리 파라미터 필요
// 3. 북마크하면 쿼리도 함께 저장됨
```

---

## 10. Redirect

### Q: Redirect가 뭔가요?
**A:** 사용자를 자동으로 다른 페이지로 보내는 기능입니다.

```javascript
// 위치: src/router/index.js의 마지막 라우트

{
  path: '/:pathMatch(.*)*',  // 모든 정의되지 않은 경로 캐치 (404)
  redirect: () => {
    const authStore = useAuthStore()
    // 로그인 여부에 따라 다르게 처리
    return authStore.isAuthenticated ? '/admin/adminMain' : '/'
  }
}
```

### Q: 실제 어떤 상황에서 작동하나요?
**A:** 사용자가 존재하지 않는 경로에 접근할 때입니다.

```
// 예시 1: 미로그인 상태에서 /xyz 입력
사용자: /xyz 입력
       ↓
라우터: "/xyz? 이런 경로 없는데?"
       ↓
마지막 라우트 (404 처리) 실행
       ↓
authStore.isAuthenticated = false
       ↓
redirect: () => '/'
       ↓
로그인 페이지 (/)로 자동 이동

// 예시 2: admin 로그인 후 /unknown 입력
사용자: /unknown 입력
       ↓
라우터: "/unknown? 이런 경로 없는데?"
       ↓
마지막 라우트 (404 처리) 실행
       ↓
authStore.isAuthenticated = true
       ↓
redirect: () => '/admin/adminMain'
       ↓
admin 대시보드로 자동 이동

// 예시 3: 정의된 경로로 접근
사용자: /admin/adminMain 입력
       ↓
라우터: "어, 이건 정의된 경로네!"
       ↓
마지막 라우트 실행 안 함 (위에서 이미 매칭됨)
       ↓
/admin/adminMain 페이지 표시
```

### Q: 왜 이런 기능이 필요한가요?
**A:** 사용자가 실수로 잘못된 주소를 입력했을 때 좋은 경험을 제공하기 위해서입니다.

```javascript
// redirect 없을 때
사용자가 /xyz 입력
→ 아무것도 표시 안 됨 (흰 화면)
→ 사용자: "뭐지? 버그야?"

// redirect 있을 때
사용자가 /xyz 입력
→ 자동으로 적절한 페이지로 이동
→ 사용자: "아, 주소가 잘못됐나 보네"
```

### Q: redirect에서 `||` (OR)를 사용하면 어떻게 되나요?
**A:** 문제가 있습니다.

```javascript
// 현재 코드 (문제 있음)
return authStore.isAuthenticated ? '/admin/adminMain' || '/worker/workerMain' : '/'

// 실제 동작:
authStore.isAuthenticated = true
→ '/admin/adminMain' || '/worker/workerMain'
→ 첫 번째가 truthy면 첫 번째 반환
→ 항상 '/admin/adminMain' 반환 (무조건)
→ admin이 아닌 worker도 admin으로 이동 (버그!)

// 올바른 코드:
return authStore.isAuthenticated ?
  (authStore.userRole === 'admin' ? '/admin/adminMain' : '/worker/workerMain')
  : '/'
```

---

## 요약

| 항목 | 설명 |
|-----|------|
| **폴더 구조** | pages/auth, admin, worker로 역할별 분류 |
| **라우팅** | URL과 컴포넌트를 매핑하는 기능 |
| **동적 임포트** | 필요할 때만 페이지 로드 (성능 향상) |
| **네이밍** | 파일은 PascalCase, 경로는 kebab-case, 라우트명은 camelCase |
| **인증** | 사용자 본인 확인 (로그인) |
| **권한** | 사용자가 접근 가능한 페이지 결정 |
| **Auth Store** | 전역으로 사용자 정보 관리 (localStorage 저장) |
| **Navigation Guard** | 페이지 이동 전 인증 및 권한 검증 |
| **로그인 흐름** | 계정 검증 → Auth Store 저장 → 라우터 이동 → Guard 통과 → 페이지 표시 |
| **데이터 전달** | Auth Store 사용 (새로고침 유지, 어디서나 접근) |
| **Redirect** | 잘못된 경로 접근 시 자동으로 올바른 페이지로 이동 |