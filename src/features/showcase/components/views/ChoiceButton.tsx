import type { ReactNode } from 'react'
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

export function ChoiceButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-2 rounded-2xl bg-background px-3 py-3 text-left font-heading text-body font-semibold shadow-card transition-[scale,box-shadow] duration-150 hover:scale-[1.01] hover:shadow-card-hover active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none">
      <ArrowUturnLeftIcon className="size-5 shrink-0" aria-hidden="true" />
      <span className="underline decoration-primary decoration-dotted decoration-2 underline-offset-4">{children}</span>
    </button>
  )
}
