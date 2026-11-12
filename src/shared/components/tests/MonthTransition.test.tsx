import { act, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { MonthTransition } from '../MonthTransition'

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
