/**
 * 사물함 크기 속성 추가 스크립트
 *
 * 목표: 모든 locker에 size 속성 추가
 * - LS0001~LS1000: small, medium, large 무작위 분배
 * - LS1001~LS5450: small 기본값 (신규 생성 사물함)
 */

import { lockers as oldLockers } from '../src/data/lockers.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 사물함 크기 속성 추가 시작\n')
console.log('='.repeat(70))

// 크기 분배 (다양성을 위해)
const sizes = ['small', 'medium', 'large']

const newLockers = oldLockers.map((locker, index) => {
  // 이미 size가 있으면 유지
  if (locker.size) {
    return locker
  }

  // size가 없으면 추가
  let newSize = 'small' // 기본값: small

  // LS0001~LS1000 범위: 무작위 분배
  const lockerId = parseInt(locker.id.substring(2))
  if (lockerId <= 1000) {
    newSize = sizes[index % sizes.length]
  }

  return {
    ...locker,
    size: newSize
  }
})

// 검증
const withSize = newLockers.filter(l => l.size).length
const withoutSize = newLockers.filter(l => !l.size).length

console.log(`\n📊 크기 속성 추가 결과:`)
console.log(`  크기 있음: ${withSize}개`)
console.log(`  크기 없음: ${withoutSize}개\n`)

// 크기별 분포
const sizeDistribution = new Map()
newLockers.forEach(l => {
  sizeDistribution.set(l.size, (sizeDistribution.get(l.size) || 0) + 1)
})

console.log(`📈 크기별 분포:`)
sizeDistribution.forEach((count, size) => {
  const percentage = ((count / newLockers.length) * 100).toFixed(2)
  console.log(`  ${size.padEnd(12)}: ${count.toString().padStart(5)}개 (${percentage}%)`)
})

// 파일 저장
function saveLockers(lockers) {
  const varName = 'lockers'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 모든 사물함에 크기 속성 추가

export const ${varName} = ${JSON.stringify(lockers, null, 2)}
`

  const filepath = path.join(dataDir, 'lockers.js')
  fs.writeFileSync(filepath, content)
  console.log(`\n✅ 저장 완료: ${filepath}\n`)
}

saveLockers(newLockers)

console.log('다음 단계:')
console.log('  npm run data:validate    # 데이터 검증')
console.log('  npm run build            # 빌드 확인\n')
