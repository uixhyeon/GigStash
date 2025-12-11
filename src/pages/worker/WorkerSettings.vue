<template>
  <div class="pb-20">
    <div class="px-4 py-4">
      <!-- 프로필 정보 카드 -->
      <div
        class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm p-5"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden flex-shrink-0"
          >
            <img
              v-if="userInfo.profileImage"
              :src="userInfo.profileImage"
              alt="프로필"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{
              userInfo.displayName?.charAt(0) || '?'
            }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <div class="text-lg font-bold text-gray-900 dark:text-white">
                {{ userInfo.displayName }}
              </div>
              <button
                @click="handleLogout"
                class="text-sm text-gray-900 dark:text-gray-100 flex items-baseline gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <i class="fi fi-rr-sign-out-alt text-sm leading-none"></i>
                <span class="leading-none">로그아웃</span>
              </button>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ userInfo.phone }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ userInfo.email }}</div>
          </div>
        </div>
        <div class="mt-4 text-right">
          <button @click="goToEditProfile" class="text-blue-600 dark:text-blue-400 text-sm">
            내정보 수정 >
          </button>
        </div>
      </div>

      <!-- 일정 정보 카드 -->
      <div
        class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mt-4 p-5"
      >
        <div class="text-lg font-bold text-gray-900 dark:text-white mb-3">내 근무 일정</div>
        <div class="space-y-3">
          <!-- <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">오늘 행사</span>
            <span class="text-base text-gray-900 dark:text-white">{{ todayScheduleCount }}건</span>
          </div> -->
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">이번 주 행사</span>
            <span class="text-base text-gray-900 dark:text-white">{{ weekScheduleCount }}건</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">이번 달 행사</span>
            <span class="text-base text-gray-900 dark:text-white">{{ monthScheduleCount }}건</span>
          </div>
          <div class="flex justify-end mt-2">
            <button @click="goToCalendar" class="text-blue-600 dark:text-blue-400 text-sm">
              자세히 보기 >
            </button>
          </div>
        </div>
      </div>

      <!-- 버튼 영역 -->
      <div class="mt-4 mb-4 flex justify-end items-center gap-3">
        <!-- 다크모드 토글 버튼 -->
        <button
          @click="toggleDarkMode"
          class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 border border-gray-200 dark:border-gray-700"
        >
          <i
            :class="[isDark ? 'fi fi-rr-moon' : 'fi fi-rr-brightness', 'text-sm leading-none']"
            style="transform: translateY(1px)"
          ></i>
          <span class="leading-none">{{ isDark ? 'Dark' : 'Light' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/dataStore'
import { useRouter } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import { customers as customersData } from '@/data/customers'
import { events as eventsData } from '@/data/events'
import { lockers as lockersData } from '@/data/lockers'
import { reservations as allReservations } from '@/data/reservations'

const authStore = useAuthStore()
const dataStore = useDataStore()
const router = useRouter()
const { isDark, toggleDarkMode } = useDarkMode()

// dataStore 또는 직접 import 데이터 사용 (dataStore 우선)
const customers = computed(() =>
  dataStore.customers.length > 0 ? dataStore.customers : customersData,
)
const events = computed(() => (dataStore.events.length > 0 ? dataStore.events : eventsData))
const lockers = computed(() => (dataStore.lockers.length > 0 ? dataStore.lockers : lockersData))

const userInfo = ref({
  name: '오운전',
  displayName: '오운전',
  phone: '010-1234-5678',
  email: authStore.user?.email || 'driver@example.com',
  profileImage: null,
})

const goToCalendar = () => {
  router.push({ name: 'WorkerCalendar' })
}

const goToEditProfile = () => {
  router.push({ name: 'WorkerEditProfile' })
}

const goToSalaryDetail = () => {
  router.push({ name: 'WorkerSalaryDetail' })
}

const handleLogout = () => {
  const isConfirmed = window.confirm('정말 로그아웃하시겠습니까?')
  if (isConfirmed) {
    authStore.logout()
    router.push('/login')
  }
}

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

// 로그인 이름을 driver 이름으로 매핑
const workerNameToDriverName = (name) => {
  // 모든 케이스를 오운전으로 매핑
  return '오운전'
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || '오운전')

// 워커가 담당하는 배차 (dataStore에서 가져오기)
const workerAssignments = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return dataStore.vehicleAssignments.filter((a) => {
    const vehicle = dataStore.vehicles.find((v) => v.id === a.vehicleId)
    return vehicle?.driver === driverName
  })
})

// 워커 배차의 vehicleId / eventId 집합
const workerVehicleIds = computed(() => new Set(workerAssignments.value.map((a) => a.vehicleId)))
const workerEventIds = computed(() => new Set(workerAssignments.value.map((a) => a.eventId)))

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  if (workerVehicleIds.value.size === 0) return []
  const lockersArray = Array.isArray(lockers.value) ? lockers.value : lockers
  return lockersArray.filter((l) => workerVehicleIds.value.has(l.vehicleId))
})

// 워커 보관함에 연결된 예약
const workerRawReservations = computed(() => {
  if (workerVehicleIds.value.size === 0) return []
  const lockerIds = new Set(workerLockers.value.map((l) => l.id))
  const eventIds = workerEventIds.value
  return allReservations.filter((r) => lockerIds.has(r.lockerId) && eventIds.has(r.eventId))
})

// 워커가 실제로 참여하는 행사 목록
const workerEvents = computed(() => {
  const eventIds = workerEventIds.value
  const eventsArray = Array.isArray(events.value) ? events.value : events
  return eventsArray.filter((e) => eventIds.has(e.id) && e.eventDate)
})

// 날짜별 행사 그룹화
const eventsByDate = computed(() => {
  const eventsMap = {}

  workerEvents.value.forEach((e) => {
    const eventDate = e.eventDate
    if (!eventDate) return

    const key = `${eventDate}|${e.eventName || '행사'}|${e.eventVenue || '-'}`
    if (!eventsMap[key]) {
      const dateObj = new Date(eventDate)
      eventsMap[key] = { date: eventDate, dateObj }
    }
  })

  return Object.values(eventsMap)
})

// 오늘 일정 수
const todayScheduleCount = computed(() => {
  return vehicle.value.filter((e) => e.date === todayStr.value).length
})

// 이번 주 일정 수
const weekScheduleCount = computed(() => {
  const todayValue = today.value
  const weekStart = new Date(todayValue)
  weekStart.setDate(todayValue.getDate() - todayValue.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return eventsByDate.value.filter((e) => {
    const eventDate = new Date(e.date)
    return eventDate >= weekStart && eventDate <= weekEnd
  }).length
})

// 이번 달 일정 수
const monthScheduleCount = computed(() => {
  const todayValue = today.value
  const monthStart = new Date(todayValue.getFullYear(), todayValue.getMonth(), 1)
  const monthEnd = new Date(todayValue.getFullYear(), todayValue.getMonth() + 1, 0)

  return eventsByDate.value.filter((e) => {
    const eventDate = new Date(e.date)
    return eventDate >= monthStart && eventDate <= monthEnd
  }).length
})

// 급여 계산 로직
const HOURLY_WAGE = 30000 // 기본 시급 30,000원

// 근무시간 계산 (행사 시간 + 6시간)
const calculateWorkHours = (eventStartTime, eventEndTime) => {
  if (!eventStartTime || !eventEndTime) return 0

  const start = eventStartTime instanceof Date ? eventStartTime : new Date(eventStartTime)
  const end = eventEndTime instanceof Date ? eventEndTime : new Date(eventEndTime)

  // 행사 시간
  const eventDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  // 행사 시간 + 6시간
  return eventDuration + 6
}

// 급여 계산 (1일 8시간까지 기본, 초과분은 1.5배 가산)
const calculateSalary = (workHours) => {
  if (!workHours || workHours <= 0) return 0

  const baseHours = Math.min(workHours, 8)
  const overtimeHours = Math.max(workHours - 8, 0)

  const basePay = baseHours * HOURLY_WAGE
  const overtimePay = overtimeHours * HOURLY_WAGE * 1.5

  return Math.round(basePay + overtimePay)
}

// 이벤트 performanceTime을 Date로 변환
const buildEventTimes = (event) => {
  if (!event.eventDate || !event.performanceTime) {
    return { start: null, end: null }
  }

  const dateStr = event.eventDate
  const perf = event.performanceTime

  // "HH:MM-HH:MM" 또는 "HH:MM-??:??" 형태
  if (perf.includes('-')) {
    const [startStr, endStr] = perf.split('-')
    const [sh, sm] = startStr.split(':').map((v) => parseInt(v, 10) || 0)

    const start = new Date(
      `${dateStr}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00Z`,
    )

    // 끝 시간이 명시된 경우 그대로 사용, 아니면 기본 3시간으로 가정
    if (endStr && endStr.includes(':')) {
      const [eh, em] = endStr.split(':').map((v) => parseInt(v, 10) || 0)
      const end = new Date(
        `${dateStr}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00Z`,
      )
      return { start, end }
    } else {
      const end = new Date(start)
      end.setHours(end.getHours() + 3)
      return { start, end }
    }
  }

  // "HH:MM" 단일 값이면 3시간 공연으로 가정
  const [h, m] = perf.split(':').map((v) => parseInt(v, 10) || 0)
  const start = new Date(
    `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`,
  )
  const end = new Date(start)
  end.setHours(end.getHours() + 3)
  return { start, end }
}

// 급여 내역 계산 (같은 날짜, 같은 행사는 하나로 묶음)
const salaryDetails = computed(() => {
  const eventMap = {} // 날짜 + 행사명 + 장소를 키로 사용

  workerEvents.value.forEach((e) => {
    const eventDate = e.eventDate
    if (!eventDate) return

    const eventKey = `${eventDate}|${e.eventName || '행사'}|${e.eventVenue || '-'}`

    if (!eventMap[eventKey]) {
      const { start, end } = buildEventTimes(e)
      const workHours = calculateWorkHours(start, end)
      const salary = calculateSalary(workHours)
      const date = new Date(eventDate)

      eventMap[eventKey] = {
        date: eventDate,
        dateObj: date,
        salary: salary,
      }
    }
  })

  return Object.values(eventMap)
})

// 오늘 급여
const todaySalary = computed(() => {
  return salaryDetails.value
    .filter((item) => item.date === todayStr.value)
    .reduce((sum, item) => sum + item.salary, 0)
})

// 이번 주 급여
const weekSalary = computed(() => {
  const todayValue = today.value
  const weekStart = new Date(todayValue)
  weekStart.setDate(todayValue.getDate() - todayValue.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return salaryDetails.value
    .filter((item) => {
      const eventDate = new Date(item.dateObj)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= weekStart && eventDate <= weekEnd
    })
    .reduce((sum, item) => sum + item.salary, 0)
})

// 이번 달 급여
const monthSalary = computed(() => {
  const todayValue = today.value
  const monthStart = new Date(todayValue.getFullYear(), todayValue.getMonth(), 1)
  const monthEnd = new Date(todayValue.getFullYear(), todayValue.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)

  return salaryDetails.value
    .filter((item) => {
      const eventDate = new Date(item.dateObj)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= monthStart && eventDate <= monthEnd
    })
    .reduce((sum, item) => sum + item.salary, 0)
})

// 통화 포맷
const formatCurrency = (amount) => {
  return amount.toLocaleString('ko-KR')
}
</script>
