import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MonthTransition } from '../MonthTransition'

afterEach(() => vi.useRealTimers())

it.each([0, 150])('restaura conteúdo visível ao voltar durante a transição após %s ms', elapsed => {
  vi.useFakeTimers()
  const content = (month: string) => <span>{month}</span>
  const view = render(<MonthTransition value="2026-10">{content}</MonthTransition>)
  view.rerender(<MonthTransition value="2026-11">{content}</MonthTransition>)
  act(() => vi.advanceTimersByTime(elapsed))
  const returnMonth = elapsed === 0 ? '2026-10' : '2026-11'
  // For the second case, interrupt the pending entry, then return to its content.
  if (elapsed === 150) {
    view.rerender(<MonthTransition value="2026-09">{content}</MonthTransition>)
  }
  view.rerender(<MonthTransition value={returnMonth}>{content}</MonthTransition>)
  act(() => vi.runAllTimers())
  expect(screen.getByText(returnMonth).parentElement).toHaveClass('opacity-100')
})

it('substitui o conteúdo sem esperar o fade quando há movimento reduzido', () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
  try {
    const view = render(<MonthTransition value="2026-10">{month => <span>{month}</span>}</MonthTransition>)
    view.rerender(<MonthTransition value="2026-11">{month => <span>{month}</span>}</MonthTransition>)
    act(() => vi.advanceTimersByTime(0))
    expect(screen.getByText('2026-11').parentElement).toHaveClass('opacity-100')
  } finally {
    vi.unstubAllGlobals()
  }
})

it('faz fade-out do período anterior, troca o conteúdo e faz fade-in do novo período', () => {
  vi.useFakeTimers()
  const view = render(<MonthTransition value="2026-10">{month => <span>{month}</span>}</MonthTransition>)
  expect(screen.getByText('2026-10')).toBeVisible()

  view.rerender(<MonthTransition value="2026-11">{month => <span>{month}</span>}</MonthTransition>)
  expect(screen.getByText('2026-10').parentElement).toHaveClass('opacity-0')

  act(() => vi.advanceTimersByTime(150))
  expect(screen.getByText('2026-11')).toBeVisible()
  expect(screen.getByText('2026-11').parentElement).toHaveClass('opacity-0')

  act(() => vi.advanceTimersByTime(20))
  expect(screen.getByText('2026-11').parentElement).toHaveClass('opacity-100')
  vi.useRealTimers()
})
