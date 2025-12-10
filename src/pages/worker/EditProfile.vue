
<template>
  <div class="pb-20">
    <!-- 기본 정보 섹션 -->
    <div class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mx-4 mt-4 p-5">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">기본 정보</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">이름</label>
          <input
            v-model="profileData.displayName"
            type="text"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">전화번호</label>
          <input
            v-model="profileData.phone"
            type="tel"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="010-1234-5678"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">이메일</label>
          <input
            v-model="profileData.email"
            type="email"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="email@example.com"
          />
        </div>
      </div>
    </div>

    <!-- 계좌 정보 섹션 -->
    <div class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mx-4 mt-4 p-5">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">계좌 정보</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">은행</label>
          <select
            v-model="profileData.bank"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
          >
            <option value="">은행을 선택하세요</option>
            <option value="kb">국민은행</option>
            <option value="shinhan">신한은행</option>
            <option value="woori">우리은행</option>
            <option value="hana">하나은행</option>
            <option value="nh">농협은행</option>
            <option value="ibk">기업은행</option>
            <option value="kakao">카카오뱅크</option>
            <option value="toss">토스뱅크</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">계좌번호</label>
          <input
            v-model="profileData.accountNumber"
            type="text"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="계좌번호를 입력하세요"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">예금주</label>
          <input
            v-model="profileData.accountHolder"
            type="text"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="예금주명을 입력하세요"
          />
        </div>
      </div>
    </div>

    <!-- 비밀번호 변경 섹션 -->
    <div class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mx-4 mt-4 p-5 mb-4">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">비밀번호 변경</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">현재 비밀번호</label>
          <input
            v-model="passwordData.currentPassword"
            type="password"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="현재 비밀번호를 입력하세요"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">새 비밀번호</label>
          <input
            v-model="passwordData.newPassword"
            type="password"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="새 비밀번호를 입력하세요"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">새 비밀번호 확인</label>
          <input
            v-model="passwordData.confirmPassword"
            type="password"
            class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            placeholder="새 비밀번호를 다시 입력하세요"
          />
        </div>
      </div>
    </div>

    <!-- 저장 버튼 -->
    <div class="mx-4 mt-4 mb-4 flex justify-end">
      <button
        @click="saveProfile"
        class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-6 py-2 rounded-lg text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
      >
        <i class="fi fi-rr-disk"></i>
        <span>저장</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const fileInput = ref(null);

const profileData = ref({
  displayName: "오운전",
  phone: "010-1234-5678",
  email: "driver@example.com",
  profileImage: null,
  bank: "kb",
  accountNumber: "101-02***-***",
  accountHolder: "오운전",
});

const passwordData = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileData.value.profileImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = () => {
  // 비밀번호 검증
  if (passwordData.value.newPassword) {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordData.value.newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
  }

  console.log("프로필 저장:", profileData.value);
  if (passwordData.value.newPassword) {
    console.log("비밀번호 변경");
  }

  alert("정보가 저장되었습니다.");
  router.back();
};
</script>
