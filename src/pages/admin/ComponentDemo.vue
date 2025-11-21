<template>
  <div class="min-h-screen p-8 bg-background transition-colors dark:bg-dark-bg">
    <div class="flex justify-between items-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 m-0 dark:text-white">컴포넌트 데모</h1>
      <DarkModeToggle />
    </div>

    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">StatusChip 컴포넌트</h2>
      <div class="flex flex-wrap gap-4">
        <StatusChip status="available" />
        <StatusChip status="in-use" />
        <StatusChip status="broken" />
        <StatusChip status="maintenance" />
      </div>
    </section>

    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">BaseButton 컴포넌트</h2>
      <div class="flex flex-wrap gap-4">
        <BaseButton variant="primary">Primary Button</BaseButton>
        <BaseButton variant="secondary">Secondary Button</BaseButton>
        <BaseButton variant="danger">Danger Button</BaseButton>
        <BaseButton variant="primary" disabled>Disabled Button</BaseButton>
      </div>
    </section>

    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">아이콘이 있는 버튼</h2>
      <div class="flex flex-wrap gap-4">
        <BaseButton variant="primary">
          <template #icon>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </template>
          추가하기
        </BaseButton>
        <BaseButton variant="secondary">
          <template #icon>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </template>
          수정하기
        </BaseButton>
        <BaseButton variant="danger">
          <template #icon>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </template>
          삭제하기
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
})
</script>
