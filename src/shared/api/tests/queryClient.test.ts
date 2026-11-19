import { describe, expect, it } from 'vitest'
import { ApiError, NetworkError } from '../ApiError'
import { createQueryClient, shouldRetry } from '../queryClient'

describe('política de nova tentativa', () => {
  it('não repete erro 4xx, que é resposta definitiva da API', () => {
    expect(shouldRetry(0, new ApiError({ status: 400, code: 'INVALID_MONTH', message: 'x' }))).toBe(false)
    expect(shouldRetry(0, new ApiError({ status: 404, code: 'ROUTE_NOT_FOUND', message: 'x' }))).toBe(false)
  })

  it('repete falha de servidor ou de rede até duas vezes', () => {
    const servidor = new ApiError({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'x' })
    expect(shouldRetry(0, servidor)).toBe(true)
    expect(shouldRetry(1, new NetworkError())).toBe(true)
    expect(shouldRetry(2, servidor)).toBe(false)
  })

  it('cria clientes independentes, com a política configurada', () => {
    const a = createQueryClient()
    const b = createQueryClient()
    expect(a).not.toBe(b)
    expect(a.getDefaultOptions().queries).toMatchObject({ retry: shouldRetry, refetchOnWindowFocus: false, staleTime: 30_000 })
  })
})
