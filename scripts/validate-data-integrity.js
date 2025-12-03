/**
 * 데이터 생성 스크립트 검증 도구
 *
 * 목표: 모든 데이터 파일의 무결성을 자동으로 검증
 *
 * 검증 항목:
 * 1. 테이블 수준의 외래키 검증 (FK 참조 유효성)
 * 2. 비즈니스 로직 검증 (예약-사물함-차량-행사 관계)
 * 3. 데이터 일관성 검증 (중복, NULL 값 등)
 * 4. 통계 분석 (활용률, 분포도 등)
 */

import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'
import { reservations } from '../src/data/reservations.js'

// ANSI 색상
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 1. 테이블 수준 외래키 검증
function validateForeignKeys() {
  log('\n🔗 외래키 검증', 'blue')
  log('='.repeat(60))

  const eventIds = new Set(events.map((e) => e.id))
  const vehicleIds = new Set(vehicles.map((v) => v.id))
  const lockerIds = new Set(lockers.map((l) => l.id))
  const customerIds = new Set(customers.map((c) => c.id))

  let issues = {
    vehicles: [],
    lockers: [],
    reservations: [],
  }

  // 차량 → 행사 FK 검증
  vehicles.forEach((v) => {
    if (!eventIds.has(v.eventId)) {
      issues.vehicles.push(`Vehicle ${v.id} references invalid eventId: ${v.eventId}`)
    }
  })

  // 사물함 → 차량 FK 검증
  lockers.forEach((l) => {
    if (!vehicleIds.has(l.vehicleId)) {
      issues.lockers.push(`Locker ${l.id} references invalid vehicleId: ${l.vehicleId}`)
    }
  })

  // 예약의 모든 FK 검증
  reservations.forEach((r) => {
    if (!eventIds.has(r.eventId)) {
      issues.reservations.push(`Reservation ${r.id} references invalid eventId: ${r.eventId}`)
    }
    if (!lockerIds.has(r.lockerId)) {
      issues.reservations.push(`Reservation ${r.id} references invalid lockerId: ${r.lockerId}`)
    }
    if (!customerIds.has(r.customerId)) {
      issues.reservations.push(`Reservation ${r.id} references invalid customerId: ${r.customerId}`)
    }
  })

  // 결과 출력
  if (issues.vehicles.length === 0) {
    log('✅ 차량 → 행사 FK: 100% 유효', 'green')
  } else {
    log(`❌ 차량 → 행사 FK: ${issues.vehicles.length}개 오류`, 'red')
  }

  if (issues.lockers.length === 0) {
    log('✅ 사물함 → 차량 FK: 100% 유효', 'green')
  } else {
    log(`❌ 사물함 → 차량 FK: ${issues.lockers.length}개 오류`, 'red')
  }

  if (issues.reservations.length === 0) {
    log('✅ 예약 FK: 100% 유효', 'green')
  } else {
    log(`❌ 예약 FK: ${issues.reservations.length}개 오류 (처음 5개)`, 'red')
    issues.reservations.slice(0, 5).forEach((issue) => log(`   - ${issue}`, 'red'))
  }

  return Object.values(issues).flat().length === 0
}

// 2. 비즈니스 로직 검증
function validateBusinessLogic() {
  log('\n🏢 비즈니스 로직 검증', 'blue')
  log('='.repeat(60))

  const eventMap = new Map(events.map((e) => [e.id, e]))
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))
  const lockerMap = new Map(lockers.map((l) => [l.id, l]))

  let validCount = 0
  let invalidCount = 0
  const invalidDetails = []

  reservations.forEach((reservation) => {
    const event = eventMap.get(reservation.eventId)
    const locker = lockerMap.get(reservation.lockerId)
    const vehicle = locker ? vehicleMap.get(locker.vehicleId) : null

    // 검증: 예약 → 행사 → 차량 → 사물함
    const isValid =
      event &&
      locker &&
      vehicle &&
      vehicle.eventId === reservation.eventId &&
      locker.vehicleId === vehicle.id

    if (isValid) {
      validCount++
    } else {
      invalidCount++
      if (invalidDetails.length < 5) {
        const reason = !event
          ? 'Event not found'
          : !locker
            ? 'Locker not found'
            : !vehicle
              ? 'Vehicle not found'
              : `Vehicle ${locker.vehicleId} not in event ${reservation.eventId}`
        invalidDetails.push(`${reservation.id}: ${reason}`)
      }
    }
  })

  const validityRate = ((validCount / reservations.length) * 100).toFixed(2)
  log(
    `📊 예약 무결성: ${validCount}/${reservations.length} (${validityRate}%)`,
    validityRate === '100.00' ? 'green' : 'red'
  )

  if (invalidCount > 0) {
    log(`❌ 무결성 오류 (처음 5개):`, 'yellow')
    invalidDetails.forEach((detail) => log(`   - ${detail}`, 'yellow'))
  }

  return validityRate === '100.00'
}

// 3. 데이터 일관성 검증
function validateDataConsistency() {
  log('\n🧮 데이터 일관성 검증', 'blue')
  log('='.repeat(60))

  // 중복 검증
  const eventIdSet = new Set(events.map((e) => e.id))
  const vehicleIdSet = new Set(vehicles.map((v) => v.id))
  const lockerIdSet = new Set(lockers.map((l) => l.id))
  const customerIdSet = new Set(customers.map((c) => c.id))
  const reservationIdSet = new Set(reservations.map((r) => r.id))

  let hasDuplicates = false

  if (eventIdSet.size !== events.length) {
    log(`❌ 행사 중복 발견: ${events.length - eventIdSet.size}개`, 'red')
    hasDuplicates = true
  } else {
    log(`✅ 행사 ID 고유성: ${events.length}개 모두 고유`, 'green')
  }

  if (vehicleIdSet.size !== vehicles.length) {
    log(`❌ 차량 중복 발견: ${vehicles.length - vehicleIdSet.size}개`, 'red')
    hasDuplicates = true
  } else {
    log(`✅ 차량 ID 고유성: ${vehicles.length}개 모두 고유`, 'green')
  }

  if (lockerIdSet.size !== lockers.length) {
    log(`❌ 사물함 중복 발견: ${lockers.length - lockerIdSet.size}개`, 'red')
    hasDuplicates = true
  } else {
    log(`✅ 사물함 ID 고유성: ${lockers.length}개 모두 고유`, 'green')
  }

  if (customerIdSet.size !== customers.length) {
    log(`❌ 고객 중복 발견: ${customers.length - customerIdSet.size}개`, 'red')
    hasDuplicates = true
  } else {
    log(`✅ 고객 ID 고유성: ${customers.length}개 모두 고유`, 'green')
  }

  if (reservationIdSet.size !== reservations.length) {
    log(`❌ 예약 중복 발견: ${reservations.length - reservationIdSet.size}개`, 'red')
    hasDuplicates = true
  } else {
    log(`✅ 예약 ID 고유성: ${reservations.length}개 모두 고유`, 'green')
  }

  return !hasDuplicates
}

// 4. 통계 분석
function analyzeStatistics() {
  log('\n📊 통계 분석', 'blue')
  log('='.repeat(60))

  // 데이터 크기
  log(`\n데이터 크기:`, 'cyan')
  log(`  • 행사: ${events.length}개`)
  log(`  • 차량: ${vehicles.length}개`)
  log(`  • 사물함: ${lockers.length}개`)
  log(`  • 고객: ${customers.length}명`)
  log(`  • 예약: ${reservations.length}개`)

  // 행사별 차량 분포
  log(`\n행사별 차량 분포:`, 'cyan')
  const eventVehicleCount = new Map()
  vehicles.forEach((v) => {
    eventVehicleCount.set(v.eventId, (eventVehicleCount.get(v.eventId) || 0) + 1)
  })
  const vehicleCounts = Array.from(eventVehicleCount.values()).sort((a, b) => a - b)
  log(`  • 최소: ${vehicleCounts[0]}대`)
  log(`  • 최대: ${vehicleCounts[vehicleCounts.length - 1]}대`)
  log(`  • 평균: ${(vehicleCounts.reduce((a, b) => a + b) / vehicleCounts.length).toFixed(2)}대`)

  // 차량별 사물함 분포
  log(`\n차량별 사물함 분포:`, 'cyan')
  const vehicleLockerCount = new Map()
  lockers.forEach((l) => {
    vehicleLockerCount.set(l.vehicleId, (vehicleLockerCount.get(l.vehicleId) || 0) + 1)
  })
  const lockerCounts = Array.from(vehicleLockerCount.values()).sort((a, b) => a - b)
  log(`  • 최소: ${lockerCounts[0]}개`)
  log(`  • 최대: ${lockerCounts[lockerCounts.length - 1]}개`)
  log(`  • 평균: ${(lockerCounts.reduce((a, b) => a + b) / lockerCounts.length).toFixed(2)}개`)

  // 예약 상태 분포
  log(`\n예약 상태 분포:`, 'cyan')
  const statusCount = new Map()
  reservations.forEach((r) => {
    statusCount.set(r.status, (statusCount.get(r.status) || 0) + 1)
  })
  statusCount.forEach((count, status) => {
    const percentage = ((count / reservations.length) * 100).toFixed(2)
    log(`  • ${status}: ${count}개 (${percentage}%)`)
  })

  // 예약 효율성
  log(`\n사물함 활용률:`, 'cyan')
  const usedLockers = new Set(reservations.map((r) => r.lockerId))
  const usageRate = ((usedLockers.size / lockers.length) * 100).toFixed(2)
  log(`  • 사용 중: ${usedLockers.size}개`)
  log(`  • 미사용: ${lockers.length - usedLockers.size}개`)
  log(`  • 활용률: ${usageRate}%`)
}

// 5. 최종 보고서
function generateReport() {
  log('\n' + '='.repeat(60), 'magenta')
  log('📋 데이터 무결성 검증 최종 보고서', 'magenta')
  log('='.repeat(60) + '\n', 'magenta')

  const fkValid = validateForeignKeys()
  const businessValid = validateBusinessLogic()
  const consistencyValid = validateDataConsistency()
  analyzeStatistics()

  log('\n' + '='.repeat(60), 'magenta')
  log('검증 결과 요약', 'magenta')
  log('='.repeat(60), 'magenta')

  if (fkValid && businessValid && consistencyValid) {
    log('✅ 모든 검증 통과! 데이터는 안전합니다.', 'green')
  } else {
    log('❌ 일부 검증 실패. 데이터 수정이 필요합니다.', 'red')
    if (!fkValid) log('   - 외래키 검증 실패', 'red')
    if (!businessValid) log('   - 비즈니스 로직 검증 실패', 'red')
    if (!consistencyValid) log('   - 데이터 일관성 검증 실패', 'red')
  }

  log('\n' + '='.repeat(60) + '\n', 'magenta')

  process.exit(fkValid && businessValid && consistencyValid ? 0 : 1)
}

// 메인 실행
generateReport()
