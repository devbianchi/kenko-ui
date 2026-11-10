// Exemplo extraído de docs/kenko-bot-api.md: 5.5 Escolher horário
export const escolherHorarioMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 4,
    "step": "patient_data",
    "attemptId": "attempt_1"
  },
  "messages": [
    {
      "id": "msg_5",
      "author": "bot",
      "text": "Informe nome e data de nascimento de quem será atendido.",
      "sentAt": "2026-11-10T12:00:40-03:00"
    }
  ],
  "view": {
    "type": "patient_form",
    "fields": [
      {
        "name": "name",
        "type": "text",
        "required": true
      },
      {
        "name": "birthDate",
        "type": "date",
        "required": true
      }
    ],
    "selectedSlot": {
      "id": "slot_501",
      "startsAt": "2026-11-11T09:00:00-03:00",
      "endsAt": "2026-11-11T09:30:00-03:00"
    }
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type EscolherHorarioMockType = typeof escolherHorarioMock;
