<template>
  <div class="space-y-6">
    <!-- 헤더 -->
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">예약관리</h2>
      <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        + 예약 추가
      </button>
    </div>

    <!-- 예약 통계 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">전체 예약</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">142</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">활성 예약</p>
        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">32</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">대기 중</p>
        <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">8</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">완료</p>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">102</p>
      </div>
    </div>

    <!-- 필터 및 검색 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="사용자명으로 검색"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <select class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          <option>상태 선택</option>
          <option>활성</option>
          <option>대기</option>
          <option>완료</option>
          <option>취소</option>
        </select>
        <input
          type="date"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          검색
        </button>
      </div>
    </div>

    <!-- 예약 목록 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">예약번호</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">사용자명</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">사물함</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">기간</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">상태</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 10" :key="i" class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">RES-{{ String(i).padStart(4, '0') }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">사용자 {{ i }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">사물함 #{{ i + 10 }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">11/{{ 20 + i }} - 11/{{ 25 + i }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                i % 3 === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                i % 3 === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              ]">
                {{ i % 3 === 0 ? '완료' : i % 3 === 1 ? '대기' : '활성' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">
              <button class="text-blue-600 dark:text-blue-400 hover:underline mr-4">보기</button>
              <button class="text-red-600 dark:text-red-400 hover:underline">취소</button>
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
// 예약관리 페이지 (현재 보류 상태 - 기본 UI만 제공)
</script>

<style scoped>
</style>