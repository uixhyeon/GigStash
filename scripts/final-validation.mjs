import { reservations } from '../src/data/reservations.js'
import { vehicles } from '../src/data/vehicles.js'
import { events } from '../src/data/events.js'
import { lockers } from '../src/data/lockers.js'

console.log('✅ 최종 데이터 검증\n')

// 행사별 예약 건수
const resCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in resCountByEvent)) {
    resCountByEvent[r.eventId] = 0
  }
  resCountByEvent[r.eventId]++
})

// 행사별 배차 수
const vehicleCountByEvent = {}
vehicles.forEach(v => {
  if (!(v.eventId in vehicleCountByEvent)) {
    vehicleCountByEvent[v.eventId] = 0
  }
  vehicleCountByEvent[v.eventId]++
})

console.log('📊 예약-배차 대수 매핑 (상위 15개):')
console.log('행사ID | 예약건수 | 배차대수 | 유효성')
console.log('─────────────────────────────────────')

events.slice(0, 15).forEach(event => {
  const resCount = resCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id] || 0
  const calculatedBus = Math.ceil(resCount / 50)
  const valid = busCount === calculatedBus ? '✅' : '❌'

  console.log(event.id + ' | ' + resCount.toString().padStart(5) + ' | ' + busCount.toString().padStart(4) + ' | ' + valid)
})

console.log('\n📈 통계:')
console.log('  총 예약: ' + reservations.length + '건')
console.log('  총 차량: ' + vehicles.length + '대')
console.log('  총 행사: ' + events.length + '개')
console.log('  총 사물함: ' + lockers.length + '개')

// 사물함 활용률
const usedLockerIds = new Set(reservations.map(r => r.lockerId))
console.log('\n🔐 사물함 활용:')
console.log('  사용된 사물함: ' + usedLockerIds.size + '개 / ' + lockers.length + '개')
console.log('  활용률: ' + ((usedLockerIds.size / lockers.length) * 100).toFixed(1) + '%')

// 유효성 검증
const allValid = events.every(event => {
  const resCount = resCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id] || 0
  const calculatedBus = Math.ceil(resCount / 50)
  return busCount === calculatedBus
})

console.log('\n' + (allValid ? '✅ 모든 데이터가 유효합니다!' : '❌ 일부 데이터에 오류가 있습니다.'))

// 배차별 행사 분포
console.log('\n배차 대수별 행사 분포:')
const distributionByBusCount = {}
events.forEach(event => {
  const busCount = vehicleCountByEvent[event.id] || 0
  if (!(busCount in distributionByBusCount)) {
    distributionByBusCount[busCount] = 0
  }
  distributionByBusCount[busCount]++
})

Object.entries(distributionByBusCount)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([busCount, eventCount]) => {
    console.log('  배차 ' + busCount + '대: ' + eventCount + '개 행사')
  })
