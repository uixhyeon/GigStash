<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">예약 통계</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">전체 예약</div>
              <div class="text-3xl font-bold mt-2">142</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #000000 0%, #000000 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">활성 예약</div>
              <div class="text-3xl font-bold mt-2">32</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-xl"></i>
          </div>
        </div>

        <!-- Blue Card -->
        <div class="text-white p-6 rounded-3xl shadow-sm" style="background: linear-gradient(135deg, #007AFF 0%, #007AFF 100%)">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium opacity-90">대기 중</div>
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
              <div class="text-3xl font-bold mt-2">102</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-xl"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 필터 및 검색 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6" style="color: #1E293B">예약 목록</h2>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="사용자명으로 검색"
            class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <select class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
            <option>상태 선택</option>
            <option>활성</option>
            <option>대기</option>
            <option>완료</option>
            <option>취소</option>
          </select>
          <input
            type="date"
            class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <button class="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
            검색
          </button>
        </div>
      </div>

      <!-- 예약 목록 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">예약번호</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">사용자명</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">사물함</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">기간</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">상태</th>
              <th class="px-4 py-3 text-left font-semibold" style="color: #1E293B">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 10" :key="i" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">RES-{{ String(i).padStart(4, '0') }}</td>
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">사용자 {{ i }}</td>
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">사물함 #{{ i + 10 }}</td>
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">11/{{ 20 + i }} - 11/{{ 25 + i }}</td>
              <td class="px-4 py-3">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  i % 3 === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  i % 3 === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                ]">
                  {{ i % 3 === 0 ? '완료' : i % 3 === 1 ? '대기' : '활성' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <button class="text-blue-600 dark:text-blue-400 hover:underline mr-4">보기</button>
                <button class="text-red-600 dark:text-red-400 hover:underline">취소</button>
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
// 예약관리 페이지 (현재 보류 상태 - 기본 UI만 제공)
</script>

<style scoped>
</style>