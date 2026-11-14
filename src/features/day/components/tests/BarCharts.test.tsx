import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { DayPeriodChart, HourlyAppointmentsChart } from '../DayCharts'

it('dimensiona série horária pelos dados recebidos e preserva zeros', () => {
  const { container } = render(<HourlyAppointmentsChart hours={[6, 7, 8, 10, 14, 17, 18]} counts={[30, 0, 2, 4, 0, 5, 40]} />)
  expect(screen.getByRole('img', { name: 'Consultas por horário, 5 horários' })).toBeVisible()
  expect(screen.queryByLabelText('06:00 — 30 consultas')).not.toBeInTheDocument()
  expect(container.querySelector('title')).toBeNull()
  expect(screen.getByLabelText('10:00 — 4 consultas')).toBeVisible()
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
  expect(screen.getByLabelText('09:00 — 2 consultas')).toBeVisible()
  expect(container.querySelector('title')).toBeNull()
})


it('mostra a contagem exata em popup customizado no hover e remove ao sair', async () => {
  const user = userEvent.setup()
  const { container } = render(<HourlyAppointmentsChart hours={[7, 10, 17]} counts={[0, 4, 2]} />)
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  const bar = screen.getByLabelText('10:00 — 4 consultas')
  await user.hover(bar)
  expect(screen.getByRole('tooltip')).toHaveTextContent('10:00 — 4 consultas')
  expect(bar).toHaveAccessibleDescription('10:00 — 4 consultas')
  expect(container.querySelector('title, [title]')).toBeNull()
  await user.unhover(bar)
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  await user.hover(screen.getByLabelText('07:00 — 0 consultas'))
  expect(screen.getByRole('tooltip')).toHaveTextContent('07:00 — 0 consultas')
  await user.unhover(screen.getByLabelText('07:00 — 0 consultas'))
  await user.hover(screen.getByLabelText('17:00 — 2 consultas'))
  expect(screen.getByRole('tooltip')).toHaveTextContent('17:00 — 2 consultas')
})

it('oferece popup pelo teclado, fecha com Escape e ao perder foco', async () => {
  const user = userEvent.setup()
  render(<HourlyAppointmentsChart hours={[7, 8]} counts={[0, 3]} />)
  await user.tab()
  expect(screen.getByRole('tooltip')).toHaveTextContent('07:00 — 0 consultas')
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  expect(screen.getByLabelText('07:00 — 0 consultas')).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('tooltip')).toHaveTextContent('08:00 — 3 consultas')
  await user.tab()
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
})
