// Exemplo extraído de docs/kenko-bot-api.md: 5.4 Primeira consulta e resultado da busca
export const primeiraConsultaEResultadoDaBuscaMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 3,
    "step": "slot_selection",
    "attemptId": "attempt_1"
  },
  "messages": [
    {
      "id": "msg_4",
      "author": "bot",
      "text": "Estes são os horários disponíveis.",
      "sentAt": "2026-11-10T12:00:30-03:00"
    }
  ],
  "view": {
    "type": "slots",
    "searchResult": "available",
    "slots": [
      {
        "id": "slot_501",
        "startsAt": "2026-11-11T09:00:00-03:00",
        "endsAt": "2026-11-11T09:30:00-03:00",
        "doctor": {
          "id": "dr_2",
          "name": "Dra. Helena"
        },
        "room": {
          "id": "room_1",
          "name": "Sala 1"
        }
      },
      {
        "id": "slot_502",
        "startsAt": "2026-11-12T10:00:00-03:00",
        "endsAt": "2026-11-12T10:30:00-03:00",
        "doctor": {
          "id": "dr_2",
          "name": "Dra. Helena"
        },
        "room": {
          "id": "room_2",
          "name": "Sala 2"
        }
      },
      {
        "id": "slot_503",
        "startsAt": "2026-11-16T07:00:00-03:00",
        "endsAt": "2026-11-16T07:30:00-03:00",
        "doctor": {
          "id": "dr_3",
          "name": "Dr. Paulo"
        },
        "room": {
          "id": "room_1",
          "name": "Sala 1"
        }
      }
    ]
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type PrimeiraConsultaEResultadoDaBuscaMockType = typeof primeiraConsultaEResultadoDaBuscaMock;
