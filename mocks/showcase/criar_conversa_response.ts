// Exemplo extraído de docs/kenko-bot-api.md: 5.1 Criar conversa — POST /api/conversations
export const criarConversaMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 0,
    "step": "menu",
    "attemptId": null
  },
  "messages": [
    {
      "id": "msg_1",
      "author": "bot",
      "text": "Olá! Sou o assistente Kenko. Como posso ajudar?",
      "sentAt": "2026-11-10T12:00:00-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "id": "opt_schedule",
        "label": "Agendar uma consulta"
      },
      {
        "id": "opt_clinic_info",
        "label": "Ver informações da clínica"
      },
      {
        "id": "opt_appointments",
        "label": "Ver ou cancelar um agendamento"
      }
    ]
  },
  "availableActions": [
    "exit"
  ]
} as const;

export type CriarConversaMockType = typeof criarConversaMock;
