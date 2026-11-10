// Exemplo extraído de docs/kenko-bot-api.md: 6.6 Sair
export const sairMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "closed",
    "revision": 8,
    "step": "closed",
    "attemptId": null
  },
  "messages": [
    {
      "id": "msg_10",
      "author": "bot",
      "text": "Até logo!",
      "sentAt": "2026-11-10T12:03:00-03:00"
    }
  ],
  "view": {
    "type": "closed"
  },
  "availableActions": []
} as const;

export type SairMockType = typeof sairMock;
