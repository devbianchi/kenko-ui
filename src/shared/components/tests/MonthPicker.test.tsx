import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MonthPicker } from '../MonthPicker'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-12T12:00:00-03:00'))
})
afterEach(() => vi.useRealTimers())

it('mantém o rascunho fora da URL e confirma mês e ano juntos ao aplicar', async () => {
  const user = userEvent.setup()
  const change = vi.fn()
  function Example() {
    const [value, setValue] = useState('2026-11')
    return <MonthPicker value={value} onChange={month => { change(month); setValue(month) }} />
  }
  render(<Example />)
  await user.click(screen.getByLabelText('Mês e ano'))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Mês' }), '10')
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  await user.type(year, '2025')
  expect(change).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro 2026')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(change).toHaveBeenCalledExactlyOnceWith('2025-10')
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Outubro 2025')
})

it.each(['', '202', '2023', '2027', '2025.5', '1e3'])('bloqueia a aplicação do ano inválido %j e preserva o período', async draft => {
  const user = userEvent.setup()
  const change = vi.fn()
  render(<MonthPicker value="2026-11" onChange={change} />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  if (draft) await user.type(year, draft)
  expect(screen.getByRole('alert')).toHaveTextContent('Data inválida')
  expect(within(screen.getByRole('form', { name: 'Aplicar período' })).getByRole('alert')).toBeVisible()
  const apply = screen.getByRole('button', { name: 'Aplicar' })
  expect(apply).toBeDisabled()
  await user.click(apply)
  expect(change).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro 2026')
})

it('permite os limites válidos de janeiro/2024 e novembro/2026', async () => {
  const user = userEvent.setup()
  const change = vi.fn()
  function Example() {
    const [value, setValue] = useState('2026-11')
    return <MonthPicker value={value} onChange={month => { change(month); setValue(month) }} />
  }
  render(<Example />)
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  await user.type(year, '2024')
  const month = screen.getByRole('combobox', { name: 'Mês' })
  await user.selectOptions(month, '01')
  expect(screen.getByRole('button', { name: 'Aplicar' })).toBeEnabled()
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(change).toHaveBeenLastCalledWith('2024-01')
  await user.click(screen.getByLabelText('Mês e ano'))
  expect(screen.getByRole('option', { name: 'Dezembro' })).toBeEnabled()
})

it('mantém o filtro fechado e restaura o rascunho ao pressionar Escape', async () => {
  const user = userEvent.setup()
  render(<MonthPicker value="2026-11" onChange={vi.fn()} />)
  const trigger = screen.getByLabelText('Mês e ano')
  await user.click(trigger)
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  await user.type(year, '2025')
  await user.keyboard('{Escape}')
  expect(trigger).toHaveFocus()
  await user.click(trigger)
  expect(screen.getByRole('spinbutton', { name: 'Ano' })).toHaveValue(2026)
  expect(screen.getByRole('combobox', { name: 'Mês' })).toHaveValue('11')
})

it('desabilita meses futuros em Brasília', async () => {
  vi.setSystemTime(new Date('2026-12-01T01:00:00Z'))
  const user = userEvent.setup()
  render(<MonthPicker value="2026-11" onChange={vi.fn()} />)
  await user.click(screen.getByLabelText('Mês e ano'))
  expect(screen.getByRole('option', { name: 'Dezembro' })).toBeDisabled()
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Ano' }), { target: { value: '2027' } })
  expect(screen.getByRole('alert')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled()
})
