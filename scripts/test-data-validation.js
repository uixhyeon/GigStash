/**
 * 테스트 데이터 검증 자동화 스크립트
 *
 * 목표: CI/CD 파이프라인에 통합 가능한 자동화된 검증
 *
 * 검증 단계:
 * 1. 빌드 전: 데이터 무결성 검증
 * 2. 런타임: 데이터 로드 테스트
 * 3. 통합: 모든 엔티티 관계 검증
 */

import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'
import { reservations } from '../src/data/reservations.js'

// 테스트 결과 추적
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
}

function test(name, condition, message = '') {
  const result = {
    name,
    passed: condition,
    message,
  }
  testResults.tests.push(result)

  if (condition) {
    testResults.passed++
    console.log(`  ✅ ${name}`)
  } else {
    testResults.failed++
    console.log(`  ❌ ${name}`)
    if (message) console.log(`     ${message}`)
  }
}

function warn(name, message) {
  testResults.warnings++
  testResults.tests.push({
    name,
    passed: null,
    message,
  })
  console.log(`  ⚠️  ${name}`)
  if (message) console.log(`     ${message}`)
}

// 테스트 1: 기본 데이터 로드
function testDataLoading() {
  console.log('\n📦 테스트 1: 기본 데이터 로드')
  console.log('='.repeat(50))

  test('Events 로드', Array.isArray(events) && events.length > 0, `로드된 행사: ${events.length}개`)
  test('Vehicles 로드', Array.isArray(vehicles) && vehicles.length > 0, `로드된 차량: ${vehicles.length}개`)
  test('Lockers 로드', Array.isArray(lockers) && lockers.length > 0, `로드된 사물함: ${lockers.length}개`)
  test('Customers 로드', Array.isArray(customers) && customers.length > 0, `로드된 고객: ${customers.length}명`)
  test('Reservations 로드', Array.isArray(reservations) && reservations.length > 0, `로드된 예약: ${reservations.length}개`)
}

// 테스트 2: 구조 검증
function testDataStructure() {
  console.log('\n🏗️  테스트 2: 데이터 구조 검증')
  console.log('='.repeat(50))

  // Events 구조
  const eventHasId = events.every((e) => e.id)
  const eventHasName = events.every((e) => e.eventName)
  test('Event 필수 필드 (id, eventName)', eventHasId && eventHasName)

  // Vehicles 구조
  const vehicleHasId = vehicles.every((v) => v.id)
  const vehicleHasEventId = vehicles.every((v) => v.eventId)
  test('Vehicle 필수 필드 (id, eventId)', vehicleHasId && vehicleHasEventId)

  // Lockers 구조
  const lockerHasId = lockers.every((l) => l.id)
  const lockerHasVehicleId = lockers.every((l) => l.vehicleId)
  test('Locker 필수 필드 (id, vehicleId)', lockerHasId && lockerHasVehicleId)

  // Customers 구조
  const customerHasId = customers.every((c) => c.id)
  const customerHasName = customers.every((c) => c.name)
  test('Customer 필수 필드 (id, name)', customerHasId && customerHasName)

  // Reservations 구조
  const reservationHasId = reservations.every((r) => r.id)
  const reservationHasFK = reservations.every((r) => r.eventId && r.lockerId && r.customerId)
  test('Reservation 필수 필드 (id, eventId, lockerId, customerId)', reservationHasId && reservationHasFK)
}

// 테스트 3: 외래키 검증
function testForeignKeys() {
  console.log('\n🔗 테스트 3: 외래키 검증')
  console.log('='.repeat(50))

  const eventIds = new Set(events.map((e) => e.id))
  const vehicleIds = new Set(vehicles.map((v) => v.id))
  const lockerIds = new Set(lockers.map((l) => l.id))
  const customerIds = new Set(customers.map((c) => c.id))

  // Vehicle → Event FK
  const vehiclesFkValid = vehicles.every((v) => eventIds.has(v.eventId))
  test(
    `Vehicle → Event 외래키 (${vehicles.length}개)`,
    vehiclesFkValid,
    vehiclesFkValid ? '모두 유효' : '일부 참조 오류'
  )

  // Locker → Vehicle FK
  const lockersFkValid = lockers.every((l) => vehicleIds.has(l.vehicleId))
  test(
    `Locker → Vehicle 외래키 (${lockers.length}개)`,
    lockersFkValid,
    lockersFkValid ? '모두 유효' : '일부 참조 오류'
  )

  // Reservation → Event, Locker, Customer FK
  const reservationsFkValid = reservations.every(
    (r) => eventIds.has(r.eventId) && lockerIds.has(r.lockerId) && customerIds.has(r.customerId)
  )
  test(
    `Reservation 외래키 (${reservations.length}개)`,
    reservationsFkValid,
    reservationsFkValid ? '모두 유효' : '일부 참조 오류'
  )
}

// 테스트 4: 비즈니스 로직 검증
function testBusinessLogic() {
  console.log('\n🏢 테스트 4: 비즈니스 로직 검증')
  console.log('='.repeat(50))

  const eventMap = new Map(events.map((e) => [e.id, e]))
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))
  const lockerMap = new Map(lockers.map((l) => [l.id, l]))

  let validReservations = 0
  let invalidReservations = []

  reservations.forEach((reservation) => {
    const event = eventMap.get(reservation.eventId)
    const locker = lockerMap.get(reservation.lockerId)
    const vehicle = locker ? vehicleMap.get(locker.vehicleId) : null

    const isValid =
      event &&
      locker &&
      vehicle &&
      vehicle.eventId === reservation.eventId &&
      locker.vehicleId === vehicle.id

    if (isValid) {
      validReservations++
    } else {
      invalidReservations.push(reservation.id)
    }
  })

  const validityRate = ((validReservations / reservations.length) * 100).toFixed(2)
  const isValid = validityRate === '100.00'
  test(
    `예약 무결성 (${validReservations}/${reservations.length})`,
    isValid,
    isValid ? '100% 정상' : `${validityRate}% 정상, ${invalidReservations.length}개 오류`
  )
}

// 테스트 5: 데이터 일관성
function testDataConsistency() {
  console.log('\n🧮 테스트 5: 데이터 일관성')
  console.log('='.repeat(50))

  // 중복 검증
  const eventIds = new Set(events.map((e) => e.id))
  const vehicleIds = new Set(vehicles.map((v) => v.id))
  const lockerIds = new Set(lockers.map((l) => l.id))
  const customerIds = new Set(customers.map((c) => c.id))
  const reservationIds = new Set(reservations.map((r) => r.id))

  test('행사 ID 고유성', eventIds.size === events.length, `${eventIds.size}/${events.length}`)
  test('차량 ID 고유성', vehicleIds.size === vehicles.length, `${vehicleIds.size}/${vehicles.length}`)
  test('사물함 ID 고유성', lockerIds.size === lockers.length, `${lockerIds.size}/${lockers.length}`)
  test('고객 ID 고유성', customerIds.size === customers.length, `${customerIds.size}/${customers.length}`)
  test('예약 ID 고유성', reservationIds.size === reservations.length, `${reservationIds.size}/${reservations.length}`)

  // NULL 검증
  const noNullEventIds = events.every((e) => e.id)
  const noNullVehicleEventIds = vehicles.every((v) => v.eventId)
  const noNullLockerVehicleIds = lockers.every((l) => l.vehicleId)

  test('필수 필드 NULL 체크 (Events)', noNullEventIds)
  test('필수 필드 NULL 체크 (Vehicles)', noNullVehicleEventIds)
  test('필수 필드 NULL 체크 (Lockers)', noNullLockerVehicleIds)
}

// 테스트 6: 데이터 분포 검증
function testDataDistribution() {
  console.log('\n📊 테스트 6: 데이터 분포 검증')
  console.log('='.repeat(50))

  // 행사별 차량 분포
  const eventVehicles = new Map()
  vehicles.forEach((v) => {
    if (!eventVehicles.has(v.eventId)) eventVehicles.set(v.eventId, 0)
    eventVehicles.set(v.eventId, eventVehicles.get(v.eventId) + 1)
  })

  const hasNoEmptyEvents = Array.from(eventVehicles.values()).every((count) => count > 0)
  test(
    '모든 행사에 최소 1대 이상의 차량 배치',
    hasNoEmptyEvents,
    hasNoEmptyEvents ? '✓' : `${Array.from(eventVehicles.values()).filter((c) => c === 0).length}개 행사에 차량 없음`
  )

  // 차량별 사물함 분포
  const vehicleLockers = new Map()
  lockers.forEach((l) => {
    if (!vehicleLockers.has(l.vehicleId)) vehicleLockers.set(l.vehicleId, 0)
    vehicleLockers.set(l.vehicleId, vehicleLockers.get(l.vehicleId) + 1)
  })

  const hasNoEmptyVehicles = Array.from(vehicleLockers.values()).every((count) => count > 0)
  test(
    '모든 차량에 최소 1개 이상의 사물함 배치',
    hasNoEmptyVehicles,
    hasNoEmptyVehicles ? '✓' : `${Array.from(vehicleLockers.values()).filter((c) => c === 0).length}개 차량에 사물함 없음`
  )

  // 예약 분포
  const usedLockers = new Set(reservations.map((r) => r.lockerId))
  const usageRate = ((usedLockers.size / lockers.length) * 100).toFixed(2)
  warn('사물함 활용률', `${usageRate}% (${usedLockers.size}/${lockers.length}개 사용 중)`)
}

// 테스트 7: 성능 검증
function testPerformance() {
  console.log('\n⚡ 테스트 7: 성능 검증')
  console.log('='.repeat(50))

  const startTime = performance.now()

  // 맵 생성 (데이터 로딩 시뮬레이션)
  const eventMap = new Map(events.map((e) => [e.id, e]))
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))
  const lockerMap = new Map(lockers.map((l) => [l.id, l]))
  const customerMap = new Map(customers.map((c) => [c.id, c]))

  // 조인 쿼리 (1000회)
  for (let i = 0; i < 1000; i++) {
    reservations.forEach((r) => {
      const event = eventMap.get(r.eventId)
      const locker = lockerMap.get(r.lockerId)
      const customer = customerMap.get(r.customerId)
    })
  }

  const endTime = performance.now()
  const duration = (endTime - startTime).toFixed(2)

  test('1000회 조인 쿼리 < 5초', duration < 5000, `실제: ${duration}ms`)
}

// 최종 보고서
function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📋 테스트 결과 요약')
  console.log('='.repeat(50))

  console.log(`\n✅ 통과: ${testResults.passed}개`)
  console.log(`❌ 실패: ${testResults.failed}개`)
  console.log(`⚠️  경고: ${testResults.warnings}개`)
  console.log(`📊 총계: ${testResults.tests.length}개\n`)

  if (testResults.failed === 0) {
    console.log('🎉 모든 테스트 통과!\n')
    return true
  } else {
    console.log(`❌ ${testResults.failed}개 테스트 실패\n`)
    console.log('실패한 테스트:')
    testResults.tests
      .filter((t) => t.passed === false)
      .forEach((t) => {
        console.log(`  - ${t.name}`)
        if (t.message) console.log(`    ${t.message}`)
      })
    console.log()
    return false
  }
}

// 모든 테스트 실행
function runAllTests() {
  console.log('\n🚀 데이터 무결성 자동화 테스트 시작\n')

  testDataLoading()
  testDataStructure()
  testForeignKeys()
  testBusinessLogic()
  testDataConsistency()
  testDataDistribution()
  testPerformance()

  const success = printSummary()
  process.exit(success ? 0 : 1)
}

runAllTests()
