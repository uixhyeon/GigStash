import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import { lockers } from '../src/data/lockers.js'

console.log('🔧 예약 데이터 분배 수정\n')

// =====================================================
// Step 1: 현재 상태 분석
// =====================================================
console.log('📊 Step 1: 현재 상태 분석')

const currentReservationsByEvent = {}
oldReservations.forEach(r => {
  if (!currentReservationsByEvent[r.eventId]) {
    currentReservationsByEvent[r.eventId] = []
  }
  currentReservationsByEvent[r.eventId].push(r)
})

console.log(`  현재 예약이 있는 행사: ${Object.keys(currentReservationsByEvent).length}개`)
console.log(`  예약이 없는 행사: ${events.length - Object.keys(currentReservationsByEvent).length}개\n`)

// =====================================================
// Step 2: 행사별 배차/예약 계획
// =====================================================
console.log('🎯 Step 2: 행사별 배차/예약 계획')

const eventPlan = {}
events.forEach(event => {
  const vehicleCount = vehicles.filter(v => v.eventId === event.id).length

  // 배차 대수에 따른 예약 건수 계산
  let targetReservations
  if (vehicleCount === 0) {
    targetReservations = 0
  } else if (vehicleCount === 1) {
    targetReservations = Math.floor(30 + Math.random() * 20) // 30-50건
  } else if (vehicleCount <= 3) {
    targetReservations = Math.floor(vehicleCount * 40) // 배차당 40건 평균
  } else if (vehicleCount <= 6) {
    targetReservations = Math.floor(vehicleCount * 50 + Math.random() * 50)
  } else {
    // 8대 이상: 높은 활용률
    targetReservations = Math.floor(vehicleCount * 50 * (0.8 + Math.random() * 0.15))
  }

  eventPlan[event.id] = {
    name: event.eventName,
    vehicleCount,
    targetReservations,
    currentReservations: currentReservationsByEvent[event.id]?.length || 0
  }
})

console.log('배차/예약 계획:')
Object.entries(eventPlan)
  .sort((a, b) => b[1].vehicleCount - a[1].vehicleCount)
  .slice(0, 10)
  .forEach(([eventId, plan]) => {
    console.log(`  ${plan.name}`)
    console.log(`    배차: ${plan.vehicleCount}대, 목표 예약: ${plan.targetReservations}건 (현재: ${plan.currentReservations}건)`)
  })

const totalTarget = Object.values(eventPlan).reduce((sum, p) => sum + p.targetReservations, 0)
console.log(`\n  총 예약 목표: ${totalTarget}건 (현재: ${oldReservations.length}건)\n`)

// =====================================================
// Step 3: 예약 데이터 생성
// =====================================================
console.log('📋 Step 3: 예약 데이터 생성')

const newReservations = []
let resId = 1
let lockerIdx = 0

// 샘플 고객 ID 생성 (예약에서 사용할 커스터머 ID)
const sampleCustomerIds = Array.from({ length: 100 }, (_, i) => `C${String(i + 1).padStart(3, '0')}`)

events.forEach(event => {
  const plan = eventPlan[event.id]
  const targetCount = plan.targetReservations

  if (targetCount === 0) return

  // 기존 예약이 있으면 참고, 없으면 새로 생성
  const existingReservations = currentReservationsByEvent[event.id] || []

  for (let i = 0; i < targetCount; i++) {
    if (lockerIdx >= lockers.length) {
      console.log(`  ⚠️  사물함 부족: ${i}건 미생성`)
      break
    }

    // 기존 예약이 있으면 그걸 참고, 없으면 랜덤 생성
    let baseRes
    if (existingReservations.length > 0) {
      baseRes = existingReservations[i % existingReservations.length]
    } else {
      baseRes = {
        customerId: sampleCustomerIds[Math.floor(Math.random() * sampleCustomerIds.length)],
        status: 'active',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        itemDescription: '예약물품',
        createdAt: new Date().toISOString(),
        accessCode: String(Math.random() * 10000).padStart(4, '0')
      }
    }

    const locker = lockers[lockerIdx]
    lockerIdx++

    newReservations.push({
      id: 'RES' + String(resId).padStart(10, '0'),
      eventId: event.id,
      lockerId: locker.id,
      customerId: baseRes.customerId,
      status: baseRes.status,
      startTime: baseRes.startTime,
      endTime: baseRes.endTime,
      itemDescription: baseRes.itemDescription,
      createdAt: baseRes.createdAt,
      accessCode: baseRes.accessCode
    })

    resId++
  }
})

console.log(`✅ ${newReservations.length}건 예약 생성 완료\n`)

// =====================================================
// Step 4: 검증
// =====================================================
console.log('✅ Step 4: 데이터 검증')

const newReservationsByEvent = {}
newReservations.forEach(r => {
  if (!newReservationsByEvent[r.eventId]) {
    newReservationsByEvent[r.eventId] = 0
  }
  newReservationsByEvent[r.eventId]++
})

const validationIssues = []
events.forEach(event => {
  const vehicleCount = vehicles.filter(v => v.eventId === event.id).length
  const reservationCount = newReservationsByEvent[event.id] || 0
  const maxCapacity = vehicleCount * 50

  if (vehicleCount > 0 && reservationCount === 0) {
    validationIssues.push(`⚠️  ${event.eventName}: 배차 있음 (${vehicleCount}대) but 예약 없음`)
  }

  if (reservationCount > maxCapacity) {
    validationIssues.push(`⚠️  ${event.eventName}: 예약 ${reservationCount}건 > 용량 ${maxCapacity}건`)
  }
})

if (validationIssues.length === 0) {
  console.log('✅ 모든 데이터가 유효합니다\n')
} else {
  console.log(`⚠️  ${validationIssues.length}개 문제 발견:`)
  validationIssues.slice(0, 5).forEach(issue => console.log(`  ${issue}`))
  console.log()
}

// =====================================================
// Step 5: 파일 저장
// =====================================================
console.log('💾 Step 5: 파일 저장')

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
// 📌 날짜가 다른 행사면 같은 사물함 ID로 재사용 가능
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(newReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')

console.log(`  ✅ reservations.js (${newReservations.length}건)\n`)

// =====================================================
// Step 6: 최종 통계
// =====================================================
console.log('📊 최종 결과')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

console.log('\n행사별 배차/예약 Top 10:')
Object.entries(eventPlan)
  .filter(([id, plan]) => plan.vehicleCount > 0)
  .map(([id, plan]) => ({
    ...plan,
    actualReservations: newReservationsByEvent[id] || 0
  }))
  .sort((a, b) => b.vehicleCount - a.vehicleCount)
  .slice(0, 10)
  .forEach((plan, idx) => {
    console.log(`  ${idx + 1}. ${plan.name}`)
    console.log(`     배차: ${plan.vehicleCount}대, 예약: ${plan.actualReservations}건/${plan.targetReservations}건`)
  })

const eventsWithReservations = Object.values(newReservationsByEvent).filter(c => c > 0).length
const eventsWithoutReservations = events.length - eventsWithReservations

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${events.length}개`)
console.log(`✅ 총 배차: ${vehicles.length}대`)
console.log(`✅ 총 예약: ${newReservations.length}건`)
console.log(`✅ 예약 있는 행사: ${eventsWithReservations}개`)
console.log(`✅ 예약 없는 행사: ${eventsWithoutReservations}개`)
console.log(`✅ 사물함 활용: ${newReservations.length} / ${lockers.length} (${(newReservations.length / lockers.length * 100).toFixed(1)}%)`)

console.log('\n✨ 예약 분배 수정 완료!')
