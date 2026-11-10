// Exemplo extraído de docs/kenko-bot-api.md: 5.3 Responder especialidade
export const responderEspecialidadeMock = {
  "actionId": "act_2",
  "expectedRevision": 1,
  "input": {
    "type": "select_option",
    "optionId": "opt_dermatology"
  }
} as const;

export type ResponderEspecialidadeMockType = typeof responderEspecialidadeMock;
