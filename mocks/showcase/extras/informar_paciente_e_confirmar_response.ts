// Exemplo extraído de docs/kenko-bot-api.md: 5.6 Informar paciente e confirmar
export const informarPacienteEConfirmarMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Consulta confirmada para 11/11 às 09h.",
      "sentAt": "2026-11-10T12:01:00-03:00"
    },
    {
      "author": "bot",
      "text": "Posso ajudar em mais alguma coisa?",
      "sentAt": "2026-11-10T12:01:00-03:00"
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

export type InformarPacienteEConfirmarMockType = typeof informarPacienteEConfirmarMock;
