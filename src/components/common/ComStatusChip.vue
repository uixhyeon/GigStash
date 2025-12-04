<template>
  <span :class="chipClasses">
    <span :class="dotClasses"></span>
    <span class="leading-tight">{{ statusText }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) =>
      ['available', 'in-use', 'broken', 'maintenance', '예정', '진행 중', '종료', '취소'].includes(
        value,
      ),
  },
})

const statusText = computed(() => {
  const statusMap = {
    available: '사용 가능',
    'in-use': '사용 중',
    broken: '고장',
    maintenance: '점검 중',
    예정: '예정',
    '진행 중': '진행 중',
    종료: '종료',
    취소: '취소',
  }
  return statusMap[props.status] || props.status
})

const statusClasses = {
  available: {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-blue-100 text-primary dark:bg-blue-500/20 dark:text-blue-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-primary dark:bg-blue-400',
  },
  'in-use': {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-teal-600 dark:bg-teal-400',
  },
  broken: {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-error dark:bg-red-400',
  },
  maintenance: {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-warning dark:bg-amber-400',
  },
  예정: {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-blue-100 text-primary dark:bg-blue-500/20 dark:text-blue-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-primary dark:bg-blue-400',
  },
  취소: {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-warning/20 text-warning dark:bg-warning/30 dark:text-warning',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-warning dark:bg-warning',
  },
  '진행 중': {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-teal-600 dark:bg-teal-400',
  },
  종료: {
    chip: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    dot: 'w-1 h-1 rounded-full flex-shrink-0 bg-gray-600 dark:bg-gray-400',
  },
}

const chipClasses = computed(
  () => statusClasses[props.status]?.chip || statusClasses.available.chip,
)
const dotClasses = computed(() => statusClasses[props.status]?.dot || statusClasses.available.dot)
</script>
