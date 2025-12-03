
<template>
  <div class="pb-20">
    <div class="px-4 py-4">
      <!-- 프로필 정보 카드 -->
      <div class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm p-5">
          <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img v-if="userInfo.profileImage" :src="userInfo.profileImage" alt="프로필" class="w-full h-full object-cover" />
            <span v-else class="text-3xl text-gray-400 dark:text-gray-500">👤</span>
          </div>
          <div class="flex-1">
            <div class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ userInfo.displayName }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ userInfo.phone }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ userInfo.email }}</div>
          </div>
        </div>
        <div class="mt-4 text-right">
          <button @click="goToEditProfile" class="text-blue-600 dark:text-blue-400 text-sm">내정보 수정 ></button>
        </div>
      </div>

      <!-- 일정 정보 카드 -->
      <div class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mt-4 p-5">
        <div class="text-lg font-bold text-gray-900 dark:text-white mb-3">전체 운영 일정</div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">오늘 행사</span>
            <span class="text-base text-gray-900 dark:text-white">{{ todayScheduleCount }}건</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">이번 주 행사</span>
            <span class="text-base text-gray-900 dark:text-white">{{ weekScheduleCount }}건</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">이번 달 행사</span>
            <span class="text-base text-gray-900 dark:text-white">{{ monthScheduleCount }}건</span>
          </div>
          <div class="flex justify-end mt-2">
            <button @click="goToCalendar" class="text-blue-600 dark:text-blue-400 text-sm">자세히 보기 ></button>
          </div>
        </div>
      </div>

      <!-- 급여 카드 -->
      <div class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mt-4 p-5">
        <div class="text-lg font-bold text-gray-900 dark:text-white mb-3">내 급여 현황</div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">오늘</span>
            <span class="text-base text-gray-900 dark:text-white">{{ formatCurrency(todaySalary) }}원</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">이번 주</span>
            <span class="text-base text-gray-900 dark:text-white">{{ formatCurrency(weekSalary) }}원</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">이번 달</span>
            <span class="text-base text-gray-900 dark:text-white">{{ formatCurrency(monthSalary) }}원</span>
          </div>
          <div class="flex justify-end mt-2">
            <button @click="goToSalaryDetail" class="text-blue-600 dark:text-blue-400 text-sm">자세히 보기 ></button>
          </div>
        </div>
      </div>

      <!-- 다크모드 토글 & 로그아웃 버튼 -->
      <div class="mt-4 mb-4 flex justify-end items-center gap-3">
        <ComDarkModeToggle />
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
import { customers } from "@/data/customers";
import { events } from "@/data/events";
import { vehicles } from "@/data/vehicles";
import { lockers } from "@/data/lockers";
import { reservations as allReservations } from "@/data/reservations";
import ComDarkModeToggle from "@/components/common/ComDarkModeToggle.vue";

const authStore = useAuthStore();
const router = useRouter();

const userInfo = ref({
  name: authStore.user?.name || "김운전",
  displayName: authStore.user?.name || "김운전",
  phone: "010-1234-5678",
  email: authStore.user?.email || "driver@example.com",
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

// 로그인 이름을 vehicles.js의 driver 이름으로 매핑
const workerNameToDriverName = (name) => {
  const mapping = {
    '박기사': '김운전',
    '김기사': '김운전',
    '이기사': '이운전',
    // 추가 매핑 필요시 여기에 추가
  }
  return mapping[name] || name
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || "김운전");

// 워커가 담당하는 차량
const workerVehicles = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return vehicles.filter((v) => v.driver === driverName);
});

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  const vehicleIds = new Set(workerVehicles.value.map((v) => v.id));
  return lockers.filter((l) => vehicleIds.has(l.vehicleId));
});

// 워커 보관함에 연결된 예약
const workerRawReservations = computed(() => {
  const lockerIds = new Set(workerLockers.value.map((l) => l.id));
  return allReservations.filter((r) => lockerIds.has(r.lockerId));
});

// 워커가 실제로 참여하는 행사 목록
const workerEvents = computed(() => {
  const eventIds = new Set(workerRawReservations.value.map((r) => r.eventId));
  return events.filter((e) => eventIds.has(e.id) && e.eventDate);
});

// 날짜별 행사 그룹화
const eventsByDate = computed(() => {
  const eventsMap = {};

  workerEvents.value.forEach((e) => {
    const eventDate = e.eventDate;
    if (!eventDate) return;

    const key = `${eventDate}|${e.eventName || "행사"}|${e.eventVenue || "-"}`;
    if (!eventsMap[key]) {
      const dateObj = new Date(eventDate);
      eventsMap[key] = { date: eventDate, dateObj };
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
const HOURLY_WAGE = 25000; // 기본 시급 25,000원

// 근무시간 계산 (행사 시간 + 6시간)
const calculateWorkHours = (eventStartTime, eventEndTime) => {
  if (!eventStartTime || !eventEndTime) return 0;

  const start = eventStartTime instanceof Date ? eventStartTime : new Date(eventStartTime);
  const end = eventEndTime instanceof Date ? eventEndTime : new Date(eventEndTime);

  // 행사 시간
  const eventDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  // 행사 시간 + 6시간
  return eventDuration + 6;
};

// 급여 계산 (1일 8시간까지 기본, 초과분은 1.5배 가산)
const calculateSalary = (workHours) => {
  if (!workHours || workHours <= 0) return 0;

  const baseHours = Math.min(workHours, 8);
  const overtimeHours = Math.max(workHours - 8, 0);

  const basePay = baseHours * HOURLY_WAGE;
  const overtimePay = overtimeHours * HOURLY_WAGE * 1.5;

  return Math.round(basePay + overtimePay);
};

// 이벤트 performanceTime을 Date로 변환
const buildEventTimes = (event) => {
  if (!event.eventDate || !event.performanceTime) {
    return { start: null, end: null };
  }

  const dateStr = event.eventDate;
  const perf = event.performanceTime;

  // "HH:MM-HH:MM" 또는 "HH:MM-??:??" 형태
  if (perf.includes("-")) {
    const [startStr, endStr] = perf.split("-");
    const [sh, sm] = startStr.split(":").map((v) => parseInt(v, 10) || 0);

    const start = new Date(
      `${dateStr}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00Z`
    );

    // 끝 시간이 명시된 경우 그대로 사용, 아니면 기본 3시간으로 가정
    if (endStr && endStr.includes(":")) {
      const [eh, em] = endStr.split(":").map((v) => parseInt(v, 10) || 0);
      const end = new Date(
        `${dateStr}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00Z`
      );
      return { start, end };
    } else {
      const end = new Date(start);
      end.setHours(end.getHours() + 3);
      return { start, end };
    }
  }

  // "HH:MM" 단일 값이면 3시간 공연으로 가정
  const [h, m] = perf.split(":").map((v) => parseInt(v, 10) || 0);
  const start = new Date(
    `${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`
  );
  const end = new Date(start);
  end.setHours(end.getHours() + 3);
  return { start, end };
};

// 급여 내역 계산 (같은 날짜, 같은 행사는 하나로 묶음)
const salaryDetails = computed(() => {
  const eventMap = {}; // 날짜 + 행사명 + 장소를 키로 사용

  workerEvents.value.forEach((e) => {
    const eventDate = e.eventDate;
    if (!eventDate) return;

    const eventKey = `${eventDate}|${e.eventName || "행사"}|${e.eventVenue || "-"}`;

    if (!eventMap[eventKey]) {
      const { start, end } = buildEventTimes(e);
      const workHours = calculateWorkHours(start, end);
      const salary = calculateSalary(workHours);
      const date = new Date(eventDate);

      eventMap[eventKey] = {
        date: eventDate,
        dateObj: date,
        salary: salary,
      };
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
