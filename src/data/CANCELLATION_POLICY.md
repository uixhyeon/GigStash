# Event Cancellation Cascading Logic

## Overview
When an event is cancelled (status changed to '취소'), related reservations should be automatically cancelled based on their current status to maintain data integrity.

## Cancellation Rules

### 1. Auto-Cancel Conditions
When an event status is changed to '취소', the following reservations **MUST** be auto-cancelled:

- **Status: 'active'** - Reservations currently in progress
  - Action: Change status to '취소' (cancelled)
  - Reason: "행사 취소" (Event cancelled)
  - Set cancelledAt: current timestamp

- **Status: 'in-use'** - Items currently stored in lockers
  - Action: Change status to '취소' (cancelled)
  - Reason: "행사 취소로 인한 보관 중단" (Storage terminated due to event cancellation)
  - Set cancelledAt: current timestamp

### 2. No-Action Conditions
The following reservations **SHOULD NOT** be automatically cancelled:

- **Status: 'completed'** - Items already retrieved
  - Reason: Storage service already fulfilled; no action needed
  - Rationale: Customer has already taken their items

- **Status: 'cancelled'** - Already cancelled
  - Reason: Already in cancelled state
  - Rationale: Idempotent operation; no redundant cancellation

- **Status: 'expired'** - Already expired
  - Reason: Reservation period already ended
  - Rationale: Event cancellation does not affect past expirations

## Implementation Guide

### Code Pattern (Pseudo-code)

```javascript
async function cancelEventReservations(eventId) {
  // 1. Verify event exists and is being cancelled
  const event = events.find(e => e.id === eventId);
  if (!event || event.status !== '취소') {
    throw new Error('Invalid event or event not cancelled');
  }

  // 2. Find all reservations for this event
  const reservationsToCancel = reservations.filter(r => r.eventId === eventId);

  // 3. Filter and update cancellable reservations
  const affectedReservations = reservationsToCancel.filter(r =>
    r.status === 'active' || r.status === 'in-use'
  );

  // 4. Update each reservation
  affectedReservations.forEach(res => {
    res.status = '취소';
    res.cancelledAt = new Date().toISOString();
    res.cancelReason = '행사 취소';
  });

  // 5. Log the action
  console.log(`Cancelled ${affectedReservations.length} reservations for event ${eventId}`);

  return {
    totalAffected: affectedReservations.length,
    eventId: eventId,
    cancelledAt: new Date().toISOString()
  };
}
```

## Data Structure Examples

### Before Cancellation
```json
{
  "id": "RES-0001",
  "eventId": "EVT-251101-001",
  "customerId": "C001",
  "status": "active",
  "createdAt": "2025-01-09T15:30:00Z",
  "accessCode": "1234"
}
```

### After Event Cancellation (Status = 'active')
```json
{
  "id": "RES-0001",
  "eventId": "EVT-251101-001",
  "customerId": "C001",
  "status": "취소",
  "createdAt": "2025-01-09T15:30:00Z",
  "cancelledAt": "2025-01-10T14:30:00Z",
  "cancelReason": "행사 취소",
  "accessCode": "1234"
}
```

## Related Fields

### Event Fields
- `id`: Unique event identifier (e.g., "EVT-251101-001")
- `status`: Event status ('완료', '진행예정', '취소')
- `eventName`: Event name
- `eventDate`: Event date
- `vehicleCount`: Number of vehicles deployed
- `expectedAttendance`: Expected number of attendees

### Reservation Fields
- `id`: Unique reservation identifier (e.g., "RES-0001")
- `eventId`: Reference to parent event (FOREIGN KEY)
- `customerId`: Customer who made the reservation
- `status`: Reservation status ('active', 'in-use', 'completed', 'cancelled', 'expired')
- `createdAt`: Reservation creation timestamp
- `cancelledAt`: Cancellation timestamp (added when cancelled)
- `cancelReason`: Reason for cancellation (e.g., "행사 취소")

## File Locations

- **Events Data**: `src/data/events.json`
  - Total Events: 48
  - Events with vehicleCount: All events
  - Example event with vehicles: EVT-251101-001 (vehicleCount: 2, expectedAttendance: 90)

- **Reservations Data**: `src/data/reservations.json`
  - Total Reservations: 144 (expanded from 12)
  - All reservations have eventId reference
  - Proportional to event scale (average 3 reservations per vehicle)

- **Vehicles Data**: `src/data/vehicles.json`
  - Total Vehicles: 20
  - Each vehicle linked to event via eventId
  - Vehicle capacity ranges: 35-55 people per vehicle

## Testing Scenarios

### Scenario 1: Cancel Event with Active Reservations
1. Event EVT-251101-001 has vehicleCount=2, expectedAttendance=90
2. Find 6 active reservations for this event
3. Auto-cancel all 6 reservations
4. Verify cancelledAt and cancelReason are set
5. Verify completed reservations are NOT affected

### Scenario 2: Cancel Event with Mixed Statuses
1. Event EVT-251102-001 has multiple reservations with different statuses
2. Active reservations → Cancelled
3. Completed reservations → No change
4. Verify only appropriate reservations are cancelled

### Scenario 3: Re-cancel Already Cancelled Event
1. Event is already in '취소' status
2. Attempt to cancel again
3. Verify no duplicate cancellations (idempotent)
4. Verify reservation records are consistent

## Business Logic Notes

1. **Cascading Effect**: Cancelling an event creates a cascading effect on all related reservations
2. **Data Integrity**: The eventId field establishes a foreign key relationship ensuring referential integrity
3. **Customer Impact**: Customers with cancelled reservations should be notified (business process, not technical)
4. **Audit Trail**: cancelledAt and cancelReason provide audit history for cancelled reservations
5. **Vehicle Management**: Cancelled events release vehicle allocations, allowing redeployment

## Future Enhancements

1. Implement automatic email notifications to affected customers
2. Add refund processing logic for cancelled reservations
3. Create audit log table for tracking all cancellation events
4. Add batch cancellation operations for efficiency
5. Implement soft-delete pattern with audit history
