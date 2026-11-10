// Exemplo extraído de docs/kenko-bot-api.md: 5.4 Primeira consulta e resultado da busca
export const primeiraConsultaEResultadoDaBuscaMock = {
  "actionId": "act_3",
  "expectedRevision": 2,
  "input": {
    "type": "select_option",
    "optionId": "opt_first_visit"
  }
} as const;

export type PrimeiraConsultaEResultadoDaBuscaMockType = typeof primeiraConsultaEResultadoDaBuscaMock;
