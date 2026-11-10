// Exemplo extraído de docs/kenko-bot-api.md: 6.2 Abrir lista de agendamentos
export const abrirListaDeAgendamentosMock = {
  "actionId": "act_6",
  "expectedRevision": 5,
  "input": {
    "type": "select_option",
    "optionId": "opt_appointments"
  }
} as const;

export type AbrirListaDeAgendamentosMockType = typeof abrirListaDeAgendamentosMock;
