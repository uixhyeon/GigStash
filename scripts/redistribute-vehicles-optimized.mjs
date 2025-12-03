import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events as oldEvents } from '../src/data/events.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import { lockers as oldLockers } from '../src/data/lockers.js'

console.log('🔄 날짜 기반 중복 사용을 고려한 배차 재분배...\n')

// =====================================================
// Step 1: 행사 규모 추정
// =====================================================
console.log('📊 Step 1: 행사 규모 추정')

const estimateEventSize = (event) => {
  const eventName = event.eventName || ''
  const eventType = event.eventType || ''

  let sizeFactor = 0.4

  if (eventName.includes('ASIA') || eventName.includes('투어') || eventName.includes('TOUR')) {
    sizeFactor = 0.9 + Math.random() * 0.08 // 90-98%
  } else if (eventType.includes('내한공연') || eventType.includes('아이돌')) {
    sizeFactor = 0.75 + Math.random() * 0.1 // 75-85%
  } else if (eventType.includes('뮤지컬') || eventType.includes('페스티벌')) {
    sizeFactor = 0.6 + Math.random() * 0.1 // 60-70%
  } else if (eventType.includes('스포츠')) {
    sizeFactor = 0.3 + Math.random() * 0.1 // 30-40%
  } else {
    sizeFactor = 0.5 + Math.random() * 0.15 // 50-65%
  }

  return Math.max(0.3, Math.min(0.98, sizeFactor))
}

const eventSizeMap = {}
oldEvents.forEach(event => {
  eventSizeMap[event.id] = estimateEventSize(event)
})

console.log('✅ 행사 규모 추정 완료\n')

// =====================================================
// Step 2: 날짜 기반 배차 최적화
// =====================================================
console.log('🚗 Step 2: 날짜 기반 배차 최적화')

/**
 * 배차 대수를 더 작게 설정 (날짜가 다르면 중복 사용 가능)
 * - 메가 행사: 4-8대 (날짜 다르면 재사용)
 * - 대규모: 2-4대
 * - 중규모: 1-2대
 * - 소규모: 1대
 */
const getVehicleCountBySize = (sizeFactor) => {
  if (sizeFactor >= 0.85) {
    // 메가 행사: 4-8대 (더 작게 줄임)
    return Math.floor(4 + (sizeFactor - 0.85) * 20 + Math.random() * 3)
  } else if (sizeFactor >= 0.65) {
    // 대규모: 2-4대
    return Math.floor(2 + (sizeFactor - 0.65) * 6 + Math.random() * 2)
  } else if (sizeFactor >= 0.45) {
    // 중규모: 1-2대
    return Math.floor(1 + Math.random() * 1.5)
  } else {
    // 소규모: 1대
    return 1
  }
}

const newVehicles = []
const driverNames = [
  '김운전', '이운전', '박운전', '최운전', '정운전',
  '강운전', '윤운전', '임운전', '한운전', '오운전',
  '신운전', '조운전', '홍운전', '전운전', '남운전',
  '안운전', '배운전', '서운전', '양운전', '허운전',
  '류운전', '마운전', '노운전', '도운전', '로운전'
]

const plateNumbers = [
  '서울12가1234', '서울12가1235', '서울12가2001', '서울12가2002', '서울12가2003',
  '경기12가1001', '경기12가1002', '경기12가1003', '경기12가2001', '경기12가2002', '경기12가2003',
  '인천12가1001', '인천12가1002', '인천12가1003', '부산12가1001', '부산12가1002',
  '대구12가1001', '대전12가1001', '대전12가1002', '광주12가1001', '울산12가1001',
  '세종12가1001', '강원12가1001', '충청12가1001', '전북12가1001', '전남12가1001'
]

const vehicleCountByEvent = {}
let vehicleId = 1
let totalVehicles = 0

oldEvents.forEach(event => {
  const sizeFactor = eventSizeMap[event.id]
  const busCount = getVehicleCountBySize(sizeFactor)
  vehicleCountByEvent[event.id] = busCount
  totalVehicles += busCount

  for (let i = 0; i < busCount; i++) {
    const isBus = Math.random() < 0.75
    const vehicleType = isBus ? '버스' : '중형차'
    const capacity = isBus ? (Math.random() < 0.5 ? 50 : 55) : 35

    newVehicles.push({
      id: 'VEH-' + vehicleId.toString().padStart(3, '0'),
      eventId: event.id,
      vehicleType: vehicleType,
      capacity: capacity,
      plateNumber: plateNumbers[vehicleId % plateNumbers.length],
      driver: driverNames[vehicleId % driverNames.length],
      status: '완료'
    })

    vehicleId++
  }
})

console.log(`✅ 총 ${totalVehicles}대 배차 생성 (평균 ${(totalVehicles / oldEvents.length).toFixed(1)}대)\n`)

// =====================================================
// Step 3: 날짜별로 사물함/차량 중복 사용 최적화
// =====================================================
console.log('📋 Step 3: 날짜별 중복 사용 최적화')

/**
 * 같은 날짜의 행사들을 그룹화
 * 다른 날짜면 같은 사물함과 차량 재사용 가능
 */
const eventsByDate = {}
oldEvents.forEach(event => {
  const date = event.eventDate
  if (!eventsByDate[date]) {
    eventsByDate[date] = []
  }
  eventsByDate[date].push(event.id)
})

console.log(`📅 행사 날짜 분포: ${Object.keys(eventsByDate).length}개 날짜`)
console.log(`   (같은 날짜의 행사들은 보관함/차량 공유 불가능, 다른 날짜면 재사용 가능)\n`)

/**
 * 배차 대수에 따른 예약 건수 분포
 * - 배차 1대: 20-40건 (활용률 40-80%)
 * - 배차 2대: 40-70건 (활용률 40-70%)
 * - 배차 4대: 100-180건 (활용률 50-90%)
 * - 배차 8대: 200-350건 (활용률 50-87%)
 */
const getReservationCountByVehicles = (vehicleCount) => {
  const maxCapacity = vehicleCount * 50

  let utilizationRate

  if (vehicleCount >= 5) {
    // 대규모 행사: 높은 활용률 (70-90%)
    utilizationRate = 0.7 + Math.random() * 0.2
  } else if (vehicleCount >= 2) {
    // 중규모 행사: 중간 활용률 (50-75%)
    utilizationRate = 0.5 + Math.random() * 0.25
  } else {
    // 소규모 행사: 낮은 활용률 (30-60%)
    utilizationRate = 0.3 + Math.random() * 0.3
  }

  return Math.floor(maxCapacity * utilizationRate)
}

const newReservations = []
let resId = 1
let lockerIdx = 0
const maxLockers = oldLockers.length

oldEvents.forEach(event => {
  const vehicleCount = vehicleCountByEvent[event.id]
  const targetCount = getReservationCountByVehicles(vehicleCount)

  const existingReservations = oldReservations.filter(r => r.eventId === event.id)

  if (existingReservations.length > 0 && targetCount > 0) {
    for (let i = 0; i < targetCount; i++) {
      if (lockerIdx >= maxLockers) {
        break
      }

      const sourceRes = existingReservations[i % existingReservations.length]
      const locker = oldLockers[lockerIdx]
      lockerIdx++

      newReservations.push({
        id: 'RES' + String(resId).padStart(10, '0'),
        eventId: event.id,
        lockerId: locker.id,
        customerId: sourceRes.customerId,
        status: sourceRes.status,
        startTime: sourceRes.startTime,
        endTime: sourceRes.endTime,
        itemDescription: sourceRes.itemDescription,
        createdAt: sourceRes.createdAt,
        accessCode: sourceRes.accessCode
      })

      resId++
    }
  }
})

console.log(`✅ 총 ${newReservations.length}건 예약 생성\n`)

// =====================================================
// Step 4: 검증
// =====================================================
console.log('✅ Step 4: 데이터 검증')

const validationIssues = []
oldEvents.forEach(event => {
  const vehicleCount = vehicleCountByEvent[event.id]
  const reservationCount = newReservations.filter(r => r.eventId === event.id).length
  const maxCapacity = vehicleCount * 50

  if (reservationCount > maxCapacity) {
    validationIssues.push(`⚠️  ${event.eventName}: 예약 ${reservationCount}건 > 용량 ${maxCapacity}건`)
  }
})

if (validationIssues.length === 0) {
  console.log('✅ 모든 데이터가 유효합니다\n')
} else {
  console.log(`⚠️  ${validationIssues.length}개 문제 발견:`)
  validationIssues.slice(0, 3).forEach(issue => console.log(`  ${issue}`))
  console.log()
}

// =====================================================
// Step 5: 파일 저장
// =====================================================
console.log('💾 Step 5: 파일 저장')

const vehicleComment = `// 차량 데이터
// id(차량ID)
// eventId(연결된 행사ID)
// vehicleType(차량종류)
// capacity(정원)
// plateNumber(번호판)
// driver(운전자)
// status(상태)
//
// 📌 날짜가 다른 행사면 같은 차량 ID로 재사용 가능 (예약 시스템에서 관리)
`

const vehicleJsContent = vehicleComment + '\nexport const vehicles = ' + JSON.stringify(newVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/vehicles.js'), vehicleJsContent, 'utf8')

const reservationComment = `// 예약 데이터
// id(예약ID)
// eventId(행사ID)
// lockerId(사물함ID)
// customerId(고객ID)
// status(상태)
// startTime(시작시간)
// endTime(종료시간)
// itemDescription(물품설명)
// createdAt(생성시간)
// accessCode(접근코드)
//
// 📌 날짜가 다른 행사면 같은 사물함 ID로 재사용 가능 (EventView에서 날짜 검증)
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(newReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')

console.log(`  ✅ vehicles.js (${newVehicles.length}대)`)
console.log(`  ✅ reservations.js (${newReservations.length}건)\n`)

// =====================================================
// Step 6: 최종 통계
// =====================================================
console.log('📊 최종 결과')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const topEvents = oldEvents
  .map(event => ({
    name: event.eventName,
    type: event.eventType,
    date: event.eventDate,
    vehicles: vehicleCountByEvent[event.id],
    reservations: newReservations.filter(r => r.eventId === event.id).length,
    sizeFactor: (eventSizeMap[event.id] * 100).toFixed(0)
  }))
  .sort((a, b) => b.vehicles - a.vehicles)
  .slice(0, 10)

console.log('\n🏆 배차 Top 10:')
topEvents.forEach((event, idx) => {
  console.log(`  ${idx + 1}. ${event.name}`)
  console.log(`     날짜: ${event.date}, 배차: ${event.vehicles}대, 예약: ${event.reservations}건`)
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${oldEvents.length}개`)
console.log(`✅ 총 배차: ${totalVehicles}대 (평균 ${(totalVehicles / oldEvents.length).toFixed(1)}대)`)
console.log(`✅ 총 예약: ${newReservations.length}건`)
console.log(`✅ 사물함 활용: ${newReservations.length} / ${maxLockers} (${(newReservations.length / maxLockers * 100).toFixed(1)}%)`)
console.log(`✅ 행사 날짜 분포: ${Object.keys(eventsByDate).length}개 날짜`)

console.log('\n📌 중요: 날짜가 다른 행사들은 보관함과 차량을 재사용할 수 있습니다')
console.log('   - 예약 시스템에서 eventDate를 확인하고 중복 사용 제어')
console.log('   - EventView.vue의 조인 로직에서 날짜 검증 필요')

console.log('\n✨ 최적화된 배차 재분배 완료!')
