// Exemplo extraído de docs/kenko-bot-api.md: 6.6 Sair
export const sairMock = {
  "actionId": "act_8",
  "expectedRevision": 7,
  "input": {
    "type": "exit"
  }
} as const;

export type SairMockType = typeof sairMock;
