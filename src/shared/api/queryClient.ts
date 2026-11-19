import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './ApiError'

const MAX_RETRIES = 2

/** Erro 4xx é resposta definitiva da API: repetir não muda o resultado. Falhas de servidor e rede repetem. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) return false
  return failureCount < MAX_RETRIES
}

/** Uma instância por aplicação, e uma nova por teste, para não vazar cache entre eles. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  })
}
