<template>
  <div class="bg-slate-50 dark:bg-slate-900 min-h-screen overflow-hidden flex flex-col p-6">
    <!-- 달력과 테이블 병렬 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
      <!-- 달력 섹션 -->
      <div class="lg:col-span-1 min-h-0 h-full">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 flex flex-col overflow-hidden h-full"
        >
          <div class="mb-4 flex-shrink-0">
            <div class="flex justify-between items-center">
              <div class="flex justify-between items-end gap-3 w-full">
                <h3 class="text-lg font-medium text-slate-900 dark:text-slate-200">
                  {{ currentMonth }}
                </h3>
                <div class="flex gap-2 items-center">
                  <button
                    @click="prevMonth"
                    class="w-10 h-7 flex items-center justify-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-sm transition-all flex-shrink-0 text-gray-600 dark:text-gray-400"
                    title="이전 달"
                  >
                    <i class="fa fa-chevron-left text-sm"></i>
                  </button>
                  <button
                    @click="nextMonth"
                    class="w-10 h-7 flex items-center justify-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-sm transition-all flex-shrink-0 text-gray-600 dark:text-gray-400"
                    title="다음 달"
                  >
                    <i class="fa fa-chevron-right text-sm"></i>
                  </button>
                  <!-- <div class="h-6 w-px bg-gray-300 dark:bg-slate-600"></div> -->
                  <button
                    @click="goToToday"
                    class="w-20 h-7 flex items-center justify-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-sm transition-all flex-shrink-0 text-gray-600 dark:text-gray-400"
                    title="오늘로 이동"
                  >
                    오늘
                  </button>
                  <p class="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                    총 {{ currentMonthFilteredCount }}건
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 요일 헤더 -->
          <div class="grid grid-cols-7 gap-2 mb-2 flex-shrink-0">
            <div
              v-for="(day, index) in ['일', '월', '화', '수', '목', '금', '토']"
              :key="day"
              :class="[
                'text-center font-semibold text-sm py-2',
                index === 0
                  ? 'day-sunday'
                  : index === 6
                    ? 'day-saturday'
                    : 'text-gray-600 dark:text-gray-400',
              ]"
            >
              {{ day }}
            </div>
          </div>

          <!-- 캘린더 날짜 그리드 -->
          <div class="grid grid-cols-7 gap-2 flex-1 overflow-y-auto min-h-0">
            <button
              v-for="(date, index) in calendarDates"
              :key="index"
              @click="selectedDate = new Date(date.dateStr || currentDate)"
              :class="[
                'p-2 text-sm rounded-lg transition-all text-center flex flex-col items-center justify-center border-2 py-2',
                date.isCurrentMonth
                  ? (index % 7 === 0
                      ? 'day-sunday-text'
                      : index % 7 === 6
                        ? 'day-saturday-text'
                        : 'text-gray-900 dark:text-white') +
                    (date.eventCount > 0
                      ? ' hover:shadow-md hover:scale-105'
                      : ' hover:bg-blue-50 dark:hover:bg-slate-700') +
                    ' cursor-pointer'
                  : 'text-gray-400 dark:text-gray-600',
                date.isToday
                  ? 'bg-blue-100/50 dark:bg-blue-900/20 text-gray-900 dark:text-white border-blue-300 dark:border-blue-700 font-semibold'
                  : '',
                // 선택된 날짜 (오늘 아닌 경우)
                !date.isToday &&
                selectedDate &&
                date.dateStr &&
                new Date(date.dateStr).toDateString() === selectedDate.toDateString()
                  ? 'bg-blue-600 text-white border-blue-600'
                  : // 행사가 있는 날짜 - 상태에 따라 다르게 (오늘과 선택된 날짜 제외)
                    !date.isToday && date.eventCount > 0
                    ? date.completedCount > 0 &&
                      date.scheduledCount === 0 &&
                      date.inProgressCount === 0
                      ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500' // 완료만
                      : date.inProgressCount > 0
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600' // 진행중 (초록색)
                        : date.scheduledCount > 0
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600' // 예정
                          : ''
                    : date.isToday
                      ? ''
                      : 'border-transparent',
              ]"
            >
              <span class="text-sm font-medium">{{ date.date }}</span>
              <!-- 총 건수 표시 -->
              <span
                v-if="date.eventCount > 0 && date.isCurrentMonth"
                class="text-[10px] px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mt-1"
              >
                {{ date.eventCount }}건
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 필터 및 테이블 섹션 -->
      <div class="lg:col-span-2 flex flex-col overflow-hidden min-h-0">
        <!-- 행사 목록 헤더 (제목 + 필터) -->
        <div class="flex items-end justify-between gap-4 mb-4 flex-shrink-0">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-200">행사 목록</h2>

          <!-- 필터 조건 -->
          <div class="flex items-end gap-3">
            <!-- 상태 -->
            <div class="flex items-end gap-1.5 flex-shrink-0">
              <label
                class="text-xs font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap"
              >
                상태
              </label>
              <select
                v-model="statusFilter"
                placeholder="상태 선택"
                class="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="전체">전체</option>
                <option value="예정">예정</option>
                <option value="진행 중">진행 중</option>
                <option value="종료">종료</option>
              </select>
            </div>

            <!-- 행사명 -->
            <div class="flex items-end gap-1.5 w-48">
              <label
                class="text-xs font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap"
              >
                행사명
              </label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="검색"
                class="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <!-- 월 선택 -->
            <div class="flex items-end gap-1.5 flex-shrink-0">
              <label
                class="text-xs font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap"
              >
                월
              </label>
              <input
                v-model="monthFilter"
                type="month"
                class="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <!-- 필터 초기화 버튼 -->
            <button
              @click="resetFilters"
              class="px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all text-blue-600 dark:text-blue-400 font-medium text-xs flex-shrink-0 border border-blue-200 dark:border-blue-800"
              title="필터 초기화"
            >
              <i class="fa fa-rotate-right mr-1"></i>초기화
            </button>
          </div>
        </div>

        <!-- 행사 목록 -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0"
        >
          <div class="overflow-y-auto flex-1 min-h-0">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-slate-800 dark:bg-[#334155]">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-white">
                    행사명
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-white"
                    @click="toggleSort('startDate')"
                  >
                    <div class="flex items-center justify-center gap-1">
                      행사 일자

                      <i
                        :class="[
                          sortConfig.field === 'startDate'
                            ? sortConfig.order === 'asc'
                              ? 'fa fa-arrow-up'
                              : 'fa fa-arrow-down'
                            : 'fa fa-sort',
                          'text-xs opacity-60',
                        ]"
                      ></i>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-white">
                    상태
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-white"
                    @click="toggleSort('busCount')"
                  >
                    <div class="flex items-center justify-center gap-1">
                      배차 대수
                      <i
                        :class="[
                          sortConfig.field === 'busCount'
                            ? sortConfig.order === 'asc'
                              ? 'fa fa-arrow-up'
                              : 'fa fa-arrow-down'
                            : 'fa fa-sort',
                          'text-xs opacity-60',
                        ]"
                      ></i>
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-white"
                    @click="toggleSort('reservations')"
                  >
                    <div class="flex items-center justify-center gap-1">
                      예약건수
                      <i
                        :class="[
                          sortConfig.field === 'reservations'
                            ? sortConfig.order === 'asc'
                              ? 'fa fa-arrow-up'
                              : 'fa fa-arrow-down'
                            : 'fa fa-sort',
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
                  class="border-t border-slate-200 dark:border-slate-700"
                >
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="event in filteredEvents"
                  :key="event.id"
                  class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                  @dblclick="openEventModal(event)"
                >
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-200">{{ event.name }}</td>
                  <td class="px-4 py-3 text-center text-slate-900 dark:text-slate-200">
                    {{ event.startDate }} ~ {{ event.endDate }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getStatusClass(event.status),
                      ]"
                    >
                      {{
                        event.status === '진행 중'
                          ? event.status
                          : event.status === '예정'
                            ? event.status
                            : '종료'
                      }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center text-slate-900 dark:text-slate-200">
                    {{ event.busCount }}대
                  </td>
                  <td class="px-4 py-3 text-center text-slate-900 dark:text-slate-200">
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
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const currentDateObj = new Date(year, month, i)
      return currentDateObj >= eventStart && currentDateObj <= eventEnd
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

// 상태에 따른 CSS 클래스 반환
const getStatusClass = (status) => {
  if (status === '예정') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  } else if (status === '진행 중') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  } else {
    // 종료
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}
</script>

<style scoped>
/* 달력 내부 스크롤 설정 */
.grid.grid-cols-7 {
  max-height: calc(100% - 60px);
  overflow-y: auto;
}

/* Event Status Indicator Dots */
/* 종료/완료된 행사 - 회색 60% 투명도 */
.dot-completed {
  background-color: rgba(100, 116, 139, 0.6);
}

.dark .dot-completed {
  background-color: rgba(148, 163, 184, 0.6);
}

/* 예정 행사 - 파란색 70% 투명도 */
.dot-scheduled {
  background-color: rgba(41, 106, 241, 0.7);
}

.dark .dot-scheduled {
  background-color: rgba(61, 217, 182, 0.7);
}

/* 진행중 행사 - 노란색 70% 투명도 */
.dot-in-progress {
  background-color: rgba(255, 200, 61, 0.7);
}

.dark .dot-in-progress {
  background-color: rgba(255, 200, 61, 0.7);
}

/* Day of Week Styling */
/* 일요일 (Sunday) - Red */
.day-sunday {
  color: #ef4444;
  font-weight: 600;
}

.dark .day-sunday {
  color: #fca5a5;
}

.day-sunday-text {
  color: #ef4444;
  font-weight: 600;
}

.dark .day-sunday-text {
  color: #fca5a5;
}

/* 토요일 (Saturday) - #3482ff */
.day-saturday {
  color: #3482ff;
  font-weight: 600;
}

.dark .day-saturday {
  color: #60a5fa;
}

.day-saturday-text {
  color: #3482ff;
  font-weight: 600;
}

.dark .day-saturday-text {
  color: #60a5fa;
}

/* 모달 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
