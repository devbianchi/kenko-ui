import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { ApiError, isApiUnavailable, isInvalidInput } from '../api/ApiError'

type QueryStateProps<T> = {
  query: UseQueryResult<T>
  /** Tela mostrada quando a API recusa o parâmetro (mês, data ou período inválido). */
  invalid?: ReactNode
  children: (data: T) => ReactNode
}

/**
 * Mostra o resultado de uma consulta: dados, carregamento ou erro. Enquanto há dados (inclusive os
 * do período anterior, durante a troca), eles continuam na tela.
 */
export function QueryState<T>({ query, invalid, children }: QueryStateProps<T>) {
  if (query.data !== undefined) return <>{children(query.data)}</>
  if (query.isPending && query.fetchStatus !== 'idle') {
    return <p role="status" className="mt-6 text-center">Carregando…</p>
  }
  if (query.isError && invalid !== undefined && isInvalidInput(query.error)) return <>{invalid}</>
  if (query.isError) return <LoadError error={query.error} onRetry={() => void query.refetch()} />
  return null
}

function LoadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const requestId = error instanceof ApiError ? error.requestId : undefined
  const message = isApiUnavailable(error)
    ? 'Não foi possível falar com a API. Verifique se ela está no ar e tente novamente.'
    : 'Não foi possível carregar os dados.'

  return (
    <section role="alert" className="mx-auto mt-6 max-w-[43em] space-y-4 rounded-3xl bg-background p-4 text-center shadow-card sm:mt-12 sm:p-7">
      <p className="font-semibold">{message}</p>
      {error instanceof ApiError && !isApiUnavailable(error) && <p>{error.message}</p>}
      {requestId !== undefined && <p className="text-sm">Código para suporte: {requestId}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-foreground px-4 py-2 font-semibold text-background motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-102 motion-safe:active:scale-100"
      >
        Tentar novamente
      </button>
    </section>
  )
}
