// Exemplo extraído de docs/kenko-bot-api.md: 6.4 Informações da clínica
export const informacoesDaClinicaMock = {
  "actionId": "act_info",
  "expectedRevision": 0,
  "input": {
    "type": "select_option",
    "optionId": "opt_clinic_info"
  }
} as const;

export type InformacoesDaClinicaMockType = typeof informacoesDaClinicaMock;
