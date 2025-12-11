<template>
  <div class="px-6 bg-slate-50 dark:bg-slate-900 h-[calc(100vh-130px)] scrollbar-hide">
    <!-- <h1 class="text-3xl font-bold mb-8" style="color: #1e293b">Main Home</h1> -->

    <!-- 전체 공지 사항 ===============================================================-->
    <div class="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section class="flex flex-col">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
          전체 공지 사항
          <i class="fi fi-rr-info text-lg align-middle flex-shrink-0"></i>
        </h2>

        <div
          class="flex-1 max-w-full overflow-hidden rounded-2xl"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          <div class="h-full overflow-y-auto scrollbar-hide bg-white dark:bg-slate-800 rounded-2xl">
            <table class="w-full text-[10px] sm:text-xs min-w-max">
              <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark z-10">
                <tr>
                  <th
                    class="ml-2 text-left px-1 sm:px-2 py-1 sm:py-2 font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    No.
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    제목
                  </th>
                  <th
                    class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    등록일
                  </th>
                  <th
                    class="text-right px-1 sm:px-2 py-1 sm:py-2 font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                  >
                    <i
                      class="fi fi-br-plus text-md align-middle mr-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      @click="openAddNoticeModal"
                    ></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(notice, index) in notices"
                  :key="notice.id"
                  class="border-t border-slate-200 dark:border-slate-700 h-8 sm:h-10 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  @click="openNoticeDetail(notice)"
                >
                  <td
                    class="text-left px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ index + 1 }}
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-left text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    <span>{{ notice.title }}</span>
                    <span
                      v-if="isNewNotice(notice.createdAt) && !notice.isRead"
                      class="ml-2 text-[8px] sm:text-[10px] font-bold text-red-500"
                    >
                      New
                    </span>
                  </td>
                  <td
                    class="px-1 sm:px-2 py-0.5 sm:py-1 text-center text-[9px] sm:text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap"
                  >
                    {{ formatDateTime(notice.createdAt) }}
                  </td>
                  <td class="px-1 sm:px-2 py-0.5 sm:py-1 text-right"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!--  END OF 전체 공지 사항 ===============================================================-->

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
        <div v-else class="grid grid-cols-2 gap-3 mb-5">
          <!-- 사용중 ==========================-->

          <ComCard
            label="사용중"
            :value="stats.inUse + '건'"
            icon="fi-rs-calendar-check"
            variant="blue"
            layout="horizontal"
          />
          <!-- 사용률 ============================-->

          <ComCard
            label="사용률"
            :value="stats.usageRate + ' %'"
            icon="fi-rr-chart-pie"
            variant="green"
            layout="horizontal"
          />
        </div>

        <!--  ==================================================================== -->

        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-table-header-text">
          고객 분석
        </h2>
        <div
          v-if="loading"
          class="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
          style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
        >
          통계 로딩 중...
        </div>
        <div v-else class="grid grid-cols-2 gap-3 mb-5">
          <!-- 현재 이용자 수 -->

          <ComCard
            label="이용자 수"
            :value="stats.inUse"
            icon="fi-rr-chart-pie"
            variant="puple"
            layout="horizontal"
          />

          <ComCard
            label="이용률"
            :value="stats.usageRate + ' %'"
            icon="fi-rr-users"
            variant="black"
            layout="horizontal"
          />
        </div>
      </section>
    </div>
    <!-- =============================================================================================================== -->

    <!--   최근 예약 테이블 + 차트 (2칼럼) -->
    <div class="lg:col-span-2">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 최근 예약 테이블  ===========================================-->
        <section class="flex flex-col">
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
          <div
            v-if="!loading"
            class="flex-1 max-w-full overflow-hidden rounded-2xl"
            style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)"
          >
            <div
              class="h-full overflow-y-auto scrollbar-hide bg-white dark:bg-slate-800 rounded-2xl"
            >
              <table class="w-full text-[10px] sm:text-xs min-w-max">
                <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark z-10">
                  <tr>
                    <th
                      class="px-1 sm:px-2 py-1 sm:py-2 text-center font-semibold text-[9px] sm:text-xs text-table-header-text dark:text-table-header-text-dark whitespace-nowrap"
                    >
                      예약 ID
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
                    v-for="reservation in recentReservations"
                    :key="reservation.id"
                    class="border-t border-slate-200 dark:border-slate-700 h-8 sm:h-10 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
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

    <!-- 공지사항 추가 모달 -->
    <div
      v-if="showAddNoticeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeAddNoticeModal"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">공지사항 추가</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                제목
              </label>
              <input
                v-model="newNotice.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                내용
              </label>
              <textarea
                v-model="newNotice.content"
                rows="8"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                placeholder="공지사항 내용을 입력하세요"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                등록자
              </label>
              <input
                v-model="newNotice.author"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="addNotice"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              등록
            </button>
            <button
              @click="closeAddNoticeModal"
              class="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 공지사항 상세보기 모달 -->
    <div
      v-if="showNoticeModal && selectedNotice"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeNoticeModal"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white pr-4">
              {{ selectedNotice.title }}
            </h3>
            <button
              @click="closeNoticeModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <i class="fi fi-rr-cross text-xl"></i>
            </button>
          </div>

          <div class="space-y-4 mb-6">
            <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span class="font-medium">등록자:</span>
                <span class="ml-2">{{ selectedNotice.author }}</span>
              </div>
              <div>
                <span class="font-medium">등록일:</span>
                <span class="ml-2">{{ selectedNotice.createdAt }}</span>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-slate-700 pt-4">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {{ selectedNotice.content }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              v-if="isOwnNotice(selectedNotice)"
              @click="openEditNoticeModal(selectedNotice)"
              class="px-6 py-3 bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
            >
              수정
            </button>
            <button
              v-if="isOwnNotice(selectedNotice)"
              @click="deleteNotice(selectedNotice.id)"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 공지사항 수정 모달 -->
    <div
      v-if="showEditNoticeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditNoticeModal"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">공지사항 수정</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                제목
              </label>
              <input
                v-model="editNotice.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                내용
              </label>
              <textarea
                v-model="editNotice.content"
                rows="8"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                placeholder="공지사항 내용을 입력하세요"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                등록자
              </label>
              <input
                v-model="editNotice.author"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="updateNotice"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              저장
            </button>
            <button
              @click="closeEditNoticeModal"
              class="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
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

// 공지사항 데이터
const notices = ref([
  {
    id: 1,
    title: '시스템 점검 안내',
    content:
      '2024년 12월 10일 새벽 2시부터 4시까지 시스템 점검이 예정되어 있습니다. 해당 시간 동안 서비스 이용이 제한될 수 있습니다.',
    author: '관리자',
    createdAt: '2024-12-04 14:30:00',
    isRead: false,
  },
  {
    id: 2,
    title: '새로운 기능 업데이트',
    content:
      'GigStash에 새로운 예약 알림 기능이 추가되었습니다. 예약 시간 30분 전에 자동으로 알림을 받아보실 수 있습니다.',
    author: '운영팀',
    createdAt: '2024-12-03 10:15:00',
    isRead: false,
  },
  {
    id: 3,
    title: '연말 이벤트 안내',
    content:
      '12월 한 달간 모든 회원님들께 특별 할인 혜택을 제공합니다. 자세한 내용은 이벤트 페이지를 확인해주세요.',
    author: '마케팅팀',
    createdAt: '2024-12-01 09:00:00',
    isRead: true,
  },
])

// 모달 상태
const showNoticeModal = ref(false)
const selectedNotice = ref(null)
const showAddNoticeModal = ref(false)
const showEditNoticeModal = ref(false)

// 새 공지사항 폼
const newNotice = ref({
  title: '',
  content: '',
  author: '관리자',
})

// 수정할 공지사항
const editNotice = ref({
  id: null,
  title: '',
  content: '',
  author: '',
})

// 현재 로그인한 사용자 (실제로는 인증 시스템에서 가져와야 함)
const currentUser = ref('관리자')

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// 중앙 데이터 스토어 사용
const dataStore = useDataStore()

// 메모이제이션: 스토어의 상태를 직접 사용
const reservations = computed(() => dataStore.reservations)
const customers = computed(() => dataStore.customers)
const loading = computed(() => dataStore.isLoading)

// Firebase Firestore에서 로드된 사물함 데이터 사용
const lockers = computed(() => {
  const data = dataStore.lockers
  console.log('🔍 AdminMain.vue: lockers computed 실행', {
    length: data.length,
    data: data.slice(0, 2),
  })
  return data
})

// 통계 계산
const stats = computed(() => {
  const total = lockers.value.length
  const maintenance = lockers.value.filter((l) => l.status === 'maintenance').length
  const broken = lockers.value.filter((l) => l.status === 'broken').length

  // 당일 날짜 기준으로 사용중인 예약 건수 계산 (중복 포함)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayActiveReservations = reservations.value.filter((r) => {
    const startDate = new Date(r.startDateTime)
    const endDate = new Date(r.endDateTime)
    // 오늘 날짜에 예약이 활성 상태인지 확인
    return r.status === 'active' && startDate < tomorrow && endDate >= today
  })

  const inUse = todayActiveReservations.length
  const available = total - inUse - maintenance - broken
  const usageRate = total > 0 ? Math.round((inUse / total) * 100) : 0

  console.log('📊 AdminMain.vue: stats 계산', {
    total,
    available,
    inUse,
    maintenance,
    broken,
    usageRate,
    activeReservations: inUse,
  })

  return {
    available,
    inUse,
    usageRate,
    activeReservations: inUse,
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
// 예약 시작 날짜 기준으로 가장 최근 순서부터 내림차순 정렬
const recentReservations = computed(() => {
  return [...reservations.value]
    .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
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
  const maintenance = lockers.value.filter((l) => l.status === 'maintenance').length
  const broken = lockers.value.filter((l) => l.status === 'broken').length

  return {
    labels: ['미사용', '사용중', '정비중', '고장'],
    datasets: [
      {
        label: '보관함 수',
        data: [stats.value.available, stats.value.inUse, maintenance, broken],
        backgroundColor: ['#007aff', '#34c759', '#ff9500', '#ff3b30'],
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
  // 당일 사용중인 고유 고객 수 계산 (중복 제거, 날짜 기반)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const activeReservations = reservations.value.filter((r) => {
    const startDate = new Date(r.startDateTime)
    const endDate = new Date(r.endDateTime)
    // 오늘 날짜에 예약이 활성 상태인지 확인
    return r.status === 'active' && startDate < tomorrow && endDate >= today
  })

  const uniqueCustomerIds = new Set(activeReservations.map((r) => r.customerId))
  return uniqueCustomerIds.size
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

const getMembershipClass = (level) => {
  const classes = {
    platinum: 'bg-black text-white',
    gold: 'bg-yellow-400 text-black',
    silver: 'bg-gray-300 text-black',
    bronze: 'bg-orange-600 text-white',
  }
  return classes[level] || 'bg-gray-200 text-black'
}

// 공지사항 관련 함수
const openNoticeDetail = (notice) => {
  selectedNotice.value = notice
  showNoticeModal.value = true
}

const closeNoticeModal = () => {
  if (selectedNotice.value && !selectedNotice.value.isRead) {
    selectedNotice.value.isRead = true
  }
  showNoticeModal.value = false
  selectedNotice.value = null
}

const openAddNoticeModal = () => {
  newNotice.value = {
    title: '',
    content: '',
    author: '관리자',
  }
  showAddNoticeModal.value = true
}

const closeAddNoticeModal = () => {
  showAddNoticeModal.value = false
}

const addNotice = () => {
  if (!newNotice.value.title.trim() || !newNotice.value.content.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  const now = new Date()
  const newNoticeItem = {
    id: notices.value.length + 1,
    title: newNotice.value.title,
    content: newNotice.value.content,
    author: newNotice.value.author,
    createdAt: now.toISOString().slice(0, 19).replace('T', ' '),
    isRead: false,
  }

  notices.value.unshift(newNoticeItem)
  closeAddNoticeModal()
}

// 새 글 여부 확인 (최근 24시간 이내)
const isNewNotice = (createdAt) => {
  const now = new Date()
  const noticeDate = new Date(createdAt)
  const hoursDiff = (now - noticeDate) / (1000 * 60 * 60)
  return hoursDiff <= 24
}

// 공지사항 수정 모달 열기
const openEditNoticeModal = (notice) => {
  editNotice.value = {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    author: notice.author,
  }
  showNoticeModal.value = false
  showEditNoticeModal.value = true
}

// 공지사항 수정 모달 닫기
const closeEditNoticeModal = () => {
  showEditNoticeModal.value = false
  editNotice.value = {
    id: null,
    title: '',
    content: '',
    author: '',
  }
}

// 공지사항 수정 저장
const updateNotice = () => {
  if (!editNotice.value.title.trim() || !editNotice.value.content.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  const index = notices.value.findIndex((n) => n.id === editNotice.value.id)
  if (index !== -1) {
    notices.value[index] = {
      ...notices.value[index],
      title: editNotice.value.title,
      content: editNotice.value.content,
      author: editNotice.value.author,
    }
  }

  closeEditNoticeModal()
}

// 공지사항 삭제
const deleteNotice = (noticeId) => {
  if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
    const index = notices.value.findIndex((n) => n.id === noticeId)
    if (index !== -1) {
      notices.value.splice(index, 1)
    }
    showNoticeModal.value = false
  }
}

// 본인이 작성한 공지사항인지 확인
const isOwnNotice = (notice) => {
  return notice.author === currentUser.value
}

// 스토어에서 데이터를 가져오므로 별도의 로드가 필요 없음
// App.vue에서 초기화할 때 이미 로드됨
onMounted(() => {
  // 필요시 추가 초기화 작업
})
</script>
