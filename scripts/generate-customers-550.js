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

// 한국 이름 데이터
const firstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '구', '기', '노', '도', '라', '마']
const lastNames = ['준호', '민준', '성욱', '지훈', '재현', '현준', '민수', '승환', '동욱', '정우', '준영', '기준', '종민', '예진', '유정', '민정', '소영', '지영', '하영', '은정']

// 이메일 도메인
const emailDomains = ['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'outlook.com', 'yahoo.com']

// 멤버십 레벨
const membershipLevels = ['bronze', 'silver', 'gold', 'platinum']

// 상태
const statuses = ['active', 'inactive', 'suspended']

// 전화번호 생성 (010-XXXX-XXXX 형식)
const generatePhone = () => {
  const middle = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  const last = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `010-${middle}-${last}`
}

// 한국 이름 생성
const generateName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return first + last
}

// 이메일 생성
const generateEmail = (name) => {
  const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
  const randomSuffix = Math.floor(Math.random() * 10000)
  return `${name.toLowerCase()}${randomSuffix}@${domain}`
}

// 고객 생성
const generateCustomer = (id) => {
  const name = generateName()
  const registeredDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)

  return {
    id: `CUST-${String(id).padStart(6, '0')}`,
    name,
    email: generateEmail(name),
    phone: generatePhone(),
    membershipLevel: membershipLevels[Math.floor(Math.random() * membershipLevels.length)],
    registeredAt: registeredDate.toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    totalReservations: Math.floor(Math.random() * 20) + 1,
    totalSpent: Math.floor(Math.random() * 5000000) + 100000,
    notes: '',
  }
}

// Firebase에 배치로 업로드
async function uploadCustomers(customers) {
  const totalBatches = Math.ceil(customers.length / 500)
  let uploadedCount = 0

  console.log(`\n📦 Firebase에 ${customers.length}명의 고객 업로드 시작...`)
  console.log(`⏳ 총 ${totalBatches}개 배치로 분할 업로드\n`)

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batch = writeBatch(db)
    const startIndex = batchIndex * 500
    const endIndex = Math.min(startIndex + 500, customers.length)
    const batchCustomers = customers.slice(startIndex, endIndex)

    for (const customer of batchCustomers) {
      const docRef = doc(collection(db, 'customers'), customer.id)
      batch.set(docRef, customer)
      uploadedCount++
    }

    await batch.commit()
    const progress = ((batchIndex + 1) / totalBatches * 100).toFixed(1)
    console.log(`✅ 배치 ${batchIndex + 1}/${totalBatches} 완료 (${uploadedCount}/${customers.length}) [${progress}%]`)
  }

  return uploadedCount
}

// 메인 실행
async function main() {
  try {
    console.log('\n🚀 고객 데이터 생성 및 Firebase 업로드\n')
    console.log('📊 생성 설정:')
    console.log('   - 생성할 고객 수: 550명')
    console.log('   - ID 형식: CUST-000001 ~ CUST-000550')
    console.log('   - 기존 고객(15명)과 합쳐서 총 565명이 됩니다\n')

    // 고객 데이터 생성
    const customers = []
    for (let i = 1; i <= 550; i++) {
      customers.push(generateCustomer(i))
    }

    console.log('✨ 550명의 고객 데이터 생성 완료!\n')

    // 샘플 데이터 표시
    console.log('📋 샘플 데이터 (처음 3명):')
    customers.slice(0, 3).forEach((customer, index) => {
      console.log(`\n   [${index + 1}] ${customer.id}`)
      console.log(`      이름: ${customer.name}`)
      console.log(`      이메일: ${customer.email}`)
      console.log(`      휴대폰: ${customer.phone}`)
      console.log(`      멤버십: ${customer.membershipLevel}`)
      console.log(`      가입일: ${customer.registeredAt.split('T')[0]}`)
    })

    console.log('\n')

    // Firebase에 업로드
    const uploadedCount = await uploadCustomers(customers)

    console.log(`\n✅ 업로드 완료!`)
    console.log(`📊 업로드된 고객 수: ${uploadedCount}명`)
    console.log(`💾 Firebase customers 컬렉션 총 레코드 수: 약 565명 (기존 15명 + 신규 550명)\n`)

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
