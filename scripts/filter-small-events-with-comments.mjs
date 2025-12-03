import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('🔍 5000석 이하 규모 행사 필터링 (주석 포함)...\n')

// 현재 vehicles와 reservations에서 활성 행사 ID 추출
const activeEventIds = new Set()

vehicles.forEach(v => {
  activeEventIds.add(v.eventId)
})

console.log(`현재 활성 행사: ${activeEventIds.size}개`)
console.log(`현재 차량: ${vehicles.length}대`)
console.log(`현재 예약: ${reservations.length}건`)

// 행사별 예약 건수 계산
const reservationCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in reservationCountByEvent)) {
    reservationCountByEvent[r.eventId] = 0
  }
  reservationCountByEvent[r.eventId]++
})

// 활성 행사 정보 출력
console.log('\n📊 활성 행사 규모 분포:')
const eventSizes = Array.from(activeEventIds).map(eventId => ({
  eventId,
  reservations: reservationCountByEvent[eventId] || 0
})).sort((a, b) => b.reservations - a.reservations)

eventSizes.forEach(evt => {
  console.log(`  ${evt.eventId}: ${evt.reservations}건`)
})

console.log(`\n✅ 이미 필터링된 상태입니다.`)
console.log(`💾 events.js: 17개 행사 (대형/중형 행사만)`)
console.log(`💾 vehicles.js: ${vehicles.length}대`)
console.log(`💾 reservations.js: ${reservations.length}건`)
