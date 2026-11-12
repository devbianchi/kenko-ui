import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AppLayout } from '../../../shared/layout/AppLayout'
import { CalendarPage } from '../pages/CalendarPage'
import { DayPage } from '../../day/pages/DayPage'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-12T12:00:00-03:00'))
})
afterEach(() => vi.useRealTimers())

function renderCalendar(route = '/calendar?month=2026-10&origin=demo') {
  return render(<MemoryRouter initialEntries={[route]}><Routes>
    <Route element={<AppLayout />}>
      <Route path="/calendar" element={<><CalendarPage /><output aria-label="URL atual"><LocationSearch /></output></>} />
      <Route path="/calendar/:date" element={<DayPage />} />
    </Route>
  </Routes></MemoryRouter>)
}

function LocationSearch() {
  return <>{useLocation().search}</>
}

it('filtra mês pela URL, preserva parâmetros extras e limita valores fora da faixa', async () => {
  const user = userEvent.setup()
  const firstRender = renderCalendar()
  const calendar = screen.getByRole('region', { name: 'Calendário de 2026-10' })
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

it('mantém a rota placeholder Dia para datas internas e adjacentes', async () => {
  const user = userEvent.setup()
  renderCalendar()
  await user.click(screen.getByRole('link', { name: '2026-09-27, 0 consultas' }))
  expect(screen.getByRole('heading', { name: 'Dia 2026-09-27' })).toBeVisible()
})

it('permite navegar por um dia interno ao mês selecionado', async () => {
  renderCalendar()
  fireEvent.click(screen.getByRole('link', { name: '2026-10-01, 3 consultas' }))
  expect(screen.getByRole('heading', { name: 'Dia 2026-10-01' })).toBeVisible()
})
