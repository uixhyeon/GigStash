import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 예약과 사물함 데이터를 정규화합니다
 * 예약 상태: 약 50% active(사용중), 30% completed(사용완료), 20% pending/waiting
 * 사물함 상태: 약 65% active(사용중), 20% maintenance(정비중), 15% broken(고장)
 */

const reservationsPath = path.join(__dirname, '../src/data/reservations.json')
const lockersPath = path.join(__dirname, '../src/data/lockers.json')

// 예약 데이터 정규화
function normalizeReservations() {
  console.log('\n📦 예약 데이터 정규화 시작...')

  const data = JSON.parse(fs.readFileSync(reservationsPath, 'utf8'))
  const reservations = data.reservations

  const total = reservations.length
  const activeCount = Math.floor(total * 0.5)      // 50%
  const completedCount = Math.floor(total * 0.3)   // 30%
  const pendingCount = total - activeCount - completedCount // 20%

  // 상태 분포 설정
  reservations.forEach((res, idx) => {
    if (idx < activeCount) {
      res.status = 'active'
    } else if (idx < activeCount + completedCount) {
      res.status = 'completed'
      res.completedAt = new Date().toISOString()
    } else {
      res.status = idx % 2 === 0 ? 'pending' : 'waiting'
    }
  })

  fs.writeFileSync(reservationsPath, JSON.stringify(data, null, 2), 'utf8')

  console.log(`✅ 예약 상태 분포:`)
  console.log(`   - active (사용중): ${activeCount}개 (${(activeCount/total*100).toFixed(1)}%)`)
  console.log(`   - completed (사용완료): ${completedCount}개 (${(completedCount/total*100).toFixed(1)}%)`)
  console.log(`   - pending/waiting: ${pendingCount}개 (${(pendingCount/total*100).toFixed(1)}%)`)
  console.log(`   총 예약: ${total}개\n`)
}

// 사물함 데이터 정규화
function normalizeLockers() {
  console.log('📦 사물함 데이터 정규화 시작...')

  const data = JSON.parse(fs.readFileSync(lockersPath, 'utf8'))
  const lockers = data.lockers

  const total = lockers.length
  const activeCount = Math.floor(total * 0.65)      // 65%
  const maintenanceCount = Math.floor(total * 0.20) // 20%
  const brokenCount = total - activeCount - maintenanceCount // 15%

  // 상태 분포 설정
  lockers.forEach((locker, idx) => {
    if (idx < activeCount) {
      locker.status = 'active'
    } else if (idx < activeCount + maintenanceCount) {
      locker.status = 'maintenance'
    } else {
      locker.status = 'broken'
    }
  })

  fs.writeFileSync(lockersPath, JSON.stringify(data, null, 2), 'utf8')

  console.log(`✅ 사물함 상태 분포:`)
  console.log(`   - active (사용중): ${activeCount}개 (${(activeCount/total*100).toFixed(1)}%)`)
  console.log(`   - maintenance (정비중): ${maintenanceCount}개 (${(maintenanceCount/total*100).toFixed(1)}%)`)
  console.log(`   - broken (고장): ${brokenCount}개 (${(brokenCount/total*100).toFixed(1)}%)`)
  console.log(`   총 사물함: ${total}개\n`)
}

// 메인 실행
try {
  console.log('\n🚀 데이터 정규화 시작\n')
  normalizeReservations()
  normalizeLockers()
  console.log('✨ 모든 데이터 정규화 완료!\n')
} catch (error) {
  console.error('❌ 에러 발생:', error)
  process.exit(1)
}
