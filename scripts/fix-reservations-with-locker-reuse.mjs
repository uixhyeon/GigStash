import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'

console.log('🔧 예약 데이터 분배 수정 (사물함 재사용)\n')

// =====================================================
// Step 1: 행사별 배차/예약 계획
// =====================================================
console.log('🎯 Step 1: 행사별 배차/예약 계획')

const eventPlan = {}
let totalTargetReservations = 0

events.forEach(event => {
  const vehicleCount = vehicles.filter(v => v.eventId === event.id).length

  // 배차 대수에 따른 예약 건수 계산
  let targetReservations
  if (vehicleCount === 0) {
    targetReservations = 0
  } else if (vehicleCount === 1) {
    targetReservations = Math.floor(20 + Math.random() * 30) // 20-50건
  } else if (vehicleCount <= 3) {
    targetReservations = Math.floor(vehicleCount * 40 + Math.random() * 20)
  } else if (vehicleCount <= 6) {
    targetReservations = Math.floor(vehicleCount * 45 + Math.random() * 50)
  } else {
    // 8대 이상: 높은 활용률
    targetReservations = Math.floor(vehicleCount * 50 * (0.75 + Math.random() * 0.2))
  }

  eventPlan[event.id] = {
    name: event.eventName,
    vehicleCount,
    targetReservations,
    date: event.eventDate
  }

  totalTargetReservations += targetReservations
})

console.log(`총 예약 목표: ${totalTargetReservations}건 (사물함: ${lockers.length}개)\n`)

// =====================================================
// Step 2: 사물함을 날짜별로 재사용하도록 예약 생성
// =====================================================
console.log('📋 Step 2: 사물함 재사용하여 예약 생성')

const newReservations = []
let resId = 1

// 날짜별 사물함 사용 추적
const lockerUsageByDate = {}

// 샘플 고객 ID
const sampleCustomerIds = Array.from({ length: 100 }, (_, i) => `C${String(i + 1).padStart(3, '0')}`)

events.forEach(event => {
  const plan = eventPlan[event.id]
  const targetCount = plan.targetReservations

  if (targetCount === 0) return

  // 날짜별 사물함 카운터 초기화
  if (!lockerUsageByDate[plan.date]) {
    lockerUsageByDate[plan.date] = 0
  }

  for (let i = 0; i < targetCount; i++) {
    // 날짜별로 사물함 순환 재사용
    const lockerIdx = lockerUsageByDate[plan.date] % lockers.length
    const locker = lockers[lockerIdx]
    lockerUsageByDate[plan.date]++

    newReservations.push({
      id: 'RES' + String(resId).padStart(10, '0'),
      eventId: event.id,
      lockerId: locker.id,
      customerId: sampleCustomerIds[Math.floor(Math.random() * sampleCustomerIds.length)],
      status: 'active',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      itemDescription: '예약물품',
      createdAt: new Date().toISOString(),
      accessCode: String(Math.random() * 10000).padStart(4, '0')
    })

    resId++
  }
})

console.log(`✅ ${newReservations.length}건 예약 생성 완료\n`)

// =====================================================
// Step 3: 검증
// =====================================================
console.log('✅ Step 3: 데이터 검증')

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
    validationIssues.push(`⚠️  ${event.eventName}: 배차 ${vehicleCount}대 but 예약 0건`)
  }

  if (reservationCount > maxCapacity) {
    validationIssues.push(`⚠️  ${event.eventName}: 예약 ${reservationCount}건 > 용량 ${maxCapacity}건`)
  }
})

if (validationIssues.length === 0) {
  console.log('✅ 모든 데이터가 유효합니다\n')
} else {
  console.log(`⚠️  ${validationIssues.length}개 문제 발견:`)
  validationIssues.slice(0, 10).forEach(issue => console.log(`  ${issue}`))
  console.log()
}

// =====================================================
// Step 4: 파일 저장
// =====================================================
console.log('💾 Step 4: 파일 저장')

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
// 📌 같은 날짜 행사는 다른 사물함 사용
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(newReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')

console.log(`  ✅ reservations.js (${newReservations.length}건)\n`)

// =====================================================
// Step 5: 최종 통계
// =====================================================
console.log('📊 최종 결과')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

console.log('\n행사별 배차/예약 Top 10:')
Object.entries(eventPlan)
  .filter(([id, plan]) => plan.vehicleCount > 0)
  .map(([id, plan]) => ({
    ...plan,
    id,
    actualReservations: newReservationsByEvent[id] || 0
  }))
  .sort((a, b) => b.vehicleCount - a.vehicleCount)
  .slice(0, 10)
  .forEach((plan, idx) => {
    const utilizationRate = plan.vehicleCount > 0
      ? (plan.actualReservations / (plan.vehicleCount * 50) * 100).toFixed(0)
      : 0
    console.log(`  ${idx + 1}. ${plan.name}`)
    console.log(`     배차: ${plan.vehicleCount}대, 예약: ${plan.actualReservations}건 (활용률: ${utilizationRate}%)`)
  })

const eventsWithReservations = Object.values(newReservationsByEvent).filter(c => c > 0).length
const eventsWithoutReservations = events.length - eventsWithReservations

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${events.length}개`)
console.log(`✅ 총 배차: ${vehicles.length}대`)
console.log(`✅ 총 예약: ${newReservations.length}건`)
console.log(`✅ 예약 있는 행사: ${eventsWithReservations}개 (${(eventsWithReservations / events.length * 100).toFixed(1)}%)`)
console.log(`✅ 예약 없는 행사: ${eventsWithoutReservations}개`)
console.log(`✅ 행사 날짜 분포: ${Object.keys(lockerUsageByDate).length}개 날짜`)

console.log('\n📌 사물함 재사용 전략:')
console.log('   - 같은 날짜: 다른 사물함 사용')
console.log('   - 다른 날짜: 같은 사물함 재사용 가능')
console.log(`   - 최대 사용 횟수: ${Math.max(...Object.values(lockerUsageByDate))}회`)

console.log('\n✨ 예약 분배 완료!')
