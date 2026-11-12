// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 5.1 Criar conversa — POST /api/conversations
export const criarConversaMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Olá! Sou o assistente Kenko. Como posso ajudar?",
      "sentAt": "2026-11-10T12:00:00-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "label": "Agendar uma consulta"
      },
      {
        "label": "Ver informações da clínica"
      },
      {
        "label": "Ver ou cancelar um agendamento"
      }
    ]
  }
} as const;

export type CriarConversaMockType = typeof criarConversaMock;
