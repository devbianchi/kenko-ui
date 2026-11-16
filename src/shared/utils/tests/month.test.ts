import { afterEach, expect, it, vi } from 'vitest'
import { businessToday, currentBusinessMonth } from '../month'

afterEach(() => vi.useRealTimers())

it.each([
  ['2026-12-01T02:59:59.999Z', '2026-11-30', '2026-11'],
  ['2026-12-01T03:00:00.000Z', '2026-12-01', '2026-12'],
])('determina o dia e o mês de negócio na virada de Brasília em %s', (instant, day, month) => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(instant))
  expect(businessToday()).toBe(day)
  expect(currentBusinessMonth()).toBe(month)
})
