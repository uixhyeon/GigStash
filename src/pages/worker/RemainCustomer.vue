<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 페이지: RemainCustomer.vue                                           ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 페이지 (Page)                                                  ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 남은 예약 목록 표시 (진행중/완료)                                  ║
  ║ - 예약 완료 처리 및 취소                                             ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div class="pb-20">
    <!-- 탭 -->
    <div
      class="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 z-10"
    >
      <div class="flex">
        <button
          @click="activeTab = 'pending'"
          :class="[
            'flex-1 py-4 px-4 text-center border-b-2 transition-colors',
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span>예약번호</span>
            <span class="text-sm">({{ pendingReservations.length }}건)</span>
          </div>
        </button>
        <button
          @click="activeTab = 'completed'"
          :class="[
            'flex-1 py-4 px-4 text-center border-b-2 transition-colors',
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span>완료 예약</span>
            <span class="text-sm">({{ completedReservations.length }}건)</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 예약 목록 -->
    <div class="overflow-y-auto h-[calc(100vh-60px)]">
      <!-- 예약번호 탭 -->
      <div v-if="activeTab === 'pending'" class="p-4 space-y-2">
        <div
          v-for="reservation in pendingReservations"
          :key="reservation.id"
          class="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <div class="mb-2">
            <span class="text-base text-gray-900 dark:text-white">
              {{ reservation.id }}
            </span>
          </div>
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {{ reservation.customerName }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ reservation.phone }}
              </div>
            </div>
            <div class="ml-4">
              <button
                v-if="selectedReservationForComplete?.id !== reservation.id"
                @click="selectReservation(reservation)"
                class="text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                선택
              </button>
              <button
                v-else
                @click="completeReservationFromList(reservation)"
                class="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="pendingReservations.length === 0"
          class="text-center text-gray-400 dark:text-gray-500 text-sm py-8"
        >
          예약이 없습니다
        </div>
      </div>

      <!-- 완료 예약 탭 -->
      <div v-if="activeTab === 'completed'" class="p-4 space-y-2">
        <div
          v-for="reservation in completedReservations"
          :key="reservation.id"
          class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60"
        >
          <div class="mb-2">
            <span class="text-base text-gray-500 dark:text-gray-400">
              {{ reservation.id }}
            </span>
          </div>
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="text-sm text-gray-400 dark:text-gray-500 mb-1">
                {{ reservation.customerName }}
              </div>
              <div class="text-sm text-gray-400 dark:text-gray-500">
                {{ reservation.phone }}
              </div>
            </div>
            <div class="ml-4">
              <button
                v-if="selectedReservationForComplete?.id !== reservation.id"
                @click="selectReservation(reservation)"
                class="text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                선택
              </button>
              <button
                v-else
                @click="cancelCompletedReservation(reservation)"
                class="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="completedReservations.length === 0"
          class="text-center text-gray-400 dark:text-gray-500 text-sm py-8"
        >
          완료된 예약이 없습니다
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import reservationsData from '@/data/reservations_2025_12.json'

const router = useRouter()

// 탭 상태 관리
const activeTab = ref('pending')

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
// 오늘 날짜의 예약만 필터링 (computed로 만들어서 날짜가 바뀌면 자동 업데이트)
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

const selectedReservationForComplete = ref(null)

// 진행중 예약 목록
const pendingReservations = computed(() => {
  return reservations.value.filter((r) => r.status !== 'done')
})

// 완료된 예약 목록
const completedReservations = computed(() => {
  return reservations.value.filter((r) => r.status === 'done')
})

// 예약 선택 처리
const selectReservation = (reservation) => {
  selectedReservationForComplete.value = reservation
}

// 완료 취소 처리 (선택 해제)
const cancelCompleteReservation = (reservation) => {
  selectedReservationForComplete.value = null
}

// 완료 처리
const completeReservationFromList = (reservation) => {
  reservationStatusMap.value.set(reservation.id, 'done')
  selectedReservationForComplete.value = null
  saveStatus()
}

// 완료된 예약 취소 처리 (완료 상태 해제)
const cancelCompletedReservation = (reservation) => {
  reservationStatusMap.value.set(reservation.id, 'scheduled')
  selectedReservationForComplete.value = null
  saveStatus()
}

// 상태 변경 시 로컬 스토리지에 저장
const saveStatus = () => {
  const statusObj = Object.fromEntries(reservationStatusMap.value)
  localStorage.setItem('reservationStatusMap', JSON.stringify(statusObj))
}

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
