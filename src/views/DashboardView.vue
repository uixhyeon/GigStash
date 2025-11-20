<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <h1 class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">ChillBox 관리자 대시보드</h1>

    <!-- 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">주요 통계</h2>
      <div v-if="statsLoading" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm">통계 로딩 중...</div>
      <div v-else-if="statsError" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-red-500">{{ statsError }}</div>
      <div v-else class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
          <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">전체 사물함</div>
          <div class="text-3xl font-bold text-[#296AF1]">{{ dashboardStats.totalLockers }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
          <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">사용 중</div>
          <div class="text-3xl font-bold text-[#296AF1]">{{ dashboardStats.inUseLockers }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
          <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">사용 가능</div>
          <div class="text-3xl font-bold text-[#296AF1]">{{ dashboardStats.availableLockers }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
          <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">사용률</div>
          <div class="text-3xl font-bold text-[#296AF1]">{{ dashboardStats.usageRate }}%</div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
          <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">오늘 예약</div>
          <div class="text-3xl font-bold text-[#296AF1]">{{ dashboardStats.todayReservations }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
          <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">활성 예약</div>
          <div class="text-3xl font-bold text-[#296AF1]">{{ dashboardStats.activeReservations }}</div>
        </div>
      </div>
    </section>

    <!-- 사물함 목록 -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">사물함 현황</h2>
        <div>
          <select
            v-model="lockerFilter"
            @change="fetchLockers"
            class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-base bg-white dark:bg-slate-700 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296AF1] focus:ring-offset-2"
          >
            <option value="">전체</option>
            <option value="available">사용 가능</option>
            <option value="in-use">사용 중</option>
            <option value="maintenance">점검 중</option>
            <option value="broken">고장</option>
          </select>
        </div>
      </div>

      <div v-if="lockersLoading" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400">사물함 로딩 중...</div>
      <div v-else-if="lockersError" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-red-500">{{ lockersError }}</div>
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        <div
          v-for="locker in lockers"
          :key="locker.id"
          class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex justify-between items-center mb-4">
            <span class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ locker.number }}</span>
            <StatusChip :status="locker.status" />
          </div>
          <div>
            <div class="flex justify-between mb-2 text-sm">
              <span class="text-slate-600 dark:text-slate-400">크기:</span>
              <span class="text-slate-900 dark:text-slate-100 font-medium">{{ getSizeLabel(locker.size) }}</span>
            </div>
            <div class="flex justify-between mb-2 text-sm">
              <span class="text-slate-600 dark:text-slate-400">위치:</span>
              <span class="text-slate-900 dark:text-slate-100 font-medium">{{ locker.location }}</span>
            </div>
            <div v-if="locker.temperature" class="flex justify-between mb-2 text-sm">
              <span class="text-slate-600 dark:text-slate-400">온도:</span>
              <span class="text-slate-900 dark:text-slate-100 font-medium">{{ locker.temperature }}°C</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 최근 예약 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">최근 예약</h2>
      <div v-if="reservationsLoading" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400">예약 로딩 중...</div>
      <div v-else-if="reservationsError" class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-red-500">{{ reservationsError }}</div>
      <table v-else class="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <thead class="bg-slate-200 dark:bg-slate-700">
          <tr>
            <th class="px-4 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">예약번호</th>
            <th class="px-4 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">고객명</th>
            <th class="px-4 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">사물함</th>
            <th class="px-4 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">시작시간</th>
            <th class="px-4 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">종료시간</th>
            <th class="px-4 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in recentReservations" :key="reservation.id">
            <td class="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">{{ reservation.id }}</td>
            <td class="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">{{ reservation.customerName }}</td>
            <td class="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">{{ reservation.lockerNumber }}</td>
            <td class="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">{{ formatDateTime(reservation.startTime) }}</td>
            <td class="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">{{ formatDateTime(reservation.endTime) }}</td>
            <td class="px-4 py-4 text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">
              <StatusChip :status="getReservationStatus(reservation.status)" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { lockerService } from '@/api/lockerService'
import { reservationService } from '@/api/reservationService'
import { statsService } from '@/api/statsService'
import StatusChip from '@/components/common/StatusChip.vue'

// 상태 관리
const dashboardStats = ref({})
const lockers = ref([])
const recentReservations = ref([])
const lockerFilter = ref('')

// 로딩 상태
const statsLoading = ref(false)
const lockersLoading = ref(false)
const reservationsLoading = ref(false)

// 에러 상태
const statsError = ref(null)
const lockersError = ref(null)
const reservationsError = ref(null)

// 통계 조회
const fetchDashboardStats = async () => {
  statsLoading.value = true
  statsError.value = null

  try {
    const response = await statsService.getDashboard()
    dashboardStats.value = response.data
  } catch (err) {
    statsError.value = '통계를 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    statsLoading.value = false
  }
}

// 사물함 조회
const fetchLockers = async () => {
  lockersLoading.value = true
  lockersError.value = null

  try {
    const params = {}
    if (lockerFilter.value) {
      params.status = lockerFilter.value
    }

    const response = await lockerService.getAll(params)
    lockers.value = response.data
  } catch (err) {
    lockersError.value = '사물함 목록을 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    lockersLoading.value = false
  }
}

// 예약 조회
const fetchReservations = async () => {
  reservationsLoading.value = true
  reservationsError.value = null

  try {
    const response = await reservationService.getAll()
    // 최근 10개만 표시
    recentReservations.value = response.data.slice(0, 10)
  } catch (err) {
    reservationsError.value = '예약 목록을 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    reservationsLoading.value = false
  }
}

// 유틸리티 함수
const getSizeLabel = (size) => {
  const sizeMap = {
    small: '소형',
    medium: '중형',
    large: '대형',
  }
  return sizeMap[size] || size
}

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

// 초기 데이터 로드
onMounted(() => {
  fetchDashboardStats()
  fetchLockers()
  fetchReservations()
})
</script>
