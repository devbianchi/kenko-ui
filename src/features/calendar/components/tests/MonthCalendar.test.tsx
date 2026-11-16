import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { MonthCalendar } from '../MonthCalendar'

function renderCalendar(month: string) {
  return render(<MemoryRouter><Routes>
    <Route path="*" element={<MonthCalendar month={month} today="2026-11-10" countsByDate={{ '2026-09-30': 2, '2026-10-01': 3 }} />} />
  </Routes></MemoryRouter>)
}

it('mostra outubro com 35 datas, incluindo datas reais de setembro e novembro', () => {
  renderCalendar('2026-10')
  for (const weekday of ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']) {
    expect(screen.getByText(weekday)).toBeVisible()
  }
  expect(screen.getAllByRole('link')).toHaveLength(35)
  expect(screen.getByRole('link', { name: '2026-09-27, 0 consultas' })).toHaveAttribute('href', '/calendar/2026-09-27')
  expect(screen.getByRole('link', { name: '2026-10-01, 3 consultas' })).toBeVisible()
  expect(screen.getByRole('link', { name: '2026-10-01, 3 consultas' })).toHaveClass('motion-safe:active:scale-100', 'motion-safe:hover:scale-102', 'motion-reduce:transition-none')
  expect(screen.getByRole('link', { name: '2026-10-31, 0 consultas' })).toBeVisible()
})

it('mostra seis semanas quando a grade mensal exige 42 dias', () => {
  renderCalendar('2026-08')
  expect(screen.getAllByRole('link')).toHaveLength(42)
})

it('mantém cinco semanas quando fevereiro começa no domingo', () => {
  renderCalendar('2026-02')
  expect(screen.getAllByRole('link')).toHaveLength(35)
})

it('destaca hoje e mantém os dias futuros do mês com a mesma acessibilidade', () => {
  renderCalendar('2026-11')
  expect(screen.getByRole('link', { name: '2026-11-10, 0 consultas, hoje' })).toBeVisible()
  expect(screen.getByRole('link', { name: '2026-11-30, 0 consultas' })).toBeVisible()
})

it.each([
  ['2024-02', '2024-01-28', '2024-02-29', '2024-03-02'],
  ['2026-12', '2026-11-29', '2026-12-31', '2027-01-02'],
])('preserva os limites reais da grade em %s', (month, first, inside, last) => {
  renderCalendar(month)
  const days = screen.getAllByRole('link')
  expect(days).toHaveLength(35)
  expect(days[0]).toHaveAttribute('href', `/calendar/${first}`)
  expect(screen.getByRole('link', { name: `${inside}, 0 consultas` })).toHaveAttribute('href', `/calendar/${inside}`)
  expect(days.at(-1)).toHaveAttribute('href', `/calendar/${last}`)
  expect(new Set(days.map(day => day.getAttribute('href'))).size).toBe(35)
})
