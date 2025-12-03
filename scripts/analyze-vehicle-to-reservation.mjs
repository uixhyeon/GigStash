import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'

console.log('📊 배차-예약 매핑 분석\n')

// 행사별 배차 수 계산
const vehiclesByEvent = {}
vehicles.forEach(v => {
  if (!(v.eventId in vehiclesByEvent)) {
    vehiclesByEvent[v.eventId] = 0
  }
  vehiclesByEvent[v.eventId]++
})

console.log('배차-예약 계산 규칙:')
console.log('  배차당 사물함 50개 기준')
console.log('  1대 = 50건 예약\n')

// 행사별 필요한 예약 건수 계산
const reservationCountByEvent = {}
let totalReservations = 0

events.forEach(event => {
  const busCount = vehiclesByEvent[event.id] || 0
  // 배차당 50개 사물함 기준
  // 배차 1대 = 50건, 배차 2대 = 100건, 배차 3대 = 150건, 배차 4대 이상 = 최소 150건
  let reservationCount
  if (busCount <= 3) {
    reservationCount = busCount * 50
  } else {
    reservationCount = Math.max(150, busCount * 50)
  }
  reservationCountByEvent[event.id] = reservationCount
  totalReservations += reservationCount
})

console.log('행사별 배차 및 예약 건수 (상위 15개):')
events.slice(0, 15).forEach(event => {
  const busCount = vehiclesByEvent[event.id] || 0
  const resCount = reservationCountByEvent[event.id]
  console.log('  ' + event.id + ': 배차 ' + busCount + '대 → 예약 ' + resCount + '건')
})

console.log('\n📈 통계:')
console.log('  총 예약 건수: ' + totalReservations)
console.log('  행사 개수: ' + events.length)
console.log('  행사당 평균: ' + (totalReservations / events.length).toFixed(0) + '건')
console.log('  사물함 개수: ' + lockers.length)
console.log('  예약/사물함 비율: ' + (totalReservations / lockers.length).toFixed(2) + '배')

console.log('\n배차 대수별 예약 건수 분포:')
const distributionByBusCount = {}
events.forEach(event => {
  const busCount = vehiclesByEvent[event.id] || 0
  if (!(busCount in distributionByBusCount)) {
    distributionByBusCount[busCount] = { count: 0, totalRes: 0 }
  }
  distributionByBusCount[busCount].count++
  distributionByBusCount[busCount].totalRes += reservationCountByEvent[event.id]
})

Object.entries(distributionByBusCount)
  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  .forEach(([busCount, data]) => {
    console.log('  배차 ' + busCount + '대: ' + data.count + '개 행사, 예약 ' + data.totalRes + '건')
  })
