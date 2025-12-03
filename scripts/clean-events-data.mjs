import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'

console.log('🔧 events.js 정리 시작...\n')

// 불필요한 필드 제거
const cleanedEvents = events.map(event => {
  const cleaned = {
    id: event.id,
    createdAt: event.createdAt,
    eventName: event.eventName,
    eventDate: event.eventDate,
    eventVenue: event.eventVenue,
    eventType: event.eventType,
    status: event.status,
    performanceTime: event.performanceTime
  }
  return cleaned
})

// JS 파일로 저장
const comment = `// 행사 데이터
// id(행사ID)
// eventName(행사명)
// eventDate(날짜)
// eventVenue(장소)
// eventType(종류)
// status(상태)
// performanceTime(시간)
// createdAt(생성시간)
`

const jsContent = comment + '\nexport const events = ' + JSON.stringify(cleanedEvents, null, 2) + '\n\nexport default {\n  events\n}\n'

const outputPath = path.join(__dirname, '../src/data/events.js')
fs.writeFileSync(outputPath, jsContent, 'utf8')

console.log('✅ 완료!')
console.log('  파일: events.js')
console.log('  제거된 필드: itemType, itemSize, quantity, deliveryType, deliveryAddress, deliveryRegion, deliveryCity, paymentMethod, totalPrice, runningTime, attendance')
console.log('  남은 필드: id, createdAt, eventName, eventDate, eventVenue, eventType, status, performanceTime')
