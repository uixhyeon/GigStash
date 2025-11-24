<template>
  <div class="p-6 rounded-3xl shadow-sm" :style="cardStyle">
    <div class="flex justify-between items-start mb-4">
      <div class="text-white">
        <div class="text-sm font-medium opacity-90">{{ label }}</div>
        <div class="text-3xl font-bold mt-2">{{ value }}</div>
      </div>
      <i :class="`fi ${icon} text-xl`" :style="iconStyle"></i>
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

const cardStyle = computed(() => {
  const variants = {
    blue: 'background: linear-gradient(135deg, #007aff 0%, #007aff 100%)',
    black: 'background: linear-gradient(135deg, #000000 0%, #000000 100%)',
    'gradient-blue': 'background: linear-gradient(545deg, #3482ff 0%, #6faeff 100%)',
    'gradient-black': 'background: linear-gradient(545deg, #0A0A0A 0%, #3C3C3C 100%)',
  }
  return variants[props.variant] || variants.blue
})

const iconStyle = computed(() => {
  return 'color: rgba(255, 255, 255, 0.9);'
})
</script>
