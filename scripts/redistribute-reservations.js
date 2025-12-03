/**
 * 예약 데이터 재분배 스크립트
 *
 * 목표: 11월 중순 이후 이벤트에 배차 대수에 맞게 예약 분배
 * 규칙:
 * - 1대당 최대 50명 (50개 예약)
 * - 배차되지 않은 이벤트는 예약이 없어야 함
 * - 각 사물함은 1개 예약만 가능
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

// 이벤트 맵 생성
const eventMap = new Map(events.map(e => [e.id, e]))
const vehiclesByEvent = new Map()
const lockersByVehicle = new Map()

// 차량을 행사별로 그룹화
vehicles.forEach(v => {
  if (!vehiclesByEvent.has(v.eventId)) {
    vehiclesByEvent.set(v.eventId, [])
  }
  vehiclesByEvent.get(v.eventId).push(v)
})

// 사물함을 차량별로 그룹화
lockers.forEach(l => {
  if (!lockersByVehicle.has(l.vehicleId)) {
    lockersByVehicle.set(l.vehicleId, [])
  }
  lockersByVehicle.get(l.vehicleId).push(l)
})

// 기존 예약 중 11월 중순 이후가 아닌 것만 보존
const midNov = new Date('2025-11-15')
const preservedReservations = oldReservations.filter(r => {
  const event = eventMap.get(r.eventId)
  return event && new Date(event.eventDate) < midNov
})

console.log('\n🚀 예약 데이터 재분배 시작\n')
console.log('='.repeat(70))

// 새로운 예약 생성
let newReservations = [...preservedReservations]
let createdCount = 0
let eventStats = []

// 11월 중순 이후 이벤트 처리
const laterEvents = [...events]
  .filter(e => new Date(e.eventDate) >= midNov)
  .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

console.log('\n📅 11월 중순 이후 이벤트 예약 생성\n')

laterEvents.forEach(event => {
  const buses = vehiclesByEvent.get(event.id) || []
  const maxReservations = buses.length * 50

  let createdForEvent = 0
  const usedLockers = new Set()

  // 각 배차 차량에 대해 50개씩 예약 생성
  buses.forEach((vehicle, busIndex) => {
    const lockerList = lockersByVehicle.get(vehicle.id) || []

    // 이 차량에 배정된 사물함으로 50개 예약 생성
    for (let i = 0; i < Math.min(50, lockerList.length); i++) {
      const locker = lockerList[i]

      // 중복 사용하지 않도록 확인
      if (usedLockers.has(locker.id)) continue

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

      usedLockers.add(locker.id)
      createdForEvent++
      createdCount++
    }
  })

  eventStats.push({
    eventId: event.id,
    eventName: event.eventName,
    eventDate: event.eventDate,
    buses: buses.length,
    expected: maxReservations,
    created: createdForEvent,
    utilization: ((createdForEvent / maxReservations) * 100).toFixed(2)
  })

  console.log(`✅ ${event.eventDate} | ${event.eventName.substring(0, 25).padEnd(25)} | 배차: ${buses.length} | 생성: ${createdForEvent}`)
})

console.log('\n' + '='.repeat(70))
console.log('\n📊 생성 결과:')
console.log(`  보존된 예약: ${preservedReservations.length}개`)
console.log(`  새로 생성된 예약: ${createdCount}개`)
console.log(`  총 예약: ${newReservations.length}개\n`)

// 통계
let totalBuses = 0
let totalExpected = 0
let totalCreated = 0

eventStats.forEach(stat => {
  totalBuses += stat.buses
  totalExpected += stat.expected
  totalCreated += stat.created
})

console.log('11월 중순 이후 통계:')
console.log(`  이벤트: ${eventStats.length}개`)
console.log(`  배차: ${totalBuses}대`)
console.log(`  예상 예약: ${totalExpected}개`)
console.log(`  생성된 예약: ${totalCreated}개`)
console.log(`  활용률: ${((totalCreated / totalExpected) * 100).toFixed(2)}%\n`)

// 파일 저장
function saveReservations(reservations) {
  const varName = 'reservations'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 배차 대수에 맞게 예약 데이터 재분배

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
