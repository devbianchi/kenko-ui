// Exemplo extraído de docs/kenko-bot-api.md: 6.4 Informações da clínica
import { clinicaMock } from '../shared/clinica';

export const informacoesDaClinicaMock = {
  "conversation": {
    "id": "cv_info",
    "effectiveStatus": "active",
    "revision": 1,
    "step": "menu",
    "attemptId": null
  },
  "messages": [
    {
      "id": "msg_info",
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

export type InformacoesDaClinicaMockType = typeof informacoesDaClinicaMock;
