<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useDarkMode } from './composables/useDarkMode'
import { useDataStore } from './stores/dataStore'
import { reservationService } from './api/reservationService'
import { customerService } from './api/customerService'
import eventsData from './data/events.json'

// 다크모드 초기화
const { initDarkMode } = useDarkMode()

// 데이터 스토어 초기화
const dataStore = useDataStore()

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

onMounted(async () => {
  initDarkMode()

  // 앱 로드 시 데이터 초기화
  try {
    const [reservationsRes, customersRes] = await Promise.all([
      reservationService.getAll(),
      customerService.getAll()
    ])

    // 이벤트 데이터 로드 (로컬 JSON)
    const events = eventsData.events

    // 예약 데이터 정규화
    const normalizedReservations = normalizeReservations(reservationsRes.data, events)

    dataStore.setReservations(normalizedReservations)
    dataStore.setCustomers(customersRes.data)
    dataStore.setEvents(events)
  } catch (err) {
    console.error('Failed to load initial data:', err)
    dataStore.setError(err)
  }
})
</script>

<template>
  <!-- 라우터가 레이아웃을 결정 -->
  <RouterView />
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
