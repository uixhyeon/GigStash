import { lockers } from '../src/data/lockers.js'
import { reservations } from '../src/data/reservations.js'

console.log('\n✅ 수정 후 데이터 확인\n')
console.log('='.repeat(70))

// 예약의 lockerId와 locker 매칭 확인
console.log('\n📝 예약 사물함 매칭 확인:')
const sampleReservations = reservations.slice(0, 10)

let matchCount = 0
sampleReservations.forEach(r => {
  const locker = lockers.find(l => l.id === r.lockerId)
  if (locker && locker.size) {
    matchCount++
    const sizeMap = { small: '소형', medium: '중형', large: '대형', extra_large: '특대형' }
    console.log(`  ✓ ${r.id}: lockerId=${r.lockerId}, 크기=${sizeMap[locker.size] || locker.size}`)
  } else {
    console.log(`  ✗ ${r.id}: lockerId=${r.lockerId}, 크기 없음`)
  }
})

console.log(`\n📊 샘플 매칭율: ${matchCount}/${sampleReservations.length} (${(matchCount / sampleReservations.length * 100).toFixed(0)}%)`)

// 전체 매칭 확인
console.log('\n🔍 전체 데이터 무결성 검사:')
let allMatched = 0
reservations.forEach(r => {
  const locker = lockers.find(l => l.id === r.lockerId)
  if (locker && locker.size) {
    allMatched++
  }
})

console.log(`  매칭된 예약: ${allMatched}/${reservations.length} (${(allMatched / reservations.length * 100).toFixed(2)}%)`)

// 크기 분포
console.log('\n📈 사물함 크기 분포:')
const sizeDistribution = new Map()
lockers.forEach(l => {
  sizeDistribution.set(l.size, (sizeDistribution.get(l.size) || 0) + 1)
})

sizeDistribution.forEach((count, size) => {
  const percentage = ((count / lockers.length) * 100).toFixed(2)
  console.log(`  ${size.padEnd(12)}: ${count.toString().padStart(5)}개 (${percentage}%)`)
})

console.log('\n')
