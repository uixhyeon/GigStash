<template>
  <div class="min-h-screen p-8 bg-background transition-colors dark:bg-dark-bg">
    <div class="flex justify-between items-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 m-0 dark:text-white">컴포넌트 데모</h1>
      <DarkModeToggle />
    </div>

    <!-- StatusChip 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">StatusChip 컴포넌트</h2>
      <div class="flex flex-wrap gap-4">
        <StatusChip status="available" />
        <StatusChip status="in-use" />
        <StatusChip status="broken" />
        <StatusChip status="maintenance" />
      </div>
    </section>

    <!-- BaseButton 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">BaseButton 컴포넌트</h2>
      <div class="flex flex-wrap gap-4">
        <BaseButton variant="primary">Primary Button</BaseButton>
        <BaseButton variant="secondary">Secondary Button</BaseButton>
        <BaseButton variant="danger">Danger Button</BaseButton>
        <BaseButton variant="primary" disabled>Disabled Button</BaseButton>
      </div>
    </section>

    <!-- 아이콘이 있는 버튼 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">아이콘이 있는 BaseButton</h2>
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

    <!-- StatCard 컴포넌트 (Horizontal) -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">StatCard 컴포넌트 (Horizontal Layout)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="전체 예약"
          :value="324"
          icon="fi-rr-calendar"
          variant="blue"
          layout="horizontal"
        />
        <StatCard
          label="활성 예약"
          :value="89"
          icon="fi-rr-circle-check"
          variant="blue"
          layout="horizontal"
        />
        <StatCard
          label="대기 중"
          :value="45"
          icon="fi-rr-hourglass"
          variant="blue"
          layout="horizontal"
        />
        <StatCard
          label="완료"
          :value="190"
          icon="fi-rr-check"
          variant="blue"
          layout="horizontal"
        />
      </div>
    </section>

    <!-- StatCard 컴포넌트 (Vertical with variants) -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">StatCard 컴포넌트 (Vertical Layout with Variants)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="총 사용자"
          :value="1,234"
          icon="fi-rr-users"
          variant="gradient-blue"
          layout="vertical"
          changeValue="+12%"
          changeDirection="up"
        />
        <StatCard
          label="매출"
          :value="₩2,450,000"
          icon="fi-rr-credit"
          variant="gradient-yellow"
          layout="vertical"
          changeValue="+8%"
          changeDirection="up"
        />
        <StatCard
          label="신규 고객"
          :value="87"
          icon="fi-rr-user-add"
          variant="gradient-gray"
          layout="vertical"
          changeValue="-3%"
          changeDirection="down"
        />
        <StatCard
          label="재방문율"
          :value="68%"
          icon="fi-rr-rotate-clockwise"
          variant="gradient-blue"
          layout="vertical"
          changeValue="+5%"
          changeDirection="up"
        />
      </div>
    </section>

    <!-- EventCalendar 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">EventCalendar 컴포넌트</h2>
      <div class="flex justify-center">
        <div class="w-full max-w-md">
          <EventCalendar />
        </div>
      </div>
    </section>

    <!-- Calendar 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">Calendar 컴포넌트</h2>
      <div class="flex justify-center">
        <div class="w-full max-w-md">
          <Calendar />
        </div>
      </div>
    </section>

    <!-- Weather 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">Weather 컴포넌트</h2>
      <div class="flex justify-center">
        <Weather />
      </div>
    </section>

    <!-- ApiDebugPanel 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">ApiDebugPanel 컴포넌트</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">개발 환경에서 API 요청을 디버깅하는 패널입니다.</p>
      <ApiDebugPanel />
    </section>

    <!-- DarkModeToggle 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">DarkModeToggle 컴포넌트</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">페이지 우측 상단에 표시되는 다크모드 토글입니다.</p>
      <div class="flex justify-center">
        <DarkModeToggle />
      </div>
    </section>

    <!-- EventDetailModal 컴포넌트 -->
    <section class="mb-12 p-8 bg-white rounded-lg shadow-base dark:bg-dark-bg-secondary">
      <h2 class="text-2xl font-semibold text-gray-900 m-0 mb-6 dark:text-white">EventDetailModal 컴포넌트</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">행사 상세 정보를 모달로 표시하는 컴포넌트입니다.</p>
      <BaseButton variant="primary" @click="showEventModal = true">
        모달 열기
      </BaseButton>
      <EventDetailModal v-if="showEventModal" @close="showEventModal = false" />
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'
import StatCard from '@/components/common/StatCard.vue'
import EventCalendar from '@/components/common/EventCalendar.vue'
import Calendar from '@/components/common/Calender.vue'
import Weather from '@/components/Weather.vue'
import ApiDebugPanel from '@/components/dev/ApiDebugPanel.vue'
import EventDetailModal from '@/components/EventDetailModal.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { initDarkMode } = useDarkMode()
const showEventModal = ref(false)

onMounted(() => {
  initDarkMode()
})
</script>
