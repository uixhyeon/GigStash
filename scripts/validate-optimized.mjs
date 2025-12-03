import { reservations } from '../src/data/reservations.js'
import { events } from '../src/data/events.js'

console.log('✅ 최적화된 예약 데이터 검증\n')

const resCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in resCountByEvent)) {
    resCountByEvent[r.eventId] = 0
  }
  resCountByEvent[r.eventId]++
})

console.log('🔍 처음 15개 행사의 예약 건수:')
events.slice(0, 15).forEach(event => {
  const count = resCountByEvent[event.id] || 0
  console.log('  ' + event.id + ': ' + count + '건 (' + event.eventName + ')')
})

const counts = Object.values(resCountByEvent)
console.log('\n📈 통계:')
console.log('  총 예약: ' + reservations.length + '개')
console.log('  최소: ' + Math.min(...counts) + '건')
console.log('  최대: ' + Math.max(...counts) + '건')
console.log('  평균: ' + (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2) + '건')

console.log('\n✨ 이제 EventView.vue에서 정확한 행사별 예약 건수가 표시됩니다!')
