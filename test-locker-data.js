import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

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

async function checkLockerData() {
  try {
    console.log('\n🔍 Firebase Locker 데이터 확인\n')
    
    const snapshot = await getDocs(collection(db, 'lockers'))
    
    console.log(`📊 총 locker 문서 수: ${snapshot.size}개\n`)
    
    if (snapshot.size === 0) {
      console.log('❌ locker 데이터가 없습니다!')
      return
    }
    
    // 상태별 통계
    const stats = {
      available: 0,
      'in-use': 0,
      maintenance: 0,
      broken: 0,
      unknown: 0
    }
    
    snapshot.docs.forEach(doc => {
      const locker = doc.data()
      const status = locker.status || 'unknown'
      stats[status] = (stats[status] || 0) + 1
    })
    
    console.log('📈 상태별 분포:')
    console.log(`   available  : ${stats.available}`)
    console.log(`   in-use     : ${stats['in-use']}`)
    console.log(`   maintenance: ${stats.maintenance}`)
    console.log(`   broken     : ${stats.broken}`)
    console.log(`   unknown    : ${stats.unknown}\n`)
    
    // 샘플 데이터
    console.log('📋 샘플 데이터 (처음 3개):')
    snapshot.docs.slice(0, 3).forEach((doc, i) => {
      const locker = doc.data()
      console.log(`\n[${i+1}] ID: ${doc.id}`)
      console.log(`   vehicleId: ${locker.vehicleId}`)
      console.log(`   status: ${locker.status}`)
      console.log(`   size: ${locker.size}`)
    })
    
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }
  
  process.exit(0)
}

checkLockerData()
