import json
import os

# JSON 파일 경로들
files = {
    '../src/data/reservations.json': {
        'comment': '''/*
컬럼명: id(예약ID), lockerId(사물함ID), lockerNumber(사물함번호), customerId(고객ID),
status(상태:pending/waiting/active/completed/cancelled), startTime(시작시간), endTime(종료시간),
itemDescription(물품설명), createdAt(생성시간), accessCode(접근코드), eventId(행사ID)
*/
'''
    },
    '../src/data/lockers.json': {
        'comment': '''/*
컬럼명: id(사물함ID), number(사물함번호), vehicleId(차량ID), size(크기:small/medium/large),
location(위치), position(차량내위치), status(상태:active/maintenance/broken), temperature(온도),
lastMaintenance(마지막정비시간), features(기능배열), currentReservation(현재예약ID)
*/
'''
    },
    '../src/data/customers.json': {
        'comment': '''/*
컬럼명: id(고객ID), name(이름), email(이메일), phone(전화번호), company(회사명), createdAt(가입시간)
*/
'''
    },
    '../src/data/events.json': {
        'comment': '''/*
컬럼명: id(행사ID), eventName(행사명), eventDate(행사날짜), eventVenue(장소), eventType(종류),
status(상태), performanceTime(시간), vehicleCount(배차대수), expectedAttendance(예상참석인원), createdAt(생성시간)
*/
'''
    },
    '../src/data/vehicles.json': {
        'comment': '''/*
컬럼명: id(차량ID), plateNumber(번호판), model(모델), capacity(정원), features(기능배열)
*/
'''
    }
}

# 각 파일에 주석 추가
for file_path, data in files.items():
    full_path = os.path.join(os.path.dirname(__file__), file_path)

    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 주석이 이미 있으면 제거
        if content.startswith('/*'):
            content = content[content.find('*/') + 2:].lstrip('\n')

        # 주석 추가
        new_content = data['comment'] + content

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f'✅ {file_path}: 주석 추가 완료')
    else:
        print(f'❌ {file_path}: 파일을 찾을 수 없습니다')

print('\n✨ 모든 JSON 파일에 주석이 추가되었습니다!')
