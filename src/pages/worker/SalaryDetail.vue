<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 페이지: SalaryDetail.vue                                             ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 페이지 (Page)                                                  ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 워커(기사) 급여 상세 페이지                                        ║
  ║ - 급여 내역 조회 (일별, 주별, 월별 필터)                             ║
  ║ - 급여 계산 (시급 × 근무시간)                                        ║
  ║ - 지급 완료 내역 및 지급 예정 내역 표시                              ║
  ║                                                                      ║
  ║ 특징:                                                                ║
  ║ - 기간별 필터링 (일별, 주별, 월별)                                   ║
  ║ - 행사 시간 + 6시간 = 근무시간 계산                                  ║
  ║ - 시급 20,000원 기준                                                 ║
  ║ - JSON 데이터 기반 급여 자동 계산                                    ║
  ║ - 지급 완료/예정 내역 분리 표시                                      ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div class="pb-20">

    <!-- 급여 상세 카드 -->
    <div class="mx-4 mt-4">
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <!-- 기간 필터 -->
        <div class="mb-4">
          <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              @click="periodFilter = 'day'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                periodFilter === 'day'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              ]"
            >
              일별
            </button>
            <button
              @click="periodFilter = 'week'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                periodFilter === 'week'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              ]"
            >
              주별
            </button>
            <button
              @click="periodFilter = 'month'"
              :class="[
                'flex-1 py-2 rounded-lg text-sm transition-colors',
                periodFilter === 'month'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              ]"
            >
              월별
            </button>
          </div>
        </div>
        
        <h2 class="text-lg font-bold text-gray-900 mb-4">급여 상세</h2>
        
        <div class="space-y-3">
          <div
            v-for="item in filteredSalaryDetails"
            :key="item.id"
            class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
          >
            <div>
              <div class="text-base text-gray-900">{{ item.label }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ item.workHours }}시간</div>
            </div>
            <div class="text-base text-gray-900">
              {{ formatCurrency(item.salary) }}원
            </div>
          </div>
          
          <div
            v-if="filteredSalaryDetails.length === 0"
            class="text-center text-gray-400 text-sm py-8"
          >
            급여 내역이 없습니다.
          </div>
        </div>

        <!-- 총 급여 -->
        <div
          v-if="filteredSalaryDetails.length > 0"
          class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center"
        >
          <span class="text-base text-gray-900">총 급여</span>
          <span class="text-2xl font-bold text-blue-600">
            {{ formatCurrency(totalSalary) }}원
          </span>
        </div>
      </div>
    </div>

    <!-- 지급 내역 -->
    <div class="mx-4 mt-4">
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h2 class="text-lg font-bold text-gray-900 mb-4">지급 내역</h2>
        
        <!-- 지급 완료 내역 -->
        <div class="mb-6">
          <h3 class="text-sm text-gray-600 mb-3">지급 완료</h3>
          <div class="space-y-2">
            <div
              v-for="item in completedPayments"
              :key="item.id"
              class="flex justify-between items-center py-2"
            >
              <div>
                <div class="text-base text-gray-900">{{ item.period }}</div>
                <div class="text-sm text-gray-600">{{ item.paymentDate }}</div>
              </div>
              <div class="text-base text-gray-900">
                {{ formatCurrency(item.amount) }}원
              </div>
            </div>
            <div
              v-if="completedPayments.length === 0"
              class="text-center text-gray-400 text-sm py-4"
            >
              지급 완료 내역이 없습니다.
            </div>
          </div>
        </div>

        <!-- 지급 예정 내역 -->
        <div>
          <h3 class="text-sm text-gray-600 mb-3">지급 예정</h3>
          <div class="space-y-2">
            <div
              v-for="item in scheduledPayments"
              :key="item.id"
              class="flex justify-between items-center py-2"
            >
              <div>
                <div class="text-base text-gray-900">{{ item.period }}</div>
                <div class="text-sm text-gray-600">예정일: {{ item.scheduledDate }}</div>
              </div>
              <div class="text-base text-blue-600">
                {{ formatCurrency(item.amount) }}원
              </div>
            </div>
            <div
              v-if="scheduledPayments.length === 0"
              class="text-center text-gray-400 text-sm py-4"
            >
              지급 예정 내역이 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import reservationsData from "@/data/reservations_2025_12.json";

const periodFilter = ref("month"); // 'day', 'week', 'month'

// 시급
const HOURLY_WAGE = 20000;

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

// 예약 데이터를 급여 내역으로 변환 (같은 날짜, 같은 행사는 하나로 묶음)
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
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          
          eventMap[eventKey] = {
            id: eventKey,
            date: eventDate,
            dateObj: date,
            weekStart: weekStart,
            monthKey: monthKey,
            eventName: r.eventName || "행사",
            workHours: workHours,
            salary: salary,
          };
        }
      }
    }
  });
  
  return Object.values(eventMap);
});

// 필터링된 급여 내역
const filteredSalaryDetails = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let filtered = [];
  
  if (periodFilter.value === "day") {
    // 일별: 최근 7일 (각 행사별로 표시)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    filtered = salaryDetails.value
      .filter((item) => item.dateObj >= sevenDaysAgo)
      .map((item) => ({
        id: item.id,
        label: `${formatDateLabel(item.date)} - ${item.eventName}`,
        workHours: Math.round(item.workHours * 10) / 10,
        salary: item.salary,
      }))
      .sort((a, b) => {
        // 날짜로 먼저 정렬, 같은 날짜면 행사명으로 정렬
        const dateA = a.id.split("|")[0];
        const dateB = b.id.split("|")[0];
        if (dateA !== dateB) {
          return new Date(dateB) - new Date(dateA);
        }
        return a.label.localeCompare(b.label);
      });
      
  } else if (periodFilter.value === "week") {
    // 주별: 최근 8주
    const weekGroups = {};
    salaryDetails.value.forEach((item) => {
      const weekKey = `${item.weekStart.getFullYear()}-W${getWeekNumber(item.weekStart)}`;
      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = {
          weekKey,
          weekStart: item.weekStart,
          workHours: 0,
          salary: 0,
        };
      }
      weekGroups[weekKey].workHours += item.workHours;
      weekGroups[weekKey].salary += item.salary;
    });
    
    filtered = Object.values(weekGroups)
      .map((group) => ({
        id: group.weekKey,
        label: formatWeekLabel(group.weekStart),
        workHours: Math.round(group.workHours * 10) / 10,
        salary: group.salary,
      }))
      .sort((a, b) => b.weekStart - a.weekStart)
      .slice(0, 8);
      
  } else {
    // 월별: 최근 6개월
    const monthGroups = {};
    salaryDetails.value.forEach((item) => {
      if (!monthGroups[item.monthKey]) {
        monthGroups[item.monthKey] = {
          monthKey: item.monthKey,
          workHours: 0,
          salary: 0,
        };
      }
      monthGroups[item.monthKey].workHours += item.workHours;
      monthGroups[item.monthKey].salary += item.salary;
    });
    
    filtered = Object.values(monthGroups)
      .map((group) => ({
        id: group.monthKey,
        label: formatMonthLabel(group.monthKey),
        workHours: Math.round(group.workHours * 10) / 10,
        salary: group.salary,
      }))
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 6);
  }
  
  return filtered;
});

// 총 급여
const totalSalary = computed(() => {
  return filteredSalaryDetails.value.reduce((sum, item) => sum + item.salary, 0);
});

// 지급 완료 내역 (예시 데이터)
const completedPayments = computed(() => {
  // 실제로는 API에서 가져와야 하지만, 예시로 계산된 급여를 기반으로 생성
  const payments = [];
  const monthGroups = {};
  
  salaryDetails.value.forEach((item) => {
    if (!monthGroups[item.monthKey]) {
      monthGroups[item.monthKey] = {
        monthKey: item.monthKey,
        salary: 0,
      };
    }
    monthGroups[item.monthKey].salary += item.salary;
  });
  
  // 지난 달까지는 지급 완료로 표시
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  
  Object.entries(monthGroups).forEach(([monthKey, group]) => {
    if (monthKey < currentMonth) {
      const [year, month] = monthKey.split("-");
      payments.push({
        id: `completed-${monthKey}`,
        period: formatMonthLabel(monthKey),
        amount: group.salary,
        paymentDate: `${year}년 ${parseInt(month)}월 말일`,
      });
    }
  });
  
  return payments.sort((a, b) => b.id.localeCompare(a.id));
});

// 지급 예정 내역
const scheduledPayments = computed(() => {
  const payments = [];
  const monthGroups = {};
  
  salaryDetails.value.forEach((item) => {
    if (!monthGroups[item.monthKey]) {
      monthGroups[item.monthKey] = {
        monthKey: item.monthKey,
        salary: 0,
      };
    }
    monthGroups[item.monthKey].salary += item.salary;
  });
  
  // 이번 달은 지급 예정으로 표시
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  
  Object.entries(monthGroups).forEach(([monthKey, group]) => {
    if (monthKey >= currentMonth) {
      const [year, month] = monthKey.split("-");
      payments.push({
        id: `scheduled-${monthKey}`,
        period: formatMonthLabel(monthKey),
        amount: group.salary,
        scheduledDate: `${year}년 ${parseInt(month)}월 말일`,
      });
    }
  });
  
  return payments.sort((a, b) => a.id.localeCompare(b.id));
});

// 날짜 포맷 함수들
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const formatWeekLabel = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return `${weekStart.getMonth() + 1}/${weekStart.getDate()} ~ ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
};

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-");
  return `${year}년 ${parseInt(month)}월`;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const formatCurrency = (amount) => {
  return amount.toLocaleString("ko-KR");
};
</script>

