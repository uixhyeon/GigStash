import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 데이터 로드
import { reservations } from '../src/data/reservations.js'
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('📊 현재 데이터 규모:')
console.log('  예약: ' + reservations.length + '개')
console.log('  행사: ' + events.length + '개')
console.log('  차량: ' + vehicles.length + '개')
console.log('  사물함: ' + lockers.length + '개')

// 행사별 예약 건수 분석
const resCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in resCountByEvent)) {
    resCountByEvent[r.eventId] = 0
  }
  resCountByEvent[r.eventId]++
})

console.log('\n🔍 처음 10개 행사의 예약 건수:')
events.slice(0, 10).forEach(event => {
  const count = resCountByEvent[event.id] || 0
  console.log('  ' + event.id + ': ' + count + '건')
})

const counts = Object.values(resCountByEvent)
console.log('\n📈 통계:')
console.log('  최소: ' + Math.min(...counts) + '건')
console.log('  최대: ' + Math.max(...counts) + '건')
console.log('  평균: ' + (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2) + '건')

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✨ 정규화 계획:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('현재: ' + reservations.length + '개 예약')
console.log('목표: ~3,000개 예약')
console.log('행사 수: ' + events.length)
console.log('차량 수: ' + vehicles.length)

const targetReservations = 3000
const perEvent = Math.floor(targetReservations / events.length)
const perVehicle = Math.floor(targetReservations / vehicles.length)

console.log('\n분배 방식:')
console.log('  행사당 평균: ' + perEvent + '개 예약')
console.log('  차량당 평균: ' + perVehicle + '개 예약')
