import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { DayPage } from '../pages/DayPage'
import type { DayData } from '../pages/DayPage'
import { diaMock } from '../../../../mocks/day/dia'

function renderDay(route = '/calendar/2026-11-10', data: DayData = diaMock.data) {
  return render(<MemoryRouter initialEntries={[route]}><Routes>
    <Route path="/calendar/:date" element={<DayPage data={data} />} />
    <Route path="/calendar" element={<DayPage data={data} />} />
  </Routes></MemoryRouter>)
}

it('mostra resumo do mock e data selecionada, mantendo o mesmo mock para qualquer data', () => {
  renderDay('/calendar/2026-11-10')
  expect(screen.getByRole('heading', { name: '10 de novembro/2026, terça-feira' })).toBeVisible()
  expect(screen.getByRole('article', { name: 'Total' })).toHaveTextContent('4')
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('2')
  expect(screen.getByRole('article', { name: 'Pendentes' })).toHaveTextContent('1')
  expect(screen.getByRole('article', { name: 'Canceladas' })).toHaveTextContent('1')
  expect(screen.getByRole('article', { name: 'Taxa de Completude' })).toHaveTextContent('50%')
})

it('expõe resumo, gráficos e tabela em regiões acessíveis', () => {
  renderDay()
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
})
