import { API_URL } from './config'
import { ApiError, NetworkError } from './ApiError'

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}

/** Contexto que acompanha toda leitura: fuso de negócio e instante único de avaliação. */
export type Meta = {
  timezone: string
  evaluatedAt: string
  [key: string]: unknown
}

export type Envelope<T> = { meta: Meta; data: T }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (text === '') return undefined
  try {
    return JSON.parse(text)
  } catch {
    // Proxy ou servidor que respondeu HTML: tratado como resposta fora do contrato.
    return undefined
  }
}

function stringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined
  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  return Object.fromEntries(entries)
}

function unexpectedResponse(status: number, requestId: string | undefined): ApiError {
  return new ApiError({
    status,
    code: status === 503 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
    message: 'A API respondeu fora do formato esperado.',
    requestId,
  })
}

function toApiError(status: number, body: unknown, requestId: string | undefined): ApiError {
  if (!isRecord(body) || !isRecord(body.error)) return unexpectedResponse(status, requestId)
  const { code, message, fields } = body.error
  if (typeof code !== 'string' || typeof message !== 'string') return unexpectedResponse(status, requestId)

  // Tudo além de error (conversation, view…) é estado de recuperação que o cliente não pode perder.
  const rest = Object.fromEntries(Object.entries(body).filter(([key]) => key !== 'error'))
  return new ApiError({
    status,
    code,
    message,
    fields: stringRecord(fields),
    requestId,
    payload: Object.keys(rest).length > 0 ? rest : undefined,
  })
}

/**
 * Faz a requisição e devolve o corpo JSON. Respostas de erro viram ApiError; falta de resposta vira
 * NetworkError. O cancelamento (AbortError) é repassado, para o TanStack Query tratá-lo como tal.
 */
export async function request(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<unknown> {
  // Content-Type só com corpo: em GET ele forçaria um preflight de CORS sem necessidade.
  const headers: Record<string, string> = body === undefined ? {} : { 'Content-Type': 'application/json' }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (isAbort(error)) throw error
    throw new NetworkError()
  }

  const requestId = response.headers.get('X-Request-Id') ?? undefined
  const parsed = await readJson(response)
  if (!response.ok) throw toApiError(response.status, parsed, requestId)
  if (parsed === undefined) throw unexpectedResponse(response.status, requestId)
  return parsed
}

/** Leitura com envelope {meta, data}. O conteúdo de data segue o contrato do endpoint (docs da API). */
export async function getEnveloped<T>(path: string, signal?: AbortSignal): Promise<Envelope<T>> {
  const body = await request(path, { signal })
  if (!isRecord(body) || !isRecord(body.meta) || !('data' in body)) {
    throw new ApiError({
      status: 200,
      code: 'INTERNAL_ERROR',
      message: 'A API respondeu fora do formato esperado.',
    })
  }
  const { timezone, evaluatedAt } = body.meta
  if (typeof timezone !== 'string' || typeof evaluatedAt !== 'string') {
    throw new ApiError({ status: 200, code: 'INTERNAL_ERROR', message: 'A API respondeu fora do formato esperado.' })
  }
  return { meta: { ...body.meta, timezone, evaluatedAt }, data: body.data as T }
}

/** Leitura que só precisa de data. */
export async function getData<T>(path: string, signal?: AbortSignal): Promise<T> {
  return (await getEnveloped<T>(path, signal)).data
}
