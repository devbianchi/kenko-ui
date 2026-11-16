import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { analyticsMock } from '../../../../mocks/analytics/analytics'
import { AppLayout } from '../../../shared/layout/AppLayout'
import { kpiCards } from '../data/analytics'
import { AnalyticsPage } from '../pages/AnalyticsPage'

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

function openPage(path = '/analytics') {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<AppLayout />}><Route path="/analytics" element={<><AnalyticsPage /><Probe /></>} /></Route>
  </Routes></MemoryRouter>)
  return userEvent.setup()
}

it('abre outubro com cinco KPIs e seis gráficos da fixture local', () => {
  openPage()
  expect(screen.getByRole('heading', { name: 'Analytics – Outubro 2026' })).toBeVisible()
  const kpis = within(screen.getByRole('region', { name: 'Indicadores do período' }))
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
})

it('arredonda apenas os percentuais dos cards e preserva zero e ausência de base', () => {
  const kpis = analyticsMock.data.kpis
  const cards = kpiCards({ ...kpis, botCompletion: { ...kpis.botCompletion, percentage: 62.5 },
    agendaOccupancy: { ...kpis.agendaOccupancy, percentage: null, difference: 0 },
    outsideBusinessHours: { ...kpis.outsideBusinessHours, percentage: 0 },
    attendanceDuration: { ...kpis.attendanceDuration, seconds: null },
  })
  expect(cards.map(card => card.value)).toEqual(['63%', '—', '0%', '—', '3'])
  expect(cards[3].detail).toBe('0 pp')
})

it('aplica filtros e restaura indicadores, parâmetros e mês pelo histórico', async () => {
  const user = openPage('/analytics?origem=home')
  await user.click(screen.getByLabelText('Período de Analytics'))
  await user.selectOptions(screen.getByLabelText('Mês'), '09')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Outubro 2026')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Setembro 2026')
  expect(screen.getByLabelText('URL')).toHaveTextContent('?origem=home&period=month&reference=2026-09')
  expect(screen.getByText('29–30')).toBeVisible()
  expect(screen.getByRole('article', { name: 'Conclusão do Bot' })).toHaveTextContent('50%')
  await user.selectOptions(screen.getByLabelText('Período'), 'week')
  fireEvent.change(screen.getByLabelText('Último dia da semana'), { target: { value: '2026-11-04' } })
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('29/10/2026 a 04/11/2026')
  expect(screen.getByText(/Sem dados de demonstração/)).toBeVisible()
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Período'), 'year')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Analytics – 2026')
  expect(screen.getByLabelText('URL')).toHaveTextContent('period=year&reference=2026')
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Setembro 2026')
  expect(screen.getByRole('article', { name: 'Funil de Conversão' })).toBeVisible()
})

it.each([
  { reference: '2024-02', blocks: ['01–07', '08–14', '15–21', '22–28', '29–29'] },
  { reference: '2025-02', blocks: ['01–07', '08–14', '15–21', '22–28'] },
])('limita os blocos de fevereiro em $reference', ({ reference, blocks }) => {
  openPage('/analytics?period=month&reference=' + reference)
  const chart = within(screen.getByRole('article', { name: 'Taxa de Conclusão por Bloco do Mês' }))
  const labels = chart.getAllByText(/^\d{2}–\d{2}$/)
  expect(labels.map(label => label.textContent)).toEqual(blocks)
  for (const label of labels) expect(label).toBeVisible()
  expect(screen.getByRole('article', { name: 'Conclusão do Bot' })).toHaveTextContent('50%')
})

it.each([
  'period=week&reference=2026-02-30', 'period=week&reference=2026-11-17', 'period=year&reference=2027',
  'period=other&reference=2026', 'period=month&reference=2023-12', 'period=month&reference=2026-13',
  'period=month', 'reference=', 'period=month&period=week&reference=2026-10',
  'reference=2026-10&reference=2026-11',
])('preserva a URL inválida e exibe a orientação de Analytics: %s', query => {
  openPage('/analytics?' + query)
  expect(screen.getByRole('heading', { name: 'Data Inválida :/' })).toBeVisible()
  expect(screen.getByText(/semana \(2024-01-07\), mês \(2024-01\) ou ano \(2024\)/)).toBeVisible()
  expect(screen.getByRole('link', { name: 'Voltar para Analytics' })).toHaveAttribute('href', '/analytics')
  expect(screen.getByLabelText('URL').textContent).toBe('?' + query)
  expect(screen.queryByLabelText('Período de Analytics')).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Indicadores do período' })).not.toBeInTheDocument()
})

it('volta aos indicadores pelo link e restaura a referência inválida pelo histórico', async () => {
  const user = openPage('/analytics?origem=home&period=year&reference=2027')
  await user.click(screen.getByRole('link', { name: 'Voltar para Analytics' }))
  expect(screen.getByRole('heading', { name: 'Analytics – Outubro 2026' })).toBeVisible()
  expect(screen.getByRole('article', { name: 'Conclusão do Bot' })).toBeVisible()
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
  const user = openPage()
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
  expect(screen.getByLabelText('Mês')).toHaveValue('10')
})
