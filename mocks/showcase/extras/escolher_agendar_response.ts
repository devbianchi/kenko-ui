// Exemplo extraído de docs/kenko-bot-api.md: 5.2 Escolher Agendar — POST /api/conversations/cv_1/interactions
export const escolherAgendarMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Qual especialidade procura?",
      "sentAt": "2026-11-10T12:00:10-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "label": "Clínico geral",
        "specialtyId": "sp_1"
      },
      {
        "label": "Dermatologia",
        "specialtyId": "sp_2"
      },
      {
        "label": "Ortopedia",
        "specialtyId": "sp_3"
      },
      {
        "label": "Cardiologia",
        "specialtyId": "sp_4"
      }
    ]
  }
} as const;

export type EscolherAgendarMockType = typeof escolherAgendarMock;
