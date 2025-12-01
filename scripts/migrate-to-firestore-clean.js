/**
 * Firebase에 모든 데이터를 깨끗하게 마이그레이션하는 스크립트
 *
 * 사용법:
 * node scripts/migrate-to-firestore-clean.js
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  writeBatch,
  doc,
  getDocs,
  query,
  deleteDoc
} from 'firebase/firestore'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dataDir = join(__dirname, '../src/data')

// 컬렉션별 JSON 파일 매핑
const collections = [
  { name: 'lockers', file: 'lockers.json', key: 'lockers' },
  { name: 'vehicles', file: 'vehicles.json', key: 'vehicles' },
  { name: 'reservations', file: 'reservations.json', key: 'reservations' },
  { name: 'customers', file: 'customers.json', key: 'customers' },
  { name: 'events', file: 'events.json', key: 'events' }
]

/**
 * JSON 파일에서 데이터 읽기
 */
function loadJsonData(filename) {
  try {
    const filepath = join(dataDir, filename)
    const data = readFileSync(filepath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`❌ 파일을 읽을 수 없습니다: ${filename}`)
    console.error(error.message)
    return null
  }
}

/**
 * 컬렉션의 모든 문서 삭제
 */
async function deleteCollection(collectionName) {
  try {
    const q = query(collection(db, collectionName))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return 0
    }

    const batch = writeBatch(db)
    let deletedCount = 0

    snapshot.docs.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref)
      deletedCount++
    })

    await batch.commit()
    return deletedCount
  } catch (error) {
    console.error(`컬렉션 삭제 중 오류: ${error.message}`)
    return 0
  }
}

/**
 * 배치로 데이터 업로드 (최대 500개씩)
 */
async function uploadBatch(collectionName, items) {
  const totalBatches = Math.ceil(items.length / 500)
  let uploadedCount = 0

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batch = writeBatch(db)
    const startIndex = batchIndex * 500
    const endIndex = Math.min(startIndex + 500, items.length)
    const batchItems = items.slice(startIndex, endIndex)

    for (const item of batchItems) {
      // ID로 문서 참조 생성
      const docId = item.id || item.number || `doc_${Date.now()}_${Math.random()}`
      batch.set(doc(collection(db, collectionName), docId), item)
      uploadedCount++
    }

    try {
      await batch.commit()
      console.log(`  ✓ ${collectionName}: 배치 ${batchIndex + 1}/${totalBatches} 완료 (${uploadedCount}/${items.length})`)
    } catch (error) {
      console.error(`  ❌ 배치 업로드 실패: ${error.message}`)
      throw error
    }
  }

  return uploadedCount
}

/**
 * 메인 마이그레이션 함수
 */
async function migrateDataClean() {
  console.log('🚀 Firestore 깨끗한 마이그레이션 시작\n')
  console.log('=' * 60)

  let totalCount = 0
  const results = []

  for (const config of collections) {
    console.log(`\n📦 ${config.name} 마이그레이션 중...`)

    // 기존 데이터 삭제
    console.log(`🗑️  기존 문서 삭제 중...`)
    const deletedCount = await deleteCollection(config.name)
    if (deletedCount > 0) {
      console.log(`   삭제됨: ${deletedCount}개`)
    }

    // JSON 데이터 로드
    const jsonData = loadJsonData(config.file)
    if (!jsonData) {
      console.log(`❌ ${config.name}: 데이터 로드 실패\n`)
      results.push({ collection: config.name, status: '실패', count: 0 })
      continue
    }

    // 데이터 배열 추출
    const items = jsonData[config.key] || jsonData
    if (!Array.isArray(items)) {
      console.log(`❌ ${config.name}: 배열 형식이 아닙니다\n`)
      results.push({ collection: config.name, status: '실패', count: 0 })
      continue
    }

    // Firestore에 업로드
    try {
      const uploadedCount = await uploadBatch(config.name, items)
      totalCount += uploadedCount
      results.push({
        collection: config.name,
        status: '성공',
        count: uploadedCount,
        total: items.length
      })
      console.log(`✅ ${config.name}: ${uploadedCount}개 업로드 완료\n`)
    } catch (error) {
      console.error(`❌ ${config.name}: 업로드 실패 - ${error.message}\n`)
      results.push({ collection: config.name, status: '실패', count: 0 })
    }
  }

  // 결과 요약
  console.log('=' * 60)
  console.log('\n📊 마이그레이션 결과 요약\n')

  for (const result of results) {
    const status = result.status === '성공' ? '✅' : '❌'
    const info = result.status === '성공' ? `${result.count}/${result.total}개` : '실패'
    console.log(`${status} ${result.collection.padEnd(15)} : ${info}`)
  }

  console.log(`\n📈 총 업로드된 문서: ${totalCount}개`)
  console.log('\n✨ 깨끗한 마이그레이션 완료!')
  console.log('\n💾 모든 데이터가 Firebase에 저장되었습니다.')
}

// 마이그레이션 실행
migrateDataClean().catch((error) => {
  console.error('❌ 마이그레이션 중 오류 발생:')
  console.error(error)
  process.exit(1)
})
