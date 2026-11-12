// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 6.3 Cancelar reserva pendente
export const cancelarReservaPendenteMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Agendamento cancelado.",
      "sentAt": "2026-11-10T12:02:00-03:00"
    }
  ],
  "view": {
    "type": "options",
    "options": [
      {
        "label": "Agendar uma consulta"
      },
      {
        "label": "Ver informações da clínica"
      },
      {
        "label": "Ver ou cancelar um agendamento"
      }
    ]
  }
} as const;

export type CancelarReservaPendenteMockType = typeof cancelarReservaPendenteMock;
