import { clinicaMock } from '../../shared/clinica';

// Exemplo extraído de .agents/context/completo/kenko-bot-api.md: 6.4 Informações da clínica
export const informacoesDaClinicaMock = {
  "messages": [
    {
      "author": "bot",
      "text": "Veja as informações da clínica.",
      "sentAt": "2026-11-10T12:05:00-03:00"
    }
  ],
  "view": {
    "type": "clinic_information",
    "clinic": clinicaMock.data,
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

export type InformacoesDaClinicaMockType = typeof informacoesDaClinicaMock;
