import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('🔄 원본 데이터 복구 및 1000석 이상으로 필터링...\n')

// =====================================================
// Step 1: git에서 원본 events.json 복구
// =====================================================
console.log('📥 Step 1: 원본 데이터 복구 중...')

let eventJsonStr
try {
  eventJsonStr = execSync('git show 064753e:src/data/events.json', {
    cwd: 'd:\\SDY\\project\\GigStash',
    encoding: 'utf-8'
  })
  console.log('✅ git에서 events.json 복구 성공')
} catch (error) {
  console.error('❌ git 복구 실패:', error.message)
  process.exit(1)
}

let vehicleJsonStr
try {
  vehicleJsonStr = execSync('git show 064753e:src/data/vehicles.json', {
    cwd: 'd:\\SDY\\project\\GigStash',
    encoding: 'utf-8'
  })
  console.log('✅ git에서 vehicles.json 복구 성공')
} catch (error) {
  console.error('❌ git 복구 실패:', error.message)
  process.exit(1)
}

let reservationJsonStr
try {
  reservationJsonStr = execSync('git show 064753e:src/data/reservations.json', {
    cwd: 'd:\\SDY\\project\\GigStash',
    encoding: 'utf-8'
  })
  console.log('✅ git에서 reservations.json 복구 성공')
} catch (error) {
  console.error('❌ git 복구 실패:', error.message)
  process.exit(1)
}

// =====================================================
// Step 2: JSON 파싱
// =====================================================
console.log('\n📊 Step 2: 데이터 파싱 중...')

const eventData = JSON.parse(eventJsonStr)
const vehicleData = JSON.parse(vehicleJsonStr)
const reservationData = JSON.parse(reservationJsonStr)

const events = eventData.events || []
const vehicles = vehicleData.vehicles || []
const reservations = reservationData.reservations || []

console.log(`✅ 원본 데이터: 행사 ${events.length}개, 차량 ${vehicles.length}대, 예약 ${reservations.length}건`)

// =====================================================
// Step 3: 행사별 규모 계산 (vehicleCount 기준)
// =====================================================
console.log('\n📏 Step 3: 행사 규모 계산 중...')

const eventCapacity = {}
events.forEach(event => {
  const capacity = (event.vehicleCount || 1) * 50 // 1차량 = 50석
  eventCapacity[event.id] = {
    name: event.eventName,
    vehicleCount: event.vehicleCount || 1,
    capacity: capacity
  }
})

console.log('현재 행사 규모:')
Object.entries(eventCapacity)
  .sort((a, b) => b[1].capacity - a[1].capacity)
  .slice(0, 10)
  .forEach(([id, data]) => {
    console.log(`  ${id}: ${data.name} (${data.vehicleCount}대, ${data.capacity}석)`)
  })

// =====================================================
// Step 4: 1000석 이상 필터링
// =====================================================
console.log('\n🔍 Step 4: 1000석 이상 필터링 중...')

const largeCapacityIds = new Set()
const smallCapacityIds = new Set()

Object.entries(eventCapacity).forEach(([id, data]) => {
  if (data.capacity >= 1000) {
    largeCapacityIds.add(id)
  } else {
    smallCapacityIds.add(id)
  }
})

console.log(`✅ 1000석 이상: ${largeCapacityIds.size}개`)
console.log(`❌ 1000석 미만: ${smallCapacityIds.size}개 (삭제)`)

if (smallCapacityIds.size > 0) {
  console.log('\n  삭제 대상 행사:')
  Array.from(smallCapacityIds)
    .slice(0, 10)
    .forEach(id => {
      const data = eventCapacity[id]
      console.log(`    - ${id}: ${data.name} (${data.capacity}석)`)
    })
  if (smallCapacityIds.size > 10) {
    console.log(`    ... 외 ${smallCapacityIds.size - 10}개`)
  }
}

// =====================================================
// Step 5: 필터링된 데이터 생성
// =====================================================
console.log('\n✂️ Step 5: 데이터 필터링 중...')

const filteredEvents = events.filter(e => largeCapacityIds.has(e.id))
const filteredVehicles = vehicles.filter(v => largeCapacityIds.has(v.eventId))
const filteredReservations = reservations.filter(r =>
  !r.eventId || largeCapacityIds.has(r.eventId)
)

console.log(`  행사: ${events.length} → ${filteredEvents.length}개 (-${smallCapacityIds.size}개)`)
console.log(`  차량: ${vehicles.length} → ${filteredVehicles.length}대 (-${vehicles.length - filteredVehicles.length}대)`)
console.log(`  예약: ${reservations.length} → ${filteredReservations.length}건 (-${reservations.length - filteredReservations.length}건)`)

// =====================================================
// Step 6: JS 파일 생성 및 저장
// =====================================================
console.log('\n💾 Step 6: JS 파일 생성 및 저장 중...')

const eventComment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// createdAt(생성시간)
`

const eventJsContent = eventComment + '\nexport const events = ' + JSON.stringify(filteredEvents, null, 2) + '\n\nexport default {\n  events\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/events.js'), eventJsContent, 'utf8')
console.log(`  ✅ events.js (${filteredEvents.length}개)`)

const vehicleComment = `// 차량 데이터
// id(차량ID)
// eventId(연결된 행사ID)
// vehicleType(차량종류)
// capacity(정원)
// plateNumber(번호판)
// driver(운전자)
// status(상태)
`

const vehicleJsContent = vehicleComment + '\nexport const vehicles = ' + JSON.stringify(filteredVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/vehicles.js'), vehicleJsContent, 'utf8')
console.log(`  ✅ vehicles.js (${filteredVehicles.length}대)`)

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
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(filteredReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')
console.log(`  ✅ reservations.js (${filteredReservations.length}건)`)

// =====================================================
// Step 7: 최종 통계
// =====================================================
console.log('\n📊 최종 결과:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

filteredEvents.slice(0, 10).forEach(event => {
  const capacity = (event.vehicleCount || 1) * 50
  console.log(`${event.eventName}: ${capacity}석 (${event.vehicleCount || 1}대)`)
})

if (filteredEvents.length > 10) {
  console.log(`... 외 ${filteredEvents.length - 10}개`)
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 행사: ${filteredEvents.length}개`)
console.log(`✅ 차량: ${filteredVehicles.length}대`)
console.log(`✅ 예약: ${filteredReservations.length}건`)

console.log('\n✨ 1000석 이상만 필터링 완료!')
