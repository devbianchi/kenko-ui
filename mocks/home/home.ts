import { clinicaMock } from '../shared/clinica';

// Exemplo extraído de docs/kenko-backend-api.md: 4.2 Home — GET /api/dashboard?month=2026-11
export const homeMock = {
  "data": {
    "clinic": clinicaMock.data,
    "appointments": {
      "total": 22,
      "complete": 10,
      "pending": 8,
      "cancelled": 4
    },
    "bestDay": {
      "date": "2026-11-10",
      "appointmentCount": 4
    },
    "peakHour": {
      "hour": 9,
      "appointmentCount": 6,
      "otherBusinessHoursAverage": 1.6,
      "aboveAverage": 4.4
    },
    "bestRoom": {
      "id": "room_1",
      "name": "Sala 1",
      "appointmentCount": 12
    },
    "attendanceDuration": {
      "statistic": "median",
      "seconds": 150,
      "previousSeconds": 165,
      "differenceSeconds": -15
    },
    "upcomingAppointments": [
      {
        "id": "ap_90",
        "status": "pending",
        "startsAt": "2026-11-10T13:00:00-03:00",
        "endsAt": "2026-11-10T13:30:00-03:00",
        "patient": {
          "id": "pt_20",
          "name": "Ana"
        },
        "specialty": {
          "id": "sp_2",
          "name": "Dermatologia"
        },
        "doctor": {
          "id": "dr_2",
          "name": "Dra. Helena"
        },
        "room": {
          "id": "room_2",
          "name": "Sala 2"
        }
      }
    ]
  }
} as const;


export type HomeMockType = typeof homeMock;
