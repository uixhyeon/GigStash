import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events as oldEvents } from '../src/data/events.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import { lockers as oldLockers } from '../src/data/lockers.js'

console.log('🔄 이벤트 및 배차 데이터 리팩토링 시작...\n')

// =====================================================
// Step 1: 해외 행사 제거 및 itemType/itemSize/quantity 삭제
// =====================================================
console.log('📌 Step 1: 데이터 정제')

const overseasVenues = ['말레이시아', '홍콩', '싱가포르', '중국', '청두', '상하이', '태국', '방콕', '일본', '도쿄', '오사카']

const filteredEvents = oldEvents
  .filter(event => {
    const venue = event.eventVenue || ''
    const city = event.deliveryCity || ''
    return !overseasVenues.some(v => venue.includes(v) || city.includes(v))
  })
  .map(event => {
    const { itemType, itemSize, quantity, ...rest } = event
    return rest
  })

console.log(`✅ 해외 행사 제거: ${oldEvents.length} → ${filteredEvents.length}개`)

// =====================================================
// Step 2: 행사 유형별 배차 전략 정의
// =====================================================
console.log('\n📊 Step 2: 배차 전략 정의')

const getVehicleCountForEvent = (event) => {
  const eventType = event.eventType || ''
  const eventName = event.eventName || ''
  const expectedAttendance = event.expectedAttendance || 0

  // 1. 국제 행사 (Asia Tour, International 등) - 최대 배차
  if (eventName.includes('ASIA') || eventName.includes('투어') || eventName.includes('TOUR')) {
    return Math.max(8, Math.ceil(expectedAttendance / 50))
  }

  // 2. 콘서트 - 최소 4대 배차
  if (eventType.includes('콘서트') || eventType.includes('공연') || eventType.includes('내한공연')) {
    return Math.max(4, Math.ceil(expectedAttendance / 50))
  }

  // 3. 스포츠 - 최소 배차 (예약건수에 따라)
  if (eventType.includes('스포츠')) {
    return Math.max(1, Math.ceil(expectedAttendance / 50))
  }

  // 4. 기타 - 예상 출석자 기반
  return Math.max(1, Math.ceil(expectedAttendance / 50))
}

// 배차 대수와 예약 건수의 관계
const getReservationCountForVehicles = (vehicleCount, eventType) => {
  const maxCapacity = vehicleCount * 50

  // 행사 유형별 활용도
  if (eventType.includes('콘서트') || eventType.includes('공연') || eventType.includes('내한공연')) {
    // 콘서트는 80-100% 활용
    return Math.floor(maxCapacity * (0.8 + Math.random() * 0.2))
  }

  if (eventType.includes('ASIA') || eventType.includes('투어') || eventType.includes('TOUR')) {
    // 국제 행사는 90-100% 활용
    return Math.floor(maxCapacity * (0.9 + Math.random() * 0.1))
  }

  if (eventType.includes('스포츠')) {
    // 스포츠는 50-80% 활용
    return Math.floor(maxCapacity * (0.5 + Math.random() * 0.3))
  }

  // 기타는 60-80% 활용
  return Math.floor(maxCapacity * (0.6 + Math.random() * 0.2))
}

// =====================================================
// Step 3: 새로운 vehicles 데이터 생성
// =====================================================
console.log('\n🚗 Step 3: 배차 데이터 재생성')

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

const eventVehicleMap = {} // 행사별 배차 추적

filteredEvents.forEach(event => {
  const vehicleCount = getVehicleCountForEvent(event)
  eventVehicleMap[event.id] = {
    vehicleCount,
    reservationTarget: getReservationCountForVehicles(vehicleCount, event.eventType)
  }

  for (let i = 0; i < vehicleCount; i++) {
    const isBus = Math.random() < 0.7
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

console.log(`✅ 총 ${newVehicles.length}대 배차 생성`)

// 배차 통계
const vehicleStats = {}
filteredEvents.forEach(event => {
  const count = newVehicles.filter(v => v.eventId === event.id).length
  const type = event.eventType || '기타'
  if (!vehicleStats[type]) vehicleStats[type] = []
  vehicleStats[type].push({
    name: event.eventName,
    vehicles: count
  })
})

console.log('\n📊 행사별 배차 현황:')
Object.entries(vehicleStats).forEach(([type, events]) => {
  console.log(`  ${type}:`)
  events.slice(0, 3).forEach(e => {
    console.log(`    - ${e.name}: ${e.vehicles}대`)
  })
  if (events.length > 3) {
    console.log(`    ... 외 ${events.length - 3}개`)
  }
})

// =====================================================
// Step 4: 예약 데이터 조정
// =====================================================
console.log('\n📋 Step 4: 예약 데이터 조정')

// 행사별 예약 건수 재분배
const newReservations = []
let resId = 1
let lockerIdx = 0

filteredEvents.forEach(event => {
  const targetCount = eventVehicleMap[event.id]?.reservationTarget || 50
  const existingReservations = oldReservations.filter(r => r.eventId === event.id)

  // 기존 예약이 있으면 복제하고, 없으면 새로 생성
  if (existingReservations.length > 0) {
    for (let i = 0; i < targetCount; i++) {
      const sourceRes = existingReservations[i % existingReservations.length]
      const locker = oldLockers[lockerIdx % oldLockers.length]
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

console.log(`✅ 총 ${newReservations.length}건 예약 생성`)

// 예약 통계
const reservationStats = {}
filteredEvents.forEach(event => {
  const count = newReservations.filter(r => r.eventId === event.id).length
  const vehicles = newVehicles.filter(v => v.eventId === event.id).length
  reservationStats[event.id] = { vehicles, reservations: count }
})

console.log('\n📊 배차/예약 비율 검증:')
const issues = []
Object.entries(reservationStats).forEach(([eventId, data]) => {
  const maxCapacity = data.vehicles * 50
  if (data.reservations > maxCapacity) {
    issues.push(`⚠️  ${eventId}: 예약 ${data.reservations}건 > 최대용량 ${maxCapacity}건`)
  }
})

if (issues.length > 0) {
  issues.slice(0, 5).forEach(issue => console.log(`  ${issue}`))
  if (issues.length > 5) console.log(`  ... 외 ${issues.length - 5}개`)
} else {
  console.log('  ✅ 모든 예약이 배차 용량 내에 있습니다')
}

// =====================================================
// Step 5: 파일 저장
// =====================================================
console.log('\n💾 Step 5: 파일 저장')

const eventComment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// vehicleCount(배차)
// expectedAttendance(예상인원)
// createdAt(생성시간)
`

const eventJsContent = eventComment + '\nexport const events = ' + JSON.stringify(filteredEvents, null, 2) + '\n\nexport default {\n  events\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/events.js'), eventJsContent, 'utf8')

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

console.log(`  ✅ events.js (${filteredEvents.length}개 행사)`)
console.log(`  ✅ vehicles.js (${newVehicles.length}대 차량)`)
console.log(`  ✅ reservations.js (${newReservations.length}건 예약)`)

// =====================================================
// Step 6: 최종 통계
// =====================================================
console.log('\n📊 최종 결과')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

console.log('\n행사 규모별 배차 현황:')
const sizeCategories = {
  '콘서트': 0,
  '국제행사': 0,
  '스포츠': 0,
  '기타': 0
}

filteredEvents.forEach(event => {
  if (event.eventName.includes('ASIA') || event.eventName.includes('투어')) {
    sizeCategories['국제행사']++
  } else if (event.eventType.includes('콘서트') || event.eventType.includes('공연')) {
    sizeCategories['콘서트']++
  } else if (event.eventType.includes('스포츠')) {
    sizeCategories['스포츠']++
  } else {
    sizeCategories['기타']++
  }
})

Object.entries(sizeCategories).forEach(([category, count]) => {
  if (count > 0) {
    const events = filteredEvents.filter(e => {
      if (category === '국제행사') return e.eventName.includes('ASIA') || e.eventName.includes('투어')
      if (category === '콘서트') return e.eventType.includes('콘서트') || e.eventType.includes('공연')
      if (category === '스포츠') return e.eventType.includes('스포츠')
      return true
    })
    const avgVehicles = (newVehicles.filter(v => events.some(e => e.id === v.eventId)).length / count).toFixed(1)
    console.log(`  ${category}: ${count}개 (평균 ${avgVehicles}대)`)
  }
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 행사: ${filteredEvents.length}개`)
console.log(`✅ 총 배차: ${newVehicles.length}대`)
console.log(`✅ 총 예약: ${newReservations.length}건`)
console.log(`✅ 사물함 활용: ${newReservations.length} / ${oldLockers.length}`)

console.log('\n✨ 데이터 리팩토링 완료!')
