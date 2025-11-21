// API 설정 - Vue reactive로 작성하여 디버깅 및 동적 변경 가능
import { reactive } from 'vue'

export const API_CONFIG = reactive({
  // 서버 연결 시 'real'로 변경
  mode: 'mock',
  // mode: 'real',

  // 실제 서버 URL (나중에 사용)
  baseURL: 'http://localhost:3000/api',

  // Mock 모드 설정
  mockDelay: 500, // API 호출하는 것처럼 지연 시뮬레이션
})

// 개발 도구: 런타임에 모드 전환 가능
export const toggleApiMode = () => {
  API_CONFIG.mode = API_CONFIG.mode === 'mock' ? 'real' : 'mock'
  console.log(`🔄 API Mode switched to: ${API_CONFIG.mode}`)
}

// 개발 도구: Vue DevTools에서 접근 가능하도록 window에 노출
if (import.meta.env.DEV) {
  window.__GIGSTASH_API_CONFIG__ = API_CONFIG
  window.__TOGGLE_API_MODE__ = toggleApiMode
  console.log('🛠️ Dev Tools Available:')
  console.log('  - window.__GIGSTASH_API_CONFIG__: API 설정 확인')
  console.log('  - window.__TOGGLE_API_MODE__(): Mock ↔ Real 전환')
}
