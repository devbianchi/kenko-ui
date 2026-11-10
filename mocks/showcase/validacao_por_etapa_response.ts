// Exemplo extraído de docs/kenko-bot-api.md: 8.1 Validação por etapa
export const validacaoPorEtapaMock = {
  "error": {
    "code": "STALE_CONVERSATION_STATE",
    "message": "A conversa mudou. Atualize a etapa atual.",
    "currentRevision": 5
  }
} as const;

export type ValidacaoPorEtapaMockType = typeof validacaoPorEtapaMock;
