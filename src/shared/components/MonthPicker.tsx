import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { currentBusinessMonth, MIN_SELECTABLE_MONTH } from "../utils/month";

const months = Array.from({ length: 12 }, (_, index) => {
  const name = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, index, 1)));
  return {
    value: String(index + 1).padStart(2, "0"),
    label: name[0].toUpperCase() + name.slice(1),
  };
});

export function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (month: string) => void;
}) {
  const [year, month] = value.split("-");
  const [yearDraft, setYearDraft] = useState(year);
  const minYear = Number(MIN_SELECTABLE_MONTH.slice(0, 4));
  const maxMonth = currentBusinessMonth();
  const maxYear = Number(maxMonth.slice(0, 4));
  const selected = months.find((option) => option.value === month);

  useEffect(() => {
    setYearDraft(year);
  }, [value, year]);

  function confirmYear() {
    const nextYear = Number(yearDraft);
    if (!/^\d{4}$/.test(yearDraft) || nextYear < minYear || nextYear > maxYear) {
      setYearDraft(year);
      return;
    }

    const candidate = `${yearDraft}-${month}`;
    const nextMonth = candidate > maxMonth ? maxMonth : candidate;
    setYearDraft(nextMonth.slice(0, 4));
    if (nextMonth !== value) onChange(nextMonth);
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span>Filtrar por</span>
      <details
        className="group relative"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}
      >
        <summary
          aria-label="Mês e ano"
          className="flex cursor-pointer list-none items-center gap-1 hover:opacity-80 transition-opacity rounded-full bg-field-background px-2 py-1 text-label [&::-webkit-details-marker]:hidden"
        >
          <CalendarDaysIcon className="size-4" aria-hidden="true" />
          {selected?.label}
        </summary>
        <fieldset className="absolute right-0 z-10 mt-2 grid w-56 origin-top-right gap-3 rounded-card border border-border bg-background p-4 shadow-card motion-safe:group-open:animate-pop-in">
          <legend className="sr-only">Selecionar período</legend>
          <label className="grid gap-1 text-label">
            Mês
            <select
              aria-label="Mês"
              className="w-full rounded border border-border bg-background p-2 text-body"
              value={month}
              onChange={(event) => {
                const next = `${year}-${event.target.value}`;
                if (next >= MIN_SELECTABLE_MONTH && next <= maxMonth) onChange(next);
              }}
            >
              {months.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={`${year}-${option.value}` < MIN_SELECTABLE_MONTH || `${year}-${option.value}` > maxMonth}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-label">
            Ano
            <input
              aria-label="Ano"
              type="number"
              min={minYear}
              max={maxYear}
              className="w-full rounded border border-border bg-background p-2 text-body"
              value={yearDraft}
              onChange={(event) => setYearDraft(event.target.value)}
              onBlur={confirmYear}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
            />
          </label>
        </fieldset>
      </details>
    </div>
  );
}
