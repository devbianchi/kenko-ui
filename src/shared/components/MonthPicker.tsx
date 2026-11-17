import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { businessToday, MIN_SELECTABLE_MONTH } from '../utils/month'
import { isValidReference, periodLabels, type PeriodSelection } from '../utils/period'

const months = Array.from({ length: 12 }, (_, index) => {
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2026, index, 1)))
  return { value: String(index + 1).padStart(2, '0'), label: name[0].toUpperCase() + name.slice(1) }
})

export function MonthPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (month: string) => void
}) {
  return <PeriodPicker period="month" reference={value} onApply={selection => onChange(selection.reference)} />
}

export function PeriodPicker({ period, reference, allowPeriodChange = false, onApply }: PeriodSelection & {
  allowPeriodChange?: boolean
  onApply: (selection: PeriodSelection) => void
}) {
  const [confirmedYear, confirmedMonth = '01', confirmedDay = '01'] = reference.split('-')
  const [periodDraft, setPeriodDraft] = useState(period)
  const [yearDraft, setYearDraft] = useState(confirmedYear)
  const [monthDraft, setMonthDraft] = useState(confirmedMonth)
  const [dateDraft, setDateDraft] = useState(`${confirmedYear}-${confirmedMonth}-${confirmedDay}`)
  const minYear = Number(MIN_SELECTABLE_MONTH.slice(0, 4))
  const today = businessToday()
  const maxMonth = today.slice(0, 7)
  const maxYear = Number(maxMonth.slice(0, 4))
  const selected = months.find(option => option.value === confirmedMonth)
  const candidate = periodDraft === 'week' ? dateDraft : periodDraft === 'year' ? yearDraft : `${yearDraft}-${monthDraft}`
  const validDraft = isValidReference({ period: periodDraft, reference: candidate }, today)

  function discardDraft() {
    setPeriodDraft(period)
    setYearDraft(confirmedYear)
    setMonthDraft(confirmedMonth)
    setDateDraft(`${confirmedYear}-${confirmedMonth}-${confirmedDay}`)
  }
  useEffect(discardDraft, [period, confirmedYear, confirmedMonth, confirmedDay])

  function applyDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validDraft && (candidate !== reference || periodDraft !== period)) {
      onApply({ period: periodDraft, reference: candidate })
    }
  }

  return (
    <div className={`flex items-center gap-2 whitespace-nowrap ${allowPeriodChange ? 'ml-auto' : ''}`}>
      <span>Filtrar por</span>
      <details
        className="group relative"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            discardDraft()
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}
      >
        <summary aria-label={allowPeriodChange ? 'Período de Analytics' : 'Mês e ano'} className="flex cursor-pointer list-none items-center gap-1 rounded-full bg-field-background text-foreground px-2 py-1 text-label transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
          <CalendarDaysIcon className="size-4" aria-hidden="true" />
          {allowPeriodChange ? periodLabels[period] : `${selected?.label} ${confirmedYear}`}
        </summary>
        <form aria-label="Aplicar período" onSubmit={applyDraft} className="absolute right-0 z-20 mt-2 grid w-60 min-w-0 max-w-[calc(100vw-2rem)] grid-cols-1 origin-top-right gap-3 whitespace-normal rounded-card border border-border bg-background p-4 text-foreground shadow-card motion-safe:group-open:animate-pop-in">
          {allowPeriodChange && <label className="grid gap-1 text-label">
            Período
            <select value={periodDraft} onChange={event => {
              const next = event.target.value
              if (next === 'month' || next === 'week' || next === 'year') setPeriodDraft(next)
            }} className="rounded border border-border bg-background p-2 text-body">
              {Object.entries(periodLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>}
          {periodDraft === 'week' && <label className="grid gap-1 text-label">
            Último dia da semana
            <input type="date" value={dateDraft} min={MIN_SELECTABLE_MONTH + '-01'} max={today}
              onChange={event => setDateDraft(event.target.value)} aria-invalid={!validDraft}
              className="w-full min-w-0 rounded border border-border bg-background p-2 text-body" />
          </label>}
          {periodDraft === 'month' && <label className="grid gap-1 text-label">
            Mês
            <select
              aria-label="Mês"
              className="w-full min-w-0 max-w-full rounded border border-border bg-background p-2 text-body"
              value={monthDraft}
              onChange={event => setMonthDraft(event.target.value)}
            >
              {months.map(option => {
                const optionMonth = `${yearDraft}-${option.value}`
                return <option key={option.value} value={option.value} disabled={optionMonth < MIN_SELECTABLE_MONTH || optionMonth > maxMonth}>{option.label}</option>
              })}
            </select>
          </label>}
          {periodDraft !== 'week' && <label className="grid gap-1 text-label">
            Ano
            <input
              aria-label="Ano"
              type="number"
              min={minYear}
              max={maxYear}
              aria-invalid={!validDraft}
              className="w-full min-w-0 max-w-full rounded border border-border bg-background p-2 text-body"
              value={yearDraft}
              onChange={event => setYearDraft(event.target.value)}
            />
          </label>}
          {validDraft ? null : <p role="alert" className="break-words text-label text-red-700 dark:text-red-300">
            {periodDraft === 'month' ? 'Data inválida. Selecione um mês entre janeiro de 2024 e o mês atual.' : `Data inválida. Escolha um período entre janeiro de 2024 e ${today.split('-').reverse().join('/')}.`}
          </p>}
          <button
            type="submit"
            disabled={!validDraft}
            className="w-full rounded-full bg-foreground px-4 py-2 text-label font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray disabled:text-gray-ink disabled:opacity-70 motion-reduce:transition-none"
          >
            Aplicar
          </button>
        </form>
      </details>
    </div>
  )
}
