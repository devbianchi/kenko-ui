// Exemplo extraído de docs/kenko-bot-api.md: 5.2 Escolher Agendar — POST /api/conversations/cv_1/interactions
export const escolherAgendarMock = {
  "actionId": "act_1",
  "expectedRevision": 0,
  "input": {
    "type": "select_option",
    "optionId": "opt_schedule"
  }
} as const;

export type EscolherAgendarMockType = typeof escolherAgendarMock;
