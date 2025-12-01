<template>
  <div class="grid grid-cols-7 gap-2">
    <button
      v-for="day in calendar"
      :key="day.key"
      @click="select(day.date)"
      :class="day.class"
      class="py-3 rounded-lg text-sm transition"
    >
      {{ day.number }}
      <span v-if="day.count" class="text-[10px] block mt-1 text-blue-500 dark:text-blue-300">
        {{ day.count }}건
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
// TODO: Events Store 생성 후 사용
// import { useEventsStore } from '@/stores/events'

const props = defineProps({ currentDate: Date })
const emit = defineEmits(['select'])

// const store = useEventsStore()

const calendar = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()

  const list = []

  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    // const count = store.eventMap[dateStr]?.length || 0
    const count = 0 // TODO: Events Store에서 동적으로 가져오기

    list.push({
      key: dateStr,
      date: dateStr,
      number: d,
      count,
      class: count
        ? 'bg-blue-100 dark:bg-blue-900/30 hover:shadow'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800',
    })
  }

  return list
})

const select = (date) => emit('select', date)
</script>
