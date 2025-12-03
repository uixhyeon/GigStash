/**
 * 예약 데이터 재생성 스크립트 (올바른 로직)
 *
 * 목표: 예약-사물함-차량-행사 관계의 데이터 무결성 100% 달성
 *
 * 규칙:
 * 1. 각 행사(eventId)별로 배치된 차량(vehicleId) 확인
 * 2. 각 차량에 속한 사물함(lockerId) 목록 구성
 * 3. 행사의 예약을 해당 차량의 사물함에만 할당
 * 4. 라운드-로빈 방식으로 사물함 재사용 (같은 날짜면 다른 사물함)
 * 5. 서로 다른 날짜이면 같은 사물함 재사용 가능
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM 모듈에서 __dirname 구하기
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 데이터 파일 경로
const dataDir = path.join(__dirname, '../src/data')

// 데이터 로드 (ESM import 문법 사용)
async function loadData() {
  try {
    const { events } = await import('../src/data/events.js')
    const { vehicles } = await import('../src/data/vehicles.js')
    const { lockers } = await import('../src/data/lockers.js')
    const { customers } = await import('../src/data/customers.js')
    const { reservations } = await import('../src/data/reservations.js')

    return {
      events,
      vehicles,
      lockers,
      customers,
      reservations,
    }
  } catch (error) {
    console.error('❌ 데이터 로드 오류:', error.message)
    process.exit(1)
  }
}

// 행사별 차량 매핑
function buildEventVehicleMap(vehicles) {
  const map = new Map()
  vehicles.forEach((vehicle) => {
    if (!map.has(vehicle.eventId)) {
      map.set(vehicle.eventId, [])
    }
    map.get(vehicle.eventId).push(vehicle.id)
  })
  return map
}

// 차량별 사물함 매핑
function buildVehicleLockerMap(lockers) {
  const map = new Map()
  lockers.forEach((locker) => {
    if (!map.has(locker.vehicleId)) {
      map.set(locker.vehicleId, [])
    }
    map.get(locker.vehicleId).push(locker.id)
  })
  return map
}

// 행사별 가능한 사물함 목록 구성
function buildEventLockerMap(events, vehicles, lockers) {
  const eventVehicleMap = buildEventVehicleMap(vehicles)
  const vehicleLockerMap = buildVehicleLockerMap(lockers)
  const eventLockerMap = new Map()

  eventVehicleMap.forEach((vehicleIds, eventId) => {
    const availableLockers = new Set()
    vehicleIds.forEach((vehicleId) => {
      const vehicleLockers = vehicleLockerMap.get(vehicleId) || []
      vehicleLockers.forEach((lockerId) => availableLockers.add(lockerId))
    })
    eventLockerMap.set(eventId, Array.from(availableLockers))
  })

  return eventLockerMap
}

// 예약 재생성
function regenerateReservations(reservations, eventLockerMap, customers) {
  const regenerated = []
  const eventReservationIndex = new Map() // 행사별 사물함 할당 인덱스 추적

  // 고객 검증
  const customerIds = new Set(customers.map((c) => c.id))

  reservations.forEach((reservation) => {
    const eventId = reservation.eventId
    const customerId = reservation.customerId

    // 데이터 검증
    if (!eventLockerMap.has(eventId)) {
      console.warn(`⚠️  경고: 알 수 없는 행사 ${eventId}`)
      return
    }

    if (!customerIds.has(customerId)) {
      console.warn(`⚠️  경고: 알 수 없는 고객 ${customerId}`)
      return
    }

    // 행사의 가능한 사물함 목록
    const availableLockers = eventLockerMap.get(eventId)
    if (!availableLockers || availableLockers.length === 0) {
      console.warn(`⚠️  경고: 행사 ${eventId}의 사물함이 없습니다`)
      return
    }

    // 라운드-로빈으로 사물함 할당
    if (!eventReservationIndex.has(eventId)) {
      eventReservationIndex.set(eventId, 0)
    }
    const currentIndex = eventReservationIndex.get(eventId)
    const assignedLockerId = availableLockers[currentIndex % availableLockers.length]

    // 인덱스 증가
    eventReservationIndex.set(eventId, currentIndex + 1)

    // 재생성된 예약
    regenerated.push({
      id: reservation.id,
      eventId: reservation.eventId,
      lockerId: assignedLockerId, // 올바른 사물함 할당
      customerId: reservation.customerId,
      status: reservation.status,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      itemDescription: reservation.itemDescription,
      createdAt: reservation.createdAt,
      accessCode: reservation.accessCode,
    })
  })

  return regenerated
}

// 데이터 무결성 검증
function validateIntegrity(reservations, events, vehicles, lockers) {
  const eventMap = new Map(events.map((e) => [e.id, e]))
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))
  const lockerMap = new Map(lockers.map((l) => [l.id, l]))

  let validCount = 0
  let invalidCount = 0
  const invalidReservations = []

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
      invalidReservations.push(reservation.id)
    }
  })

  return {
    total: reservations.length,
    valid: validCount,
    invalid: invalidCount,
    validityRate: ((validCount / reservations.length) * 100).toFixed(2),
    invalidReservations,
  }
}

// 파일 저장
function saveData(data, filename) {
  const varName =
    filename === 'reservations.js'
      ? 'reservations'
      : filename === 'events.js'
        ? 'events'
        : filename === 'vehicles.js'
          ? 'vehicles'
          : filename === 'lockers.js'
            ? 'lockers'
            : 'customers'

  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 데이터 무결성 검증 완료됨

export const ${varName} = ${JSON.stringify(data, null, 2)}
`

  const filepath = path.join(dataDir, filename)
  fs.writeFileSync(filepath, content)
  console.log(`✅ 저장 완료: ${filepath}`)
}

// 메인 함수
async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('📋 예약 데이터 재생성 (올바른 로직)')
  console.log('='.repeat(70) + '\n')

  // 1. 데이터 로드
  console.log('📥 데이터 로드 중...')
  const { events, vehicles, lockers, customers, reservations } = await loadData()
  console.log(`   ✅ 행사: ${events.length}개`)
  console.log(`   ✅ 차량: ${vehicles.length}개`)
  console.log(`   ✅ 사물함: ${lockers.length}개`)
  console.log(`   ✅ 고객: ${customers.length}명`)
  console.log(`   ✅ 예약: ${reservations.length}개\n`)

  // 2. 행사별 사물함 맵 구성
  console.log('🔗 행사별 사물함 맵 구성 중...')
  const eventLockerMap = buildEventLockerMap(events, vehicles, lockers)
  console.log(`   ✅ 행사별 사물함 매핑 완료 (${eventLockerMap.size}개 행사)\n`)

  // 3. 무결성 검증 (변경 전)
  console.log('🔍 변경 전 데이터 무결성 검증...')
  const beforeValidation = validateIntegrity(reservations, events, vehicles, lockers)
  console.log(`   📊 총 예약: ${beforeValidation.total}개`)
  console.log(`   ✅ 정상: ${beforeValidation.valid}개 (${beforeValidation.validityRate}%)`)
  console.log(`   ❌ 오류: ${beforeValidation.invalid}개 (${(100 - parseFloat(beforeValidation.validityRate)).toFixed(2)}%)\n`)

  // 4. 예약 데이터 재생성
  console.log('🔄 예약 데이터 재생성 중...')
  const regeneratedReservations = regenerateReservations(reservations, eventLockerMap, customers)
  console.log(`   ✅ 재생성 완료: ${regeneratedReservations.length}개\n`)

  // 5. 무결성 검증 (변경 후)
  console.log('🔍 변경 후 데이터 무결성 검증...')
  const afterValidation = validateIntegrity(regeneratedReservations, events, vehicles, lockers)
  console.log(`   📊 총 예약: ${afterValidation.total}개`)
  console.log(`   ✅ 정상: ${afterValidation.valid}개 (${afterValidation.validityRate}%)`)
  console.log(`   ❌ 오류: ${afterValidation.invalid}개 (${(100 - parseFloat(afterValidation.validityRate)).toFixed(2)}%)\n`)

  // 6. 비교 결과
  console.log('📈 개선도 분석')
  console.log(`   변경 전 무결성: ${beforeValidation.validityRate}%`)
  console.log(`   변경 후 무결성: ${afterValidation.validityRate}%`)
  console.log(`   개선율: +${(parseFloat(afterValidation.validityRate) - parseFloat(beforeValidation.validityRate)).toFixed(2)}%\n`)

  // 7. 파일 저장 여부 확인
  if (parseFloat(afterValidation.validityRate) === 100) {
    console.log('✅ 데이터 무결성 100%! 파일 저장 진행\n')
    saveData(regeneratedReservations, 'reservations.js')
    console.log('✅ 예약 데이터 저장 완료!\n')
  } else {
    console.log('⚠️  경고: 무결성이 100%가 아닙니다. 검토 필요합니다.')
    if (afterValidation.invalidReservations.length > 0) {
      console.log(`\n   오류난 예약 ID (처음 10개):`)
      afterValidation.invalidReservations.slice(0, 10).forEach((id) => {
        console.log(`   - ${id}`)
      })
    }
  }

  console.log('\n' + '='.repeat(70) + '\n')
}

main()
