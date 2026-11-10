// Exemplo extraído de docs/kenko-bot-api.md: 5.6 Informar paciente e confirmar
export const informarPacienteEConfirmarMock = {
  "actionId": "act_5",
  "expectedRevision": 4,
  "input": {
    "type": "submit_patient",
    "patient": {
      "name": "Ana Silva",
      "birthDate": "1998-04-15"
    }
  }
} as const;

export type InformarPacienteEConfirmarMockType = typeof informarPacienteEConfirmarMock;
