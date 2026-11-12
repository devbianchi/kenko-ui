// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 10. Abandono, histórico e ocultação
export const abandonoHistoricoEOcultacaoMock = {
  "error": {
    "code": "CONVERSATION_ABANDONED",
    "message": "Esta conversa terminou por inatividade. Inicie uma nova conversa."
  }
} as const;

export type AbandonoHistoricoEOcultacaoMockType = typeof abandonoHistoricoEOcultacaoMock;
