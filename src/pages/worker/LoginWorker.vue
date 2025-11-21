<template>
  <div class="w-full min-h-screen flex items-center justify-center px-4">
    <div class="max-w-sm bg-white rounded-3xl shadow-2xl p-8">
      <!--로고영역 -->
      <div class="text-center mb-8">
        <div class="w-24 h-24 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-4xl">🧹</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">청소 기사 앱</h1>
        <p class="text-gray-600">안전하고 깔끔한 청소 작업을 시작하세요</p>
      </div>
      <!-- 로그폼 -->
      <form class="space-y-4" @submit.prevent="login">
        <div>
          <label for="workerId">기사 ID</label>
          <input
            id="workerId"
            v-model="workerId"
            type="text"
            placeholder="기사 번호를 입력하세요"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> 비밀번호 </label>
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
            required />
        </div>
        <!-- 자동 로그인 체크 박스 -->
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" class="w-5 h-5 rounded border-gray-300" />
          자동 로그인
        </label>
        <!-- 로그인 버튼 -->
        <button
          type="submit"
          class="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg active:scale-[0.98] transition-transform">
          로그인
        </button>
      </form>
      <!-- 도움말 -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>비밀번호를 잊으셨나요?</p>
        <button class="text-blue-600 font-medium mt-2">비밀번호 찾기</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const workerId = ref("");
const password = ref("");
function login() {
  if (workerId.value && password.value) {
    alert("로그인 성공~ 작업목록으로 이동합니다.");
    router.push("/worker/dashboard");
  } else {
    alert("기사ID와 비밀번호를 입력해주세요.");
  }
}
</script>
