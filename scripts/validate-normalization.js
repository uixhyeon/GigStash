const fs = require('fs');

console.log('🔍 데이터 정규화 검증 시작...\n');

// 데이터 로드
const reservationsModule = require('../src/data/reservations.js');
const lockersModule = require('../src/data/lockers.js');
const eventsModule = require('../src/data/events.js');

const reservations = reservationsModule.reservations;
const lockers = lockersModule.lockers;
const events = eventsModule.events;

console.log('📊 데이터 규모:');
console.log('   reservations: ' + reservations.length);
console.log('   lockers: ' + lockers.length);
console.log('   events: ' + events.length);

// 1. locker ID 형식 검증
console.log('\n1️⃣ locker ID 형식 검증:');
const lockerIdPattern = /^LOCK-\d{4}-(SMLL|MDLM|LRGE)$/;
const validLockerIds = lockers.every(l => lockerIdPattern.test(l.id));
console.log('   형식 유효: ' + (validLockerIds ? '✅' : '❌'));
console.log('   샘플: ' + lockers[0].id + ', ' + lockers[499].id + ', ' + lockers[999].id);

// 2. reservation lockerId 형식 검증
console.log('\n2️⃣ reservation lockerId 형식 검증:');
const validReservationIds = reservations.every(r => lockerIdPattern.test(r.lockerId));
console.log('   형식 유효: ' + (validReservationIds ? '✅' : '❌'));
console.log('   샘플: ' + reservations[0].lockerId + ', ' + reservations[1000].lockerId);

// 3. 조인 가능성 검증
console.log('\n3️⃣ 조인 가능성 검증 (locker.id와 reservation.lockerId):');
const lockerIdSet = new Set(lockers.map(l => l.id));
const resLockerIds = new Set(reservations.map(r => r.lockerId));

const matchedCount = [...resLockerIds].filter(id => lockerIdSet.has(id)).length;

console.log('   locker id 개수: ' + lockerIdSet.size);
console.log('   예약의 unique lockerId: ' + resLockerIds.size);
console.log('   매칭된 lockerId: ' + matchedCount);
console.log('   조인 성공률: ' + (matchedCount === resLockerIds.size ? '✅ 100% 완벽!' : '❌'));

// 4. 이벤트별 예약 건수
console.log('\n4️⃣ 이벤트별 예약 건수:');
const resCountByEvent = {};
reservations.forEach(r => {
  if (!resCountByEvent[r.eventId]) resCountByEvent[r.eventId] = 0;
  resCountByEvent[r.eventId]++;
});

const eventCounts = Object.values(resCountByEvent);
console.log('   각 이벤트당 예약 건수: ' + Math.min(...eventCounts) + ' ~ ' + Math.max(...eventCounts));
console.log('   모두 1000건: ' + (eventCounts.every(c => c === 1000) ? '✅' : '❌'));

// 5. 최종 통계
console.log('\n📈 최종 통계:');
console.log('   총 예약 건수: ' + reservations.length + ' (47 이벤트 × 1000)');
console.log('   사물함 개수: ' + lockers.length);
console.log('   이벤트 개수: ' + events.length);

console.log('\n✨ 데이터 정규화 완료!');
