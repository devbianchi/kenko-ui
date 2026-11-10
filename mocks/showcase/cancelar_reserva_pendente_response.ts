// Exemplo extraído de docs/kenko-bot-api.md: 6.3 Cancelar reserva pendente
export const cancelarReservaPendenteMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 7,
    "step": "menu",
    "attemptId": null
  },
  "messages": [
    {
      "id": "msg_9",
      "author": "bot",
      "text": "Agendamento cancelado.",
      "sentAt": "2026-11-10T12:02:00-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "id": "opt_schedule",
        "label": "Agendar uma consulta"
      },
      {
        "id": "opt_clinic_info",
        "label": "Ver informações da clínica"
      },
      {
        "id": "opt_appointments",
        "label": "Ver ou cancelar um agendamento"
      }
    ]
  },
  "availableActions": [
    "exit"
  ],
  "result": {
    "type": "appointment_cancelled",
    "appointmentId": "ap_101"
  }
} as const;

export type CancelarReservaPendenteMockType = typeof cancelarReservaPendenteMock;
