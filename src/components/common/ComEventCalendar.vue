<template>
  <div>
    <!-- 달력 헤더 -->
    <div class="mb-4">
      <!-- 기존 헤더 -->
      <div class="flex justify-between gap-4 items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-table-header-text">
          {{ currentMonth }}
        </h3>
        <div class="flex gap-2 items-center">
          <!-- 년/월 드롭다운 -->
          <div class="flex items-center gap-2">
            <select
              :value="selectedYear"
              @change="handleYearChange"
              class="w-15 h-7 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}년</option>
            </select>
            <select
              :value="selectedMonth"
              @change="handleMonthChange"
              class="w-15 h-7 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            >
              <option v-for="month in 12" :key="month" :value="month">{{ month }}월</option>
            </select>
          </div>
          <p class="text-sm text-gray-600 dark:text-dark-text-secondary">
            총 {{ currentMonthEventCount }} 건
          </p>
          <button
            @click.prevent="handlePrevMonth"
            class="w-10 h-7 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-dark-border rounded-md transition-all flex-shrink-0 text-gray-600 dark:text-dark-text-secondary cursor-pointer"
            title="이전 달"
            type="button"
          >
            <i class="fi fi-br-angle-left text-sm"></i>
          </button>
          <button
            @click.prevent="handleNextMonth"
            class="w-10 h-7 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-dark-border rounded-md transition-all flex-shrink-0 text-gray-600 dark:text-dark-text-secondary cursor-pointer"
            title="다음 달"
            type="button"
          >
            <i class="fi fi-br-angle-right text-sm"></i>
          </button>
          <button
            @click.prevent="handleGoToToday"
            class="w-20 h-7 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-dark-border rounded-md transition-all flex-shrink-0 text-gray-600 dark:text-dark-text-secondary cursor-pointer"
            title="오늘로 이동"
            type="button"
          >
            오늘
          </button>
        </div>
      </div>
    </div>

    <!-- 달력 그리드 ==================================================================-->
    <div
      class="px-6 bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm"
      style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
    >
      <!-- 요일 헤더 -->
      <div
        class="grid grid-cols-7 gap-2 flex-shrink-0 -mx-6 px-6 py-3 bg-table-header-bg dark:bg-table-header-bg-dark rounded-t-2xl"
      >
        <div
          v-for="(day, index) in ['일', '월', '화', '수', '목', '금', '토']"
          :key="day"
          :class="[
            'text-center font-semibold text-xs',
            index === 0
              ? 'text-red-500 dark:text-red-400'
              : index === 6
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-table-header-text dark:text-table-header-text-dark',
          ]"
        >
          {{ day }}
        </div>
      </div>
      <div class="py-6">
        <!-- 캘린더 날짜 그리드 -->
        <div class="grid grid-cols-7 gap-2">
          <button
            v-for="(date, index) in calendarDates"
            :key="index"
            @click="handleDateClick(date)"
            :class="[
              'p-3 text-sm rounded-lg transition-all text-center flex flex-col items-center justify-center min-h-20 overflow-hidden',
              // 기본 글자색 (요일별)
              date.isCurrentMonth
                ? (index % 7 === 0
                    ? 'day-sunday-text'
                    : index % 7 === 6
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white') +
                  (date.eventCount > 0
                    ? ' hover:shadow-md hover:scale-105'
                    : ' hover:bg-blue-300  dark:hover:bg-slate-700') +
                  ' cursor-pointer'
                : 'text-gray-400 dark:text-gray-600',
              // 선택된 날짜
              isDateSelected(date)
                ? 'bg-blue-500 text-white'
                : // 행사가 있는 날짜 - 상태에 따라 다르게 (선택된 날짜 제외)
                  date.eventCount > 0
                  ? date.cancelledCount > 0
                    ? 'bg-amber-100 dark:bg-amber-900/30' // 취소 있음
                    : date.inProgressCount > 0
                      ? 'bg-teal-100 dark:bg-teal-900/30' // 진행중
                      : date.scheduledCount > 0
                        ? 'bg-blue-100 dark:bg-blue-900/30' // 예정
                        : date.completedCount > 0
                          ? 'bg-gray-100 dark:bg-gray-800' // 완료만
                          : ''
                  : '',
            ]"
          >
            <span
              :class="[
                'text-sm font-medium rounded-full flex items-center justify-center',
                date.isToday ? 'w-8 h-8 bg-red-500 text-white' : '',
              ]"
            >
              {{ date.date }}
            </span>
            <!-- 상태별 건수 표시 -->
            <div
              v-if="date.isCurrentMonth"
              class="flex flex-col gap-0.5 mt-1 justify-center items-center w-full"
            >
              <!-- 예정 건수 -->
              <span
                v-if="date.scheduledCount > 0"
                class="text-[10px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-primary dark:text-blue-300 font-medium whitespace-nowrap"
              >
                예정 {{ date.scheduledCount }} 건
              </span>
              <!-- 진행중 건수 (사용중 칩 색상) -->
              <span
                v-if="date.inProgressCount > 0"
                class="text-[10px] px-1 py-0.5 rounded bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-accent-400 font-medium whitespace-nowrap"
              >
                진행 {{ date.inProgressCount }} 건
              </span>
              <!-- 취소 건수 -->
              <span
                v-if="date.cancelledCount > 0"
                class="text-[10px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium whitespace-nowrap"
              >
                취소 {{ date.cancelledCount }} 건
              </span>
              <!-- 종료 건수 -->
              <span
                v-if="date.completedCount > 0"
                class="text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 font-medium whitespace-nowrap"
              >
                종료 {{ date.completedCount }} 건
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  selectedDate: {
    type: Date,
    default: null,
  },
  events: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:currentDate', 'update:selectedDate', 'date-select'])

// 년도 옵션 (현재 년도 기준 ±5년)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i)
  }
  return years
})

// 선택된 년도
const selectedYear = computed(() => {
  return props.currentDate ? props.currentDate.getFullYear() : new Date().getFullYear()
})

// 선택된 월 (1-12)
const selectedMonth = computed(() => {
  return props.currentDate ? props.currentDate.getMonth() + 1 : new Date().getMonth() + 1
})

// 년도 변경 핸들러
const handleYearChange = (event) => {
  const newYear = parseInt(event.target.value)
  const newDate = new Date(props.currentDate)
  newDate.setFullYear(newYear)
  emit('update:currentDate', newDate)
}

// 월 변경 핸들러
const handleMonthChange = (event) => {
  const newMonth = parseInt(event.target.value) - 1
  const newDate = new Date(props.currentDate)
  newDate.setMonth(newMonth)
  emit('update:currentDate', newDate)
}

// 현재 월 표시
const currentMonth = computed(() => {
  if (!props.currentDate) return '로딩 중...'
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth() + 1
  return `${year}년 ${month}월`
})

// 상태 정규화 함수
const normalizeStatus = (startDate, endDate) => {
  const today = new Date().setHours(0, 0, 0, 0)
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(0, 0, 0, 0)

  if (today < start) return '예정'
  if (today > end) return '종료'
  return '진행 중'
}

// 달력 날짜 생성
const calendarDates = computed(() => {
  if (!props.currentDate) return []
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()

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
    dates.push({
      date: lastDateOfPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    })
  }

  // 현재 달의 날짜들
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const isToday =
      i === today.getDate() && month === today.getMonth() && year === today.getFullYear()

    // 날짜 형식: YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

    // 해당 날짜의 행사들 필터링
    const dateEvents = props.events.filter((event) => {
      const eventDateStr = event.startDate
      const currentDateStr = dateStr
      return eventDateStr === currentDateStr
    })

    // 상태별 행사 개수 계산
    const completedCount = dateEvents.filter((e) => e.status === '종료').length
    const scheduledCount = dateEvents.filter((e) => e.status === '예정').length
    const inProgressCount = dateEvents.filter((e) => e.status === '진행 중').length
    const cancelledCount = dateEvents.filter((e) => e.status === '취소').length
    const eventCount = dateEvents.length

    dates.push({
      date: i,
      dateStr,
      isCurrentMonth: true,
      isToday,
      hasEvent: eventCount > 0,
      eventCount,
      completedCount,
      scheduledCount,
      inProgressCount,
      cancelledCount,
    })
  }

  // 다음 달의 날짜들
  const weeksNeeded = Math.ceil((firstDayOfWeek + lastDateOfMonth) / 7)
  const totalDaysNeeded = weeksNeeded * 7
  const remainingDays = totalDaysNeeded - dates.length

  for (let i = 1; i <= remainingDays; i++) {
    dates.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    })
  }

  return dates
})

// 현재 월의 행사 개수
const currentMonthEventCount = computed(() => {
  if (!props.currentDate) return 0
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  return props.events.filter((event) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    return eventStart <= monthEnd && eventEnd >= monthStart
  }).length
})

// 날짜 선택 여부 확인
const isDateSelected = (date) => {
  if (!props.selectedDate || !date.dateStr) return false
  return new Date(date.dateStr).toDateString() === props.selectedDate.toDateString()
}

// 날짜 클릭 핸들러
const handleDateClick = (date) => {
  if (date.dateStr) {
    const newDate = new Date(date.dateStr)
    emit('update:selectedDate', newDate)
    emit('date-select', newDate)
  }
}

// 이전 달로 이동
const handlePrevMonth = () => {
  const newDate = new Date(props.currentDate)
  newDate.setMonth(newDate.getMonth() - 1)
  emit('update:currentDate', newDate)
}

// 다음 달로 이동
const handleNextMonth = () => {
  const newDate = new Date(props.currentDate)
  newDate.setMonth(newDate.getMonth() + 1)
  emit('update:currentDate', newDate)
}

// 오늘로 이동
const handleGoToToday = () => {
  emit('update:currentDate', new Date())
}
</script>

<style scoped>
/* 일요일 (Sunday) - Red */
.day-sunday-text {
  color: #ef4444;
  font-weight: 600;
}

.dark .day-sunday-text {
  color: #fca5a5;
}

/* 토요일 (Saturday) - #3482ff */
.day-saturday-text {
  color: #3482ff;
  font-weight: 600;
}

.dark .day-saturday-text {
  color: #60a5fa;
}
</style>
