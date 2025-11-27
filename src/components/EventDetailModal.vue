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
            <i class="fi fi-br-cross text-2xl"></i>
          </button>
        </div>

        <!-- 모달 바디 - 상세 정보 -->
        <div class="flex-1 overflow-y-auto px-8 py-6">
          <!-- 행사 상세 정보 -->
          <div class="grid grid-cols-2 gap-4">
            <!-- ID -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >ID</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200 font-mono">
                {{ event?.id }}
              </p>
            </div>

            <!-- 행사명 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >행사명</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.name }}
              </p>
            </div>

            <!-- 행사 일자 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >행사 일자</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.startDate }}
              </p>
            </div>

            <!-- 상태 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >상태</label
              >
              <select
                v-model="localStatus"
                @change="handleStatusChange($event)"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="예정">예정</option>
                <option value="진행 중">진행 중</option>
                <option value="종료">종료</option>
                <option value="취소">취소</option>
              </select>
            </div>

            <!-- 배차 대수 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >배차 대수</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.busCount }}대
              </p>
            </div>

            <!-- 예약건수 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >예약건수</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.reservations }}건
              </p>
            </div>

            <!-- 행사 위치 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 col-span-2">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >행사 위치</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.venue }}
              </p>
            </div>

            <!-- 행사 유형 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >행사 유형</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.type }}
              </p>
            </div>

            <!-- 참여자 수 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >참여자 수</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.participants }}명
              </p>
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
            @click="handleSave"
            :class="[
              'px-6 py-2 rounded-lg transition-colors font-medium',
              hasChanges
                ? 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
            ]"
            :disabled="!hasChanges"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'status-change', 'save'])

// 로컬 상태로 관리
const localStatus = ref(props.event?.status)
const hasChanges = ref(false)

// event prop이 변경될 때 localStatus 업데이트
watch(
  () => props.event?.status,
  (newStatus) => {
    localStatus.value = newStatus
    hasChanges.value = false
  },
)

const handleStatusChange = (event) => {
  localStatus.value = event.target.value
  hasChanges.value = true
}

const handleSave = () => {
  if (hasChanges.value) {
    emit('status-change', localStatus.value)
    hasChanges.value = false
  }
  emit('close')
}
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
