// Exemplo extraído de docs/kenko-bot-api.md: 5.3 Responder especialidade
export const responderEspecialidadeMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 2,
    "step": "visit_kind",
    "attemptId": "attempt_1"
  },
  "messages": [
    {
      "id": "msg_3",
      "author": "bot",
      "text": "É primeira consulta ou retorno em Dermatologia?",
      "sentAt": "2026-11-10T12:00:20-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "id": "opt_first_visit",
        "label": "Primeira consulta"
      },
      {
        "id": "opt_return",
        "label": "Retorno"
      }
    ]
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type ResponderEspecialidadeMockType = typeof responderEspecialidadeMock;
