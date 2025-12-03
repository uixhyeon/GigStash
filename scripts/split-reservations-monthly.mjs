import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 기존 데이터 로드
import { events } from '../src/data/events.js'
import { customers } from '../src/data/customers.js'
import { lockers } from '../src/data/lockers.js'

console.log('🔄 reservations_monthly.json 데이터 분산 시작...\n')

// reservations_monthly.json 읽기
const monthlyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/reservations_monthly.json'), 'utf8')
)

const monthlyReservations = monthlyData.reservations || []
console.log(`📊 총 예약 건수: ${monthlyReservations.length}건`)

// =====================================================
// Step 1: 고객 정보 추출 (customerId 생성)
// =====================================================
const customerMap = new Map() // key: "name|phone", value: customerId
const newCustomers = []

console.log('\n👥 Step 1: 고객 정보 추출 중...')

monthlyReservations.forEach(res => {
  const key = `${res.customerName}|${res.customerPhone}`

  if (!customerMap.has(key)) {
    const customerId = `C${String(newCustomers.length + 1).padStart(3, '0')}`
    customerMap.set(key, customerId)

    newCustomers.push({
      id: customerId,
      name: res.customerName,
      phone: res.customerPhone,
      email: null,
      isReturningCustomer: res.isReturningCustomer || false,
      totalReservations: 0,
      totalSpent: 0,
      createdAt: res.reservedAt
    })
  }
})

console.log(`✅ 고객 ${newCustomers.length}명 추출 완료`)

// 예약에서 고객의 총합계 계산
newCustomers.forEach(customer => {
  const customerRes = monthlyReservations.filter(
    r => `${r.customerName}|${r.customerPhone}` === `${customer.name}|${customer.phone}`
  )
  customer.totalReservations = customerRes.length
  customer.totalSpent = customerRes.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
})

// =====================================================
// Step 2: 행사 정보 매핑 (eventId 할당)
// =====================================================
console.log('\n🎭 Step 2: 행사 정보 매핑 중...')

const eventNameToId = {}
events.forEach(event => {
  // 다양한 이벤트명 변형에 대응
  const nameVariations = [
    event.eventName,
    event.eventName.replace(' Day 1', '').replace(' Day 2', '').replace(' Day 3', ''),
    event.eventName.replace('Day', '').trim()
  ]
  nameVariations.forEach(name => {
    if (name) eventNameToId[name] = event.id
  })
})

let unmappedEvents = new Set()
monthlyReservations.forEach(res => {
  if (!eventNameToId[res.eventName]) {
    unmappedEvents.add(res.eventName)
  }
})

if (unmappedEvents.size > 0) {
  console.log(`⚠️  매핑되지 않은 행사명 (${unmappedEvents.size}개):`)
  Array.from(unmappedEvents).slice(0, 5).forEach(name => {
    console.log(`   - "${name}"`)
  })
}

console.log(`✅ 행사 매핑 완료`)

// =====================================================
// Step 3: 사물함 ID 순환 할당 (lockerID 할당)
// =====================================================
console.log('\n🔐 Step 3: 사물함 ID 순환 할당 중...')

const lockerIds = lockers.map(l => l.id)
console.log(`✅ ${lockerIds.length}개 사물함 순환 할당 준비 완료`)

// =====================================================
// Step 4: reservations.js 생성 (분산된 데이터)
// =====================================================
console.log('\n📝 Step 4: reservations.js 생성 중...')

const newReservations = monthlyReservations.map((res, index) => {
  const customerKey = `${res.customerName}|${res.customerPhone}`
  const customerId = customerMap.get(customerKey)
  const eventId = eventNameToId[res.eventName] || 'UNKNOWN'
  const lockerId = lockerIds[index % lockerIds.length]

  return {
    id: `RES${String(index + 1).padStart(10, '0')}`,
    eventId: eventId,
    lockerId: lockerId,
    customerId: customerId,

    // 예약 상태 및 시간
    status: res.status === '완료' ? 'completed' :
            res.status === '진행중' ? 'in_progress' :
            res.status === '취소' ? 'cancelled' : 'pending',
    reservedAt: res.reservedAt,
    dropoffTime: res.dropoffTime,
    pickupTime: res.pickupTime || null,

    // 물품 정보
    itemType: res.itemType,
    itemSize: res.itemSize,
    itemCount: res.itemCount,
    specialRequest: res.specialRequest || null,

    // 배송 정보
    deliveryType: res.deliveryType,
    deliveryStatus: res.deliveryStatus,
    deliveryChangedAt: res.deliveryChangedAt,
    deliveryPickupTime: res.deliveryPickupTime,
    deliveryStartTime: res.deliveryStartTime,
    deliveryCompletedTime: res.deliveryCompletedTime,
    deliveryAddress: res.deliveryAddress,
    deliveryRegion: res.deliveryRegion,
    deliveryCity: res.deliveryCity,
    deliveryRegionGroup: res.deliveryRegionGroup,

    // 결제 정보
    paymentMethod: res.paymentMethod,
    originalPrice: res.originalPrice,
    discountAmount: res.discountAmount,
    discountCode: res.discountCode || null,
    totalPrice: res.totalPrice,

    // 고객 유형
    isReturningCustomer: res.isReturningCustomer
  }
})

console.log(`✅ ${newReservations.length}건 예약 데이터 생성 완료`)

// =====================================================
// Step 5: 파일 저장
// =====================================================
console.log('\n💾 Step 5: 파일 저장 중...')

// customers.js 저장
const customerComment = `// 고객 데이터
// id(고객ID)
// name(고객명)
// phone(전화번호)
// email(이메일)
// isReturningCustomer(재방문 고객 여부)
// totalReservations(총 예약 건수)
// totalSpent(총 결제액)
// createdAt(가입시간)
`

const customerJsContent = customerComment + '\nexport const customers = ' +
  JSON.stringify(newCustomers, null, 2) + '\n\nexport default {\n  customers\n}\n'

fs.writeFileSync(path.join(__dirname, '../src/data/customers.js'), customerJsContent, 'utf8')
console.log(`✅ customers.js 저장 완료 (${newCustomers.length}명)`)

// reservations.js 저장
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

const reservationJsContent = reservationComment + '\nexport const reservations = ' +
  JSON.stringify(newReservations, null, 2) + '\n\nexport default {\n  reservations\n}\n'

fs.writeFileSync(path.join(__dirname, '../src/data/reservations.js'), reservationJsContent, 'utf8')
console.log(`✅ reservations.js 저장 완료 (${newReservations.length}건)`)

// =====================================================
// Step 6: 통계
// =====================================================
console.log('\n📊 최종 통계:')
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`  📌 고객: ${newCustomers.length}명`)
console.log(`  📌 예약: ${newReservations.length}건`)
console.log(`  📌 행사: ${new Set(newReservations.map(r => r.eventId)).size}개`)
console.log(`  📌 사물함: ${new Set(newReservations.map(r => r.lockerId)).size}개 (순환 할당)`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

// 예약 상태 분포
const statusDist = {}
newReservations.forEach(r => {
  statusDist[r.status] = (statusDist[r.status] || 0) + 1
})

console.log(`\n상태별 분포:`)
Object.entries(statusDist).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}건`)
})

// 배송 방식 분포
const deliveryDist = {}
newReservations.forEach(r => {
  deliveryDist[r.deliveryType] = (deliveryDist[r.deliveryType] || 0) + 1
})

console.log(`\n배송 방식:`)
Object.entries(deliveryDist).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}건`)
})

console.log(`\n✨ 데이터 분산 완료!`)
