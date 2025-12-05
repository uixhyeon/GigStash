import { customers } from '../src/data/customers.js';
import { lockers } from '../src/data/lockers.js';
import { reservations } from '../src/data/reservations.js';
import fs from 'fs';

// 대형 콘서트 이벤트와 예상 관객 수 (사물함 제약 고려하여 조정)
const concertEvents = [
  { eventId: 'EVT251207001', date: '2025-12-07', name: 'BTS Day 1', reservations: 150 },
  { eventId: 'EVT251207002', date: '2025-12-07', name: 'SEVENTEEN Day 1', reservations: 100 },
  { eventId: 'EVT251208001', date: '2025-12-08', name: 'BTS Day 2', reservations: 150 },
  { eventId: 'EVT251208002', date: '2025-12-08', name: 'SEVENTEEN Day 2', reservations: 100 },
  { eventId: 'EVT251209001', date: '2025-12-09', name: 'BLACKPINK', reservations: 80 },
  { eventId: 'EVT251211001', date: '2025-12-11', name: 'TWICE', reservations: 80 },
  { eventId: 'EVT251212001', date: '2025-12-12', name: 'NCT DREAM', reservations: 70 },
  { eventId: 'EVT251213001', date: '2025-12-13', name: 'ATEEZ', reservations: 100 },
];

// 시작 ID 번호
let reservationCounter = 2090; // RES0000002089 다음
let customerIndex = 0;
const usedLockers = new Set(reservations.map(r => r.lockerId));

const newReservations = [];

// 각 콘서트별로 예약 생성
for (const concert of concertEvents) {
  console.log(`\n생성 중: ${concert.name} (${concert.reservations}건)`);

  for (let i = 0; i < concert.reservations; i++) {
    // 고객 순환 사용
    const customer = customers[customerIndex % customers.length];
    customerIndex++;

    // 사용 가능한 사물함 찾기
    let locker = null;
    for (const l of lockers) {
      if (!usedLockers.has(l.id) && l.status === 'available') {
        locker = l;
        usedLockers.add(l.id);
        break;
      }
    }

    if (!locker) {
      console.log(`경고: 사용 가능한 사물함 부족 (${i}/${concert.reservations})`);
      break;
    }

    // 예약 ID 생성
    const resId = `RES${String(reservationCounter).padStart(10, '0')}`;
    reservationCounter++;

    // 예약 시간 생성 (콘서트 당일 오전 10시 ~ 오후 5시 사이)
    const hour = 10 + Math.floor(Math.random() * 7);
    const minute = Math.floor(Math.random() * 60);
    const startTime = `${concert.date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`;

    // 종료 시간 (콘서트 시간 이후 - 다음날 오전 2시)
    const endTime = `${concert.date.substring(0, 8)}${String(parseInt(concert.date.substring(8, 10)) + 1).padStart(2, '0')}T02:00:00Z`;

    // 예약 생성일 (콘서트 7~30일 전)
    const daysBefore = 7 + Math.floor(Math.random() * 23);
    const createdDate = new Date(concert.date);
    createdDate.setDate(createdDate.getDate() - daysBefore);
    const createdAt = createdDate.toISOString();

    // 상태 결정 (진행중 콘서트는 active, 예정은 active)
    const status = concert.date <= '2025-12-09' ? 'active' : 'active';

    const reservation = {
      id: resId,
      customerId: customer.id,
      customerName: customer.name,
      eventId: concert.eventId,
      lockerId: locker.id,
      accessCode: String(Math.floor(100000 + Math.random() * 900000)),
      startTime,
      endTime,
      status,
      createdAt,
      updatedAt: createdAt,
    };

    newReservations.push(reservation);
  }

  console.log(`완료: ${newReservations.filter(r => r.eventId === concert.eventId).length}건 생성`);
}

console.log(`\n총 ${newReservations.length}건의 예약 생성 완료`);
console.log(`마지막 예약 ID: RES${String(reservationCounter - 1).padStart(10, '0')}`);

// reservations.js 파일에 추가할 내용 생성
const appendContent = newReservations.map(r => `  {
    id: '${r.id}',
    customerId: '${r.customerId}',
    customerName: '${r.customerName}',
    eventId: '${r.eventId}',
    lockerId: '${r.lockerId}',
    accessCode: '${r.accessCode}',
    startTime: '${r.startTime}',
    endTime: '${r.endTime}',
    status: '${r.status}',
    createdAt: '${r.createdAt}',
    updatedAt: '${r.updatedAt}',
  },`).join('\n');

console.log('\n생성된 예약 데이터를 reservations.js에 추가해주세요.');
console.log('추가할 내용이 reservations-append.txt 파일에 저장됩니다.');

fs.writeFileSync('reservations-append.txt', appendContent);
console.log('\n✅ reservations-append.txt 파일 생성 완료!');
