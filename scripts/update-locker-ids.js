/**
 * 사물함 ID를 체계적으로 코드화하는 스크립트
 * 형식: VEH-XXX-SYY (S=Small, M=Medium, L=Large, YY=순번)
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const lockersPath = join(__dirname, '../src/data/lockers.json')

// 파일 읽기
const data = JSON.parse(readFileSync(lockersPath, 'utf-8'))
const lockers = data.lockers

// 차량별 사이즈별 카운터
const vehicleCounters = {}

// 사이즈 매핑
const sizeMap = {
  small: 'S',
  medium: 'M',
  large: 'L'
}

console.log('🔄 사물함 ID 코드화 시작...\n')

// 각 사물함 업데이트
lockers.forEach((locker, index) => {
  const vehicleId = locker.vehicleId
  const size = locker.size
  const sizeCode = sizeMap[size] || 'U' // Unknown

  // 차량별 카운터 초기화
  if (!vehicleCounters[vehicleId]) {
    vehicleCounters[vehicleId] = {
      S: 0,
      M: 0,
      L: 0
    }
  }

  // 사이즈별 순번 증가
  vehicleCounters[vehicleId][sizeCode]++
  const counter = vehicleCounters[vehicleId][sizeCode]

  // 새로운 ID 생성 (예: VEH-001-S01)
  const newId = `${vehicleId}-${sizeCode}${String(counter).padStart(2, '0')}`

  // 이전 ID 저장
  const oldId = locker.id
  const oldNumber = locker.number

  // 업데이트
  locker.id = newId
  locker.number = newId

  console.log(`✓ ${oldId} → ${newId}`)
  console.log(`  Vehicle: ${vehicleId}, Size: ${size} (${sizeCode}), Counter: ${counter}`)
})

// 파일 저장
writeFileSync(lockersPath, JSON.stringify(data, null, 2), 'utf-8')

console.log('\n✅ 사물함 ID 코드화 완료!')
console.log('\n📊 요약:')
Object.entries(vehicleCounters).forEach(([vehicleId, counts]) => {
  console.log(`\n${vehicleId}:`)
  console.log(`  - Small (S): ${counts.S}개`)
  console.log(`  - Medium (M): ${counts.M}개`)
  console.log(`  - Large (L): ${counts.L}개`)
})
