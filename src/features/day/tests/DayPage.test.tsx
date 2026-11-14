import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { DayPage } from '../pages/DayPage'
import type { DayData } from '../pages/DayPage'
import { diaMock } from '../../../../mocks/day/dia'

function renderDay(route = '/calendar/2026-11-10', data: DayData = diaMock.data) {
  return render(<MemoryRouter initialEntries={[route]}><Routes>
    <Route path="/calendar/:date" element={<DayPage data={data} />} />
    <Route path="/calendar" element={<DayPage data={data} />} />
  </Routes></MemoryRouter>)
}

afterEach(() => vi.useRealTimers())

it('mostra resumo do mock e data selecionada, mantendo o mesmo mock para qualquer data', () => {
  renderDay('/calendar/2026-11-10')
  expect(screen.getByRole('heading', { name: '10 de Novembro' })).toBeVisible()
  expect(screen.getByText('2026, Terça-feira')).toBeVisible()
  expect(screen.getByText('Consultas')).toBeVisible()
  expect(screen.getByRole('article', { name: 'Total' })).toHaveTextContent('4')
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('2')
  expect(screen.getByRole('article', { name: 'Pendentes' })).toHaveTextContent('1')
  expect(screen.getByRole('article', { name: 'Canceladas' })).toHaveTextContent('1')
  expect(screen.getByRole('article', { name: 'Taxa de Completude' })).toHaveTextContent('50%')
})

it('expõe resumo, gráficos e tabela em regiões acessíveis', () => {
  renderDay()
  const navigation = screen.getByRole('group', { name: 'Navegação entre dias' })
  const previousButton = within(navigation).getByRole('button', { name: 'Dia anterior' })
  const nextButton = within(navigation).getByRole('button', { name: 'Próximo dia' })
  expect(previousButton.nextElementSibling).toBe(nextButton)
  expect(nextButton.nextElementSibling).toBe(screen.getByRole('heading', { name: '10 de Novembro' }))
  expect(previousButton).toHaveClass('hover:opacity-70')
  expect(nextButton).toHaveClass('hover:opacity-70')
  expect(screen.getByRole('img', { name: 'Consultas por horário, 11 horários' })).toBeVisible()
  expect(screen.getByRole('img', { name: 'Manhã: 3; Tarde: 1' })).toBeVisible()
  const table = screen.getByRole('table')
  expect(within(table).getByRole('row', { name: 'Sala 1 3 (1) 50% 09:00' })).toBeVisible()
  expect(within(table).getByRole('row', { name: 'Sala 2 1 50% 13:00' })).toBeVisible()
})

it('inclui todas as salas e não calcula ocupação sem capacidade', () => {
  const data = { ...diaMock.data, rooms: [...diaMock.data.rooms, {
    id: 'room-3', name: 'Sala 3', appointmentCount: 0, cancelledCount: 0, totalSlots: 0, occupiedSlots: 0, peakHour: null,
  }] }
  renderDay('/calendar/2026-11-10', data)
  const row = screen.getByRole('row', { name: 'Sala 3 0 — —' })
  expect(row).toBeVisible()
})

it('usa um título simples quando a data está ausente ou inválida', () => {
  renderDay('/calendar')
  expect(screen.getByRole('heading', { name: 'Data não disponível' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Dia anterior' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Próximo dia' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Dia anterior' })).toHaveClass('invisible')
  expect(screen.getByRole('button', { name: 'Próximo dia' })).toHaveClass('invisible')
  expect(screen.queryByLabelText('Avanço indisponível')).not.toBeInTheDocument()
})

it('avança e volta um dia sem alterar os dados mockados', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-14T12:00:00-03:00'))
  const user = userEvent.setup()
  renderDay('/calendar/2026-11-10')

  await user.click(screen.getByRole('button', { name: 'Próximo dia' }))
  expect(screen.getByRole('heading', { name: '10 de Novembro' }).closest('.transition-opacity')).toHaveClass('opacity-0')
  expect(await screen.findByRole('heading', { name: '11 de Novembro' })).toBeVisible()
  expect(screen.getByRole('article', { name: 'Total' })).toHaveTextContent('4')
  await user.click(screen.getByRole('button', { name: 'Dia anterior' }))
  expect(await screen.findByRole('heading', { name: '10 de Novembro' })).toBeVisible()
})

it('permite dias futuros do mês atual e oculta avanço fora da janela mensal', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-14T12:00:00-03:00'))
  const user = userEvent.setup()
  renderDay('/calendar/2026-11-14')

  const nextButton = screen.getByRole('button', { name: 'Próximo dia' })
  expect(nextButton).toBeEnabled()
  await user.click(nextButton)
  expect(await screen.findByRole('heading', { name: '15 de Novembro' })).toBeVisible()
})

it('oculta somente a seta que ultrapassaria os limites de meses válidos', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-14T12:00:00-03:00'))
  let view = renderDay('/calendar/2024-01-01')
  expect(screen.getByRole('button', { name: 'Dia anterior' })).toHaveClass('invisible')
  expect(screen.getByRole('button', { name: 'Próximo dia' })).toBeEnabled()

  view.unmount()
  view = renderDay('/calendar/2026-11-30')
  expect(screen.getByRole('button', { name: 'Dia anterior' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Próximo dia' })).toHaveClass('invisible')

  view.unmount()
  renderDay('/calendar/2023-12-31')
  expect(screen.getByRole('heading', { name: 'Data não disponível' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Dia anterior' })).toHaveClass('invisible')
  expect(screen.getByRole('button', { name: 'Próximo dia' })).toHaveClass('invisible')
})
