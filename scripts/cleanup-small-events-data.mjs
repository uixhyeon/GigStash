import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events as allEvents } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('🧹 소규모 행사 관련 데이터 정리 시작...\n')

// 행사별 배차 대수 계산
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
  if (!(r.eventId in reservationCountByEvent)) {
    reservationCountByEvent[r.eventId] = 0
  }
  reservationCountByEvent[r.eventId]++
})

// 소규모 행사 ID 식별 (100건 이하)
const smallEventIds = new Set()
allEvents.forEach(event => {
  const resCount = reservationCountByEvent[event.id] || 0
  if (resCount <= 100) {
    smallEventIds.add(event.id)
  }
})

console.log(`📌 제거할 소규모 행사 ID (${smallEventIds.size}개):`)
Array.from(smallEventIds).forEach(id => {
  console.log(`  - ${id}`)
})

// 1. vehicles.js 정리
const filteredVehicles = vehicles.filter(v => !smallEventIds.has(v.eventId))
console.log(`\n🚗 차량 데이터 정리:`)
console.log(`  기존: ${vehicles.length}대`)
console.log(`  제거: ${vehicles.length - filteredVehicles.length}대`)
console.log(`  남은: ${filteredVehicles.length}대`)

// 2. reservations.js 정리
const filteredReservations = reservations.filter(r => !smallEventIds.has(r.eventId))
console.log(`\n📋 예약 데이터 정리:`)
console.log(`  기존: ${reservations.length}건`)
console.log(`  제거: ${reservations.length - filteredReservations.length}건`)
console.log(`  남은: ${filteredReservations.length}건`)

// vehicles.js 저장
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
const vehicleOutputPath = path.join(__dirname, '../src/data/vehicles.js')
fs.writeFileSync(vehicleOutputPath, vehicleJsContent, 'utf8')
console.log(`\n💾 vehicles.js 저장 완료`)

// reservations.js 저장
const reservationComment = `// 예약 데이터
// id(예약ID)
// lockerId(사물함ID)
// lockerNumber(사물함번호)
// customerId(고객ID)
// status(상태:pending/waiting/active/completed/cancelled)
// startTime(시작시간)
// endTime(종료시간)
// itemDescription(물품설명)
// createdAt(생성시간)
// accessCode(접근코드)
// eventId(행사ID)
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(filteredReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
const reservationOutputPath = path.join(__dirname, '../src/data/reservations.js')
fs.writeFileSync(reservationOutputPath, reservationJsContent, 'utf8')
console.log(`💾 reservations.js 저장 완료`)

console.log(`\n✨ 소규모 행사 데이터 정리 완료!`)
console.log(`\n📊 최종 데이터 규모:`)
console.log(`  활성 행사: 17개`)
console.log(`  차량: ${filteredVehicles.length}대`)
console.log(`  예약: ${filteredReservations.length}건`)
