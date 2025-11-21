<template>
  <div class="w-full">
    <!-- 상단 정산 요약 카드 -->
    <div class="mb-4">
      <div
        class="p-4 bg-linear-to-br from-green-300 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl text-white shadow-lg">
        <p class="text-sm opacity-90 mb-2">이번 달 정산 금액</p>
        <p class="text-4xl font-bold mb-4">₩1,850,000</p>
        <div class="flex items-center justify-between text-sm">
          <div class="bg-white/20 rounded-lg px-3 py-2">총 15건 완료</div>
          <div class="text-right">
            <p class="text-xs opacity-80">정산 완료</p>
            <p class="text-lg font-semibold">₩1,500,000</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 정산 상태 필터 -->
    <div class="mb-4">
      <div class="flex gap-2 overflow-auto no-scrollbar">
        <button
          v-for="status in statusOptions"
          :key="status.value"
          @click="selectedStatus = status.value"
          class="px-4 py-2 rounded-full text-sm border shadow-sm whitespace-nowrap transition-colors"
          :class="
            selectedStatus === status.value
              ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
          ">
          {{ status.label }}
        </button>
      </div>
    </div>
    <!-- 정산 내역 목록 -->
    <div class="space-y-3">
      <div
        v-for="payment in filteredPayments"
        :key="payment.id"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
        <!-- 날짜와 상태  -->
        <div class="flex items-center justify-between mb-3">
          <p class="font-semibold text-gray-900 dark:text-white">
            {{ payment.date }}
          </p>
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="
              payment.status === 'completed'
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
            ">
            {{ payment.status === "completed" ? "정산 완료" : "정산 대기" }}
          </span>
        </div>
        <!-- 매장정보 -->
        <div class="flex items-start gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center">
            <span class="text-2xl">🏪</span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900 dark:text-white">
              {{ payment.storeName }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ payment.address }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ payment.time }}
            </p>
          </div>
        </div>
        <!-- 금액정보 -->
        <div class="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">청소 금액</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">₩{{ payment.amount.toLocaleString() }}</p>
          </div>
          <div v-if="payment.status === 'completed'" class="text-right">
            <p class="text-xs text-gray-500 dark:text-gray-400">정산일</p>
            <p class="text-sm font-medium text-green-600 dark:text-green-400">
              {{ payment.paidDate }}
            </p>
          </div>
        </div>
        <!-- 상세 버튼 -->
        <button
          @click="viewDetail(payment)"
          class="mt-3 w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
          상세 보기
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";

const statusOptions = [
  { label: "전체", value: "all" },
  { label: "정산 완료", value: "completed" },
  { label: "정산 대기", value: "waiting" },
];
const selectedStatus = ref("all");
// console.log(selectedStatus.value);
// 정산 내역 데이터
const payments = ref([
  {
    id: 1,
    date: "2025년 1월 15일",
    storeName: "스타벅스 강남점",
    address: "강남구 역삼동",
    time: "오후 2시",
    amount: 120000,
    status: "completed",
    paidDate: "2025년 10월 20일",
  },
  {
    id: 2,
    date: "2025년 1월 14일",
    storeName: "이디야커피 홍대점",
    address: "마포구 연남동",
    time: "오전 10시",
    amount: 100000,
    status: "completed",
    paidDate: "2025년 1월 20일",
  },
  {
    id: 3,
    date: "2025년 1월 13일",
    storeName: "메가커피 브라이트",
    address: "송파구 잠실동",
    time: "오후 4시",
    amount: 150000,
    status: "waiting",
  },
  {
    id: 4,
    date: "2025년 1월 12일",
    storeName: "빙수카페",
    address: "용산구 이태원동",
    time: "오전 11시",
    amount: 130000,
    status: "waiting",
  },
  {
    id: 5,
    date: "2025년 1월 12일",
    storeName: "빙수카페",
    address: "용산구 이태원동",
    time: "오전 11시",
    amount: 130000,
    status: "waiting",
  },
  {
    id: 6,
    date: "2025년 1월 12일",
    storeName: "빙수카페",
    address: "용산구 이태원동",
    time: "오전 11시",
    amount: 130000,
    status: "waiting",
  },
]);
// 정산 내역 필터랑 함수
const filteredPayments = computed(() => {
  let result = [...payments.value];
  // 상태 필더링(정산완료 / 정산 대기)
  if (selectedStatus.value !== "all") {
    result = result.filter((payment) => payment.status === selectedStatus.value);
  }
  return result;
});
// 상세보기버튼 클릭시
function viewDetail(payment) {
  alert(`
${payment.storeName}\n정산 상세 정보\n금액: ₩${payment.amount.toLocaleString()}\n상태:${
    payment.status === "complete" ? "정상 완료" : "정산 대기"
  }

`);
}
</script>
