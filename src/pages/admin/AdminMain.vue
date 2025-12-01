<template>
  <div class="p-6 bg-slate-50 dark:bg-slate-900 h-[100vh - 64px] scrollbar-hide">
    <!-- <h1 class="text-3xl font-bold mb-8" style="color: #1e293b">Main Home</h1> -->

    <!-- 통계 카드 -->
    <div class="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
          당일 보관함 현황
        </h2>

        <div
          v-if="loading"
          class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          통계 로딩 중...
        </div>
        <div v-else class="grid grid-cols-2 gap-3 mb-4">
          <!-- 미사용 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  미사용
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400"
                >
                  {{ stats.available }}
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  현재 가용
                </div>
              </div>
              <i class="fi fi-rr-box text-lg sm:text-xl flex-shrink-0" style="color: #3b82f6"></i>
            </div>
          </div>

          <!-- 사용중 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-amber-100 dark:border-amber-900/30"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  사용중
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-amber-600 dark:text-amber-400"
                >
                  {{ stats.inUse }}
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  현재 사용 중
                </div>
              </div>
              <i class="fi fi-rr-lock text-lg sm:text-xl flex-shrink-0" style="color: #d97706"></i>
            </div>
          </div>

          <!-- 사용률 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-green-100 dark:border-green-900/30"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  사용률
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-green-600 dark:text-green-400"
                >
                  {{ stats.usageRate }}%
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  오늘의 사용률
                </div>
              </div>
              <i
                class="fi fi-rr-chart-pie text-lg sm:text-xl flex-shrink-0"
                style="color: #16a34a"
              ></i>
            </div>
          </div>

          <!-- 활성 예약 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-purple-100 dark:border-purple-900/30 col-span-2 sm:col-span-1"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  활성 예약
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-purple-600 dark:text-purple-400"
                >
                  {{ stats.activeReservations }}
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  진행 중인 예약
                </div>
              </div>
              <i
                class="fi fi-rr-calendar-check text-lg sm:text-xl flex-shrink-0"
                style="color: #a855f7"
              ></i>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
          고객 참여도
        </h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <!-- 일일 활성 사용자 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  일일 활성 사용자
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400"
                >
                  {{ dailyActiveUsers }}
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  어제 대비 <span class="text-blue-600 dark:text-blue-400 font-medium">+12%</span>
                </div>
              </div>
              <i class="fi fi-rr-users text-lg sm:text-xl flex-shrink-0" style="color: #3b82f6"></i>
            </div>
          </div>

          <!-- 재방문율 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-amber-100 dark:border-amber-900/30"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  재방문율
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-amber-600 dark:text-amber-400"
                >
                  {{ repeatVisitRate }}%
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  지난달 대비
                  <span class="text-amber-600 dark:text-amber-400 font-medium">+5.2%</span>
                </div>
              </div>
              <i
                class="fi fi-rr-rotate-clockwise text-lg sm:text-xl flex-shrink-0"
                style="color: #d97706"
              ></i>
            </div>
          </div>

          <!-- 신규 고객 비율 -->
          <div
            class="p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-green-100 dark:border-green-900/30 col-span-2 sm:col-span-1"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0 flex-1">
                <div
                  class="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
                >
                  신규 고객
                </div>
                <div
                  class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-green-600 dark:text-green-400"
                >
                  {{ newCustomerCount }}
                </div>
                <div class="text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  이번달 신규 ({{ newCustomerPercentage }}%)
                </div>
              </div>
              <i
                class="fi fi-rr-user-add text-lg sm:text-xl flex-shrink-0"
                style="color: #16a34a"
              ></i>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!--통계 카드 끝 =============================================================================================================== -->

    <!-- 좌측: 최근 예약 테이블 + 차트 (2칼럼) -->
    <div class="lg:col-span-2">
      <!-- 테이블과 차트 그리드 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 최근 예약 테이블 -->
        <section>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
            최근 예약
          </h2>
          <div
            v-if="loading"
            class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            예약 로딩 중...
          </div>
          <div v-if="!loading" class="max-w-full overflow-x-auto scrollbar-hide">
            <table
              class="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden text-[10px] sm:text-xs min-w-max"
              style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
            >
              <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
                <tr>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    ID
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    이벤트 ID
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    보관함 ID
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    보관함명
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    보관 시작시간
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    고객명
                  </th>
                  <!-- <th
                  class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                >
                  접근코드
                </th> -->
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="reservation in recentReservations.slice(0, 6)"
                  :key="reservation.id"
                  class="border-t border-slate-200 dark:border-slate-700 h-8 sm:h-10"
                >
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.id }}
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.eventId }}
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.lockerId }}
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.lockerNumber }}
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ formatDateTime(reservation.createdAt) }}
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.customerName }}
                  </td>
                  <!-- <td
                  class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                >
                  {{ reservation.accessCode }}
                </td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 차트 영역 -->
        <section>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
            보관함 상태 분포
          </h2>

          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="h-64">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useDataStore } from '@/stores/dataStore'
import ComStatusChip from '@/components/common/ComStatusChip.vue'
import ComCard from '@/components/common/ComCard.vue'

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// 중앙 데이터 스토어 사용
const dataStore = useDataStore()

// 메모이제이션: 스토어의 상태를 직접 사용
const reservations = computed(() => dataStore.reservations)
const customers = computed(() => dataStore.customers)
const loading = computed(() => dataStore.isLoading)

// Firebase Firestore에서 로드된 사물함 데이터 사용
const lockers = computed(() => dataStore.lockers)

// 통계 계산
const stats = computed(() => {
  const total = lockers.value.length
  const available = lockers.value.filter((l) => l.status === 'available').length
  const inUse = lockers.value.filter((l) => l.status === 'in-use').length
  const activeReservations = reservations.value.filter((r) => r.status === 'active').length
  const usageRate = total > 0 ? Math.round((inUse / total) * 100) : 0

  return {
    available,
    inUse,
    usageRate,
    activeReservations,
    totalCustomers: customers.value.length,
  }
})

// 고객 맵 (메모이제이션: 빠른 조회를 위한 캐시)
const customerMap = computed(() => {
  const map = new Map()
  customers.value.forEach((c) => map.set(c.id, c))
  return map
})

// 최근 예약 목록 (메모이제이션)
const recentReservations = computed(() => {
  return [...reservations.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((res) => {
      const customer = customerMap.value.get(res.customerId)
      return {
        ...res,
        customerName: customer?.name || '고객정보없음',
      }
    })
    .slice(0, 6)
})

// 현재 사용중인 고객 정보 (메모이제이션)
const activeCustomers = computed(() => {
  const activeRes = reservations.value.filter((r) => r.status === 'active')
  return activeRes.map((res) => {
    const customer = customerMap.value.get(res.customerId)
    return {
      ...customer,
      lockerNumber: res.lockerNumber,
    }
  })
})

// 보관함 상태 차트 데이터 (stats 데이터 재사용)
const chartData = computed(() => {
  return {
    labels: ['미사용', '사용중', '정비중', '고장'],
    datasets: [
      {
        label: '보관함 수',
        data: [
          stats.value.available,
          stats.value.inUse,
          // 정비중과 고장 상태는 lockers.json 데이터에서 직접 계산
          lockers.value.filter((l) => l.status === 'maintenance').length,
          lockers.value.filter((l) => l.status === 'broken').length,
        ],
        backgroundColor: ['#007aff', '#000000', '#ff9500', '#ff3b30'],
        borderRadius: 8,
      },
    ],
  }
})

// 차트 옵션
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
}

// 고객 참여도 지표
const dailyActiveUsers = computed(() => {
  // 활성 예약 건수를 일일 활성 사용자 수로 계산
  const activeCount = reservations.value.filter((r) => r.status === 'active').length
  return Math.max(activeCount, 0)
})

// 재방문율 (메모이제이션: 스토어의 고객별 예약 수 사용)
const repeatVisitRate = computed(() => {
  if (customers.value.length === 0) return 0
  const repeatCustomers = Array.from(dataStore.customerReservationCount.values()).filter(
    (count) => count >= 2,
  ).length
  const rate = customers.value.length > 0 ? (repeatCustomers / customers.value.length) * 100 : 0
  return Math.round(rate)
})

const newCustomerCount = computed(() => {
  // 최근 30일 내 가입한 고객 수
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return customers.value.filter((customer) => {
    const createdDate = new Date(customer.createdAt || 0)
    return createdDate >= thirtyDaysAgo
  }).length
})

const newCustomerPercentage = computed(() => {
  if (customers.value.length === 0) return 0
  const rate = (newCustomerCount.value / customers.value.length) * 100
  return Math.round(rate)
})

// 유틸리티 함수
const getReservationStatus = (status) => {
  const statusMap = {
    active: 'in-use',
    completed: 'available',
    cancelled: 'broken',
    expired: 'maintenance',
  }
  return statusMap[status] || status
}

const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getMembershipLabel = (level) => {
  const labels = {
    platinum: '플래티넘',
    gold: '골드',
    silver: '실버',
    bronze: '브론즈',
  }
  return labels[level] || level
}

const getMembershipClass = (level) => {
  const classes = {
    platinum: 'bg-black text-white',
    gold: 'bg-yellow-400 text-black',
    silver: 'bg-gray-300 text-black',
    bronze: 'bg-orange-600 text-white',
  }
  return classes[level] || 'bg-gray-200 text-black'
}

// 스토어에서 데이터를 가져오므로 별도의 로드가 필요 없음
// App.vue에서 초기화할 때 이미 로드됨
onMounted(() => {
  // 필요시 추가 초기화 작업
})
</script>
