import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'

console.log('🚀 최적화된 예약 데이터 생성 시작...\n')

const TARGET_RESERVATIONS = 3000
const LOCKER_COUNT = lockers.length
const EVENT_COUNT = events.length
const VEHICLE_COUNT = vehicles.length
const CUSTOMER_COUNT = customers.length

console.log('📊 데이터 규모:')
console.log('  목표 예약 건수: ' + TARGET_RESERVATIONS)
console.log('  행사 수: ' + EVENT_COUNT)
console.log('  차량 수: ' + VEHICLE_COUNT)
console.log('  사물함 수: ' + LOCKER_COUNT)
console.log('  고객 수: ' + CUSTOMER_COUNT)

// 예약 상태 분포
const STATUS_DISTRIBUTION = {
  active: 0.50,      // 50% - 활성
  completed: 0.30,   // 30% - 완료
  pending: 0.10,     // 10% - 대기
  waiting: 0.10      // 10% - 대기 중
}

// 무작위 생성 함수들
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomTime = () => {
  const hour = randomInt(9, 20)
  const minute = randomChoice([0, 15, 30, 45])
  return hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0')
}

// 상태 선택 함수 (확률 기반)
const selectStatus = () => {
  const rand = Math.random()
  let cumulative = 0
  for (const [status, prob] of Object.entries(STATUS_DISTRIBUTION)) {
    cumulative += prob
    if (rand <= cumulative) {
      return status
    }
  }
  return 'pending'
}

// 예약 데이터 생성
const reservations = []

// 예약을 행사에 균등하게 분배
const reservationsPerEvent = Math.floor(TARGET_RESERVATIONS / EVENT_COUNT)
const remainingReservations = TARGET_RESERVATIONS % EVENT_COUNT

let resId = 1

for (let eventIdx = 0; eventIdx < EVENT_COUNT; eventIdx++) {
  const event = events[eventIdx]

  // 이 행사에 할당할 예약 건수
  const eventReservationCount = reservationsPerEvent + (eventIdx < remainingReservations ? 1 : 0)

  for (let i = 0; i < eventReservationCount; i++) {
    // 사물함 선택 (분산된 사용)
    const lockerIdx = (resId - 1) % LOCKER_COUNT
    const locker = lockers[lockerIdx]

    // 고객 선택
    const customer = randomChoice(customers)

    // 시작/종료 시간 생성
    const startTime = randomTime()
    const endHour = randomInt(parseInt(startTime) + 2, 22)
    const endTime = endHour.toString().padStart(2, '0') + ':' + randomChoice([0, 30])

    // 예약 생성
    const reservation = {
      id: 'RES' + resId.toString().padStart(10, '0'),
      eventId: event.id,
      lockerId: locker.id,
      lockerNumber: locker.number || locker.id,
      customerId: customer.id,
      status: selectStatus(),
      startTime: event.eventDate + 'T' + startTime + ':00.000Z',
      endTime: event.eventDate + 'T' + endTime + ':00.000Z',
      itemDescription: randomChoice([
        '악기',
        '음향장비',
        '영상장비',
        '조명',
        '의상',
        '의류',
        '소품',
        '문서',
        '전자기기',
        '캠핑용품'
      ]),
      createdAt: new Date(new Date(event.eventDate).getTime() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      accessCode: randomInt(1000, 9999).toString()
    }

    reservations.push(reservation)
    resId++
  }
}

console.log('\n✅ 예약 데이터 생성 완료')
console.log('  총 생성된 예약: ' + reservations.length + '개')

// 행사별 예약 건수 검증
const resCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in resCountByEvent)) {
    resCountByEvent[r.eventId] = 0
  }
  resCountByEvent[r.eventId]++
})

console.log('\n🔍 행사별 예약 건수 분포:')
const counts = Object.values(resCountByEvent)
console.log('  최소: ' + Math.min(...counts) + '건')
console.log('  최대: ' + Math.max(...counts) + '건')
console.log('  평균: ' + (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2) + '건')

// 상태별 분포 검증
const statusCounts = {}
reservations.forEach(r => {
  statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
})

console.log('\n📊 상태별 분포:')
Object.entries(statusCounts).forEach(([status, count]) => {
  const percentage = ((count / reservations.length) * 100).toFixed(1)
  console.log('  ' + status + ': ' + count + '개 (' + percentage + '%)')
})

// 사물함 활용률
const usedLockerIds = new Set(reservations.map(r => r.lockerId))
console.log('\n🔐 사물함 활용:')
console.log('  사용된 사물함: ' + usedLockerIds.size + '개 / ' + LOCKER_COUNT + '개')
console.log('  활용률: ' + ((usedLockerIds.size / LOCKER_COUNT) * 100).toFixed(1) + '%')

// JS 파일로 저장
const comment = `// 예약 데이터
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

const jsContent = comment + '\nexport const reservations = ' + JSON.stringify(reservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'

const outputPath = path.join(__dirname, '../src/data/reservations.js')
fs.writeFileSync(outputPath, jsContent, 'utf8')

console.log('\n💾 데이터 저장 완료')
console.log('  파일: reservations.js')
console.log('  경로: ' + outputPath)

console.log('\n✨ 최적화된 예약 데이터 생성 완료!')
