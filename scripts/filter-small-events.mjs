import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('🔍 5000석 이하 규모 행사 식별 시작...\n')

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

console.log('📊 행사 규모 기준:')
console.log('  - 차량 1대 = 50석 용량')
console.log('  - 5000석 = 최소 100대 차량 필요')
console.log('  - 판단 기준: 예약 건수 기반\n')

// 5000 이하 규모 행사 식별
const smallEvents = []
const largeEvents = []

events.forEach(event => {
  const resCount = reservationCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id] || 0
  const maxCapacity = busCount * 50

  if (resCount <= 100) { // 100건 이하 = 약 1-2대 규모 = 소규모
    smallEvents.push({
      id: event.id,
      name: event.eventName,
      venue: event.eventVenue,
      type: event.eventType,
      reservations: resCount,
      vehicles: busCount,
    })
  } else {
    largeEvents.push(event)
  }
})

console.log(`📌 주석 처리할 소규모 행사: ${smallEvents.length}개`)
smallEvents.forEach(evt => {
  console.log(`  - ${evt.id}: ${evt.name} (예약 ${evt.reservations}건, 배차 ${evt.vehicles}대) [${evt.type}]`)
})

console.log(`\n📌 유지할 중대형 행사: ${largeEvents.length}개`)
largeEvents.slice(0, 5).forEach(evt => {
  const resCount = reservationCountByEvent[evt.id] || 0
  const busCount = vehicleCountByEvent[evt.id] || 0
  console.log(`  - ${evt.id}: ${evt.eventName} (예약 ${resCount}건, 배차 ${busCount}대)`)
})
if (largeEvents.length > 5) {
  console.log(`  ... 외 ${largeEvents.length - 5}개`)
}

// 주석 처리된 형식의 JS 파일 생성
const eventComment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// createdAt(생성시간)

export const events = [`

let eventContent = eventComment

largeEvents.forEach((event, index) => {
  eventContent += '\n  ' + JSON.stringify(event, null, 2).split('\n').join('\n  ')
  if (index < largeEvents.length - 1) {
    eventContent += ','
  }
})

// 소규모 행사는 주석 처리
if (smallEvents.length > 0) {
  eventContent += '\n  /* ===== 5000석 이하 소규모 행사 (주석 처리) =====\n'
  smallEvents.forEach((event, index) => {
    // events 배열에서 원본 객체 찾기
    const original = events.find(e => e.id === event.id)
    eventContent += '  ' + JSON.stringify(original, null, 2).split('\n').join('\n  ')
    if (index < smallEvents.length - 1) {
      eventContent += ','
    }
  })
  eventContent += '\n  ===== 끝 ===== */\n'
}

eventContent += '\n]\n\nexport default {\n  events\n}\n'

const outputPath = path.join(__dirname, '../src/data/events.js')
fs.writeFileSync(outputPath, eventContent, 'utf8')

console.log(`\n💾 events.js 저장 완료`)
console.log(`  파일: events.js`)
console.log(`  활성 행사: ${largeEvents.length}개`)
console.log(`  주석 처리: ${smallEvents.length}개`)

console.log(`\n✨ 필터링 완료!`)
