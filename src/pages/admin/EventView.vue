<template>
  <div class="px-6 bg-slate-50 dark:bg-slate-900 h-[calc(100vh-130px)] scrollbar-hide">
    <!-- 달력과 테이블 병렬 레이아웃 -->
    <div
      class="grid grid-cols-1 xl:grid-cols-6 2xl:grid-cols-7 gap-10 flex-1 w-full min-h-0"
      style="margin-left: auto; margin-right: auto"
    >
      <!-- 달력 섹션 -->
      <div class="xl:col-span-2 2xl:col-span-3 flex flex-col min-h-0">
        <ComEventCalendar
          v-model:current-date="currentDate"
          v-model:selected-date="selectedDate"
          :events="events"
        />
      </div>

      <!-- 필터 및 테이블 섹션 -->
      <div class="xl:col-span-4 2xl:col-span-4 flex flex-col min-h-0">
        <!-- 행사 목록 헤더 (제목 + 필터) -->
        <div class="flex justify-between gap-4 mb-4 items-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-table-header-text">행사 목록</h3>

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
                <option value="취소">취소</option>
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

            <!-- 필터 초기화 버튼 -->
            <button
              @click="resetFilters"
              class="px-3 py-1.5 bg-transparent hover:bg-primary hover:text-white rounded-lg transition-all text-primary dark:text-primary font-medium text-xs flex-shrink-0 border border-primary"
              title="필터 초기화"
            >
              <i class="fi fi-br-refresh mr-1"></i>초기화
            </button>
          </div>
        </div>
        <!-- 행사 list =============================================================-->
        <div
          class="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm max-w-full flex-1 flex flex-col min-h-0 overflow-y-auto"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          <div class="overflow-x-auto scrollbar-hide w-full">
            <table class="w-full text-xs min-w-max">
              <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
                <tr class="h-10 -mx-6">
                  <th
                    class="px-6 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark rounded-tl-2xl whitespace-nowrap"
                  >
                    No
                  </th>
                  <th
                    class="px-6 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    ID
                  </th>
                  <th
                    class="px-6 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap max-w-32"
                  >
                    행사명
                  </th>
                  <th
                    class="px-6 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap w-48"
                  >
                    행사장소
                  </th>
                  <th
                    class="px-6 py-3 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
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
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    행사 시간
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    상태
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
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
                    class="px-2 py-2 text-center font-semibold cursor-pointer hover:opacity-80 transition-all text-table-header-text dark:text-table-header-text-dark rounded-tr-2xl whitespace-nowrap"
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
                    colspan="9"
                    class="px-4 py-8 text-center text-gray-500 dark:text-dark-text-tertiary"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="(event, index) in filteredEvents"
                  :key="event.id"
                  :class="[
                    'border-t border-gray-200 dark:border-dark-border cursor-pointer transition-colors group h-10',
                    event.status === '취소'
                      ? 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50',
                  ]"
                  @dblclick="openEventModal(event)"
                >
                  <td
                    class="px-2 py-1 text-center text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                  >
                    {{ index + 1 }}
                  </td>
                  <td
                    class="px-2 py-1 text-center font-mono text-gray-700 dark:text-dark-text-secondary group-hover:dark:text-gray-700 whitespace-nowrap"
                  >
                    {{ event.id }}
                  </td>
                  <td
                    :class="[
                      'px-2 py-1 text-left text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 max-w-32 truncate',
                      event.status === '취소' ? 'line-through' : '',
                    ]"
                    :title="event.name"
                  >
                    {{ event.name }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-gray-700 dark:text-dark-text-secondary group-hover:dark:text-gray-700 whitespace-nowrap w-48"
                  >
                    {{ event.venue }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-gray-700 dark:text-dark-text-secondary group-hover:dark:text-gray-700 whitespace-nowrap"
                  >
                    {{ event.startDate }}
                  </td>
                  <td
                    class="px-2 py-1 text-left text-gray-700 dark:text-dark-text-secondary group-hover:dark:text-gray-700 whitespace-nowrap"
                  >
                    {{ event.performanceTime }}
                  </td>
                  <td class="px-2 py-1 text-center whitespace-nowrap">
                    <ComStatusChip :status="event.status" />
                  </td>
                  <td
                    class="px-2 py-1 text-center text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
                  >
                    {{ event.busCount }}대
                  </td>
                  <td
                    class="px-2 py-1 text-center text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900 whitespace-nowrap"
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
    <EventDetailModal
      v-if="isModalOpen"
      :event="selectedEventDetail"
      @close="closeEventModal"
      @status-change="handleStatusChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import EventDetailModal from '@/components/EventDetailModal.vue'
import ComStatusChip from '@/components/common/ComStatusChip.vue'
import ComEventCalendar from '@/components/common/ComEventCalendar.vue'

const dataStore = useDataStore()

// 현재 월
const currentDate = ref(new Date())

// 선택된 날짜
const selectedDate = ref(null)

// 검색 및 필터
const searchQuery = ref('')
const statusFilter = ref('전체')
const monthFilter = ref('')

const normalizeStatus = (startDate, endDate, originalStatus) => {
  // 원본 데이터에 "취소" 상태가 있으면 그대로 사용
  if (originalStatus === '취소') return '취소'

  // 그 외에는 날짜 기준으로 자동 계산
  const today = new Date().setHours(0, 0, 0, 0)
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(0, 0, 0, 0)

  if (today < start) return '예정'
  if (today > end) return '종료'
  return '진행 중'
}

// 행사별 배차 차량 수 조회 (vehicles와 조인)
const getVehicleCountByEvent = (eventId) => {
  return dataStore.getVehicleCountByEventId(eventId)
}

// dataStore의 행사 데이터를 UI 형식으로 변환
const events = computed(() =>
  dataStore.events.map((event) => ({
    id: event.id,
    name: event.eventName,
    startDate: event.eventDate,
    endDate: event.eventDate,
    status: normalizeStatus(event.eventDate, event.eventDate, event.status),
    participants: 0,
    busCount: getVehicleCountByEvent(event.id),
    reservations: dataStore.getReservationCountByEventId(event.id),
    venue: event.eventVenue,
    type: event.eventType,
    performanceTime: event.performanceTime || '',
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

// 상태 변경 핸들러
const handleStatusChange = (newStatus) => {
  if (selectedEventDetail.value) {
    const eventId = selectedEventDetail.value.id

    // dataStore의 event 데이터 업데이트 (영속성 유지)
    try {
      dataStore.updateEvent(eventId, { status: newStatus })

      // UI 업데이트 (events 배열과 selectedEventDetail)
      const eventIndex = events.value.findIndex((e) => e.id === eventId)
      if (eventIndex !== -1) {
        events.value[eventIndex].status = newStatus
        selectedEventDetail.value.status = newStatus
      }
    } catch (error) {
      console.error('행사 상태 업데이트 실패:', error)
    }
  }
}

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

// 필터 초기화
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = '전체'
  monthFilter.value = ''
  selectedDate.value = null
}
</script>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none !important; /* Chrome, Safari, Opera */
  width: 0 !important;
  height: 0 !important;
}

.scrollbar-hide::-webkit-scrollbar-track {
  display: none !important;
}

.scrollbar-hide::-webkit-scrollbar-thumb {
  display: none !important;
}
</style>
