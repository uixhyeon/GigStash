# GIGSTASH

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

## 로그인 화면 설정

로그인 화면은 현재 **비활성화** 상태입니다. 앱 시작 시 바로 관리자 페이지로 이동합니다.

### 로그인 화면 다시 활성화하기

`src/router/index.js` 파일에서 `LOGIN_ENABLED` 값을 `true`로 변경하세요:

```js
// 로그인 화면 활성화/비활성화 설정
// true: 로그인 화면 표시, false: 로그인 건너뛰고 바로 admin 페이지로 이동
const LOGIN_ENABLED = true  // false → true로 변경
```

### 테스트 계정 정보

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@example.com | admin123 |
| 기사 | worker@example.com | worker123 |
