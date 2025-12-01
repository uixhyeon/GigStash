import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore'

// Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyDZMwpE-vd_Cdknrnb5VN27krjRDwiknkk',
  authDomain: 'gigstash-91197.firebaseapp.com',
  projectId: 'gigstash-91197',
  storageBucket: 'gigstash-91197.firebasestorage.app',
  messagingSenderId: '512678869188',
  appId: '1:512678869188:web:a8e9ea80667d7dbebcb191'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Firebase 예약 상태 정규화
 * 'confirmed' 상태를 'waiting' 상태로 변환
 */
async function fixReservationStatuses() {
  console.log('\n🔧 예약 상태 정규화 시작...\n')

  try {
    // 'confirmed' 상태인 모든 예약 조회
    const q = query(
      collection(db, 'reservations'),
      where('status', '==', 'confirmed')
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      console.log('ℹ️  정규화할 예약이 없습니다. (confirmed 상태 없음)')
      return
    }

    console.log(`📊 정규화 대상: ${snapshot.size}개 예약`)
    console.log(`   상태: 'confirmed' → 'waiting' 변환\n`)

    // 배치로 업데이트
    const totalBatches = Math.ceil(snapshot.size / 500)
    let updatedCount = 0

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batch = writeBatch(db)
      const docs = snapshot.docs.slice(batchIndex * 500, (batchIndex + 1) * 500)

      for (const doc of docs) {
        const docRef = doc.ref
        batch.update(docRef, {
          status: 'waiting',
          updatedAt: new Date().toISOString()
        })
        updatedCount++
      }

      await batch.commit()
      const progress = ((batchIndex + 1) / totalBatches * 100).toFixed(1)
      console.log(`✅ 배치 ${batchIndex + 1}/${totalBatches} 완료 (${updatedCount}/${snapshot.size}) [${progress}%]`)
    }

    console.log(`\n✨ 상태 정규화 완료!`)
    console.log(`📈 업데이트된 예약 수: ${updatedCount}개\n`)

    // 정규화 후 통계 출력
    await printStats()

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

/**
 * 예약 상태별 통계 출력
 */
async function printStats() {
  console.log('📋 현재 상태별 예약 통계:\n')

  const statuses = ['pending', 'waiting', 'active', 'completed', 'cancelled']
  const stats = {}

  for (const status of statuses) {
    const q = query(
      collection(db, 'reservations'),
      where('status', '==', status)
    )
    const snapshot = await getDocs(q)
    stats[status] = snapshot.size
  }

  const total = Object.values(stats).reduce((a, b) => a + b, 0)

  console.log(`   pending   (예정):   ${stats.pending}개`)
  console.log(`   waiting   (대기):   ${stats.waiting}개`)
  console.log(`   active    (활성):   ${stats.active}개`)
  console.log(`   completed (완료):   ${stats.completed}개`)
  console.log(`   cancelled (취소):   ${stats.cancelled}개`)
  console.log(`   ─────────────────────`)
  console.log(`   총 예약:            ${total}개\n`)

  // 경고: 'confirmed' 상태 남아있는지 확인
  const confirmedQ = query(
    collection(db, 'reservations'),
    where('status', '==', 'confirmed')
  )
  const confirmedSnapshot = await getDocs(confirmedQ)

  if (confirmedSnapshot.size > 0) {
    console.log(`⚠️  주의: 아직도 'confirmed' 상태 예약이 ${confirmedSnapshot.size}개 있습니다!`)
  } else {
    console.log(`✅ 'confirmed' 상태 예약은 모두 정규화되었습니다.`)
  }

  console.log()
}

// 메인 실행
fixReservationStatuses()
