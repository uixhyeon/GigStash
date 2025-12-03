import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { reservations } from '../src/data/reservations.js'
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'

console.log('🔍 1000석 미만 행사 필터링 시작...\n')

// 행사별 배차 대수와 용량 계산
const vehicleCountByEvent = {}
vehicles.forEach(v => {
  if (!(v.eventId in vehicleCountByEvent)) {
    vehicleCountByEvent[v.eventId] = 0
  }
  vehicleCountByEvent[v.eventId]++
})

// 행사별 예약 건수 계산
const reservationCountByEvent = {}
reservations.forEach(r => {
  if (r.eventId && r.eventId !== 'UNKNOWN') {
    if (!(r.eventId in reservationCountByEvent)) {
      reservationCountByEvent[r.eventId] = 0
    }
    reservationCountByEvent[r.eventId]++
  }
})

console.log('📊 현재 행사 규모 분석:')
console.log('eventId | 행사명 | 예약 | 배차 | 용량(석)')
console.log('─────────────────────────────────────────────────')

const eventCapacity = {}
events.forEach(event => {
  const resCount = reservationCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id] || 0
  const capacity = busCount * 50

  eventCapacity[event.id] = { capacity, resCount, busCount }

  console.log(`${event.id} | ${event.eventName.substring(0, 10).padEnd(10)} | ${String(resCount).padStart(3)} | ${String(busCount).padStart(2)} | ${String(capacity).padStart(4)}`)
})

// 1000석 미만 행사 필터링
const smallCapacityEventIds = new Set()
const largeCapacityEvents = []

Object.entries(eventCapacity).forEach(([eventId, data]) => {
  if (data.capacity < 1000) {
    smallCapacityEventIds.add(eventId)
  } else {
    largeCapacityEvents.push({ eventId, ...data })
  }
})

console.log('\n📌 필터링 대상:')
console.log(`  1000석 미만: ${smallCapacityEventIds.size}개 (삭제)`)
console.log(`  1000석 이상: ${largeCapacityEvents.length}개 (유지)`)

if (smallCapacityEventIds.size > 0) {
  console.log('\n  삭제 대상 행사:')
  smallCapacityEventIds.forEach(eventId => {
    const event = events.find(e => e.id === eventId)
    const capacity = eventCapacity[eventId].capacity
    console.log(`    - ${eventId}: ${event?.eventName} (${capacity}석)`)
  })
}

// 필터링된 데이터 생성
const filteredEvents = events.filter(e => !smallCapacityEventIds.has(e.id))
const filteredVehicles = vehicles.filter(v => !smallCapacityEventIds.has(v.eventId))
const filteredReservations = reservations.filter(r =>
  !r.eventId || r.eventId === 'UNKNOWN' || !smallCapacityEventIds.has(r.eventId)
)

console.log('\n📊 필터링 결과:')
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`행사:  ${events.length} → ${filteredEvents.length} (-${smallCapacityEventIds.size}개)`)
console.log(`차량:  ${vehicles.length} → ${filteredVehicles.length} (-${vehicles.length - filteredVehicles.length}대)`)
console.log(`예약:  ${reservations.length} → ${filteredReservations.length} (-${reservations.length - filteredReservations.length}건)`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

// 파일 저장
const eventComment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// createdAt(생성시간)
`

const eventJsContent = eventComment + '\nexport const events = ' + JSON.stringify(filteredEvents, null, 2) + '\n\nexport default {\n  events\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/events.js'), eventJsContent, 'utf8')

const vehicleComment = `// 차량 데이터
// id(차량ID)
// eventId(연결된 행사ID)
// vehicleType(차량종류)
// capacity(정원)
// plateNumber(번호판)
// driver(운전자)
// status(상태)
`

const vehicleJsContent = vehicleComment + '\nexport const vehicles = ' + JSON.stringify(filteredVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/vehicles.js'), vehicleJsContent, 'utf8')

const reservationComment = `// 예약 데이터
// id(예약ID)
// eventId(행사ID)
// lockerId(사물함ID)
// customerId(고객ID)
// status(상태)
// reservedAt(예약시간)
// dropoffTime(반납시간)
// pickupTime(픽업시간)
// itemType(물품종류)
// itemSize(물품크기)
// itemCount(물품수량)
// specialRequest(특별요청)
// deliveryType(배송방식)
// deliveryStatus(배송상태)
// deliveryAddress(배송주소)
// deliveryRegion(배송지역)
// deliveryCity(배송도시)
// paymentMethod(결제방식)
// originalPrice(정가)
// discountAmount(할인액)
// totalPrice(최종결제액)
// isReturningCustomer(재방문여부)
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(filteredReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')

console.log('\n💾 파일 저장 완료:')
console.log(`  ✅ events.js (${filteredEvents.length}개 행사)`)
console.log(`  ✅ vehicles.js (${filteredVehicles.length}대 차량)`)
console.log(`  ✅ reservations.js (${filteredReservations.length}건 예약)`)

console.log('\n✨ 1000석 미만 행사 필터링 완료!')
