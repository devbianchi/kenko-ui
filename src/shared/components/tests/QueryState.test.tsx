import { useQuery } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getData } from '../../api/client'
import { QueryState } from '../QueryState'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'
import { renderWithProviders } from '../../../test/renderWithProviders'

function Probe({ withInvalid = true }: { withInvalid?: boolean }) {
  const query = useQuery({
    queryKey: ['probe'],
    queryFn: ({ signal }) => getData<{ total: number }>('/probe', signal),
  })
  return (
    <QueryState query={query} invalid={withInvalid ? <p>Data inválida</p> : undefined}>
      {(data) => <p>Total: {data.total}</p>}
    </QueryState>
  )
}

describe('QueryState', () => {
  it('mostra carregamento e depois os dados recebidos', async () => {
    stubFetch(() => jsonResponse(envelope({ total: 7 })))
    renderWithProviders(<Probe />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…')
    expect(await screen.findByText('Total: 7')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('mostra a tela de parâmetro inválido quando a API recusa a data', async () => {
    stubFetch(() => jsonResponse({ error: { code: 'INVALID_MONTH', message: 'Mês inválido.' } }, 400))
    renderWithProviders(<Probe />)

    expect(await screen.findByText('Data inválida')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra o erro genérico quando a página não oferece tela de parâmetro inválido', async () => {
    stubFetch(() => jsonResponse({ error: { code: 'INVALID_MONTH', message: 'Mês inválido.' } }, 400))
    renderWithProviders(<Probe withInvalid={false} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Mês inválido.')
  })

  it('mostra a mensagem da API e o código para suporte em erro de servidor', async () => {
    stubFetch(() =>
      jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente.' } }, 500, {
        'X-Request-Id': 'req-7',
      }),
    )
    renderWithProviders(<Probe />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Não foi possível carregar os dados.')
    expect(alert).toHaveTextContent('Erro interno. Tente novamente.')
    expect(alert).toHaveTextContent('Código para suporte: req-7')
  })

  it('avisa que a API está fora do ar quando não há resposta', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    renderWithProviders(<Probe />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível falar com a API.')
  })

  it('tenta de novo pelo botão e mostra os dados quando a API volta', async () => {
    let chamadas = 0
    const fetchMock = stubFetch(() => {
      chamadas += 1
      return chamadas === 1
        ? jsonResponse({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Banco indisponível.' } }, 503)
        : jsonResponse(envelope({ total: 3 }))
    })
    const user = userEvent.setup()
    renderWithProviders(<Probe />)

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Total: 3')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
