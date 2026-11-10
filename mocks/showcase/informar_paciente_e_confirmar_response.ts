// Exemplo extraído de docs/kenko-bot-api.md: 5.6 Informar paciente e confirmar
export const informarPacienteEConfirmarMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 5,
    "step": "menu",
    "attemptId": null
  },
  "messages": [
    {
      "id": "msg_6",
      "author": "bot",
      "text": "Consulta confirmada para 11/11 às 09h.",
      "sentAt": "2026-11-10T12:01:00-03:00"
    },
    {
      "id": "msg_7",
      "author": "bot",
      "text": "Posso ajudar em mais alguma coisa?",
      "sentAt": "2026-11-10T12:01:00-03:00"
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
    "type": "appointment_confirmed",
    "appointment": {
      "id": "ap_101",
      "conversationId": "cv_1",
      "patientId": "pt_1",
      "slotId": "slot_501",
      "status": "pending",
      "confirmedAt": "2026-11-10T12:01:00-03:00",
      "startsAt": "2026-11-11T09:00:00-03:00",
      "endsAt": "2026-11-11T09:30:00-03:00"
    }
  }
} as const;

export type InformarPacienteEConfirmarMockType = typeof informarPacienteEConfirmarMock;
