<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║ 페이지: WorkerMain.vue                                               ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║ 타입: 페이지 (Page)                                                  ║
  ║                                                                      ║
  ║ 주요 기능:                                                           ║
  ║ - 워커(기사) 메인 대시보드 페이지                                    ║
  ║ - 오늘 일정 및 위치 정보 표시                                        ║
  ║ - 카카오 맵 연동 및 네비게이션 실행                                  ║
  ║ - 예약 목록 관리 (진행중/완료)                                       ║
   ║ - 예약번호/전화번호로 예약 조회 및 완료 처리                          ║
   ║                                                                      ║
   ║ 주요 모달:                                                           ║
   ║ 1. 진행 인원 모달: 남은 예약과 완료된 예약 목록 표시                 ║
   ║ 2. 바코드 모달: 웹 카메라 연결 및 예약번호/전화번호로 예약 조회      ║
   ║ 3. 주차장 사진 모달: 주차장 위치 사진 슬라이더                       ║
   ║                                                                      ║
   ║ 특징:                                                                ║
   ║ - JSON 데이터 기반 실시간 예약 관리                                  ║
   ║ - 카카오맵 API 연동                                                  ║
   ║ - 웹 카메라 연결 (getUserMedia API 사용)                             ║
  ║ - 오늘 날짜 기준 예약 필터링                                         ║
  ║ - 행사 정보 자동 계산 (장소, 시간, 예약 인원)                        ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->

<template>
  <div class="pb-20">
    <!-- 날짜와 날씨 (카드 위) -->
    <div class="mx-4 mt-4 mb-2 flex items-center justify-between">
      <div class="text-lg font-bold text-gray-900">
        {{ formatDate(new Date()) }}
      </div>
      <!-- 날씨 정보 -->
      <div class="flex items-center gap-2 text-gray-600 text-sm">
        <div class="flex items-center gap-1">
          <span>☁️</span>
          <span>강수 19%</span>
        </div>
        <span>8°C/12°C</span>
      </div>
    </div>

    <!-- 위치 정보 카드 -->
    <div class="bg-white rounded-2xl shadow-sm mx-4 p-5">
      <div class="text-base text-gray-900 mb-3">
        {{ currentLocation }}
      </div>
      <div class="border-t border-dashed border-gray-300 pt-3">
        <div class="text-base text-gray-900">{{ arrivalTime }} 도착 예정</div>
      </div>
    </div>

    <!-- 지도 섹션 -->
    <div class="mx-4 mt-4 relative">
      <div
        class="bg-white rounded-2xl shadow-sm overflow-hidden"
        style="height: 400px"
      >
        <!-- 카카오 맵 영역 -->
        <div id="kakao-map" class="w-full h-full relative">
          <!-- 지도 상단 정보 -->
          <div
            class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md z-10"
          >
            <div class="flex items-center gap-2">
              <i class="fi fi-rr-marker text-blue-600"></i>
              <div class="text-sm text-gray-600">{{ parkingLocationAddress }}</div>
            </div>
          </div>

          <!-- 장소 보기 버튼 -->
          <button
            @click="showParkingModal = true"
            class="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-10 text-sm"
          >
            장소 보기
          </button>

          <!-- 네비게이션 아이콘 -->
          <button
            @click="openKakaoNavigation"
            class="absolute bottom-4 right-4 bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-colors z-10"
          >
            <i class="fi fi-rr-navigation text-blue-600 text-xl leading-none block"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="mx-4 mt-4 flex gap-4">
      <!-- 진행 인원 버튼 -->
      <button
        @click="showParticipantsModal = true"
        class="flex-1 bg-white rounded-2xl shadow-sm p-5 text-left transition-shadow"
      >
        <div class="text-sm text-gray-600 mb-2">남은 예약</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ currentParticipants }}/{{ totalCapacity }}
        </div>
      </button>

      <!-- 바코드찍기 버튼 -->
      <button
        @click="showBarcodeModal = true"
        class="flex-1 bg-blue-600 text-white rounded-2xl shadow-sm p-5 text-base hover:bg-blue-700 transition-colors"
      >
        바코드찍기
      </button>
    </div>

    <!-- 오늘 일정 카드 -->
    <div
      class="block w-[calc(100%-2rem)] mx-4 mt-4 bg-white rounded-2xl shadow-sm p-5 text-left"
    >
      <div class="flex justify-between items-center mb-4">
        <div class="text-lg font-bold text-gray-900">오늘 일정</div>
        <div class="text-base text-gray-900">
          {{ todaySchedule.title }}
        </div>
      </div>

      <div class="border-t border-dashed border-gray-300 pt-4">

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">장소</span>
            <span class="text-base text-gray-900">{{ todaySchedule.location }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">운영 시간</span>
            <span class="text-base text-gray-900"
              >{{ todaySchedule.operatingHours }} ({{
                todaySchedule.duration
              }})</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">예약 인원</span>
            <span class="text-base text-gray-900"
              >{{ todaySchedule.bookedCapacity }}/{{
                todaySchedule.totalCapacity
              }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">상태</span>
            <span class="text-base text-gray-900">{{ todaySchedule.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 진행 인원 모달 -->
    <div
      v-if="showParticipantsModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      @click.self="showParticipantsModal = false"
    >
      <div
        class="w-full max-w-[480px] bg-white dark:bg-slate-800 rounded-2xl h-[70vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div
          class="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center rounded-t-2xl z-10"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              남은 예약
            </h2>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ pendingReservations.length }}/{{ reservations.length }}
            </span>
          </div>
          <button
            @click="showParticipantsModal = false"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        </div>
        <div class="flex-1 overflow-y-auto flex">
          <!-- 왼쪽: 예약번호 (진행중) -->
          <div class="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20">
              <h3
                class="text-sm text-blue-700 dark:text-blue-300 mb-1"
              >
                예약번호
              </h3>
              <div class="text-sm text-blue-600 dark:text-blue-400">
                {{ pendingReservations.length }}건
              </div>
            </div>
            <div class="p-4 space-y-2">
            <!-- 진행중 예약 -->
            <div
              v-for="reservation in pendingReservations"
              :key="reservation.id"
              class="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <div class="mb-2">
                <span
                  class="text-base text-gray-900 dark:text-white"
                  >{{ reservation.id }}</span
                >
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {{ reservation.customerName }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {{ reservation.phone }}
              </div>
              <div class="flex justify-center">
                <button
                  v-if="selectedReservationForComplete?.id !== reservation.id"
                  @click="completeReservationFromList(reservation)"
                  class="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  완료
                </button>
                <button
                  v-else
                  @click="cancelCompleteReservation(reservation)"
                  class="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                >
                  완료 취소
                </button>
              </div>
            </div>
            <div
              v-if="pendingReservations.length === 0"
              class="text-center text-gray-400 dark:text-gray-500 text-sm py-8"
            >
              예약이 없습니다
            </div>
            </div>
          </div>

          <!-- 오른쪽: 완료 예약 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50">
              <h3
                class="text-sm text-gray-600 dark:text-gray-400 mb-1"
              >
                완료 예약
              </h3>
              <div class="text-sm text-gray-500 dark:text-gray-500">
                {{ completedReservations.length }}건
              </div>
            </div>
            <div class="p-4 space-y-2">
              <!-- 완료된 예약 (회색으로 표시) -->
              <div
                v-for="reservation in completedReservations"
                :key="reservation.id"
                class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60"
              >
                <div class="mb-2">
                  <span
                    class="text-base text-gray-500 dark:text-gray-400"
                    >{{ reservation.id }}</span
                  >
                </div>
                <div class="text-sm text-gray-400 dark:text-gray-500 mb-1">
                  {{ reservation.customerName }}
                </div>
                <div class="text-sm text-gray-400 dark:text-gray-500 mb-3">
                  {{ reservation.phone }}
                </div>
                <div class="flex justify-center">
                  <button
                    @click="cancelCompleteReservation(reservation)"
                    class="text-sm bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
              <div
                v-if="completedReservations.length === 0"
                class="text-center text-gray-400 dark:text-gray-500 text-sm py-8"
              >
                완료된 예약이 없습니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 바코드찍기 모달 -->
    <div
      v-if="showBarcodeModal"
      class="fixed inset-0 z-50 bg-black flex items-center justify-center"
      @click.self="closeBarcodeModal"
    >
      <div class="w-full max-w-[480px] bg-black mx-auto h-full flex flex-col">
        <div
          class="sticky top-0 bg-gray-900 border-b border-gray-700 p-5 flex justify-between items-center z-10"
        >
          <h2 class="text-lg font-bold text-white">바코드 스캔</h2>
          <button
            @click="closeBarcodeModal"
            class="text-white hover:text-gray-300 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        <!-- 카메라 영역 (위쪽) -->
        <div class="flex-1 relative bg-black">
          <div
            id="barcode-scanner"
            class="w-full h-full flex items-center justify-center"
          >
            <!-- 카메라 비디오가 여기에 표시됩니다 -->
          </div>

          <!-- QR 스캔 영역 가이드 (항상 표시) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div class="relative w-[250px] h-[250px]">
              <!-- 외곽 반투명 배경 -->
              <div class="absolute inset-0 bg-black/30"></div>
              <!-- 모서리 코너 (기역자 모양) -->
              <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>

          <!-- 카메라 비디오 -->
          <video
            v-if="isScanning"
            ref="videoElement"
            autoplay
            playsinline
            class="w-full h-full object-cover"
          ></video>

          <!-- 스캔 안내 -->
          <div
            v-if="!isScanning"
            class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10"
          >
            <div class="text-white text-center mb-4">
              <div
                class="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 mx-auto"
              >
                <i class="fi fi-rr-camera text-4xl text-blue-400"></i>
              </div>
              <p class="text-lg font-bold mb-2">카메라 권한이 필요합니다</p>
              <p class="text-sm text-gray-300">카메라를 활성화해주세요</p>
            </div>
            <button
              @click="startCamera"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg text-base hover:bg-blue-700 transition-colors"
            >
              카메라 시작
            </button>
          </div>

          <!-- 카메라 활성화 중 표시 -->
          <div
            v-if="isScanning"
            class="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm shadow-lg z-20"
          >
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              카메라 활성화 중...
            </div>
          </div>
        </div>

        <!-- 입력 영역 (아래쪽) -->
        <div class="bg-gray-900 border-t border-gray-700 p-5">
          <div class="mb-4">
            <div class="flex gap-2 mb-3">
              <button
                @click="searchType = 'reservation'"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-sm transition-colors',
                  searchType === 'reservation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
                ]"
              >
                예약번호
              </button>
              <button
                @click="searchType = 'phone'"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-sm transition-colors',
                  searchType === 'phone'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
                ]"
              >
                전화번호
              </button>
            </div>
            <input
              v-model="searchInput"
              type="text"
              :placeholder="
                searchType === 'reservation'
                  ? '예약번호를 입력하세요'
                  : '전화번호를 입력하세요'
              "
              class="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="handleSearch"
              class="flex-1 bg-blue-600 text-white py-3 rounded-lg text-base hover:bg-blue-700 transition-colors"
            >
              조회
            </button>
            <button
              v-if="selectedReservation"
              @click="completeReservation"
              class="flex-1 bg-green-600 text-white py-3 rounded-lg text-base hover:bg-green-700 transition-colors"
            >
              완료
            </button>
          </div>

          <!-- 조회 결과 -->
          <div
            v-if="selectedReservation"
            class="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div class="text-white space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">예약번호</span>
                <span class="text-base">{{ selectedReservation.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">고객명</span>
                <span class="text-base">{{
                  selectedReservation.customerName
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">전화번호</span>
                <span class="text-base">{{
                  selectedReservation.phone
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">주소</span>
                <span class="text-base text-right">{{
                  selectedReservation.address
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">하차 시간</span>
                <span class="text-base">{{
                  selectedReservation.time
                }}</span>
              </div>
              <div
                v-if="selectedReservation.original"
                class="flex justify-between"
              >
                <span class="text-sm text-gray-400">상태</span>
                <span
                  class="text-base"
                  :class="
                    selectedReservation.status === 'done'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  "
                >
                  {{
                    selectedReservation.status === "done" ? "완료" : "진행중"
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 주차장 사진 모달 -->
    <div
      v-if="showParkingModal"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      @click.self="showParkingModal = false"
    >
      <div class="w-full max-w-[480px] h-full bg-black mx-auto flex flex-col">
        <!-- 헤더 -->
        <div
          class="sticky top-0 bg-gray-900 border-b border-gray-700 p-5 flex justify-between items-center z-10"
        >
          <h2 class="text-lg font-bold text-white">주차장 위치</h2>
          <button
            @click="showParkingModal = false"
            class="text-white hover:text-gray-300 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        <!-- 이미지 슬라이더 -->
        <div class="flex-1 relative overflow-hidden">
          <div
            class="flex transition-transform duration-300 ease-in-out h-full"
            :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
          >
            <div
              v-for="(image, index) in parkingImages"
              :key="index"
              class="w-full h-full flex-shrink-0 flex items-center justify-center"
            >
              <img
                :src="image"
                :alt="`주차장 사진 ${index + 1}`"
                class="w-full h-full object-contain"
              />
            </div>
          </div>

          <!-- 이전 버튼 -->
          <button
            v-if="currentImageIndex > 0"
            @click="prevImage"
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <i class="fi fi-rr-angle-left text-xl"></i>
          </button>

          <!-- 다음 버튼 -->
          <button
            v-if="currentImageIndex < parkingImages.length - 1"
            @click="nextImage"
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <i class="fi fi-rr-angle-right text-xl"></i>
          </button>

          <!-- 인디케이터 -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <div
              v-for="(image, index) in parkingImages"
              :key="index"
              class="w-2 h-2 rounded-full transition-colors"
              :class="currentImageIndex === index ? 'bg-white' : 'bg-white/50'"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted, nextTick, computed } from "vue";
import reservationsData from "@/data/reservations_2025_12.json";

// 위치와 도착 시간은 todaySchedule에서 계산됨

const showParticipantsModal = ref(false);
const showBarcodeModal = ref(false);
const showParkingModal = ref(false);

// 바코드 모달 관련
const searchType = ref("reservation"); // 'reservation' or 'phone'
const searchInput = ref("");
const selectedReservation = ref(null);

// 진행인원 모달 관련
// 오늘 날짜 (computed로 만들어서 날짜가 바뀌면 자동 업데이트)
const today = computed(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
});

const todayStr = computed(() => {
  const d = today.value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});

// 완료 상태 관리 (예약 ID를 키로 사용)
const reservationStatusMap = ref(new Map());

// reservations_2025_12.json 데이터를 워커 페이지 형식으로 변환
// 오늘 날짜의 예약만 필터링 (computed로 만들어서 날짜가 바뀌면 자동 업데이트)
const reservations = computed(() => {
  return reservationsData.reservations
    .filter((r) => {
      // dropoffTime 또는 eventDate 기준으로 오늘 날짜 확인
      if (r.dropoffTime) {
        const dropoffDate = new Date(r.dropoffTime);
        const dropoffDateStr = `${dropoffDate.getFullYear()}-${String(dropoffDate.getMonth() + 1).padStart(2, "0")}-${String(dropoffDate.getDate()).padStart(2, "0")}`;
        return dropoffDateStr === todayStr.value;
      }
      if (r.eventDate) {
        return r.eventDate === todayStr.value;
      }
      return false;
    })
    .map((r) => {
      // dropoffTime에서 시간 추출 (ISO 형식: "2025-11-01T15:33:00Z")
      const dropoffDate = r.dropoffTime ? new Date(r.dropoffTime) : null;
      const timeStr = dropoffDate
        ? `${String(dropoffDate.getHours()).padStart(2, "0")}:${String(dropoffDate.getMinutes()).padStart(2, "0")}`
        : "";

      // 완료 상태 확인 (기본값은 "scheduled")
      const status = reservationStatusMap.value.get(r.id) || "scheduled";

      return {
        id: r.id,
        customerName: r.customerName,
        phone: r.customerPhone,
        address: r.deliveryAddress || r.eventVenue || "",
        time: timeStr,
        status: status,
        // 원본 데이터도 함께 저장 (추가 정보 표시용)
        original: r,
      };
    });
});
const selectedReservationForComplete = ref(null);

// 진행중 예약 목록
const pendingReservations = computed(() => {
  return reservations.value.filter((r) => r.status !== "done");
});

// 완료된 예약 목록
const completedReservations = computed(() => {
  return reservations.value.filter((r) => r.status === "done");
});

// 진행 인원 수는 완료되지 않은 예약 수로 계산 (오늘 날짜 기준)
const currentParticipants = computed(() => {
  return pendingReservations.value.length;
});

// 전체 용량은 오늘 날짜의 전체 예약 수로 계산
const totalCapacity = computed(() => {
  return reservations.value.length;
});

// 주차장 사진 슬라이더
const parkingImages = ref([
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
]);

const currentImageIndex = ref(0);

const nextImage = () => {
  if (currentImageIndex.value < parkingImages.value.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

// 카카오 맵 초기화
onMounted(() => {
  // 카카오 맵 스크립트 로드
  if (!window.kakao || !window.kakao.maps) {
    const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
    if (!kakaoApiKey) {
      console.error("카카오맵 API 키가 설정되지 않았습니다. VITE_KAKAO_MAP_APP_KEY 환경 변수를 설정해주세요.");
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_APP_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };
    script.onerror = () => {
      console.error("카카오맵 스크립트를 로드할 수 없습니다.");
    };
    document.head.appendChild(script);
  } else {
    initMap();
  }
});

const initMap = () => {
  nextTick(() => {
    const container = document.getElementById("kakao-map");
    if (!container || !window.kakao?.maps) return;

    // 오늘 일정의 행사 장소에 맞는 좌표 가져오기
    const venue = todaySchedule.value.venue;
    const coordinates = venue && venue !== "-" 
      ? (venueToCoordinates[venue] || venueToCoordinates["default"])
      : venueToCoordinates["default"];

    const options = {
      center: new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng),
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, options);

    // 마커 생성
    const markerPosition = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);

    // 인포윈도우 생성 (현재 위치 표시)
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${currentLocation.value}</div>`,
    });
    infowindow.open(map, marker);
  });
};

// 카카오 네비게이션 열기
const openKakaoNavigation = () => {
  // 목적지 (현재 위치)
  const destination = encodeURIComponent(currentLocation.value);

  // 카카오맵 앱 URL 스킴 (목적지만 지정, 앱에서 출발지 선택 가능)
  // 형식: kakaomap://route?ep=목적지
  const appUrl = `kakaomap://route?ep=${destination}`;

  // 카카오맵 웹 URL (길찾기)
  // 형식: https://map.kakao.com/link/to/목적지
  const webUrl = `https://map.kakao.com/link/to/${destination}`;

  // 앱이 설치되어 있는지 확인 후 앱 열기, 없으면 웹 열기
  const startTime = Date.now();
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = appUrl;
  document.body.appendChild(iframe);

  setTimeout(() => {
    document.body.removeChild(iframe);
    const elapsed = Date.now() - startTime;

    // 앱이 열리지 않았으면 웹으로 이동
    if (elapsed < 2000) {
      window.location.href = webUrl;
    }
  }, 500);
};

// 카메라 관련
const isScanning = ref(false);
const videoElement = ref(null);
let stream = null;

const startCamera = async () => {
  try {
    isScanning.value = true;

    // 카메라 스트림 가져오기
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // 후면 카메라 우선
      },
    });

    // 비디오 요소에 스트림 연결
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    }
  } catch (err) {
    console.error("카메라 시작 실패:", err);
    alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
    isScanning.value = false;
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  isScanning.value = false;
};

const closeBarcodeModal = () => {
  stopCamera();
  searchInput.value = "";
  selectedReservation.value = null;
  showBarcodeModal.value = false;
};

// 예약번호/전화번호로 조회
const handleSearch = () => {
  if (!searchInput.value.trim()) return;

  let found = null;
  const searchTerm = searchInput.value.trim();
  if (searchType.value === "reservation") {
    found = reservations.value.find(
      (r) => r.id === searchTerm || r.id.includes(searchTerm)
    );
  } else {
    // 전화번호 검색 (하이픈 제거 후 비교)
    const normalizedSearch = searchTerm.replace(/-/g, "");
    found = reservations.value.find((r) => {
      const normalizedPhone = r.phone ? r.phone.replace(/-/g, "") : "";
      return (
        normalizedPhone.includes(normalizedSearch) ||
        normalizedSearch.includes(normalizedPhone)
      );
    });
  }

  if (found) {
    selectedReservation.value = found;
  } else {
    alert("예약을 찾을 수 없습니다.");
    selectedReservation.value = null;
  }
};


// 완료 처리
const completeReservation = () => {
  if (!selectedReservation.value) return;

  reservationStatusMap.value.set(selectedReservation.value.id, "done");
  alert("완료 처리되었습니다.");
  selectedReservation.value = null;
  searchInput.value = "";
  closeBarcodeModal();
};

// 완료 취소 처리
const cancelCompleteReservation = (reservation) => {
  reservationStatusMap.value.set(reservation.id, "scheduled");
  selectedReservationForComplete.value = null;
};

// 진행인원 모달에서 완료 처리
const completeReservationFromList = (reservation) => {
  selectedReservationForComplete.value = reservation;
  reservationStatusMap.value.set(reservation.id, "done");
};

// 모달이 닫힐 때 카메라 정리
watch(showBarcodeModal, (newVal) => {
  if (!newVal) {
    stopCamera();
  }
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  stopCamera();
});

// 오늘 일정 계산 (오늘 날짜의 예약 데이터 기반)
const todaySchedule = computed(() => {
  // reservations는 이미 오늘 날짜로 필터링되어 있음
  if (reservations.value.length === 0) {
    return {
      title: "오늘 예정된 행사가 없습니다",
      location: "-",
      operatingHours: "-",
      duration: "-",
      bookedCapacity: 0,
      totalCapacity: 0,
      status: "없음",
      venue: "-",
    };
  }

  // 행사별로 그룹화 (같은 행사명, 같은 장소는 하나로)
  const eventsByVenue = {};
  reservations.value.forEach((r) => {
    const eventName = r.original?.eventName || "행사";
    const venue = r.original?.eventVenue || "-";
    const key = `${eventName}|${venue}`;

    if (!eventsByVenue[key]) {
      const eventStart = r.original?.eventStartTime
        ? new Date(r.original.eventStartTime)
        : null;
      const eventEnd = r.original?.eventEndTime
        ? new Date(r.original.eventEndTime)
        : null;

      eventsByVenue[key] = {
        eventName,
        venue,
        reservations: [],
        startTime: eventStart,
        endTime: eventEnd,
      };
    }
    eventsByVenue[key].reservations.push(r);
  });

  // 가장 많은 예약이 있는 행사 선택
  let mainEvent = null;
  let maxReservations = 0;
  for (const key in eventsByVenue) {
    if (eventsByVenue[key].reservations.length > maxReservations) {
      maxReservations = eventsByVenue[key].reservations.length;
      mainEvent = eventsByVenue[key];
    }
  }

  if (!mainEvent) {
    return {
      title: "오늘 예정된 행사가 없습니다",
      location: "-",
      operatingHours: "-",
      duration: "-",
      bookedCapacity: 0,
      totalCapacity: 0,
      status: "없음",
      venue: "-",
    };
  }

  // 시간 포맷팅
  const formatTime = (date) => {
    if (!date) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const startTime = formatTime(mainEvent.startTime);
  const endTime = formatTime(mainEvent.endTime);
  const operatingHours =
    startTime && endTime ? `${startTime} ~ ${endTime}` : "-";

  // 지속 시간 계산
  let duration = "-";
  if (mainEvent.startTime && mainEvent.endTime) {
    const diff = mainEvent.endTime.getTime() - mainEvent.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      duration = minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    } else {
      duration = `${minutes}분`;
    }
  }

  // 상태 결정
  const completedCount = mainEvent.reservations.filter(
    (r) => r.status === "done"
  ).length;
  const status =
    completedCount === 0
      ? "대기"
      : completedCount === mainEvent.reservations.length
        ? "완료"
        : "진행중";

  return {
    title: mainEvent.eventName,
    location: mainEvent.venue,
    operatingHours,
    duration,
    bookedCapacity: mainEvent.reservations.length,
    totalCapacity: mainEvent.reservations.length,
    status,
    venue: mainEvent.venue,
  };
});

// 행사 장소별 주차장 이름 매핑
const venueToParkingName = {
  "잠실실내체육관": "잠실실내체육관 남측 주차장",
  "KSPO돔": "KSPO돔 주차장",
  "올림픽공원": "올림픽공원 주차장",
  "올림픽공원 올림픽홀": "올림픽공원 주차장",
  // 다른 행사 장소도 추가 가능
};

// 행사 장소별 카카오맵 좌표 (위도, 경도)
const venueToCoordinates = {
  "잠실실내체육관": { lat: 37.5153, lng: 127.1028 },
  "KSPO돔": { lat: 37.5219, lng: 127.1238 },
  "올림픽공원": { lat: 37.5219, lng: 127.1238 },
  "올림픽공원 올림픽홀": { lat: 37.5219, lng: 127.1238 },
  // 기본값 (잠실실내체육관)
  "default": { lat: 37.5153, lng: 127.1028 },
};

// 행사 장소별 주차장 주소 매핑
const venueToParkingAddress = {
  "잠실실내체육관": "서울특별시 > 송파구 > 잠실동",
  "KSPO돔": "서울특별시 > 송파구 > 올림픽로",
  "올림픽공원": "서울특별시 > 송파구 > 올림픽로",
  // 다른 행사 장소도 추가 가능
};

// 현재 위치 (오늘 일정의 행사 장소에 맞는 주차장)
const currentLocation = computed(() => {
  const venue = todaySchedule.value.venue;
  if (!venue || venue === "-") {
    return "잠실실내체육관 남측 주차장"; // 기본값
  }
  return venueToParkingName[venue] || `${venue} 주차장`; // 매핑이 없으면 장소명 + 주차장
});

// 도착 예정 시간 (이벤트 시작 시간 - 3시간)
const arrivalTime = computed(() => {
  // todaySchedule에서 이벤트 시작 시간 가져오기
  if (reservations.value.length === 0) {
    return "16:30"; // 기본값
  }

  // 행사별로 그룹화하여 가장 빠른 이벤트 시작 시간 찾기
  let earliestStartTime = null;
  reservations.value.forEach((r) => {
    if (r.original?.eventStartTime) {
      const startTime = new Date(r.original.eventStartTime);
      if (!earliestStartTime || startTime < earliestStartTime) {
        earliestStartTime = startTime;
      }
    }
  });

  if (!earliestStartTime) {
    return "16:30"; // 기본값
  }

  // 이벤트 시작 시간에서 3시간 빼기
  const arrivalDate = new Date(earliestStartTime);
  arrivalDate.setHours(arrivalDate.getHours() - 3);

  // 시간 포맷팅
  const hours = String(arrivalDate.getHours()).padStart(2, "0");
  const minutes = String(arrivalDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
});

// 오늘 일정의 행사 장소에 맞는 주차장 주소
const parkingLocationAddress = computed(() => {
  const venue = todaySchedule.value.venue;
  if (!venue || venue === "-") {
    return "서울특별시 > 송파구 > 잠실동"; // 기본값
  }
  return venueToParkingAddress[venue] || "서울특별시 > 송파구 > 잠실동"; // 매핑이 없으면 기본값
});

// todaySchedule이나 currentLocation이 변경되면 지도 업데이트
watch([todaySchedule, currentLocation], () => {
  if (window.kakao?.maps) {
    initMap();
  }
}, { deep: true });

const formatDate = (date) => {
  const weekdays = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 ${weekday}`;
};
</script>
