
<template>
  <div class="h-full bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
    <!-- 상단: 탭 바 (헤더 바로 아래) -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-shrink-0">
      <!-- 왼쪽: 수동 검색 탭 -->
      <button
        @click="activeTab = 'manual'"
        class="flex-1 h-[50px] text-base font-bold flex items-center justify-center gap-2 relative"
        :class="
          activeTab === 'manual'
            ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        "
      >
        <span
          v-if="activeTab === 'manual'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        ></span>
        <i class="fi fi-rr-search text-xl"></i>
        <span>수동 검색</span>
      </button>
      <!-- 오른쪽: QR 스캔 탭 -->
      <button
        @click="activeTab = 'qr'"
        class="flex-1 h-[50px] text-base font-bold flex items-center justify-center gap-2 relative"
        :class="
          activeTab === 'qr'
            ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        "
      >
        <span
          v-if="activeTab === 'qr'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        ></span>
        <i class="fi fi-rr-qr-scan text-xl"></i>
        <span>QR 스캔</span>
      </button>
    </div>

    <!-- 콘텐츠 영역: 탭에 따라 전체가 바뀌는 콘텐츠 -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- QR 스캔 화면 -->
      <div v-if="activeTab === 'qr'" class="flex-1 relative bg-black overflow-hidden">
        <!-- 카메라 비디오 (배경) -->
        <video
          v-if="isScanning"
          ref="videoElement"
          autoplay
          playsinline
          class="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        ></video>

        <!-- QR 스캔 영역 가이드 (중앙에만 표시) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div class="relative w-[260px] h-[260px]">
            <!-- 모서리 코너 (둥근 스타일) -->
            <div
              class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"
            ></div>
            <div
              class="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"
            ></div>
            <div
              class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"
            ></div>
          </div>
        </div>

        <!-- 스캔 안내 (카메라 미동작 시 중앙에만 표시) -->
        <div
          v-if="!isScanning"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black z-40"
        >
          <div class="flex flex-col items-center justify-center h-full w-full px-6">
            <div class="text-white text-center">
              <div
                class="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
              >
                <i class="fi fi-rr-camera text-5xl text-blue-400"></i>
              </div>
              <h2 class="text-2xl font-bold mb-2">카메라 권한이 필요합니다</h2>
              <p class="text-gray-300 mb-8">
                QR 코드를 스캔하기 위해 카메라 접근 권한이 필요합니다
              </p>
            </div>
            <button
              @click="startCamera"
              class="bg-blue-500 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              카메라 시작
            </button>
          </div>
        </div>
      </div>

      <!-- 수동 검색 화면 -->
      <div v-else class="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
        <div class="p-5 pb-6 space-y-5">
          <!-- 검색 옵션 카드 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">검색 옵션</h2>

            <!-- 검색 타입 -->
            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">검색 유형</p>
              <div class="flex gap-2">
                <button
                  @click="searchType = 'reservation'"
                  :class="[
                    'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
                    searchType === 'reservation'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                  ]"
                >
                  예약번호
                </button>
                <button
                  @click="searchType = 'phone'"
                  :class="[
                    'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
                    searchType === 'phone'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                  ]"
                >
                  전화번호
                </button>
              </div>
            </div>

            <!-- 입력창 -->
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">검색어 입력</p>
              <input
                v-model="searchInput"
                type="text"
                :placeholder="
                  searchType === 'reservation' ? '예약번호를 입력하세요' : '전화번호를 입력하세요'
                "
                class="w-full px-4 py-3.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none text-base"
                @keyup.enter="handleSearch"
              />
            </div>
          </div>

          <!-- 조회 / 완료 버튼 -->
          <div class="flex gap-3">
            <button
              @click="handleSearch"
              class="flex-1 bg-blue-500 text-white py-4 rounded-2xl text-base font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              조회하기
            </button>
            <button
              v-if="selectedReservation"
              @click="completeReservation"
              class="flex-1 bg-green-500 text-white py-4 rounded-2xl text-base font-bold hover:bg-green-600 transition-all shadow-lg active:scale-95"
            >
              완료 처리
            </button>
          </div>

          <!-- 회원 정보 카드 -->
          <div
            v-if="selectedReservation"
            class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-blue-500/40 dark:border-blue-500/40"
          >
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">회원 정보</h2>
            <div class="space-y-4">
              <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">예약번호</span>
                <span class="text-base font-bold text-gray-900 dark:text-white">{{ selectedReservation.id }}</span>
              </div>
              <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">고객명</span>
                <span class="text-base font-semibold text-gray-900 dark:text-white">{{
                  selectedReservation.customerName
                }}</span>
              </div>
              <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">전화번호</span>
                <span class="text-base font-semibold text-gray-900 dark:text-white">{{
                  selectedReservation.phone
                }}</span>
              </div>
              <div class="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">주소</span>
                <span class="text-base text-right flex-1 break-words text-gray-700 dark:text-gray-300 ml-4">
                  {{ selectedReservation.address }}
                </span>
              </div>
              <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">하차 시간</span>
                <span class="text-base font-semibold text-gray-900 dark:text-white">{{
                  selectedReservation.time
                }}</span>
              </div>
              <div v-if="selectedReservation.original" class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">상태</span>
                <span
                  class="text-base font-bold px-3 py-1 rounded-full"
                  :class="
                    selectedReservation.status === 'done'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-200'
                  "
                >
                  {{ selectedReservation.status === 'done' ? '완료' : '진행중' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import reservationsData from '@/data/reservations_monthly.json'

const router = useRouter()

// 하단 탭 상태: 'qr' | 'manual'
const activeTab = ref('qr')

// 바코드 / 수동 검색 관련
const searchType = ref('reservation') // 'reservation' or 'phone'
const searchInput = ref('')
const selectedReservation = ref(null)

// 기간 필터 (일간 / 주간 / 월간)
const periodFilter = ref('day')

// 오늘 날짜 (computed로 만들어서 날짜가 바뀌면 자동 업데이트)
const today = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const todayStr = computed(() => {
  const d = today.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
})

// 완료 상태 관리 (예약 ID를 키로 사용)
const reservationStatusMap = ref(new Map())

// 기간 필터에 맞게 날짜 포함 여부 체크
const isInSelectedPeriod = (dateStr) => {
  if (!dateStr) return false
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)

  const base = today.value

  if (periodFilter.value === 'day') {
    return target.getTime() === base.getTime()
  }

  if (periodFilter.value === 'week') {
    const weekStart = new Date(base)
    weekStart.setDate(base.getDate() - base.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return target >= weekStart && target <= weekEnd
  }

  // month
  const monthStart = new Date(base.getFullYear(), base.getMonth(), 1)
  const monthEnd = new Date(base.getFullYear(), base.getMonth() + 1, 0)
  return target >= monthStart && target <= monthEnd
}

// reservations_2025_12.json 데이터를 워커 페이지 형식으로 변환
// 선택한 기간의 예약만 필터링
const reservations = computed(() => {
  return reservationsData.reservations
    .filter((r) => {
      let baseDate = null
      if (r.dropoffTime) {
        baseDate = r.dropoffTime.split('T')[0]
      } else if (r.eventDate) {
        baseDate = r.eventDate
      }
      return isInSelectedPeriod(baseDate)
    })
    .map((r) => {
      // dropoffTime에서 시간 추출 (ISO 형식: "2025-11-01T15:33:00Z")
      const dropoffDate = r.dropoffTime ? new Date(r.dropoffTime) : null
      const timeStr = dropoffDate
        ? `${String(dropoffDate.getHours()).padStart(2, '0')}:${String(
            dropoffDate.getMinutes(),
          ).padStart(2, '0')}`
        : ''

      // 완료 상태 확인 (기본값은 "scheduled")
      const status = reservationStatusMap.value.get(r.id) || 'scheduled'

      return {
        id: r.id,
        customerName: r.customerName,
        phone: r.customerPhone,
        address: r.deliveryAddress || r.eventVenue || '',
        time: timeStr,
        status: status,
        // 원본 데이터도 함께 저장 (추가 정보 표시용)
        original: r,
      }
    })
})

// 카메라 관련
const isScanning = ref(false)
const videoElement = ref(null)
let stream = null

const startCamera = async () => {
  try {
    isScanning.value = true

    // 카메라 스트림 가져오기
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 후면 카메라 우선
      },
    })

    // 비디오 요소에 스트림 연결
    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }
  } catch (err) {
    console.error('카메라 시작 실패:', err)
    alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.')
    isScanning.value = false
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  isScanning.value = false
}

// 예약번호/전화번호로 조회 (하단 입력)
const handleSearch = () => {
  if (!searchInput.value.trim()) return

  let found = null
  const searchTerm = searchInput.value.trim()
  if (searchType.value === 'reservation') {
    found = reservations.value.find((r) => r.id === searchTerm || r.id.includes(searchTerm))
  } else {
    // 전화번호 검색 (하이픈 제거 후 비교)
    const normalizedSearch = searchTerm.replace(/-/g, '')
    found = reservations.value.find((r) => {
      const normalizedPhone = r.phone ? r.phone.replace(/-/g, '') : ''
      return (
        normalizedPhone.includes(normalizedSearch) || normalizedSearch.includes(normalizedPhone)
      )
    })
  }

  if (found) {
    selectedReservation.value = found
  } else {
    alert('예약을 찾을 수 없습니다.')
    selectedReservation.value = null
  }
}

// 완료 처리
const completeReservation = () => {
  if (!selectedReservation.value) return

  reservationStatusMap.value.set(selectedReservation.value.id, 'done')

  // 로컬 스토리지에 저장
  const statusObj = Object.fromEntries(reservationStatusMap.value)
  localStorage.setItem('reservationStatusMap', JSON.stringify(statusObj))

  alert('완료 처리되었습니다.')
  selectedReservation.value = null
  searchInput.value = ''
  router.push('/worker/workerMain')
}

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  stopCamera()
})

// 로컬 스토리지에서 상태 불러오기
onMounted(() => {
  const savedStatus = localStorage.getItem('reservationStatusMap')
  if (savedStatus) {
    try {
      const parsed = JSON.parse(savedStatus)
      reservationStatusMap.value = new Map(Object.entries(parsed))
    } catch (e) {
      console.error('상태 불러오기 실패:', e)
    }
  }
})
</script>
