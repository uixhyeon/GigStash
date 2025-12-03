import { customers } from '../src/data/customers.js'
import { reservations } from '../src/data/reservations.js'
import { events } from '../src/data/events.js'
import { lockers } from '../src/data/lockers.js'

console.log('🔗 조인 쿼리 테스트\n')

// 첫 번째 예약 데이터 확인
const res = reservations[0]
console.log('📋 예약 #1 (원본 데이터):')
console.log(`  ID: ${res.id}`)
console.log(`  상태: ${res.status}`)
console.log(`  고객 ID: ${res.customerId}`)
console.log(`  행사 ID: ${res.eventId}`)
console.log(`  사물함 ID: ${res.lockerId}`)
console.log(`  금액: ${res.totalPrice}원`)

// 고객 정보 조인
const customer = customers.find(c => c.id === res.customerId)
console.log(`\n👥 고객 정보 조인 (customerId=${res.customerId}):`)
if (customer) {
  console.log(`  이름: ${customer.name}`)
  console.log(`  전화: ${customer.phone}`)
  console.log(`  총 예약: ${customer.totalReservations}건`)
  console.log(`  총 결제액: ${customer.totalSpent}원`)
} else {
  console.log(`  ❌ 고객을 찾을 수 없음`)
}

// 행사 정보 조인
const event = events.find(e => e.id === res.eventId)
console.log(`\n🎭 행사 정보 조인 (eventId=${res.eventId}):`)
if (event) {
  console.log(`  행사명: ${event.eventName}`)
  console.log(`  날짜: ${event.eventDate}`)
  console.log(`  장소: ${event.eventVenue}`)
  console.log(`  종류: ${event.eventType}`)
} else {
  console.log(`  ❌ 행사를 찾을 수 없음`)
}

// 사물함 정보 조인
const locker = lockers.find(l => l.id === res.lockerId)
console.log(`\n🔐 사물함 정보 조인 (lockerId=${res.lockerId}):`)
if (locker) {
  console.log(`  번호: ${locker.number}`)
  console.log(`  크기: ${locker.size}`)
  console.log(`  위치: ${locker.location}`)
  console.log(`  상태: ${locker.status}`)
} else {
  console.log(`  ⚠️  사물함을 찾을 수 없음 (예약이 없는 사물함)`)
}

// 최종 요약
console.log(`\n✅ 3-way 조인 결과:`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
if (customer && event && locker) {
  console.log(`${customer.name}님이`)
  console.log(`${event.eventName} (${event.eventDate})에`)
  console.log(`${locker.location}의 ${locker.number}을`)
  console.log(`예약하셨습니다. (결제액: ${res.totalPrice}원)`)
}
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

// 매핑 상태 분석
console.log(`\n📊 분석: 데이터 매핑 현황`)
const unmappedCount = reservations.filter(r => r.eventId === 'UNKNOWN').length
console.log(`  총 예약: ${reservations.length}건`)
console.log(`  ✅ 매핑 성공: ${reservations.length - unmappedCount}건`)
console.log(`  ❌ 매핑 실패: ${unmappedCount}건`)

if (unmappedCount > 0) {
  console.log(`\n매핑 실패 원인:`)
  const failedRes = reservations.filter(r => r.eventId === 'UNKNOWN').slice(0, 3)
  failedRes.forEach((r, idx) => {
    console.log(`  ${idx + 1}. 예약 ${r.id}`)
  })
}
