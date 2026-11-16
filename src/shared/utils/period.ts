import { MIN_SELECTABLE_MONTH } from './month'

export const periodLabels = { week: 'Semana', month: 'Mês', year: 'Ano' } as const
export type Period = keyof typeof periodLabels
export type PeriodSelection = { period: Period; reference: string }

export function isValidReference({ period, reference }: PeriodSelection, today: string) {
  if (period === 'year') {
    return /^\d{4}$/.test(reference) && reference >= MIN_SELECTABLE_MONTH.slice(0, 4) && reference <= today.slice(0, 4)
  }
  if (period === 'month') {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(reference) && reference >= MIN_SELECTABLE_MONTH && reference <= today.slice(0, 7)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reference) || reference < MIN_SELECTABLE_MONTH + '-01' || reference > today) return false
  const date = new Date(reference + 'T12:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === reference
}
