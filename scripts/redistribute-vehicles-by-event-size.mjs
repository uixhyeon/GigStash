import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events as oldEvents } from '../src/data/events.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import { lockers as oldLockers } from '../src/data/lockers.js'

console.log('🔄 행사 규모를 반영한 배차 재분배 (불균등 분포)...\n')

// =====================================================
// Step 1: 행사 규모 추정
// =====================================================
console.log('📊 Step 1: 행사 규모 추정')

const estimateEventSize = (event) => {
  const eventName = event.eventName || ''
  const eventType = event.eventType || ''

  // 기본값
  let sizeFactor = 0.4

  // 국제 행사 - 매우 큼
  if (eventName.includes('ASIA') || eventName.includes('투어') || eventName.includes('TOUR')) {
    sizeFactor = 0.9 + Math.random() * 0.08 // 90-98%
  }
  // 아이돌 콘서트 - 큼
  else if (eventType.includes('내한공연') || eventType.includes('아이돌')) {
    sizeFactor = 0.75 + Math.random() * 0.1 // 75-85%
  }
  // 뮤지컬/공연 - 중간
  else if (eventType.includes('뮤지컬') || eventType.includes('페스티벌')) {
    sizeFactor = 0.6 + Math.random() * 0.1 // 60-70%
  }
  // 스포츠 - 작음
  else if (eventType.includes('스포츠')) {
    sizeFactor = 0.3 + Math.random() * 0.1 // 30-40%
  }
  // 기타
  else {
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
// Step 2: 불균등 분포 배차 계산
// =====================================================
console.log('🚗 Step 2: 불균등 분포로 배차 재계산')

/**
 * 행사 규모에 따라 배차 대수를 불균등하게 분배
 * - 메가 행사: 8-15대 (넓은 범위, 자연스러운 편차)
 * - 대규모: 4-7대 (40~70% 규모)
 * - 중규모: 2-4대
 * - 소규모: 1-2대
 */
const getVehicleCountBySize = (sizeFactor) => {
  if (sizeFactor >= 0.85) {
    // 메가 행사: 8-15대, 평균 11대 (더 큰 편차)
    return Math.floor(8 + (sizeFactor - 0.85) * 50 + Math.random() * 5)
  } else if (sizeFactor >= 0.65) {
    // 대규모: 5-10대
    return Math.floor(5 + (sizeFactor - 0.65) * 12 + Math.random() * 3)
  } else if (sizeFactor >= 0.45) {
    // 중규모: 2-5대
    return Math.floor(2 + (sizeFactor - 0.45) * 8 + Math.random() * 2)
  } else {
    // 소규모: 1-3대
    return Math.floor(1 + Math.random() * 2)
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

  // 배차 생성
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

console.log(`✅ 총 ${totalVehicles}대 배차 생성 완료\n`)

// =====================================================
// Step 3: 예약 건수 조정 (배차 대수에 맞춤)
// =====================================================
console.log('📋 Step 3: 배차에 맞춰 예약 건수 조정')

/**
 * 배차 대수에 따른 예약 건수 분포
 * - 배차 1대: 20-40건 (활용률 40-80%)
 * - 배차 3대: 60-120건 (활용률 40-80%)
 * - 배차 8대: 200-350건 (활용률 50-87%)
 * - 배차 12대: 350-550건 (활용률 58-91%)
 */
const getReservationCountByVehicles = (vehicleCount, eventType) => {
  const maxCapacity = vehicleCount * 50

  // 불균등 분포: 40-90% 활용률 (평균 65%)
  let utilizationRate

  if (vehicleCount >= 8) {
    // 대규모 행사: 높은 활용률 (70-90%)
    utilizationRate = 0.7 + Math.random() * 0.2
  } else if (vehicleCount >= 4) {
    // 중규모 행사: 중간 활용률 (55-75%)
    utilizationRate = 0.55 + Math.random() * 0.2
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
  const targetCount = getReservationCountByVehicles(vehicleCount, event.eventType)

  const existingReservations = oldReservations.filter(r => r.eventId === event.id)

  if (existingReservations.length > 0 && targetCount > 0) {
    for (let i = 0; i < targetCount; i++) {
      if (lockerIdx >= maxLockers) {
        break // 사물함 부족시 중단
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

console.log(`✅ 총 ${newReservations.length}건 예약 생성 완료\n`)

// =====================================================
// Step 4: 데이터 검증
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
  console.log(`⚠️  ${validationIssues.length}개 행사에서 문제 발견:`)
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
    vehicles: vehicleCountByEvent[event.id],
    reservations: newReservations.filter(r => r.eventId === event.id).length,
    sizeFactor: (eventSizeMap[event.id] * 100).toFixed(0)
  }))
  .sort((a, b) => b.vehicles - a.vehicles)
  .slice(0, 10)

console.log('\n🏆 배차 Top 10:')
topEvents.forEach((event, idx) => {
  console.log(`  ${idx + 1}. ${event.name}`)
  console.log(`     배차: ${event.vehicles}대, 예약: ${event.reservations}건, 규모: ${event.sizeFactor}%`)
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${oldEvents.length}개`)
console.log(`✅ 총 배차: ${totalVehicles}대 (평균 ${(totalVehicles / oldEvents.length).toFixed(1)}대)`)
console.log(`✅ 총 예약: ${newReservations.length}건`)
console.log(`✅ 사물함 활용: ${newReservations.length} / ${maxLockers} (${(newReservations.length / maxLockers * 100).toFixed(1)}%)`)

console.log('\n✨ 불균등 분포 배차 재분배 완료!')
