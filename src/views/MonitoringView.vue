<template>
  <div class="space-y-6">
    <!-- 헤더 -->
    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">모니터링</h2>

    <!-- 실시간 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">활성 사물함</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">14</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-2xl">
            ✓
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">온라인 사용자</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">32</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
            👥
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">평균 온도</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">18°C</p>
          </div>
          <div class="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center text-2xl">
            🌡️
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">시스템 상태</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">정상</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center text-2xl">
            ⚙️
          </div>
        </div>
      </div>
    </div>

    <!-- 사물함 상태 모니터링 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">사물함 상태</h3>

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
          <p class="text-gray-900 dark:text-white font-medium">{{ status.name }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ status.percentage }}%</p>
        </div>
      </div>
    </div>

    <!-- 시스템 알림 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">최근 알림</h3>

      <div class="space-y-3">
        <div v-for="i in 5" :key="i" class="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div :class="[
            'w-3 h-3 rounded-full mt-1.5 flex-shrink-0',
            i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'
          ]"></div>
          <div class="flex-1">
            <p class="text-gray-900 dark:text-white font-medium">
              {{ i % 3 === 0 ? '사물함 #5 온도 이상' : i % 3 === 1 ? '예약 시간 초과' : '유지보수 예정' }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatTime(i) }}</p>
          </div>
          <button class="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400">✕</button>
        </div>
      </div>
    </div>
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