import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { reservations } from '../src/data/reservations.js'

console.log('📊 행사 규모 분석 시작...\n')

// =====================================================
// Step 1: 행사별 현재 데이터 분석
// =====================================================
console.log('📌 Step 1: 현재 행사 데이터 분석')

const eventAnalysis = {}

events.forEach(event => {
  const vehicleCount = vehicles.filter(v => v.eventId === event.id).length
  const reservationCount = reservations.filter(r => r.eventId === event.id).length

  eventAnalysis[event.id] = {
    name: event.eventName,
    type: event.eventType,
    date: event.eventDate,
    venue: event.eventVenue,
    currentVehicles: vehicleCount,
    currentReservations: reservationCount,
    currentCapacity: vehicleCount * 50
  }
})

console.log(`✅ ${Object.keys(eventAnalysis).length}개 행사 분석 완료\n`)

// =====================================================
// Step 2: 행사 규모 추정 (규모 팩터 계산)
// =====================================================
console.log('📊 Step 2: 행사 규모 추정')

const estimateEventSize = (event) => {
  const eventName = event.name || ''
  const eventType = event.type || ''
  const venue = event.venue || ''

  let sizeFactor = 0.5 // 기본값: 소규모

  // 1. 행사 이름 분석
  if (eventName.includes('ASIA') || eventName.includes('투어') || eventName.includes('TOUR') || eventName.includes('World')) {
    sizeFactor = 0.9 // 국제 행사: 매우 큼 (90%)
  } else if (eventName.includes('콘서트') || eventName.includes('페스티벌') || eventName.includes('축제')) {
    sizeFactor = 0.8 // 대규모 문화행사: 큼 (80%)
  } else if (eventName.includes('뮤지컬') || eventName.includes('공연')) {
    sizeFactor = 0.7 // 공연: 중간 (70%)
  } else if (eventName.includes('농구') || eventName.includes('스포츠') || eventName.includes('경기')) {
    sizeFactor = 0.4 // 스포츠: 작음 (40%)
  }

  // 2. 행사 타입 분석
  if (eventType.includes('내한공연')) {
    sizeFactor = Math.max(sizeFactor, 0.85)
  } else if (eventType.includes('콘서트') || eventType.includes('뮤지컬')) {
    sizeFactor = Math.max(sizeFactor, 0.75)
  } else if (eventType.includes('아이돌')) {
    sizeFactor = Math.max(sizeFactor, 0.8)
  } else if (eventType.includes('스포츠')) {
    sizeFactor = Math.min(sizeFactor, 0.4)
  } else if (eventType.includes('페스티벌')) {
    sizeFactor = Math.max(sizeFactor, 0.75)
  }

  // 3. 장소 분석
  if (venue.includes('올림픽스타디움') || venue.includes('잠실') || venue.includes('고척') || venue.includes('킨텍스')) {
    sizeFactor = Math.max(sizeFactor, 0.7)
  }

  return sizeFactor
}

const eventSizes = {}
const sizeCategories = {
  megaEvent: [], // 90% 이상
  largeEvent: [], // 70-89%
  mediumEvent: [], // 50-69%
  smallEvent: [] // 40-49%
}

Object.entries(eventAnalysis).forEach(([eventId, event]) => {
  const sizeFactor = estimateEventSize(event)
  eventSizes[eventId] = sizeFactor

  if (sizeFactor >= 0.9) {
    sizeCategories.megaEvent.push({ ...event, id: eventId, sizeFactor })
  } else if (sizeFactor >= 0.7) {
    sizeCategories.largeEvent.push({ ...event, id: eventId, sizeFactor })
  } else if (sizeFactor >= 0.5) {
    sizeCategories.mediumEvent.push({ ...event, id: eventId, sizeFactor })
  } else {
    sizeCategories.smallEvent.push({ ...event, id: eventId, sizeFactor })
  }
})

console.log('\n행사 규모 분류:')
console.log(`  🌟 메가 행사 (90-100%): ${sizeCategories.megaEvent.length}개`)
console.log(`  📈 대규모 (70-89%): ${sizeCategories.largeEvent.length}개`)
console.log(`  📊 중규모 (50-69%): ${sizeCategories.mediumEvent.length}개`)
console.log(`  📍 소규모 (40-49%): ${sizeCategories.smallEvent.length}개`)

// =====================================================
// Step 3: 행사 규모별 배차 기준 정의
// =====================================================
console.log('\n📊 Step 3: 규모별 배차 기준 정의')

const getRecommendedVehicleCount = (sizeFactor, eventType) => {
  // 1배차 = 50명 기준

  if (sizeFactor >= 0.9) {
    // 메가 행사: 8-12대 (400-600명)
    return Math.floor(8 + Math.random() * 4)
  } else if (sizeFactor >= 0.7) {
    // 대규모: 5-8대 (250-400명)
    if (eventType.includes('스포츠')) return Math.floor(2 + Math.random() * 2) // 스포츠는 예외
    return Math.floor(5 + Math.random() * 3)
  } else if (sizeFactor >= 0.5) {
    // 중규모: 2-4대 (100-200명)
    return Math.floor(2 + Math.random() * 2)
  } else {
    // 소규모: 1-2대 (50-100명)
    return Math.floor(1 + Math.random() * 1)
  }
}

// =====================================================
// Step 4: 배차 재분배 계획
// =====================================================
console.log('\n🚗 Step 4: 배차 재분배 계획')

const vehicleRedistribution = {}
let totalVehicles = 0

Object.entries(eventAnalysis).forEach(([eventId, event]) => {
  const sizeFactor = eventSizes[eventId]
  const recommendedCount = getRecommendedVehicleCount(sizeFactor, event.type)

  vehicleRedistribution[eventId] = {
    name: event.name,
    type: event.type,
    sizeFactor: (sizeFactor * 100).toFixed(0) + '%',
    current: event.currentVehicles,
    recommended: recommendedCount,
    change: recommendedCount - event.currentVehicles
  }

  totalVehicles += recommendedCount
})

// 규모별 변화 통계
const changes = Object.values(vehicleRedistribution)
const increased = changes.filter(c => c.change > 0).length
const decreased = changes.filter(c => c.change < 0).length
const unchanged = changes.filter(c => c.change === 0).length

console.log(`\n배차 재분배 결과:`)
console.log(`  ⬆️  증가: ${increased}개 행사`)
console.log(`  ⬇️  감소: ${decreased}개 행사`)
console.log(`  ➡️  유지: ${unchanged}개 행사`)
console.log(`  총 배차: ${Object.values(eventAnalysis).reduce((sum, e) => sum + e.currentVehicles, 0)}대 → ${totalVehicles}대`)

// =====================================================
// Step 5: 상세 계획서 출력
// =====================================================
console.log('\n📋 Step 5: 상세 계획서')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

console.log('\n🌟 메가 행사 (90-100%):')
sizeCategories.megaEvent.forEach((event, idx) => {
  const redist = vehicleRedistribution[event.id]
  console.log(`  ${idx + 1}. ${event.name}`)
  console.log(`     현재: ${redist.current}대 → 추천: ${redist.recommended}대 (${redist.change > 0 ? '+' : ''}${redist.change})`)
})

console.log('\n📈 대규모 행사 (70-89%):')
sizeCategories.largeEvent.slice(0, 5).forEach((event, idx) => {
  const redist = vehicleRedistribution[event.id]
  console.log(`  ${idx + 1}. ${event.name}`)
  console.log(`     현재: ${redist.current}대 → 추천: ${redist.recommended}대 (${redist.change > 0 ? '+' : ''}${redist.change})`)
})
if (sizeCategories.largeEvent.length > 5) {
  console.log(`  ... 외 ${sizeCategories.largeEvent.length - 5}개`)
}

console.log('\n📊 중규모 행사 (50-69%):')
sizeCategories.mediumEvent.slice(0, 5).forEach((event, idx) => {
  const redist = vehicleRedistribution[event.id]
  console.log(`  ${idx + 1}. ${event.name}`)
  console.log(`     현재: ${redist.current}대 → 추천: ${redist.recommended}대 (${redist.change > 0 ? '+' : ''}${redist.change})`)
})
if (sizeCategories.mediumEvent.length > 5) {
  console.log(`  ... 외 ${sizeCategories.mediumEvent.length - 5}개`)
}

console.log('\n📍 소규모 행사 (40-49%):')
sizeCategories.smallEvent.slice(0, 5).forEach((event, idx) => {
  const redist = vehicleRedistribution[event.id]
  console.log(`  ${idx + 1}. ${event.name}`)
  console.log(`     현재: ${redist.current}대 → 추천: ${redist.recommended}대 (${redist.change > 0 ? '+' : ''}${redist.change})`)
})
if (sizeCategories.smallEvent.length > 5) {
  console.log(`  ... 외 ${sizeCategories.smallEvent.length - 5}개`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`\n✨ 행사 규모 분석 완료!`)
console.log(`\n다음 단계: 이 계획을 바탕으로 vehicles.js를 재분배하시겠습니까?`)

// JSON으로 계획 저장
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const planPath = path.join(__dirname, '../vehicle-redistribution-plan.json')

fs.writeFileSync(planPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalEvents: Object.keys(eventAnalysis).length,
    currentTotalVehicles: Object.values(eventAnalysis).reduce((sum, e) => sum + e.currentVehicles, 0),
    recommendedTotalVehicles: totalVehicles,
    increaseCount: increased,
    decreaseCount: decreased,
    unchangedCount: unchanged
  },
  redistribution: vehicleRedistribution,
  sizeFactor: eventSizes
}, null, 2), 'utf8')

console.log(`\n📁 계획이 저장되었습니다: vehicle-redistribution-plan.json`)
