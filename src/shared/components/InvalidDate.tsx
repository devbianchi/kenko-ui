import type { ReactNode } from 'react'
import { Link } from 'react-router'

export function InvalidDate({ message, returnTo, returnLabel, children }: {
  message: string
  returnTo: string
  returnLabel: string
  children: ReactNode
}) {
  return (
    <section className="mx-auto mt-6 max-w-[43em] space-y-5 rounded-3xl bg-background p-4 text-center shadow-card sm:mt-12 sm:p-7">
      <header className="rounded-lg bg-foreground p-4 text-background">
        <h1 className="font-heading text-metric font-bold sm:text-page">Data Inválida :/</h1>
        <p>{message}</p>
      </header>
      <div className="mx-auto w-fit text-left">
        <p>Tenha certeza de que sua data:</p>
        <ul className="list-disc pl-6 font-semibold">{children}</ul>
      </div>
      <Link to={returnTo} className="inline-block rounded-xl bg-foreground px-4 py-2 font-semibold text-background motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-102 motion-safe:active:scale-100">{returnLabel}</Link>
    </section>
  )
}
