// Exemplo extraído de docs/kenko-backend-api.md: 4.8 Erro
export const erroMock = {
  "error": {
    "code": "INVALID_PERIOD",
    "message": "Para period=month, reference deve usar YYYY-MM.",
    "fields": {
      "reference": "Formato inválido."
    }
  }
} as const;

export type ErroMockType = typeof erroMock;
