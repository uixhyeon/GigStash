<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 페이지: WorkerSettings.vue                                           ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 페이지 (Page - components 폴더에 있지만 페이지로 사용됨)       ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 워커(기사) 설정 및 정보 페이지                                     ║
  ║ - 프로필 정보 표시 (이름, 연락처, 이메일)                            ║
  ║ - 일정 정보 요약 (오늘, 이번 주, 이번 달 행사 건수)                  ║
  ║ - 급여 현황 요약                                                     ║
  ║ - 로그아웃 기능                                                      ║
  ║                                                                      ║
  ║ 특징:                                                                ║
  ║ - 프로필 수정 페이지로 이동                                          ║
  ║ - 급여 상세 페이지로 이동                                            ║
  ║ - 캘린더 페이지로 이동                                               ║
  ║ - JSON 데이터 기반 일정 통계 계산                                    ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div class="pb-20">
    <div class="px-4 py-4">
      <!-- 프로필 정보 카드 -->
      <div class="bg-white rounded-2xl shadow-sm p-5">
          <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img v-if="userInfo.profileImage" :src="userInfo.profileImage" alt="프로필" class="w-full h-full object-cover" />
            <span v-else class="text-3xl text-gray-400">👤</span>
          </div>
          <div class="flex-1">
            <div class="text-lg font-bold text-gray-900 mb-1">{{ userInfo.displayName }}</div>
            <div class="text-sm text-gray-600 mb-1">{{ userInfo.phone }}</div>
            <div class="text-sm text-gray-600">{{ userInfo.email }}</div>
          </div>
        </div>
        <div class="mt-4 text-right">
          <button @click="goToEditProfile" class="text-blue-600 text-sm">내정보 수정 ></button>
        </div>
      </div>

      <!-- 일정 정보 카드 -->
      <div class="bg-white rounded-2xl shadow-sm mt-4 p-5">
        <div class="text-lg font-bold text-gray-900 mb-3">전체 운영 일정</div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">오늘 행사</span>
            <span class="text-base text-gray-900">{{ todayScheduleCount }}건</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">이번 주 행사</span>
            <span class="text-base text-gray-900">{{ weekScheduleCount }}건</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">이번 달 행사</span>
            <span class="text-base text-gray-900">{{ monthScheduleCount }}건</span>
          </div>
          <div class="flex justify-end mt-2">
            <button @click="goToCalendar" class="text-blue-600 text-sm">자세히 보기 ></button>
          </div>
        </div>
      </div>

      <!-- 급여 카드 -->
      <div class="bg-white rounded-2xl shadow-sm mt-4 p-5">
        <div class="text-lg font-bold text-gray-900 mb-3">내 급여 현황</div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">오늘</span>
            <span class="text-base text-gray-900">{{ formatCurrency(todaySalary) }}원</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">이번 주</span>
            <span class="text-base text-gray-900">{{ formatCurrency(weekSalary) }}원</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">이번 달</span>
            <span class="text-base text-gray-900">{{ formatCurrency(monthSalary) }}원</span>
          </div>
          <div class="flex justify-end mt-2">
            <button @click="goToSalaryDetail" class="text-blue-600 text-sm">자세히 보기 ></button>
          </div>
        </div>
      </div>

      <!-- 로그아웃 버튼 -->
      <div class="mt-4 mb-4 flex justify-end">
        <button
          @click="handleLogout"
          class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
        >
          <i class="fi fi-rr-sign-out-alt"></i>
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import reservationsData from "@/data/reservations_2025_12.json";

const authStore = useAuthStore();
const router = useRouter();

const userInfo = ref({
  name: authStore.user?.name || "김운전",
  displayName: "김기사",
  phone: "010-1234-5678",
  email: "driver@example.com",
  profileImage: null,
});

const goToCalendar = () => {
  router.push({ name: "WorkerCalendar" });
};

const goToEditProfile = () => {
  router.push({ name: "WorkerEditProfile" });
};

const goToSalaryDetail = () => {
  router.push({ name: "WorkerSalaryDetail" });
};

const handleLogout = () => {
  const isConfirmed = window.confirm("정말 로그아웃하시겠습니까?");
  if (isConfirmed) {
    authStore.logout();
    router.push("/login");
  }
};

// 일정 통계 계산
const today = new Date();
today.setHours(0, 0, 0, 0);

// 날짜별 행사 그룹화
const eventsByDate = computed(() => {
  const eventsMap = {};

  reservationsData.reservations.forEach((r) => {
    const eventDate = r.eventDate || (r.dropoffTime ? r.dropoffTime.split("T")[0] : null);
    if (!eventDate) return;

    const key = `${eventDate}|${r.eventName || "행사"}|${r.eventVenue || "-"}`;
    if (!eventsMap[key]) {
      eventsMap[key] = { date: eventDate };
    }
  });

  return Object.values(eventsMap);
});

// 오늘 일정 수
const todayScheduleCount = computed(() => {
  const todayStr = today.toISOString().split("T")[0];
  return eventsByDate.value.filter((e) => e.date === todayStr).length;
});

// 이번 주 일정 수
const weekScheduleCount = computed(() => {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return eventsByDate.value.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate >= weekStart && eventDate <= weekEnd;
  }).length;
});

// 이번 달 일정 수
const monthScheduleCount = computed(() => {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return eventsByDate.value.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate >= monthStart && eventDate <= monthEnd;
  }).length;
});

// 급여 계산 로직
const HOURLY_WAGE = 20000; // 시급 20,000원

// 근무시간 계산 (행사 시간 + 6시간)
const calculateWorkHours = (eventStartTime, eventEndTime) => {
  if (!eventStartTime || !eventEndTime) return 0;
  
  const start = new Date(eventStartTime);
  const end = new Date(eventEndTime);
  
  // 행사 시간
  const eventDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  // 행사 시간 + 6시간
  return eventDuration + 6;
};

// 급여 계산
const calculateSalary = (workHours) => {
  return Math.round(workHours * HOURLY_WAGE);
};

// 급여 내역 계산 (같은 날짜, 같은 행사는 하나로 묶음)
const salaryDetails = computed(() => {
  const eventMap = {}; // 날짜 + 행사명 + 장소를 키로 사용
  
  reservationsData.reservations.forEach((r) => {
    if (r.eventStartTime && r.eventEndTime) {
      const eventDate = r.eventDate || (r.dropoffTime ? r.dropoffTime.split("T")[0] : null);
      
      if (eventDate) {
        // 같은 날짜, 같은 행사명, 같은 장소는 하나의 행사로 취급
        const eventKey = `${eventDate}|${r.eventName || "행사"}|${r.eventVenue || "-"}`;
        
        if (!eventMap[eventKey]) {
          const workHours = calculateWorkHours(r.eventStartTime, r.eventEndTime);
          const salary = calculateSalary(workHours);
          const date = new Date(eventDate);
          
          eventMap[eventKey] = {
            date: eventDate,
            dateObj: date,
            salary: salary,
          };
        }
      }
    }
  });
  
  return Object.values(eventMap);
});

// 오늘 급여
const todaySalary = computed(() => {
  const todayStr = today.toISOString().split("T")[0];
  return salaryDetails.value
    .filter((item) => item.date === todayStr)
    .reduce((sum, item) => sum + item.salary, 0);
});

// 이번 주 급여
const weekSalary = computed(() => {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return salaryDetails.value
    .filter((item) => {
      const eventDate = item.dateObj;
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= weekStart && eventDate <= weekEnd;
    })
    .reduce((sum, item) => sum + item.salary, 0);
});

// 이번 달 급여
const monthSalary = computed(() => {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return salaryDetails.value
    .filter((item) => {
      const eventDate = item.dateObj;
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= monthStart && eventDate <= monthEnd;
    })
    .reduce((sum, item) => sum + item.salary, 0);
});

// 통화 포맷
const formatCurrency = (amount) => {
  return amount.toLocaleString("ko-KR");
};
</script>
