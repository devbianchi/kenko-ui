import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { analyticsMock } from '../../../../mocks/analytics/analytics'
import { AppLayout } from '../../../shared/layout/AppLayout'
import { kpiCards } from '../data/analytics'
import type { AnalyticsData } from '../data/analytics'
import { AnalyticsPage } from '../pages/AnalyticsPage'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'
import { createTestQueryClient } from '../../../test/renderWithProviders'

const analyticsData: AnalyticsData = analyticsMock.data

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-16T12:00:00-03:00'))
})
afterEach(() => vi.useRealTimers())

function Probe() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output aria-label="URL">{location.search}</output><button onClick={() => navigate(-1)}>Voltar</button></>
}

/** Analytics com a API substituída: cada período recebe a resposta de respond (por padrão, o fixture). */
function openPage(path = '/analytics', respond: (url: URL) => Response = () => jsonResponse(envelope(analyticsData))) {
  const fetchMock = stubFetch(respond)
  render(<QueryClientProvider client={createTestQueryClient()}><MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<AppLayout />}><Route path="/analytics" element={<><AnalyticsPage /><Probe /></>} /></Route>
  </Routes></MemoryRouter></QueryClientProvider>)
  return { user: userEvent.setup(), fetchMock }
}

const calledUrls = (fetchMock: ReturnType<typeof stubFetch>) => fetchMock.mock.calls.map(([url]) => String(url))

it('abre o mês atual com cinco KPIs e seis gráficos recebidos da API', async () => {
  const { fetchMock } = openPage()
  expect(screen.getByRole('heading', { name: 'Analytics – Novembro 2026' })).toBeVisible()
  const kpis = within(await screen.findByRole('region', { name: 'Indicadores do período' }))
  expect(kpis.getAllByRole('article')).toHaveLength(5)
  for (const [label, value, delta] of [
    ['Conclusão do Bot', '50%', '+10 pp'], ['Mediana de Atendimento', '2m30s', '-30 s'],
    ['Conversas iniciadas fora do expediente', '30%', '—'], ['Ocupação da Agenda', '50%', '+5 pp'], ['Buscas sem Horário', '3', '+1'],
  ]) {
    const metric = within(kpis.getByRole('article', { name: label }))
    expect(metric.getByText(value, { exact: true })).toBeVisible()
    expect(metric.getByText(delta, { exact: true })).toBeVisible()
  }
  expect(within(screen.getByRole('region', { name: 'Gráficos de Analytics' })).getAllByRole('article')).toHaveLength(6)
  expect(calledUrls(fetchMock)).toEqual(['http://localhost:8080/api/analytics?period=month&reference=2026-11'])
})

it('arredonda apenas os percentuais dos cards e preserva zero e ausência de base', () => {
  const kpis = analyticsData.kpis
  const cards = kpiCards({ ...kpis, botCompletion: { ...kpis.botCompletion, percentage: 62.5 },
    agendaOccupancy: { ...kpis.agendaOccupancy, percentage: null, difference: 0 },
    outsideBusinessHours: { ...kpis.outsideBusinessHours, percentage: 0 },
    attendanceDuration: { ...kpis.attendanceDuration, seconds: null },
  })
  expect(cards.map(card => card.value)).toEqual(['63%', '—', '0%', '—', '3'])
  expect(cards[3].detail).toBe('0 pp')
})

it('aplica mês, semana e ano, busca cada período na API e restaura pelo histórico', async () => {
  const { user, fetchMock } = openPage('/analytics?origem=home')
  await screen.findByRole('region', { name: 'Indicadores do período' })

  await user.click(screen.getByLabelText('Período de Analytics'))
  await user.selectOptions(screen.getByLabelText('Mês'), '09')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Novembro 2026')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Setembro 2026')
  expect(screen.getByLabelText('URL')).toHaveTextContent('?origem=home&period=month&reference=2026-09')
  expect(await screen.findByRole('article', { name: 'Conclusão do Bot' })).toHaveTextContent('50%')

  await user.selectOptions(screen.getByLabelText('Período'), 'week')
  fireEvent.change(screen.getByLabelText('Último dia da semana'), { target: { value: '2026-11-04' } })
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('29/10/2026 a 04/11/2026')
  expect(await screen.findByRole('region', { name: 'Indicadores do período' })).toBeVisible()

  await user.selectOptions(screen.getByLabelText('Período'), 'year')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Analytics – 2026')
  expect(screen.getByLabelText('URL')).toHaveTextContent('period=year&reference=2026')

  await vi.waitFor(() => expect(calledUrls(fetchMock)).toEqual([
    'http://localhost:8080/api/analytics?period=month&reference=2026-11',
    'http://localhost:8080/api/analytics?period=month&reference=2026-09',
    'http://localhost:8080/api/analytics?period=week&reference=2026-11-04',
    'http://localhost:8080/api/analytics?period=year&reference=2026',
  ]))

  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Setembro 2026')
  expect(await screen.findByRole('article', { name: 'Funil de Conversão' })).toBeVisible()
})

it.each([
  {
    query: 'period=month&reference=2025-02', title: 'Taxa de Conclusão por Bloco do Mês',
    series: { grouping: 'month_blocks', labels: ['01–07', '08–14', '15–21', '22–28'] },
  },
  {
    query: 'period=week&reference=2026-11-16', title: 'Taxa de Conclusão por Dia',
    series: { grouping: 'daily', labels: ['10/11', '11/11', '12/11', '13/11', '14/11', '15/11', '16/11'] },
  },
  {
    query: 'period=year&reference=2025', title: 'Taxa de Conclusão por Mês',
    series: { grouping: 'monthly', labels: ['01/2025', '02/2025', '03/2025'] },
  },
] as const)('mostra o título e os pontos da série como a API entrega: $query', async ({ query, title, series }) => {
  const data: AnalyticsData = {
    ...analyticsData,
    completionSeries: {
      grouping: series.grouping,
      movingAverageWindow: 3,
      points: series.labels.map(label => ({ label, started: 2, confirmed: 1, percentage: 50, movingAverage: 50 })),
    },
  }
  openPage('/analytics?' + query, () => jsonResponse(envelope(data)))
  const chart = within(await screen.findByRole('article', { name: title }))
  for (const label of series.labels) expect(chart.getByText(label, { exact: true })).toBeVisible()
})

it.each([
  'period=week&reference=2026-02-30', 'period=week&reference=2026-11-17', 'period=year&reference=2027',
  'period=other&reference=2026', 'period=month&reference=2023-12', 'period=month&reference=2026-13',
  'period=month', 'reference=', 'period=month&period=week&reference=2026-10',
  'reference=2026-10&reference=2026-11',
])('preserva a URL inválida e exibe a orientação de Analytics sem chamar a API: %s', query => {
  const { fetchMock } = openPage('/analytics?' + query)
  expect(screen.getByRole('heading', { name: 'Data Inválida :/' })).toBeVisible()
  expect(screen.getByText(/semana \(2024-01-07\), mês \(2024-01\) ou ano \(2024\)/)).toBeVisible()
  expect(screen.getByRole('link', { name: 'Voltar para Analytics' })).toHaveAttribute('href', '/analytics')
  expect(screen.getByLabelText('URL').textContent).toBe('?' + query)
  expect(screen.queryByLabelText('Período de Analytics')).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Indicadores do período' })).not.toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('mostra a orientação de período quando a API recusa a referência', async () => {
  // O navegador aceita o mês, mas o relógio do servidor ainda não chegou nele.
  openPage('/analytics?period=month&reference=2026-11', () =>
    jsonResponse({ error: { code: 'FUTURE_PERIOD', message: 'Período futuro não permitido.' } }, 400))
  expect(await screen.findByRole('heading', { name: 'Data Inválida :/' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Voltar para Analytics' })).toBeVisible()
})

it('mostra o erro da API e busca de novo pelo botão', async () => {
  let chamadas = 0
  const { user } = openPage('/analytics', () => {
    chamadas += 1
    return chamadas === 1
      ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente.' } }, 500)
      : jsonResponse(envelope(analyticsData))
  })
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.')
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByRole('region', { name: 'Indicadores do período' })).toBeVisible()
})

it('volta aos indicadores pelo link e restaura a referência inválida pelo histórico', async () => {
  const { user } = openPage('/analytics?origem=home&period=year&reference=2027')
  await user.click(screen.getByRole('link', { name: 'Voltar para Analytics' }))
  expect(screen.getByRole('heading', { name: 'Analytics – Novembro 2026' })).toBeVisible()
  expect(await screen.findByRole('article', { name: 'Conclusão do Bot' })).toBeVisible()
  expect(screen.getByLabelText('URL')).toBeEmptyDOMElement()
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(screen.getByRole('heading', { name: 'Data Inválida :/' })).toBeVisible()
  expect(screen.getByLabelText('URL').textContent).toBe('?origem=home&period=year&reference=2027')
})

it('aceita referência mensal implícita válida sem alterar a URL', () => {
  openPage('/analytics?reference=2024-01')
  expect(screen.getByRole('heading', { name: 'Analytics – Janeiro 2024' })).toBeVisible()
  expect(screen.getByLabelText('URL').textContent).toBe('?reference=2024-01')
})

it('rejeita ano futuro em rascunho e descarta a edição com Escape', async () => {
  const { user } = openPage()
  const trigger = screen.getByLabelText('Período de Analytics')
  await user.click(trigger)
  await user.selectOptions(screen.getByLabelText('Período'), 'year')
  fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2027' } })
  expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled()
  fireEvent.submit(screen.getByRole('form'))
  expect(screen.getByLabelText('URL')).toBeEmptyDOMElement()
  await user.keyboard('{Escape}')
  expect(trigger).toHaveFocus()
  await user.click(trigger)
  expect(screen.getByLabelText('Período')).toHaveValue('month')
  expect(screen.getByLabelText('Mês')).toHaveValue('11')
})
