<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 달력과 테이블 병렬 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <!-- 달력 섹션 -->
      <div class="lg:col-span-1">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-semibold mb-6" style="color: #1e293b">행사 일정</h2>
          <div class="flex gap-2">
            <button
              @click="prevMonth"
              class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-all flex-shrink-0 text-gray-600 dark:text-gray-400"
              title="이전 달"
            >
              <i class="fa fa-chevron-left text-lg"></i>
            </button>
            <button
              @click="nextMonth"
              class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-all flex-shrink-0 text-gray-600 dark:text-gray-400"
              title="다음 달"
            >
              <i class="fa fa-chevron-right text-lg"></i>
            </button>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <div class="mb-6">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ currentMonth }}
              </h3>
            </div>
          </div>

          <!-- 요일 헤더 -->
          <div class="grid grid-cols-7 gap-2 mb-2">
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
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="(date, index) in calendarDates"
              :key="index"
              @click="selectedDate = new Date(date.dateStr || currentDate)"
              :class="[
                'p-2 text-sm rounded-lg transition-all text-center min-h-16 flex flex-col items-center justify-center',
                date.isCurrentMonth
                  ? (index % 7 === 0
                      ? 'day-sunday-text'
                      : index % 7 === 6
                        ? 'day-saturday-text'
                        : 'text-gray-900 dark:text-white') +
                    ' hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer'
                  : 'text-gray-400 dark:text-gray-600',
                date.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400 font-semibold' : '',
                selectedDate &&
                date.dateStr &&
                new Date(date.dateStr).toDateString() === selectedDate.toDateString()
                  ? 'bg-blue-600 text-white'
                  : date.eventCount > 0
                    ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold'
                    : '',
              ]"
            >
              <span>{{ date.date }}</span>
              <!-- 행사별 색상 표시 -->
              <div
                v-if="date.eventCount > 0 && date.isCurrentMonth"
                class="flex gap-1 mt-1 flex-wrap justify-center"
              >
                <span v-if="date.completedCount > 0" class="text-xs">
                  <span class="inline-block w-2 h-2 rounded-full dot-completed"></span>
                  {{ date.completedCount }}
                </span>
                <span v-if="date.scheduledCount > 0" class="text-xs">
                  <span class="inline-block w-2 h-2 rounded-full dot-scheduled"></span>
                  {{ date.scheduledCount }}
                </span>
                <span v-if="date.inProgressCount > 0" class="text-xs">
                  <span class="inline-block w-2 h-2 rounded-full dot-in-progress"></span>
                  {{ date.inProgressCount }}
                </span>
              </div>
            </button>
          </div>

          <!-- 선택된 날짜 행사 -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h4 class="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
              {{
                selectedDate
                  ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 행사`
                  : '선택된 행사'
              }}
            </h4>
            <div
              v-if="selectedDateEvents.length === 0"
              class="text-xs text-gray-500 dark:text-gray-400 py-2"
            >
              행사가 없습니다.
            </div>
            <div class="space-y-2">
              <div
                v-for="event in selectedDateEvents"
                :key="event.id"
                class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm"
              >
                <div class="font-medium text-gray-900 dark:text-white">{{ event.name }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ event.startDate }} ~ {{ event.endDate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 필터 및 테이블 섹션 -->
      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold" style="color: #1e293b">행사 목록</h2>

          <button
            @click="resetFilters"
            class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all text-gray-600 dark:text-gray-400"
            title="필터 초기화"
          >
            필터 초기화
            <i class="fa fa-rotate-right text-lg"></i>
          </button>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            <!-- 상태 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                상태
              </label>
              <select
                v-model="statusFilter"
                placeholder="상태 선택"
                class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="전체">전체</option>
                <option value="예정">예정</option>
                <option value="진행 중">진행 중</option>
                <option value="종료">종료</option>
              </select>
            </div>

            <!-- 행사명 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                행사명
              </label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="행사명 조회"
                class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <!-- 시작일 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                시작일
              </label>
              <input
                v-model="startDateFilter"
                type="date"
                placeholder="YYYY-MM-DD"
                class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <!-- 종료일 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                종료일
              </label>
              <input
                v-model="endDateFilter"
                type="date"
                placeholder="YYYY-MM-DD"
                class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        <!-- 행사 목록 -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[800px]"
        >
          <div class="overflow-y-auto flex-1">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 dark:bg-slate-700 sticky top-0">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">행사명</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">시작일</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">종료일</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">상태</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">참여자</th>
                  <th class="px-4 py-3 text-left font-semibold" style="color: #1e293b">액션</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-if="filteredEvents.length === 0"
                  class="border-t border-slate-200 dark:border-slate-700"
                >
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="event in filteredEvents"
                  :key="event.id"
                  class="border-t border-slate-200 dark:border-slate-700"
                >
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ event.name }}</td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {{ event.startDate }}
                  </td>
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ event.endDate }}</td>
                  <td class="px-4 py-3">
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
                  <td class="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {{ event.participants }}명
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <button class="text-blue-600 dark:text-blue-400 hover:underline mr-4">
                      편집
                    </button>
                    <button class="text-red-600 dark:text-red-400 hover:underline">삭제</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-end mt-4 space-x-2">
          <button
            class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            ◀
          </button>
          <button class="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button
            class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            2
          </button>
          <button
            class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            3
          </button>
          <button
            class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import eventsData from '@/data/events.json'

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
const startDateFilter = ref('')
const endDateFilter = ref('')

// 테이블 데이터 (events.json에서 import하고 형식 변환)
const events = ref(
  eventsData.events.map((event) => ({
    id: event.id,
    name: event.eventName,
    startDate: event.eventDate,
    endDate: event.eventDate,
    status: event.status === '완료' ? '종료' : '예정',
    participants: 0,
  })),
)

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

  // 다음 달의 날짜들
  const remainingDays = 42 - dates.length
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

// 필터링된 행사 목록
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

  // 날짜 필터링 (시작일)
  if (startDateFilter.value) {
    const startDate = new Date(startDateFilter.value)
    result = result.filter((event) => new Date(event.startDate) >= startDate)
  }

  // 날짜 필터링 (종료일)
  if (endDateFilter.value) {
    const endDate = new Date(endDateFilter.value)
    result = result.filter((event) => new Date(event.endDate) <= endDate)
  }

  return result
})

// 필터 초기화
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = '전체'
  startDateFilter.value = ''
  endDateFilter.value = ''
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
  color: #ef4444;
}

.day-sunday-text {
  color: #ef4444;
  font-weight: 600;
}

.dark .day-sunday-text {
  color: #ef4444;
}

/* 토요일 (Saturday) - #3482ff */
.day-saturday {
  color: #3482ff;
  font-weight: 600;
}

.dark .day-saturday {
  color: #3482ff;
}

.day-saturday-text {
  color: #3482ff;
  font-weight: 600;
}

.dark .day-saturday-text {
  color: #3482ff;
}
</style>
