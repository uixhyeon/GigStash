<template>
  <div
    class="px-6 bg-slate-50 dark:bg-slate-900 lg:h-[calc(100vh-130px)] lg:flex lg:flex-col"
    @click="showCalendar = false"
  >
    <!-- 리포트 & 통계 헤더 -->
    <div class="flex-shrink-0">
      <!-- <h1 class="text-xl font-bold mb-3" style="color: #1e293b">리포트 & 통계</h1> -->

      <!-- 날짜 범위 선택기 -->
      <div class="flex justify-center mb-3">
        <div class="flex items-center gap-4">
          <button
            @click="prevDateRange"
            class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
            title="이전 달"
          >
            <i class="fi fi-rr-angle-left text-2xl text-slate-700 dark:text-slate-300"></i>
          </button>
          <div class="px-4 py-2 rounded-lg flex flex-col items-center text-center">
            <div class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {{ getMonthLabel(dateRange.start) }}
            </div>
          </div>
          <button
            @click="nextDateRange"
            class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
            title="다음 달"
          >
            <i class="fi fi-rr-angle-right text-2xl text-slate-700 dark:text-slate-300"></i>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="!isValidDateRange && filteredReservations.length === 0"
      class="mb-4 p-4 rounded-xl border dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 flex-shrink-0"
    >
      <div class="flex items-center gap-2">
        <i class="fi fi-rr-info text-gray-600 dark:text-gray-400"></i>
        <p class="text-sm text-gray-800 dark:text-gray-200">
          <span v-if="isBeforeNovember">아직 서비스가 오픈되지 않았습니다.</span>
          <span v-else-if="isAfterNovember">해당 기간의 운영 정보가 없습니다.</span>
        </p>
      </div>
    </div>

    <!-- 2x2 그리드 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 pb-6 lg:flex-1 lg:grid-rows-2">
      <!-- 1. 이번 달 주요 지표 -->
      <section class="flex flex-col lg:h-full">
        <h2
          class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text flex-shrink-0"
        >
          이번 달 주요 지표
        </h2>
        <div class="flex-1 flex flex-col">
          <div class="flex flex-wrap gap-3 mb-4">
            <!-- 이용률 카드 -->
            <div
              class="flex-1 min-w-0 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-[#C4CFE1] border border-blue-100 dark:border-blue-900/30"
            >
              <div>
                <div
                  class="text-[11px] sm:text-xs font-medium"
                  style="font-size: 16px; font-weight: bold; color: #1e293b"
                >
                  이용률
                </div>
                <div
                  class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5 text-right"
                >
                  전월 대비
                  <span
                    class="font-medium"
                    :style="{ color: getChangeColor(keyMetrics.utilizationChange) }"
                  >
                    <i :class="getChangeIcon(keyMetrics.utilizationChange)" class="mr-1"></i
                    >{{ Math.abs(keyMetrics.utilizationChange) }}%
                  </span>
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-gray-900 text-right"
                  style="font-size: 30px"
                >
                  {{ keyMetrics.utilizationRate }}%
                </div>
              </div>
            </div>

            <!-- 재방문율 카드 -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-[#C4CFE1] border border-green-100 dark:border-green-900/30"
            >
              <div>
                <div
                  class="text-[11px] sm:text-xs font-medium"
                  style="font-size: 16px; font-weight: bold; color: #1e293b"
                >
                  재방문율
                </div>

                <div
                  class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5 text-right"
                >
                  전월 대비
                  <span
                    class="font-medium"
                    :style="{ color: getChangeColor(additionalMetrics.revisitChange) }"
                  >
                    <i :class="getChangeIcon(additionalMetrics.revisitChange)" class="mr-1"></i
                    >{{ Math.abs(additionalMetrics.revisitChange) }}%
                  </span>
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-gray-900 text-right"
                  style="font-size: 30px"
                >
                  {{ additionalMetrics.revisitRate }}%
                </div>
              </div>
            </div>

            <!-- 배송선택률 카드 -->
            <!-- class="flex-1 p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-yellow-300/90 to-amber-400/95 text-gray-800" -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-[#C4CFE1] border border-yellow-100 dark:border-yellow-900/30"
            >
              <div>
                <div
                  class="text-[11px] sm:text-xs font-medium"
                  style="font-size: 16px; font-weight: bold; color: #1e293b"
                >
                  배송선택률
                </div>

                <div
                  class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5 text-right"
                >
                  전월 대비
                  <span
                    class="font-medium"
                    :style="{ color: getChangeColor(additionalMetrics.deliveryChange) }"
                  >
                    <i :class="getChangeIcon(additionalMetrics.deliveryChange)" class="mr-1"></i
                    >{{ Math.abs(additionalMetrics.deliveryChange) }}%
                  </span>
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-gray-900 text-right"
                  style="font-size: 30px"
                >
                  {{ additionalMetrics.deliveryRate }}%
                </div>
              </div>
            </div>
          </div>

          <!-- 매출 & 이용객 카드 ===================================================-->
          <div class="flex flex-wrap gap-3">
            <!-- 이용객 카드 -->
            <!-- class="flex-1 p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-gray-400/90 to-gray-600/95" -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-yellow-100/90 to-yellow-300/95"
            >
              <div class="font-bold opacity-90 text-gray-900" style="font-size: 16px">이용객</div>
              <div class="text-right">
                <div
                  class="mt-1 sm:mt-2 font-bold"
                  style="font-size: 16px"
                  :style="{ color: getChangeColor(keyMetrics.usersChange) }"
                >
                  <i :class="getChangeIcon(keyMetrics.usersChange)" class="mr-1"></i
                  >{{ Math.abs(keyMetrics.usersChange) }}%
                </div>
                <div class="font-bold mt-1 sm:mt-2 text-gray-900" style="font-size: 30px">
                  {{ formatNumber(keyMetrics.users) }}명
                </div>
              </div>
            </div>

            <!-- 매출 카드 -->
            <!-- class="flex-1 p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-blue-400/90 to-blue-600/95 text-white" -->

            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-blue-100/90 to-blue-300/95"
            >
              <div
                class="font-bold opacity-90 text-gray-900 dark:text-gray-900"
                style="font-size: 16px"
              >
                매출
              </div>
              <div class="text-right">
                <div
                  class="mt-1 sm:mt-2 font-bold"
                  style="font-size: 16px"
                  :style="{ color: getChangeColor(keyMetrics.revenueChange) }"
                >
                  <i :class="getChangeIcon(keyMetrics.revenueChange)" class="mr-1"></i
                  >{{ Math.abs(keyMetrics.revenueChange) }}%
                </div>
                <div
                  class="font-bold mt-1 sm:mt-2 text-gray-900 dark:text-gray-900"
                  style="font-size: 30px"
                >
                  {{ formatCurrency(keyMetrics.revenue) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 피크타임 분석 -->
      <section class="flex flex-col lg:h-full">
        <h2
          class="text-lg items-center font-semibold mb-4 text-gray-900 dark:text-table-header-text flex-shrink-0"
        >
          피크타임 분석
        </h2>
        <div
          class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col min-h-0"
        >
          <!-- 범례와 셀렉트 (가로 배치) -->
          <div class="flex items-baseline justify-between gap-4 mb-3 flex-shrink-0">
            <!-- 커스텀 범례 -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full" style="background-color: #f59e0b"></div>
                <span class="text-sm text-slate-700 dark:text-slate-300 font-medium">맡기기</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full" style="background-color: #3b82f6"></div>
                <span class="text-sm text-slate-700 dark:text-slate-300 font-medium">찾기</span>
              </div>
            </div>
            <!-- 셀렉트 박스 -->
            <select
              v-model="selectedEventTypeForPeakTime"
              class="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none"
            >
              <option value="">전체</option>
              <option v-for="eventType in availableEventTypes" :key="eventType" :value="eventType">
                {{ eventType }}
              </option>
            </select>
          </div>
          <div class="flex-1 min-h-0" style="position: relative; width: 100%; height: 100%">
            <canvas ref="peakTimeChartRef"></canvas>
          </div>
        </div>
      </section>

      <!-- 3. 행사 유형별 매출 & 사이즈별 비율 (하나의 그리드 셀 안에 두 개의 섹션) -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:h-full">
        <!-- 행사 유형별 매출 -->
        <section class="flex flex-col lg:h-full">
          <h2
            class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text flex-shrink-0"
          >
            행사 유형별 매출
          </h2>
          <div
            class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 md:p-4 lg:p-6 flex flex-col min-h-0"
          >
            <!-- 막대 그래프 -->
            <div class="flex-1 min-h-0" style="position: relative; width: 100%; height: 100%">
              <canvas ref="eventTypeChartRef"></canvas>
            </div>
          </div>
        </section>

        <!-- 사이즈별 비율 -->
        <section class="flex flex-col lg:h-full">
          <h2
            class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text flex-shrink-0"
          >
            사이즈별 비율
          </h2>
          <div
            class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 md:p-4 lg:p-6 flex flex-col min-h-0"
          >
            <!-- 도넛 차트 -->
            <div class="flex-1 min-h-0" style="position: relative; width: 100%; height: 100%">
              <canvas ref="sizeRatioChartRef"></canvas>
              <!-- 중앙 범례 -->
              <div
                class="absolute inset-0 flex items-center justify-center pointer-events-none"
                style="z-index: 10"
              >
                <div class="flex flex-col items-end gap-1.5 text-right">
                  <div
                    v-for="(segment, index) in sizeRatio"
                    :key="segment.size"
                    class="flex items-center gap-1.5"
                  >
                    <span
                      class="w-3 h-3 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: segment.color }"
                    ></span>
                    <span
                      class="text-[11px] text-slate-600 dark:text-slate-200 font-medium whitespace-nowrap"
                    >
                      {{ segment.size }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 4. 지역별 배송 -->
      <section class="mb-4 flex flex-col lg:h-full">
        <h2
          class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text flex-shrink-0"
        >
          지역별 배송
        </h2>
        <div
          class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sm:p-3 md:p-4 lg:p-6 overflow-x-auto"
        >
          <!-- 히트맵과 Top 5를 가로 배치 -->
          <div class="flex flex-col lg:flex-row gap-3 lg:items-start">
            <!-- 히트맵 스타일 지도 -->
            <div class="flex flex-col items-center gap-2 flex-1 w-full">
              <!-- 3x3 그리드: 서울, 인천, 경기, 강원, 충청, 전라, 경북, 경남, 제주 -->
              <div class="grid grid-cols-3 gap-2 w-full">
                <div
                  v-for="(region, index) in deliveryHeatmap"
                  :key="region.name"
                  :class="[
                    getHeatmapColor(region.count || 0),
                    getHeatmapTextColor(region.count || 0),
                  ]"
                  class="h-20 w-full rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                  @click="selectRegion(region)"
                  @mouseenter="
                    (e) => {
                      hoveredRegion = region
                      const rect = e.currentTarget.getBoundingClientRect()
                      regionTooltipPosition.x = rect.left + rect.width / 2
                      regionTooltipPosition.y = rect.top - 10
                    }
                  "
                  @mouseleave="hoveredRegion = null"
                >
                  <div class="font-bold text-xs sm:text-sm">
                    {{ region.name }}
                  </div>
                  <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                    {{ getRegionDescription(region.name) }}
                  </div>
                </div>
              </div>

              <!-- 지역별 배송 툴팁 -->
              <div
                v-if="hoveredRegion"
                class="fixed bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-xl p-3 shadow-lg z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                :style="{
                  left: `${regionTooltipPosition.x}px`,
                  top: `${regionTooltipPosition.y}px`,
                }"
              >
                <div class="font-semibold mb-2">{{ hoveredRegion.name }}</div>
                <div class="mb-1">건수: {{ hoveredRegion.count || 0 }}건</div>
                <div class="mb-1">비율: {{ hoveredRegion.percentage }}%</div>
                <!-- 말풍선 화살표 -->
                <div
                  class="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-700"
                ></div>
              </div>
            </div>

            <!-- Top 5 리스트 (세로 배치) -->
            <div
              class="w-full lg:w-auto lg:min-w-[120px] flex-shrink-0"
              v-if="deliveryRegions.length > 0"
            >
              <div
                class="text-xs font-semibold mb-1.5 text-center lg:text-left text-gray-900 dark:text-table-header-text"
              >
                Top 5
              </div>
              <div class="flex flex-col gap-1">
                <div
                  v-for="(region, index) in deliveryRegions"
                  :key="index"
                  class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-0 overflow-hidden"
                >
                  <div class="flex items-center gap-2 mb-0.5">
                    <div
                      class="text-[9px] font-bold text-gray-700 dark:text-slate-300 flex-shrink-0"
                    >
                      {{ index + 1 }}위
                    </div>
                    <div
                      class="text-[10px] font-bold truncate text-gray-900 dark:text-slate-100 flex-1"
                    >
                      {{ region.name }}
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-1">
                    <div class="text-[8px] text-gray-500 dark:text-slate-500">
                      {{ region.count || 0 }}건
                    </div>
                    <div class="text-[9px] font-semibold text-gray-600 dark:text-slate-400">
                      {{ region.percentage }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import reservationsMonthly from '@/data/reservations_monthly.json'

Chart.register(...registerables)

// 전체 예약 데이터 (월간 예약 원본 연결)
const allReservations = ref([])

// 날짜 범위 관리 (월간 설정)
const dateRange = ref({
  start: new Date(2025, 10, 1), // 2025-11-01
  end: new Date(2025, 10, 30), // 2025-11-30
})

// 달력 표시 여부
const showCalendar = ref(false)

// 달력 호버 상태
const hoveredCalendarDate = ref(null)

// 달력 월 관리
const calendarViewDate = ref(new Date(2025, 10, 1)) // 2025년 11월

const calendarYear = computed(() => calendarViewDate.value.getFullYear())
const calendarMonth = computed(() => calendarViewDate.value.getMonth())

const formatDateRange = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 월 레이블 생성 (예: "2025년 11월")
const getMonthLabel = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}년 ${month}월`
}

// 이전/다음 월로 이동
const prevDateRange = () => {
  const currentStart = dateRange.value.start
  const year = currentStart.getFullYear()
  const month = currentStart.getMonth()

  const prevMonthYear = month === 0 ? year - 1 : year
  const prevMonth = month === 0 ? 11 : month - 1

  const newStart = new Date(prevMonthYear, prevMonth, 1)
  const newEnd = new Date(prevMonthYear, prevMonth + 1, 0)

  dateRange.value = {
    start: newStart,
    end: newEnd,
  }
}

const nextDateRange = () => {
  const currentStart = dateRange.value.start
  const year = currentStart.getFullYear()
  const month = currentStart.getMonth()

  const nextMonthYear = month === 11 ? year + 1 : year
  const nextMonth = month === 11 ? 0 : month + 1

  const newStart = new Date(nextMonthYear, nextMonth, 1)
  const newEnd = new Date(nextMonthYear, nextMonth + 1, 0)

  dateRange.value = {
    start: newStart,
    end: newEnd,
  }
}

// 달력 날짜 포맷 함수
const fmtKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 달력 날짜 생성
const calendarDays = computed(() => {
  const start = new Date(calendarYear.value, calendarMonth.value, 1)
  const end = new Date(calendarYear.value, calendarMonth.value + 1, 0)
  const startWeekday = start.getDay()

  const days = []
  // 이전 달 채우기
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() - (startWeekday - i))
    days.push({ date: d, key: fmtKey(d), outside: true })
  }
  // 이번 달
  for (let d = 1; d <= end.getDate(); d++) {
    const cur = new Date(calendarYear.value, calendarMonth.value, d)
    days.push({ date: cur, key: fmtKey(cur), outside: false })
  }
  // 다음 달 채우기 (42칸)
  while (days.length < 42) {
    const last = days[days.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    days.push({ date: next, key: fmtKey(next), outside: true })
  }
  return days
})

// 달력 월 이동
const prevCalendarMonth = () => {
  calendarViewDate.value = new Date(calendarYear.value, calendarMonth.value - 1, 1)
}

const nextCalendarMonth = () => {
  calendarViewDate.value = new Date(calendarYear.value, calendarMonth.value + 1, 1)
}

// 날짜가 현재 선택된 월간 범위에 있는지 확인
const isDateInRange = (date) => {
  const dateStr = fmtKey(date)
  const startStr = formatDateRange(dateRange.value.start)
  const endStr = formatDateRange(dateRange.value.end)
  return dateStr >= startStr && dateStr <= endStr
}

// 오늘 날짜인지 확인
const isToday = (date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// 날짜 클릭 시 해당 월 선택
const selectMonthFromDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()

  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  dateRange.value = {
    start: monthStart,
    end: monthEnd,
  }

  // 달력도 선택한 월로 이동
  calendarViewDate.value = new Date(year, month, 1)

  showCalendar.value = false
}

// 날짜 범위에 맞는 예약 필터링
const filteredReservations = computed(() => {
  if (!allReservations.value.length) return []

  // dateRange.value를 명시적으로 참조하여 반응성 보장
  const range = dateRange.value
  const startDate = formatDateRange(range.start)
  const endDate = formatDateRange(range.end)

  const filtered = allReservations.value.filter((reservation) => {
    const eventDate = reservation.eventDate
    return eventDate >= startDate && eventDate <= endDate
  })

  return filtered
})

// 이전 기간 예약 필터링 (변화율 계산용)
const previousPeriodReservations = computed(() => {
  if (!allReservations.value.length) return []

  // 현재 선택된 월의 이전 달 범위 계산
  const currentStart = dateRange.value.start
  const year = currentStart.getFullYear()
  const month = currentStart.getMonth()

  const prevMonthYear = month === 0 ? year - 1 : year
  const prevMonth = month === 0 ? 11 : month - 1

  const prevStart = new Date(prevMonthYear, prevMonth, 1)
  const prevEnd = new Date(prevMonthYear, prevMonth + 1, 0)

  const startDate = formatDateRange(prevStart)
  const endDate = formatDateRange(prevEnd)

  return allReservations.value.filter((reservation) => {
    const eventDate = reservation.eventDate
    return eventDate >= startDate && eventDate <= endDate
  })
})

// 주요 지표 계산
const keyMetrics = computed(() => {
  const current = filteredReservations.value
  const previous = previousPeriodReservations.value

  // 현재 기간 매출
  const currentRevenue = current.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
  // 이전 기간 매출
  const previousRevenue = previous.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
  // 매출 변화율
  const revenueChange =
    previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0

  // 현재 기간 이용객 수 (고유 고객)
  const currentUsers = new Set(current.map((r) => r.customerPhone)).size
  // 이전 기간 이용객 수
  const previousUsers = new Set(previous.map((r) => r.customerPhone)).size
  // 이용객 변화율
  const usersChange =
    previousUsers > 0 ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) : 0

  // 이용률 계산 (예약 건수 / 전체 가능한 예약 수) - 간단히 예약 건수로 대체
  const currentUtilization = current.length
  const previousUtilization = previous.length
  const utilizationRate =
    currentUtilization > 0 ? ((currentUtilization / 1000) * 100).toFixed(1) : 0
  const utilizationChange =
    previousUtilization > 0
      ? (((currentUtilization - previousUtilization) / previousUtilization) * 100).toFixed(1)
      : 0

  return {
    revenue: currentRevenue,
    revenueChange,
    users: currentUsers,
    usersChange,
    utilizationRate: parseFloat(utilizationRate),
    utilizationChange: parseFloat(utilizationChange),
  }
})

// 추가 지표 계산 (재방문율, 배송선택률)
const additionalMetrics = computed(() => {
  const current = filteredReservations.value
  const previous = previousPeriodReservations.value

  // 재방문율
  const currentReturning = current.filter((r) => r.isReturningCustomer).length
  const currentRevisitRate =
    current.length > 0 ? ((currentReturning / current.length) * 100).toFixed(1) : 0
  const previousReturning = previous.filter((r) => r.isReturningCustomer).length
  const previousRevisitRate =
    previous.length > 0 ? ((previousReturning / previous.length) * 100).toFixed(1) : 0
  const revisitChange =
    parseFloat(previousRevisitRate) > 0
      ? (parseFloat(currentRevisitRate) - parseFloat(previousRevisitRate)).toFixed(1)
      : 0

  // 배송선택률
  const currentDelivery = current.filter((r) => r.deliveryType === '배송').length
  const currentDeliveryRate =
    current.length > 0 ? ((currentDelivery / current.length) * 100).toFixed(1) : 0
  const previousDelivery = previous.filter((r) => r.deliveryType === '배송').length
  const previousDeliveryRate =
    previous.length > 0 ? ((previousDelivery / previous.length) * 100).toFixed(1) : 0
  const deliveryChange =
    parseFloat(previousDeliveryRate) > 0
      ? (parseFloat(currentDeliveryRate) - parseFloat(previousDeliveryRate)).toFixed(1)
      : 0

  return {
    revisitRate: parseFloat(currentRevisitRate),
    revisitChange: parseFloat(revisitChange),
    deliveryRate: parseFloat(currentDeliveryRate),
    deliveryChange: parseFloat(deliveryChange),
  }
})

const formatCurrency = (value) => {
  return `${formatNumber(value)}원`
}

const formatNumber = (value) => {
  return value.toLocaleString('ko-KR')
}

// 변화율 텍스트 색상 반환 (상승: 빨간색, 하강: 파란색)
const getChangeColor = (changeValue) => {
  if (changeValue > 0) {
    return '#ef4444' // 빨간색 (상승)
  } else if (changeValue < 0) {
    return '#3b82f6' // 파란색 (하락)
  }
  return '#6b7280' // 회색 (변화 없음)
}

// 변화율 아이콘 반환 (상승: 위화살표, 하강: 아래화살표)
const getChangeIcon = (changeValue) => {
  if (changeValue > 0) {
    return 'fi fi-rr-arrow-up'
  } else if (changeValue < 0) {
    return 'fi fi-rr-arrow-down'
  }
  return 'fi fi-rr-minus'
}

// 호버된 시간대
const hoveredHour = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const hoveredRegion = ref(null)
const hoveredPaymentMethod = ref(null)
const paymentTooltipPosition = ref({ x: 0, y: 0 })
const regionTooltipPosition = ref({ x: 0, y: 0 })

// 호버된 행사 유형
const hoveredEventType = ref(null)

// 피크타임 분석용 선택된 행사 유형
const selectedEventTypeForPeakTime = ref('')

// Chart.js refs
const eventTypeChartRef = ref(null)
const peakTimeChartRef = ref(null)
const paymentMethodChartRef = ref(null)
const sizeRatioChartRef = ref(null)
let eventTypeChart = null
let peakTimeChart = null
let paymentMethodChart = null
let sizeRatioChart = null

// 사용 가능한 행사 유형 목록
const availableEventTypes = computed(() => {
  const reservations = filteredReservations.value
  const types = new Set()
  reservations.forEach((r) => {
    const type = r.eventType || '기타'
    types.add(type)
  })
  return Array.from(types).sort()
})

// 운영 기간 확인 (2025년 11월)
const isValidDateRange = computed(() => {
  const start = dateRange.value.start
  const end = dateRange.value.end

  // 2025년 11월 1일 ~ 11월 30일
  const serviceStartDate = new Date(2025, 10, 1) // 2025-11-01
  const serviceEndDate = new Date(2025, 10, 30) // 2025-11-30

  // 선택된 기간이 운영 기간 내에 있는지 확인
  return start >= serviceStartDate && end <= serviceEndDate
})

// 11월 이전인지 확인
const isBeforeNovember = computed(() => {
  const end = dateRange.value.end
  const serviceStartDate = new Date(2025, 10, 1) // 2025-11-01
  return end < serviceStartDate
})

// 11월 이후인지 확인
const isAfterNovember = computed(() => {
  const start = dateRange.value.start
  const serviceEndDate = new Date(2025, 10, 30) // 2025-11-30
  return start > serviceEndDate
})

// 피크타임 분석 데이터
const peakTimeData = computed(() => {
  let reservations = filteredReservations.value

  // 선택된 행사 유형으로 필터링
  if (selectedEventTypeForPeakTime.value) {
    reservations = reservations.filter(
      (r) => (r.eventType || '기타') === selectedEventTypeForPeakTime.value,
    )
  }

  // 전체 시간대 (0-23시) 또는 데이터가 있는 시간대만
  const allHours = Array.from({ length: 24 }, (_, i) => i)

  // 시간대별 dropoffTime 기반 카운트 (기기)
  const storeValues = allHours.map((hour) => {
    return reservations.filter((r) => {
      if (!r.dropoffTime) return false
      const dropoffDate = new Date(r.dropoffTime)
      return dropoffDate.getHours() === hour
    }).length
  })

  // 시간대별 reservedAt 기반 카운트 (찾기)
  const findValues = allHours.map((hour) => {
    return reservations.filter((r) => {
      if (!r.reservedAt) return false
      const reservedDate = new Date(r.reservedAt)
      return reservedDate.getHours() === hour
    }).length
  })

  // 규칙적인 시간 간격 사용 (2시간 간격: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
  const sortedHours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]

  // 선택된 시간대의 값만 추출
  const filteredStoreValues = sortedHours.map((hour) => storeValues[hour])
  const filteredFindValues = sortedHours.map((hour) => findValues[hour])

  const maxValue = Math.max(...filteredStoreValues, ...filteredFindValues, 1)
  const width = 400
  const height = 200

  // 기기 최대/최소값
  const storeMax = Math.max(...filteredStoreValues, 0)
  const storeMin = Math.min(...filteredStoreValues.filter((v) => v > 0), storeMax)

  // 찾기 최대/최소값
  const findMax = Math.max(...filteredFindValues, 0)
  const findMin = Math.min(...filteredFindValues.filter((v) => v > 0), findMax)

  // Y 좌표 계산 (규칙적 간격: 0~190px, 5단계)
  const storeYValues = filteredStoreValues.map((value) => {
    return height - 10 - (value / maxValue) * (height - 20)
  })

  const findYValues = filteredFindValues.map((value) => {
    return height - 10 - (value / maxValue) * (height - 20)
  })

  // 라인 포인트 생성
  const storePoints = sortedHours
    .map((hour, index) => {
      const x = 50 + (index * (width - 100)) / (sortedHours.length - 1)
      return `${x},${storeYValues[index]}`
    })
    .join(' ')

  const findPoints = sortedHours
    .map((hour, index) => {
      const x = 50 + (index * (width - 100)) / (sortedHours.length - 1)
      return `${x},${findYValues[index]}`
    })
    .join(' ')

  return {
    hours: sortedHours,
    storeLine: storePoints,
    findLine: findPoints,
    storeValues: filteredStoreValues,
    findValues: filteredFindValues,
    storeYValues,
    findYValues,
    maxValue,
    storeMax,
    storeMin: storeMin === Infinity ? 0 : storeMin,
    findMax,
    findMin: findMin === Infinity ? 0 : findMin,
  }
})

// 행사 유형별 매출
const eventTypeSales = computed(() => {
  const reservations = filteredReservations.value
  const typeMap = {}

  reservations.forEach((r) => {
    const type = r.eventType || '기타'
    if (!typeMap[type]) {
      typeMap[type] = { type, value: 0, count: 0 }
    }
    typeMap[type].value += r.totalPrice || 0
    typeMap[type].count += 1
  })

  const totalRevenue = Object.values(typeMap).reduce((sum, item) => sum + item.value, 0)

  // 이미지 색상 팔레트 사용 (오렌지 계열 중심)
  const colors = {
    콘서트: '#3b82f6', // 파란색
    대학축제: '#22d3ee', // 청록색
    스포츠: '#f59e0b', // 오렌지색
    페스티벌: '#ef4444', // 빨간색
    기타: '#f97316', // 주황색
  }

  return Object.values(typeMap)
    .map((item) => ({
      type: item.type,
      value: item.value,
      count: item.count,
      percentage: totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0,
      color: colors[item.type] || colors['기타'],
    }))
    .sort((a, b) => b.value - a.value)
})

const maxEventValue = computed(() => {
  if (eventTypeSales.value.length === 0) return 1
  return Math.max(...eventTypeSales.value.map((item) => item.value))
})

// 이전 지역명을 새로운 지역명으로 매핑하는 함수
const mapRegionName = (oldRegion) => {
  const regionMapping = {
    // 이전 지역명 -> 새로운 지역명
    서북권: '수도',
    동북권: '수도',
    서남권: '수도',
    도심권: '수도',
    동남권: '수도',
    '인천&경기': '수도',
    지방: '부울경', // 임시로 부울경에 매핑, 실제 데이터에 따라 조정 필요
    // 새로운 지역명은 그대로 사용
    수도: '수도',
    강원: '강원',
    충청: '충청',
    호남: '호남',
    대구경북: '대구경북',
    부울경: '부울경',
    제주: '제주',
  }
  return regionMapping[oldRegion] || '기타'
}

// 지역별 배송 (Top 5) - 시/도 단위
const deliveryRegions = computed(() => {
  const reservations = filteredReservations.value.filter((r) => r.deliveryType === '배송')
  const regionMap = {}

  // 시/도 단위로 집계 (deliveryRegion 필드 사용)
  reservations.forEach((r) => {
    const region = r.deliveryRegion || '기타'

    if (!regionMap[region]) {
      regionMap[region] = { name: region, count: 0 }
    }
    regionMap[region].count += 1
  })

  const total = reservations.length
  const regions = Object.values(regionMap)
    .map((item) => ({
      name: item.name,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 항상 5개가 표시되도록 빈 데이터 추가
  while (regions.length < 5) {
    regions.push({
      name: '-',
      percentage: 0,
      count: 0,
    })
  }

  return regions
})

// 시/도를 권역으로 매핑하는 함수 (서울·인천·경기·강원·충청·전라·경북·경남·제주 9개 권역)
const mapRegionToArea = (region) => {
  const regionToAreaMap = {
    // 서울 / 인천 / 경기
    서울: '서울',
    인천: '인천',
    경기: '경기',
    // 강원
    강원: '강원',
    // 충청
    충남: '충청',
    충북: '충청',
    대전: '충청',
    세종: '충청',
    // 전라
    전남: '전라',
    전북: '전라',
    광주: '전라',
    // 경북
    대구: '경북',
    경북: '경북',
    // 경남
    부산: '경남',
    울산: '경남',
    경남: '경남',
    // 제주
    제주: '제주',
  }
  return regionToAreaMap[region] || '기타'
}

// 지역별 배송 히트맵 데이터
const deliveryHeatmap = computed(() => {
  const reservations = filteredReservations.value.filter((r) => r.deliveryType === '배송')
  const regionMap = {}

  // 시/도 데이터를 권역으로 매핑하여 집계
  reservations.forEach((r) => {
    const region = r.deliveryRegion || '기타'
    const area = mapRegionToArea(region)

    if (!regionMap[area]) {
      regionMap[area] = { name: area, count: 0 }
    }
    regionMap[area].count += 1
  })

  const total = reservations.length

  // 고정된 순서로 지역 그룹 정의 (서울·인천·경기·강원·충청·전라·경북·경남·제주)
  const regionOrder = ['서울', '인천', '경기', '강원', '충청', '전라', '경북', '경남', '제주']

  // 순서대로 지역 데이터 생성
  const mappedRegions = regionOrder.map((regionName) => {
    const regionData = regionMap[regionName]
    return {
      name: regionName,
      count: regionData ? regionData.count : 0,
      percentage: total > 0 ? Math.round(((regionData?.count || 0) / total) * 100) : 0,
    }
  })

  return mappedRegions
})

// 배송량에 따른 색상 클래스 반환 (동적 계산) - 푸른 계열
const getHeatmapColor = (count) => {
  if (!deliveryHeatmap.value || deliveryHeatmap.value.length === 0) {
    return 'bg-blue-100'
  }

  // 실제 데이터의 최대값과 최소값 계산 (0 포함)
  const counts = deliveryHeatmap.value.map((r) => r.count || 0)
  const maxCount = Math.max(...counts, 0)
  const minCount = Math.min(...counts)

  // 빈 데이터인 경우
  if (maxCount === 0) return 'bg-blue-100'

  // 최대값과 최소값이 같으면 모두 같은 색상
  if (maxCount === minCount) {
    return count > 0 ? 'bg-blue-500' : 'bg-blue-100'
  }

  // 최대값 기준으로 5단계로 나눔
  const range = maxCount - minCount
  const step = range / 5

  // 0인 경우 가장 밝은 색상
  if (count === 0) return 'bg-blue-100'

  // 단계별 색상 할당
  if (count >= maxCount - step) return 'bg-blue-900'
  if (count >= maxCount - step * 2) return 'bg-blue-700'
  if (count >= maxCount - step * 3) return 'bg-blue-500'
  if (count >= maxCount - step * 4) return 'bg-blue-300'
  return 'bg-blue-100'
}

// 배송량에 따른 텍스트 색상 반환 (어두운 배경일 때 흰색)
const getHeatmapTextColor = (count) => {
  if (!deliveryHeatmap.value || deliveryHeatmap.value.length === 0) {
    return 'text-slate-900'
  }

  const counts = deliveryHeatmap.value.map((r) => r.count || 0)
  const maxCount = Math.max(...counts, 0)
  const minCount = Math.min(...counts)

  if (maxCount === 0) return 'text-slate-900'

  // 최대값과 최소값이 같으면
  if (maxCount === minCount) {
    return count > 0 ? 'text-white' : 'text-slate-900'
  }

  const range = maxCount - minCount
  const step = range / 5

  // 가장 어두운 두 단계(bg-blue-900, bg-blue-700)일 때는 흰색
  if (count >= maxCount - step) return 'text-white'
  if (count >= maxCount - step * 2) return 'text-white'
  return 'text-slate-900'
}

// 권역 선택 핸들러
const selectRegion = (region) => {
  console.log('선택된 권역:', region)
  // 여기에 상세 정보 모달이나 페이지 이동 로직 추가 가능
}

// 지역 설명 반환 (포함된 시/도)
const getRegionDescription = (regionName) => {
  const descriptions = {
    서울: '서울특별시',
    인천: '인천광역시',
    경기: '경기도 (31개 시·군)',
    강원: '강원특별자치도',
    충청: '대전광역시, 세종특별자치시, 충청북도, 충청남도',
    전라: '광주광역시, 전라북도, 전라남도',
    경북: '대구광역시, 경상북도',
    경남: '부산광역시, 울산광역시, 경상남도',
    제주: '제주특별자치도',
  }
  return descriptions[regionName] || ''
}

// 결제 수단 계산
const paymentMethods = computed(() => {
  const reservations = filteredReservations.value
  const methodMap = {}

  reservations.forEach((r) => {
    const method = r.paymentMethod || '기타'
    if (!methodMap[method]) {
      methodMap[method] = 0
    }
    methodMap[method] += 1
  })

  const total = reservations.length
  const methods = Object.entries(methodMap).map(([method, count]) => ({
    method,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }))

  // 카드와 기타로 그룹화
  const cardMethods = ['카드', '신용카드', '체크카드']
  const cardCount = methods
    .filter((m) => cardMethods.some((cm) => m.method.includes(cm)))
    .reduce((sum, m) => sum + m.count, 0)
  const otherCount = total - cardCount

  return {
    card: {
      count: cardCount,
      percentage: total > 0 ? Math.round((cardCount / total) * 100) : 0,
    },
    other: {
      count: otherCount,
      percentage: total > 0 ? Math.round((otherCount / total) * 100) : 0,
    },
  }
})

// 호버된 사이즈
const hoveredSize = ref(null)

// 사이즈별 비율
const sizeRatio = computed(() => {
  const reservations = filteredReservations.value
  const sizeMap = {}

  reservations.forEach((r) => {
    const size = r.itemSize || '기타'
    if (!sizeMap[size]) {
      sizeMap[size] = 0
    }
    sizeMap[size] += 1
  })

  const total = reservations.length
  // 이미지 색상 팔레트 사용 (오렌지 계열 중심)
  const colors = {
    Small: '#f59e0b', // 오렌지색
    Medium: '#3b82f6', // 파란색
    Large: '#ef4444', // 빨간색
    XLarge: '#22d3ee', // 청록색
    기타: '#f97316', // 주황색
  }

  return Object.entries(sizeMap)
    .map(([size, count]) => ({
      size,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[size] || colors['기타'],
    }))
    .sort((a, b) => b.count - a.count)
})

const getPieOffset = (index) => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += sizeRatio.value[i].percentage * 2.513
  }
  return -offset
}

// 인사이트
const insights = computed(() => {
  const reservations = filteredReservations.value
  const utilizationRate = keyMetrics.value.utilizationRate
  const deliveryRate = additionalMetrics.value.deliveryRate
  const topSize = sizeRatio.value[0]

  const insightList = []

  if (utilizationRate < 5) {
    insightList.push(`이용률 ${utilizationRate}%로 목표(5%) 미달 → 현장 마케팅 강화 필요`)
  }

  if (topSize) {
    insightList.push(`${topSize.size} 사이즈 집중 (${topSize.percentage}%) → 재고 관리 최적화`)
  }

  if (deliveryRate > 15) {
    insightList.push(`배송 신청 ${deliveryRate}% (증가 추세) → 배송 인프라 확대 검토`)
  }

  if (insightList.length === 0) {
    insightList.push('현재 운영 상태가 양호합니다.')
  }

  return insightList
})

// 데이터 로드
onMounted(() => {
  // ERD 기반 월간 예약 데이터 연결
  if (reservationsMonthly && Array.isArray(reservationsMonthly.reservations)) {
    allReservations.value = reservationsMonthly.reservations.map((r) => ({
      ...r,
      // 안전장치: 누락 필드 기본값 설정
      totalPrice: r.totalPrice ?? 0,
      customerPhone: r.customerPhone ?? '',
      isReturningCustomer: r.isReturningCustomer ?? false,
      deliveryType: r.deliveryType ?? '',
      deliveryRegion: r.deliveryRegion ?? '',
      paymentMethod: r.paymentMethod ?? '',
      itemSize: r.itemSize ?? '기타',
    }))
  }

  // Chart.js 차트 생성
  nextTick(() => {
    createEventTypeChart()
    createPeakTimeChart()
    createPaymentMethodChart()
    createSizeRatioChart()
  })
})

// 행사 유형별 매출 차트 생성
const createEventTypeChart = () => {
  if (!eventTypeChartRef.value) return

  const ctx = eventTypeChartRef.value.getContext('2d')

  if (eventTypeChart) {
    eventTypeChart.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'
  const textColor = isDark ? 'rgba(148, 163, 184, 1)' : 'rgba(100, 116, 139, 1)'

  const barValuePlugin = {
    id: 'barValue',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      if (!meta) return

      ctx.save()
      ctx.fillStyle = textColor
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      meta.data.forEach((bar, index) => {
        const item = eventTypeSales.value[index]
        if (!item) return
        const pos = bar.tooltipPosition()
        ctx.fillText(formatCurrency(item.value), pos.x + 8, pos.y)
      })

      ctx.restore()
    },
  }

  // 유형별 매출을 개별 막대로 표시 (가로 막대)
  eventTypeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: eventTypeSales.value.map((item) => item.type),
      datasets: [
        {
          label: '매출',
          data: eventTypeSales.value.map((item) => item.value),
          backgroundColor: eventTypeSales.value.map((item) => item.color + 'CC'),
          borderColor: eventTypeSales.value.map((item) => item.color),
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          borderRadius: 12,
          callbacks: {
            title: function (context) {
              const item = eventTypeSales.value[context[0].dataIndex]
              return item ? item.type : ''
            },
            label: function (context) {
              const item = eventTypeSales.value[context.dataIndex]
              if (!item) return []
              return [
                `매출: ${formatCurrency(item.value)}`,
                `비율: ${item.percentage}%`,
                `건수: ${item.count || 0}건`,
              ]
            },
            labelColor: function (context) {
              const item = eventTypeSales.value[context.dataIndex]
              if (!item) return {}
              return {
                borderColor: item.color,
                backgroundColor: item.color,
              }
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            color: textColor,
            font: { size: 11 },
          },
          grid: {
            display: false,
          },
          categoryPercentage: 0.8,
          barPercentage: 0.9,
        },
        x: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            font: { size: 11 },
            callback: function (value) {
              const val = Number(value) || 0
              return `${Math.round(val / 10000)}만원`
            },
          },
          grid: {
            color: gridColor,
            borderDash: [4, 4],
            lineWidth: 1,
          },
        },
      },
    },
  })
}

// 행사 유형 범례 호버 시 해당 구간을 강조하고 툴팁 표시
const highlightEventType = (index) => {
  if (!eventTypeChart) return

  const meta = eventTypeChart.getDatasetMeta(0)
  if (!meta || !meta.data || !meta.data[index]) return

  const element = { datasetIndex: 0, index }
  const bar = meta.data[index]

  eventTypeChart.setActiveElements([element])
  eventTypeChart.tooltip.setActiveElements([element], {
    x: bar.x,
    y: bar.y,
  })
  eventTypeChart.update()
}

const clearHighlightEventType = () => {
  if (!eventTypeChart) return
  eventTypeChart.setActiveElements([])
  eventTypeChart.tooltip.setActiveElements([], { x: 0, y: 0 })
  eventTypeChart.update()
}

// 사이즈 범례 호버 시 도넛 차트에서 해당 세그먼트를 강조하고 툴팁 표시
const highlightSizeSegment = (index) => {
  if (!sizeRatioChart) return

  const meta = sizeRatioChart.getDatasetMeta(0)
  if (!meta || !meta.data || !meta.data[index]) return

  const element = { datasetIndex: 0, index }
  const point = meta.data[index]

  sizeRatioChart.setActiveElements([element])
  sizeRatioChart.tooltip.setActiveElements([element], {
    x: point.x,
    y: point.y,
  })
  sizeRatioChart.update()
}

const clearHighlightSizeSegment = () => {
  if (!sizeRatioChart) return
  sizeRatioChart.setActiveElements([])
  sizeRatioChart.tooltip.setActiveElements([], { x: 0, y: 0 })
  sizeRatioChart.update()
}

// 피크타임 분석 차트 생성
const createPeakTimeChart = () => {
  if (!peakTimeChartRef.value) return

  const ctx = peakTimeChartRef.value.getContext('2d')

  if (peakTimeChart) {
    peakTimeChart.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 1)'
  const textColor = isDark ? 'rgba(148, 163, 184, 1)' : 'rgba(100, 116, 139, 1)'

  peakTimeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: peakTimeData.value.hours.map((h) => h + '시'),
      datasets: [
        {
          label: '맡기기',
          data: peakTimeData.value.storeValues,
          borderColor: '#f59e0b', // Small 색상 (오렌지색)
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: '찾기',
          data: peakTimeData.value.findValues,
          borderColor: '#3b82f6', // Medium 색상 (파란색)
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y}건`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          // 피크타임은 0~200건까지 여유 있게 커버
          max: 200,
          ticks: {
            // 50건 단위 눈금 (0, 50, 100, 150, 200)
            stepSize: 50,
            callback: function (value) {
              return value + '건'
            },
            color: textColor,
            font: {
              size: 10,
            },
          },
          grid: {
            color: gridColor,
            lineWidth: 1,
          },
        },
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 10,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  })
}

// 결제 수단 차트 생성
const createPaymentMethodChart = () => {
  if (!paymentMethodChartRef.value) return

  const ctx = paymentMethodChartRef.value.getContext('2d')

  if (paymentMethodChart) {
    paymentMethodChart.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? 'rgba(148, 163, 184, 1)' : 'rgba(100, 116, 139, 1)'

  paymentMethodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['카드', '기타'],
      datasets: [
        {
          label: '결제 수단',
          data: [paymentMethods.value.card.count, paymentMethods.value.other.count],
          backgroundColor: ['#f59e0bCC', '#3b82f6CC'],
          borderColor: ['#f59e0b', '#3b82f6'],
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              const labels = ['카드', '기타']
              const method = labels[context.dataIndex]
              const data =
                method === '카드' ? paymentMethods.value.card : paymentMethods.value.other
              return [`${method}`, `건수: ${data.count}건`, `비율: ${data.percentage}%`]
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            font: {
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  })
}

// 사이즈별 비율 차트 생성
const createSizeRatioChart = () => {
  if (!sizeRatioChartRef.value) return

  const ctx = sizeRatioChartRef.value.getContext('2d')

  if (sizeRatioChart) {
    sizeRatioChart.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? 'rgba(148, 163, 184, 1)' : 'rgba(100, 116, 139, 1)'

  const sizeRatioValuePlugin = {
    id: 'sizeRatioValue',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      if (!meta) return

      ctx.save()
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      meta.data.forEach((arc, index) => {
        const item = sizeRatio.value[index]
        if (!item) return

        const pos = arc.tooltipPosition()
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText(`${item.percentage}%`, pos.x, pos.y - 7)
        ctx.font = '11px sans-serif'
        ctx.fillText(`${formatNumber(item.count)}건`, pos.x, pos.y + 8)
      })

      ctx.restore()
    },
  }

  sizeRatioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sizeRatio.value.map((item) => item.size),
      datasets: [
        {
          data: sizeRatio.value.map((item) => item.count),
          backgroundColor: sizeRatio.value.map((item) => item.color + 'CC'),
          borderColor: sizeRatio.value.map((item) => item.color),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          z: 10000,
          callbacks: {
            title: function (context) {
              const item = sizeRatio.value[context[0].dataIndex]
              return item ? item.size : ''
            },
            label: function (context) {
              const item = sizeRatio.value[context.dataIndex]
              if (!item) return []
              return [`비율: ${item.percentage}%`, `건수: ${item.count}건`]
            },
            labelColor: function (context) {
              const item = sizeRatio.value[context.dataIndex]
              if (!item) return {}
              return {
                borderColor: item.color,
                backgroundColor: item.color,
              }
            },
          },
        },
      },
    },
    plugins: [sizeRatioValuePlugin],
  })
}

// 주차 변경 시 피크타임 분석 셀렉트 초기화
watch(
  () => dateRange.value,
  () => {
    selectedEventTypeForPeakTime.value = ''
  },
  { deep: true },
)

// 데이터 변경 시 차트 업데이트
watch(
  [eventTypeSales, peakTimeData, paymentMethods, sizeRatio, selectedEventTypeForPeakTime],
  () => {
    nextTick(() => {
      if (eventTypeChart) {
        eventTypeChart.data.labels = eventTypeSales.value.map((item) => item.type)
        eventTypeChart.data.datasets[0].data = eventTypeSales.value.map((item) => item.value)
        eventTypeChart.data.datasets[0].backgroundColor = eventTypeSales.value.map(
          (item) => item.color + 'CC',
        )
        eventTypeChart.data.datasets[0].borderColor = eventTypeSales.value.map((item) => item.color)
        eventTypeChart.update()
      }

      if (peakTimeChart) {
        peakTimeChart.data.labels = peakTimeData.value.hours.map((h) => h + '시')
        peakTimeChart.data.datasets[0].data = peakTimeData.value.storeValues
        peakTimeChart.data.datasets[1].data = peakTimeData.value.findValues
        // 고정 축 범위와 단위 유지 (0~200건, 50건 단위)
        peakTimeChart.options.scales.y.max = 200
        peakTimeChart.options.scales.y.ticks.stepSize = 50
        peakTimeChart.update()
      }

      if (paymentMethodChart) {
        paymentMethodChart.data.datasets[0].data = [
          paymentMethods.value.card.count,
          paymentMethods.value.other.count,
        ]
        paymentMethodChart.update()
      }

      if (sizeRatioChart) {
        sizeRatioChart.data.labels = sizeRatio.value.map((item) => item.size)
        sizeRatioChart.data.datasets[0].data = sizeRatio.value.map((item) => item.count)
        sizeRatioChart.data.datasets[0].backgroundColor = sizeRatio.value.map(
          (item) => item.color + 'CC',
        )
        sizeRatioChart.data.datasets[0].borderColor = sizeRatio.value.map((item) => item.color)
        sizeRatioChart.update()
      }
    })
  },
  { deep: true },
)
</script>

<style scoped>
/* Chart.js 툴팁이 범례 위에 표시되도록 z-index 설정 */
:deep(.chartjs-tooltip) {
  z-index: 10000 !important;
}
</style>
