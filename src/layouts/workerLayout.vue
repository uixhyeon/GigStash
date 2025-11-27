<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 레이아웃: workerLayout.vue                                           ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 레이아웃 (Layout)                                              ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 워커(기사) 앱의 전체 레이아웃 구조                                 ║
  ║ - 고정 헤더와 메인 컨텐츠 영역 제공                                  ║
  ║ - 사용자 이름 표시 및 홈 이동 버튼                                   ║
  ║ - 다크모드 토글 및 설정 버튼                                         ║
  ║                                                                      ║
  ║ 특징:                                                                ║
  ║ - 모바일 최적화 (최대 너비 480px)                                    ║
  ║ - 다크모드 지원                                                      ║
  ║ - 고정 헤더로 스크롤 시에도 항상 표시                                ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div
    class="h-screen w-full max-w-[480px] fixed top-0 left-1/2 -translate-x-1/2 overflow-hidden bg-white dark:bg-black"
  >
    <!-- 헤더 -->
    <header
      class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20"
      style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
    >
      <div class="flex items-center gap-3 justify-between p-4 pb-2">
        <!-- 왼쪽: 로고 + 사용자 이름 -->
        <button
          @click="goToHome"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-blue-400 rounded-sm"></div>
            <div class="w-3 h-3 bg-cyan-300 rounded-sm"></div>
          </div>
          <span class="text-white text-base">{{ authStore.user?.name || "김운전" }}님</span>
        </button>

        <!-- 오른쪽: 다크모드 + 설정 -->
        <div class="flex items-center gap-2">
          <DarkModeToggle />
          <button
            @click="goToProfile"
            class="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <i class="fi fi-rr-settings text-xl"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="bg-gray-100 overflow-y-auto w-full h-full pt-[68px] dark:bg-gray-900">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import DarkModeToggle from "@/components/common/DarkModeToggle.vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const goToHome = () => {
  router.push({ name: "WorkerWork" });
};

const goToProfile = () => {
  router.push({ name: "WorkerSettings" });
};
</script>
