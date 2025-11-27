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
    <div class="flex items-center justify-between mb-3 mx-4 mt-4">
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

    <!-- 요일 헤더 -->
    <div class="grid grid-cols-7 text-center text-sm text-gray-600 dark:text-gray-400 mb-1 mx-4">
      <div>일</div>
      <div>월</div>
      <div>화</div>
      <div>수</div>
      <div>목</div>
      <div>금</div>
      <div>토</div>
    </div>

    <!-- 달력 그리드 -->
    <div class="grid grid-cols-7 gap-1 mx-4">
      <div
        v-for="d in calendarDays"
        :key="d.key"
        :class="dayClass(d)"
        @click="selectDate(d)"
        class="aspect-square rounded-xl flex flex-col items-center justify-center text-sm cursor-pointer select-none"
      >
        <span>{{ d.date.getDate() }}</span>
        <span
          v-if="countEvents[d.key]"
          class="mt-1 text-sm px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
        >
          {{ countEvents[d.key] }}건
        </span>
      </div>
    </div>

    <!-- 선택 날짜 일정 리스트 -->
    <div class="mt-4 mx-4">
      <div class="mb-2">
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedDateLabel }}일정</p>
      </div>
    </div>

    <!-- 일정 리스트 -->
    <div v-if="selectedEvents.length === 0" class="text-center text-gray-500 dark:text-gray-400 text-sm py-6 mx-4">
      일정이 없습니다.
    </div>
    <ul class="space-y-2 mx-4">
      <li
        v-for="event in selectedEvents"
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
</template>

<script setup>
import { ref, computed } from "vue";
import reservationsData from "@/data/reservations_2025_12.json";

// 현재 날짜 및 선택된 날짜
const today = new Date();
const selectedDate = ref(new Date(today));
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

// 달력 날짜 생성
const calendarDays = computed(() => {
  const start = new Date(year.value, month.value, 1);
  const end = new Date(year.value, month.value + 1, 0);
  const startWeekday = start.getDay();

  const days = [];
  // 이전 달 채우기
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - (startWeekday - i));
    days.push({ date: d, key: fmtKey(d), outside: true });
  }
  // 이번 달
  for (let d = 1; d <= end.getDate(); d++) {
    const cur = new Date(year.value, month.value, d);
    days.push({ date: cur, key: fmtKey(cur), outside: false });
  }
  // 다음 달 채우기 (42칸)
  while (days.length < 42) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    days.push({ date: next, key: fmtKey(next), outside: true });
  }
  return days;
});

// 날짜 스타일 클래스
const dayClass = (d) => {
  const isToday = fmtKey(d.date) === fmtKey(today);
  const isSelected = fmtKey(d.date) === fmtKey(selectedDate.value);
  return [
    d.outside ? "text-gray-400 dark:text-gray-600" : "text-gray-900 dark:text-gray-100",
    isToday ? "ring-1 ring-blue-500 dark:ring-blue-400" : "",
    isSelected ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-white dark:bg-gray-800",
  ];
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

// 날짜별 행사 수
const countEvents = computed(() => {
  const acc = {};
  for (const key in eventsByDate.value) {
    const event = eventsByDate.value[key];
    if (event.date) {
      acc[event.date] = (acc[event.date] || 0) + 1;
    }
  }
  return acc;
});

// 날짜 선택
const selectDate = (d) => {
  selectedDate.value = new Date(d.date);
};

// 선택 날짜 라벨
const selectedDateLabel = computed(() => {
  const d = selectedDate.value;
  return `${d.getMonth() + 1}월${d.getDate()}일`;
});

// 선택한 날짜의 행사 정보
const selectedEvents = computed(() => {
  const key = fmtKey(selectedDate.value);
  const events = [];
  for (const eventKey in eventsByDate.value) {
    if (eventsByDate.value[eventKey].date === key) {
      events.push(eventsByDate.value[eventKey]);
    }
  }
  return events;
});
</script>
