import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('🔍 조인 데이터 디버깅\n')

// =====================================================
// Step 1: 데이터 존재 확인
// =====================================================
console.log('📊 Step 1: 데이터 로드 확인')
console.log(`  행사: ${events.length}개`)
console.log(`  차량: ${vehicles.length}대`)
console.log(`  예약: ${reservations.length}건\n`)

// =====================================================
// Step 2: 행사별 차량 조인 확인
// =====================================================
console.log('🚗 Step 2: 행사별 차량 조인 확인')

const vehiclesByEvent = {}
events.forEach(event => {
  vehiclesByEvent[event.id] = vehicles.filter(v => v.eventId === event.id)
})

const eventsWithVehicles = events.map(event => ({
  id: event.id,
  name: event.eventName,
  vehicleCount: vehiclesByEvent[event.id].length,
  hasVehicles: vehiclesByEvent[event.id].length > 0
}))

console.log('행사별 차량 분포:')
eventsWithVehicles.slice(0, 10).forEach(e => {
  console.log(`  ${e.name}: ${e.vehicleCount}대`)
})
console.log(`  ... 외 ${eventsWithVehicles.length - 10}개\n`)

const eventsWithoutVehicles = eventsWithVehicles.filter(e => !e.hasVehicles)
console.log(`⚠️  차량이 없는 행사: ${eventsWithoutVehicles.length}개`)
if (eventsWithoutVehicles.length > 0) {
  eventsWithoutVehicles.slice(0, 5).forEach(e => {
    console.log(`  - ${e.name} (ID: ${e.id})`)
  })
}

// =====================================================
// Step 3: 행사별 예약 조인 확인
// =====================================================
console.log('\n📋 Step 3: 행사별 예약 조인 확인')

const reservationsByEvent = {}
events.forEach(event => {
  reservationsByEvent[event.id] = reservations.filter(r => r.eventId === event.id)
})

const eventsWithReservations = events.map(event => ({
  id: event.id,
  name: event.eventName,
  reservationCount: reservationsByEvent[event.id].length,
  hasReservations: reservationsByEvent[event.id].length > 0
}))

console.log('행사별 예약 분포:')
eventsWithReservations
  .filter(e => e.reservationCount > 0)
  .sort((a, b) => b.reservationCount - a.reservationCount)
  .slice(0, 10)
  .forEach(e => {
    console.log(`  ${e.name}: ${e.reservationCount}건`)
  })

const eventsWithoutReservations = eventsWithReservations.filter(e => !e.hasReservations)
console.log(`\n⚠️  예약이 없는 행사: ${eventsWithoutReservations.length}개`)

// =====================================================
// Step 4: 불일치 항목 찾기
// =====================================================
console.log('\n🔎 Step 4: 불일치 항목 분석')

// vehicles에는 있지만 events에 없는 eventId
const unmatchedVehicleEventIds = new Set(
  vehicles.map(v => v.eventId).filter(eid => !events.find(e => e.id === eid))
)

// reservations에는 있지만 events에 없는 eventId
const unmatchedReservationEventIds = new Set(
  reservations.map(r => r.eventId).filter(rid => !events.find(e => e.id === rid))
)

console.log(`vehicles의 unmapped eventId: ${unmatchedVehicleEventIds.size}개`)
if (unmatchedVehicleEventIds.size > 0) {
  Array.from(unmatchedVehicleEventIds).slice(0, 5).forEach(id => {
    const count = vehicles.filter(v => v.eventId === id).length
    console.log(`  - ${id}: ${count}대`)
  })
}

console.log(`\nreservations의 unmapped eventId: ${unmatchedReservationEventIds.size}개`)
if (unmatchedReservationEventIds.size > 0) {
  Array.from(unmatchedReservationEventIds).slice(0, 5).forEach(id => {
    const count = reservations.filter(r => r.eventId === id).length
    console.log(`  - ${id}: ${count}건`)
  })
}

// =====================================================
// Step 5: 샘플 데이터 확인
// =====================================================
console.log('\n📝 Step 5: 샘플 데이터 확인')

console.log('\n첫 번째 행사:')
if (events.length > 0) {
  const event = events[0]
  console.log(`  ID: ${event.id}`)
  console.log(`  이름: ${event.eventName}`)
  console.log(`  날짜: ${event.eventDate}`)

  const eventVehicles = vehicles.filter(v => v.eventId === event.id)
  console.log(`  매칭된 차량: ${eventVehicles.length}대`)
  if (eventVehicles.length > 0) {
    console.log(`    첫 번째 차량: ${eventVehicles[0].id}`)
  }

  const eventReservations = reservations.filter(r => r.eventId === event.id)
  console.log(`  매칭된 예약: ${eventReservations.length}건`)
  if (eventReservations.length > 0) {
    console.log(`    첫 번째 예약: ${eventReservations[0].id}`)
  }
}

console.log('\n예약 데이터 샘플:')
if (reservations.length > 0) {
  const res = reservations[0]
  console.log(`  ID: ${res.id}`)
  console.log(`  eventId: ${res.eventId}`)
  console.log(`  lockerId: ${res.lockerId}`)
  console.log(`  customerId: ${res.customerId}`)

  const matchingEvent = events.find(e => e.id === res.eventId)
  console.log(`  매칭된 행사: ${matchingEvent ? matchingEvent.eventName : '없음'}`)
}

console.log('\n차량 데이터 샘플:')
if (vehicles.length > 0) {
  const veh = vehicles[0]
  console.log(`  ID: ${veh.id}`)
  console.log(`  eventId: ${veh.eventId}`)
  console.log(`  vehicleType: ${veh.vehicleType}`)

  const matchingEvent = events.find(e => e.id === veh.eventId)
  console.log(`  매칭된 행사: ${matchingEvent ? matchingEvent.eventName : '없음'}`)
}

// =====================================================
// Step 6: 최종 검증
// =====================================================
console.log('\n📊 최종 검증')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const totalVehicles = vehicles.length
const mappedVehicles = vehicles.filter(v => events.find(e => e.id === v.eventId)).length
const vehicleMapping = (mappedVehicles / totalVehicles * 100).toFixed(1)

const totalReservations = reservations.length
const mappedReservations = reservations.filter(r => events.find(e => e.id === r.eventId)).length
const reservationMapping = (mappedReservations / totalReservations * 100).toFixed(1)

console.log(`✅ 차량 매핑: ${mappedVehicles}/${totalVehicles} (${vehicleMapping}%)`)
console.log(`✅ 예약 매핑: ${mappedReservations}/${totalReservations} (${reservationMapping}%)`)
console.log(`✅ 행사별 차량 있음: ${eventsWithVehicles.filter(e => e.hasVehicles).length}/${events.length}`)
console.log(`✅ 행사별 예약 있음: ${eventsWithReservations.filter(e => e.hasReservations).length}/${events.length}`)

if (vehicleMapping === '100.0' && reservationMapping === '100.0') {
  console.log('\n✨ 모든 조인이 정상입니다!')
} else {
  console.log('\n⚠️  조인 문제가 있습니다. 확인 필요!')
}
