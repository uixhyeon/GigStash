/**
 * 각 차량당 50개씩 사물함을 생성하는 스크립트
 * 형식: VEH-XXX-SYY (S=Small, M=Medium, L=Large)
 *
 * 분배:
 * - Small: 25개 (S01~S25)
 * - Medium: 15개 (M01~M15)
 * - Large: 10개 (L01~L10)
 * 총 50개
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const lockersPath = join(__dirname, '../src/data/lockers.json')
const vehiclesPath = join(__dirname, '../src/data/vehicles.json')

// vehicles 파일 읽기
const vehiclesData = JSON.parse(readFileSync(vehiclesPath, 'utf-8'))
const vehicles = vehiclesData.vehicles

console.log('🚀 각 차량당 50개씩 사물함 생성 시작\n')
console.log('=' * 70)

const newLockers = []

// 각 차량마다 50개씩 생성
vehicles.forEach((vehicle) => {
  console.log(`\n📦 ${vehicle.id} 사물함 생성 중...`)

  let lockerCount = 0

  // Small: 25개 (S01~S25)
  for (let i = 1; i <= 25; i++) {
    const lockerId = `${vehicle.id}-S${String(i).padStart(2, '0')}`
    const locker = {
      id: lockerId,
      number: lockerId,
      vehicleId: vehicle.id,
      size: 'small',
      location: lockerId,
      position: `position-${i}`,
      status: 'available',
      temperature: 3.5 + Math.random() * 1.5,
      lastMaintenance: '2025-01-10T10:00:00Z',
      features: ['냉장', 'RFID'],
      currentReservation: null
    }
    newLockers.push(locker)
    lockerCount++
  }

  // Medium: 15개 (M01~M15)
  for (let i = 1; i <= 15; i++) {
    const lockerId = `${vehicle.id}-M${String(i).padStart(2, '0')}`
    const locker = {
      id: lockerId,
      number: lockerId,
      vehicleId: vehicle.id,
      size: 'medium',
      location: lockerId,
      position: `position-${25 + i}`,
      status: 'available',
      temperature: 3.5 + Math.random() * 1.5,
      lastMaintenance: '2025-01-10T10:00:00Z',
      features: ['냉장', 'RFID', '알림'],
      currentReservation: null
    }
    newLockers.push(locker)
    lockerCount++
  }

  // Large: 10개 (L01~L10)
  for (let i = 1; i <= 10; i++) {
    const lockerId = `${vehicle.id}-L${String(i).padStart(2, '0')}`
    const locker = {
      id: lockerId,
      number: lockerId,
      vehicleId: vehicle.id,
      size: 'large',
      location: lockerId,
      position: `position-${40 + i}`,
      status: 'available',
      temperature: 3.5 + Math.random() * 1.5,
      lastMaintenance: '2025-01-10T10:00:00Z',
      features: ['냉장', 'RFID', '알림', '대용량'],
      currentReservation: null
    }
    newLockers.push(locker)
    lockerCount++
  }

  console.log(`  ✓ ${vehicle.id}: ${lockerCount}개 사물함 생성 완료`)
  console.log(`    - Small: 25개 (S01~S25)`)
  console.log(`    - Medium: 15개 (M01~M15)`)
  console.log(`    - Large: 10개 (L01~L10)`)
})

// 파일 저장
const result = {
  lockers: newLockers
}

writeFileSync(lockersPath, JSON.stringify(result, null, 2), 'utf-8')

console.log('\n' + '=' * 70)
console.log('\n✅ 사물함 생성 완료!\n')
console.log('📊 통계:')
console.log(`  - 총 차량 수: ${vehicles.length}개`)
console.log(`  - 차량당 사물함: 50개`)
console.log(`  - 총 사물함 수: ${newLockers.length}개`)
console.log(`    - Small: ${newLockers.filter(l => l.size === 'small').length}개`)
console.log(`    - Medium: ${newLockers.filter(l => l.size === 'medium').length}개`)
console.log(`    - Large: ${newLockers.filter(l => l.size === 'large').length}개`)
console.log('\n💾 lockers.json 업데이트 완료!')
