// Exemplo extraído de docs/kenko-bot-api.md: 5.5 Escolher horário
export const escolherHorarioMock = {
  "actionId": "act_4",
  "expectedRevision": 3,
  "input": {
    "type": "select_slot",
    "slotId": "slot_501"
  }
} as const;

export type EscolherHorarioMockType = typeof escolherHorarioMock;
