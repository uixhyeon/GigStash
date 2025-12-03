/**
 * 사물함 할당 및 예약 생성 스크립트
 *
 * 단계:
 * 1. 미할당된 사물함을 11월 중순 이후 이벤트의 차량에 분배
 * 2. 배차 대수에 맞게 예약 생성 (1대당 최대 50명)
 */

import { events } from '../src/data/events.js'
import { vehicles } from '../src/data/vehicles.js'
import { lockers as oldLockers } from '../src/data/lockers.js'
import { customers } from '../src/data/customers.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 사물함 할당 및 예약 생성 시작\n')
console.log('='.repeat(70))

// 맵 생성
const eventMap = new Map(events.map(e => [e.id, e]))
const vehicleMap = new Map(vehicles.map(v => [v.id, v]))

const vehiclesByEvent = new Map()
const lockersByVehicle = new Map()

// 차량을 행사별로 그룹화
vehicles.forEach(v => {
  if (!vehiclesByEvent.has(v.eventId)) {
    vehiclesByEvent.set(v.eventId, [])
  }
  vehiclesByEvent.get(v.eventId).push(v)
})

// 기존 사물함을 차량별로 그룹화
oldLockers.forEach(l => {
  if (!lockersByVehicle.has(l.vehicleId)) {
    lockersByVehicle.set(l.vehicleId, [])
  }
  lockersByVehicle.get(l.vehicleId).push(l)
})

// 11월 중순 이후 이벤트 필터링
const midNov = new Date('2025-11-15')
const lateEvents = [...events]
  .filter(e => new Date(e.eventDate) >= midNov)
  .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

// 미할당 사물함 찾기
const assignedLockers = new Set()
oldLockers.forEach(l => assignedLockers.add(l.id))

let unassignedCount = 1001 - assignedLockers.size
console.log(`\n📦 사물함 상태:`)
console.log(`  할당됨: ${assignedLockers.size}개`)
console.log(`  미할당: ${unassignedCount}개`)

// 11월 중순 이후 이벤트의 미할당 차량 수
let lateEventsVehicles = 0
const lateEventVehicleIds = new Set()
lateEvents.forEach(event => {
  const buses = vehiclesByEvent.get(event.id) || []
  buses.forEach(v => {
    lateEventVehicleIds.add(v.id)
    if (!lockersByVehicle.has(v.id) || lockersByVehicle.get(v.id).length === 0) {
      lateEventsVehicles++
    }
  })
})

console.log(`  11월 중순 이후 미할당 차량: ${lateEventsVehicles}대`)

// 새로운 사물함 생성
const newLockers = [...oldLockers]
let nextLockerId = 1001
let allocatedCount = 0

console.log(`\n📍 사물함 할당 시작:\n`)

// 11월 중순 이후 차량에 사물함 할당
for (const event of lateEvents) {
  const buses = vehiclesByEvent.get(event.id) || []

  for (const vehicle of buses) {
    const existingLockers = lockersByVehicle.get(vehicle.id) || []

    // 이미 사물함이 있으면 스킵
    if (existingLockers.length > 0) continue

    // 50개의 새로운 사물함 생성
    for (let i = 0; i < 50; i++) {
      if (nextLockerId > 2000) break // 안전장치

      const newLocker = {
        id: `LS${String(nextLockerId).padStart(4, '0')}`,
        vehicleId: vehicle.id,
        number: String(i + 1).padStart(2, '0'),
        type: 'bag_storage',
        status: 'available'
      }

      newLockers.push(newLocker)

      if (!lockersByVehicle.has(vehicle.id)) {
        lockersByVehicle.set(vehicle.id, [])
      }
      lockersByVehicle.get(vehicle.id).push(newLocker)

      nextLockerId++
      allocatedCount++
    }
  }
}

console.log(`✅ 신규 사물함 생성: ${allocatedCount}개`)
console.log(`\n📊 사물함 할당 완료:`)
console.log(`  총 사물함: ${newLockers.length}개`)

// 사물함 파일 저장
function saveLockers(lockers) {
  const varName = 'lockers'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 11월 중순 이후 이벤트 차량에 사물함 할당

export const ${varName} = ${JSON.stringify(lockers, null, 2)}
`

  const filepath = path.join(dataDir, 'lockers.js')
  fs.writeFileSync(filepath, content)
  console.log(`  저장 완료: ${filepath}`)
}

saveLockers(newLockers)

// ===== 예약 생성 =====
console.log(`\n${'='.repeat(70)}`)
console.log(`\n📋 예약 생성 시작\n`)

// 기존 예약 중 11월 중순 이전만 보존
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

    // 이 차량의 사물함으로 최대 50개 예약 생성
    for (let i = 0; i < Math.min(50, lockerList.length); i++) {
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
  console.log(`✅ ${event.eventDate} | ${name.padEnd(25)} | 배차: ${buses.length} | 생성: ${createdForEvent}`)
}

console.log(`\n${'='.repeat(70)}`)
console.log(`\n📊 생성 결과:`)
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
console.log(`  활용률: ${((totalCreated / (totalBuses * 50)) * 100).toFixed(2)}%\n`)

// 예약 파일 저장
function saveReservations(reservations) {
  const varName = 'reservations'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 배차 대수에 맞게 예약 재분배

export const ${varName} = ${JSON.stringify(reservations, null, 2)}
`

  const filepath = path.join(dataDir, 'reservations.js')
  fs.writeFileSync(filepath, content)
  console.log(`✅ 저장 완료: ${filepath}\n`)
}

saveReservations(newReservations)

console.log('다음 단계:')
console.log('  npm run data:validate    # 데이터 검증')
console.log('  npm run data:test        # 자동 테스트')
console.log('  npm run build            # 빌드 확인\n')
