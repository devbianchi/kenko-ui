// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 6.1 Ler estado sem registrar atividade — GET /api/conversations/cv_1
export const lerEstadoSemRegistrarAtividadeMock = {
  "conversation": {
    "startedAt": "2026-11-10T12:00:00-03:00",
    "lastInteractionAt": "2026-11-10T12:01:00-03:00"
  },
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

export type LerEstadoSemRegistrarAtividadeMockType = typeof lerEstadoSemRegistrarAtividadeMock;
