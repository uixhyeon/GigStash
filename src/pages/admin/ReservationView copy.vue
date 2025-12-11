<template>
  <div
    class="px-6 bg-slate-50 dark:bg-slate-900 scrollbar-hide h-[calc(100vh-130px)] flex flex-col overflow-hidden"
  >
    <!-- 통계 카드 -->
    <section class="mb-8 flex-shrink-0">
      <h2 class="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">예약 통계</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <!-- 전체 예약 -->
        <div
          class="p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          <div class="flex justify-between items-start gap-1 sm:gap-2 md:gap-3">
            <div class="min-w-0">
              <div
                class="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 truncate"
              >
                전체 예약
              </div>
              <div
                class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-0.5 sm:mt-1 md:mt-2 text-blue-600 dark:text-blue-400"
              >
                {{ stats.all }} 건
              </div>
            </div>
            <i
              class="fi fi-rr-calendar text-sm sm:text-base md:text-lg lg:text-2xl flex-shrink-0"
              style="color: #3b82f6"
            ></i>
          </div>
        </div>

        <!-- 활성 예약 -->
        <div
          class="p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          <div class="flex justify-between items-start gap-1 sm:gap-2 md:gap-3">
            <div class="min-w-0">
              <div
                class="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 truncate"
              >
                금일 활성 예약
              </div>
              <div
                class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-0.5 sm:mt-1 md:mt-2 text-blue-600 dark:text-blue-400"
              >
                {{ stats.active }} 건
              </div>
            </div>
            <i
              class="fi fi-rs-calendar-check text-sm sm:text-base md:text-lg lg:text-2xl flex-shrink-0"
              style="color: #3b82f6"
            ></i>
          </div>
        </div>

        <!-- 대기 중 -->
        <div
          class="p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-amber-100 dark:border-amber-900/30"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          <div class="flex justify-between items-start gap-1 sm:gap-2 md:gap-3">
            <div class="min-w-0">
              <div
                class="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 truncate"
              >
                대기 중
              </div>
              <div
                class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-0.5 sm:mt-1 md:mt-2 text-amber-600 dark:text-amber-400"
              >
                {{ stats.waiting }} 건
              </div>
            </div>
            <i
              class="fi fi-rr-hourglass text-sm sm:text-base md:text-lg lg:text-2xl flex-shrink-0"
              style="color: #d97706"
            ></i>
          </div>
        </div>

        <!-- 완료 -->
        <div
          class="p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-green-100 dark:border-green-900/30"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          <div class="flex justify-between items-start gap-1 sm:gap-2 md:gap-3">
            <div class="min-w-0">
              <div
                class="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 truncate"
              >
                완료
              </div>
              <div
                class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-0.5 sm:mt-1 md:mt-2 text-green-600 dark:text-green-400"
              >
                {{ stats.completed }} 건
              </div>
            </div>
            <i
              class="fi fi-rr-check text-sm sm:text-base md:text-lg lg:text-2xl flex-shrink-0"
              style="color: #16a34a"
            ></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 필터 및 검색 ==================================================-->
    <section class="flex flex-col flex-1 min-h-0">
      <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
        예약 목록
      </h2>

      <div class="flex flex-col gap-3 mb-4 flex-shrink-0">
        <!-- 필터 조건 -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- 상태 필터 -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <label
              class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
            >
              상태
            </label>
            <select
              v-model="statusFilter"
              class="px-2 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            >
              <option value="전체">전체</option>
              <option value="활성">활성</option>
              <option value="대기">대기</option>
              <option value="완료">사용 완료</option>
              <option value="취소">취소</option>
            </select>
          </div>

          <!-- 고객 검색 -->
          <div class="flex items-center gap-1.5 flex-shrink-0 min-w-0 flex-1 sm:flex-none">
            <!-- <label
              class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
            >
              조회
            </label> -->
            <div
              class="flex items-center gap-2 px-2 py-1.5 text-xs border border-gray-300 bg-white dark:border-dark-border rounded-lg focus-within:ring-2 focus-within:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            >
              <input
                v-model="searchQuery"
                type="text"
                placeholder="검색"
                class="bg-transparent placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:outline-none dark:bg-dark-bg-tertiary dark:text-dark-text-primary text-xs w-24 sm:w-32"
              />
              <i class="fi fi-br-search text-gray-600 dark:text-gray-300 flex-shrink-0"></i>
            </div>
          </div>

          <!-- 필터 초기화 버튼 -->
          <button
            @click="resetFilters"
            class="px-3 py-1.5 bg-transparent hover:bg-primary hover:text-white rounded-lg transition-all text-primary dark:text-primary font-medium text-xs flex-shrink-0 border border-primary whitespace-nowrap"
            title="필터 초기화"
          >
            <i class="fi fi-br-refresh mr-1"></i>초기화
          </button>

          <!-- 기간 선택 입력 필드 (선택 모드일 때만 표시) -->
          <!-- <div
            v-if="dateRangeMode === 'custom'"
            class="flex flex-wrap items-center gap-2 sm:gap-3 pl-4 border-l border-gray-300 dark:border-dark-border"
          >
            <label
              class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
              >기간</label
            >
            <input
              v-model="startDateFilter"
              type="date"
              class="px-2 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            />
            <span class="text-gray-500 dark:text-gray-400 text-xs">~</span>
            <input
              v-model="endDateFilter"
              type="date"
              class="px-2 py-1.5 text-xs border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            />
            <button
              @click="applyDateFilter"
              class="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium text-xs flex-shrink-0 whitespace-nowrap"
              title="기간 조회"
            >
              <i class="fi fi-rr-search mr-1"></i>조회
            </button>
          </div> -->

          <!-- 조회 기간 라디오 버튼 -->
          <!-- <div
            class="flex items-center gap-3 ml-auto pl-4 border-l border-gray-300 dark:border-dark-border"
          >
            <label
              class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap"
              >기간</label
            >
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <input
                  v-model="dateRangeMode"
                  type="radio"
                  value="all"
                  id="radio-all-2"
                  class="w-3.5 h-3.5 cursor-pointer accent-primary"
                />
                <label
                  for="radio-all-2"
                  class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary cursor-pointer whitespace-nowrap"
                >
                  기본
                </label>
              </div>
              <div class="flex items-center gap-1.5">
                <input
                  v-model="dateRangeMode"
                  type="radio"
                  value="custom"
                  id="radio-custom-2"
                  class="w-3.5 h-3.5 cursor-pointer accent-primary"
                />
                <label
                  for="radio-custom-2"
                  class="text-xs font-medium text-gray-700 dark:text-dark-text-secondary cursor-pointer whitespace-nowrap"
                >
                  선택
                </label>
              </div>
            </div>
          </div> -->
        </div>
      </div>

      <!-- <div
        class="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm p-6 mb-6"
        style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="사용자명으로 검색"
            class="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
          />
          <select
            class="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
          >
            <option>상태 선택</option>
            <option>활성</option>
            <option>대기</option>
            <option>완료</option>
            <option>취소</option>
          </select>
          <input
            type="date"
            class="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
          />
          <button
            class="px-4 py-2 bg-transparent hover:bg-primary hover:text-white text-primary dark:text-primary rounded-lg transition-all border border-primary font-medium"
          >
            검색
          </button>
        </div>
      </div> -->

      <!-- 예약 목록 ================================================================================== -->
      <div
        class="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm overflow-hidden max-w-full flex-1 flex flex-col min-h-0"
        style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
      >
        <div class="overflow-y-auto scrollbar-hide w-full">
          <table class="w-full text-xs min-w-max">
            <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
              <tr>
                <th
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark rounded-tl-2xl whitespace-nowrap"
                >
                  No
                </th>
                <th
                  @click="toggleSort('eventId')"
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  <div class="flex items-center justify-center gap-1">
                    행사번호 (EVT ID)
                    <i
                      v-if="sortBy === 'eventId'"
                      :class="[
                        'fi text-xs',
                        sortDirection === 'asc' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down',
                      ]"
                    ></i>
                  </div>
                </th>
                <th
                  @click="toggleSort('id')"
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  <div class="flex items-center gap-1">
                    예약번호 (ID)
                    <i
                      v-if="sortBy === 'id'"
                      :class="[
                        'fi text-xs',
                        sortDirection === 'asc' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down',
                      ]"
                    ></i>
                  </div>
                </th>

                <th
                  @click="toggleSort('customerId')"
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  <div class="flex items-center justify-center gap-1">
                    사용자명
                    <i
                      v-if="sortBy === 'customerId'"
                      :class="[
                        'fi text-xs',
                        sortDirection === 'asc' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down',
                      ]"
                    ></i>
                  </div>
                </th>
                <th
                  @click="toggleSort('lockerNumber')"
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  <div class="flex items-center justify-center gap-1">
                    예약 사이즈
                    <i
                      v-if="sortBy === 'lockerNumber'"
                      :class="[
                        'fi text-xs',
                        sortDirection === 'asc' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down',
                      ]"
                    ></i>
                  </div>
                </th>
                <th
                  @click="toggleSort('startTime')"
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  <div class="flex items-center justify-center gap-1">
                    기간
                    <i
                      v-if="sortBy === 'startTime'"
                      :class="[
                        'fi text-xs',
                        sortDirection === 'asc' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down',
                      ]"
                    ></i>
                  </div>
                </th>
                <th
                  @click="toggleSort('status')"
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  <div class="flex items-center justify-center gap-1">
                    상태
                    <i
                      v-if="sortBy === 'status'"
                      :class="[
                        'fi text-xs',
                        sortDirection === 'asc' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down',
                      ]"
                    ></i>
                  </div>
                </th>
                <th
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark rounded-tr-2xl whitespace-nowrap"
                >
                  액션
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(reservation, index) in filteredReservations"
                :key="reservation.id"
                class="border-t text-center border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 cursor-pointer transition-colors group h-10"
              >
                <td
                  class="text-center px-2 py-1 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                >
                  {{ index + 1 }}
                </td>
                <td
                  class="text-center px-2 py-1 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                >
                  {{ reservation.eventId }}
                </td>
                <td
                  class="text-left px-2 py-1 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                >
                  {{ reservation.id }}
                </td>

                <td
                  class="px-2 py-1 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                >
                  {{ getCustomerInfo(reservation.customerId).name }}
                </td>
                <td
                  class="px-2 py-1 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                >
                  <div class="flex flex-col items-center gap-0.5">
                    <!-- <span class="font-medium">{{
                      getLockerInfo(reservation.lockerId).number
                    }}</span> -->
                    <span class="text-xs text-gray-600 dark:text-gray-300">{{
                      getLockerSizeDisplay(getLockerInfo(reservation.lockerId).size)
                    }}</span>
                  </div>
                </td>
                <td
                  class="px-2 py-1 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                >
                  {{ formatDate(reservation.startTime) }} ~ {{ formatDate(reservation.endTime) }}
                </td>
                <td class="px-2 py-1 text-center">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                      getStatusClass(reservation.status),
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        getStatusDotColor(reservation.status),
                      ]"
                    ></span>
                    <span class="leading-tight">{{ statusMap[reservation.status] }}</span>
                  </span>
                </td>
                <td class="px-2 py-1 text-center text-xs whitespace-nowrap">
                  <button class="text-primary dark:text-blue-400 hover:underline mr-2 font-medium">
                    보기
                  </button>
                  <button class="text-error dark:text-red-400 hover:underline font-medium">
                    취소
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 페이지네이션 -->
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'

// 중앙 데이터 스토어 사용
const dataStore = useDataStore()

// 메모이제이션: 스토어의 상태를 직접 사용
const reservations = computed(() => dataStore.reservations)
const customers = computed(() => dataStore.customers)
const lockers = computed(() => dataStore.lockers)

// 필터 상태
const statusFilter = ref('전체')
const searchQuery = ref('')
const lockerFilter = ref('')
const startDateFilter = ref('')
const endDateFilter = ref('')
const dateRangeMode = ref('all') // 'all' 또는 'custom'

// 정렬 상태
const sortBy = ref('eventId')
const sortDirection = ref('asc')

// 고객 맵 (메모이제이션: 빠른 조회를 위한 캐시)
const customerMap = computed(() => {
  const map = new Map()
  customers.value.forEach((c) => map.set(c.id, c))
  return map
})

// 사물함 맵 (메모이제이션: 빠른 조회를 위한 캐시)
const lockerMap = computed(() => {
  const map = new Map()
  lockers.value.forEach((l) => map.set(l.id, l))
  return map
})

// 고객 정보 조회 함수 (메모이제이션)
const getCustomerInfo = (customerId) => {
  return customerMap.value.get(customerId) || { name: '미정' }
}

// 사물함 정보 조회 함수 (메모이제이션)
const getLockerInfo = (lockerId) => {
  const locker = lockerMap.value.get(lockerId)
  return locker || { number: '-', size: '-', location: '-' }
}

// 사물함 크기 표시 함수
const getLockerSizeDisplay = (size) => {
  const sizeMap = {
    small: '소형',
    medium: '중형',
    large: '대형',
    extra_large: '특대형',
  }
  return sizeMap[size] || size || '-'
}

// 상태 맵핑 (영문 -> 한글) - 데이터베이스의 영문 상태를 화면에 표시할 때 사용
// 상태 정의:
// - active: 현재 사용 중 (행사 진행 중, 예약된 사물함에 짐이 있는 상태)
// - waiting: 승인 대기 중 (관리자의 승인을 기다리는 상태)
// - pending: 예정됨 (아직 시작되지 않은 예약, 향후 사용)
// - completed: 완료됨 (행사 종료, 사물함 회수 완료)
// - cancelled: 취소됨 (고객 요청 또는 행사 취소로 인한 예약 취소)
const statusMap = {
  active: '활성',
  waiting: '대기',
  pending: '예정',
  completed: '완료',
  cancelled: '취소',
}

// 한글 상태 -> 영문 상태 역맵 (사용자가 선택한 한글 상태를 데이터베이스에 저장할 때 변환)
const reverseStatusMap = {
  활성: 'active',
  대기: 'waiting',
  완료: 'completed',
  취소: 'cancelled',
  예정: 'pending',
}

// 통계 계산 (메모이제이션: 오늘 기준 미래 예약만 포함)
const stats = computed(() => {
  // 오늘 자정
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 오늘 날짜 (YYYY-MM-DD 형식)
  const todayStr = today.toISOString().split('T')[0]

  // 오늘 이후의 예약만 필터링
  const upcomingReservations = reservations.value.filter((r) => {
    const reservationDate = new Date(r.startTime)
    return reservationDate >= today
  })

  // 오늘 당일 활성 예약 계산 (날짜 기반)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const todayActiveReservations = reservations.value.filter((r) => {
    const startDate = new Date(r.startDateTime)
    const endDate = new Date(r.endDateTime)
    // 오늘 날짜에 예약이 활성 상태인지 확인
    return r.status === 'active' && startDate <= todayEnd && endDate >= today
  })

  // 상태별 통계 계산
  const waiting = upcomingReservations.filter((r) => r.status === 'waiting').length
  const completed = upcomingReservations.filter((r) => r.status === 'completed').length

  return {
    all: upcomingReservations.length,
    active: todayActiveReservations.length, // 오늘 당일 행사의 활성 예약 수
    waiting,
    completed,
  }
})

// 필터링된 예약 목록
const filteredReservations = computed(() => {
  let filtered = [...reservations.value]

  // 기간 필터링 로직
  if (dateRangeMode.value === 'all') {
    // 전체기간: 오늘 자정 이후의 예약만 조회
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    filtered = filtered.filter((r) => {
      const reservationDate = new Date(r.startTime)
      return reservationDate >= today
    })
  } else if (dateRangeMode.value === 'custom') {
    // 이전기간: 사용자가 지정한 기간으로 필터링
    if (startDateFilter.value) {
      const startDate = new Date(startDateFilter.value)
      filtered = filtered.filter((r) => {
        const reservationDate = new Date(r.startTime)
        return reservationDate >= startDate
      })
    }
    if (endDateFilter.value) {
      const endDate = new Date(endDateFilter.value)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((r) => {
        const reservationDate = new Date(r.startTime)
        return reservationDate <= endDate
      })
    }
  }

  // 상태 필터
  if (statusFilter.value !== '전체') {
    const statusCode = reverseStatusMap[statusFilter.value] || statusFilter.value
    filtered = filtered.filter((r) => r.status === statusCode)
  }

  // 검색 쿼리 (고객명, 고객ID, 핸드폰번호, 예약번호,  )
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((r) => {
      const customer = getCustomerInfo(r.customerId)
      const locker = getLockerInfo(r.lockerId)
      const phone = customer.phone || ''
      const customerId = customer.id || ''
      return (
        r.id.toLowerCase().includes(query) ||
        customer.name.toLowerCase().includes(query) ||
        customerId.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query)
      )
    })
  }

  // 사물함 구역 필터 (사물함 번호의 첫 문자로 구역 판단)
  // if (lockerFilter.value) {
  //   filtered = filtered.filter((r) => {
  //     const locker = getLockerInfo(r.lockerId)
  //     const section = locker.number.charAt(0)
  //     return section === lockerFilter.value
  //   })
  // }

  // 정렬 로직
  return filtered.sort((a, b) => {
    let aValue, bValue

    if (sortBy.value === 'startTime') {
      aValue = new Date(a.startTime)
      bValue = new Date(b.startTime)
    } else if (sortBy.value === 'id') {
      aValue = a.id
      bValue = b.id
    } else if (sortBy.value === 'eventId') {
      aValue = a.eventId
      bValue = b.eventId
    } else if (sortBy.value === 'customerId') {
      aValue = getCustomerInfo(a.customerId).name
      bValue = getCustomerInfo(b.customerId).name
    } else if (sortBy.value === 'lockerNumber') {
      aValue = getLockerInfo(a.lockerId).number
      bValue = getLockerInfo(b.lockerId).number
    } else if (sortBy.value === 'status') {
      aValue = a.status
      bValue = b.status
    } else {
      aValue = a[sortBy.value]
      bValue = b[sortBy.value]
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })
})

// 날짜 포맷 함수
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 기간 계산 함수
const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '-'
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end - start
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  return `${diffHours}시간`
}

// 상태 클래스 반환
const getStatusClass = (status) => {
  const classes = {
    active: 'bg-blue-100 text-primary dark:bg-blue-500/20 dark:text-blue-400',
    waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  }
  return classes[status] || classes.pending
}

// 상태 도트 색상
const getStatusDotColor = (status) => {
  const colors = {
    active: 'bg-primary',
    waiting: 'bg-warning',
    completed: 'bg-green-600',
    cancelled: 'bg-red-600',
    pending: 'bg-gray-600',
  }
  return colors[status] || colors.pending
}

// 정렬 토글 함수
const toggleSort = (column) => {
  if (sortBy.value === column) {
    // 같은 컬럼을 클릭하면 정렬 방향 토글
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 다른 컬럼을 클릭하면 새로운 컬럼으로 정렬 (기본값: desc)
    sortBy.value = column
    sortDirection.value = 'desc'
  }
}

// 기간 필터 적용 (조회 버튼 클릭)
const applyDateFilter = () => {
  // filteredReservations computed property가 자동으로 반응
  // 버튼 클릭 시 이미 startDateFilter, endDateFilter가 업데이트되어 있으므로
  // computed property가 자동으로 재계산됨
  console.log('기간 조회:', startDateFilter.value, '~', endDateFilter.value)
}

// 필터 초기화
const resetFilters = () => {
  statusFilter.value = '전체'
  searchQuery.value = ''
  lockerFilter.value = ''
  startDateFilter.value = ''
  endDateFilter.value = ''
  dateRangeMode.value = 'all'
}
</script>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
