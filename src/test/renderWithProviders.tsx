import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

/** Cliente sem novas tentativas e sem cache entre testes, para cada teste ver só a própria resposta. */
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
}

/** Renderiza com TanStack Query e roteador em memória. */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const client = createTestQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}
