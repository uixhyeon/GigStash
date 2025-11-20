<template>
  <div class="space-y-6">
    <!-- 헤더 -->
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">행사관리</h2>
      <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        + 행사 추가
      </button>
    </div>

    <!-- 필터 및 검색 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="행사명으로 검색"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <select class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          <option>상태 선택</option>
          <option>예정</option>
          <option>진행 중</option>
          <option>완료</option>
          <option>취소</option>
        </select>
        <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          검색
        </button>
      </div>
    </div>

    <!-- 행사 목록 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">행사명</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">시작일</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">종료일</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">상태</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">참여자</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">행사 {{ i }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">2024-11-{{ 20 + i }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">2024-11-{{ 25 + i }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                i % 3 === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                i % 3 === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              ]">
                {{ i % 3 === 0 ? '예정' : i % 3 === 1 ? '진행 중' : '완료' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ 10 + i }}명</td>
            <td class="px-6 py-4 text-sm">
              <button class="text-blue-600 dark:text-blue-400 hover:underline mr-4">편집</button>
              <button class="text-red-600 dark:text-red-400 hover:underline">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="flex justify-center gap-2">
      <button class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">◀</button>
      <button class="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
      <button class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">2</button>
      <button class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">3</button>
      <button class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">▶</button>
    </div>
  </div>
</template>

<script setup>
// 행사관리 페이지
</script>

<style scoped>
</style>