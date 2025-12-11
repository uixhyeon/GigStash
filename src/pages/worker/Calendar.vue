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

    <!-- 오른쪽 아래 고정 버튼 -->
    <button
      @click="showAllWorkersModal = true"
      class="fixed bottom-20 right-4 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
    >
      <i class="fi fi-rr-users text-lg"></i>
      <span class="text-sm font-medium">전체 기사일정보기</span>
    </button>

    <!-- 전체 기사일정 모달 -->
    <Teleport to="body">
      <div
        v-if="showAllWorkersModal"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        @click.self="showAllWorkersModal = false"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        >
          <!-- 모달 헤더 -->
          <div
            class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center rounded-t-2xl z-10"
          >
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">전체 기사일정보기(임시)</h2>
            <button
              @click="showAllWorkersModal = false"
              class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <!-- 모달 내용 -->
          <div class="flex-1 overflow-y-auto p-5">
            <div
              v-if="allEventsWithDrivers.length === 0"
              class="text-center text-gray-600 dark:text-gray-400 py-8"
            >
              등록된 이벤트가 없습니다.
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="eventGroup in allEventsWithDrivers"
                :key="eventGroup.date"
                class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
              >
                <!-- 날짜 헤더 -->
                <div class="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                    {{ formatDateHeader(eventGroup.date) }}
                  </h3>
                </div>

                <!-- 해당 날짜의 이벤트들 -->
                <div class="space-y-3">
                  <div
                    v-for="event in eventGroup.events"
                    :key="event.id"
                    class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                  >
                    <!-- 이벤트 정보 -->
                    <div class="mb-2">
                      <p class="text-base font-medium text-gray-900 dark:text-white">
                        {{ event.eventName }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ event.eventVenue }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {{ event.eventType }}
                      </p>
                      <p
                        v-if="event.performanceTime"
                        class="text-xs text-gray-500 dark:text-gray-500 mt-1"
                      >
                        시간: {{ event.performanceTime }}
                      </p>
                    </div>

                    <!-- 배차된 기사 목록 -->
                    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        배차된 기사 ({{ event.assignedDrivers.length }}명)
                      </p>
                      <div v-if="event.assignedDrivers.length > 0" class="flex flex-wrap gap-2">
                        <span
                          v-for="driver in event.assignedDrivers"
                          :key="driver"
                          class="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        >
                          {{ driver }}
                        </span>
                      </div>
                      <p v-else class="text-xs text-gray-500 dark:text-gray-500">
                        배차된 기사가 없습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Teleport } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { events } from '@/data/events'
import { vehicleAssignments } from '@/data/vehicle-assignments'
import { vehicles } from '@/data/vehicles'
import { lockers } from '@/data/lockers'
import { reservations as allReservations } from '@/data/reservations'

const authStore = useAuthStore()

// 모달 상태
const showAllWorkersModal = ref(false)

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

// 로그인 이름을 driver 이름으로 매핑
const workerNameToDriverName = (name) => {
  // 모든 케이스를 오운전으로 매핑
  return '오운전'
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || '오운전')

// 현재 로그인한 기사의 드라이버 이름
const myDriverName = computed(() => workerNameToDriverName(currentWorkerName.value))

// 워커가 담당하는 배차
// vehicle에서 driver 정보를 조회하여 필터링
const workerAssignments = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return vehicleAssignments.filter((a) => {
    const vehicle = vehicles.find((v) => v.id === a.vehicleId)
    return vehicle?.driver === driverName
  })
})

// 워커 배차의 vehicleId / eventId 집합
const workerVehicleIds = computed(() => new Set(workerAssignments.value.map((a) => a.vehicleId)))
const workerEventIds = computed(() => new Set(workerAssignments.value.map((a) => a.eventId)))

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  if (workerVehicleIds.value.size === 0) return []
  return lockers.filter((l) => workerVehicleIds.value.has(l.vehicleId))
})

// 워커 보관함에 연결된 예약 (정규화된 reservations.js 기반)
const workerRawReservations = computed(() => {
  if (workerVehicleIds.value.size === 0) return []
  const lockerIds = new Set(workerLockers.value.map((l) => l.id))
  const eventIds = workerEventIds.value
  return allReservations.filter((r) => lockerIds.has(r.lockerId) && eventIds.has(r.eventId))
})

// 워커가 실제로 참여하는 행사 목록
const workerEvents = computed(() => {
  const eventIds = workerEventIds.value
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

      // 배정된 기사 목록 찾기 (vehicle에서 driver 정보 조회)
      const assignedDrivers = Array.from(
        new Set(
          vehicleAssignments
            .filter((a) => a.eventId === e.id)
            .map((a) => {
              const vehicle = vehicles.find((v) => v.id === a.vehicleId)
              return vehicle?.driver
            })
            .filter((driver) => driver), // undefined 제거
        ),
      )

      // 본인 예약 수 계산
      const bookedCustomerCount = workerRawReservations.value.filter(
        (r) => r.eventId === e.id,
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

// 전체 이벤트와 배차된 기사 정보 (모달용)
const allEventsWithDrivers = computed(() => {
  // 모든 이벤트를 날짜별로 그룹화
  const eventsByDateMap = {}

  events.forEach((event) => {
    if (!event.eventDate) return

    const eventDate = event.eventDate

    // 배정된 기사 목록 찾기
    const assignedDrivers = Array.from(
      new Set(
        vehicleAssignments.filter((a) => a.eventId === event.id && a.driver).map((a) => a.driver),
      ),
    )

    if (!eventsByDateMap[eventDate]) {
      eventsByDateMap[eventDate] = []
    }

    eventsByDateMap[eventDate].push({
      id: event.id,
      eventName: event.eventName || '행사',
      eventVenue: event.eventVenue || '-',
      eventType: event.eventType || '-',
      performanceTime: event.performanceTime || '',
      assignedDrivers: assignedDrivers,
    })
  })

  // 날짜순으로 정렬하여 배열로 변환
  const sortedDates = Object.keys(eventsByDateMap).sort()
  return sortedDates.map((date) => ({
    date,
    events: eventsByDateMap[date],
  }))
})
</script>
