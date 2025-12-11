import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 중앙 집중식 데이터 관리 Store
 *
 * 정규화 원칙:
 * 1. 엔티티별로 분리된 상태 (customers, reservations, events)
 * 2. ID를 기반으로 빠른 조회 (맵 구조 사용)
 * 3. 불변성 유지 (원본 데이터 복제 후 수정)
 * 4. 파생 데이터는 computed로 메모이제이션
 */

export const useDataStore = defineStore('data', () => {
  // ==================== State ====================

  // Customers: 정규화된 고객 데이터 (id -> 고객 객체)
  const customerMap = ref(new Map())

  // Reservations: 정규화된 예약 데이터 (id -> 예약 객체)
  const reservationMap = ref(new Map())

  // Events: 정규화된 행사 데이터 (id -> 행사 객체)
  const eventMap = ref(new Map())

  // Lockers: 정규화된 사물함 데이터 (id -> 사물함 객체)
  const lockerMap = ref(new Map())

  // Vehicles: 정규화된 차량 데이터 (id -> 차량 객체)
  const vehicleMap = ref(new Map())

  // VehicleAssignments: 정규화된 배차 데이터 (id -> 배차 객체)
  const vehicleAssignmentMap = ref(new Map())

  // 조회 순서 추적 (성능 최적화용)
  const customerIds = ref([])
  const reservationIds = ref([])
  const eventIds = ref([])
  const lockerIds = ref([])
  const vehicleIds = ref([])
  const vehicleAssignmentIds = ref([])

  // 로딩 상태
  const isLoading = ref(false)
  const error = ref(null)

  // ==================== Computed (메모이제이션 적용) ====================

  /**
   * 모든 고객을 배열로 반환 (정렬된 순서 유지)
   */
  const customers = computed(() => {
    return customerIds.value.map(id => customerMap.value.get(id))
  })

  /**
   * 모든 예약을 배열로 반환 (정렬된 순서 유지)
   */
  const reservations = computed(() => {
    return reservationIds.value.map(id => reservationMap.value.get(id))
  })

  /**
   * 모든 행사를 배열로 반환 (정렬된 순서 유지)
   */
  const events = computed(() => {
    return eventIds.value.map(id => eventMap.value.get(id))
  })

  /**
   * 모든 사물함을 배열로 반환 (정렬된 순서 유지)
   */
  const lockers = computed(() => {
    return lockerIds.value.map(id => lockerMap.value.get(id))
  })

  /**
   * 모든 차량을 배열로 반환 (정렬된 순서 유지)
   */
  const vehicles = computed(() => {
    return vehicleIds.value.map(id => vehicleMap.value.get(id))
  })

  /**
   * 모든 배차를 배열로 반환 (정렬된 순서 유지)
   */
  const vehicleAssignments = computed(() => {
    return vehicleAssignmentIds.value.map(id => vehicleAssignmentMap.value.get(id))
  })

  /**
   * 행사별 예약 건수를 조회 (eventId, 날짜, 상태 필터링)
   * @param {string} eventId - 행사 ID
   * @returns {number} 예약 건수
   */
  const getReservationCountByEventId = (eventId) => {
    const event = events.value.find((e) => e.id === eventId)
    if (!event) return 0

    // 행사 날짜를 기준으로 필터링
    const eventDate = event.eventDate
    return reservations.value.filter((res) => {
      // 1. 같은 행사인지 확인
      if (res.eventId !== eventId) return false

      // 2. 취소된 예약은 제외
      if (res.status === 'cancelled') return false

      // 3. 예약 시작일이 행사 날짜와 일치하는지 확인
      const reservationDate = res.startTime.split('T')[0]
      if (reservationDate !== eventDate) return false

      return true
    }).length
  }

  /**
   * 행사별 배차 수를 조인해서 반환 (eventId로 vehicleAssignments 필터링)
   * @param {string} eventId - 행사 ID
   * @returns {number} 배차 대수
   */
  const getVehicleCountByEventId = (eventId) => {
    return vehicleAssignments.value.filter(va => va.eventId === eventId).length
  }

  /**
   * 행사별 예상 인원을 계산해서 반환 (배차 대수 * 50)
   * @param {string} eventId - 행사 ID
   * @returns {number} 예상 인원
   */
  const getExpectedAttendanceByEventId = (eventId) => {
    const vehicleCount = getVehicleCountByEventId(eventId)
    return vehicleCount * 50
  }

  /**
   * 행사에 배차 정보를 조인해서 반환
   * @param {object} event - 행사 객체
   * @returns {object} 배차 정보가 추가된 행사 객체
   */
  const enrichEventWithVehicles = (event) => {
    const vehicleCount = getVehicleCountByEventId(event.id)
    return {
      ...event,
      vehicleCount,
      expectedAttendance: vehicleCount * 50,
      busCount: vehicleCount // 별칭
    }
  }

  /**
   * 모든 행사에 배차 정보를 조인해서 반환 (메모이제이션)
   */
  const eventsWithVehicles = computed(() => {
    return events.value.map(event => enrichEventWithVehicles(event))
  })

  /**
   * 활성 예약만 반환 (메모이제이션)
   * 날짜 기반: 현재 시점에 진행 중인 예약만 반환
   */
  const activeReservations = computed(() => {
    const now = new Date()
    return reservations.value.filter(r => {
      const startDate = new Date(r.startDateTime)
      const endDate = new Date(r.endDateTime)
      // status가 active이고, 현재 시간이 예약 기간 내에 있는지 확인
      return r.status === 'active' && startDate <= now && endDate >= now
    })
  })

  /**
   * 완료된 예약만 반환 (메모이제이션)
   */
  const completedReservations = computed(() => {
    return reservations.value.filter(r => r.status === 'completed')
  })

  /**
   * 취소된 예약만 반환 (메모이제이션)
   */
  const cancelledReservations = computed(() => {
    return reservations.value.filter(r => r.status === 'cancelled')
  })

  /**
   * 예약 통계 (메모이제이션)
   */
  const reservationStats = computed(() => {
    const total = reservations.value.length
    const active = activeReservations.value.length
    const completed = completedReservations.value.length
    const cancelled = cancelledReservations.value.length

    return {
      total,
      active,
      completed,
      cancelled,
      activeRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0
    }
  })

  /**
   * 고객별 예약 수 맵 (메모이제이션)
   */
  const customerReservationCount = computed(() => {
    const counts = new Map()
    reservations.value.forEach(r => {
      const current = counts.get(r.customerId) || 0
      counts.set(r.customerId, current + 1)
    })
    return counts
  })

  /**
   * 예약 통계가 있는 고객 목록 (메모이제이션)
   */
  const customersWithStats = computed(() => {
    return customers.value.map(customer => ({
      ...customer,
      reservationCount: customerReservationCount.value.get(customer.id) || 0,
      lastReservation: reservations.value
        .filter(r => r.customerId === customer.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
    }))
  })

  // ==================== Actions ====================

  /**
   * 고객 데이터 일괄 로드
   */
  const setCustomers = (customers) => {
    customerMap.value.clear()
    customerIds.value = []

    customers.forEach(customer => {
      customerMap.value.set(customer.id, { ...customer })
      customerIds.value.push(customer.id)
    })
  }

  /**
   * 예약 데이터 일괄 로드
   */
  const setReservations = (reservations) => {
    reservationMap.value.clear()
    reservationIds.value = []

    reservations.forEach(reservation => {
      reservationMap.value.set(reservation.id, { ...reservation })
      reservationIds.value.push(reservation.id)
    })
  }

  /**
   * 행사 데이터 일괄 로드
   */
  const setEvents = (events) => {
    eventMap.value.clear()
    eventIds.value = []

    events.forEach(event => {
      eventMap.value.set(event.id, { ...event })
      eventIds.value.push(event.id)
    })
  }

  /**
   * 사물함 데이터 일괄 로드
   */
  const setLockers = (lockersData) => {
    lockerMap.value.clear()
    lockerIds.value = []

    lockersData.forEach(locker => {
      lockerMap.value.set(locker.id, { ...locker })
      lockerIds.value.push(locker.id)
    })
  }

  /**
   * 차량 데이터 일괄 로드
   */
  const setVehicles = (vehiclesData) => {
    vehicleMap.value.clear()
    vehicleIds.value = []

    vehiclesData.forEach(vehicle => {
      vehicleMap.value.set(vehicle.id, { ...vehicle })
      vehicleIds.value.push(vehicle.id)
    })
  }

  /**
   * 배차 데이터 일괄 로드
   */
  const setVehicleAssignments = (vehicleAssignmentsData) => {
    vehicleAssignmentMap.value.clear()
    vehicleAssignmentIds.value = []

    vehicleAssignmentsData.forEach(assignment => {
      vehicleAssignmentMap.value.set(assignment.id, { ...assignment })
      vehicleAssignmentIds.value.push(assignment.id)
    })
  }

  /**
   * 고객 추가
   */
  const addCustomer = (customer) => {
    const newCustomer = { ...customer }
    customerMap.value.set(customer.id, newCustomer)
    if (!customerIds.value.includes(customer.id)) {
      customerIds.value.push(customer.id)
    }
    return newCustomer
  }

  /**
   * 예약 추가
   */
  const addReservation = (reservation) => {
    const newReservation = { ...reservation }
    reservationMap.value.set(reservation.id, newReservation)
    if (!reservationIds.value.includes(reservation.id)) {
      reservationIds.value.push(reservation.id)
    }
    return newReservation
  }

  /**
   * 행사 추가
   */
  const addEvent = (event) => {
    const newEvent = { ...event }
    eventMap.value.set(event.id, newEvent)
    if (!eventIds.value.includes(event.id)) {
      eventIds.value.push(event.id)
    }
    return newEvent
  }

  /**
   * 고객 수정 (불변성 유지)
   */
  const updateCustomer = (id, data) => {
    if (!customerMap.value.has(id)) {
      throw new Error(`고객 ${id}를 찾을 수 없습니다.`)
    }
    const original = customerMap.value.get(id)
    const updated = {
      ...original,
      ...data,
      updatedAt: new Date().toISOString()
    }
    customerMap.value.set(id, updated)
    return updated
  }

  /**
   * 예약 수정 (불변성 유지)
   */
  const updateReservation = (id, data) => {
    if (!reservationMap.value.has(id)) {
      throw new Error(`예약 ${id}를 찾을 수 없습니다.`)
    }
    const original = reservationMap.value.get(id)
    const updated = {
      ...original,
      ...data,
      updatedAt: new Date().toISOString()
    }
    reservationMap.value.set(id, updated)
    return updated
  }

  /**
   * 행사 수정 (불변성 유지)
   */
  const updateEvent = (id, data) => {
    if (!eventMap.value.has(id)) {
      throw new Error(`행사 ${id}를 찾을 수 없습니다.`)
    }
    const original = eventMap.value.get(id)
    const updated = {
      ...original,
      ...data,
      updatedAt: new Date().toISOString()
    }
    eventMap.value.set(id, updated)
    return updated
  }

  /**
   * 예약 취소
   */
  const cancelReservation = (id, reason) => {
    const reservation = updateReservation(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason
    })
    return reservation
  }

  /**
   * 예약 완료
   */
  const completeReservation = (id) => {
    const reservation = updateReservation(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    })
    return reservation
  }

  /**
   * 종료된 이벤트의 모든 예약을 완료로 변경
   */
  const completeReservationsByEvent = (eventId) => {
    const reservationsToUpdate = reservations.value.filter(
      r => r.eventId === eventId && r.status !== 'completed' && r.status !== 'cancelled'
    )

    const completedReservations = reservationsToUpdate.map(r =>
      completeReservation(r.id)
    )

    return completedReservations
  }

  /**
   * 고객 삭제
   */
  const deleteCustomer = (id) => {
    customerMap.value.delete(id)
    customerIds.value = customerIds.value.filter(cId => cId !== id)
  }

  /**
   * 예약 삭제
   */
  const deleteReservation = (id) => {
    reservationMap.value.delete(id)
    reservationIds.value = reservationIds.value.filter(rId => rId !== id)
  }

  /**
   * 행사 삭제
   */
  const deleteEvent = (id) => {
    eventMap.value.delete(id)
    eventIds.value = eventIds.value.filter(eId => eId !== id)
  }

  /**
   * 고객 ID로 고객 조회 (O(1))
   */
  const getCustomerById = (id) => {
    return customerMap.value.get(id) || null
  }

  /**
   * 예약 ID로 예약 조회 (O(1))
   */
  const getReservationById = (id) => {
    return reservationMap.value.get(id) || null
  }

  /**
   * 행사 ID로 행사 조회 (O(1))
   */
  const getEventById = (id) => {
    return eventMap.value.get(id) || null
  }

  /**
   * 고객 ID로 해당 고객의 모든 예약 조회
   */
  const getReservationsByCustomerId = (customerId) => {
    return reservations.value.filter(r => r.customerId === customerId)
  }

  /**
   * 특정 날짜의 예약 조회
   */
  const getReservationsByDate = (date) => {
    return reservations.value.filter(r => r.startTime.startsWith(date))
  }

  /**
   * 상태별 예약 조회
   */
  const getReservationsByStatus = (status) => {
    return reservations.value.filter(r => r.status === status)
  }

  /**
   * 모든 상태 초기화
   */
  const clearAll = () => {
    customerMap.value.clear()
    reservationMap.value.clear()
    eventMap.value.clear()
    lockerMap.value.clear()
    vehicleMap.value.clear()
    vehicleAssignmentMap.value.clear()
    customerIds.value = []
    reservationIds.value = []
    eventIds.value = []
    lockerIds.value = []
    vehicleIds.value = []
    vehicleAssignmentIds.value = []
    error.value = null
  }

  /**
   * 에러 설정
   */
  const setError = (err) => {
    error.value = err
  }

  /**
   * 에러 초기화
   */
  const clearError = () => {
    error.value = null
  }

  // ==================== 반환 ====================

  return {
    // State
    customerMap,
    reservationMap,
    eventMap,
    lockerMap,
    vehicleMap,
    vehicleAssignmentMap,
    customerIds,
    reservationIds,
    eventIds,
    lockerIds,
    vehicleIds,
    vehicleAssignmentIds,
    isLoading,
    error,

    // Computed (메모이제이션)
    customers,
    reservations,
    events,
    lockers,
    vehicles,
    vehicleAssignments,
    eventsWithVehicles,
    activeReservations,
    completedReservations,
    cancelledReservations,
    reservationStats,
    customerReservationCount,
    customersWithStats,

    // Actions
    setCustomers,
    setReservations,
    setEvents,
    setLockers,
    setVehicles,
    setVehicleAssignments,
    addCustomer,
    addReservation,
    addEvent,
    updateCustomer,
    updateReservation,
    updateEvent,
    cancelReservation,
    completeReservation,
    completeReservationsByEvent,
    deleteCustomer,
    deleteReservation,
    deleteEvent,
    getCustomerById,
    getReservationById,
    getEventById,
    getReservationsByCustomerId,
    getReservationsByDate,
    getReservationsByStatus,
    clearAll,
    setError,
    clearError,

    // Join Methods (vehicles와 조인)
    getVehicleCountByEventId,
    getExpectedAttendanceByEventId,
    enrichEventWithVehicles,

    // Join Methods (reservations과 조인)
    getReservationCountByEventId
  }
})
