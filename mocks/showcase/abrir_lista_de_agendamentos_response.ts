// Exemplo extraído de docs/kenko-bot-api.md: 6.2 Abrir lista de agendamentos
export const abrirListaDeAgendamentosMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 6,
    "step": "appointments",
    "attemptId": null
  },
  "messages": [
    {
      "id": "msg_8",
      "author": "bot",
      "text": "Estes são os agendamentos desta conversa.",
      "sentAt": "2026-11-10T12:01:30-03:00"
    }
  ],
  "view": {
    "type": "appointments",
    "appointments": [
      {
        "id": "ap_101",
        "status": "pending",
        "canCancel": true,
        "startsAt": "2026-11-11T09:00:00-03:00",
        "endsAt": "2026-11-11T09:30:00-03:00",
        "patient": {
          "id": "pt_1",
          "name": "Ana Silva"
        },
        "doctor": {
          "id": "dr_2",
          "name": "Dra. Helena"
        },
        "specialty": {
          "id": "sp_2",
          "name": "Dermatologia"
        },
        "room": {
          "id": "room_1",
          "name": "Sala 1"
        }
      }
    ],
    "options": [
      {
        "id": "opt_menu",
        "label": "Voltar ao menu"
      }
    ]
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type AbrirListaDeAgendamentosMockType = typeof abrirListaDeAgendamentosMock;
