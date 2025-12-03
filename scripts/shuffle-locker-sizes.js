/**
 * 사물함 크기 섞어서 배치 스크립트
 *
 * 목표: 모든 locker의 크기를 무작위로 섞어서 배치
 * - 여전히 균등한 비율 유지 (25% 각각)
 * - 하지만 물리적으로는 다양하게 배치
 */

import { lockers as oldLockers } from '../src/data/lockers.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 사물함 크기 섞어서 배치 시작\n')
console.log('='.repeat(70))

const sizes = ['small', 'medium', 'large', 'extra_large']
const totalLockers = oldLockers.length
const perSize = Math.floor(totalLockers / sizes.length)
const remainder = totalLockers % sizes.length

// 1단계: 필요한 개수만큼 각 크기 배열 만들기
const sizeArrays = {}
sizes.forEach(size => {
  sizeArrays[size] = []
  const count = perSize + (sizes.indexOf(size) < remainder ? 1 : 0)
  for (let i = 0; i < count; i++) {
    sizeArrays[size].push(size)
  }
})

console.log(`\n📊 배치 계획:`)
console.log(`  총 사물함: ${totalLockers}개`)
sizes.forEach(size => {
  const count = sizeArrays[size].length
  console.log(`  ${size.padEnd(12)}: ${count.toString().padStart(5)}개`)
})

// 2단계: 모든 크기를 하나의 배열로 합치기
const allSizes = []
sizes.forEach(size => {
  allSizes.push(...sizeArrays[size])
})

// 3단계: 섞기 (Fisher-Yates shuffle)
function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const shuffledSizes = shuffle(allSizes)

// 4단계: 각 locker에 섞인 크기 적용
const newLockers = oldLockers.map((locker, index) => {
  return {
    ...locker,
    size: shuffledSizes[index]
  }
})

// 검증
const sizeDistribution = new Map()
newLockers.forEach(l => {
  sizeDistribution.set(l.size, (sizeDistribution.get(l.size) || 0) + 1)
})

console.log(`\n📈 배치 결과:`)
sizes.forEach(size => {
  const count = sizeDistribution.get(size) || 0
  const percentage = ((count / totalLockers) * 100).toFixed(2)
  console.log(`  ${size.padEnd(12)}: ${count.toString().padStart(5)}개 (${percentage}%)`)
})

// 다양성 확인
console.log(`\n🎨 분포 다양성 확인:`)
let mixedCount = 0
for (let i = 1; i < newLockers.length - 1; i++) {
  const prev = newLockers[i - 1].size
  const curr = newLockers[i].size
  const next = newLockers[i + 1].size
  if (prev !== curr && curr !== next) {
    mixedCount++
  }
}
const mixingPercentage = ((mixedCount / (newLockers.length - 2)) * 100).toFixed(2)
console.log(`  인접한 크기가 다른 비율: ${mixingPercentage}%`)

// 파일 저장
function saveLockers(lockers) {
  const varName = 'lockers'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 사물함 크기 무작위 섞어서 배치 (small, medium, large, extra_large)

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
