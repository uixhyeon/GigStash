<template>
  <div class="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
    <!-- 통계 카드 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200">예약 통계</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Blue Card -->
        <div
          class="p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400">전체 예약</div>
              <div class="text-4xl font-bold mt-2 text-blue-600 dark:text-blue-400">142</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-2xl" style="color: #3b82f6"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div
          class="p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400">활성 예약</div>
              <div class="text-4xl font-bold mt-2 text-gray-900 dark:text-white">32</div>
            </div>
            <i class="fi fi-rr-arrow-up-right text-2xl" style="color: #1f2937"></i>
          </div>
        </div>

        <!-- Blue Card -->
        <div
          class="p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400">대기 중</div>
              <div class="text-4xl font-bold mt-2 text-blue-600 dark:text-blue-400">8</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-2xl" style="color: #3b82f6"></i>
          </div>
        </div>

        <!-- Dark Card -->
        <div
          class="p-6 rounded-3xl shadow-sm backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400">완료</div>
              <div class="text-4xl font-bold mt-2 text-gray-900 dark:text-white">102</div>
            </div>
            <i class="fi fi-rr-arrow-down-left text-2xl" style="color: #1f2937"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 필터 및 검색 -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-6 text-gray-900 dark:text-table-header-text">예약 목록</h2>
      <div class="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="사용자명으로 검색"
            class="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
          />
          <select
            class="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
          >
            <option>상태 선택</option>
            <option>활성</option>
            <option>대기</option>
            <option>완료</option>
            <option>취소</option>
          </select>
          <input
            type="date"
            class="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
          />
          <button
            class="px-4 py-2 bg-transparent hover:bg-primary hover:text-white text-primary dark:text-primary rounded-lg transition-all border border-primary font-medium"
          >
            검색
          </button>
        </div>
      </div>

      <!-- 예약 목록 -->
      <div class="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-y-auto max-h-[700px] scrollbar-hide">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-table-header-bg dark:bg-table-header-bg-dark">
              <tr>
                <th
                  class="px-4 py-3 text-left font-semibold text-table-header-text dark:text-table-header-text-dark rounded-tl-2xl"
                >
                  예약번호
                </th>
                <th
                  class="px-4 py-3 text-left font-semibold text-table-header-text dark:text-table-header-text-dark"
                >
                  사용자명
                </th>
                <th
                  class="px-4 py-3 text-left font-semibold text-table-header-text dark:text-table-header-text-dark"
                >
                  사물함
                </th>
                <th
                  class="px-4 py-3 text-left font-semibold text-table-header-text dark:text-table-header-text-dark"
                >
                  기간
                </th>
                <th
                  class="px-4 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark"
                >
                  상태
                </th>
                <th
                  class="px-4 py-3 text-center font-semibold text-table-header-text dark:text-table-header-text-dark rounded-tr-2xl"
                >
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="i in 10"
                :key="i"
                class="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 cursor-pointer transition-colors group"
              >
                <td class="px-4 py-3 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900">
                  RES-{{ String(i).padStart(4, '0') }}
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900">
                  사용자 {{ i }}
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900">
                  사물함 #{{ i + 10 }}
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-dark-text-primary group-hover:dark:text-gray-900">
                  11/{{ 20 + i }} - 11/{{ 25 + i }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all',
                      i % 3 === 0
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        : i % 3 === 1
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-blue-100 text-primary dark:bg-blue-500/20 dark:text-blue-400',
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        i % 3 === 0
                          ? 'bg-gray-600 dark:bg-gray-400'
                          : i % 3 === 1
                            ? 'bg-warning dark:bg-amber-400'
                            : 'bg-primary dark:bg-blue-400',
                      ]"
                    ></span>
                    <span class="leading-tight">{{
                      i % 3 === 0 ? '완료' : i % 3 === 1 ? '대기' : '활성'
                    }}</span>
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-sm">
                  <button
                    class="text-primary dark:text-blue-400 hover:underline mr-4 font-medium"
                  >
                    보기
                  </button>
                  <button class="text-error dark:text-red-400 hover:underline font-medium">
                    취소
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="flex justify-center gap-2 mt-6">
        <button
          class="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        >
          ◀
        </button>
        <button class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          1
        </button>
        <button
          class="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        >
          2
        </button>
        <button
          class="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        >
          3
        </button>
        <button
          class="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        >
          ▶
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
// 예약관리 페이지 (현재 보류 상태 - 기본 UI만 제공)
</script>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
