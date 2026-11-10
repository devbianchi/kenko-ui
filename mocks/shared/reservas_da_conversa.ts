// Exemplo extraído de docs/kenko-backend-api.md: 4.7 Reservas da conversa — GET /api/conversations/cv_1/appointments
export const reservasDaConversaMock = {
  "meta": {
    "timezone": "America/Sao_Paulo",
    "evaluatedAt": "2026-11-10T12:15:00-03:00"
  },
  "data": [
    {
      "id": "ap_101",
      "status": "pending",
      "canCancel": true,
      "patient": {
        "id": "pt_1",
        "name": "Ana Silva"
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
        "id": "room_1",
        "name": "Sala 1"
      },
      "startsAt": "2026-11-11T09:00:00-03:00",
      "endsAt": "2026-11-11T09:30:00-03:00"
    }
  ]
} as const;

export type ReservasDaConversaMockType = typeof reservasDaConversaMock;
