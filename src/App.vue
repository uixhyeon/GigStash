<script setup>
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useDarkMode } from './composables/useDarkMode'
import { useDataStore } from './stores/dataStore'
import { events } from './data/events.js'
import { reservations as reservationsData } from './data/reservations.js'
import { customers as customersData } from './data/customers.js'
import { lockers as lockersData } from './data/lockers.js'
import { vehicles as vehiclesData } from './data/vehicles.js'
import { vehicleAssignments as vehicleAssignmentsData } from './data/vehicle-assignments.js'

// 다크모드 초기화
const { initDarkMode } = useDarkMode()

// 데이터 스토어 초기화
const dataStore = useDataStore()

// 데이터 로드 완료 플래그 (race condition 방지)
const dataLoaded = ref(false)

/**
 * 예약 데이터 정규화
 * - 취소된 행사의 예약 -> 예약 취소 상태로 변경
 * - 종료된 행사의 예약 -> 완료 상태로 변경
 */
const normalizeReservations = (reservations, events) => {
  return reservations.map(reservation => {
    // eventId로 이벤트 찾기
    const event = events.find(e => e.id === reservation.eventId)

    if (!event) return reservation

    // 행사가 취소된 경우 -> 예약도 취소 상태로
    if (event.status === '취소' && reservation.status !== 'cancelled') {
      return {
        ...reservation,
        status: 'cancelled'
      }
    }

    // 행사가 종료된 경우 -> 예약을 완료 상태로 (이미 완료되거나 취소된 경우 제외)
    if (event.status === '종료' && reservation.status !== 'completed' && reservation.status !== 'cancelled') {
      return {
        ...reservation,
        status: 'completed'
      }
    }

    return reservation
  })
}

onMounted(() => {
  initDarkMode()

  // 앱 로드 시 데이터 초기화 (로컬 JSON 사용)
  try {
    console.log('🚀 App.vue: 데이터 로드 시작')

    // JS 파일에서 로드된 데이터 사용
    const reservations = reservationsData || []
    const customers = customersData || []
    const lockers = lockersData || []
    const vehicles = vehiclesData || []
    const vehicleAssignments = vehicleAssignmentsData || []

    console.log('📊 App.vue: 로드된 데이터')
    console.log(`  - 예약: ${reservations.length}개`)
    console.log(`  - 고객: ${customers.length}개`)
    console.log(`  - 사물함: ${lockers.length}개`)
    console.log(`  - 행사: ${events.length}개`)
    console.log(`  - 차량: ${vehicles.length}개`)
    console.log(`  - 배차: ${vehicleAssignments.length}개`)

    // 예약 데이터 정규화
    const normalizedReservations = normalizeReservations(reservations, events)

    console.log('💾 App.vue: dataStore에 데이터 저장 중...')
    dataStore.setReservations(normalizedReservations)
    dataStore.setCustomers(customers)
    dataStore.setLockers(lockers)
    dataStore.setEvents(events)
    dataStore.setVehicles(vehicles)
    dataStore.setVehicleAssignments(vehicleAssignments)

    console.log('✅ App.vue: 데이터 로드 완료')
    console.log(`  - 스토어 예약: ${dataStore.reservations.length}개`)
    console.log(`  - 스토어 고객: ${dataStore.customers.length}개`)
    console.log(`  - 스토어 사물함: ${dataStore.lockers.length}개`)
    console.log(`  - 스토어 행사: ${dataStore.events.length}개`)
    console.log(`  - 스토어 차량: ${dataStore.vehicles.length}개`)
    console.log(`  - 스토어 배차: ${dataStore.vehicleAssignments.length}개`)

    // 데이터 로드 완료 플래그 설정 (자식 컴포넌트 렌더링 허용)
    dataLoaded.value = true
  } catch (err) {
    console.error('❌ Failed to load initial data:', err)
    dataStore.setError(err)
    // 에러 발생 시에도 UI 렌더링 허용
    dataLoaded.value = true
  }
})
</script>

<template>
  <div v-if="dataLoaded">
    <!-- 라우터가 레이아웃을 결정 -->
    <RouterView />
  </div>
  <div v-else class="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">데이터 로딩 중...</p>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
