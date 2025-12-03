import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'

console.log('🚀 행사 규모 기반 예약 데이터 재생성 시작...\n')

// 행사별 배차 수 계산
const vehicleCountByEvent = {}
vehicles.forEach(v => {
  if (!(v.eventId in vehicleCountByEvent)) {
    vehicleCountByEvent[v.eventId] = 0
  }
  vehicleCountByEvent[v.eventId]++
})

// 행사 규모 판단 및 예약 건수 결정
const eventScaleMap = {
  '내한공연': { busRange: [5, 6], scaleWeight: [0.85, 1.0] },     // 국제 투어: 높은 가중치
  '아이돌': { busRange: [4, 6], scaleWeight: [0.75, 0.95] },      // 대형 콘서트: 높은 가중치
  '뮤지컬': { busRange: [1, 2], scaleWeight: [0.60, 0.80] },       // 중형 공연
  '공연': { busRange: [1, 2], scaleWeight: [0.55, 0.75] },         // 중형 공연
  '음악': { busRange: [1, 2], scaleWeight: [0.50, 0.70] },         // 중형 행사
  'E스포츠': { busRange: [2, 3], scaleWeight: [0.65, 0.80] },      // 중형 행사
  '페스티벌': { busRange: [1, 2], scaleWeight: [0.40, 0.60] },     // 소규모
  '스포츠': { busRange: [1, 2], scaleWeight: [0.25, 0.50] },       // 소규모
  '시상식': { busRange: [1, 1], scaleWeight: [0.30, 0.50] },       // 소규모
}

// 행사별 예약 건수 결정
const reservationCountByEvent = {}
let totalReservations = 0

events.forEach(event => {
  const busCount = vehicleCountByEvent[event.id] || 0

  // 배차 대수에 따른 최대 예약 건수 (1대 = 50건 기준)
  const maxReservations = busCount * 50

  // 행사 유형에 따른 규모 가중치 결정
  const scaleInfo = eventScaleMap[event.eventType] || { busRange: [1, 6], scaleWeight: [0.40, 0.60] }

  // 해당 배차 대수 범위에서의 가중치 선택
  let scaleWeight
  if (busCount <= 2) {
    scaleWeight = scaleInfo.scaleWeight[0]
  } else if (busCount >= 5) {
    scaleWeight = scaleInfo.scaleWeight[1]
  } else {
    // 3~4대는 중간값
    scaleWeight = (scaleInfo.scaleWeight[0] + scaleInfo.scaleWeight[1]) / 2
  }

  // 예약 건수 계산: 최대값 * 가중치 (약간의 변동성 추가)
  const baseCount = Math.round(maxReservations * scaleWeight)
  const variance = Math.round(Math.random() * (maxReservations * 0.1)) - Math.round(maxReservations * 0.05)
  const reservationCount = Math.max(Math.ceil(maxReservations * 0.1), Math.min(maxReservations, baseCount + variance))

  reservationCountByEvent[event.id] = reservationCount
  totalReservations += reservationCount
})

console.log('📊 데이터 규모:')
console.log('  목표 예약 건수: ' + totalReservations)
console.log('  행사 수: ' + events.length)
console.log('  사물함 수: ' + lockers.length)
console.log('  고객 수: ' + customers.length)

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

// 상태 선택 함수
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
  const eventReservationCount = reservationCountByEvent[event.id] || 0

  for (let i = 0; i < eventReservationCount; i++) {
    // 사물함 순환 배치
    const locker = lockers[lockerIdx % lockers.length]
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

console.log('\n🔍 행사별 예약 건수 (상위 15개):')
events.slice(0, 15).forEach(event => {
  const count = resCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id] || 0
  const maxCap = busCount * 50
  const utilizationRate = ((count / maxCap) * 100).toFixed(1)
  console.log('  ' + event.id + ': ' + count + '건 / 최대 ' + maxCap + '건 (' + utilizationRate + '%)')
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
console.log('  사용된 사물함: ' + usedLockerIds.size + '개 / ' + lockers.length + '개')
console.log('  활용률: ' + ((usedLockerIds.size / lockers.length) * 100).toFixed(1) + '%')

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

console.log('\n✨ 행사 규모 기반 예약 데이터 재생성 완료!')
console.log('  배차 대수별 예약 범위:')
console.log('    1대 → 최대 50건 (행사 규모에 따라 분포)')
console.log('    2대 → 최대 100건 (행사 규모에 따라 분포)')
console.log('    4대 → 최대 200건 (행사 규모에 따라 분포)')
console.log('    5대 → 최대 250건 (행사 규모에 따라 분포)')
console.log('    6대 → 최대 300건 (행사 규모에 따라 분포)')
