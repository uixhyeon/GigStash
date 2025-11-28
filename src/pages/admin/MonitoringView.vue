<template>
  <div
    class="p-6 bg-background dark:bg-dark-bg h-[100vh - 64px] scrollbar-hide flex flex-col justify-start"
    @click="showCalendar = false"
  >
    <!-- 리포트 & 통계 헤더 -->
    <div>
      <!-- <h1 class="text-xl font-bold mb-3" style="color: #1e293b">리포트 & 통계</h1> -->

      <!-- 날짜 범위 선택기 -->
      <div class="flex justify-center mb-3">
        <div class="flex items-center gap-4">
          <button
            @click="prevDateRange"
            class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
            title="이전 주"
          >
            <i class="fi fi-rr-angle-left text-2xl text-slate-700 dark:text-slate-300"></i>
          </button>
          <div
            @click.stop="showCalendar = !showCalendar"
            class="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex flex-col items-center text-center"
          >
            <div class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {{ getWeekLabel(dateRange.start) }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ formatDateRange(dateRange.start) }} ~
              {{ formatDateRange(dateRange.end) }}
            </div>
          </div>
          <button
            @click="nextDateRange"
            class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
            title="다음 주"
          >
            <i class="fi fi-rr-angle-right text-2xl text-slate-700 dark:text-slate-300"></i>
          </button>

          <!-- 달력 모달 -->
          <div
            v-if="showCalendar"
            class="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 z-50 border border-slate-200 dark:border-slate-700 min-w-[320px]"
            @click.stop
          >
            <!-- 헤더 -->
            <div class="flex items-center justify-between mb-6">
              <button
                @click="prevCalendarMonth"
                class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="이전 달"
              >
                <i class="fi fi-rr-angle-left text-lg"></i>
              </button>
              <div class="text-lg font-bold text-slate-900 dark:text-white px-4">
                {{ calendarYear }}년 {{ String(calendarMonth + 1).padStart(2, '0') }}월
              </div>
              <button
                @click="nextCalendarMonth"
                class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="다음 달"
              >
                <i class="fi fi-rr-angle-right text-lg"></i>
              </button>
            </div>

            <!-- 요일 헤더 -->
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div
                v-for="day in ['일', '월', '화', '수', '목', '금', '토']"
                :key="day"
                :class="[
                  'text-center text-xs font-semibold py-2',
                  day === '일' ? 'text-red-500 dark:text-red-400' : '',
                  day === '토' ? 'text-blue-500 dark:text-blue-400' : '',
                  day !== '일' && day !== '토' ? 'text-slate-500 dark:text-slate-400' : '',
                ]"
              >
                {{ day }}
              </div>
            </div>

            <!-- 달력 그리드 -->
            <div class="grid grid-cols-7 gap-0.5">
              <div
                v-for="d in calendarDays"
                :key="d.key"
                :class="[
                  'aspect-square flex items-center justify-center text-sm cursor-pointer select-none transition-all duration-200 relative',
                  d.outside
                    ? 'text-slate-300 dark:text-slate-600'
                    : isDateInRange(d.date)
                      ? 'font-semibold text-white'
                      : 'text-slate-700 dark:text-slate-200',
                  // 주간의 첫 번째 날짜 (월요일)
                  isDateInRange(d.date) && isWeekStart(d.date) && !d.outside ? 'rounded-l-xl' : '',
                  // 주간의 마지막 날짜 (일요일)
                  isDateInRange(d.date) && d.date.getDay() === 0 && !d.outside
                    ? 'rounded-r-xl'
                    : '',
                  // 주간의 중간 날짜들
                  isDateInRange(d.date) &&
                  !isWeekStart(d.date) &&
                  d.date.getDay() !== 0 &&
                  !d.outside
                    ? ''
                    : '',
                  // 선택되지 않은 날짜는 둥근 모서리
                  !isDateInRange(d.date) && !d.outside ? 'rounded-xl' : '',
                ]"
                :style="isDateInRange(d.date) && !d.outside ? 'background-color: #3b82f6;' : ''"
                @click="selectWeekFromDate(d.date)"
                @mouseenter="hoveredCalendarDate = d.date"
                @mouseleave="hoveredCalendarDate = null"
              >
                <span :class="['relative z-10']">
                  {{ d.date.getDate() }}
                </span>
                <!-- 오늘 표시 -->
                <span
                  v-if="isToday(d.date) && !isDateInRange(d.date)"
                  class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                  style="background-color: #3b82f6"
                ></span>
              </div>
            </div>

            <!-- 선택된 주간 표시 -->
            <div v-if="dateRange" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div class="text-xs text-slate-500 dark:text-slate-400 text-center">선택된 주간</div>
              <div class="text-sm font-semibold text-slate-900 dark:text-white text-center mt-1">
                {{ formatDateRange(dateRange.start) }} ~
                {{ formatDateRange(dateRange.end) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 운영 기간 안내 메시지 -->
    <div
      v-if="!isValidDateRange && filteredReservations.length === 0"
      class="mb-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
    >
      <div class="flex items-center gap-2">
        <i class="fi fi-rr-info text-gray-600 dark:text-gray-400"></i>
        <p class="text-sm text-gray-800 dark:text-gray-200">
          <span v-if="isBeforeNovember">아직 서비스가 오픈되지 않았습니다.</span>
          <span v-else-if="isAfterNovember">이 기간은 운영 정보가 없습니다.</span>
        </p>
      </div>
    </div>

    <!-- 왼쪽/오른쪽 2분할 레이아웃 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 왼쪽 컬럼 -->
      <div class="space-y-2">
        <!-- 주요 지표 -->
        <section>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
            금주 주요 지표
          </h2>
          <div class="flex flex-wrap gap-3 mb-4">
            <!-- 이용률 카드 -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
            >
              <div>
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400"
                  style="font-size: 16px; font-weight: bold"
                >
                  이용률
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-gray-900 dark:text-table-header-text"
                  style="font-size: 30px"
                >
                  {{ keyMetrics.utilizationRate }}%
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  전주 대비
                  <span
                    class="font-medium"
                    :style="{ color: getChangeColor(keyMetrics.utilizationChange) }"
                  >
                    <i :class="getChangeIcon(keyMetrics.utilizationChange)" class="mr-1"></i
                    >{{ Math.abs(keyMetrics.utilizationChange) }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- 재방문율 카드 -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-green-100 dark:border-green-900/30"
            >
              <div>
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400"
                  style="font-size: 16px; font-weight: bold"
                >
                  재방문율
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-gray-900 dark:text-table-header-text"
                  style="font-size: 30px"
                >
                  {{ additionalMetrics.revisitRate }}%
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  전주 대비
                  <span
                    class="font-medium"
                    :style="{ color: getChangeColor(additionalMetrics.revisitChange) }"
                  >
                    <i :class="getChangeIcon(additionalMetrics.revisitChange)" class="mr-1"></i
                    >{{ Math.abs(additionalMetrics.revisitChange) }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- 배송선택률 카드 -->
            <!-- class="flex-1 p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-yellow-300/90 to-amber-400/95 text-gray-800" -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-yellow-100 dark:border-yellow-900/30"
            >
              <div>
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400"
                  style="font-size: 16px; font-weight: bold"
                >
                  배송선택률
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-gray-900 dark:text-table-header-text"
                  style="font-size: 30px"
                >
                  {{ additionalMetrics.deliveryRate }}%
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  전주 대비
                  <span
                    class="font-medium"
                    :style="{ color: getChangeColor(additionalMetrics.deliveryChange) }"
                  >
                    <i :class="getChangeIcon(additionalMetrics.deliveryChange)" class="mr-1"></i
                    >{{ Math.abs(additionalMetrics.deliveryChange) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 매출 & 이용객 카드 -->
          <div class="flex flex-wrap gap-3">
            <!-- 이용객 카드 -->
            <!-- class="flex-1 p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-gray-400/90 to-gray-600/95" -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-gradient-to-br from-yellow-100/90 to-yellow-300/95"
            >
              <div
                class="font-bold opacity-90 text-gray-900 dark:text-table-header-text"
                style="font-size: 16px"
              >
                이용객
              </div>
              <div class="text-right">
                <div
                  class="mt-1 sm:mt-2 font-bold"
                  style="font-size: 16px"
                  :style="{ color: getChangeColor(keyMetrics.usersChange) }"
                >
                  <i :class="getChangeIcon(keyMetrics.usersChange)" class="mr-1"></i
                  >{{ Math.abs(keyMetrics.usersChange) }}%
                </div>
                <div
                  class="font-bold mt-1 sm:mt-2 text-gray-900 dark:text-table-header-text"
                  style="font-size: 30px"
                >
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
        </section>

        <!-- 이용객 & 매출 카드 (배경 없는 버전) -->
        <section>
          <div class="flex flex-wrap gap-3">
            <!-- 이용객 카드 (배경 없음) -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700"
            >
              <div
                class="font-bold opacity-90 text-gray-900 dark:text-table-header-text"
                style="font-size: 16px"
              >
                이용객
              </div>
              <div class="text-right">
                <div
                  class="mt-1 sm:mt-2 font-bold"
                  style="font-size: 16px"
                  :style="{ color: getChangeColor(keyMetrics.usersChange) }"
                >
                  <i :class="getChangeIcon(keyMetrics.usersChange)" class="mr-1"></i
                  >{{ Math.abs(keyMetrics.usersChange) }}%
                </div>
                <div class="font-bold mt-1 sm:mt-2" style="font-size: 30px; color: #ea580c">
                  {{ formatNumber(keyMetrics.users) }}명
                </div>
              </div>
            </div>

            <!-- 매출 카드 (배경 없음) -->
            <div
              class="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-700"
            >
              <div
                class="font-bold opacity-90 text-gray-900 dark:text-table-header-text"
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
                <div class="font-bold mt-1 sm:mt-2" style="font-size: 30px; color: #2563eb">
                  {{ formatCurrency(keyMetrics.revenue) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 행사 유형별 매출 & 사이즈별 비율 (가로 배열) -->
        <div class="flex gap-3 flex-col xl:flex-row">
          <!-- 행사 유형별 매출 -->
          <section class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
              행사 유형별 매출
            </h2>
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sm:p-3 md:p-4 lg:p-6">
              <div style="height: 140px">
                <canvas ref="eventTypeChartRef"></canvas>
              </div>
            </div>
          </section>

          <!-- 사이즈별 비율 -->
          <section class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
              사이즈별 비율
            </h2>
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sm:p-3 md:p-4 lg:p-6">
              <div class="flex items-center justify-center">
                <div class="relative flex-shrink-0" style="width: 140px; height: 140px">
                  <canvas
                    ref="sizeRatioChartRef"
                    style="
                      display: block;
                      width: 140px;
                      height: 140px;
                      position: relative;
                      z-index: 1;
                    "
                  ></canvas>
                  <!-- 도넛 중앙 범례 -->
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    style="z-index: 1"
                  >
                    <div class="space-y-1">
                      <div
                        v-for="segment in sizeRatio"
                        :key="segment.size"
                        class="flex items-center gap-1.5"
                      >
                        <div
                          class="w-3 h-3 rounded-full flex-shrink-0"
                          :style="{ backgroundColor: segment.color }"
                        ></div>
                        <span class="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                          {{ segment.size }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 오른쪽 컬럼 -->
      <div class="space-y-2">
        <!-- 피크타임 분석 -->
        <section>
          <h2
            class="text-lg items-center font-semibold mb-4 text-gray-900 dark:text-table-header-text"
          >
            피크타임 분석
          </h2>

          <div
            class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sm:p-3 md:p-4 lg:p-6 mb-4"
          >
            <!-- 범례와 셀렉트 (가로 배치) -->
            <div class="flex items-baseline justify-between gap-4 mb-3">
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
                <option
                  v-for="eventType in availableEventTypes"
                  :key="eventType"
                  :value="eventType"
                >
                  {{ eventType }}
                </option>
              </select>
            </div>
            <div class="h-64 flex flex-col items-center gap-2 flex-1 w-full min-w-0">
              <canvas ref="peakTimeChartRef"></canvas>
            </div>
          </div>
        </section>

        <!-- 지역별 배송 -->
        <section class="mb-4">
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
            지역별 배송
          </h2>
          <div
            class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 sm:p-3 md:p-4 lg:p-6 overflow-x-auto"
          >
            <!-- 히트맵과 Top 5를 가로 배치 -->
            <div class="flex flex-col lg:flex-row gap-3 lg:items-start">
              <!-- 히트맵 스타일 지도 -->
              <div class="flex flex-col items-center gap-2 flex-1 w-full">
                <!-- 1행: 수도, 강원 -->
                <div class="flex justify-center gap-2 w-full">
                  <div
                    v-if="deliveryHeatmap[0]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[0].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[0].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[0])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[0]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[0].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[0].name) }}
                    </div>
                  </div>
                  <div
                    v-if="deliveryHeatmap[1]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[1].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[1].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[1])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[1]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[1].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[1].name) }}
                    </div>
                  </div>
                </div>

                <!-- 2행: 충청, 호남, 대구경북 -->
                <div class="flex justify-center gap-2 w-full">
                  <div
                    v-if="deliveryHeatmap[2]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[2].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[2].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[2])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[2]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[2].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[2].name) }}
                    </div>
                  </div>
                  <div
                    v-if="deliveryHeatmap[3]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[3].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[3].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[3])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[3]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[3].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[3].name) }}
                    </div>
                  </div>
                  <div
                    v-if="deliveryHeatmap[4]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[4].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[4].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[4])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[4]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[4].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[4].name) }}
                    </div>
                  </div>
                </div>

                <!-- 3행: 부울경, 제주 -->
                <div class="flex justify-center gap-2 w-full">
                  <div
                    v-if="deliveryHeatmap[5]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[5].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[5].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[5])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[5]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[5].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[5].name) }}
                    </div>
                  </div>
                  <div
                    v-if="deliveryHeatmap[6]"
                    :class="[
                      getHeatmapColor(deliveryHeatmap[6].count || 0),
                      getHeatmapTextColor(deliveryHeatmap[6].count || 0),
                    ]"
                    class="h-20 w-24 sm:w-28 rounded-2xl flex flex-col items-center justify-center font-semibold cursor-pointer hover:opacity-90 hover:scale-105 transition-all text-center text-[9px] sm:text-[10px] px-1 relative shadow-sm"
                    @click="selectRegion(deliveryHeatmap[6])"
                    @mouseenter="
                      (e) => {
                        hoveredRegion = deliveryHeatmap[6]
                        const rect = e.currentTarget.getBoundingClientRect()
                        regionTooltipPosition.x = rect.left + rect.width / 2
                        regionTooltipPosition.y = rect.top - 10
                      }
                    "
                    @mouseleave="hoveredRegion = null"
                  >
                    <div class="font-bold text-xs sm:text-sm">
                      {{ deliveryHeatmap[6].name }}
                    </div>
                    <div class="text-[8px] sm:text-[9px] mt-1 opacity-75 leading-tight">
                      {{ getRegionDescription(deliveryHeatmap[6].name) }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import reservationsData from '@/data/reservations_2025_11.json'

Chart.register(...registerables)

// 전체 예약 데이터
const allReservations = ref([])

// 날짜 범위 관리 (주간 설정)
const dateRange = ref({
  start: new Date(2025, 10, 17), // 2025-11-17
  end: new Date(2025, 10, 23), // 2025-11-23 (7일 범위)
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

// 주차 레이블 생성 (예: "11월 첫째주")
const getWeekLabel = (date) => {
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  // 해당 월의 첫 번째 날짜
  const firstDayOfMonth = new Date(year, date.getMonth(), 1)
  const firstDayWeekday = firstDayOfMonth.getDay() // 0(일) ~ 6(토)

  // 첫 번째 월요일 찾기
  const daysToFirstMonday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1
  const firstMonday = new Date(firstDayOfMonth)
  firstMonday.setDate(firstMonday.getDate() + (7 - daysToFirstMonday))

  // 주차 계산
  const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24))
  let weekNumber = Math.floor(daysDiff / 7) + 1

  // weekNumber가 0 이하인 경우 첫째주로 처리
  if (weekNumber <= 0) {
    weekNumber = 1
  }

  // 주차 한글 표현
  const weekLabels = ['첫째', '둘째', '셋째', '넷째', '다섯째']
  const weekLabel = weekLabels[weekNumber - 1] || `${weekNumber}째`

  return `${month}월 ${weekLabel}주`
}

const prevDateRange = () => {
  const days = 7 // 주간(7일) 범위
  const newStart = new Date(dateRange.value.start.getTime() - days * 24 * 60 * 60 * 1000)
  const newEnd = new Date(dateRange.value.end.getTime() - days * 24 * 60 * 60 * 1000)
  // 반응성을 보장하기 위해 새로운 객체 할당
  dateRange.value = {
    start: newStart,
    end: newEnd,
  }
}

const nextDateRange = () => {
  const days = 7 // 주간(7일) 범위
  const newStart = new Date(dateRange.value.start.getTime() + days * 24 * 60 * 60 * 1000)
  const newEnd = new Date(dateRange.value.end.getTime() + days * 24 * 60 * 60 * 1000)
  // 반응성을 보장하기 위해 새로운 객체 할당
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

// 날짜가 현재 선택된 주간 범위에 있는지 확인
const isDateInRange = (date) => {
  const dateStr = fmtKey(date)
  const startStr = formatDateRange(dateRange.value.start)
  const endStr = formatDateRange(dateRange.value.end)
  return dateStr >= startStr && dateStr <= endStr
}

// 주간 시작일인지 확인 (월요일)
const isWeekStart = (date) => {
  return date.getDay() === 1 // 월요일
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

// 날짜 클릭 시 주간 선택
const selectWeekFromDate = (date) => {
  // 클릭한 날짜가 속한 주간 계산 (월요일~일요일)
  const dayOfWeek = date.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const weekStart = new Date(date)
  weekStart.setDate(weekStart.getDate() - daysToMonday)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  dateRange.value = {
    start: weekStart,
    end: weekEnd,
  }

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

  // dateRange.value를 명시적으로 참조하여 반응성 보장
  const range = dateRange.value
  const days = 7
  const prevStart = new Date(range.start.getTime() - days * 24 * 60 * 60 * 1000)
  const prevEnd = new Date(range.end.getTime() - days * 24 * 60 * 60 * 1000)

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

// 변화율 텍스트 색상 반환 (상승: 빨강색, 하강: 파란색)
const getChangeColor = (changeValue) => {
  if (changeValue > 0) {
    return '#3b82f6' // 파란색 (상승)
  } else if (changeValue < 0) {
    return '#ef4444' // 빨간색 (하락)
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

// 시/도를 권역으로 매핑하는 함수
const mapRegionToArea = (region) => {
  const regionToAreaMap = {
    // 수도권
    서울: '수도',
    인천: '수도',
    경기: '수도',
    // 강원
    강원: '강원',
    // 충청
    충남: '충청',
    충북: '충청',
    대전: '충청',
    세종: '충청',
    // 호남
    전남: '호남',
    전북: '호남',
    광주: '호남',
    // 대구경북
    대구: '대구경북',
    경북: '대구경북',
    // 부울경
    부산: '부울경',
    울산: '부울경',
    경남: '부울경',
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

  // 고정된 순서로 지역 그룹 정의 (레이아웃 순서대로)
  const regionOrder = [
    '수도', // 1행 첫번째
    '강원', // 1행 두번째
    '충청', // 2행 첫번째
    '호남', // 2행 중앙
    '대구경북', // 2행 세번째
    '부울경', // 3행 첫번째
    '제주', // 3행 두번째
  ]

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

// 3x3 그리드 구조로 매핑 (빈칸 위치: 4, 7)
const heatmapGrid = computed(() => {
  const grid = []
  const emptyPositions = [4, 7] // 2행 중앙, 3행 중앙

  for (let i = 0; i < 9; i++) {
    if (emptyPositions.includes(i)) {
      grid.push({ region: null })
    } else {
      const regionIndex = i < 4 ? i : i - 1 // 빈칸 위치를 제외한 인덱스
      grid.push({
        region: deliveryHeatmap.value[regionIndex] || null,
      })
    }
  }

  return grid
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

// 지역 설명 반환 (포함된 구들)
const getRegionDescription = (regionName) => {
  const descriptions = {
    수도: '서울·인천·경기',
    강원: '강원도',
    충청: '충청남도·충청북도·대전·세종',
    호남: '전라남도·전라북도·광주',
    대구경북: '대구·경상북도',
    부울경: '부산·울산·경상남도',
    제주: '제주도',
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
  if (reservationsData && reservationsData.reservations) {
    allReservations.value = reservationsData.reservations
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

  eventTypeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: eventTypeSales.value.map((item) => item.type),
      datasets: [
        {
          label: '매출',
          data: eventTypeSales.value.map((item) => item.value),
          backgroundColor: eventTypeSales.value.map((item) => item.color + 'CC'), // 투명도 추가
          borderColor: eventTypeSales.value.map((item) => item.color),
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 48, // 고정 바 두께 (5개 기준 적절한 크기)
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
          borderRadius: 12,
          callbacks: {
            label: function (context) {
              const item = eventTypeSales.value[context.dataIndex]
              return [
                `매출: ${formatNumber(item.value)}원`,
                `비율: ${item.percentage}%`,
                `건수: ${item.count || 0}건`,
              ]
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 500000,
          ticks: {
            stepSize: 100000,
            callback: function (value) {
              return value / 10000 + '만'
            },
            color: textColor,
            font: {
              size: 11,
            },
          },
          grid: {
            color: gridColor,
            borderDash: [4, 4],
            lineWidth: 1,
          },
        },
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 11,
            },
          },
          grid: {
            display: false,
          },
          categoryPercentage: 0.6, // 카테고리 간격 비율 (5개 기준 적절한 여백)
          barPercentage: 0.8, // 바 너비 비율 (바 사이 여백)
        },
      },
    },
  })
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
          max: 50,
          ticks: {
            stepSize: 10,
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
        peakTimeChart.options.scales.y.max = 50
        peakTimeChart.options.scales.y.ticks.stepSize = 10
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
