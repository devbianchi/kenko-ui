// Exemplo extraído de docs/kenko-bot-api.md: 3.1 Estado lógico
export const estadoLogicoMock = {
  "id": "cv_1",
  "contactId": "contact_1",
  "effectiveStatus": "active",
  "revision": 4,
  "step": "patient_data",
  "attemptId": "attempt_1",
  "patientId": null,
  "context": {
    "specialtyId": "sp_2",
    "visitKind": "first_visit",
    "selectedSlotId": "slot_501"
  }
} as const;

export type EstadoLogicoMockType = typeof estadoLogicoMock;
