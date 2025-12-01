/**
 * 사물함 location 필드를 코드화 형식으로 업데이트하는 스크립트
 * 형식: VEH-XXX-SYY (기존 위치 정보 제거)
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

console.log('🔄 사물함 위치(location) 정보 코드화 시작...\n')

// 각 사물함의 location 업데이트
lockers.forEach((locker) => {
  const oldLocation = locker.location

  // location을 id와 동일한 코드로 설정
  locker.location = locker.id

  console.log(`✓ ${oldLocation}`)
  console.log(`  → ${locker.location}\n`)
})

// 파일 저장
writeFileSync(lockersPath, JSON.stringify(data, null, 2), 'utf-8')

console.log('✅ 사물함 위치 정보 코드화 완료!')
console.log('\n📍 변경 전: "VEH-001 (서울12가1234) - 앞칸 왼쪽"')
console.log('📍 변경 후: "VEH-001-S01"')
