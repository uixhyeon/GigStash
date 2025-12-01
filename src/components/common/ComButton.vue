<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <span v-if="$slots.icon" class="flex items-center justify-center">
      <slot name="icon"></slot>
    </span>
    <span class="flex items-center">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  }
})

const emit = defineEmits(['click'])

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-blue-700 active:shadow-sm',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600',
  danger: 'bg-error text-white hover:bg-red-600 active:shadow-sm'
}

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-6 py-3 border-none rounded text-base font-semibold cursor-pointer transition-all outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
  const variantClass = variantClasses[props.variant] || variantClasses.primary
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return `${baseClasses} ${variantClass} ${disabledClass}`
})

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
