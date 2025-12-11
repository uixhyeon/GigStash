<template>
  <div class="pb-20">
    <!-- 급여 상세 카드 -->
    <div class="mx-4 mt-4">
      <div
        class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm p-5"
      >
        <!-- 기간 필터 -->
        <div class="mb-4">
          <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              @click="periodFilter = 'day'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                periodFilter === 'day'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400',
              ]"
            >
              일별
            </button>
            <button
              @click="periodFilter = 'month'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                periodFilter === 'month'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400',
              ]"
            >
              월별
            </button>
          </div>
        </div>

        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">급여 상세</h2>

        <!-- 월별 달력 -->
        <div v-if="periodFilter === 'month'" class="mb-6">
          <!-- 달력 헤더 -->
          <div class="flex items-center justify-center gap-4 mb-4">
            <button
              @click="prevCalendarMonth"
              class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i class="fi fi-rr-angle-left text-gray-600 dark:text-gray-400"></i>
            </button>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ selectedCalendarMonth.year }}년 {{ selectedCalendarMonth.month + 1 }}월
            </h3>
            <button
              @click="nextCalendarMonth"
              class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i class="fi fi-rr-angle-right text-gray-600 dark:text-gray-400"></i>
            </button>
          </div>

          <!-- 달력 그리드 -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
            <!-- 요일 헤더 -->
            <div class="grid grid-cols-7 gap-1 mb-1">
              <div
                v-for="day in ['일', '월', '화', '수', '목', '금', '토']"
                :key="day"
                :class="[
                  'text-center text-xs font-medium py-2',
                  day === '일'
                    ? 'text-red-500 dark:text-red-400'
                    : day === '토'
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400',
                ]"
              >
                {{ day }}
              </div>
            </div>

            <!-- 날짜 그리드 -->
            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="date in calendarDates"
                :key="date.key"
                :class="[
                  'aspect-square p-1 rounded-lg text-center flex items-center justify-center relative',
                  date.isCurrentMonth
                    ? date.isToday
                      ? 'bg-transparent'
                      : date.hasWork
                        ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-300 dark:text-gray-600',
                ]"
              >
                <div
                  :class="[
                    'w-full h-full flex flex-col items-center justify-center',
                    date.isToday
                      ? 'rounded-full bg-white ring-1 ring-blue-200 shadow-md text-[var(--gray-900,#1E293B)] dark:bg-slate-800 dark:ring-blue-500/50 dark:shadow-none'
                      : '',
                  ]"
                >
                  <span
                    :class="[
                      'text-sm font-medium',
                      date.isCurrentMonth
                        ? date.isToday
                          ? 'text-[var(--gray-900,#1E293B)]'
                          : 'text-gray-900 dark:text-white'
                        : 'text-gray-300 dark:text-gray-600',
                    ]"
                  >
                    {{ date.day }}
                  </span>
                  <span
                    v-if="date.hasWork && date.isCurrentMonth"
                    :class="[
                      'text-[9px] font-medium mt-0.5 leading-tight',
                      date.isToday ? 'text-[var(--gray-900,#1E293B)]' : 'text-blue-600 dark:text-blue-400',
                    ]"
                  >
                    {{ formatCurrencyCompact(date.salary) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 일별/월별 리스트 -->
        <div v-if="periodFilter !== 'month' || filteredSalaryDetails.length === 0" class="space-y-3">
          <div
            v-for="item in filteredSalaryDetails"
            :key="item.id"
            class="flex justify-between items-start gap-3 py-2"
          >
            <div class="min-w-0">
              <div class="text-base text-gray-900 dark:text-white leading-snug">
                {{ item.dateLabel }}
              </div>
              <div class="text-base text-gray-900 dark:text-gray-400 mt-0.5 leading-snug">
                {{ item.eventName }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ item.workHours }}시간
              </div>
            </div>
            <div class="text-base  text-gray-900 dark:text-white whitespace-nowrap">
              {{ formatCurrency(item.salary) }}원
            </div>
          </div>

          <div
            v-if="filteredSalaryDetails.length === 0"
            class="text-center text-gray-400 dark:text-gray-500 text-sm py-8"
          >
            급여 내역이 없습니다.
          </div>
        </div>

        <!-- 총 급여 -->
        <div
          v-if="filteredSalaryDetails.length > 0"
          class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"
        >
          <span class="text-base text-gray-900 dark:text-white">총 급여</span>
          <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ formatCurrency(totalSalary) }}원
          </span>
        </div>
      </div>
    </div>

    <!-- 지급 내역 -->
    <div class="mx-4 mt-4">
      <div
        class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm p-5"
      >
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">지급 금액</h2>

        <!-- 지급 완료 내역 -->
        <div class="mb-6">
          <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-3">지급 완료</h3>
          <div class="space-y-2">
            <div
              v-for="item in completedPayments"
              :key="item.id"
              class="flex justify-between items-center py-2 px-3 rounded-lg border border-transparent bg-transparent dark:border-transparent dark:bg-transparent"
            >
              <div>
                <div class="text-base text-gray-900 dark:text-white">{{ item.period }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ item.paymentDate }}</div>
              </div>
              <div class="text-base text-gray-900 dark:text-white">
                {{ formatCurrency(item.amount) }}원
              </div>
            </div>
            <div
              v-if="completedPayments.length === 0"
              class="text-center text-gray-400 dark:text-gray-500 text-sm py-4"
            >
              지급 완료 내역이 없습니다.
            </div>
          </div>
        </div>

        <div class="border-t border-[var(--gray-200,#E2E8F0)] dark:border-gray-700 pt-4">
          <!-- 지급 예정 내역 -->
          <div>
            <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-3">지급 예정</h3>
            <div class="space-y-2">
              <div
                v-for="item in scheduledPayments"
                :key="item.id"
                class="flex justify-between items-center py-2 px-3 rounded-lg border border-transparent bg-blue-50 dark:border-transparent dark:bg-blue-900/20"
              >
                <div>
                  <div class="text-base text-gray-900 dark:text-white">{{ item.period }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    예정일: {{ item.scheduledDate }}
                  </div>
                </div>
                <div class="text-base text-blue-600 dark:text-blue-400">
                  {{ formatCurrency(item.amount) }}원
                </div>
              </div>
              <div
                v-if="scheduledPayments.length === 0"
                class="text-center text-gray-400 dark:text-gray-500 text-sm py-4"
              >
                지급 예정 내역이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { events } from '@/data/events'
import { vehicles } from '@/data/vehicles'
import { vehicleAssignments } from '@/data/vehicle-assignments'
import { lockers } from '@/data/lockers'
import { reservations as allReservations } from '@/data/reservations'

const authStore = useAuthStore()

const periodFilter = ref('month') // 'day', 'week', 'month'

// 달력 관련
const selectedCalendarMonth = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
})

// 시급
const HOURLY_WAGE = 30000 // 기본 시급 30,000원

// 로그인 이름을 driver 이름으로 매핑 (모든 케이스 오운전)
const workerNameToDriverName = (name) => {
  return '오운전'
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || '오운전')

// 워커가 담당하는 배차
// vehicle에서 driver 정보를 조회하여 필터링
const workerAssignments = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return vehicleAssignments.filter((a) => {
    const vehicle = vehicles.find((v) => v.id === a.vehicleId)
    return vehicle?.driver === driverName
  })
})

// 워커 배차에 포함된 vehicleId / eventId 집합
const workerVehicleIds = computed(() => new Set(workerAssignments.value.map((a) => a.vehicleId)))
const workerEventIds = computed(() => new Set(workerAssignments.value.map((a) => a.eventId)))

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  if (workerVehicleIds.value.size === 0) return []
  return lockers.filter((l) => workerVehicleIds.value.has(l.vehicleId))
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
  return events.filter((e) => eventIds.has(e.id) && e.eventDate)
})

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

// 예약 데이터를 급여 내역으로 변환 (같은 날짜, 같은 행사는 하나로 묶음)
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
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      eventMap[eventKey] = {
        id: eventKey,
        date: eventDate,
        dateObj: date,
        weekStart: weekStart,
        monthKey: monthKey,
        eventName: e.eventName || '행사',
        workHours: workHours,
        salary: salary,
      }
    }
  })

  return Object.values(eventMap)
})

// 필터링된 급여 내역
const filteredSalaryDetails = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let filtered = []

  if (periodFilter.value === 'day') {
    // 일별: 이번달의 근무했던 것 (오늘 날짜 기준으로 이번달, 과거 날짜만)
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)

    filtered = salaryDetails.value
      .filter((item) => {
        const itemDate = item.dateObj
        // 이번달이고, 오늘 이전 날짜만 (과거 근무만)
        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear &&
          itemDate <= today
        )
      })
      .map((item) => ({
        id: item.id,
        dateLabel: formatDateLabel(item.date),
        eventName: item.eventName,
        workHours: Math.round(item.workHours * 10) / 10,
        salary: item.salary,
      }))
      .sort((a, b) => {
        // 날짜로 먼저 정렬, 같은 날짜면 행사명으로 정렬
        const dateA = a.id.split('|')[0]
        const dateB = b.id.split('|')[0]
        if (dateA !== dateB) {
          return new Date(dateB) - new Date(dateA)
        }
        return (a.eventName || '').localeCompare(b.eventName || '')
      })
  } else {
    // 월별: 6개월 동안 (오늘 날짜 기준으로 최근 6개월)
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(today.getMonth() - 6)

    const monthGroups = {}
    salaryDetails.value
      .filter((item) => item.dateObj >= sixMonthsAgo && item.dateObj <= today)
      .forEach((item) => {
        if (!monthGroups[item.monthKey]) {
          monthGroups[item.monthKey] = {
            monthKey: item.monthKey,
            workHours: 0,
            salary: 0,
          }
        }
        monthGroups[item.monthKey].workHours += item.workHours
        monthGroups[item.monthKey].salary += item.salary
      })

    filtered = Object.values(monthGroups)
      .map((group) => ({
        id: group.monthKey,
        dateLabel: formatMonthLabel(group.monthKey),
        eventName: '',
        workHours: Math.round(group.workHours * 10) / 10,
        salary: group.salary,
      }))
      .sort((a, b) => b.id.localeCompare(a.id))
  }

  return filtered
})

// 총 급여
const totalSalary = computed(() => {
  // 월별 필터일 때는 선택한 달력 월의 총 급여만 계산
  if (periodFilter.value === 'month') {
    const year = selectedCalendarMonth.value.year
    const month = selectedCalendarMonth.value.month
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    let total = 0
    salaryDetails.value.forEach((item) => {
      const itemDate = item.dateObj
      if (
        itemDate.getFullYear() === year &&
        itemDate.getMonth() === month &&
        itemDate >= monthStart &&
        itemDate <= monthEnd
      ) {
        total += item.salary
      }
    })
    return total
  }

  // 일별 필터일 때는 필터링된 항목들의 합계
  return filteredSalaryDetails.value.reduce((sum, item) => sum + item.salary, 0)
})

// 지급 완료 내역 (예시 데이터)
const completedPayments = computed(() => {
  // 실제로는 API에서 가져와야 하지만, 예시로 계산된 급여를 기반으로 생성
  const payments = []
  const monthGroups = {}

  salaryDetails.value.forEach((item) => {
    if (!monthGroups[item.monthKey]) {
      monthGroups[item.monthKey] = {
        monthKey: item.monthKey,
        salary: 0,
      }
    }
    monthGroups[item.monthKey].salary += item.salary
  })

  // 지난 달까지는 지급 완료로 표시
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  Object.entries(monthGroups).forEach(([monthKey, group]) => {
    if (monthKey < currentMonth) {
      const [year, month] = monthKey.split('-')
      payments.push({
        id: `completed-${monthKey}`,
        period: formatMonthLabel(monthKey),
        amount: group.salary,
        paymentDate: `${year}년 ${parseInt(month)}월 말일`,
      })
    }
  })

  return payments.sort((a, b) => b.id.localeCompare(a.id))
})

// 지급 예정 내역
const scheduledPayments = computed(() => {
  const payments = []
  const monthGroups = {}

  salaryDetails.value.forEach((item) => {
    if (!monthGroups[item.monthKey]) {
      monthGroups[item.monthKey] = {
        monthKey: item.monthKey,
        salary: 0,
      }
    }
    monthGroups[item.monthKey].salary += item.salary
  })

  // 이번 달은 지급 예정으로 표시
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  Object.entries(monthGroups).forEach(([monthKey, group]) => {
    if (monthKey >= currentMonth) {
      const [year, month] = monthKey.split('-')
      payments.push({
        id: `scheduled-${monthKey}`,
        period: formatMonthLabel(monthKey),
        amount: group.salary,
        scheduledDate: `${year}년 ${parseInt(month)}월 말일`,
      })
    }
  })

  return payments.sort((a, b) => a.id.localeCompare(b.id))
})

// 날짜별 급여 데이터 매핑
const dailySalaryMap = computed(() => {
  const map = {}
  salaryDetails.value.forEach((item) => {
    const dateKey = item.date
    if (!map[dateKey]) {
      map[dateKey] = {
        salary: 0,
        workHours: 0,
      }
    }
    map[dateKey].salary += item.salary
    map[dateKey].workHours += item.workHours
  })
  return map
})

// 달력 날짜 생성
const calendarDates = computed(() => {
  const year = selectedCalendarMonth.value.year
  const month = selectedCalendarMonth.value.month

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)

  const firstDayOfWeek = firstDay.getDay()
  const lastDateOfMonth = lastDay.getDate()
  const lastDateOfPrevMonth = prevLastDay.getDate()

  const dates = []
  const today = new Date()

  // 이전 달의 날짜들
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = lastDateOfPrevMonth - i
    dates.push({
      key: `prev-${day}`,
      day,
      isCurrentMonth: false,
      isToday: false,
      hasWork: false,
      salary: 0,
    })
  }

  // 현재 달의 날짜들
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()

    const dailyData = dailySalaryMap.value[dateStr]
    const hasWork = !!dailyData

    dates.push({
      key: dateStr,
      day: i,
      dateStr,
      isCurrentMonth: true,
      isToday,
      hasWork,
      salary: hasWork ? dailyData.salary : 0,
    })
  }

  // 다음 달의 날짜들
  const weeksNeeded = Math.ceil((firstDayOfWeek + lastDateOfMonth) / 7)
  const totalDaysNeeded = weeksNeeded * 7
  const remainingDays = totalDaysNeeded - dates.length

  for (let i = 1; i <= remainingDays; i++) {
    dates.push({
      key: `next-${i}`,
      day: i,
      isCurrentMonth: false,
      isToday: false,
      hasWork: false,
      salary: 0,
    })
  }

  return dates
})

// 달력 월 이동 함수
const prevCalendarMonth = () => {
  if (selectedCalendarMonth.value.month === 0) {
    selectedCalendarMonth.value.month = 11
    selectedCalendarMonth.value.year--
  } else {
    selectedCalendarMonth.value.month--
  }
}

const nextCalendarMonth = () => {
  if (selectedCalendarMonth.value.month === 11) {
    selectedCalendarMonth.value.month = 0
    selectedCalendarMonth.value.year++
  } else {
    selectedCalendarMonth.value.month++
  }
}

// 날짜 포맷 함수들
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-')
  return `${year}년 ${parseInt(month)}월`
}

const formatCurrency = (amount) => {
  return amount.toLocaleString('ko-KR')
}

// 급여를 간단하게 표시 (천 단위로)
const formatCurrencyCompact = (amount) => {
  if (amount >= 100000) {
    const 만 = Math.floor(amount / 10000)
    const 천 = Math.floor((amount % 10000) / 1000)
    return 천 > 0 ? `${만}.${천}만` : `${만}만`
  } else if (amount >= 10000) {
    return `${Math.round(amount / 10000)}만`
  } else if (amount >= 1000) {
    return `${Math.round(amount / 1000)}천`
  }
  return `${amount}`
}
</script>
