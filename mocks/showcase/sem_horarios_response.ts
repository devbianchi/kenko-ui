// Exemplo extraído de docs/kenko-bot-api.md: 6.5 Sem horários
export const semHorariosMock = {
  "conversation": {
    "id": "cv_3",
    "effectiveStatus": "active",
    "revision": 3,
    "step": "continue_after_no_slots",
    "attemptId": "attempt_3"
  },
  "messages": [
    {
      "id": "msg_20",
      "author": "bot",
      "text": "Não encontrei horários disponíveis. Deseja continuar?",
      "sentAt": "2026-11-10T12:10:00-03:00"
    }
  ],
  "view": {
    "type": "options",
    "searchResult": "no_slots",
    "options": [
      {
        "id": "opt_continue",
        "label": "Continuar"
      }
    ]
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type SemHorariosMockType = typeof semHorariosMock;
