<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">행사 통계</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">전체 행사</div>
              <div class="text-3xl font-bold mt-2">24</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">진행 중</div>
              <div class="text-3xl font-bold mt-2">3</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">예정</div>
              <div class="text-3xl font-bold mt-2">8</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">완료</div>
              <div class="text-3xl font-bold mt-2">13</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 필터 및 검색 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">행사 목록</h2>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="행사명으로 검색"
            class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <select class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
            <option>상태 선택</option>
            <option>예정</option>
            <option>진행 중</option>
            <option>완료</option>
            <option>취소</option>
          </select>
          <button class="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
            검색
          </button>
        </div>
      </div>

      <!-- 행사 목록 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">행사명</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">시작일</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">종료일</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">상태</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">참여자</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="i" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">행사 {{ i }}</td>
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2024-11-{{ 20 + i }}</td>
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">2024-11-{{ 25 + i }}</td>
              <td class="px-4 py-3">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  i % 3 === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  i % 3 === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                ]">
                  {{ i % 3 === 0 ? '예정' : i % 3 === 1 ? '진행 중' : '완료' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ 10 + i }}명</td>
              <td class="px-4 py-3 text-sm">
                <button class="text-blue-600 dark:text-blue-400 hover:underline mr-4">편집</button>
                <button class="text-red-600 dark:text-red-400 hover:underline">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="flex justify-center gap-2 mt-6">
        <button class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700">◀</button>
        <button class="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
        <button class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700">2</button>
        <button class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700">3</button>
        <button class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700">▶</button>
      </div>
    </section>
  </div>
</template>

<script setup>
// 행사관리 페이지
</script>

<style scoped>
</style>