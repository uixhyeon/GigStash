<template>
  <div class="pb-20">
    <!-- 날짜와 날씨 (카드 위) -->
    <div class="mx-4 mt-4 mb-2 flex items-center justify-between">
      <div class="text-lg font-bold text-gray-900 dark:text-white">
        {{ formatDate(new Date()) }}
      </div>
      <!-- 날씨 정보 -->
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
        <div class="flex items-center gap-1">
          <span>☁️</span>
          <span>강수 19%</span>
        </div>
        <span>8°C/12°C</span>
      </div>
    </div>

    <!-- 위치 정보 카드 -->
    <div
      v-if="assignedEventInfo"
      class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mx-4 p-5"
    >
      <div class="text-base text-gray-900 dark:text-white mb-3">
        {{ assignedEventInfo.venue }}
      </div>
      <div class="border-t border-dashed border-gray-300 dark:border-gray-700 pt-3">
        <div class="text-base text-gray-900 dark:text-white">
          {{ assignedEventInfo.arrivalTime }} 도착 예정
        </div>
      </div>
    </div>
    <div
      v-else
      class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm mx-4 p-5"
    >
      <div class="text-base text-gray-900 dark:text-white text-center">오늘은 일정이 없습니다</div>
    </div>

    <!-- 지도 섹션 -->
    <div class="mx-4 mt-4 relative">
      <div
        class="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
        style="height: 400px"
      >
        <!-- 카카오 맵 영역 -->
        <div id="kakao-map" class="w-full h-full relative">
          <!-- 지도 상단 정보 -->
          <div
            class="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 shadow-md z-10"
          >
            <div class="flex items-center gap-2">
              <i class="fi fi-rr-marker text-blue-600 dark:text-blue-400"></i>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                {{ parkingLocationAddress }}
              </div>
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
      <router-link
        to="/worker/workerMain/remain-customer"
        class="flex-1 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm p-5 text-left transition-shadow"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">남은 예약</div>
        <div class="font-bold text-blue-600 dark:text-blue-400 text-right" style="font-size: 30px">
          {{ currentParticipants }} / {{ totalCapacity }}
        </div>
      </router-link>

      <!-- 바코드찍기 버튼 -->
      <router-link
        to="/worker/workerMain/qr-code"
        class="flex-1 bg-blue-600 text-white rounded-2xl shadow-sm p-5 text-base hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
      >
        바코드찍기
      </router-link>
    </div>

    <!-- 오늘 일정 카드 -->
    <div
      class="block w-[calc(100%-2rem)] mx-4 mt-4 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-sm p-5 text-left"
    >
      <div class="grid grid-cols-[1fr_3fr] justify-between items-center mb-4">
        <div class="text-lg align-middle font-bold text-gray-900 dark:text-white">오늘 일정</div>
        <div class="text-base text-gray-900 dark:text-white">
          {{ todaySchedule.title }}
        </div>
      </div>

      <div class="border-t border-dashed border-gray-300 dark:border-gray-700 pt-4">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">장소</span>
            <span class="text-base text-gray-900 dark:text-white">{{
              todaySchedule.location
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">운행 시간</span>
            <span class="text-base text-gray-900 dark:text-white"
              >{{ todaySchedule.operatingHours }} ({{ todaySchedule.duration }})</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">예약건 수</span>
            <span class="text-base text-gray-900 dark:text-white"
              >{{ todaySchedule.bookedCapacity }}/{{ todaySchedule.totalCapacity }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">고객 수</span>
            <span class="text-base text-gray-900 dark:text-white"
              >{{ todaySchedule.expectedAttendance }}명</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">상태</span>
            <span class="text-base text-gray-900 dark:text-white">{{ todaySchedule.status }}</span>
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
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">남은 예약</h2>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ pendingReservations.length }}/{{ reservations.length }}
            </span>
          </div>
          <button
            @click="showParticipantsModal = false"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>
        <div class="flex-1 overflow-y-auto flex">
          <!-- 왼쪽: 예약번호 (진행중) -->
          <div class="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20">
              <h3 class="text-sm text-blue-700 dark:text-blue-300 mb-1">예약번호</h3>
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
                  <span class="text-base text-gray-900 dark:text-white">{{ reservation.id }}</span>
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
              <h3 class="text-sm text-gray-600 dark:text-gray-400 mb-1">완료 예약</h3>
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
                  <span class="text-base text-gray-500 dark:text-gray-400">{{
                    reservation.id
                  }}</span>
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
            class="text-white hover:text-gray-300 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <!-- 카메라 영역 (위쪽) -->
        <div class="flex-1 relative bg-black">
          <div id="barcode-scanner" class="w-full h-full flex items-center justify-center">
            <!-- 카메라 비디오가 여기에 표시됩니다 -->
          </div>

          <!-- QR 스캔 영역 가이드 (항상 표시) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div class="relative w-[250px] h-[250px]">
              <!-- 외곽 반투명 배경 -->
              <div class="absolute inset-0 bg-black/30"></div>
              <!-- 모서리 코너 (기역자 모양) -->
              <div
                class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"
              ></div>
              <div
                class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"
              ></div>
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
                searchType === 'reservation' ? '예약번호를 입력하세요' : '전화번호를 입력하세요'
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
                <span class="text-base">{{ selectedReservation.customerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">전화번호</span>
                <span class="text-base">{{ selectedReservation.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">주소</span>
                <span class="text-base text-right">{{ selectedReservation.address }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-400">하차 시간</span>
                <span class="text-base">{{ selectedReservation.time }}</span>
              </div>
              <div v-if="selectedReservation.original" class="flex justify-between">
                <span class="text-sm text-gray-400">상태</span>
                <span
                  class="text-base"
                  :class="
                    selectedReservation.status === 'done' ? 'text-green-400' : 'text-yellow-400'
                  "
                >
                  {{ selectedReservation.status === 'done' ? '완료' : '진행중' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 주차장 사진 모달 -->
    <Teleport to="body">
      <div
        v-if="showParkingModal"
        class="fixed top-[68px] bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30"
      >
        <!-- 모달 컨텐츠 (헤더와 하단 탭 바를 고려한 높이) -->
        <div class="w-full h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          <!-- 헤더 -->
          <div
            class="flex-shrink-0 bg-white dark:bg-gray-900 px-4 py-2 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 z-10"
          >
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-gray-900 dark:text-white">주차 장소</h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">·</span>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ currentLocation }}</p>
            </div>
            <button @click="showParkingModal = false" class="transition-colors">
              <i class="fi fi-rr-cross text-gray-600 dark:text-gray-400 text-sm"></i>
            </button>
          </div>

          <!-- 스크롤 가능한 콘텐츠 영역 -->
          <div class="flex-1 overflow-hidden flex flex-col min-h-0">
            <!-- 메인 이미지 -->
            <div class="relative flex-1 bg-gray-100 dark:bg-gray-800 overflow-hidden min-h-0">
              <div
                class="flex transition-transform duration-500 ease-out h-full"
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

              <!-- 좌우 버튼 -->
              <button
                v-if="currentImageIndex > 0"
                @click="prevImage"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-80"
              >
                <i class="fi fi-rr-angle-left text-white/80 text-2xl drop-shadow-lg"></i>
              </button>
              <button
                v-if="currentImageIndex < parkingImages.length - 1"
                @click="nextImage"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-80"
              >
                <i class="fi fi-rr-angle-right text-white/80 text-2xl drop-shadow-lg"></i>
              </button>
            </div>

            <!-- 도트 인디케이터 -->
            <div class="flex-shrink-0 flex justify-center gap-2 py-3 bg-white dark:bg-gray-900">
              <button
                v-for="(image, index) in parkingImages"
                :key="index"
                @click="currentImageIndex = index"
                class="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                :class="
                  currentImageIndex === index
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                "
              ></button>
            </div>

            <!-- 썸네일 목록 -->
            <div class="flex-shrink-0 px-4 pb-3 bg-white dark:bg-gray-900">
              <div class="flex gap-3 justify-center overflow-x-auto scrollbar-hide py-3">
                <button
                  v-for="(image, index) in parkingImages"
                  :key="index"
                  @click="currentImageIndex = index"
                  class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200"
                  :class="
                    currentImageIndex === index
                      ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900 scale-105'
                      : 'opacity-60 hover:opacity-100'
                  "
                >
                  <img
                    :src="image"
                    :alt="`썸네일 ${index + 1}`"
                    class="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>

            <!-- 네비게이션 버튼 -->
            <div class="flex-shrink-0 px-4 pb-4 bg-white dark:bg-gray-900">
              <button
                @click="openKakaoNavigation"
                class="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
              >
                <i class="fi fi-rr-navigation text-base"></i>
                <span>카카오맵으로 길찾기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/dataStore'
import { customers as customersData } from '@/data/customers'
import { events as eventsData } from '@/data/events'
import { lockers as lockersData } from '@/data/lockers'
import { reservations as allReservations } from '@/data/reservations'

const authStore = useAuthStore()
const dataStore = useDataStore()

// dataStore 또는 직접 import 데이터 사용 (dataStore 우선)
const customers = computed(() =>
  dataStore.customers.length > 0 ? dataStore.customers : customersData,
)
const events = computed(() => (dataStore.events.length > 0 ? dataStore.events : eventsData))
const lockers = computed(() => (dataStore.lockers.length > 0 ? dataStore.lockers : lockersData))

// 위치와 도착 시간은 todaySchedule에서 계산됨

const showParticipantsModal = ref(false)
const showBarcodeModal = ref(false)
const showParkingModal = ref(false)

// 바코드 모달 관련
const searchType = ref('reservation') // 'reservation' or 'phone'
const searchInput = ref('')
const selectedReservation = ref(null)

// 진행인원 모달 관련
// 오늘 날짜 (computed로 만들어서 날짜가 바뀌면 자동 업데이트)
const today = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const todayStr = computed(() => {
  const d = today.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 로그인 이름을 driver 이름으로 매핑
const workerNameToDriverName = (name) => {
  // 모든 케이스를 오운전으로 매핑
  return '오운전'
}

// 현재 로그인 워커 이름 (없으면 기본값 사용)
const currentWorkerName = computed(() => authStore.user?.name || '오운전')

// 워커가 담당하는 배차 (dataStore에서 가져오기)
// vehicle에서 driver 정보를 조회하여 필터링
const workerAssignments = computed(() => {
  const driverName = workerNameToDriverName(currentWorkerName.value)
  return dataStore.vehicleAssignments.filter((a) => {
    const vehicle = dataStore.vehicles.find((v) => v.id === a.vehicleId)
    return vehicle?.driver === driverName
  })
})

// 워커의 배차에 포함된 vehicleId / eventId 세트
const workerVehicleIds = computed(() => new Set(workerAssignments.value.map((a) => a.vehicleId)))
const workerEventIds = computed(() => new Set(workerAssignments.value.map((a) => a.eventId)))

// 워커 차량에 연결된 보관함
const workerLockers = computed(() => {
  if (workerVehicleIds.value.size === 0) return []
  const lockersArray = Array.isArray(lockers.value) ? lockers.value : lockers
  return lockersArray.filter((l) => workerVehicleIds.value.has(l.vehicleId))
})

// 워커 보관함에 연결된 예약 (정규화된 reservations.js 기반)
// ⚠️ lockerId 필터링 제거 - eventId만으로 필터링 (예약이 오운전 차량 locker에 연결되지 않은 경우 대비)
const workerRawReservations = computed(() => {
  console.log('🔍 [workerRawReservations] 시작')

  if (workerEventIds.value.size === 0) {
    console.log('❌ workerEventIds가 비어있음')
    return []
  }

  const eventIds = workerEventIds.value

  console.log('🔍 [workerRawReservations] 필터링 전:')
  console.log('  - workerAssignments:', workerAssignments.value.length, '개')
  console.log('  - workerEventIds:', Array.from(eventIds))
  console.log('  - allReservations 총 개수:', allReservations.length)

  // eventId만으로 필터링 (lockerId 필터링 제거)
  const filtered = allReservations.filter((r) => eventIds.has(r.eventId))

  console.log('✅ [workerRawReservations] 필터링 결과:', filtered.length, '개')
  if (filtered.length > 0) {
    console.log('  - 첫 번째 예약:', {
      id: filtered[0].id,
      lockerId: filtered[0].lockerId,
      eventId: filtered[0].eventId,
      customerId: filtered[0].customerId,
      status: filtered[0].status,
    })
    // eventId별 예약 수 확인
    const byEvent = {}
    filtered.forEach((r) => {
      byEvent[r.eventId] = (byEvent[r.eventId] || 0) + 1
    })
    console.log('  - eventId별 예약 수:', byEvent)
  } else {
    console.log('  ⚠️ 필터링된 예약이 없습니다!')
  }

  return filtered
})

// 완료 상태 관리 (예약 ID를 키로 사용)
const reservationStatusMap = ref(new Map())

// 고객/행사 정보를 join 해서 워커 페이지에서 쓰기 편한 형태로 변환
const reservations = computed(() => {
  const customersArray = Array.isArray(customers.value) ? customers.value : customers
  const eventsArray = Array.isArray(events.value) ? events.value : events

  const customerMap = new Map(customersArray.map((c) => [c.id, c]))
  const eventMap = new Map(eventsArray.map((e) => [e.id, e]))

  // 메인 행사의 eventId 가져오기
  const todayEvents = []
  for (const eventId of workerEventIds.value) {
    const event = eventMap.get(eventId)
    if (event && event.eventDate === todayStr.value) {
      todayEvents.push(event)
    }
  }

  let mainEventId = null
  if (todayEvents.length > 0) {
    // 가장 많은 배차가 있는 행사 선택
    let mainEvent = todayEvents[0]
    let maxAssignments = 0
    for (const event of todayEvents) {
      const assignmentCount = workerAssignments.value.filter((a) => a.eventId === event.id).length
      if (assignmentCount > maxAssignments) {
        maxAssignments = assignmentCount
        mainEvent = event
      }
    }
    mainEventId = mainEvent.id
  }

  console.log('🔍 [reservations] Step 1: 데이터 확인')
  console.log('  - customers 배열 길이:', customersArray.length)
  console.log('  - events 배열 길이:', eventsArray.length)
  console.log('  - workerRawReservations:', workerRawReservations.value.length, '개')
  console.log('  - todayStr:', todayStr.value)
  console.log('  - workerEventIds:', Array.from(workerEventIds.value))
  console.log(
    '  - todayEvents:',
    todayEvents.length,
    '개',
    todayEvents.map((e) => e.id),
  )
  console.log('  - mainEventId:', mainEventId)

  if (!mainEventId) {
    console.log('  ❌ 메인 행사 없음 - 빈 배열 반환')
    return []
  }

  // Step 2: 메인 행사의 모든 예약 가져오기 (날짜 필터링 제거, 취소만 제외)
  const filtered = workerRawReservations.value.filter((r) => {
    // 취소된 예약 제외
    if (r.status === 'cancelled') {
      return false
    }

    // 메인 행사의 eventId와 일치하는 예약만
    if (r.eventId === mainEventId) {
      return true
    }

    return false
  })

  console.log('🔍 [reservations] Step 2: 메인 행사 예약 필터링 결과')
  console.log('  - 필터링 후 예약 수:', filtered.length, '개')
  if (filtered.length > 0) {
    console.log('  - 첫 번째 예약:', {
      id: filtered[0].id,
      customerId: filtered[0].customerId,
      eventId: filtered[0].eventId,
      status: filtered[0].status,
    })
  } else {
    console.log('  ⚠️ 메인 행사에 해당하는 예약이 없습니다!')
    console.log('  - workerRawReservations의 eventId들:', [
      ...new Set(workerRawReservations.value.map((r) => r.eventId)),
    ])
  }

  // Step 3: 고객 정보 join
  const mapped = filtered.map((r, index) => {
    const customer = customerMap.get(r.customerId)
    const event = eventMap.get(r.eventId)

    if (index < 3) {
      // 처음 3개만 로그 출력
      console.log(
        `  - 예약 ${r.id}: customer=${customer ? customer.name : '없음'} (${r.customerId}), event=${event ? event.eventName : '없음'} (${r.eventId})`,
      )
    }

    if (!customer) {
      console.warn('⚠️ 고객 정보 없음:', r.customerId, '예약:', r.id)
    }
    if (!event) {
      console.warn('⚠️ 이벤트 정보 없음:', r.eventId, '예약:', r.id)
    }

    // 하차 시간은 예약 endTime 기준
    const dropoffDate = r.endTime ? new Date(r.endTime) : null
    const timeStr = dropoffDate
      ? `${String(dropoffDate.getHours()).padStart(2, '0')}:${String(dropoffDate.getMinutes()).padStart(2, '0')}`
      : ''

    // 완료 상태 확인 (기본값은 "scheduled")
    const status =
      reservationStatusMap.value.get(r.id) || (r.status === 'completed' ? 'done' : 'scheduled')

    return {
      id: r.id,
      customerName: customer?.name || '고객',
      phone: customer?.phone || '',
      address: event?.eventVenue || '',
      time: timeStr,
      status,
      // 원본 데이터도 함께 저장 (추가 정보 표시용)
      original: {
        ...r,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        eventName: event?.eventName,
        eventDate: event?.eventDate,
        eventVenue: event?.eventVenue,
        eventStartTime:
          event?.eventDate && event?.performanceTime
            ? new Date(
                `${event.eventDate}T${(event.performanceTime || '00:00').split('-')[0]}:00Z`,
              ).toISOString()
            : null,
        eventEndTime: null,
      },
    }
  })

  console.log('✅ 최종 reservations:', mapped.length, '개')
  if (mapped.length > 0) {
    console.log('  - 첫 번째 최종 예약:', mapped[0])
  }

  return mapped
})
const selectedReservationForComplete = ref(null)

// 진행중 예약 목록
const pendingReservations = computed(() => {
  return reservations.value.filter((r) => r.status !== 'done')
})

// 완료된 예약 목록
const completedReservations = computed(() => {
  return reservations.value.filter((r) => r.status === 'done')
})

// 진행 인원 수는 완료되지 않은 예약 수로 계산 (오늘 날짜 기준)
const currentParticipants = computed(() => {
  return pendingReservations.value.length
})

// 전체 용량은 오늘 날짜의 전체 예약 수로 계산
const totalCapacity = computed(() => {
  return reservations.value.length
})

// 주차장 사진 슬라이더
const parkingImages = ref([
  '/workerImg/parking1.jpg',
  '/workerImg/parking2.jpg',
  '/workerImg/parking3.jpg',
])

const currentImageIndex = ref(0)

const nextImage = () => {
  if (currentImageIndex.value < parkingImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// 카카오맵 인스턴스 저장
const kakaoMap = ref(null)
const kakaoMarker = ref(null)
const kakaoInfoWindow = ref(null)

//

// 카카오 맵 초기화
onMounted(() => {
  // API 키 가져오기 (여러 방법 시도)
  let kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY

  // 대안 1: 직접 접근
  if (!kakaoApiKey) {
    kakaoApiKey = import.meta.env['VITE_KAKAO_MAP_APP_KEY']
  }

  // 대안 2: 모든 환경 변수에서 찾기
  if (!kakaoApiKey) {
    const env = import.meta.env
    kakaoApiKey = env.VITE_KAKAO_MAP_APP_KEY || env['VITE_KAKAO_MAP_APP_KEY']
  }

  // 대안 3: .env 파일이 로드되지 않는 경우를 위한 임시 fallback
  // TODO: .env 파일이 정상적으로 로드되면 이 부분 제거
  if (!kakaoApiKey) {
    kakaoApiKey = 'ce0be3a036c1109ce140f2113648226b' // 임시 fallback
  }

  // 카카오 맵 스크립트 로드
  if (!window.kakao || !window.kakao.maps) {
    if (!kakaoApiKey) {
      console.error('=== 카카오맵 API 키 오류 ===')
      console.error('API 키가 설정되지 않았습니다.')
      console.error('확인 사항:')
      console.error('1. .env 파일이 프로젝트 루트에 있는지 확인')
      console.error('2. .env 파일에 VITE_KAKAO_MAP_APP_KEY=값 형식으로 입력되어 있는지 확인')
      console.error('3. 개발 서버를 재시작했는지 확인')
      console.error('4. .env 파일에 따옴표나 공백이 없는지 확인')
      return
    }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false`
    script.onload = () => {
      console.log('카카오맵 스크립트 로드 완료')
      window.kakao.maps.load(() => {
        console.log('카카오맵 SDK 로드 완료')
        initMap()
      })
    }
    script.onerror = () => {
      console.error('카카오맵 스크립트를 로드할 수 없습니다.')
    }
    document.head.appendChild(script)
  } else {
    console.log('카카오맵 SDK 이미 로드됨')
    initMap()
  }
})

const initMap = () => {
  nextTick(() => {
    console.log('initMap 호출')
    const container = document.getElementById('kakao-map')
    console.log('컨테이너:', container ? '찾음' : '없음')
    console.log('window.kakao:', window.kakao ? '있음' : '없음')
    console.log('window.kakao.maps:', window.kakao?.maps ? '있음' : '없음')

    if (!container) {
      console.error('지도 컨테이너를 찾을 수 없습니다.')
      return
    }

    if (!window.kakao?.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.')
      return
    }

    // 오늘 일정의 행사 장소에 맞는 좌표 가져오기
    const venue = todaySchedule.value.venue
    console.log('현재 venue:', venue)

    const coordinates =
      venue && venue !== '-'
        ? venueToCoordinates[venue] || venueToCoordinates['default']
        : venueToCoordinates['default']

    console.log('사용할 좌표:', coordinates)

    try {
      // 기존 지도가 있으면 제거
      if (kakaoMap.value) {
        kakaoMap.value = null
      }
      if (kakaoMarker.value) {
        kakaoMarker.value.setMap(null)
        kakaoMarker.value = null
      }
      if (kakaoInfoWindow.value) {
        kakaoInfoWindow.value.close()
        kakaoInfoWindow.value = null
      }

      const options = {
        center: new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng),
        level: 3,
      }

      kakaoMap.value = new window.kakao.maps.Map(container, options)
      console.log('지도 생성 완료')

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng)
      kakaoMarker.value = new window.kakao.maps.Marker({
        position: markerPosition,
      })
      kakaoMarker.value.setMap(kakaoMap.value)
      console.log('마커 생성 완료')

      // 인포윈도우 생성 (현재 위치 표시)
      kakaoInfoWindow.value = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${currentLocation.value}</div>`,
      })
      kakaoInfoWindow.value.open(kakaoMap.value, kakaoMarker.value)
      console.log('인포윈도우 생성 완료')
    } catch (error) {
      console.error('지도 초기화 중 오류 발생:', error)
    }
  })
}

// 카카오 네비게이션 열기
const openKakaoNavigation = () => {
  // 목적지 (현재 위치)
  const destination = encodeURIComponent(currentLocation.value)

  // 카카오맵 앱 URL 스킴 (목적지만 지정, 앱에서 출발지 선택 가능)
  // 형식: kakaomap://route?ep=목적지
  const appUrl = `kakaomap://route?ep=${destination}`

  // 카카오맵 웹 URL (길찾기)
  // 형식: https://map.kakao.com/link/to/목적지
  const webUrl = `https://map.kakao.com/link/to/${destination}`

  // 앱이 설치되어 있는지 확인 후 앱 열기, 없으면 웹 열기
  const startTime = Date.now()
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = appUrl
  document.body.appendChild(iframe)

  setTimeout(() => {
    document.body.removeChild(iframe)
    const elapsed = Date.now() - startTime

    // 앱이 열리지 않았으면 웹으로 이동
    if (elapsed < 2000) {
      window.location.href = webUrl
    }
  }, 500)
}

// 카메라 관련
const isScanning = ref(false)
const videoElement = ref(null)
let stream = null

const startCamera = async () => {
  try {
    isScanning.value = true

    // 카메라 스트림 가져오기
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 후면 카메라 우선
      },
    })

    // 비디오 요소에 스트림 연결
    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }
  } catch (err) {
    console.error('카메라 시작 실패:', err)
    alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.')
    isScanning.value = false
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  isScanning.value = false
}

const closeBarcodeModal = () => {
  stopCamera()
  searchInput.value = ''
  selectedReservation.value = null
  showBarcodeModal.value = false
}

// 예약번호/전화번호로 조회
const handleSearch = () => {
  if (!searchInput.value.trim()) return

  let found = null
  const searchTerm = searchInput.value.trim()
  if (searchType.value === 'reservation') {
    found = reservations.value.find((r) => r.id === searchTerm || r.id.includes(searchTerm))
  } else {
    // 전화번호 검색 (하이픈 제거 후 비교)
    const normalizedSearch = searchTerm.replace(/-/g, '')
    found = reservations.value.find((r) => {
      const normalizedPhone = r.phone ? r.phone.replace(/-/g, '') : ''
      return (
        normalizedPhone.includes(normalizedSearch) || normalizedSearch.includes(normalizedPhone)
      )
    })
  }

  if (found) {
    selectedReservation.value = found
  } else {
    alert('예약을 찾을 수 없습니다.')
    selectedReservation.value = null
  }
}

// 완료 처리
const completeReservation = () => {
  if (!selectedReservation.value) return

  reservationStatusMap.value.set(selectedReservation.value.id, 'done')
  alert('완료 처리되었습니다.')
  selectedReservation.value = null
  searchInput.value = ''
  closeBarcodeModal()
}

// 완료 취소 처리
const cancelCompleteReservation = (reservation) => {
  reservationStatusMap.value.set(reservation.id, 'scheduled')
  selectedReservationForComplete.value = null
}

// 진행인원 모달에서 완료 처리
const completeReservationFromList = (reservation) => {
  selectedReservationForComplete.value = reservation
  reservationStatusMap.value.set(reservation.id, 'done')
}

// 모달이 닫힐 때 카메라 정리
watch(showBarcodeModal, (newVal) => {
  if (!newVal) {
    stopCamera()
  }
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  stopCamera()
})

// 오늘 일정 계산 (오늘 날짜의 배정된 이벤트 기반)
const todaySchedule = computed(() => {
  const eventsArray = Array.isArray(events.value) ? events.value : events
  const eventMap = new Map(eventsArray.map((e) => [e.id, e]))

  // 오늘 날짜의 배정된 이벤트 찾기
  const todayEvents = []
  for (const eventId of workerEventIds.value) {
    const event = eventMap.get(eventId)
    if (event && event.eventDate === todayStr.value) {
      todayEvents.push(event)
    }
  }

  if (todayEvents.length === 0) {
    return {
      title: '오늘 예정된 행사가 없습니다',
      location: '-',
      operatingHours: '-',
      duration: '-',
      bookedCapacity: 0,
      totalCapacity: 0,
      expectedAttendance: 0,
      status: '없음',
      venue: '-',
    }
  }

  // 가장 많은 배차가 있는 행사 선택 (또는 첫 번째 행사)
  let mainEvent = todayEvents[0]
  let maxAssignments = 0

  for (const event of todayEvents) {
    const assignmentCount = workerAssignments.value.filter((a) => a.eventId === event.id).length
    if (assignmentCount > maxAssignments) {
      maxAssignments = assignmentCount
      mainEvent = event
    }
  }

  // 오늘 날짜의 예약 수 계산 (reservations.value는 이미 오늘 날짜로 필터링됨)
  const todayReservations = reservations.value.filter((r) => r.original?.eventId === mainEvent.id)

  // 취소되지 않은 예약만 카운트
  const bookedCapacity = todayReservations.filter(
    (r) => r.status !== 'done' && r.original?.status !== 'cancelled',
  ).length
  const totalCapacity = todayReservations.length

  // 예상 인원 계산 (배차 대수 * 50)
  const vehicleCount = workerAssignments.value.filter((a) => a.eventId === mainEvent.id).length
  const expectedAttendance = vehicleCount * 50

  // 행사 시작/종료 시간 계산
  const performanceTime = mainEvent.performanceTime || ''
  const performanceStartStr = performanceTime.split('-')[0].trim()

  // 행사 시작 시간
  let eventStartTime = null
  if (performanceStartStr) {
    const [startH, startM] = performanceStartStr.split(':').map(Number)
    eventStartTime = new Date(mainEvent.eventDate)
    eventStartTime.setHours(startH || 0, startM || 0, 0, 0)
  }

  // 행사 종료 시간 계산
  let eventEndTime = null
  if (performanceTime.includes('-')) {
    // "18:00-20:00" 형식인 경우
    const endTimeStr = performanceTime.split('-')[1].trim()
    const [endH, endM] = endTimeStr.split(':').map(Number)
    eventEndTime = new Date(mainEvent.eventDate)
    eventEndTime.setHours(endH || 0, endM || 0, 0, 0)
  } else if (mainEvent.runningTime) {
    // runningTime이 있는 경우 (예: "180분", "90분")
    const runningMinutes = parseInt(mainEvent.runningTime.replace(/[^0-9]/g, '')) || 0
    if (eventStartTime && runningMinutes > 0) {
      eventEndTime = new Date(eventStartTime)
      eventEndTime.setMinutes(eventEndTime.getMinutes() + runningMinutes)
    }
  }

  // eventEndTime이 계산되지 않은 경우, 기본값으로 3시간 추가
  if (!eventEndTime && eventStartTime) {
    eventEndTime = new Date(eventStartTime)
    eventEndTime.setHours(eventEndTime.getHours() + 3)
  }

  // 운영 시간: 행사 시작 3시간 전 ~ 행사 종료 3시간 후
  let operatingStartTime = null
  let operatingEndTime = null

  if (eventStartTime) {
    operatingStartTime = new Date(eventStartTime)
    operatingStartTime.setHours(operatingStartTime.getHours() - 3)
  }

  if (eventEndTime) {
    operatingEndTime = new Date(eventEndTime)
    operatingEndTime.setHours(operatingEndTime.getHours() + 3)
  }

  // 운영 시간 포맷팅
  const formatTime = (date) => {
    if (!date) return ''
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const operatingStartStr = formatTime(operatingStartTime)
  const operatingEndStr = formatTime(operatingEndTime)
  const operatingHours =
    operatingStartStr && operatingEndStr
      ? `${operatingStartStr} ~ ${operatingEndStr}`
      : operatingStartStr || '-'

  // 지속 시간 계산 (운영 시간 총 길이)
  let duration = '-'
  if (operatingStartTime && operatingEndTime) {
    const diffMinutes = (operatingEndTime.getTime() - operatingStartTime.getTime()) / (1000 * 60)
    if (diffMinutes > 0) {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      if (hours > 0) {
        duration = minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
      } else {
        duration = `${minutes}분`
      }
    }
  }

  // 상태 결정
  const completedCount = todayReservations.filter((r) => r.status === 'done').length

  const status =
    totalCapacity === 0
      ? '대기'
      : completedCount === 0
        ? '대기'
        : completedCount === totalCapacity
          ? '완료'
          : '진행중'

  return {
    title: mainEvent.eventName,
    location: mainEvent.eventVenue,
    operatingHours,
    duration,
    bookedCapacity: bookedCapacity,
    totalCapacity: totalCapacity || bookedCapacity,
    expectedAttendance: expectedAttendance,
    status,
    venue: mainEvent.eventVenue,
  }
})

// 행사 장소별 주차장 이름 매핑
const venueToParkingName = {
  잠실실내체육관: '잠실실내체육관 남측 주차장',
  KSPO돔: 'KSPO돔 주차장',
  올림픽공원: '올림픽공원 주차장',
  '올림픽공원 올림픽홀': '올림픽공원 주차장',
  // 다른 행사 장소도 추가 가능
}

// 행사 장소별 카카오맵 좌표 (위도, 경도)
const venueToCoordinates = {
  잠실실내체육관: { lat: 37.5153, lng: 127.1028 },
  KSPO돔: { lat: 37.5219, lng: 127.1238 },
  올림픽공원: { lat: 37.5219, lng: 127.1238 },
  '올림픽공원 올림픽홀': { lat: 37.5219, lng: 127.1238 },
  고척돔: { lat: 37.4981, lng: 126.867 },
  고척스카이돔: { lat: 37.4981, lng: 126.867 },
  // 기본값 (잠실실내체육관)
  default: { lat: 37.5153, lng: 127.1028 },
}

// 행사 장소별 주차장 주소 매핑
const venueToParkingAddress = {
  잠실실내체육관: '서울특별시 > 송파구 > 잠실동',
  KSPO돔: '서울특별시 > 송파구 > 올림픽로',
  올림픽공원: '서울특별시 > 송파구 > 올림픽로',
  고척돔: '서울특별시 > 구로구 > 고척동',
  고척스카이돔: '서울특별시 > 구로구 > 고척동',
  // 다른 행사 장소도 추가 가능
}

// 배정된 이벤트 정보 (상단 표시용)
const assignedEventInfo = computed(() => {
  const eventsArray = Array.isArray(events.value) ? events.value : events
  const eventMap = new Map(eventsArray.map((e) => [e.id, e]))

  // 오운전 배정 중 오늘 날짜 행사 찾기
  const todayEventIds = workerEventIds.value
  let todayEvent = null
  let earliestStartTime = null

  // 오늘 날짜의 배정된 이벤트 찾기
  for (const eventId of todayEventIds) {
    const event = eventMap.get(eventId)
    if (!event || event.eventDate !== todayStr.value) continue

    // performanceTime에서 시작 시간 추출
    const performanceTime = event.performanceTime || ''
    const startTimeStr = performanceTime.split('-')[0].trim()

    if (startTimeStr) {
      const [hours, minutes] = startTimeStr.split(':').map(Number)
      const startTime = new Date(event.eventDate)
      startTime.setHours(hours || 0, minutes || 0, 0, 0)

      if (!earliestStartTime || startTime < earliestStartTime) {
        earliestStartTime = startTime
        todayEvent = event
      }
    }
  }

  if (!todayEvent || !earliestStartTime) {
    return null
  }

  // 도착 시간 계산 (운영 시작 시간 = 행사 시작 - 3시간)
  const operatingStartTime = new Date(earliestStartTime)
  operatingStartTime.setHours(operatingStartTime.getHours() - 3)

  // 시간 포맷팅
  const hours = String(operatingStartTime.getHours()).padStart(2, '0')
  const minutes = String(operatingStartTime.getMinutes()).padStart(2, '0')
  const arrivalTime = `${hours}:${minutes}`

  const venue = todayEvent.eventVenue || '장소 미정'
  const venueName = venueToParkingName[venue] || venue

  return {
    venue: venueName,
    arrivalTime: arrivalTime,
  }
})

// 현재 위치 (오늘 일정의 행사 장소에 맞는 주차장) - 하위 호환성 유지
const currentLocation = computed(() => {
  if (assignedEventInfo.value) {
    return assignedEventInfo.value.venue
  }
  const venue = todaySchedule.value.venue
  if (!venue || venue === '-') {
    return '잠실실내체육관 남측 주차장' // 기본값
  }
  return venueToParkingName[venue] || `${venue} 주차장` // 매핑이 없으면 장소명 + 주차장
})

// 도착 예정 시간 (하위 호환성 유지)
const arrivalTime = computed(() => {
  if (assignedEventInfo.value) {
    return assignedEventInfo.value.arrivalTime
  }
  return '16:30' // 기본값
})

// 오늘 일정의 행사 장소에 맞는 주차장 주소
const parkingLocationAddress = computed(() => {
  const venue = todaySchedule.value.venue
  if (!venue || venue === '-') {
    return '서울특별시 > 송파구 > 잠실동' // 기본값
  }
  return venueToParkingAddress[venue] || '서울특별시 > 송파구 > 잠실동' // 매핑이 없으면 기본값
})

// todaySchedule이나 currentLocation이 변경되면 지도 업데이트
watch(
  [todaySchedule, currentLocation],
  () => {
    console.log('지도 업데이트 필요 - todaySchedule 또는 currentLocation 변경됨')
    if (window.kakao?.maps && kakaoMap.value) {
      const venue = todaySchedule.value.venue
      const coordinates =
        venue && venue !== '-'
          ? venueToCoordinates[venue] || venueToCoordinates['default']
          : venueToCoordinates['default']

      // 지도 중심 이동
      const moveLatLon = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng)
      kakaoMap.value.setCenter(moveLatLon)

      // 마커 위치 이동
      if (kakaoMarker.value) {
        kakaoMarker.value.setPosition(moveLatLon)
      }

      // 인포윈도우 내용 업데이트
      if (kakaoInfoWindow.value) {
        kakaoInfoWindow.value.setContent(
          `<div style="padding:5px;font-size:12px;">${currentLocation.value}</div>`,
        )
        if (kakaoMarker.value) {
          kakaoInfoWindow.value.open(kakaoMap.value, kakaoMarker.value)
        }
      }
    } else if (window.kakao?.maps) {
      // 지도가 아직 생성되지 않았으면 생성
      initMap()
    }
  },
  { deep: true },
)

const formatDate = (date) => {
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일 ${weekday}`
}
</script>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
