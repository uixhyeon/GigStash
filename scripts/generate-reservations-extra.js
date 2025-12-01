import { initializeApp } from 'firebase/app'
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore'

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

// 상태 (UI의 statusMap과 일치하도록 정규화)
const statuses = ['pending', 'waiting', 'active', 'completed', 'cancelled']

// 예약 생성
const generateReservation = (id, baseId) => {
  // 현재 날짜 기준으로 시작 시간 생성 (과거 ~ 미래)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + (Math.random() * 60 - 30)) // -30일 ~ +30일
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  startDate.setHours(hour, minute, 0, 0)

  // 종료 시간은 시작 시간 + 1~4시간
  const endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 4) + 1)

  const status = statuses[Math.floor(Math.random() * statuses.length)]

  return {
    id: `RES-${String(id).padStart(6, '0')}`,
    customerId: `CUST-${String(Math.floor(Math.random() * 550) + 1).padStart(6, '0')}`,
    lockerId: `VEH-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}-${['S', 'M', 'L'][Math.floor(Math.random() * 3)]}${String(Math.floor(Math.random() * 25) + 1).padStart(2, '0')}`,
    eventId: `EVT-${String(Math.floor(Math.random() * 48) + 1).padStart(3, '0')}`,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    status,
    purpose: ['짐 보관', '음식 저장', '물품 임시 보관', '개인용품 보관', '배달 수령'][Math.floor(Math.random() * 5)],
    temperature: Math.random() > 0.5 ? 4 + Math.random() * 2 : 20 + Math.random() * 5,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Firebase에 배치로 업로드
async function uploadReservations(reservations) {
  const totalBatches = Math.ceil(reservations.length / 500)
  let uploadedCount = 0

  console.log(`\n📦 Firebase에 ${reservations.length}개의 예약 업로드 시작...`)
  console.log(`⏳ 총 ${totalBatches}개 배치로 분할 업로드\n`)

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batch = writeBatch(db)
    const startIndex = batchIndex * 500
    const endIndex = Math.min(startIndex + 500, reservations.length)
    const batchReservations = reservations.slice(startIndex, endIndex)

    for (const reservation of batchReservations) {
      const docRef = doc(collection(db, 'reservations'), reservation.id)
      batch.set(docRef, reservation)
      uploadedCount++
    }

    await batch.commit()
    const progress = ((batchIndex + 1) / totalBatches * 100).toFixed(1)
    console.log(`✅ 배치 ${batchIndex + 1}/${totalBatches} 완료 (${uploadedCount}/${reservations.length}) [${progress}%]`)
  }

  return uploadedCount
}

// 메인 실행
async function main() {
  try {
    console.log('\n🚀 예약 데이터 생성 및 Firebase 업로드\n')
    console.log('📊 생성 설정:')
    console.log('   - 추가 생성할 예약 수: 300개')
    console.log('   - ID 형식: RES-000148 ~ RES-000447')
    console.log('   - 기존 예약(147개)과 합쳐서 총 447개가 됩니다\n')

    // 예약 데이터 생성 (현재 147개에 300개 추가)
    const reservations = []
    for (let i = 148; i <= 447; i++) {
      reservations.push(generateReservation(i, i))
    }

    console.log('✨ 300개의 예약 데이터 생성 완료!\n')

    // 샘플 데이터 표시
    console.log('📋 샘플 데이터 (처음 3개):')
    reservations.slice(0, 3).forEach((reservation, index) => {
      const startDate = new Date(reservation.startTime).toLocaleString('ko-KR')
      const endDate = new Date(reservation.endTime).toLocaleString('ko-KR')
      console.log(`\n   [${index + 1}] ${reservation.id}`)
      console.log(`      고객: ${reservation.customerId}`)
      console.log(`      사물함: ${reservation.lockerId}`)
      console.log(`      상태: ${reservation.status}`)
      console.log(`      시작: ${startDate}`)
      console.log(`      종료: ${endDate}`)
    })

    console.log('\n')

    // Firebase에 업로드
    const uploadedCount = await uploadReservations(reservations)

    console.log(`\n✅ 업로드 완료!`)
    console.log(`📊 업로드된 예약 수: ${uploadedCount}개`)
    console.log(`💾 Firebase reservations 컬렉션 총 레코드 수: 약 447개 (기존 147개 + 신규 300개)\n`)

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
