import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'
import { lockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'

console.log('🚀 행사 규모 기반 불균등 예약 데이터 생성 시작...\n')

const TARGET_RESERVATIONS = 5000
const LOCKER_COUNT = lockers.length
const EVENT_COUNT = events.length
const CUSTOMER_COUNT = customers.length

// 행사별 규모 계산 (vehicleCount와 expectedAttendance 기반)
const eventWeights = events.map((event, idx) => {
  // 행사 규모 계산: vehicleCount * 500 + expectedAttendance
  const weight = (event.vehicleCount || 0) * 500 + (event.expectedAttendance || 100)
  return {
    eventId: event.id,
    eventName: event.eventName,
    weight: weight,
    vehicleCount: event.vehicleCount || 0,
    expectedAttendance: event.expectedAttendance || 100
  }
})

// 총 weight 계산
const totalWeight = eventWeights.reduce((sum, e) => sum + e.weight, 0)

// 행사별 예약 건수 할당 (비례 배분)
const eventReservationCounts = {}
let totalAllocated = 0

eventWeights.forEach((event, idx) => {
  if (idx === EVENT_COUNT - 1) {
    // 마지막 행사는 반올림 오차 처리
    eventReservationCounts[event.eventId] = TARGET_RESERVATIONS - totalAllocated
  } else {
    const count = Math.round((event.weight / totalWeight) * TARGET_RESERVATIONS)
    eventReservationCounts[event.eventId] = count
    totalAllocated += count
  }
})

console.log('📊 데이터 규모:')
console.log('  목표 예약 건수: ' + TARGET_RESERVATIONS)
console.log('  행사 수: ' + EVENT_COUNT)
console.log('  사물함 수: ' + LOCKER_COUNT)
console.log('  고객 수: ' + CUSTOMER_COUNT)

console.log('\n🎯 행사별 예약 할당 (상위 10개):')
eventWeights
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 10)
  .forEach(event => {
    const count = eventReservationCounts[event.eventId]
    console.log(
      '  ' + event.eventId + ': ' + count + '건 (weight: ' + event.weight + ') - ' + event.eventName
    )
  })

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
let resId = 1
let lockerIdx = 0

for (const event of events) {
  const eventReservationCount = eventReservationCounts[event.id] || 0

  for (let i = 0; i < eventReservationCount; i++) {
    // 사물함 순환 배치 (중복 방지를 위해 서로 다른 날짜 사용)
    const locker = lockers[lockerIdx % LOCKER_COUNT]
    lockerIdx++

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

console.log('\n🔍 행사별 예약 건수 분포 (상위 10개):')
eventWeights
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 10)
  .forEach(event => {
    const count = resCountByEvent[event.eventId] || 0
    console.log('  ' + event.eventId + ': ' + count + '건')
  })

const counts = Object.values(resCountByEvent)
console.log('\n📈 통계:')
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

console.log('\n✨ 행사 규모 기반 불균등 예약 데이터 생성 완료!')
