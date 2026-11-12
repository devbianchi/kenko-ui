// Exemplo extraído de .agents/context/completo/kenko-backend-api.md: 4.1 Clínica — GET /api/clinic
export const clinicaMock = {
  "data": {
    "name": "Clínica Demonstração"
  }
} as const;

export type ClinicaMockType = typeof clinicaMock;
