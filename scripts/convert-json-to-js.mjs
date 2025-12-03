import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const files = [
  {
    json: '../src/data/reservations.json',
    js: '../src/data/reservations.js',
    key: 'reservations',
    comment: `/**
 * 예약 데이터
 * 컬럼: id(예약ID) | lockerId(사물함ID) | lockerNumber(사물함번호) | customerId(고객ID)
 * status(상태:pending/waiting/active/completed/cancelled) | startTime(시작) | endTime(종료)
 * itemDescription(물품설명) | createdAt(생성시간) | accessCode(접근코드) | eventId(행사ID)
 */
`
  },
  {
    json: '../src/data/lockers.json',
    js: '../src/data/lockers.js',
    key: 'lockers',
    comment: `/**
 * 사물함 데이터
 * 컬럼: id(사물함ID) | number(번호) | vehicleId(차량ID) | size(크기:small/medium/large)
 * location(위치) | position(차량내위치) | status(상태:active/maintenance/broken)
 * temperature(온도) | lastMaintenance(정비시간) | features(기능배열) | currentReservation(현예약ID)
 */
`
  },
  {
    json: '../src/data/customers.json',
    js: '../src/data/customers.js',
    key: 'customers',
    comment: `/**
 * 고객 데이터
 * 컬럼: id(고객ID) | name(이름) | email(이메일) | phone(전화번호) | company(회사명) | createdAt(가입시간)
 */
`
  },
  {
    json: '../src/data/events.json',
    js: '../src/data/events.js',
    key: 'events',
    comment: `/**
 * 행사 데이터
 * 컬럼: id(행사ID) | eventName(행사명) | eventDate(날짜) | eventVenue(장소) | eventType(종류)
 * status(상태) | performanceTime(시간) | vehicleCount(배차대수) | expectedAttendance(예상인원) | createdAt(생성시간)
 */
`
  },
  {
    json: '../src/data/vehicles.json',
    js: '../src/data/vehicles.js',
    key: 'vehicles',
    comment: `/**
 * 차량 데이터
 * 컬럼: id(차량ID) | plateNumber(번호판) | model(모델) | capacity(정원) | features(기능배열)
 */
`
  }
]

files.forEach((file) => {
  const jsonPath = path.join(__dirname, file.json)
  const jsPath = path.join(__dirname, file.js)

  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const data = jsonData[file.key]

    const jsContent = file.comment + '\nexport const ' + file.key + ' = ' + JSON.stringify(data, null, 2) + '\n\nexport default {\n  ' + file.key + '\n}\n'

    fs.writeFileSync(jsPath, jsContent, 'utf8')
    console.log('[OK] ' + file.json + ' -> ' + file.js)
  } catch (error) {
    console.log('[ERROR] ' + file.json + ': ' + error.message)
  }
})

console.log('[DONE] JSON to JS 변환 완료!')