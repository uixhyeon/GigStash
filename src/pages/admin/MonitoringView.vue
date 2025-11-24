<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 리포트 & 통계 헤더 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-6" style="color: #1E293B">리포트 & 통계</h1>
      
      <!-- 날짜 범위 선택기 -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <button 
          @click="prevDateRange"
          class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <i class="fi fi-rr-angle-left text-xl"></i>
        </button>
        <div class="text-lg font-semibold text-slate-900 dark:text-slate-100 px-4">
          {{ formatDateRange(dateRange.start) }} ~ {{ formatDateRange(dateRange.end) }}
        </div>
        <button 
          @click="nextDateRange"
          class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <i class="fi fi-rr-angle-right text-xl"></i>
        </button>
      </div>
    </div>

    <!-- 주요 지표 -->
    <section class="mb-8">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">주요 지표</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 매출 카드 -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">매출</div>
              <div class="text-3xl font-bold mt-2">{{ formatCurrency(keyMetrics.revenue) }}</div>
              <div class="text-sm mt-2 text-green-200">
                <i class="fi fi-rr-arrow-up mr-1"></i>{{ keyMetrics.revenueChange }}%
              </div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- 이용객 카드 -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">이용객</div>
              <div class="text-3xl font-bold mt-2">{{ formatNumber(keyMetrics.users) }}명</div>
              <div class="text-sm mt-2 text-green-200">
                <i class="fi fi-rr-arrow-up mr-1"></i>{{ keyMetrics.usersChange }}%
              </div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- 이용률 카드 -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">이용률</div>
              <div class="text-3xl font-bold mt-2">{{ keyMetrics.utilizationRate }}%</div>
              <div class="text-sm mt-2 text-red-200">
                <i class="fi fi-rr-arrow-down mr-1"></i>{{ Math.abs(keyMetrics.utilizationChange) }}%
              </div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 차트 그리드 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 피크타임 분석 -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">피크타임 분석</h2>
        <div class="h-64 relative">
          <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <!-- Y축 그리드 -->
            <line v-for="i in 5" :key="i" 
              :x1="0" :y1="i * 40" 
              :x2="400" :y2="i * 40" 
              stroke="#e2e8f0" stroke-width="1" 
              class="dark:stroke-slate-700"/>
            
            <!-- 기기(store) 라인 -->
            <polyline
              :points="peakTimeData.storeLine"
              fill="none"
              stroke="#60a5fa"
              stroke-width="2"
            />
            
            <!-- 찾기(find) 라인 -->
            <polyline
              :points="peakTimeData.findLine"
              fill="none"
              stroke="#10b981"
              stroke-width="2"
            />
            
            <!-- 범례 -->
            <g transform="translate(20, 20)">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#60a5fa" stroke-width="2"/>
              <text x="25" y="5" fill="#64748b" font-size="12" class="dark:fill-slate-400">기기(store)</text>
              <line x1="0" y1="15" x2="20" y2="15" stroke="#10b981" stroke-width="2"/>
              <text x="25" y="20" fill="#64748b" font-size="12" class="dark:fill-slate-400">찾기(find)</text>
            </g>
            
            <!-- X축 라벨 -->
            <g v-for="(hour, index) in peakTimeData.hours" :key="hour" transform="translate(50 + index * 50, 180)">
              <text :x="0" :y="0" fill="#64748b" font-size="10" text-anchor="middle" class="dark:fill-slate-400">{{ hour }}시</text>
            </g>
          </svg>
        </div>
      </section>

      <!-- 행사 유형별 매출 -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">행사 유형별 매출</h2>
        <div class="h-64 flex items-end justify-center gap-4">
          <div v-for="(item, index) in eventTypeSales" :key="item.type" class="flex flex-col items-center">
            <div 
              class="w-16 rounded-t-lg transition-all hover:opacity-80"
              :style="{ 
                height: `${(item.value / maxEventValue) * 200}px`,
                backgroundColor: item.color
              }"
            ></div>
            <div class="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center">
              <div class="font-semibold">{{ item.type }}</div>
              <div>{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
        <div class="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">11월 매출</div>
      </section>
    </div>

    <!-- 하단 그리드 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- 지역별 배송 -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">지역별 배송</h2>
        <div class="h-48 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
          <div class="text-slate-400 dark:text-slate-500 text-sm">지도 영역</div>
        </div>
        <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <div class="text-sm font-semibold mb-3" style="color: #1E293B">Top 3</div>
          <div v-for="(region, index) in deliveryRegions" :key="index" class="text-sm mb-2 text-slate-700 dark:text-slate-300">
            {{ region.name }} : {{ region.percentage }}%
          </div>
          <button class="mt-3 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg text-sm font-medium transition-colors">
            그 외
          </button>
        </div>
      </section>

      <!-- 결제 수단 -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">결제 수단</h2>
        <div class="space-y-4">
          <div v-for="method in paymentMethods" :key="method.type" class="flex items-center gap-3">
            <div class="text-sm font-medium text-slate-700 dark:text-slate-300 w-20">{{ method.type }}</div>
            <div class="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden relative">
              <div 
                class="h-full rounded-lg flex items-center justify-end pr-2"
                :style="{ 
                  width: `${method.percentage}%`,
                  backgroundColor: method.color
                }"
              >
                <span class="text-xs font-semibold text-white">{{ method.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 사이즈별 비율 -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">사이즈별 비율</h2>
        <div class="flex items-center justify-center gap-6">
          <div class="relative w-32 h-32">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                v-for="(segment, index) in sizeRatio"
                :key="segment.size"
                :cx="50"
                :cy="50"
                :r="40"
                :stroke="segment.color"
                :stroke-width="20"
                :stroke-dasharray="`${segment.percentage * 2.513} 251.3`"
                :stroke-dashoffset="getPieOffset(index)"
                fill="none"
                class="transition-all"
              />
            </svg>
          </div>
          <div class="space-y-2">
            <div v-for="segment in sizeRatio" :key="segment.size" class="flex items-center gap-2">
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: segment.color }"
              ></div>
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ segment.size }} : {{ segment.percentage }}%
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 인사이트 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4" style="color: #1E293B">인사이트</h2>
      <div class="space-y-3">
        <div 
          v-for="(insight, index) in insights" 
          :key="index"
          class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
        >
          <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
          <p class="text-sm text-slate-700 dark:text-slate-300">{{ insight }}</p>
        </div>
      </div>
    </section>

    <!-- 액션 버튼 -->
    <div class="flex justify-end gap-4">
      <button class="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
        <i class="fi fi-rr-download"></i>
        PDF 다운로드
      </button>
      <button class="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
        <i class="fi fi-rr-envelope"></i>
        이메일 발송
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 날짜 범위 관리
const dateRange = ref({
  start: new Date(2025, 10, 17), // 2025-11-17
  end: new Date(2025, 10, 22)    // 2025-11-22
})

const formatDateRange = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const prevDateRange = () => {
  const days = 6 // 6일 범위
  dateRange.value.start = new Date(dateRange.value.start.getTime() - days * 24 * 60 * 60 * 1000)
  dateRange.value.end = new Date(dateRange.value.end.getTime() - days * 24 * 60 * 60 * 1000)
}

const nextDateRange = () => {
  const days = 6
  dateRange.value.start = new Date(dateRange.value.start.getTime() + days * 24 * 60 * 60 * 1000)
  dateRange.value.end = new Date(dateRange.value.end.getTime() + days * 24 * 60 * 60 * 1000)
}

// 주요 지표 (더미 데이터 - 나중에 props나 composable로 교체)
const keyMetrics = ref({
  revenue: 28000000,
  revenueChange: 12,
  users: 2100,
  usersChange: 8,
  utilizationRate: 3.2,
  utilizationChange: -0.5
})

const formatCurrency = (value) => {
  const 만 = Math.floor(value / 10000)
  return `${만}만`
}

const formatNumber = (value) => {
  return value.toLocaleString('ko-KR')
}

// 피크타임 분석 데이터
const peakTimeData = computed(() => {
  const hours = [15, 16, 17, 18, 19, 20, 21, 22, 23]
  const storeValues = [50, 80, 120, 180, 220, 280, 320, 380, 350]
  const findValues = [30, 50, 90, 150, 200, 280, 400, 420, 380]
  
  const maxValue = 450
  const width = 400
  const height = 200
  
  const storePoints = hours.map((hour, index) => {
    const x = 50 + (index * (width - 100) / (hours.length - 1))
    const y = height - 20 - (storeValues[index] / maxValue) * (height - 40)
    return `${x},${y}`
  }).join(' ')
  
  const findPoints = hours.map((hour, index) => {
    const x = 50 + (index * (width - 100) / (hours.length - 1))
    const y = height - 20 - (findValues[index] / maxValue) * (height - 40)
    return `${x},${y}`
  }).join(' ')
  
  return {
    hours,
    storeLine: storePoints,
    findLine: findPoints
  }
})

// 행사 유형별 매출
const eventTypeSales = ref([
  { type: '콘서트', value: 1200, percentage: 45, color: '#3b82f6' },
  { type: '대구', value: 800, percentage: 30, color: '#10b981' },
  { type: '축구', value: 500, percentage: 19, color: '#f59e0b' },
  { type: '기타', value: 200, percentage: 6, color: '#ef4444' }
])

const maxEventValue = computed(() => {
  return Math.max(...eventTypeSales.value.map(item => item.value))
})

// 지역별 배송
const deliveryRegions = ref([
  { name: '서울 강남권', percentage: 35 },
  { name: '서울 강북권', percentage: 25 },
  { name: '경기 남부', percentage: 20 }
])

// 결제 수단
const paymentMethods = ref([
  { type: '카드', percentage: 35, color: '#fbbf24' },
  { type: '현금', percentage: 25, color: '#3b82f6' },
  { type: '계좌이체', percentage: 20, color: '#10b981' },
  { type: '기타', percentage: 20, color: '#64748b' }
])

// 사이즈별 비율
const sizeRatio = ref([
  { size: 'Medium', percentage: 65, color: '#3b82f6' },
  { size: 'Small', percentage: 20, color: '#ec4899' },
  { size: 'Large', percentage: 10, color: '#f59e0b' },
  { size: 'XLarge', percentage: 5, color: '#fbbf24' }
])

const getPieOffset = (index) => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += sizeRatio.value[i].percentage * 2.513
  }
  return -offset
}

// 인사이트
const insights = ref([
  '이용률 3.2%로 목표(5%) 미달 → 현장 마케팅 강화 필요',
  'Medium 사이즈 집중 (65%) → 재고 관리 최적화',
  '배송 신청 19% (증가 추세) → 배송 인프라 확대 검토'
])
</script>

<style scoped>
</style>