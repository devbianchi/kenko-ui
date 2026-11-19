import { vi } from 'vitest'

type Route = (url: URL, init: RequestInit | undefined) => Response | Promise<Response>

/** Resposta JSON como a API devolve, com status e cabeçalhos opcionais. */
export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/** Envelope de leitura do contrato, com um instante fixo de avaliação. */
export function envelope<T>(data: T, meta: Record<string, unknown> = {}) {
  return { meta: { timezone: 'America/Sao_Paulo', evaluatedAt: '2026-11-10T12:15:00-03:00', ...meta }, data }
}

/**
 * Substitui o fetch global por uma função de teste, sem rede real. O setup desfaz a substituição
 * depois de cada teste.
 */
export function stubFetch(route: Route) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    return Promise.resolve(route(url, init))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
