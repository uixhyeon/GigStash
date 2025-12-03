import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'

console.log('📊 행사 규모 분석\n')

// 행사 유형별 분류
const eventsByType = {}
events.forEach(event => {
  if (!(event.eventType in eventsByType)) {
    eventsByType[event.eventType] = []
  }
  eventsByType[event.eventType].push(event)
})

console.log('행사 유형별 분류:')
Object.entries(eventsByType).forEach(([type, eventList]) => {
  console.log('  ' + type + ': ' + eventList.length + '개')
})

// 행사별 배차 수
const vehicleCountByEvent = {}
vehicles.forEach(v => {
  if (!(v.eventId in vehicleCountByEvent)) {
    vehicleCountByEvent[v.eventId] = 0
  }
  vehicleCountByEvent[v.eventId]++
})

console.log('\n행사 유형별 배차 대수 분포:')
Object.entries(eventsByType).forEach(([type, eventList]) => {
  const busCounts = eventList.map(e => vehicleCountByEvent[e.id] || 0)
  const min = Math.min(...busCounts)
  const max = Math.max(...busCounts)
  const avg = (busCounts.reduce((a, b) => a + b, 0) / busCounts.length).toFixed(1)

  console.log('  ' + type + ':')
  console.log('    배차: ' + min + '~' + max + '대 (평균 ' + avg + '대)')
})

console.log('\n배차 대수별 행사 예상 예약 범위:')
console.log('  1대: 최대 50건 (행사 규모에 따라 10~50건 분포)')
console.log('  2대: 최대 100건 (행사 규모에 따라 51~100건 분포)')
console.log('  3대: 최대 150건 (행사 규모에 따라 101~150건 분포)')
console.log('  4대: 최대 200건 (행사 규모에 따라 151~200건 분포)')
console.log('  5대: 최대 250건 (행사 규모에 따라 201~250건 분포)')
console.log('  6대: 최대 300건 (행사 규모에 따라 251~300건 분포)')

console.log('\n행사 규모 가중치 기준:')
console.log('  국제 투어 (5~6대 배차): 높은 가중치 (80~100% 사용)')
console.log('  대형 콘서트/공연 (4대 배차): 중간-높음 (70~90%)')
console.log('  중형 행사 (2~3대 배차): 중간 (50~70%)')
console.log('  소규모 스포츠 (1대 배차): 낮음 (20~50%)')
