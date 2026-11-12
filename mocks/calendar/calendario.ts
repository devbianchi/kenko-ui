// Exemplo extraído de .agents/context/completo/kenko-backend-api.md: 4.3 Calendário — intervalo visível enviado na requisição
export const calendarioMock = {
  "data": {
    "today": "2026-11-10",
    "countsByDate": {
      "2026-09-30": 2,
      "2026-10-01": 3,
      "2026-10-27": 4
    }
  }
} as const;

export type CalendarioMockType = typeof calendarioMock;
