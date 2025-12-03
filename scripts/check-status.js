import { reservations } from '../src/data/reservations.js'

// 상태별 개수 통계
const statusCount = new Map()
reservations.forEach(r => {
  statusCount.set(r.status, (statusCount.get(r.status) || 0) + 1)
})

console.log('\n📊 현재 예약 상태 분포:\n')
statusCount.forEach((count, status) => {
  const percentage = ((count / reservations.length) * 100).toFixed(2)
  console.log(`  ${status.padEnd(12)}: ${count.toString().padStart(5)}개 (${percentage}%)`)
})
console.log(`\n  총 예약: ${reservations.length}개\n`)
