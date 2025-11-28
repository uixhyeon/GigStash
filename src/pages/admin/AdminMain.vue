<template>
  <div class="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- <h1 class="text-3xl font-bold mb-8" style="color: #1e293b">Main Home</h1> -->

    <!-- 통계 카드 -->
    <section class="mb-12">
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
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="미사용"
          :value="stats.available"
          icon="fi-rr-box"
          variant="gradient-blue"
        />
        <StatCard label="사용중" :value="stats.inUse" icon="fi-rr-lock" variant="gradient-black" />
        <StatCard
          label="사용률"
          :value="`${stats.usageRate}%`"
          icon="fi-rr-chart-pie"
          variant="gradient-blue"
        />
        <StatCard
          label="활성 예약"
          :value="stats.activeReservations"
          icon="fi-rr-calendar-check"
          variant="gradient-black"
        />
        <div class="hidden lg:block">
          <StatCard
            label="총 고객"
            :value="stats.totalCustomers"
            icon="fi-rr-users"
            variant="gradient-blue"
          />
        </div>
      </div>
    </section>

    <!-- 두 컬럼 레이아웃 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <!-- 좌측: 최근 예약 + 차트 -->
      <div>
        <!-- 최근 예약 테이블 -->
        <section class="mb-8">
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
              class="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden text-xs min-w-max"
              style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
            >
              <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
                <tr>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    ID
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    보관함 ID
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    보관함명
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    보관 시작시간
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    고객명
                  </th>
                  <th
                    class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    접근코드
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="reservation in recentReservations.slice(0, 6)"
                  :key="reservation.id"
                  class="border-t border-slate-200 dark:border-slate-700 h-10"
                >
                  <td
                    class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.id }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.lockerId }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.lockerNumber }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ formatDateTime(reservation.createdAt) }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.customerName }}
                  </td>
                  <td
                    class="px-2 py-1 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ reservation.accessCode }}
                  </td>
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

      <!-- 우측: 회원 등급별 현황 + 사용 고객 목록 -->
      <div>
        <!-- 회원 등급별 현황 -->
        <section class="mb-8">
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
            회원 등급별 현황
          </h2>
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div class="h-60">
              <Doughnut :data="membershipChartData" :options="doughnutChartOptions" />
            </div>
          </div>
        </section>
        <!-- 사용 고객 목록 -->
        <section>
          <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
            현재 사용 고객
          </h2>
          <div
            v-if="loading"
            class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            고객 정보 로딩 중...
          </div>
          <div
            v-else
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden max-w-full"
          >
            <div class="max-w-full overflow-x-auto scrollbar-hide">
              <table class="w-full text-xs min-w-max">
                <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
                  <tr>
                    <th
                      class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                    >
                      고객명
                    </th>
                    <th
                      class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                    >
                      보관함
                    </th>
                    <th
                      class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                    >
                      등급
                    </th>
                    <th
                      class="px-2 py-2 text-center font-semibold text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                    >
                      전화번호
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="customer in activeCustomers.slice(0, 6)"
                    :key="customer.id"
                    class="border-t border-slate-200 dark:border-slate-700 h-10"
                  >
                    <td class="px-2 py-1 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {{ customer.name }}
                    </td>
                    <td class="px-2 py-1 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {{ customer.lockerNumber }}
                    </td>
                    <td class="px-2 py-1 whitespace-nowrap">
                      <span
                        class="px-2 py-0.5 rounded-full text-xs font-medium inline-block"
                        :class="getMembershipClass(customer.membershipLevel)"
                      >
                        {{ getMembershipLabel(customer.membershipLevel) }}
                      </span>
                    </td>
                    <td class="px-2 py-1 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {{ customer.phone }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import StatusChip from '@/components/common/StatusChip.vue'
import StatCard from '@/components/common/StatCard.vue'
import lockersData from '@/data/lockers.json'
import reservationsData from '@/data/reservations.json'
import customersData from '@/data/customers.json'

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// 로딩 상태
const loading = ref(true)

// 데이터
const lockers = ref([])
const reservations = ref([])
const customers = ref([])

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

// 최근 예약 목록
const recentReservations = computed(() => {
  return [...reservations.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((res) => {
      const customer = customers.value.find((c) => c.id === res.customerId)
      return {
        ...res,
        customerName: customer?.name || '고객정보없음',
      }
    })
    .slice(0, 6)
})

// 현재 사용중인 고객 정보
const activeCustomers = computed(() => {
  const activeRes = reservations.value.filter((r) => r.status === 'active')
  return activeRes.map((res) => {
    const customer = customers.value.find((c) => c.id === res.customerId)
    return {
      ...customer,
      lockerNumber: res.lockerNumber,
    }
  })
})

// 보관함 상태 차트 데이터
const chartData = computed(() => {
  const statusCounts = {
    available: 0,
    'in-use': 0,
    maintenance: 0,
    broken: 0,
  }

  lockers.value.forEach((locker) => {
    if (statusCounts[locker.status] !== undefined) {
      statusCounts[locker.status]++
    }
  })

  return {
    labels: ['미사용', '사용중', '정비중', '고장'],
    datasets: [
      {
        label: '보관함 수',
        data: [
          statusCounts.available,
          statusCounts['in-use'],
          statusCounts.maintenance,
          statusCounts.broken,
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

// 회원 등급별 차트 데이터
const membershipChartData = computed(() => {
  const membershipCounts = {
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  }

  customers.value.forEach((customer) => {
    if (membershipCounts[customer.membershipLevel] !== undefined) {
      membershipCounts[customer.membershipLevel]++
    }
  })

  return {
    labels: ['플래티넘', '골드', '실버', '브론즈'],
    datasets: [
      {
        data: [
          membershipCounts.platinum,
          membershipCounts.gold,
          membershipCounts.silver,
          membershipCounts.bronze,
        ],
        backgroundColor: ['#000000', '#ffd700', '#c0c0c0', '#cd7f32'],
      },
    ],
  }
})

// 도넛 차트 옵션
const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

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

// 데이터 로드
const loadData = () => {
  loading.value = true
  try {
    lockers.value = lockersData.lockers
    reservations.value = reservationsData.reservations
    customers.value = customersData.customers
  } finally {
    loading.value = false
  }
}

// 초기 데이터 로드
onMounted(() => {
  loadData()
})
</script>
