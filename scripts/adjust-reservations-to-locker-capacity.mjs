import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'
import { reservations as oldReservations } from '../src/data/reservations.js'

console.log('🔄 예약 건수를 사물함 용량에 맞게 조정...\n')

// =====================================================
// Step 1: 현재 상태 분석
// =====================================================
console.log('📊 Step 1: 현재 상태 분석')

const maxLockerCount = lockers.length
const currentReservationCount = oldReservations.length

console.log(`  사물함 총 개수: ${maxLockerCount}개`)
console.log(`  현재 예약 건수: ${currentReservationCount}건`)
console.log(`  초과분: ${currentReservationCount - maxLockerCount}건\n`)

// =====================================================
// Step 2: 행사별 배차와 목표 예약 건수 재계산
// =====================================================
console.log('📊 Step 2: 행사별 배차/예약 재계산')

const eventReservationMap = {}
let totalTargetReservations = 0

events.forEach(event => {
  const eventVehicles = vehicles.filter(v => v.eventId === event.id)
  const vehicleCount = eventVehicles.length

  // 배차 대수에 따른 목표 예약 건수 (1대 = 50석 기준)
  // - 1대: 30-50건
  // - 2대: 60-100건
  // - 3대: 90-150건
  // - 4대: 120-200건
  // - 8대: 300-400건

  let minReservations, maxReservations

  if (vehicleCount === 0) {
    minReservations = 0
    maxReservations = 0
  } else if (vehicleCount === 1) {
    minReservations = 30
    maxReservations = 50
  } else if (vehicleCount === 2) {
    minReservations = 60
    maxReservations = 100
  } else if (vehicleCount === 3) {
    minReservations = 90
    maxReservations = 150
  } else if (vehicleCount === 4) {
    minReservations = 120
    maxReservations = 200
  } else if (vehicleCount <= 8) {
    minReservations = vehicleCount * 40
    maxReservations = vehicleCount * 50
  } else {
    minReservations = vehicleCount * 40
    maxReservations = vehicleCount * 50
  }

  // 실제 예약 건수는 min~max 범위에서 랜덤 선택 (하지만 50% 확률로 미달성)
  const targetReservations = Math.floor(minReservations + Math.random() * (maxReservations - minReservations))

  eventReservationMap[event.id] = {
    eventName: event.eventName,
    vehicleCount: vehicleCount,
    minReservations,
    maxReservations,
    targetReservations
  }

  totalTargetReservations += targetReservations
})

console.log(`  목표 총 예약: ${totalTargetReservations}건`)

// 사물함 초과 시 비율 조정
let adjustmentRatio = 1.0
if (totalTargetReservations > maxLockerCount) {
  adjustmentRatio = maxLockerCount / totalTargetReservations
  console.log(`  ⚠️  초과 감지, 조정 비율: ${(adjustmentRatio * 100).toFixed(1)}%\n`)
}

// =====================================================
// Step 3: 조정된 예약 데이터 생성
// =====================================================
console.log('📋 Step 3: 조정된 예약 데이터 생성')

const newReservations = []
let resId = 1
let lockerIdx = 0

const eventReservationCounts = {}

events.forEach(event => {
  const targetCount = Math.max(0, Math.floor(eventReservationMap[event.id].targetReservations * adjustmentRatio))
  const existingReservations = oldReservations.filter(r => r.eventId === event.id)

  eventReservationCounts[event.id] = targetCount

  if (existingReservations.length > 0 && targetCount > 0) {
    for (let i = 0; i < targetCount; i++) {
      if (lockerIdx >= maxLockerCount) {
        console.log(`  ⚠️  사물함 부족: ${i}건 미생성`)
        break
      }

      const sourceRes = existingReservations[i % existingReservations.length]
      const locker = lockers[lockerIdx]
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

console.log(`✅ 조정된 예약: ${newReservations.length}건`)

// =====================================================
// Step 4: 배차/예약 비율 검증
// =====================================================
console.log('\n📊 Step 4: 배차/예약 비율 검증')

const validationIssues = []

events.forEach(event => {
  const vehicleCount = vehicles.filter(v => v.eventId === event.id).length
  const reservationCount = newReservations.filter(r => r.eventId === event.id).length
  const maxCapacity = vehicleCount * 50

  const info = eventReservationMap[event.id]

  if (reservationCount > maxCapacity) {
    validationIssues.push(`⚠️  ${event.eventName}: 예약 ${reservationCount}건 > 용량 ${maxCapacity}건`)
  }

  if (vehicleCount > 0 && reservationCount < info.minReservations) {
    // 최소값 미달은 경고만 (자연스러운 감소)
  }
})

if (validationIssues.length === 0) {
  console.log('  ✅ 모든 예약이 배차 용량 내에 있습니다')
} else {
  console.log(`  ⚠️  검증 실패 (${validationIssues.length}건):`)
  validationIssues.slice(0, 5).forEach(issue => console.log(`    ${issue}`))
}

// =====================================================
// Step 5: 파일 저장
// =====================================================
console.log('\n💾 Step 5: 파일 저장')

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

console.log(`  ✅ reservations.js (${newReservations.length}건 예약)`)

// =====================================================
// Step 6: 최종 통계
// =====================================================
console.log('\n📊 최종 결과')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const vehicleReservationPairs = []

events.forEach(event => {
  const vehicleCount = vehicles.filter(v => v.eventId === event.id).length
  const reservationCount = newReservations.filter(r => r.eventId === event.id).length

  if (vehicleCount > 0) {
    vehicleReservationPairs.push({
      name: event.eventName,
      vehicles: vehicleCount,
      reservations: reservationCount,
      utilization: (reservationCount / (vehicleCount * 50) * 100).toFixed(1)
    })
  }
})

// 상위 10개 행사
console.log('\n배차/예약 상위 10개 행사:')
vehicleReservationPairs
  .sort((a, b) => b.vehicles - a.vehicles)
  .slice(0, 10)
  .forEach(pair => {
    console.log(`  ${pair.name}`)
    console.log(`    배차: ${pair.vehicles}대, 예약: ${pair.reservations}건, 활용률: ${pair.utilization}%`)
  })

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${events.length}개`)
console.log(`✅ 총 배차: ${vehicles.length}대`)
console.log(`✅ 총 예약: ${newReservations.length}건`)
console.log(`✅ 사물함 활용: ${newReservations.length} / ${maxLockerCount} (${(newReservations.length / maxLockerCount * 100).toFixed(1)}%)`)

console.log('\n✨ 예약 조정 완료!')
