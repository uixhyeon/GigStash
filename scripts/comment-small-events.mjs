import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('📝 1000석 미만 행사 주석처리 시작...\n')

// =====================================================
// Step 1: git에서 원본 데이터 복구
// =====================================================
console.log('📥 Step 1: 원본 데이터 복구 중...')

let eventJsonStr, vehicleJsonStr, reservationJsonStr

try {
  eventJsonStr = execSync('git show 064753e:src/data/events.json', {
    cwd: 'd:\\SDY\\project\\GigStash',
    encoding: 'utf-8'
  })
  vehicleJsonStr = execSync('git show 064753e:src/data/vehicles.json', {
    cwd: 'd:\\SDY\\project\\GigStash',
    encoding: 'utf-8'
  })
  reservationJsonStr = execSync('git show 064753e:src/data/reservations.json', {
    cwd: 'd:\\SDY\\project\\GigStash',
    encoding: 'utf-8'
  })
  console.log('✅ git에서 데이터 복구 성공')
} catch (error) {
  console.error('❌ 복구 실패:', error.message)
  process.exit(1)
}

const eventData = JSON.parse(eventJsonStr)
const vehicleData = JSON.parse(vehicleJsonStr)
const reservationData = JSON.parse(reservationJsonStr)

const events = eventData.events || []
const vehicles = vehicleData.vehicles || []
const reservations = reservationData.reservations || []

console.log(`✅ 원본: 행사 ${events.length}개, 차량 ${vehicles.length}대, 예약 ${reservations.length}건`)

// =====================================================
// Step 2: 행사별 규모 계산
// =====================================================
console.log('\n📊 Step 2: 행사 규모 계산 중...')

const eventCapacity = {}
events.forEach(event => {
  const capacity = (event.vehicleCount || 1) * 50
  eventCapacity[event.id] = {
    name: event.eventName,
    vehicleCount: event.vehicleCount || 1,
    capacity: capacity
  }
})

const largeCapacityIds = new Set()
const smallCapacityIds = []

Object.entries(eventCapacity).forEach(([id, data]) => {
  if (data.capacity >= 1000) {
    largeCapacityIds.add(id)
  } else {
    smallCapacityIds.push({ id, ...data })
  }
})

console.log(`✅ 1000석 이상: ${largeCapacityIds.size}개 (활성화)`)
console.log(`❌ 1000석 미만: ${smallCapacityIds.length}개 (주석처리)`)

if (smallCapacityIds.length > 0) {
  console.log('\n  주석처리 대상:')
  smallCapacityIds.slice(0, 10).forEach(item => {
    console.log(`    - ${item.id}: ${item.name} (${item.capacity}석)`)
  })
  if (smallCapacityIds.length > 10) {
    console.log(`    ... 외 ${smallCapacityIds.length - 10}개`)
  }
}

// =====================================================
// Step 3: events.js 생성 (주석 포함)
// =====================================================
console.log('\n📝 Step 3: events.js 생성 중...')

const eventComment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// createdAt(생성시간)

export const events = [`

let eventContent = eventComment

// 활성 행사들 (1000석 이상)
const activeEvents = events.filter(e => largeCapacityIds.has(e.id))
activeEvents.forEach((event, index) => {
  eventContent += '\n  ' + JSON.stringify(event, null, 2).split('\n').join('\n  ')
  if (index < activeEvents.length - 1 || smallCapacityIds.length > 0) {
    eventContent += ','
  }
})

// 주석처리된 행사들 (1000석 미만)
if (smallCapacityIds.length > 0) {
  eventContent += '\n\n  /* ===== 1000석 미만 소규모 행사 (주석처리) =====\n'
  const inactiveEvents = events.filter(e => !largeCapacityIds.has(e.id))
  inactiveEvents.forEach((event, index) => {
    eventContent += '  ' + JSON.stringify(event, null, 2).split('\n').join('\n  ')
    if (index < inactiveEvents.length - 1) {
      eventContent += ','
    }
  })
  eventContent += '\n  ===== 끝 ===== */\n'
}

eventContent += '\n]\n\nexport default {\n  events\n}\n'

fs.writeFileSync(path.join(__dirname, '../src/data/events.js'), eventContent, 'utf8')
console.log(`✅ events.js 생성 완료 (활성: ${activeEvents.length}개, 주석: ${smallCapacityIds.length}개)`)

// =====================================================
// Step 4: vehicles.js 생성
// =====================================================
console.log('\n🚗 Step 4: vehicles.js 생성 중...')

const vehicleComment = `// 차량 데이터
// id(차량ID)
// eventId(연결된 행사ID)
// vehicleType(차량종류)
// capacity(정원)
// plateNumber(번호판)
// driver(운전자)
// status(상태)

export const vehicles = [`

let vehicleContent = vehicleComment

// 활성 행사의 차량들
const activeVehicles = vehicles.filter(v => largeCapacityIds.has(v.eventId))
const inactiveVehicles = vehicles.filter(v => !largeCapacityIds.has(v.eventId))

activeVehicles.forEach((vehicle, index) => {
  vehicleContent += '\n  ' + JSON.stringify(vehicle, null, 2).split('\n').join('\n  ')
  if (index < activeVehicles.length - 1 || inactiveVehicles.length > 0) {
    vehicleContent += ','
  }
})

// 주석처리된 행사의 차량들
if (inactiveVehicles.length > 0) {
  vehicleContent += '\n\n  /* ===== 1000석 미만 행사 차량 (주석처리) =====\n'
  inactiveVehicles.forEach((vehicle, index) => {
    vehicleContent += '  ' + JSON.stringify(vehicle, null, 2).split('\n').join('\n  ')
    if (index < inactiveVehicles.length - 1) {
      vehicleContent += ','
    }
  })
  vehicleContent += '\n  ===== 끝 ===== */\n'
}

vehicleContent += '\n]\n\nexport default {\n  vehicles\n}\n'

fs.writeFileSync(path.join(__dirname, '../src/data/vehicles.js'), vehicleContent, 'utf8')
console.log(`✅ vehicles.js 생성 완료 (활성: ${activeVehicles.length}대, 주석: ${inactiveVehicles.length}대)`)

// =====================================================
// Step 5: reservations.js 생성
// =====================================================
console.log('\n📋 Step 5: reservations.js 생성 중...')

const reservationComment = `// 예약 데이터
// id(예약ID)
// eventId(행사ID)
// customerId(고객ID)
// status(상태)
// startTime(시작시간)
// endTime(종료시간)
// itemDescription(물품설명)
// createdAt(생성시간)
// accessCode(접근코드)
// lockerId(사물함ID)

export const reservations = [`

let reservationContent = reservationComment

// 활성 행사의 예약들
const activeReservations = reservations.filter(r => !r.eventId || largeCapacityIds.has(r.eventId))
const inactiveReservations = reservations.filter(r => r.eventId && !largeCapacityIds.has(r.eventId))

activeReservations.forEach((reservation, index) => {
  reservationContent += '\n  ' + JSON.stringify(reservation, null, 2).split('\n').join('\n  ')
  if (index < activeReservations.length - 1 || inactiveReservations.length > 0) {
    reservationContent += ','
  }
})

// 주석처리된 행사의 예약들
if (inactiveReservations.length > 0) {
  reservationContent += '\n\n  /* ===== 1000석 미만 행사 예약 (주석처리) =====\n'
  inactiveReservations.forEach((reservation, index) => {
    reservationContent += '  ' + JSON.stringify(reservation, null, 2).split('\n').join('\n  ')
    if (index < inactiveReservations.length - 1) {
      reservationContent += ','
    }
  })
  reservationContent += '\n  ===== 끝 ===== */\n'
}

reservationContent += '\n]\n\nexport default {\n  reservations\n}\n'

fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationContent, 'utf8')
console.log(`✅ reservations.js 생성 완료 (활성: ${activeReservations.length}건, 주석: ${inactiveReservations.length}건)`)

// =====================================================
// Step 6: 최종 통계
// =====================================================
console.log('\n📊 최종 통계:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

if (activeEvents.length > 0) {
  console.log('\n✅ 활성화된 행사 (1000석 이상):')
  activeEvents.forEach(event => {
    const capacity = (event.vehicleCount || 1) * 50
    console.log(`  ${event.eventName} (${capacity}석)`)
  })
} else {
  console.log('\n⚠️  활성화된 행사가 없습니다 (모든 행사가 1000석 미만)')
}

console.log('\n❌ 주석처리된 행사 (1000석 미만):')
smallCapacityIds.slice(0, 5).forEach(item => {
  console.log(`  ${item.name} (${item.capacity}석)`)
})
if (smallCapacityIds.length > 5) {
  console.log(`  ... 외 ${smallCapacityIds.length - 5}개`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`📌 활성: 행사 ${activeEvents.length}개, 차량 ${activeVehicles.length}대, 예약 ${activeReservations.length}건`)
console.log(`📌 주석: 행사 ${smallCapacityIds.length}개, 차량 ${inactiveVehicles.length}대, 예약 ${inactiveReservations.length}건`)

console.log('\n✨ 1000석 미만 행사 주석처리 완료!')
console.log('\n💡 주석을 풀려면 /* */ 를 제거하면 됩니다.')
