// Exemplo extraído de docs/kenko-backend-api.md: 4.4 Dia — GET /api/calendar/days/2026-11-10
export const diaMock = {
  "data": {
    "date": "2026-11-10",
    "summary": {
      "total": 4,
      "complete": 2,
      "pending": 1,
      "cancelled": 1,
      "completionPercentage": 50
    },
    "appointmentsByHour": {
      "hours": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ],
      "counts": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    "appointmentsByDayPeriod": {
      "morning": 3,
      "afternoon": 1
    },
    "rooms": [
      {
        "id": "room_1",
        "name": "Sala 1",
        "appointmentCount": 3,
        "cancelledCount": 1,
        "totalSlots": 4,
        "occupiedSlots": 2,
        "occupancyPercentage": 50,
        "peakHour": 9
      },
      {
        "id": "room_2",
        "name": "Sala 2",
        "appointmentCount": 1,
        "cancelledCount": 0,
        "totalSlots": 2,
        "occupiedSlots": 1,
        "occupancyPercentage": 50,
        "peakHour": 13
      }
    ]
  }
} as const;


export type DiaMockType = typeof diaMock;
