import { describe, expect, it } from 'vitest'
import { ApiError, NetworkError, isApiUnavailable, isInvalidInput } from '../ApiError'
import { getData, getEnveloped, request } from '../client'
import { resolveApiUrl } from '../config'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'

describe('resolveApiUrl', () => {
  it('usa o endereço padrão quando a variável está ausente ou vazia', () => {
    expect(resolveApiUrl(undefined)).toBe('http://localhost:8080/api')
    expect(resolveApiUrl('  ')).toBe('http://localhost:8080/api')
  })

  it('remove a barra final da URL configurada', () => {
    expect(resolveApiUrl('https://kenko.exemplo/api/')).toBe('https://kenko.exemplo/api')
  })
})

describe('cliente HTTP', () => {
  it('devolve apenas data de uma leitura com envelope', async () => {
    stubFetch(() => jsonResponse(envelope({ today: '2026-11-10' })))
    await expect(getData('/calendar')).resolves.toEqual({ today: '2026-11-10' })
  })

  it('devolve meta e data quando a página precisa do contexto', async () => {
    stubFetch(() => jsonResponse(envelope({ kpis: {} }, { period: { type: 'month' } })))
    const result = await getEnveloped('/analytics')
    expect(result.meta).toMatchObject({ evaluatedAt: '2026-11-10T12:15:00-03:00', period: { type: 'month' } })
    expect(result.data).toEqual({ kpis: {} })
  })

  it('chama a URL base da API e não envia Content-Type em GET', async () => {
    const fetchMock = stubFetch(() => jsonResponse(envelope({})))
    await getData('/dashboard?month=2026-11')

    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('http://localhost:8080/api/dashboard?month=2026-11')
    expect(init?.method).toBe('GET')
    expect(init?.headers).toEqual({})
  })

  it('envia o corpo em JSON com Content-Type em POST', async () => {
    const fetchMock = stubFetch(() => jsonResponse({ conversation: { id: 'cv_1' } }, 201))
    const body = await request('/conversations', { method: 'POST', body: { contactId: 'ui_1' } })

    expect(body).toEqual({ conversation: { id: 'cv_1' } })
    const init = fetchMock.mock.calls[0]![1]
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(init?.body).toBe('{"contactId":"ui_1"}')
  })

  it('transforma o envelope de erro em ApiError com código, campos e requestId', async () => {
    stubFetch(() =>
      jsonResponse(
        { error: { code: 'INVALID_NAME', message: 'Nome inválido.', fields: { 'patient.name': 'Vazio.' } } },
        400,
        { 'X-Request-Id': 'req-42' },
      ),
    )
    const error = await request('/conversations/cv_1/interactions', { method: 'POST', body: {} }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      code: 'INVALID_NAME',
      message: 'Nome inválido.',
      fields: { 'patient.name': 'Vazio.' },
      requestId: 'req-42',
      payload: undefined,
    })
  })

  it('guarda o estado de recuperação do 409 SLOT_UNAVAILABLE em payload', async () => {
    const view = { type: 'slots', searchResult: 'available', slots: [] }
    stubFetch(() =>
      jsonResponse(
        {
          error: { code: 'SLOT_UNAVAILABLE', message: 'Horário ocupado.' },
          conversation: { id: 'cv_1', revision: 4 },
          messages: [],
          view,
          availableActions: ['exit'],
          result: null,
        },
        409,
      ),
    )
    const error = await request('/conversations/cv_1/interactions', { method: 'POST', body: {} }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).payload).toEqual({
      conversation: { id: 'cv_1', revision: 4 },
      messages: [],
      view,
      availableActions: ['exit'],
      result: null,
    })
  })

  it('trata resposta de erro sem JSON pelo status, sem inventar mensagem do servidor', async () => {
    stubFetch(() => new Response('<html>Bad Gateway</html>', { status: 502 }))
    await expect(getData('/dashboard')).rejects.toMatchObject({ status: 502, code: 'INTERNAL_ERROR' })

    stubFetch(() => new Response('', { status: 503 }))
    await expect(getData('/dashboard')).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' })
  })

  it('recusa resposta 200 fora do envelope de leitura', async () => {
    stubFetch(() => jsonResponse({ today: '2026-11-10' }))
    await expect(getData('/calendar')).rejects.toMatchObject({ code: 'INTERNAL_ERROR' })
  })

  it('transforma a falta de resposta em NetworkError', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    await expect(getData('/dashboard')).rejects.toBeInstanceOf(NetworkError)
  })

  it('repassa o cancelamento sem convertê-lo em erro de rede', async () => {
    stubFetch(() => Promise.reject(new DOMException('Cancelado', 'AbortError')))
    await expect(getData('/dashboard')).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('classificação de erros', () => {
  it('reconhece os códigos de parâmetro inválido e só eles', () => {
    for (const code of ['MISSING_PARAMETER', 'INVALID_DATE', 'INVALID_MONTH', 'INVALID_DATE_RANGE', 'INVALID_PERIOD', 'FUTURE_PERIOD']) {
      expect(isInvalidInput(new ApiError({ status: 400, code, message: 'x' }))).toBe(true)
    }
    expect(isInvalidInput(new ApiError({ status: 400, code: 'INVALID_JSON', message: 'x' }))).toBe(false)
    expect(isInvalidInput(new NetworkError())).toBe(false)
  })

  it('considera a API indisponível sem resposta ou com 503, e só nesses casos', () => {
    expect(isApiUnavailable(new NetworkError())).toBe(true)
    expect(isApiUnavailable(new ApiError({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'x' }))).toBe(true)
    expect(isApiUnavailable(new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'x' }))).toBe(false)
  })
})
