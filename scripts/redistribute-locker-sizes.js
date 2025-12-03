/**
 * 사물함 크기 균등 재분배 스크립트
 *
 * 목표: 모든 locker의 크기를 균등하게 분배
 * - small: 25%
 * - medium: 25%
 * - large: 25%
 * - extra_large: 25%
 */

import { lockers as oldLockers } from '../src/data/lockers.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 사물함 크기 균등 재분배 시작\n')
console.log('='.repeat(70))

const sizes = ['small', 'medium', 'large', 'extra_large']
const totalLockers = oldLockers.length
const perSize = Math.floor(totalLockers / sizes.length)
const remainder = totalLockers % sizes.length

console.log(`\n📊 재분배 계획:`)
console.log(`  총 사물함: ${totalLockers}개`)
console.log(`  크기당 기본: ${perSize}개`)
console.log(`  나머지: ${remainder}개\n`)

// 균등하게 분배
const newLockers = oldLockers.map((locker, index) => {
  let sizeIndex = Math.floor(index / perSize)

  // 범위 초과 시 마지막 크기 사용
  if (sizeIndex >= sizes.length) {
    sizeIndex = sizes.length - 1
  }

  const newSize = sizes[sizeIndex]

  return {
    ...locker,
    size: newSize
  }
})

// 검증
const sizeDistribution = new Map()
newLockers.forEach(l => {
  sizeDistribution.set(l.size, (sizeDistribution.get(l.size) || 0) + 1)
})

console.log(`📈 재분배 결과:`)
sizes.forEach(size => {
  const count = sizeDistribution.get(size) || 0
  const percentage = ((count / totalLockers) * 100).toFixed(2)
  console.log(`  ${size.padEnd(12)}: ${count.toString().padStart(5)}개 (${percentage}%)`)
})

// 파일 저장
function saveLockers(lockers) {
  const varName = 'lockers'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 사물함 크기 균등 재분배 (small, medium, large, extra_large 각 25%)

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
