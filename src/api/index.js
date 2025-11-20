// Axios 인스턴스 설정
import axios from 'axios'
import { API_CONFIG } from '@/config/api.config'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 (나중에 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 처리 로직
    if (error.response) {
      // 서버에서 응답이 온 경우
      switch (error.response.status) {
        case 401:
          // 인증 실패
          console.error('인증이 필요합니다.')
          // 로그인 페이지로 리다이렉트 등
          break
        case 403:
          console.error('접근 권한이 없습니다.')
          break
        case 404:
          console.error('요청한 리소스를 찾을 수 없습니다.')
          break
        case 500:
          console.error('서버 오류가 발생했습니다.')
          break
        default:
          console.error('API Error:', error.response.data)
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('서버로부터 응답이 없습니다.')
    } else {
      // 요청 설정 중에 오류가 발생한 경우
      console.error('요청 오류:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
