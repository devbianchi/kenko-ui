import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { CalendarPage } from '../../calendar/pages/CalendarPage'
import { DayPage } from '../pages/DayPage'
import type { DayData } from '../pages/DayPage'
import { diaMock } from '../../../../mocks/day/dia'

function renderDay(route = '/calendar/2026-11-10', data: DayData = diaMock.data) {
  return render(<MemoryRouter initialEntries={[route]}><Routes>
    <Route path="/calendar/:date" element={<DayPage data={data} />} />
    <Route path="/calendar" element={<CalendarPage />} />
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
  expect(previousButton).toBeEnabled()
  expect(nextButton).toBeEnabled()
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

it('volta do erro ao calendário pelo link do cartão', async () => {
  const user = userEvent.setup()
  renderDay('/calendar/invalid')
  await user.click(screen.getByRole('link', { name: 'Voltar ao Calendário' }))
  expect(screen.getByRole('heading', { name: 'Calendário' })).toBeVisible()
})

it('apresenta as setas antes do título com o hover aprovado', () => {
  renderDay()
  const previousButton = screen.getByRole('button', { name: 'Dia anterior' })
  const nextButton = screen.getByRole('button', { name: 'Próximo dia' })
  expect(previousButton.nextElementSibling).toBe(nextButton)
  expect(nextButton.nextElementSibling).toBe(screen.getByRole('heading', { name: '10 de Novembro' }))
  expect(previousButton).toHaveClass('hover:opacity-70')
  expect(nextButton).toHaveClass('hover:opacity-70')
})

it('avança e volta um dia sem alterar os dados mockados', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-14T12:00:00-03:00'))
  const user = userEvent.setup()
  renderDay('/calendar/2026-11-10')

  await user.click(screen.getByRole('button', { name: 'Próximo dia' }))
  const previous = screen.getByRole('button', { name: 'Dia anterior' })
  const next = screen.getByRole('button', { name: 'Próximo dia' })
  expect(previous).toBeDisabled()
  expect(next).toBeDisabled()
  expect(await screen.findByRole('heading', { name: '11 de Novembro' })).toBeVisible()
  expect(screen.getByRole('article', { name: 'Total' })).toHaveTextContent('4')
  expect(previous).toBeDisabled()
  expect(next).toBeDisabled()
  await user.click(next)
  await waitFor(() => expect(previous).toBeEnabled())
  expect(next).toBeEnabled()
  expect(screen.getByRole('heading', { name: '11 de Novembro' })).toBeVisible()
  await user.click(previous)
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

})

it.each(['invalid', '2026-02-30', '2026-13-01', '2023-12-31', '2026-12-01'])('rejeita data inválida da rota: %s', date => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-16T12:00:00-03:00'))
  renderDay(`/calendar/${date}`)
  expect(screen.getByRole('heading', { name: 'Data Inválida :/' })).toBeVisible()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
  expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Resumo de consultas do dia' })).not.toBeInTheDocument()
})

it('aceita o dia bissexto sem deslocar sua data', () => {
  renderDay('/calendar/2024-02-29')
  expect(screen.getByRole('heading', { name: '29 de Fevereiro' })).toBeVisible()
  expect(screen.getByText('2024, Quinta-feira')).toBeVisible()
})

it('distingue completude sem base de contagens zeradas', () => {
  renderDay('/calendar/2026-11-10', {
    summary: { total: 0, complete: 0, pending: 0, cancelled: 0 },
    appointmentsByHour: { hours: [], counts: [] }, rooms: [],
  })
  expect(screen.getByRole('article', { name: 'Total' })).toHaveTextContent('Total0')
  expect(screen.getByRole('article', { name: 'Taxa de Completude' })).toHaveTextContent('Taxa de Completude—')
  expect(screen.getByRole('article', { name: 'Taxa de Completude' })).not.toHaveTextContent('%')
  expect(screen.getByText('Sem horários cadastrados.')).toBeVisible()
  expect(screen.getByRole('img', { name: 'Manhã: 0; Tarde: 0' })).toBeVisible()
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(1)
})

it('exibe completude arredondada ao inteiro sem excluir canceladas da base', () => {
  renderDay('/calendar/2026-11-10', {
    ...diaMock.data, summary: { total: 3, complete: 1, pending: 1, cancelled: 1 },
  })
  expect(screen.getByRole('article', { name: 'Taxa de Completude' })).toHaveTextContent('33%')
})

it('exibe ocupação por contagem de slots arredondada ao inteiro', () => {
  renderDay('/calendar/2026-11-10', {
    ...diaMock.data, rooms: [{ ...diaMock.data.rooms[0], totalSlots: 3, occupiedSlots: 2 }],
  })
  expect(screen.getByRole('row', { name: /Sala 1/ })).toHaveTextContent('67%')
})

it('exibe zero percentual quando a base é positiva', () => {
  renderDay('/calendar/2026-11-10', {
    ...diaMock.data,
    summary: { total: 1, complete: 0, pending: 0, cancelled: 1 },
    rooms: [{ ...diaMock.data.rooms[0], appointmentCount: 1, cancelledCount: 1, totalSlots: 3, occupiedSlots: 0 }],
  })
  expect(within(screen.getByRole('article', { name: 'Taxa de Completude' })).getByText('0%', { exact: true })).toBeVisible()
  expect(within(screen.getByRole('row', { name: /Sala 1/ })).getByRole('cell', { name: '0%' })).toBeVisible()
})
