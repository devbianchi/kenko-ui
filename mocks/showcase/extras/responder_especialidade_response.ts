// Exemplo extraído de docs/kenko-bot-api.md: 5.3 Responder especialidade
export const responderEspecialidadeMock = {
  "messages": [
    {
      "author": "bot",
      "text": "É primeira consulta ou retorno em Dermatologia?",
      "sentAt": "2026-11-10T12:00:20-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "label": "Primeira consulta"
      },
      {
        "label": "Retorno"
      }
    ]
  }
} as const;

export type ResponderEspecialidadeMockType = typeof responderEspecialidadeMock;
