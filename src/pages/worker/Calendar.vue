<template>
  <div class="pb-20">
    <!-- 월 이동 버튼 -->
    <div class="flex items-center justify-between mb-6 mx-4 mt-4">
      <button
        @click="prevMonth"
        class="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
        title="이전 달"
      >
        <i class="fi fi-rr-angle-left text-2xl text-slate-700 dark:text-slate-300"></i>
      </button>
      <div class="text-lg font-bold text-gray-900 dark:text-white flex-1 text-center">
        {{ year }}년 {{ month + 1 }}월
      </div>
      <button
        @click="nextMonth"
        class="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
        title="다음 달"
      >
        <i class="fi fi-rr-angle-right text-2xl text-slate-700 dark:text-slate-300"></i>
      </button>
    </div>

    <!-- 월별 일정 리스트 -->
    <div
      v-if="monthEvents.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 text-sm py-6 mx-4"
    >
      이번 달 일정이 없습니다.
    </div>
    <div v-else class="mx-4 space-y-6">
      <div v-for="dateGroup in monthEvents" :key="dateGroup.date" class="space-y-3">
        <!-- 날짜 헤더 -->
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ formatDateHeader(dateGroup.date) }}
          </h3>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            ({{ dateGroup.events.length }}건)
          </span>
        </div>

        <!-- 해당 날짜의 일정 리스트 -->
        <ul class="space-y-2">
          <li
            v-for="event in dateGroup.events"
            :key="event.key"
            class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
              >
                행
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-base truncate text-gray-900 dark:text-white">
                  {{ event.eventName }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {{ event.eventVenue }}
                </p>
                <div class="mt-1 text-sm text-gray-600 dark:text-gray-500">
                  {{ event.eventType }}
                </div>
                <div class="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span
                    class="text-sm px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                  >
                    {{
                      event.bookedCustomerCount > 0
                        ? `예약 고객: ${event.bookedCustomerCount}명`
                        : '예약 0명'
                    }}
                  </span>
                  <span
                    v-if="event.operatingHours"
                    class="text-sm px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    {{ event.operatingHours }}
                  </span>
                  <span
                    class="text-sm px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200"
                  >
                    {{ myDriverName }}
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { events } from '@/data/events'
import { vehicles } from '@/data/vehicles'
import { lockers } from '@/data/lockers'
import { reservations as allReservations } from '@/data/reservations'

const authStore = useAuthStore()

// 현재 날짜 및 뷰 날짜
const today = new Date()
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const year = computed(() => viewDate.value.getFullYear())
const month = computed(() => viewDate.value.getMonth())

// 날짜 key 포맷 함수
const fmtKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 이전/다음 달 이동
const prevMonth = () => {
  viewDate.value = new Date(year.value, month.value - 1, 1)
}

const nextMonth = () => {
  viewDate.value = new Date(year.value, month.value + 1, 1)
}

// 로그인 이름을 vehicles.js의 driver 이름으로 매핑
const workerNameToDriverName = (name) => {
  const mapping = {
    '박기사': '김운전',
    '김기사': '김운전',
    '이기사': '이운전',
    // 추가 매핑 필요시 여기에 추가
  }
  return mapping[name] || name
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || '김운전')

// 현재 로그인한 기사의 드라이버 이름
const myDriverName = computed(() => workerNameToDriverName(currentWorkerName.value))

// 워커가 담당하는 차량
const workerVehicles = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return vehicles.filter((v) => v.driver === driverName)
})

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  const vehicleIds = new Set(workerVehicles.value.map((v) => v.id))
  return lockers.filter((l) => vehicleIds.has(l.vehicleId))
})

// 워커 보관함에 연결된 예약 (정규화된 reservations.js 기반)
const workerRawReservations = computed(() => {
  const lockerIds = new Set(workerLockers.value.map((l) => l.id))
  return allReservations.filter((r) => lockerIds.has(r.lockerId))
})

// 워커가 실제로 참여하는 행사 목록
const workerEvents = computed(() => {
  const eventIds = new Set(workerRawReservations.value.map((r) => r.eventId))
  return events.filter((e) => eventIds.has(e.id) && e.eventDate)
})

// 날짜별 행사 정보 계산 + 배정된 기사 정보 포함
// 본인 예약과 연결된 행사만 표시
const eventsByDate = computed(() => {
  const eventsMap = {}

  const normalizeName = (name) => (name || '').replace(/\s+/g, '')

  // 1단계: 본인이 참여하는 행사만 생성
  workerEvents.value.forEach((e) => {
    if (!e.eventDate) return

    const eventDate = e.eventDate
    const eventName = e.eventName || '행사'
    const eventVenue = e.eventVenue || '-'
    const eventType = e.eventType || '-'
    const key = `${eventDate}|${eventName}|${eventVenue}`

    if (!eventsMap[key]) {
      // 운영 시간은 performanceTime을 그대로 사용 (또는 "HH:MM-HH:MM" 형태)
      const operatingHours = e.performanceTime || ''

      // vehicles.js에서 배정된 기사 목록 찾기
      const assignedDrivers = Array.from(
        new Set(vehicles.filter((v) => v.eventId === e.id && v.driver).map((v) => v.driver)),
      )

      // 본인 예약 수 계산
      const bookedCustomerCount = workerRawReservations.value.filter(
        (r) => r.eventId === e.id
      ).length

      eventsMap[key] = {
        date: eventDate,
        eventName,
        eventVenue,
        eventType,
        operatingHours,
        bookedCustomerCount,
        drivers: assignedDrivers,
        vehicleCount: assignedDrivers.length,
        key,
      }
    }
  })

  return eventsMap
})

// 현재 월의 일정들을 날짜별로 그룹화
const monthEvents = computed(() => {
  const monthStart = fmtKey(new Date(year.value, month.value, 1))
  const monthEnd = fmtKey(new Date(year.value, month.value + 1, 0))

  // 현재 월의 일정만 필터링
  const monthEventsMap = {}
  for (const eventKey in eventsByDate.value) {
    const event = eventsByDate.value[eventKey]
    if (event.date >= monthStart && event.date <= monthEnd) {
      if (!monthEventsMap[event.date]) {
        monthEventsMap[event.date] = []
      }
      monthEventsMap[event.date].push(event)
    }
  }

  // 날짜순으로 정렬하여 배열로 변환
  const sortedDates = Object.keys(monthEventsMap).sort()
  return sortedDates.map((date) => ({
    date,
    events: monthEventsMap[date],
  }))
})

// 날짜 헤더 포맷 함수
const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}
</script>
