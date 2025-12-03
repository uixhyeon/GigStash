/**
 * 과거 행사 예약 상태 업데이트 스크립트
 *
 * 목표: 이전 날짜의 행사 예약 상태를 현실적으로 업데이트
 * - 대부분(95%): 완료(completed) 상태로 변경
 * - 극히 일부(5%): 취소(cancelled) 상태로 변경
 */

import { events } from '../src/data/events.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 과거 행사 예약 상태 업데이트 시작\n')
console.log('='.repeat(70))

// 오늘 날짜
const today = new Date()
today.setHours(0, 0, 0, 0)
const todayStr = today.toISOString().split('T')[0]

console.log(`\n📅 기준 날짜: ${todayStr}\n`)

// 과거 행사 ID 집합
const pastEventIds = new Set(
  events
    .filter(e => e.eventDate < todayStr)
    .map(e => e.id)
)

console.log(`📊 현황:`)
console.log(`  과거 행사: ${pastEventIds.size}개`)

// 과거 행사의 예약 분류
const pastReservations = oldReservations.filter(r => pastEventIds.has(r.eventId))
const futureReservations = oldReservations.filter(r => !pastEventIds.has(r.eventId))

console.log(`  과거 예약: ${pastReservations.length}개`)
console.log(`  미래 예약: ${futureReservations.length}개\n`)

// 예약 상태 업데이트
const completedCount = Math.floor(pastReservations.length * 0.95)
const cancelledCount = pastReservations.length - completedCount

// 과거 예약 셔플 후 상태 변경
const shuffledPastReservations = [...pastReservations].sort(() => Math.random() - 0.5)

const updatedPastReservations = shuffledPastReservations.map((r, index) => {
  let newStatus = 'completed' // 기본: 완료
  if (index < cancelledCount) {
    newStatus = 'cancelled' // 극히 일부: 취소
  }

  return {
    ...r,
    status: newStatus
  }
})

// 새로운 예약 목록 생성 (미래 예약 + 업데이트된 과거 예약)
const newReservations = [
  ...futureReservations,
  ...updatedPastReservations
]

console.log(`📝 상태 변경:`)
console.log(`  완료(completed): ${completedCount}개 (95%)`)
console.log(`  취소(cancelled): ${cancelledCount}개 (5%)\n`)

// 검증
const statusCount = new Map()
newReservations.forEach(r => {
  statusCount.set(r.status, (statusCount.get(r.status) || 0) + 1)
})

console.log(`✅ 최종 상태:`)
statusCount.forEach((count, status) => {
  console.log(`  ${status}: ${count}개`)
})

// 파일 저장
function saveReservations(reservations) {
  const varName = 'reservations'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 과거 행사 예약 상태 업데이트 (완료/취소)

export const ${varName} = ${JSON.stringify(reservations, null, 2)}
`

  const filepath = path.join(dataDir, 'reservations.js')
  fs.writeFileSync(filepath, content)
  console.log(`\n✅ 저장 완료: ${filepath}\n`)
}

saveReservations(newReservations)

console.log('다음 단계:')
console.log('  npm run data:validate    # 데이터 검증')
console.log('  npm run data:test        # 자동 테스트')
console.log('  npm run build            # 빌드 확인\n')
