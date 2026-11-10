// Exemplo extraído de docs/kenko-bot-api.md: 6.3 Cancelar reserva pendente
export const cancelarReservaPendenteMock = {
  "actionId": "act_7",
  "expectedRevision": 6,
  "input": {
    "type": "cancel_appointment",
    "appointmentId": "ap_101"
  }
} as const;

export type CancelarReservaPendenteMockType = typeof cancelarReservaPendenteMock;
