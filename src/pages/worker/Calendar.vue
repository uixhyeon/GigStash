<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 페이지: Calendar.vue                                                 ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 페이지 (Page)                                                  ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 워커(기사) 일정 캘린더 페이지                                      ║
  ║ - 월별 달력 표시 및 날짜별 행사 수 표시                              ║
  ║ - 특정 날짜 선택 시 해당 날짜의 행사 목록 표시                       ║
  ║ - 행사 정보 표시 (행사명, 장소, 운영시간, 예약 고객 수)              ║
  ║                                                                      ║
  ║ 특징:                                                                ║
  ║ - 이전/다음 달 이동                                                  ║
  ║ - 오늘 날짜 하이라이트                                               ║
  ║ - 선택된 날짜 하이라이트                                             ║
  ║ - JSON 데이터 기반 행사 정보 표시                                    ║
  ║ - 날짜별 행사 그룹화 및 집계                                         ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div class="pb-20">
    <!-- 월 이동 버튼 -->
    <div class="flex items-center justify-between mb-6 mx-4 mt-4">
      <button
        @click="prevMonth"
        class="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
        title="이전 달"
      >
        <i
          class="fi fi-rr-angle-left text-2xl text-slate-700 dark:text-slate-300"
        ></i>
      </button>
      <div class="text-lg font-bold text-gray-900 dark:text-white flex-1 text-center">
        {{ year }}년 {{ month + 1 }}월
      </div>
      <button
        @click="nextMonth"
        class="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
        title="다음 달"
      >
        <i
          class="fi fi-rr-angle-right text-2xl text-slate-700 dark:text-slate-300"
        ></i>
      </button>
    </div>

    <!-- 월별 일정 리스트 -->
    <div v-if="monthEvents.length === 0" class="text-center text-gray-500 dark:text-gray-400 text-sm py-6 mx-4">
      이번 달 일정이 없습니다.
    </div>
    <div v-else class="mx-4 space-y-6">
      <div v-for="dateGroup in monthEvents" :key="dateGroup.date" class="space-y-3">
        <!-- 날짜 헤더 -->
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ formatDateHeader(dateGroup.date) }}
          </h3>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            ({{ dateGroup.events.length }}건)
          </span>
        </div>
        
        <!-- 해당 날짜의 일정 리스트 -->
        <ul class="space-y-2">
          <li
            v-for="event in dateGroup.events"
            :key="event.key"
            class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800"
          >
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                행
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-base truncate text-gray-900 dark:text-white">{{ event.eventName }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ event.eventVenue }}</p>
                <div class="mt-1 text-sm text-gray-600 dark:text-gray-500">{{ event.eventType }}</div>
                <div class="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span class="text-sm px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    예약 고객: {{ event.bookedCustomerCount }}명
                  </span>
                  <span
                    v-if="event.operatingHours"
                    class="text-sm px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    {{ event.operatingHours }}
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import reservationsData from "@/data/reservations_2025_12.json";

// 현재 날짜 및 뷰 날짜
const today = new Date();
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));

const year = computed(() => viewDate.value.getFullYear());
const month = computed(() => viewDate.value.getMonth());

// 날짜 key 포맷 함수
const fmtKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 이전/다음 달 이동
const prevMonth = () => {
  viewDate.value = new Date(year.value, month.value - 1, 1);
};

const nextMonth = () => {
  viewDate.value = new Date(year.value, month.value + 1, 1);
};

// 날짜별 행사 정보 계산
const eventsByDate = computed(() => {
  const eventsMap = {};

  reservationsData.reservations.forEach((r) => {
    const eventDate = r.eventDate || (r.dropoffTime ? r.dropoffTime.split("T")[0] : null);
    if (!eventDate) return;

    const eventName = r.eventName || "행사";
    const eventVenue = r.eventVenue || "-";
    const eventType = r.eventType || "-";
    const key = `${eventDate}|${eventName}|${eventVenue}`;

    if (!eventsMap[key]) {
      const eventStart = r.eventStartTime ? new Date(r.eventStartTime) : null;
      const eventEnd = r.eventEndTime ? new Date(r.eventEndTime) : null;

      const formatTime = (date) => {
        if (!date) return "";
        return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      };

      const startTime = formatTime(eventStart);
      const endTime = formatTime(eventEnd);
      const operatingHours = startTime && endTime ? `${startTime} ~ ${endTime}` : "";

      eventsMap[key] = {
        date: eventDate,
        eventName,
        eventVenue,
        eventType,
        operatingHours,
        bookedCustomerCount: 0,
        key,
      };
    }
    eventsMap[key].bookedCustomerCount++;
  });

  return eventsMap;
});

// 현재 월의 일정들을 날짜별로 그룹화
const monthEvents = computed(() => {
  const monthStart = fmtKey(new Date(year.value, month.value, 1));
  const monthEnd = fmtKey(new Date(year.value, month.value + 1, 0));
  
  // 현재 월의 일정만 필터링
  const monthEventsMap = {};
  for (const eventKey in eventsByDate.value) {
    const event = eventsByDate.value[eventKey];
    if (event.date >= monthStart && event.date <= monthEnd) {
      if (!monthEventsMap[event.date]) {
        monthEventsMap[event.date] = [];
      }
      monthEventsMap[event.date].push(event);
    }
  }
  
  // 날짜순으로 정렬하여 배열로 변환
  const sortedDates = Object.keys(monthEventsMap).sort();
  return sortedDates.map(date => ({
    date,
    events: monthEventsMap[date]
  }));
});

// 날짜 헤더 포맷 함수
const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
};
</script>
