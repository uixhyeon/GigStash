import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { events as oldEvents } from '../src/data/events.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { reservations as oldReservations } from '../src/data/reservations.js'

console.log('🧹 미매칭 행사 정리\n')

// 매칭되지 않은 eventId 찾기
const unmappedEventIds = new Set()
oldVehicles.forEach(v => {
  if (!oldEvents.find(e => e.id === v.eventId)) {
    unmappedEventIds.add(v.eventId)
  }
})

console.log(`미매칭 eventId: ${unmappedEventIds.size}개`)
unmappedEventIds.forEach(id => {
  const vehicleCount = oldVehicles.filter(v => v.eventId === id).length
  console.log(`  - ${id}: ${vehicleCount}대`)
})

// 미매칭 vehicle 제거
const newVehicles = oldVehicles.filter(v => !unmappedEventIds.has(v.eventId))

console.log(`\n✅ vehicles: ${oldVehicles.length}대 → ${newVehicles.length}대\n`)

// 파일 저장
const vehicleComment = `// 차량 데이터
// id(차량ID)
// eventId(연결된 행사ID)
// vehicleType(차량종류)
// capacity(정원)
// plateNumber(번호판)
// driver(운전자)
// status(상태)
//
// 📌 날짜가 다른 행사면 같은 차량 ID로 재사용 가능
`

const vehicleJsContent = vehicleComment + '\nexport const vehicles = ' + JSON.stringify(newVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'
fs.writeFileSync(path.join(__dirname, '../src/data/vehicles.js'), vehicleJsContent, 'utf8')

console.log('✨ 정리 완료!')
