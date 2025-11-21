<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="px-8 py-12 max-w-[1200px] mx-auto">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        Gig Stash 관리자 시스템
      </h1>
      <p class="text-xl text-slate-600 dark:text-slate-300 mb-12">
        냉장 사물함 관리 시스템에 오신 것을 환영합니다
      </p>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12">
        <div
          class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
        >
          <h3 class="text-xl font-semibold text-[#296AF1] dark:text-[#3DD9B6] mb-3">
            🔒 사물함 관리
          </h3>
          <p class="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            20개의 냉장 사물함을 실시간으로 모니터링하고 관리하세요
          </p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
        >
          <h3 class="text-xl font-semibold text-[#296AF1] dark:text-[#3DD9B6] mb-3">예약 시스템</h3>
          <p class="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            고객 예약을 효율적으로 관리하고 추적하세요
          </p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
        >
          <h3 class="text-xl font-semibold text-[#296AF1] dark:text-[#3DD9B6] mb-3">
            통계 대시보드
          </h3>
          <p class="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            실시간 사용률과 수익 통계를 한눈에 확인하세요
          </p>
        </div>
      </div>

      <div class="flex gap-4 justify-center flex-wrap">
        <RouterLink
          to="/dashboard"
          class="px-8 py-4 rounded-lg text-lg font-semibold no-underline transition-all duration-200 inline-block bg-gradient-to-br from-[#296AF1] to-[#3DD9B6] text-white hover:-translate-y-0.5 hover:shadow-lg"
        >
          대시보드로 이동
        </RouterLink>
        <RouterLink
          to="/demo"
          class="px-8 py-4 rounded-lg text-lg font-semibold no-underline transition-all duration-200 inline-block bg-white dark:bg-slate-800 text-[#296AF1] dark:text-[#3DD9B6] border-2 border-[#296AF1] dark:border-[#3DD9B6] hover:bg-[#296AF1] hover:text-white dark:hover:bg-[#3DD9B6] dark:hover:text-slate-900"
        >
          컴포넌트 데모
        </RouterLink>
      </div>
    </div>
  </main>
</template>
