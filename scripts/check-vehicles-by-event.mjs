import { vehicles } from '../src/data/vehicles.js'
import { events } from '../src/data/events.js'

console.log('📊 차량 데이터 분석\n')

const byEvent = {}
vehicles.forEach(v => {
  if (!(v.eventId in byEvent)) {
    byEvent[v.eventId] = 0
  }
  byEvent[v.eventId]++
})

console.log('차량 총 수: ' + vehicles.length + '대')
console.log('행사별 차량 분배:')
console.log('\n상위 15개 행사:')
events.slice(0, 15).forEach(event => {
  const count = byEvent[event.id] || 0
  console.log('  ' + event.id + ': ' + count + '대 (' + event.eventName + ')')
})
