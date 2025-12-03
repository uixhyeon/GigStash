import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { reservations } from '../src/data/reservations.js'
import { vehicles as oldVehicles } from '../src/data/vehicles.js'
import { events } from '../src/data/events.js'

console.log('🔧 예약 건수에 따른 배차 수 재계산 시작...\n')

// 행사별 예약 건수 계산
const reservationCountByEvent = {}
reservations.forEach(r => {
  if (!(r.eventId in reservationCountByEvent)) {
    reservationCountByEvent[r.eventId] = 0
  }
  reservationCountByEvent[r.eventId]++
})

console.log('📊 예약 건수 기반 배차 계산:')
console.log('  계산 규칙: 예약 건수 ÷ 50 = 배차 대수 (올림)')
console.log('  예: 50건 → 1대, 100건 → 2대, 150건 → 3대, 180건 → 4대\n')

// 행사별 필요한 배차 대수 계산
const vehicleCountByEvent = {}
events.forEach(event => {
  const resCount = reservationCountByEvent[event.id] || 0
  // 예약 건수 ÷ 50을 올림하여 배차 대수 결정
  const busCount = Math.ceil(resCount / 50)
  vehicleCountByEvent[event.id] = busCount
})

console.log('행사별 예약 건수 및 배차 대수 (상위 15개):')
events.slice(0, 15).forEach(event => {
  const resCount = reservationCountByEvent[event.id] || 0
  const busCount = vehicleCountByEvent[event.id]
  console.log('  ' + event.id + ': 예약 ' + resCount + '건 → 배차 ' + busCount + '대')
})

// 배차 유형 결정 (같은 수의 배차를 가진 다른 행사는 다른 차량 배정)
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

console.log('\n✅ 차량 생성 완료')
console.log('  총 차량 수: ' + newVehicles.length + '대')

// 배차 대수별 통계
const vehiclesByEvent = {}
newVehicles.forEach(v => {
  if (!(v.eventId in vehiclesByEvent)) {
    vehiclesByEvent[v.eventId] = 0
  }
  vehiclesByEvent[v.eventId]++
})

const counts = Object.values(vehiclesByEvent)
console.log('\n📈 배차 통계:')
console.log('  최소: ' + Math.min(...counts) + '대')
console.log('  최대: ' + Math.max(...counts) + '대')
console.log('  평균: ' + (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2) + '대')

// 배차 대수별 분포
console.log('\n배차 대수별 행사 분포:')
const distributionByBusCount = {}
events.forEach(event => {
  const busCount = vehicleCountByEvent[event.id]
  if (!(busCount in distributionByBusCount)) {
    distributionByBusCount[busCount] = 0
  }
  distributionByBusCount[busCount]++
})

Object.entries(distributionByBusCount)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([busCount, eventCount]) => {
    console.log('  배차 ' + busCount + '대: ' + eventCount + '개 행사')
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

console.log('\n✨ 예약 건수 기반 배차 재계산 완료!')
console.log('  배차 규칙: 예약 건수 ÷ 50 = 배차 대수')
