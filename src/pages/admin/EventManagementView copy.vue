<template>
  <div class="bg-background dark:bg-dark-bg min-h-screen overflow-auto flex flex-col p-6">
    <!-- 달력과 테이블 병렬 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
      <!-- 달력 섹션 -->
      <div class="lg:col-span-1">
        <div class="mb-6 flex justify-between items-center">
          <div class="flex justify-between items-end gap-3 w-full">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-table-header-text">
              {{ currentMonth }}
            </h3>
            <div class="flex gap-2 items-center">
              <p class="text-sm text-gray-600 dark:text-dark-text-secondary ml-auto">
                총 {{ currentMonthFilteredCount }}건
              </p>
              <button
                @click.prevent="prevMonth"
                class="w-10 h-7 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-dark-border rounded-md transition-all flex-shrink-0 text-gray-600 dark:text-dark-text-secondary cursor-pointer"
                title="이전 달"
                type="button"
              >
                <i class="fi fi-br-chevron-left text-sm"></i>
              </button>
              <button
                @click.prevent="nextMonth"
                class="w-10 h-7 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-dark-border rounded-md transition-all flex-shrink-0 text-gray-600 dark:text-dark-text-secondary cursor-pointer"
                title="다음 달"
                type="button"
              >
                <i class="fi fi-br-chevron-right text-sm"></i>
              </button>
              <!-- <div class="h-6 w-px bg-gray-300 dark:bg-dark-border"></div> -->
              <button
                @click.prevent="goToToday"
                class="w-20 h-7 flex items-center justify-center bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-dark-border rounded-md transition-all flex-shrink-0 text-gray-600 dark:text-dark-text-secondary cursor-pointer"
                title="오늘로 이동"
                type="button"
              >
                오늘
              </button>
            </div>
          </div>
        </div>

        <!-- ==================================================================== -->
        <div class="px-6 bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm">
          <!-- 요일 헤더 -->
          <div
            class="grid grid-cols-7 gap-2 mb-2 flex-shrink-0 -mx-6 px-6 py-3 bg-table-header-bg dark:bg-table-header-bg-dark rounded-t-2xl"
          >
            <div
              v-for="(day, index) in ['일', '월', '화', '수', '목', '금', '토']"
              :key="day"
              :class="[
                'text-center font-semibold text-sm',
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
                @click="selectedDate = new Date(date.dateStr || currentDate)"
                :class="[
                  'p-3 text-sm rounded-lg transition-all text-center flex flex-col items-center justify-center min-h-20',
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
                  selectedDate &&
                  date.dateStr &&
                  new Date(date.dateStr).toDateString() === selectedDate.toDateString()
                    ? 'bg-blue-500 text-white'
                    : // 행사가 있는 날짜 - 상태에 따라 다르게 (선택된 날짜 제외)
                      date.eventCount > 0
                      ? date.completedCount > 0 &&
                        date.scheduledCount === 0 &&
                        date.inProgressCount === 0
                        ? 'bg-gray-100 dark:bg-gray-800' // 완료만
                        : date.inProgressCount > 0
                          ? 'bg-teal-100 dark:bg-teal-900/30' // 진행중 (사용중 칩 색상)
                          : date.scheduledCount > 0
                            ? 'bg-blue-100 dark:bg-blue-900/30' // 예정
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
                <div v-if="date.isCurrentMonth" class="flex flex-wrap gap-1 mt-1 justify-center">
                  <!-- 예정 건수 -->
                  <span
                    v-if="date.scheduledCount > 0"
                    class="text-[10px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-primary dark:text-blue-300 font-medium"
                  >
                    {{ date.scheduledCount }} 건
                  </span>
                  <!-- 진행중 건수 (사용중 칩 색상) -->
                  <span
                    v-if="date.inProgressCount > 0"
                    class="text-[10px] px-1 py-0.5 rounded bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-accent-400 font-medium"
                  >
                    {{ date.inProgressCount }} 건
                  </span>
                  <!-- 종료 건수 -->
                  <span
                    v-if="date.completedCount > 0"
                    class="text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 font-medium"
                  >
                    {{ date.completedCount }} 건
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 필터 및 테이블 섹션 -->
      <div class="lg:col-span-2 flex flex-col">
        <!-- 행사 목록 헤더 (제목 + 필터) -->
        <div class="flex justify-between gap-4 mb-4 items-center">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-table-header-text">행사 목록</h2>

          <!-- 필터 조건 -->
          <div class="flex items-center gap-3">
            <!-- 상태 -->
            <div class="flex items-center gap-2">
              <label
                class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
              >
                상태
              </label>
              <select
                v-model="statusFilter"
                placeholder="상태 선택"
                class="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              >
                <option value="전체">전체</option>
                <option value="예정">예정</option>
                <option value="진행 중">진행 중</option>
                <option value="종료">종료</option>
              </select>
            </div>

            <!-- 행사명 -->
            <label
              class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
            >
              행사명
            </label>
            <div
              class="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            >
              <input
                v-model="searchQuery"
                type="text"
                placeholder="검색"
                class="bg-transparent placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:outline-none focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              />
              <i class="fi fi-br-search text-gray-600 dark:text-gray-300"></i>
            </div>

            <!-- 월 선택 -->
            <div class="flex items-center gap-1.5">
              <label
                class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
              >
                월
              </label>
              <input
                v-model="monthFilter"
                type="month"
                class="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              />
            </div>

            <!-- 필터 초기화 버튼 -->
            <button
              @click="resetFilters"
              class="px-3 py-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all text-primary dark:text-primary font-medium text-xs flex-shrink-0 border border-primary border-opacity-30 dark:border-primary/50"
              title="필터 초기화"
            >
              <i class="fi fi-br-refresh mr-1"></i>초기화
            </button>
          </div>
        </div>

        <!-- 행사 list =============================================================-->
        <div class="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm overflow-hidden">
          <div class="overflow-y-auto max-h-[700px]">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
                <tr>
                  <th
                    class="px-4 py-3 text-left font-semibold text-table-header-text dark:text-table-header-text-dark"
                  >
                    행사명
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-table-header-text dark:text-table-header-text-dark"
                    @click="toggleSort('startDate')"
                  >
                    <div class="flex items-center justify-center gap-1">
                      행사 일자

                      <i
                        :class="[
                          sortConfig.field === 'startDate'
                            ? sortConfig.order === 'asc'
                              ? 'fi fi-br-arrow-up'
                              : 'fi fi-br-arrow-down'
                            : 'fi fi-br-sort',
                          'text-xs opacity-60',
                        ]"
                      ></i>
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark"
                  >
                    상태
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-table-header-text dark:text-table-header-text-dark"
                    @click="toggleSort('busCount')"
                  >
                    <div class="flex items-center justify-center gap-1">
                      배차 대수
                      <i
                        :class="[
                          sortConfig.field === 'busCount'
                            ? sortConfig.order === 'asc'
                              ? 'fi fi-br-arrow-up'
                              : 'fi fi-br-arrow-down'
                            : 'fi fi-br-sort',
                          'text-xs opacity-60',
                        ]"
                      ></i>
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-table-header-text dark:text-table-header-text-dark"
                    @click="toggleSort('reservations')"
                  >
                    <div class="flex items-center justify-center gap-1">
                      예약건수
                      <i
                        :class="[
                          sortConfig.field === 'reservations'
                            ? sortConfig.order === 'asc'
                              ? 'fi fi-br-arrow-up'
                              : 'fi fi-br-arrow-down'
                            : 'fi fi-br-sort',
                          'text-xs opacity-60',
                        ]"
                      ></i>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-if="filteredEvents.length === 0"
                  class="border-t border-gray-200 dark:border-dark-border"
                >
                  <td
                    colspan="5"
                    class="px-4 py-8 text-center text-gray-500 dark:text-dark-text-tertiary"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="event in filteredEvents"
                  :key="event.id"
                  class="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 cursor-pointer transition-colors group"
                  @dblclick="openEventModal(event)"
                >
                  <td
                    class="px-4 py-2 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900"
                  >
                    {{ event.name }}
                  </td>
                  <td
                    class="px-4 py-2 text-center text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900"
                  >
                    {{ event.startDate }} ~ {{ event.endDate }}
                  </td>
                  <td class="px-4 py-2 text-center">
                    <StatusChip :status="event.status" />
                  </td>
                  <td
                    class="px-4 py-2 text-center text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900"
                  >
                    {{ event.busCount }}대
                  </td>
                  <td
                    class="px-4 py-2 text-center text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900"
                  >
                    {{ event.reservations }}건
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 행사 상세 정보 모달 -->
    <EventDetailModal v-if="isModalOpen" :event="selectedEventDetail" @close="closeEventModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import eventsData from '@/data/events.json'
import EventDetailModal from '@/components/EventDetailModal.vue'
import StatusChip from '@/components/common/StatusChip.vue'

// 현재 월
const currentDate = ref(new Date())

// 현재 월 표시
const currentMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}년 ${month}월`
})

// 선택된 날짜
const selectedDate = ref(null)

// 검색 및 필터
const searchQuery = ref('')
const statusFilter = ref('전체')
const monthFilter = ref('')

// 테이블 데이터 (events.json에서 import하고 형식 변환)
const events = ref(
  eventsData.events.map((event) => ({
    id: event.id,
    name: event.eventName,
    startDate: event.eventDate,
    endDate: event.eventDate,
    status: event.status === '완료' ? '종료' : '예정',
    participants: 0,
    busCount: Math.floor(Math.random() * 10) + 1, // 배차 대수 (1-10)
    reservations: Math.floor(Math.random() * 100) + 1, // 예약건수 (1-100)
    venue: event.eventVenue,
    type: event.eventType,
  })),
)

// 정렬 상태 (초기값: 일자별 오름차순)
const sortConfig = ref({
  field: 'startDate', // 정렬 필드 (기본: 일자)
  order: 'asc', // 'asc' 또는 'desc'
})

// 모달 상태
const isModalOpen = ref(false)
const selectedEventDetail = ref(null)

// 모달 열기
const openEventModal = (event) => {
  selectedEventDetail.value = event
  isModalOpen.value = true
}

// 모달 닫기
const closeEventModal = () => {
  isModalOpen.value = false
  selectedEventDetail.value = null
}

// 달력 날짜 생성
const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

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
    const dateEvents = events.value.filter((event) => {
      // 날짜 문자열을 YYYY-MM-DD 형식으로 정규화
      const eventDateStr = event.startDate // "2025-11-01" 형식
      const currentDateStr = dateStr // "2025-11-01" 형식

      // 시작일과 종료일이 같은 경우 (단일 날짜 이벤트)
      return eventDateStr === currentDateStr
    })

    // 상태별 행사 개수 계산
    const completedCount = dateEvents.filter((e) => e.status === '종료').length
    const scheduledCount = dateEvents.filter((e) => e.status === '예정').length
    const inProgressCount = dateEvents.filter((e) => e.status === '진행 중').length
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
    })
  }

  // 다음 달의 날짜들 - 현재 달의 마지막 날짜까지만 필요한 주 수 계산
  // 예: 28일 = 4주 + 며칠 → 마지막 주까지 포함하면 5주
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

// 선택된 날짜의 행사 목록
const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return []

  return events.value.filter((event) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    const selected = new Date(selectedDate.value)
    return selected >= eventStart && selected <= eventEnd
  })
})

// 예정된 행사 목록 (향후 행사만)
const upcomingEvents = computed(() => {
  const today = new Date()
  return events.value
    .filter((event) => new Date(event.startDate) >= today)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3)
})

// 필터링된 행사 목록 (정렬 포함)
const filteredEvents = computed(() => {
  let result = events.value

  // 검색어 필터링
  if (searchQuery.value) {
    result = result.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  // 상태 필터링
  if (statusFilter.value && statusFilter.value !== '전체') {
    // '전체'가 아니면 선택된 상태만 표시
    result = result.filter((event) => event.status === statusFilter.value)
  }
  // '전체'이면 모든 상태 표시

  // 선택된 날짜 필터링 - 달력에서 특정 날짜를 선택했으면 그 날짜만 표시
  if (selectedDate.value) {
    result = result.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const selected = new Date(selectedDate.value)
      return selected >= eventStart && selected <= eventEnd
    })
  } else {
    // 날짜 선택이 없으면 월로 필터링
    // 월 필터링 - monthFilter 값이 있으면 해당 월로, 없으면 현재 달력 월로 필터링
    let filterYear, filterMonth

    if (monthFilter.value) {
      ;[filterYear, filterMonth] = monthFilter.value.split('-')
      filterYear = parseInt(filterYear)
      filterMonth = parseInt(filterMonth)
    } else {
      // monthFilter가 없으면 currentDate(달력)의 월로 필터링
      filterYear = currentDate.value.getFullYear()
      filterMonth = currentDate.value.getMonth() + 1
    }

    const monthStart = new Date(filterYear, filterMonth - 1, 1)
    const monthEnd = new Date(filterYear, filterMonth, 0)

    result = result.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      return eventStart <= monthEnd && eventEnd >= monthStart
    })
  }

  // 정렬 적용
  if (sortConfig.value.field) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.value.field]
      let bVal = b[sortConfig.value.field]

      // 날짜 필드는 Date 객체로 변환
      if (sortConfig.value.field === 'startDate') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }

      if (sortConfig.value.order === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
  }

  return result
})

// 정렬 토글 함수
const toggleSort = (field) => {
  if (sortConfig.value.field === field) {
    // 같은 필드면 순서 변경
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    // 다른 필드면 새로 정렬
    sortConfig.value.field = field
    sortConfig.value.order = 'asc'
  }
}

// 현재 월의 필터링된 행사 개수
const currentMonthFilteredCount = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  return filteredEvents.value.filter((event) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    return eventStart <= monthEnd && eventEnd >= monthStart
  }).length
})

// 필터 초기화
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = '전체'
  monthFilter.value = ''
  selectedDate.value = null
}

// 이전 달로 이동
const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

// 다음 달로 이동
const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// 오늘 날짜로 이동
const goToToday = () => {
  currentDate.value = new Date()
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
