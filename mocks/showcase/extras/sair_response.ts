// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 6.6 Sair
export const sairMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Até logo!",
      "sentAt": "2026-11-10T12:03:00-03:00"
    }
  ],
  "view": {
    "type": "closed"
  }
} as const;

export type SairMockType = typeof sairMock;
