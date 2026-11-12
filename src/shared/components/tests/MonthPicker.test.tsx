import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MonthPicker } from '../MonthPicker'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-12T12:00:00-03:00'))
})
afterEach(() => vi.useRealTimers())

it('mantém rascunho local e confirma uma única vez ao pressionar Enter', async () => {
  const user = userEvent.setup()
  const change = vi.fn()
  render(<MonthPicker value="2026-11" onChange={change} />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  expect(year).toHaveValue(null)
  await user.type(year, '202')
  expect(year).toHaveValue(202)
  expect(change).not.toHaveBeenCalled()
  await user.type(year, '5')
  expect(change).not.toHaveBeenCalled()
  await user.keyboard('{Enter}')
  expect(change).toHaveBeenCalledExactlyOnceWith('2025-11')
})

it.each(['', '202', '2023', '2027', '2025.5', '1e3', 'abc'])('rejeita o rascunho %j ao concluir, preservando o período confirmado', async draft => {
  const user = userEvent.setup()
  const change = vi.fn()
  render(<MonthPicker value="2026-11" onChange={change} />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  if (draft) await user.type(year, draft)
  expect(change).not.toHaveBeenCalled()
  await user.tab()
  expect(change).not.toHaveBeenCalled()
  expect(year).toHaveValue(2026)
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro')
  await user.clear(year)
  await user.type(year, '2024')
  await user.tab()
  expect(change).toHaveBeenCalledExactlyOnceWith('2024-11')
})

it('permite janeiro e dezembro de 2024', async () => {
  const user = userEvent.setup()
  const change = vi.fn()
  function Example() {
    const [value, setValue] = useState('2026-11')
    return <MonthPicker value={value} onChange={next => { change(next); setValue(next) }} />
  }
  render(<Example />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  expect(year).toHaveAttribute('min', '2024')
  await user.clear(year)
  await user.type(year, '2024')
  await user.tab()
  const month = screen.getByRole('combobox', { name: 'Mês' })
  expect(screen.getByRole('option', { name: 'Janeiro' })).toBeEnabled()
  expect(screen.getByRole('option', { name: 'Dezembro' })).toBeEnabled()
  await user.selectOptions(month, '01')
  expect(change).toHaveBeenLastCalledWith('2024-01')
  await user.selectOptions(month, '12')
  expect(change).toHaveBeenLastCalledWith('2024-12')
  expect(year).toHaveValue(2024)
})

it('permite substituir o ano digitando após limpar o campo', async () => {
  const user = userEvent.setup()
  function Example() {
    const [month, setMonth] = useState('2026-11')
    return <MonthPicker value={month} onChange={setMonth} />
  }
  render(<Example />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  await user.type(year, '2025')
  await user.tab()
  expect(year).toHaveValue(2025)
})

it('exibe mês em português, altera mês e ano e rejeita ano inválido', async () => {
  const user = userEvent.setup()
  const change = vi.fn()
  function Example() {
    const [month, setMonth] = useState('2026-11')
    return <MonthPicker value={month} onChange={value => { change(value); setMonth(value) }} />
  }
  render(<Example />)
  const trigger = screen.getByLabelText('Mês e ano')
  expect(trigger).toHaveTextContent('Novembro')
  await user.click(trigger)
  await user.selectOptions(screen.getByRole('combobox', { name: 'Mês' }), '02')
  expect(trigger).toHaveTextContent('Fevereiro')
  expect(change).toHaveBeenLastCalledWith('2026-02')
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Ano' }), { target: { value: '2025' } })
  fireEvent.blur(screen.getByRole('spinbutton', { name: 'Ano' }))
  expect(change).toHaveBeenLastCalledWith('2025-02')
  for (const value of ['', '0', '10000']) {
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Ano' }), { target: { value } })
    fireEvent.blur(screen.getByRole('spinbutton', { name: 'Ano' }))
  }
  expect(change).toHaveBeenCalledTimes(2)
  expect(screen.getByRole('spinbutton', { name: 'Ano' })).toHaveValue(2025)
  await user.keyboard('{Escape}')
  expect(trigger).toHaveFocus()
  expect(screen.getByRole('combobox', { name: 'Mês', hidden: true })).not.toBeVisible()
})

it('bloqueia períodos futuros e permite todos os meses dos anos anteriores', async () => {
  const user = userEvent.setup()
  const change = vi.fn()
  function Example() {
    const [month, setMonth] = useState('2026-11')
    return <MonthPicker value={month} onChange={next => { change(next); setMonth(next) }} />
  }
  render(<Example />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const month = screen.getByRole('combobox', { name: 'Mês' })
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  expect(screen.getByRole('option', { name: 'Dezembro' })).toBeDisabled()
  expect(screen.getByRole('option', { name: 'Novembro' })).toBeEnabled()
  expect(year).toHaveAttribute('max', '2026')
  fireEvent.change(month, { target: { value: '12' } })
  fireEvent.change(year, { target: { value: '2027' } })
  fireEvent.blur(year)
  expect(change).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro')
  expect(year).toHaveValue(2026)
  fireEvent.change(year, { target: { value: '2025' } })
  fireEvent.blur(year)
  expect(screen.getByRole('option', { name: 'Dezembro' })).toBeEnabled()
  await user.selectOptions(month, '12')
  expect(change).toHaveBeenLastCalledWith('2025-12')
  fireEvent.change(year, { target: { value: '2026' } })
  fireEvent.blur(year)
  expect(change).toHaveBeenLastCalledWith('2026-11')
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro')
})

it('usa Brasília na virada do mês, mesmo quando UTC já está no mês seguinte', async () => {
  vi.setSystemTime(new Date('2026-12-01T01:00:00Z'))
  const user = userEvent.setup()
  render(<MonthPicker value="2026-11" onChange={vi.fn()} />)
  await user.click(screen.getByLabelText('Mês e ano'))
  expect(screen.getByRole('option', { name: 'Dezembro' })).toBeDisabled()
})
