import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { reservations as oldReservations } from '../src/data/reservations.js'
import { events } from '../src/data/events.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'

console.log('📈 행사 규모 확대: 1000석 이상 조정 시작...\n')

// =====================================================
// Step 1: 행사별 현재 규모 분석
// =====================================================
console.log('📊 Step 1: 현재 규모 분석')

const vehicleCountByEvent = {}
oldVehicles.forEach(v => {
  if (!(v.eventId in vehicleCountByEvent)) {
    vehicleCountByEvent[v.eventId] = 0
  }
  vehicleCountByEvent[v.eventId]++
})

const reservationCountByEvent = {}
oldReservations.forEach(r => {
  if (r.eventId && r.eventId !== 'UNKNOWN') {
    if (!(r.eventId in reservationCountByEvent)) {
      reservationCountByEvent[r.eventId] = 0
    }
    reservationCountByEvent[r.eventId]++
  }
})

console.log('현재 규모:')
events.forEach(event => {
  const busCount = vehicleCountByEvent[event.id] || 0
  const resCount = reservationCountByEvent[event.id] || 0
  const capacity = busCount * 50
  console.log(`  ${event.eventName}: ${busCount}대 (${capacity}석), ${resCount}건 예약`)
})

// =====================================================
// Step 2: 1000석 이상으로 확대할 배차 계산
// =====================================================
console.log('\n📊 Step 2: 규모 확대 계산')

// 각 행사의 필요한 배차 수 (1000석 이상)
const requiredVehicles = {}
events.forEach(event => {
  // 최소 1000석 필요 → 최소 20대 배차 (20 * 50 = 1000)
  requiredVehicles[event.id] = 20
})

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

// =====================================================
// Step 3: 새로운 vehicles 생성
// =====================================================
console.log('\n🚗 Step 3: 차량 데이터 재생성')

let vehicleId = 1
const newVehicles = []

events.forEach(event => {
  const busCount = requiredVehicles[event.id]

  for (let i = 0; i < busCount; i++) {
    const isBus = Math.random() < 0.7
    const vehicleType = isBus ? '버스' : '중형차'
    const capacity = isBus ? (Math.random() < 0.5 ? 50 : 55) : 35

    const vehicle = {
      id: 'VEH-' + vehicleId.toString().padStart(3, '0'),
      eventId: event.id,
      vehicleType: vehicleType,
      capacity: capacity,
      plateNumber: plateNumbers[vehicleId % plateNumbers.length],
      driver: driverNames[vehicleId % driverNames.length],
      status: '완료'
    }

    newVehicles.push(vehicle)
    vehicleId++
  }
})

console.log(`✅ ${newVehicles.length}대 차량 생성 완료`)

// =====================================================
// Step 4: 예약 데이터 확대
// =====================================================
console.log('\n📋 Step 4: 예약 데이터 확대')

// 행사별 현재 예약 건수
const currentReservationsByEvent = {}
oldReservations.forEach(r => {
  if (r.eventId && r.eventId !== 'UNKNOWN') {
    if (!(r.eventId in currentReservationsByEvent)) {
      currentReservationsByEvent[r.eventId] = []
    }
    currentReservationsByEvent[r.eventId].push(r)
  }
})

const newReservations = []
let resId = 1
let lockerIdx = 0

events.forEach(event => {
  // 기존 예약들을 복제 확대
  const existingReservations = currentReservationsByEvent[event.id] || []
  const targetCount = 1000 // 행사당 최소 1000건

  // 기존 예약이 있으면 복제하여 확대
  if (existingReservations.length > 0) {
    while (newReservations.filter(r => r.eventId === event.id).length < targetCount) {
      const sourceRes = existingReservations[Math.floor(Math.random() * existingReservations.length)]

      const locker = lockers[lockerIdx % lockers.length]
      lockerIdx++

      const newRes = {
        id: 'RES' + String(resId).padStart(10, '0'),
        eventId: event.id,
        lockerId: locker.id,
        customerId: sourceRes.customerId,
        status: sourceRes.status,
        reservedAt: sourceRes.reservedAt,
        dropoffTime: sourceRes.dropoffTime,
        pickupTime: sourceRes.pickupTime || null,
        itemType: sourceRes.itemType,
        itemSize: sourceRes.itemSize,
        itemCount: sourceRes.itemCount,
        specialRequest: sourceRes.specialRequest || null,
        deliveryType: sourceRes.deliveryType,
        deliveryStatus: sourceRes.deliveryStatus,
        deliveryChangedAt: sourceRes.deliveryChangedAt,
        deliveryPickupTime: sourceRes.deliveryPickupTime,
        deliveryStartTime: sourceRes.deliveryStartTime,
        deliveryCompletedTime: sourceRes.deliveryCompletedTime,
        deliveryAddress: sourceRes.deliveryAddress,
        deliveryRegion: sourceRes.deliveryRegion,
        deliveryCity: sourceRes.deliveryCity,
        deliveryRegionGroup: sourceRes.deliveryRegionGroup,
        paymentMethod: sourceRes.paymentMethod,
        originalPrice: sourceRes.originalPrice,
        discountAmount: sourceRes.discountAmount,
        discountCode: sourceRes.discountCode || null,
        totalPrice: sourceRes.totalPrice,
        isReturningCustomer: sourceRes.isReturningCustomer
      }

      newReservations.push(newRes)
      resId++
    }
  }
})

console.log(`✅ ${newReservations.length}건 예약 생성 완료`)

// =====================================================
// Step 5: 파일 저장
// =====================================================
console.log('\n💾 Step 5: 파일 저장')

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
// reservedAt(예약시간)
// dropoffTime(반납시간)
// pickupTime(픽업시간)
// itemType(물품종류)
// itemSize(물품크기)
// itemCount(물품수량)
// specialRequest(특별요청)
// deliveryType(배송방식)
// deliveryStatus(배송상태)
// deliveryAddress(배송주소)
// deliveryRegion(배송지역)
// deliveryCity(배송도시)
// paymentMethod(결제방식)
// originalPrice(정가)
// discountAmount(할인액)
// totalPrice(최종결제액)
// isReturningCustomer(재방문여부)
`

const reservationJsContent = reservationComment + '\nexport const reservations = ' + JSON.stringify(newReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')

console.log(`  ✅ vehicles.js (${newVehicles.length}대)`)
console.log(`  ✅ reservations.js (${newReservations.length}건)`)

// =====================================================
// Step 6: 통계
// =====================================================
console.log('\n📊 최종 규모:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const newReservationsByEvent = {}
newReservations.forEach(r => {
  if (!(r.eventId in newReservationsByEvent)) {
    newReservationsByEvent[r.eventId] = 0
  }
  newReservationsByEvent[r.eventId]++
})

events.forEach(event => {
  const busCount = requiredVehicles[event.id]
  const resCount = newReservationsByEvent[event.id] || 0
  const capacity = busCount * 50
  console.log(`${event.eventName}`)
  console.log(`  배차: ${busCount}대, 용량: ${capacity}석, 예약: ${resCount}건`)
})

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`총 행사: ${events.length}개`)
console.log(`총 차량: ${newVehicles.length}대`)
console.log(`총 예약: ${newReservations.length}건`)

console.log('\n✨ 규모 확대 완료! (모든 행사 1000석 이상)')
