import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('🔄 vehicles.js와 reservations.js를 events.js와 동기화...\n')

// events.js의 활성 행사 ID 추출
const activeEventIds = new Set(events.map(e => e.id))

console.log(`📌 활성 행사: ${activeEventIds.size}개`)
events.forEach(evt => {
  console.log(`  - ${evt.id}: ${evt.eventName}`)
})

// 1. vehicles.js 필터링
const filteredVehicles = vehicles.filter(v => activeEventIds.has(v.eventId))
const removedVehicles = vehicles.filter(v => !activeEventIds.has(v.eventId))

console.log(`\n🚗 차량 데이터 동기화:`)
console.log(`  기존: ${vehicles.length}대`)
console.log(`  제거: ${removedVehicles.length}대 (소규모 행사 관련)`)
console.log(`  유지: ${filteredVehicles.length}대`)

// 2. reservations.js 필터링
const filteredReservations = reservations.filter(r => activeEventIds.has(r.eventId))
const removedReservations = reservations.filter(r => !activeEventIds.has(r.eventId))

console.log(`\n📋 예약 데이터 동기화:`)
console.log(`  기존: ${reservations.length}건`)
console.log(`  제거: ${removedReservations.length}건 (소규모 행사 관련)`)
console.log(`  유지: ${filteredReservations.length}건`)

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

console.log(`\n💾 vehicles.js 저장 완료`)
console.log(`💾 reservations.js 저장 완료`)

console.log(`\n✨ 동기화 완료!`)
console.log(`\n📊 최종 데이터 규모:`)
console.log(`  행사: ${activeEventIds.size}개`)
console.log(`  차량: ${filteredVehicles.length}대`)
console.log(`  예약: ${filteredReservations.length}건`)
console.log(`  사물함: 1000개`)
