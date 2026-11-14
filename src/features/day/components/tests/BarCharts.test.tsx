import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { DayPeriodChart, HourlyAppointmentsChart } from '../DayCharts'

it('dimensiona série horária pelos dados recebidos e preserva zeros', () => {
  const { container } = render(<HourlyAppointmentsChart hours={[6, 7, 8, 10, 14, 17, 18]} counts={[30, 0, 2, 4, 0, 5, 40]} />)
  expect(screen.getByRole('img', { name: 'Consultas por horário, 5 horários' })).toBeVisible()
  expect(Array.from(container.querySelectorAll('title')).map(title => title.textContent)).not.toContain('06:00 — 30 consultas')
  expect(Array.from(container.querySelectorAll('title')).map(title => title.textContent)).toContain('10:00 — 4 consultas')
  expect(container.querySelectorAll('rect')).toHaveLength(5)
  expect(screen.getByLabelText('10:00 — 4 consultas')).toBeVisible()
  expect(container.querySelector('svg text')).toBeNull()
  expect(container.querySelectorAll('[aria-hidden="true"] span')).toHaveLength(5)
  expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('78101417')
})

it('agrupa horários no limite do meio-dia e trata valores zero', () => {
  const { rerender } = render(<DayPeriodChart hours={[11, 12, 15]} counts={[2, 3, 1]} />)
  expect(screen.getByRole('img', { name: 'Manhã: 2; Tarde: 4' })).toBeVisible()
  rerender(<DayPeriodChart hours={[11, 12]} counts={[0, 0]} />)
  expect(screen.getByRole('img', { name: 'Manhã: 0; Tarde: 0' })).toBeVisible()
})

it('mostra estado vazio sem horas e ignora contagens sem horário correspondente', () => {
  const { rerender, container } = render(<HourlyAppointmentsChart hours={[]} counts={[]} />)
  expect(screen.getByText('Sem horários cadastrados.')).toBeVisible()
  rerender(<HourlyAppointmentsChart hours={[9]} counts={[2, 100]} />)
  expect(screen.getByRole('img', { name: 'Consultas por horário, 1 horários' })).toBeVisible()
  expect(container.querySelector('title')?.textContent).toBe('09:00 — 2 consultas')
})
