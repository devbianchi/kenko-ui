// Exemplo extraído de docs/kenko-bot-api.md: 6.5 Sem horários
export const semHorariosMock = {
  "messages": [
    {
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
        "label": "Continuar"
      }
    ]
  }
} as const;

export type SemHorariosMockType = typeof semHorariosMock;
