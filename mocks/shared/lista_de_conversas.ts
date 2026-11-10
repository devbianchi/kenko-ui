// Exemplo extraído de docs/kenko-backend-api.md: 4.6 Lista de conversas — GET /api/conversations?ids=cv_1,cv_2
export const listaDeConversasMock = {
  "meta": {
    "timezone": "America/Sao_Paulo",
    "evaluatedAt": "2026-11-10T12:15:00-03:00"
  },
  "data": [
    {
      "id": "cv_1",
      "effectiveStatus": "active",
      "lastInteractionAt": "2026-11-10T12:01:00-03:00"
    },
    {
      "id": "cv_2",
      "effectiveStatus": "abandoned",
      "lastInteractionAt": "2026-11-10T09:00:00-03:00"
    }
  ]
} as const;

export type ListaDeConversasMockType = typeof listaDeConversasMock;
