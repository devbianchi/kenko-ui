// Exemplo extraído de docs/kenko-bot-api.md: 5.1 Criar conversa — POST /api/conversations
export const criarConversaRequestMock = {
  "contactId": "contact_1"
} as const;

export type CriarConversaRequestMockType = typeof criarConversaRequestMock;
