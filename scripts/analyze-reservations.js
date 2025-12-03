import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('\n📅 행사별 배차 및 예약 현황\n')
console.log('행사날짜 | 행사명 | 배차 | 예약 | 상태')
console.log(''.padEnd(80, '-'))

const vehiclesByEvent = new Map()
vehicles.forEach(v => {
  vehiclesByEvent.set(v.eventId, (vehiclesByEvent.get(v.eventId) || 0) + 1)
})

const reservationsByEvent = new Map()
reservations.forEach(res => {
  reservationsByEvent.set(res.eventId, (reservationsByEvent.get(res.eventId) || 0) + 1)
})

const sortedEvents = [...events].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

let withReservations = 0
let withoutReservations = 0
let missingCount = 0

sortedEvents.forEach(event => {
  const buses = vehiclesByEvent.get(event.id) || 0
  const reservs = reservationsByEvent.get(event.id) || 0
  const status = reservs > 0 ? 'O' : 'X'

  if (reservs > 0) withReservations++
  else withoutReservations++

  const expected = buses * 50
  const missing = expected - reservs
  if (missing > 0) missingCount += missing

  const name = event.eventName.length > 20 ? event.eventName.substring(0, 20) : event.eventName
  console.log(`${event.eventDate} | ${name.padEnd(20)} | ${buses.toString().padEnd(2)} | ${reservs.toString().padEnd(4)} | ${status}`)
})

console.log('\n' + '='.repeat(80))
console.log('\n통계:')
console.log(`  예약 있는 행사: ${withReservations}개`)
console.log(`  예약 없는 행사: ${withoutReservations}개`)
console.log(`  총 예약: ${reservations.length}개`)
console.log(`  총 배차: ${vehicles.length}대`)
console.log(`  배차 기준 예상 예약: ${vehicles.length * 50}개`)
console.log(`  부족한 예약: ${missingCount}개\n`)

// 11월 중순 이후 분석
console.log('11월 중순(11-15) 이후 이벤트 분석:')
console.log(''.padEnd(80, '-'))

const midNov = new Date('2025-11-15')
const lateEvents = sortedEvents.filter(e => new Date(e.eventDate) >= midNov)
let lateBuses = 0
let lateReservs = 0

lateEvents.forEach(event => {
  const buses = vehiclesByEvent.get(event.id) || 0
  const reservs = reservationsByEvent.get(event.id) || 0
  lateBuses += buses
  lateReservs += reservs

  const name = event.eventName.length > 20 ? event.eventName.substring(0, 20) : event.eventName
  console.log(`${event.eventDate} | ${name.padEnd(20)} | ${buses.toString().padEnd(2)} | ${reservs.toString().padEnd(4)}`)
})

console.log(''.padEnd(80, '-'))
console.log(`\n합계: 배차 ${lateBuses}대, 예약 ${lateReservs}개`)
console.log(`예상: ${lateBuses * 50}개`)
console.log(`부족: ${lateBuses * 50 - lateReservs}개\n`)
