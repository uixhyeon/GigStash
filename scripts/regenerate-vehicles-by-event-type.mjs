import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 데이터 로드
import { events } from '../src/data/events.js'

console.log('🚀 행사 유형별 배차 데이터 생성 시작...\n')

// 행사 유형별 배차 기준
const vehicleAllocationByType = {
  '아이돌': { min: 4, max: 6, buses: '버스', vans: '중형차' },        // 콘서트 4대 이상
  '스포츠': { min: 1, max: 2, buses: '버스', vans: '중형차' },         // 스포츠 최소
  'E스포츠': { min: 2, max: 3, buses: '버스', vans: '중형차' },        // E스포츠 중간
  '내한공연': { min: 4, max: 5, buses: '버스', vans: '중형차' },       // 콘서트 4대 이상
  '축구': { min: 1, max: 2, buses: '버스', vans: '중형차' },           // 스포츠 최소
}

const driverNames = [
  '김운전', '이운전', '박운전', '최운전', '정운전',
  '강운전', '윤운전', '임운전', '한운전', '오운전',
  '신운전', '조운전', '홍운전', '전운전', '남운전',
  '안운전', '배운전', '서운전', '양운전', '허운전'
]

const plateNumbers = [
  '서울12가1234', '서울12가1235', '서울12가2001', '서울12가2002',
  '경기12가1001', '경기12가1002', '경기12가1003', '경기12가2001', '경기12가2002', '경기12가2003',
  '인천12가1001', '인천12가1002', '부산12가1001', '부산12가1002',
  '대구12가1001', '대전12가1001', '광주12가1001', '울산12가1001', '세종12가1001', '강원12가1001'
]

// 행사 유형 추출 및 배차 수 결정
const eventVehicleAllocation = events.map(event => {
  let eventType = event.eventType

  // 축구와 스포츠 구분
  if (event.eventName.includes('축구')) {
    eventType = '축구'
  }

  // 배차 기준 가져오기
  const allocation = vehicleAllocationByType[eventType] || { min: 1, max: 2, buses: '버스', vans: '중형차' }

  // 배차 대수 결정 (최소값에서 시작, 일부는 최대값까지)
  let vehicleCount = allocation.min
  if (Math.random() < 0.3) {  // 30% 확률로 더 많은 배차
    vehicleCount = Math.floor(Math.random() * (allocation.max - allocation.min + 1)) + allocation.min
  }

  return {
    eventId: event.id,
    eventName: event.eventName,
    eventType: eventType,
    vehicleCount: vehicleCount,
    allocation: allocation
  }
})

console.log('📊 행사 유형별 배차 계획:')
console.log('\n상위 15개 행사:')
eventVehicleAllocation.slice(0, 15).forEach(e => {
  console.log('  ' + e.eventId + ': ' + e.vehicleCount + '대 (' + e.eventType + ') - ' + e.eventName)
})

// 차량 생성
let vehicleId = 1
const vehicles = []

eventVehicleAllocation.forEach((allocation, idx) => {
  for (let i = 0; i < allocation.vehicleCount; i++) {
    // 버스와 중형차 섞기 (대부분 버스)
    const isBus = Math.random() < 0.7
    const vehicleType = isBus ? allocation.allocation.buses : allocation.allocation.vans
    const capacity = isBus ? (Math.random() < 0.5 ? 50 : 55) : 35

    const vehicle = {
      id: 'VEH-' + vehicleId.toString().padStart(3, '0'),
      eventId: allocation.eventId,
      vehicleType: vehicleType,
      capacity: capacity,
      plateNumber: plateNumbers[vehicleId % plateNumbers.length],
      driver: driverNames[vehicleId % driverNames.length],
      status: '완료'
    }

    vehicles.push(vehicle)
    vehicleId++
  }
})

console.log('\n✅ 차량 생성 완료')
console.log('  총 차량 수: ' + vehicles.length + '대')

// 행사별 배차 통계
const vehiclesByEvent = {}
vehicles.forEach(v => {
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

const jsContent = comment + '\nexport const vehicles = ' + JSON.stringify(vehicles, null, 2) + '\n\nexport default {\n  vehicles\n}\n'

const outputPath = path.join(__dirname, '../src/data/vehicles.js')
fs.writeFileSync(outputPath, jsContent, 'utf8')

console.log('\n💾 데이터 저장 완료')
console.log('  파일: vehicles.js')
console.log('  배차 규칙:')
console.log('    - 아이돌/내한공연: 4~6대 (콘서트는 대규모)')
console.log('    - E스포츠: 2~3대')
console.log('    - 스포츠/축구: 1~2대 (최소 배차)')

console.log('\n✨ 행사 규모 기반 배차 데이터 생성 완료!')
