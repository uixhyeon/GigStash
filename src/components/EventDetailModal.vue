<template>
  <transition name="fade">
    <div
      v-if="event"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click="$emit('close')"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        @click.stop
      >
        <!-- 모달 헤더 -->
        <div
          class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-8 py-6 flex items-center justify-between"
        >
          <h3 class="text-2xl font-bold text-white">{{ event?.name }}</h3>
          <button
            @click="$emit('close')"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <i class="fa fa-times text-2xl"></i>
          </button>
        </div>

        <!-- 모달 바디 - 가로 테이블 형태 -->
        <div class="flex-1 overflow-y-auto px-8 py-6">
          <!-- 배치 정보 테이블 -->
          <div class="bg-slate-50 dark:bg-slate-900/30 rounded-xl overflow-hidden">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-slate-800 dark:bg-slate-900">
                <tr>
                  <th class="px-4 py-3 text-center font-semibold text-white">No.</th>
                  <th class="px-4 py-3 text-center font-semibold text-white">입점</th>
                  <th class="px-4 py-3 text-left font-semibold text-white">행사 위치</th>
                  <th class="px-4 py-3 text-center font-semibold text-white">행사명</th>
                  <th class="px-4 py-3 text-center font-semibold text-white">배차 대수</th>
                  <th class="px-4 py-3 text-center font-semibold text-white">예약 건수</th>
                  <th class="px-4 py-3 text-center font-semibold text-white">담당 기사</th>
                  <th class="px-4 py-3 text-center font-semibold text-white">배차 트럭</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">1</td>
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">-</td>
                  <td class="px-4 py-3 text-left text-gray-900 dark:text-slate-200">
                    {{ event?.venue }}
                  </td>
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">
                    {{ event?.name }}
                  </td>
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">
                    {{ event?.busCount }}
                  </td>
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">
                    {{ event?.reservations }}
                  </td>
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">-</td>
                  <td class="px-4 py-3 text-center text-gray-900 dark:text-slate-200">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 기본 정보 섹션 -->
          <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 class="text-sm font-semibold mb-4 dark:text-slate-200" style="color: #1e293b">
              기본 정보
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
                <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                  >행사 유형</label
                >
                <p class="text-sm text-gray-900 dark:text-slate-200">
                  {{ event?.type }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
                <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                  >상태</label
                >
                <p class="text-sm text-gray-900 dark:text-slate-200">
                  {{ event?.status }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
                <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                  >시작일</label
                >
                <p class="text-sm text-gray-900 dark:text-slate-200">
                  {{ event?.startDate }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
                <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                  >종료일</label
                >
                <p class="text-sm text-gray-900 dark:text-slate-200">
                  {{ event?.endDate }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
                <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                  >참여자 수</label
                >
                <p class="text-sm text-gray-900 dark:text-slate-200">
                  {{ event?.participants }}명
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
                <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                  >행사 ID</label
                >
                <p class="text-xs text-gray-900 dark:text-slate-200 font-mono">
                  {{ event?.id }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 모달 푸터 -->
        <div
          class="bg-slate-100 dark:bg-slate-700/50 px-8 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700"
        >
          <button
            @click="$emit('close')"
            class="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            닫기
          </button>
          <button
            class="px-6 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            편집
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    default: null,
  },
})

defineEmits(['close'])
</script>

<style scoped>
/* 모달 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
