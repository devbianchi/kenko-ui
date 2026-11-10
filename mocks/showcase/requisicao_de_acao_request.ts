// Exemplo extraído de docs/kenko-bot-api.md: 4.2 Requisição de ação
export const requisicaoDeAcaoMock = {
  "actionId": "act_2",
  "expectedRevision": 1,
  "input": {
    "type": "select_option",
    "optionId": "opt_dermatology"
  }
} as const;

export type RequisicaoDeAcaoMockType = typeof requisicaoDeAcaoMock;
