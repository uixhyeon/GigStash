<template>
  <div class="rounded-3xl shadow-sm backdrop-blur-sm" :class="[cardClass, layoutClass]">
    <!-- 수평 레이아웃 -->
    <div v-if="layout === 'horizontal'" class="p-3 sm:p-4 md:p-6 flex justify-between items-start gap-2">
      <div class="min-w-0 flex-1">
        <div class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{{ label }}</div>
        <div class="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2" :class="valueClass">{{ value }}</div>
      </div>
      <i :class="`fi ${icon} text-lg sm:text-xl md:text-2xl flex-shrink-0`" :style="iconStyle"></i>
    </div>

    <!-- 수직 레이아웃 -->
    <div v-else class="p-3 flex flex-col items-center text-center">
      <div class="font-medium opacity-90" :style="{ fontSize: labelFontSize }">{{ label }}</div>
      <div class="font-bold mt-0.5" :class="valueClass" :style="{ fontSize: valueFontSize }">
        {{ value }}
      </div>
      <div v-if="changeValue !== null" class="mt-0.5 font-bold" :style="{ fontSize: changeFontSize, color: changeColor }">
        <i :class="`fi ${changeIcon} mr-1`"></i>{{ changeValue }}
      </div>
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
    validator: (value) => ['blue', 'black', 'gradient-blue', 'gradient-black', 'gradient-yellow', 'gradient-gray', 'gradient-blue-revenue'].includes(value),
  },
  layout: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value),
  },
  changeValue: {
    type: [String, Number],
    default: null,
  },
  changeDirection: {
    type: String,
    default: 'up',
    validator: (value) => ['up', 'down'].includes(value),
  },
  backgroundStyle: {
    type: String,
    default: null,
  },
  labelFontSize: {
    type: String,
    default: '18px',
  },
  valueFontSize: {
    type: String,
    default: '28px',
  },
  changeFontSize: {
    type: String,
    default: '18px',
  },
})

const cardClass = computed(() => {
  if (props.backgroundStyle) {
    return props.backgroundStyle
  }

  const variants = {
    blue: 'bg-white/80 dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/30',
    green: 'bg-white/80 dark:bg-slate-800/50 border border-green-100 dark:border-green-900/30',
    puple: 'bg-white/80 dark:bg-slate-800/50 border border-purple-100 dark:border-purple-900/30',
    black: 'bg-white/80 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700',
    'gradient-blue': 'bg-gradient-to-br from-blue-400/90 to-blue-600/95 text-white',
    'gradient-black': 'bg-white/80 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700',
    'gradient-yellow': 'bg-gradient-to-br from-yellow-300/90 to-amber-400/95',
    'gradient-gray': 'bg-gradient-to-br from-gray-400/90 to-gray-600/95 text-white',
    'gradient-blue-revenue': 'bg-gradient-to-br from-blue-100/90 to-blue-300/95',
  }
  return variants[props.variant] || variants.blue
})

const layoutClass = computed(() => {
  return props.layout === 'vertical' ? 'flex-1' : ''
})

const valueClass = computed(() => {
  const variants = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    puple: 'text-purple-600 dark:text-purple-400',
    black: 'text-gray-900 dark:text-white',
    'gradient-blue': 'text-white',
    'gradient-black': 'text-gray-900 dark:text-white',
    'gradient-yellow': 'text-gray-800',
    'gradient-gray': 'text-white',
    'gradient-blue-revenue': 'text-gray-900 dark:text-gray-900',
  }
  return variants[props.variant] || variants.blue
})

const iconStyle = computed(() => {
  const variants = {
    blue: 'color: #3b82f6;',
    green: 'color: #16a34a;',
    puple: 'color: #a855f7;',
    black: 'color: #1f2937;',
    'gradient-blue': 'color: #ffffff;',
    'gradient-black': 'color: #1f2937;',
    'gradient-yellow': 'color: #1f2937;',
    'gradient-gray': 'color: #ffffff;',
    'gradient-blue-revenue': 'color: #1f2937;',
  }
  return variants[props.variant] || variants.blue
})

const changeIcon = computed(() => {
  return props.changeDirection === 'up' ? 'fi-rr-arrow-up' : 'fi-rr-arrow-down'
})

const changeColor = computed(() => {
  if (props.variant.includes('gradient')) {
    return 'currentColor'
  }
  return '#333333'
})
</script>
