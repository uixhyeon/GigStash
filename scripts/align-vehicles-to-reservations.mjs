import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { events as oldEvents } from '../src/data/events.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import { lockers } from '../src/data/lockers.js'

console.log('🔧 예약 건수에 맞게 배차 조정\n')

// =====================================================
// Step 1: 현재 행사별 예약 분석
// =====================================================
console.log('📊 Step 1: 행사별 예약 분석')

const reservationsByEvent = {}
oldReservations.forEach(r => {
  if (!reservationsByEvent[r.eventId]) {
    reservationsByEvent[r.eventId] = 0
  }
  reservationsByEvent[r.eventId]++
})

console.log(`✅ 행사별 예약 분포 완료\n`)

// =====================================================
// Step 2: 행사 규모 추정 (예약 건수 기반)
// =====================================================
console.log('🎯 Step 2: 행사 규모 추정')

/**
 * 배차 대수 결정 규칙:
 * - 1대당 최대 50명 기준
 * - 예약 건수에 따라 필요한 배차 계산
 * - 예: 180건 → 4대 필요 (180/50 = 3.6 → 올림 4)
 * - 예: 150건 → 3대 필요 (150/50 = 3)
 * - 자연스러운 분포: 활용률 60-90% 목표
 */
const getVehicleCountByReservations = (reservationCount) => {
  if (reservationCount === 0) return 0

  // 1대당 50명 기준으로 필요한 대수 계산
  const minVehicles = Math.ceil(reservationCount / 50)

  // 활용률을 60-90% 범위로 유지하기 위해 약간의 여유 추가
  // 활용률 = 예약 / (배차 * 50)
  // 85% 활용률 목표: 배차 = 예약 / (50 * 0.85)
  const optimalVehicles = Math.ceil(reservationCount / (50 * 0.85))

  // min과 optimal 사이에서 선택 (자연스러운 분포)
  const result = Math.max(minVehicles, Math.min(minVehicles, optimalVehicles))

  return result
}

const eventPlan = {}
oldEvents.forEach(event => {
  const reservationCount = reservationsByEvent[event.id] || 0
  const recommendedVehicles = getVehicleCountByReservations(reservationCount)

  eventPlan[event.id] = {
    name: event.eventName,
    reservationCount,
    recommendedVehicles,
    currentVehicles: oldVehicles.filter(v => v.eventId === event.id).length,
    utilizationRate: recommendedVehicles > 0
      ? (reservationCount / (recommendedVehicles * 50) * 100).toFixed(1)
      : 0
  }
})

console.log('행사별 배차 계획:')
Object.entries(eventPlan)
  .filter(([_, plan]) => plan.reservationCount > 0)
  .sort((a, b) => b[1].reservationCount - a[1].reservationCount)
  .slice(0, 15)
  .forEach(([_, plan]) => {
    const change = plan.recommendedVehicles - plan.currentVehicles
    const changeStr = change > 0 ? `+${change}` : `${change}`
    console.log(`  ${plan.name}`)
    console.log(`    예약: ${plan.reservationCount}건 → 배차: ${plan.currentVehicles}대 → ${plan.recommendedVehicles}대 (${changeStr})`)
    console.log(`    활용률: ${plan.utilizationRate}%`)
  })

console.log()

// =====================================================
// Step 3: 배차 재생성
// =====================================================
console.log('🚗 Step 3: 예약 기반 배차 재생성')

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

const newVehicles = []
let vehicleId = 1

oldEvents.forEach(event => {
  const plan = eventPlan[event.id]
  const vehicleCount = plan.recommendedVehicles

  for (let i = 0; i < vehicleCount; i++) {
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

console.log(`✅ ${newVehicles.length}대 배차 생성 완료\n`)

// =====================================================
// Step 4: 검증
// =====================================================
console.log('✅ Step 4: 데이터 검증')

const newVehiclesByEvent = {}
newVehicles.forEach(v => {
  if (!newVehiclesByEvent[v.eventId]) {
    newVehiclesByEvent[v.eventId] = 0
  }
  newVehiclesByEvent[v.eventId]++
})

const validationIssues = []
oldEvents.forEach(event => {
  const vehicleCount = newVehiclesByEvent[event.id] || 0
  const reservationCount = reservationsByEvent[event.id] || 0

  if (reservationCount === 0 && vehicleCount > 0) {
    validationIssues.push(`⚠️  ${event.eventName}: 예약 0건 but 배차 ${vehicleCount}대`)
  }

  if (vehicleCount > 0) {
    const maxCapacity = vehicleCount * 50
    if (reservationCount > maxCapacity) {
      validationIssues.push(`⚠️  ${event.eventName}: 예약 ${reservationCount}건 > 용량 ${maxCapacity}건`)
    }
  }
})

if (validationIssues.length === 0) {
  console.log('✅ 모든 데이터가 유효합니다\n')
} else {
  console.log(`⚠️  ${validationIssues.length}개 문제 발견:`)
  validationIssues.forEach(issue => console.log(`  ${issue}`))
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
// 📌 배차 기준: 1대당 최대 50명
// 📌 예약 기반 배차: 예약 건수에 따라 배차 대수 결정
// 📌 활용률: 60-90% 범위로 자연스러운 분포
`

const vehicleJsContent = vehicleComment + '\nexport const vehicles = ' + JSON.stringify(newVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/vehicles.js'), vehicleJsContent, 'utf8')

console.log(`  ✅ vehicles.js (${newVehicles.length}대)\n`)

// =====================================================
// Step 6: 최종 통계
// =====================================================
console.log('📊 최종 결과')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const topEvents = Object.entries(eventPlan)
  .filter(([_, plan]) => plan.reservationCount > 0)
  .map(([id, plan]) => ({
    ...plan,
    id,
    vehicleCount: newVehiclesByEvent[id] || 0
  }))
  .sort((a, b) => b.reservationCount - a.reservationCount)
  .slice(0, 15)

console.log('\n예약 기반 배차 Top 15:')
topEvents.forEach((plan, idx) => {
  console.log(`  ${idx + 1}. ${plan.name}`)
  console.log(`     예약: ${plan.reservationCount}건, 배차: ${plan.vehicleCount}대, 활용률: ${plan.utilizationRate}%`)
})

const eventStats = oldEvents.map(event => {
  const resCount = reservationsByEvent[event.id] || 0
  const vehCount = newVehiclesByEvent[event.id] || 0
  return { resCount, vehCount }
})

const totalReservations = eventStats.reduce((sum, e) => sum + e.resCount, 0)
const totalVehicles = newVehicles.length
const eventsWithData = eventStats.filter(e => e.resCount > 0 || e.vehCount > 0).length

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${oldEvents.length}개`)
console.log(`✅ 데이터 있는 행사: ${eventsWithData}개`)
console.log(`✅ 총 예약: ${totalReservations}건`)
console.log(`✅ 총 배차: ${totalVehicles}대`)
console.log(`✅ 평균 배차: ${(totalVehicles / oldEvents.length).toFixed(1)}대/행사`)
console.log(`✅ 평균 예약: ${(totalReservations / oldEvents.length).toFixed(1)}건/행사`)

// 활용률 분석
const utilizationRates = eventStats
  .filter(e => e.vehCount > 0)
  .map(e => (e.resCount / (e.vehCount * 50)) * 100)

const avgUtilization = (utilizationRates.reduce((sum, r) => sum + r, 0) / utilizationRates.length).toFixed(1)
const minUtilization = Math.min(...utilizationRates).toFixed(1)
const maxUtilization = Math.max(...utilizationRates).toFixed(1)

console.log(`✅ 활용률: 평균 ${avgUtilization}%, 범위 ${minUtilization}%-${maxUtilization}%`)

console.log('\n✨ 배차 조정 완료!')
