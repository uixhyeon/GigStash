import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('🌍 해외 행사 제거 시작...\n')

// 해외 행사 키워드
const overseasKeywords = ['말레이시아', '홍콩', '싱가포르', '중국', '청두', '일본', '태국', '베트남', '필리핀', '인도']

// 해외 행사 식별
const overseasEventIds = new Set()
const overseasEvents = []

events.forEach(event => {
  const isOverseas = overseasKeywords.some(keyword => event.eventVenue.includes(keyword))
  if (isOverseas) {
    overseasEventIds.add(event.id)
    overseasEvents.push(event)
  }
})

console.log('🗺️ 제거할 해외 행사:')
overseasEvents.forEach(event => {
  console.log(`  - ${event.id}: ${event.eventName} (${event.eventVenue})`)
})

// 국내 행사만 필터링
const domesticEvents = events.filter(event => !overseasEventIds.has(event.id))
console.log(`\n✅ 국내 행사: ${domesticEvents.length}개 (제거된 행사: ${overseasEvents.length}개)`)

// 해외 행사에 연결된 차량 식별
const overseasVehicleIds = new Set()
const removedVehicles = []

vehicles.forEach(vehicle => {
  if (overseasEventIds.has(vehicle.eventId)) {
    overseasVehicleIds.add(vehicle.id)
    removedVehicles.push(vehicle)
  }
})

const domesticVehicles = vehicles.filter(v => !overseasVehicleIds.has(v.id))
console.log(`\n🚗 차량 현황:`)
console.log(`  기존: ${vehicles.length}대`)
console.log(`  제거: ${removedVehicles.length}대 (해외 행사 연결)`)
console.log(`  남은: ${domesticVehicles.length}대`)

// 해외 행사에 연결된 예약 식별
const removedReservations = []
const domesticReservations = reservations.filter(r => {
  if (overseasEventIds.has(r.eventId)) {
    removedReservations.push(r)
    return false
  }
  return true
})

console.log(`\n📋 예약 현황:`)
console.log(`  기존: ${reservations.length}건`)
console.log(`  제거: ${removedReservations.length}건 (해외 행사 연결)`)
console.log(`  남은: ${domesticReservations.length}건`)

// JS 파일로 저장
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

const jsContent = eventComment + '\nexport const events = ' + JSON.stringify(domesticEvents, null, 2) + '\n\nexport default {\n  events\n}\n'
const eventOutputPath = path.join(__dirname, '../src/data/events.js')
fs.writeFileSync(eventOutputPath, jsContent, 'utf8')

console.log(`\n💾 events.js 저장 완료`)
console.log(`  파일: events.js`)

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

const vehicleJsContent = vehicleComment + '\nexport const vehicles = ' + JSON.stringify(domesticVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'
const vehicleOutputPath = path.join(__dirname, '../src/data/vehicles.js')
fs.writeFileSync(vehicleOutputPath, vehicleJsContent, 'utf8')

console.log(`💾 vehicles.js 저장 완료`)
console.log(`  파일: vehicles.js`)

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

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(domesticReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
const reservationOutputPath = path.join(__dirname, '../src/data/reservations.js')
fs.writeFileSync(reservationOutputPath, reservationJsContent, 'utf8')

console.log(`💾 reservations.js 저장 완료`)
console.log(`  파일: reservations.js`)

console.log(`\n✨ 해외 행사 제거 완료!`)
console.log(`\n📊 최종 데이터 규모:`)
console.log(`  행사: ${domesticEvents.length}개`)
console.log(`  차량: ${domesticVehicles.length}대`)
console.log(`  예약: ${domesticReservations.length}건`)
