/**
 * 예약 데이터 완전 할당 스크립트
 *
 * 목표: 모든 차량에 대해 사물함 재할당 및 예약 완전 생성
 * 전략: 기존 사물함 재사용 + 필요시 신규 사물함 생성
 */

import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 예약 데이터 완전 할당 시작\n')
console.log('='.repeat(70))

// 맵 생성
const eventMap = new Map(events.map(e => [e.id, e]))
const vehicleMap = new Map(vehicles.map(v => [v.id, v]))

const vehiclesByEvent = new Map()
const lockersByVehicle = new Map()

vehicles.forEach(v => {
  if (!vehiclesByEvent.has(v.eventId)) {
    vehiclesByEvent.set(v.eventId, [])
  }
  vehiclesByEvent.get(v.eventId).push(v)
})

lockers.forEach(l => {
  if (!lockersByVehicle.has(l.vehicleId)) {
    lockersByVehicle.set(l.vehicleId, [])
  }
  lockersByVehicle.get(l.vehicleId).push(l)
})

// 11월 중순 기준
const midNov = new Date('2025-11-15')
const lateEvents = [...events]
  .filter(e => new Date(e.eventDate) >= midNov)
  .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

// 분석
const vehiclesWithoutLockers = []
const maxLockerId = Math.max(...lockers.map(l => parseInt(l.id.substring(2))))

console.log(`\n📊 현황 분석:`)
console.log(`  총 사물함: ${lockers.length}개`)
console.log(`  최대 ID: ${maxLockerId}`)

let nextLockerId = maxLockerId + 1
let newLockersCreated = 0
const newLockersList = [...lockers]

// 각 차량에 대해 확인하고 필요시 사물함 할당
console.log(`\n📍 차량별 사물함 할당 검증:\n`)

for (const vehicle of vehicles) {
  const hasLockers = (lockersByVehicle.get(vehicle.id) || []).length > 0

  if (!hasLockers) {
    // 이 차량에 50개의 새로운 사물함 생성
    for (let i = 0; i < 50; i++) {
      const newLocker = {
        id: `LS${String(nextLockerId).padStart(4, '0')}`,
        vehicleId: vehicle.id,
        number: String(i + 1).padStart(2, '0'),
        type: 'bag_storage',
        status: 'available'
      }

      newLockersList.push(newLocker)

      if (!lockersByVehicle.has(vehicle.id)) {
        lockersByVehicle.set(vehicle.id, [])
      }
      lockersByVehicle.get(vehicle.id).push(newLocker)

      nextLockerId++
      newLockersCreated++
    }
  }
}

console.log(`✅ 신규 사물함 생성: ${newLockersCreated}개`)
console.log(`   총 사물함: ${newLockersList.length}개\n`)

// 사물함 파일 저장
function saveLockers(lockers) {
  const varName = 'lockers'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 모든 차량에 사물함 할당

export const ${varName} = ${JSON.stringify(lockers, null, 2)}
`

  const filepath = path.join(dataDir, 'lockers.js')
  fs.writeFileSync(filepath, content)
}

saveLockers(newLockersList)

// ===== 예약 생성 =====
console.log(`${'='.repeat(70)}\n`)
console.log(`📋 예약 완전 생성\n`)

// 보존할 예약 (11월 중순 이전)
const preservedReservations = oldReservations.filter(r => {
  const event = eventMap.get(r.eventId)
  return event && new Date(event.eventDate) < midNov
})

let newReservations = [...preservedReservations]
let createdCount = 0
const eventStats = []

console.log('📅 11월 중순 이후 이벤트 예약 생성:\n')

for (const event of lateEvents) {
  const buses = vehiclesByEvent.get(event.id) || []
  let createdForEvent = 0

  for (const vehicle of buses) {
    const lockerList = lockersByVehicle.get(vehicle.id) || []

    // 최대 50개 예약 생성
    const reservationsToCreate = Math.min(50, lockerList.length)

    for (let i = 0; i < reservationsToCreate; i++) {
      const locker = lockerList[i]
      const customer = customers[Math.floor(Math.random() * customers.length)]

      const resId = `RES${String(newReservations.length + 1).padStart(10, '0')}`

      const startTime = new Date(event.eventDate)
      startTime.setHours(9, 0, 0, 0)

      const endTime = new Date(event.eventDate)
      endTime.setDate(endTime.getDate() + 1)
      endTime.setHours(18, 0, 0, 0)

      newReservations.push({
        id: resId,
        eventId: event.id,
        lockerId: locker.id,
        customerId: customer.id,
        status: 'active',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        itemDescription: '예약물품',
        createdAt: new Date().toISOString(),
        accessCode: Math.random().toString().substring(2, 20)
      })

      createdForEvent++
      createdCount++
    }
  }

  eventStats.push({
    eventDate: event.eventDate,
    eventName: event.eventName,
    buses: buses.length,
    created: createdForEvent
  })

  const name = event.eventName.length > 25 ? event.eventName.substring(0, 25) : event.eventName
  console.log(`✅ ${event.eventDate} | ${name.padEnd(25)} | 배차: ${buses.length.toString().padStart(2)} | 생성: ${createdForEvent.toString().padStart(3)}`)
}

console.log(`\n${'='.repeat(70)}`)
console.log(`\n📊 최종 결과:`)
console.log(`  보존된 예약: ${preservedReservations.length}개`)
console.log(`  새로 생성된 예약: ${createdCount}개`)
console.log(`  총 예약: ${newReservations.length}개\n`)

// 통계
let totalBuses = 0
let totalCreated = 0

eventStats.forEach(stat => {
  totalBuses += stat.buses
  totalCreated += stat.created
})

console.log('11월 중순 이후 통계:')
console.log(`  이벤트: ${eventStats.length}개`)
console.log(`  배차: ${totalBuses}대`)
console.log(`  생성된 예약: ${totalCreated}개`)
console.log(`  활용률: ${((totalCreated / (totalBuses * 50)) * 100).toFixed(2)}%`)
console.log(`  배차 대수 상 예상: ${totalBuses * 50}개\n`)

// 예약 파일 저장
function saveReservations(reservations) {
  const varName = 'reservations'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 배차 대수에 맞게 예약 완전 할당

export const ${varName} = ${JSON.stringify(reservations, null, 2)}
`

  const filepath = path.join(dataDir, 'reservations.js')
  fs.writeFileSync(filepath, content)
  console.log(`✅ 저장 완료:`)
  console.log(`   lockers: ${dataDir}/lockers.js`)
  console.log(`   reservations: ${dataDir}/reservations.js\n`)
}

saveReservations(newReservations)

console.log('다음 단계:')
console.log('  npm run data:validate    # 데이터 검증')
console.log('  npm run data:test        # 자동 테스트')
console.log('  npm run build            # 빌드 확인\n')
