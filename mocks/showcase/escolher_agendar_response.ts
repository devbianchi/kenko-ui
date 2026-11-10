// Exemplo extraído de docs/kenko-bot-api.md: 5.2 Escolher Agendar — POST /api/conversations/cv_1/interactions
export const escolherAgendarMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 1,
    "step": "specialty",
    "attemptId": "attempt_1"
  },
  "messages": [
    {
      "id": "msg_2",
      "author": "bot",
      "text": "Qual especialidade procura?",
      "sentAt": "2026-11-10T12:00:10-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "id": "opt_general",
        "label": "Clínico geral",
        "specialtyId": "sp_1"
      },
      {
        "id": "opt_dermatology",
        "label": "Dermatologia",
        "specialtyId": "sp_2"
      },
      {
        "id": "opt_orthopedics",
        "label": "Ortopedia",
        "specialtyId": "sp_3"
      },
      {
        "id": "opt_cardiology",
        "label": "Cardiologia",
        "specialtyId": "sp_4"
      }
    ]
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type EscolherAgendarMockType = typeof escolherAgendarMock;
