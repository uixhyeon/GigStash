import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { reservations } from '../src/data/reservations.js'
import { events } from '../src/data/events.js'

console.log('🔧 예약 건수에 따른 최종 배차 재계산...\n')

// 행사별 예약 건수 계산
const resCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in resCountByEvent)) {
    resCountByEvent[r.eventId] = 0
  }
  resCountByEvent[r.eventId]++
})

// 배차 대수 결정: 예약 건수 ÷ 50 = 올림
const vehicleCountByEvent = {}
events.forEach(event => {
  const resCount = resCountByEvent[event.id] || 0
  const busCount = Math.max(1, Math.ceil(resCount / 50))
  vehicleCountByEvent[event.id] = busCount
})

console.log('🚗 배차 계산 규칙: 예약 건수 ÷ 50 = 배차 대수 (올림)\n')

const driverNames = [
  '김운전', '이운전', '박운전', '최운전', '정운전',
  '강운전', '윤운전', '임운전', '한운전', '오운전',
  '신운전', '조운전', '홍운전', '전운전', '남운전',
  '안운전', '배운전', '서운전', '양운전', '허운전',
  '류운전', '마운전', '노운전', '도운전', '로운전'
]

const plateNumbers = [
  '서울12가1234', '서울12가1235', '서울12가2001', '서울12가2002', '서울12가2003',
  '경기12가1001', '경기12가1002', '경기12가1003', '경기12가2001', '경기12가2002', '경기12가2003',
  '인천12가1001', '인천12가1002', '인천12가1003', '부산12가1001', '부산12가1002',
  '대구12가1001', '대전12가1001', '대전12가1002', '광주12가1001', '울산12가1001',
  '세종12가1001', '강원12가1001', '충청12가1001', '전북12가1001', '전남12가1001'
]

// 새로운 vehicles 데이터 생성
let vehicleId = 1
const newVehicles = []

// 행사별로 필요한 배차 대수만큼 차량 생성
events.forEach(event => {
  const busCount = vehicleCountByEvent[event.id]

  for (let i = 0; i < busCount; i++) {
    // 버스와 중형차 섞기 (대부분 버스)
    const isBus = Math.random() < 0.7
    const vehicleType = isBus ? '버스' : '중형차'
    const capacity = isBus ? (Math.random() < 0.5 ? 50 : 55) : 35

    const vehicle = {
      id: 'VEH-' + vehicleId.toString().padStart(3, '0'),
      eventId: event.id,
      vehicleType: vehicleType,
      capacity: capacity,
      plateNumber: plateNumbers[vehicleId % plateNumbers.length],
      driver: driverNames[vehicleId % driverNames.length],
      status: '완료'
    }

    newVehicles.push(vehicle)
    vehicleId++
  }
})

console.log('✅ 차량 생성 완료')
console.log('  총 차량 수: ' + newVehicles.length + '대')

// 배차 대수별 통계
const vehiclesByEvent = {}
newVehicles.forEach(v => {
  if (!(v.eventId in vehiclesByEvent)) {
    vehiclesByEvent[v.eventId] = 0
  }
  vehiclesByEvent[v.eventId]++
})

console.log('\n📊 배차 대수별 행사 분포:')
const distributionByBusCount = {}
events.forEach(event => {
  const busCount = vehicleCountByEvent[event.id]
  if (!(busCount in distributionByBusCount)) {
    distributionByBusCount[busCount] = { events: 0, reservations: 0 }
  }
  distributionByBusCount[busCount].events++
  distributionByBusCount[busCount].reservations += resCountByEvent[event.id] || 0
})

Object.entries(distributionByBusCount)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([busCount, data]) => {
    console.log('  배차 ' + busCount + '대: ' + data.events + '개 행사 (' + data.reservations + '예약)')
  })

console.log('\n🔍 행사별 예약-배차 매핑 (상위 15개):')
events.slice(0, 15).forEach(event => {
  const resCount = resCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id]
  const calculatedBus = Math.max(1, Math.ceil(resCount / 50))
  const maxCap = busCount * 50
  console.log('  ' + event.id + ': ' + resCount + '건 → 배차 ' + busCount + '대 (최대 ' + maxCap + '건)')
})

// JS 파일로 저장
const comment = `// 차량 데이터
// id(차량ID)
// eventId(연결된 행사ID)
// vehicleType(차량종류)
// capacity(정원)
// plateNumber(번호판)
// driver(운전자)
// status(상태)
`

const jsContent = comment + '\nexport const vehicles = ' + JSON.stringify(newVehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'

const outputPath = path.join(__dirname, '../src/data/vehicles.js')
fs.writeFileSync(outputPath, jsContent, 'utf8')

console.log('\n💾 데이터 저장 완료')
console.log('  파일: vehicles.js')

console.log('\n✨ 최종 배차 재계산 완료!')
console.log('  배차 규칙: ceil(예약 건수 ÷ 50) = 배차 대수')
