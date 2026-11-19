type ApiErrorInit = {
  status: number
  code: string
  message: string
  fields?: Record<string, string>
  requestId?: string
  payload?: Record<string, unknown>
}

/**
 * Erro respondido pela API, no envelope {error: {code, message, fields?}}. O 409 SLOT_UNAVAILABLE
 * traz também o estado da conversa (view de recuperação), guardado em payload para não ser descartado.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string> | undefined
  readonly requestId: string | undefined
  readonly payload: Record<string, unknown> | undefined

  constructor({ status, code, message, fields, requestId, payload }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
    this.requestId = requestId
    this.payload = payload
  }
}

/** A requisição não chegou a ter resposta (API fora do ar, rede, CORS). Não prova sucesso nem falha. */
export class NetworkError extends Error {
  constructor() {
    super('Não foi possível falar com a API.')
    this.name = 'NetworkError'
  }
}

/** Códigos de parâmetro inválido que as páginas mostram com a tela de data inválida. */
const INVALID_INPUT_CODES: ReadonlySet<string> = new Set([
  'MISSING_PARAMETER',
  'INVALID_DATE',
  'INVALID_MONTH',
  'INVALID_DATE_RANGE',
  'INVALID_PERIOD',
  'FUTURE_PERIOD',
])

export function isInvalidInput(error: unknown): boolean {
  return error instanceof ApiError && INVALID_INPUT_CODES.has(error.code)
}

/** API inacessível: sem resposta ou banco indisponível (503). */
export function isApiUnavailable(error: unknown): boolean {
  return error instanceof NetworkError || (error instanceof ApiError && error.status === 503)
}
