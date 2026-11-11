// Exemplo extraído de docs/kenko-bot-api.md: 5.4 Primeira consulta e resultado da busca
export const primeiraConsultaEResultadoDaBuscaMock = {
  "messages": [
    {
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
        "startsAt": "2026-11-11T09:00:00-03:00",
        "endsAt": "2026-11-11T09:30:00-03:00",
        "doctor": {
          "name": "Dra. Helena"
        },
        "room": {
          "name": "Sala 1"
        }
      },
      {
        "startsAt": "2026-11-12T10:00:00-03:00",
        "endsAt": "2026-11-12T10:30:00-03:00",
        "doctor": {
          "name": "Dra. Helena"
        },
        "room": {
          "name": "Sala 2"
        }
      },
      {
        "startsAt": "2026-11-16T07:00:00-03:00",
        "endsAt": "2026-11-16T07:30:00-03:00",
        "doctor": {
          "name": "Dr. Paulo"
        },
        "room": {
          "name": "Sala 1"
        }
      }
    ]
  }
} as const;

export type PrimeiraConsultaEResultadoDaBuscaMockType = typeof primeiraConsultaEResultadoDaBuscaMock;
