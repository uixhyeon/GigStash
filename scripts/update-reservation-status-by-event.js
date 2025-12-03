/**
 * 예약 상태 업데이트 스크립트 (이벤트 상태 기반)
 *
 * 목표: 이벤트 상태에 따라 예약 상태를 자동으로 할당
 * 규칙:
 * - 과거 이벤트 (완료): 예약 상태 → completed
 * - 취소된 이벤트: 예약 상태 → cancelled
 * - 현재/미래 이벤트: 예약 상태 유지 (active, waiting 등)
 */

import { events } from '../src/data/events.js'
import { reservations as oldReservations } from '../src/data/reservations.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

console.log('\n🚀 예약 상태 업데이트 (이벤트 상태 기반)\n')
console.log('='.repeat(70))

// 오늘 날짜
const today = new Date()
today.setHours(0, 0, 0, 0)

// 이벤트 맵 생성 (이벤트 ID → 이벤트 정보)
const eventMap = new Map(events.map(e => [e.id, e]))

console.log(`\n📅 기준 날짜: ${today.toISOString().split('T')[0]}\n`)

// 이벤트 상태별 분류
const eventsByStatus = {
  completed: [],
  cancelled: [],
  other: [],
}

events.forEach(e => {
  const eventDate = new Date(e.eventDate)
  if (e.status === '취소') {
    eventsByStatus.cancelled.push(e)
  } else if (eventDate < today) {
    eventsByStatus.completed.push(e)
  } else {
    eventsByStatus.other.push(e)
  }
})

console.log(`📊 이벤트 분류:`)
console.log(`  완료 (과거): ${eventsByStatus.completed.length}개`)
console.log(`  취소: ${eventsByStatus.cancelled.length}개`)
console.log(`  진행/미래: ${eventsByStatus.other.length}개\n`)

// 예약 상태 업데이트
const completedEventIds = new Set(eventsByStatus.completed.map(e => e.id))
const cancelledEventIds = new Set(eventsByStatus.cancelled.map(e => e.id))

let completedCount = 0
let cancelledCount = 0
let unchangedCount = 0

const newReservations = oldReservations.map(r => {
  // 취소된 이벤트의 예약
  if (cancelledEventIds.has(r.eventId)) {
    if (r.status !== 'cancelled') {
      cancelledCount++
      return { ...r, status: 'cancelled' }
    }
    unchangedCount++
    return r
  }

  // 과거 이벤트의 예약
  if (completedEventIds.has(r.eventId)) {
    if (r.status !== 'completed') {
      completedCount++
      return { ...r, status: 'completed' }
    }
    unchangedCount++
    return r
  }

  // 현재/미래 이벤트의 예약 (유지)
  unchangedCount++
  return r
})

console.log(`📝 상태 변경:`)
console.log(`  → completed (과거 이벤트): ${completedCount}건`)
console.log(`  → cancelled (취소된 이벤트): ${cancelledCount}건`)
console.log(`  → 유지 (현재/미래): ${unchangedCount}건\n`)

// 최종 상태 확인
const finalStatusCount = new Map()
newReservations.forEach(r => {
  finalStatusCount.set(r.status, (finalStatusCount.get(r.status) || 0) + 1)
})

console.log(`✅ 최종 상태 분포:`)
finalStatusCount.forEach((count, status) => {
  const percentage = ((count / newReservations.length) * 100).toFixed(2)
  console.log(`  ${status.padEnd(12)}: ${count.toString().padStart(5)}개 (${percentage}%)`)
})

// 파일 저장
function saveReservations(reservations) {
  const varName = 'reservations'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 이벤트 상태 기반 예약 상태 업데이트

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
