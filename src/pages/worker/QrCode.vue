<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 페이지: QrCode.vue                                                   ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 페이지 (Page)                                                  ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 웹 카메라 연결 및 바코드 스캔                                      ║
  ║ - 예약번호/전화번호로 예약 조회 및 완료 처리                          ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div class="h-screen bg-black flex flex-col">
    <!-- 카메라 영역 (위쪽) -->
    <div class="flex-1 relative bg-black">
      <div id="barcode-scanner" class="w-full h-full flex items-center justify-center">
        <!-- 카메라 비디오가 여기에 표시됩니다 -->
      </div>

      <!-- QR 스캔 영역 가이드 (항상 표시) -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div class="relative w-[250px] h-[250px]">
          <!-- 외곽 반투명 배경 -->
          <div class="absolute inset-0 bg-black/30"></div>
          <!-- 모서리 코너 (기역자 모양) -->
          <div
            class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"
          ></div>
          <div
            class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"
          ></div>
          <div
            class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"
          ></div>
        </div>
      </div>

      <!-- 카메라 비디오 -->
      <video
        v-if="isScanning"
        ref="videoElement"
        autoplay
        playsinline
        class="w-full h-full object-cover"
      ></video>

      <!-- 스캔 안내 -->
      <div
        v-if="!isScanning"
        class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10"
      >
        <div class="text-white text-center mb-4">
          <div
            class="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 mx-auto"
          >
            <i class="fi fi-rr-camera text-4xl text-blue-400"></i>
          </div>
          <p class="text-lg font-bold mb-2">카메라 권한이 필요합니다</p>
          <p class="text-sm text-gray-300">카메라를 활성화해주세요</p>
        </div>
        <button
          @click="startCamera"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg text-base hover:bg-blue-700 transition-colors"
        >
          카메라 시작
        </button>
      </div>
    </div>

    <!-- 입력 영역 (아래쪽) - 접을 수 있게 -->
    <div class="bg-gray-900 border-t border-gray-700">
      <button
        @click="showBottomInput = !showBottomInput"
        class="w-full p-3 flex items-center justify-between text-white hover:bg-gray-800 transition-colors"
      >
        <span class="text-sm text-gray-300">수동 입력</span>
        <i :class="showBottomInput ? 'fi fi-rr-angle-up' : 'fi fi-rr-angle-down'"></i>
      </button>

      <div v-if="showBottomInput" class="p-4 border-t border-gray-700">
        <div class="mb-3">
          <div class="flex gap-2 mb-3">
            <button
              @click="searchType = 'reservation'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                searchType === 'reservation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              예약번호
            </button>
            <button
              @click="searchType = 'phone'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                searchType === 'phone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              전화번호
            </button>
          </div>
          <input
            v-model="searchInput"
            type="text"
            :placeholder="
              searchType === 'reservation' ? '예약번호를 입력하세요' : '전화번호를 입력하세요'
            "
            class="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="handleSearch"
            class="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            조회
          </button>
          <button
            v-if="selectedReservation"
            @click="completeReservation"
            class="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            완료
          </button>
        </div>

        <!-- 조회 결과 -->
        <div
          v-if="selectedReservation"
          class="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
        >
          <div class="text-white space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">예약번호</span>
              <span class="text-base">{{ selectedReservation.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">고객명</span>
              <span class="text-base">{{ selectedReservation.customerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">전화번호</span>
              <span class="text-base">{{ selectedReservation.phone }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">주소</span>
              <span class="text-base text-right">{{ selectedReservation.address }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">하차 시간</span>
              <span class="text-base">{{ selectedReservation.time }}</span>
            </div>
            <div v-if="selectedReservation.original" class="flex justify-between">
              <span class="text-sm text-gray-400">상태</span>
              <span
                class="text-base"
                :class="
                  selectedReservation.status === 'done' ? 'text-green-400' : 'text-yellow-400'
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import reservationsData from '@/data/reservations_monthly.json'

const router = useRouter()

// 바코드 모달 관련
const searchType = ref('reservation') // 'reservation' or 'phone'
const searchInput = ref('')
const quickSearchInput = ref('') // 상단 빠른 입력
const selectedReservation = ref(null)
const showBottomInput = ref(false) // 하단 입력 영역 접기/펼치기

// 오늘 날짜 (computed로 만들어서 날짜가 바뀌면 자동 업데이트)
const today = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const todayStr = computed(() => {
  const d = today.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 완료 상태 관리 (예약 ID를 키로 사용)
const reservationStatusMap = ref(new Map())

// reservations_2025_12.json 데이터를 워커 페이지 형식으로 변환
// 오늘 날짜의 예약만 필터링
const reservations = computed(() => {
  return reservationsData.reservations
    .filter((r) => {
      // dropoffTime 또는 eventDate 기준으로 오늘 날짜 확인
      if (r.dropoffTime) {
        const dropoffDate = new Date(r.dropoffTime)
        const dropoffDateStr = `${dropoffDate.getFullYear()}-${String(dropoffDate.getMonth() + 1).padStart(2, '0')}-${String(dropoffDate.getDate()).padStart(2, '0')}`
        return dropoffDateStr === todayStr.value
      }
      if (r.eventDate) {
        return r.eventDate === todayStr.value
      }
      return false
    })
    .map((r) => {
      // dropoffTime에서 시간 추출 (ISO 형식: "2025-11-01T15:33:00Z")
      const dropoffDate = r.dropoffTime ? new Date(r.dropoffTime) : null
      const timeStr = dropoffDate
        ? `${String(dropoffDate.getHours()).padStart(2, '0')}:${String(dropoffDate.getMinutes()).padStart(2, '0')}`
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

// 빠른 조회 (상단 입력)
const handleQuickSearch = () => {
  if (!quickSearchInput.value.trim()) return

  const searchTerm = quickSearchInput.value.trim()
  const found = reservations.value.find((r) => r.id === searchTerm || r.id.includes(searchTerm))

  if (found) {
    selectedReservation.value = found
    quickSearchInput.value = ''
  } else {
    alert('예약을 찾을 수 없습니다.')
    selectedReservation.value = null
  }
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
