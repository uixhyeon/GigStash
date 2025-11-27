<template>
  <div class="p-6 rounded-3xl shadow-sm backdrop-blur-sm" :class="cardClass">
    <div class="flex justify-between items-start mb-4">
      <div>
        <div class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ label }}</div>
        <div class="text-4xl font-bold mt-2" :class="valueClass">{{ value }}</div>
      </div>
      <i :class="`fi ${icon} text-2xl`" :style="iconStyle"></i>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    default: 'fi-rr-box',
  },
  variant: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'black', 'gradient-blue', 'gradient-black'].includes(value),
  },
})

const cardClass = computed(() => {
  const variants = {
    blue: 'bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30',
    black: 'bg-white/80 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700',
    'gradient-blue': 'bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30',
    'gradient-black': 'bg-white/80 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700',
  }
  return variants[props.variant] || variants.blue
})

const valueClass = computed(() => {
  const variants = {
    blue: 'text-blue-600 dark:text-blue-400',
    black: 'text-gray-900 dark:text-white',
    'gradient-blue': 'text-blue-600 dark:text-blue-400',
    'gradient-black': 'text-gray-900 dark:text-white',
  }
  return variants[props.variant] || variants.blue
})

const iconStyle = computed(() => {
  const variants = {
    blue: 'color: #3b82f6;', // blue-500
    black: 'color: #1f2937;', // gray-800
    'gradient-blue': 'color: #3b82f6;',
    'gradient-black': 'color: #1f2937;',
  }
  return variants[props.variant] || variants.blue
})
</script>
