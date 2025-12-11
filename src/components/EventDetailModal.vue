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
          <button @click="$emit('close')" class="text-white hover:text-gray-200 transition-colors">
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

            <!-- 행사 유형 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >행사 유형</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.type || '미분류' }}
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

            <!-- 행사 시간 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >행사 시간</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">
                {{ event?.performanceTime || '미정' }}
              </p>
            </div>

            <!-- 상태 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                <div class="flex align-middle justify-between">
                  <span>상태</span>
                  <span v-if="isEventEnded" class="text-red-500">* 종료된 행사는 수정 불가</span>
                </div>
              </label>
              <div>
                <select
                  v-model="localStatus"
                  @change="handleStatusChange($event)"
                  :disabled="isEventEnded"
                  :class="[
                    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors',
                    isEventEnded
                      ? 'border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200',
                  ]"
                >
                  <option value="예정">예정</option>
                  <option value="진행 중">진행 중</option>
                  <option value="종료">종료</option>
                  <option v-if="!isEventStartedOrEnded" value="취소">취소</option>
                </select>
                <p
                  v-if="isEventStartedOrEnded && !isEventEnded"
                  class="text-xs text-red-600 dark:text-red-400 mt-2"
                >
                  행사가 시작되거나 종료되면 취소할 수 없습니다.
                </p>
              </div>
            </div>

            <!-- 배차 대수 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >배차 대수</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">{{ event?.busCount }}대</p>
            </div>

            <!-- 예약건수 -->
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >예약건수</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">{{ event?.reservations }}건</p>
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

            <!-- 참여자 수 -->
            <!-- <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
              <label class="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1"
                >참여자 수</label
              >
              <p class="text-sm text-gray-900 dark:text-slate-200">{{ event?.participants }}명</p>
            </div> -->
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
import { ref, watch, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'status-change', 'save'])

// 데이터 스토어 사용
const dataStore = useDataStore()

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

// 행사 시작 여부 확인
const isEventStarted = computed(() => {
  if (!props.event?.startDate || !props.event?.performanceTime) {
    return false
  }

  // 현재 시간
  const now = new Date()

  // 행사 날짜 파싱 (YYYY-MM-DD 형식)
  const [year, month, day] = props.event.startDate.split('-').map(Number)
  const eventDate = new Date(year, month - 1, day)

  // 행사 시간 파싱 (HH:MM 형식)
  const [hours, minutes] = props.event.performanceTime.split(':').map(Number)

  // 행사 시작 시간 생성
  const eventStartTime = new Date(year, month - 1, day, hours, minutes, 0)

  // 현재 시간이 행사 시작 시간 이후인지 확인
  return now >= eventStartTime
})

// 행사 종료 여부 확인 (상태가 "종료"인 경우)
const isEventEnded = computed(() => {
  return props.event?.status === '종료'
})

// 행사 시작되었거나 종료된 여부 확인
const isEventStartedOrEnded = computed(() => {
  // 현재 상태가 이미 "종료"이거나 행사가 시작되었으면 true
  return isEventEnded.value || isEventStarted.value
})

const handleStatusChange = (event) => {
  const newStatus = event.target.value

  // 행사가 이미 종료된 경우 상태 변경 방지
  if (isEventEnded.value) {
    return
  }

  // 취소 옵션이 선택되었고 행사가 시작되었거나 종료된 경우 저장 방지
  if (newStatus === '취소' && isEventStartedOrEnded.value) {
    return
  }

  localStatus.value = newStatus
  hasChanges.value = true
}

const handleSave = () => {
  if (hasChanges.value) {
    emit('status-change', localStatus.value)

    // 이벤트 상태가 "종료"로 변경되었을 때 해당 이벤트의 모든 예약을 완료로 변경
    if (localStatus.value === '종료' && props.event?.id) {
      dataStore.completeReservationsByEvent(props.event.id)
    }

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
