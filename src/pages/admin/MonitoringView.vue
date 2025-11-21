<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 실시간 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">시스템 상태</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">활성 사물함</div>
              <div class="text-3xl font-bold mt-2">14</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">온라인 사용자</div>
              <div class="text-3xl font-bold mt-2">32</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">평균 온도</div>
              <div class="text-3xl font-bold mt-2">18°C</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">시스템 상태</div>
              <div class="text-3xl font-bold mt-2">정상</div>
            </div>
            <i class="fi fi-rr-check text-xl"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 사물함 상태 모니터링 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">사물함 상태</h2>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="status in statusCounts" :key="status.name" class="text-center">
            <div :class="[
              'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold',
              status.name === '사용 가능' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              status.name === '사용 중' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
              status.name === '유지보수' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            ]">
              {{ status.count }}
            </div>
            <p class="text-slate-900 dark:text-slate-100 font-medium">{{ status.name }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ status.percentage }}%</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 시스템 알림 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">최근 알림</h2>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div :class="[
              'w-3 h-3 rounded-full mt-1.5 flex-shrink-0',
              i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'
            ]"></div>
            <div class="flex-1">
              <p class="text-slate-900 dark:text-slate-100 font-medium">
                {{ i % 3 === 0 ? '사물함 #5 온도 이상' : i % 3 === 1 ? '예약 시간 초과' : '유지보수 예정' }}
              </p>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ formatTime(i) }}</p>
            </div>
            <button class="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">✕</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const statusCounts = [
  { name: '사용 가능', count: 8, percentage: 57 },
  { name: '사용 중', count: 4, percentage: 29 },
  { name: '유지보수', count: 1, percentage: 7 },
  { name: '고장', count: 1, percentage: 7 }
]

const formatTime = (index) => {
  const minutes = 5 + index * 3
  return `${minutes}분 전`
}
</script>

<style scoped>
</style>