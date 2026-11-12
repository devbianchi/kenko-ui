// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 6.2 Abrir lista de agendamentos
export const abrirListaDeAgendamentosMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Estes são os agendamentos desta conversa.",
      "sentAt": "2026-11-10T12:01:30-03:00"
    }
  ],
  "view": {
    "type": "appointments",
    "appointments": [
      {
        "status": "pending",
        "canCancel": true,
        "startsAt": "2026-11-11T09:00:00-03:00",
        "endsAt": "2026-11-11T09:30:00-03:00",
        "patient": {
          "name": "Ana Silva"
        },
        "doctor": {
          "name": "Dra. Helena"
        },
        "specialty": {
          "name": "Dermatologia"
        },
        "room": {
          "name": "Sala 1"
        }
      }
    ],
    "options": [
      {
        "label": "Voltar ao menu"
      }
    ]
  }
} as const;

export type AbrirListaDeAgendamentosMockType = typeof abrirListaDeAgendamentosMock;
