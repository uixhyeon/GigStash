/**
 * 예약 시간 수정 스크립트
 *
 * 목표: 예약의 startTime/endTime을 행사 날짜 기반으로 수정
 *
 * 규칙:
 * - startTime: 행사 날짜의 09:00:00
 * - endTime: 행사 다음날의 18:00:00 (약 33시간 보관)
 */

import { events } from '../src/data/events.js'
import { reservations } from '../src/data/reservations.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../src/data')

// 행사 날짜 맵 생성
const eventDateMap = new Map(events.map((e) => [e.id, new Date(e.eventDate)]))

// 예약 시간 수정
function fixReservationTimes(reservations) {
  console.log('\n' + '='.repeat(70))
  console.log('📋 예약 시간 수정 (행사 날짜 기반)')
  console.log('='.repeat(70) + '\n')

  let fixedCount = 0
  let errorCount = 0
  const details = []

  const fixedReservations = reservations.map((reservation) => {
    const eventDate = eventDateMap.get(reservation.eventId)

    if (!eventDate) {
      console.warn(`⚠️  경고: 알 수 없는 행사 ${reservation.eventId}`)
      errorCount++
      return reservation
    }

    // startTime: 행사 날짜 09:00:00 UTC
    const startTime = new Date(eventDate)
    startTime.setHours(9, 0, 0, 0)

    // endTime: 행사 다음날 18:00:00 UTC (33시간 보관)
    const endTime = new Date(eventDate)
    endTime.setDate(endTime.getDate() + 1)
    endTime.setHours(18, 0, 0, 0)

    const oldStart = reservation.startTime
    const oldEnd = reservation.endTime
    const isChanged = oldStart !== startTime.toISOString() || oldEnd !== endTime.toISOString()

    if (isChanged) {
      fixedCount++
      if (details.length < 5) {
        details.push({
          id: reservation.id,
          eventId: reservation.eventId,
          oldStart,
          newStart: startTime.toISOString(),
          oldEnd,
          newEnd: endTime.toISOString(),
        })
      }
    }

    return {
      ...reservation,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }
  })

  // 결과 출력
  console.log(`📊 수정 결과:`)
  console.log(`   ✅ 수정됨: ${fixedCount}개`)
  console.log(`   ❌ 오류: ${errorCount}개`)
  console.log(`   📊 총계: ${fixedCount + errorCount}/${reservations.length}\n`)

  if (details.length > 0) {
    console.log(`📋 수정 예제 (처음 5개):`)
    details.forEach((detail, idx) => {
      console.log(`\n   [${idx + 1}] ${detail.id} (행사: ${detail.eventId})`)
      const oldStartDate = new Date(detail.oldStart).toLocaleString('ko-KR')
      const newStartDate = new Date(detail.newStart).toLocaleString('ko-KR')
      console.log(`       시작시간: ${oldStartDate}`)
      console.log(`            → ${newStartDate}`)
      const oldEndDate = new Date(detail.oldEnd).toLocaleString('ko-KR')
      const newEndDate = new Date(detail.newEnd).toLocaleString('ko-KR')
      console.log(`       종료시간: ${oldEndDate}`)
      console.log(`            → ${newEndDate}`)
    })
  }

  return fixedReservations
}

// 파일 저장
function saveReservations(reservations) {
  const varName = 'reservations'
  const content = `// AUTO-GENERATED FILE
// 생성 날짜: ${new Date().toISOString()}
// 설명: 예약 시간을 행사 날짜 기반으로 수정

export const ${varName} = ${JSON.stringify(reservations, null, 2)}
`

  const filepath = path.join(dataDir, 'reservations.js')
  fs.writeFileSync(filepath, content)
  console.log(`\n✅ 저장 완료: ${filepath}\n`)
}

// 메인 실행
function main() {
  try {
    console.log('\n🚀 예약 시간 수정 시작\n')

    // 1. 예약 시간 수정
    const fixedReservations = fixReservationTimes(reservations)

    // 2. 파일 저장
    saveReservations(fixedReservations)

    console.log('✅ 예약 시간 수정 완료!')
    console.log('\n다음 단계:')
    console.log('  npm run data:validate    # 데이터 검증')
    console.log('  npm run data:test        # 자동 테스트')
    console.log('  npm run build            # 빌드 확인\n')
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    process.exit(1)
  }
}

main()
