import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 현재 데이터 로드
import { events as oldEvents } from '../src/data/events.js'

console.log('🔄 events.js에서 vehicleCount, expectedAttendance 삭제...\n')

// =====================================================
// Step 1: vehicleCount, expectedAttendance 제거
// =====================================================
console.log('📌 Step 1: 컬럼 제거')

const cleanedEvents = oldEvents.map(event => {
  const { vehicleCount, expectedAttendance, ...rest } = event
  return rest
})

console.log(`✅ ${oldEvents.length}개 이벤트에서 컬럼 제거 완료`)

// =====================================================
// Step 2: 파일 저장
// =====================================================
console.log('\n💾 Step 2: 파일 저장')

const eventComment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// createdAt(생성시간)
//
// ✅ vehicleCount: vehicles.js에서 eventId로 조인해서 갖고 올 것
// ✅ expectedAttendance: vehicleCount와 UI에서 동적 계산 (vehicleCount * 50)
`

const eventJsContent = eventComment + '\nexport const events = ' + JSON.stringify(cleanedEvents, null, 2) + '\n\nexport default {\n  events\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/events.js'), eventJsContent, 'utf8')

console.log(`  ✅ events.js (${cleanedEvents.length}개 행사)`)

// =====================================================
// Step 3: 최종 확인
// =====================================================
console.log('\n📊 Step 3: 확인')

console.log('\n삭제된 행사 샘플 (첫 번째 이벤트):')
if (cleanedEvents.length > 0) {
  console.log(JSON.stringify(cleanedEvents[0], null, 2))
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`✅ 총 ${oldEvents.length}개 행사 처리 완료`)

console.log('\n✨ 삭제 완료!')
console.log('\n📌 다음 단계:')
console.log('  1. UI에서 vehicles.js와 조인해서 배차 정보 표시')
console.log('  2. eventId로 필터링해서 busCount 계산')
console.log('  3. expectedAttendance = busCount * 50으로 동적 계산')
