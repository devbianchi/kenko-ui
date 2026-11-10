// Exemplo extraído de docs/kenko-bot-api.md: 6.1 Ler estado sem registrar atividade — GET /api/conversations/cv_1
export const lerEstadoSemRegistrarAtividadeMock = {
  "conversation": {
    "id": "cv_1",
    "effectiveStatus": "active",
    "revision": 5,
    "step": "menu",
    "attemptId": null,
    "startedAt": "2026-11-10T12:00:00-03:00",
    "lastInteractionAt": "2026-11-10T12:01:00-03:00"
  },
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
  ]
} as const;

export type LerEstadoSemRegistrarAtividadeMockType = typeof lerEstadoSemRegistrarAtividadeMock;
