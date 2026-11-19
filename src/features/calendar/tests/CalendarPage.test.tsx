import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { calendarioMock } from '../../../../mocks/calendar/calendario'
import { diaMock } from '../../../../mocks/day/dia'
import { AppLayout } from '../../../shared/layout/AppLayout'
import { CalendarPage } from '../pages/CalendarPage'
import { DayPage } from '../../day/pages/DayPage'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'
import { createTestQueryClient } from '../../../test/renderWithProviders'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-12T12:00:00-03:00'))
})
afterEach(() => vi.useRealTimers())

/** Calendário com a API substituída: a grade recebe o fixture do calendário, e o Dia, o do Dia. */
function renderCalendar(route = '/calendar?month=2026-10&origin=demo', data: unknown = calendarioMock.data) {
  const fetchMock = stubFetch(url => jsonResponse(envelope(url.pathname.includes('/calendar/days/') ? diaMock.data : data)))
  const view = render(<QueryClientProvider client={createTestQueryClient()}><MemoryRouter initialEntries={[route]}><Routes>
    <Route element={<AppLayout />}>
      <Route path="/calendar" element={<><CalendarPage /><output aria-label="URL atual"><LocationSearch /></output></>} />
      <Route path="/calendar/:date" element={<DayPage />} />
    </Route>
  </Routes></MemoryRouter></QueryClientProvider>)
  return { ...view, fetchMock }
}

function LocationSearch() {
  return <>{useLocation().search}</>
}

it('abre a data selecionada e mantém o resumo estático aprovado para o protótipo Dia', async () => {
  const user = userEvent.setup()
  renderCalendar()
  const day = await screen.findByRole('link', { name: '2026-10-01, 3 consultas' })
  expect(day).toHaveAttribute('href', '/calendar/2026-10-01')
  await user.click(day)
  expect(await screen.findByRole('heading', { name: '1 de Outubro' })).toBeVisible()
  expect(screen.getByText('2026, Quinta-feira')).toBeVisible()
  expect(screen.getByRole('article', { name: 'Total' })).toHaveTextContent('Total4')
})

it('filtra mês pela URL, preserva parâmetros extras e limita valores fora da faixa', async () => {
  const user = userEvent.setup()
  const firstRender = renderCalendar()
  const calendar = await screen.findByRole('region', { name: 'Calendário de 2026-10' })
  expect(within(calendar).getByRole('heading', { name: 'Outubro | 2026' })).toBeVisible()
  expect(screen.getByRole('link', { name: '2026-10-27, 4 consultas' })).toBeVisible()
  await user.click(screen.getByLabelText('Mês e ano'))
  await user.selectOptions(screen.getByLabelText('Mês'), '09')
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-10&origin=demo')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-09&origin=demo')
  expect(await screen.findByRole('heading', { name: 'Setembro | 2026' })).toBeVisible()

  firstRender.unmount()
  const historicalRender = renderCalendar('/calendar?month=2023-12&origin=history')
  expect(await screen.findByRole('heading', { name: 'Janeiro | 2024' })).toBeVisible()
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2024-01&origin=history')
  historicalRender.unmount()
  const futureRender = renderCalendar('/calendar?month=2099-12')
  expect(await screen.findByRole('heading', { name: 'Novembro | 2026' })).toBeVisible()
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11')
  futureRender.unmount()
  renderCalendar('/calendar?month=invalid')
  expect(await screen.findByRole('heading', { name: 'Novembro | 2026' })).toBeVisible()
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11')
})

it('abre a página Dia com a data adjacente selecionada', async () => {
  const user = userEvent.setup()
  renderCalendar()
  await user.click(await screen.findByRole('link', { name: '2026-09-27, 0 consultas' }))
  expect(await screen.findByRole('heading', { name: '27 de Setembro' })).toBeVisible()
  expect(screen.getByText('2026, Domingo')).toBeVisible()
})

it('permite navegar por um dia interno ao mês selecionado', async () => {
  renderCalendar()
  fireEvent.click(await screen.findByRole('link', { name: '2026-10-01, 3 consultas' }))
  expect(await screen.findByRole('heading', { name: '1 de Outubro' })).toBeVisible()
  expect(screen.getByText('2026, Quinta-feira')).toBeVisible()
})

it.each([
  ['2026-10', '2026-09-27', '2026-11-01'],
  ['2026-08', '2026-07-26', '2026-09-06'],
])('pede à API o intervalo visível da grade de %s', async (month, startDate, endDateExclusive) => {
  const { fetchMock } = renderCalendar(`/calendar?month=${month}`)
  await screen.findByRole('region', { name: `Calendário de ${month}` })
  expect(String(fetchMock.mock.calls[0]![0])).toBe(
    `http://localhost:8080/api/calendar?startDate=${startDate}&endDateExclusive=${endDateExclusive}`,
  )
})

it('destaca o dia de hoje informado pela API, não o do relógio do navegador', async () => {
  // O navegador está em 12/11; a API diz que hoje é 10/11.
  renderCalendar('/calendar?month=2026-11', { today: '2026-11-10', countsByDate: {} })
  expect(await screen.findByRole('link', { name: '2026-11-10, 0 consultas, hoje' })).toBeVisible()
  expect(screen.getByRole('link', { name: '2026-11-12, 0 consultas' })).toBeVisible()
})

it('mostra o erro da API no lugar da grade', async () => {
  stubFetch(() => jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente.' } }, 500))
  render(<QueryClientProvider client={createTestQueryClient()}><MemoryRouter initialEntries={['/calendar?month=2026-10']}><Routes>
    <Route element={<AppLayout />}><Route path="/calendar" element={<CalendarPage />} /></Route>
  </Routes></MemoryRouter></QueryClientProvider>)

  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.')
  expect(screen.queryByRole('region', { name: 'Calendário de 2026-10' })).not.toBeInTheDocument()
})
