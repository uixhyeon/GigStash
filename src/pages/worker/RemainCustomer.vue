
<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- 탭 (상단 고정) -->
    <div
      class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 z-10"
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
    <div class="flex-1 overflow-hidden min-h-0">
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
import { useAuthStore } from '@/stores/auth'
import { customers } from '@/data/customers'
import { events } from '@/data/events'
import { vehicleAssignments } from '@/data/vehicle-assignments'
import { lockers } from '@/data/lockers'
import { reservations as allReservations } from '@/data/reservations'

const router = useRouter()
const authStore = useAuthStore()

// 탭 상태 관리
const activeTab = ref('pending')

// 완료 상태 관리 (예약 ID를 키로 사용)
const reservationStatusMap = ref(new Map())

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

// 로그인 이름을 driver 이름으로 매핑
const workerNameToDriverName = (name) => {
  // 모든 케이스를 오운전으로 매핑
  return '오운전'
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || '오운전')

// 워커가 담당하는 배차
const workerAssignments = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return vehicleAssignments.filter((a) => a.driver === driverName)
})

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  const vehicleIds = new Set(workerAssignments.value.map((a) => a.vehicleId))
  return lockers.filter((l) => vehicleIds.has(l.vehicleId))
})

// 워커 보관함에 연결된 예약 (정규화된 reservations.js 기반)
const workerRawReservations = computed(() => {
  const lockerIds = new Set(workerLockers.value.map((l) => l.id))
  return allReservations.filter((r) => lockerIds.has(r.lockerId))
})

// 배정된 예약 정보 (상단 표시용)
const assignedReservationInfo = computed(() => {
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const eventMap = new Map(events.map((e) => [e.id, e]))

  // 워커에게 배정된 당일 예약 찾기
  const assignedReservation = workerRawReservations.value.find((r) => {
    const event = eventMap.get(r.eventId)

    // 오늘 날짜 기준으로 필터링
    if (event?.eventDate) {
      return event.eventDate === todayStr.value
    }

    if (r.startTime) {
      const d = new Date(r.startTime)
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
      return dStr === todayStr.value
    }

    if (r.endTime) {
      const d = new Date(r.endTime)
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
      return dStr === todayStr.value
    }

    return false
  })

  if (!assignedReservation) return null

  const event = eventMap.get(assignedReservation.eventId)

  // 도착 시간 계산 (운영 시작 시간 - 30분)
  let arrivalTime = null
  if (event?.startTime) {
    const startTime = new Date(event.startTime)
    startTime.setMinutes(startTime.getMinutes() - 30)
    arrivalTime = `${String(startTime.getHours()).padStart(2, '0')}:${String(
      startTime.getMinutes(),
    ).padStart(2, '0')}`
  }

  return {
    venue: event?.venue || '장소 미정',
    arrivalTime: arrivalTime || '시간 미정',
  }
})

// 고객/행사 정보를 join 해서 워커 페이지에서 쓰기 편한 형태로 변환
// 당일 + 워커 배정된 예약만 필터링
const reservations = computed(() => {
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const eventMap = new Map(events.map((e) => [e.id, e]))

  return workerRawReservations.value
    .filter((r) => {
      // 오늘 날짜 기준으로 필터링 (행사 날짜 또는 시작/종료 시간 기준)
      const event = eventMap.get(r.eventId)

      if (event?.eventDate) {
        return event.eventDate === todayStr.value
      }

      if (r.startTime) {
        const d = new Date(r.startTime)
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate(),
        ).padStart(2, '0')}`
        return dStr === todayStr.value
      }

      if (r.endTime) {
        const d = new Date(r.endTime)
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate(),
        ).padStart(2, '0')}`
        return dStr === todayStr.value
      }

      return false
    })
    .map((r) => {
      const customer = customerMap.get(r.customerId)
      const event = eventMap.get(r.eventId)

      // 하차 시간은 예약 endTime 기준
      const dropoffDate = r.endTime ? new Date(r.endTime) : null
      const timeStr = dropoffDate
        ? `${String(dropoffDate.getHours()).padStart(2, '0')}:${String(
            dropoffDate.getMinutes(),
          ).padStart(2, '0')}`
        : ''

      // 완료 상태 확인 (기본값은 "scheduled")
      const status =
        reservationStatusMap.value.get(r.id) || (r.status === 'completed' ? 'done' : 'scheduled')

      return {
        id: r.id,
        customerName: customer?.name || '고객',
        phone: customer?.phone || '',
        address: event?.venue || '',
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
