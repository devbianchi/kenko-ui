import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { currentBusinessMonth, MIN_SELECTABLE_MONTH } from '../utils/month'

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
  const [confirmedYear, confirmedMonth] = value.split('-')
  const [yearDraft, setYearDraft] = useState(confirmedYear)
  const [monthDraft, setMonthDraft] = useState(confirmedMonth)
  const minYear = Number(MIN_SELECTABLE_MONTH.slice(0, 4))
  const maxMonth = currentBusinessMonth()
  const maxYear = Number(maxMonth.slice(0, 4))
  const selected = months.find(option => option.value === confirmedMonth)
  const candidate = `${yearDraft}-${monthDraft}`
  const validDraft = /^\d{4}-(0[1-9]|1[0-2])$/.test(candidate)
    && candidate >= MIN_SELECTABLE_MONTH
    && candidate <= maxMonth

  useEffect(() => {
    setYearDraft(confirmedYear)
    setMonthDraft(confirmedMonth)
  }, [value, confirmedYear, confirmedMonth])

  function discardDraft() {
    setYearDraft(confirmedYear)
    setMonthDraft(confirmedMonth)
  }

  function applyDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validDraft && candidate !== value) onChange(candidate)
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
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
        <summary aria-label="Mês e ano" className="flex cursor-pointer list-none items-center gap-1 rounded-full bg-field-background px-2 py-1 text-label transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
          <CalendarDaysIcon className="size-4" aria-hidden="true" />
          {selected?.label} {confirmedYear}
        </summary>
        <form aria-label="Aplicar período" onSubmit={applyDraft} className="absolute right-0 z-20 mt-2 grid w-60 min-w-0 max-w-[calc(100vw-2rem)] grid-cols-1 origin-top-right gap-3 whitespace-normal rounded-card border border-border bg-background p-4 shadow-card motion-safe:group-open:animate-pop-in">
          <label className="grid gap-1 text-label">
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
          </label>
          <label className="grid gap-1 text-label">
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
          </label>
          {validDraft ? null : <p role="alert" className="break-words text-label text-red-700">Data inválida. Selecione um mês entre janeiro de 2024 e o mês atual.</p>}
          <button
            type="submit"
            disabled={!validDraft}
            className="w-full rounded-full bg-foreground px-4 py-2 text-label font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray disabled:text-foreground disabled:opacity-70 motion-reduce:transition-none"
          >
            Aplicar
          </button>
        </form>
      </details>
    </div>
  )
}
