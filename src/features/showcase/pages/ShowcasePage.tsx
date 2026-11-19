import { PlusIcon } from '@heroicons/react/24/outline'
import { ConversationList } from '../components/ConversationList'
import { ConversationPanel } from '../components/ConversationPanel'
import { useShowcase } from '../useShowcase'

export function ShowcasePage() {
  const showcase = useShowcase()

  return (
    <section aria-labelledby="showcase-title" className="mx-auto max-w-dashboard-header">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="showcase-title" className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Showcase</h1>
          <p className="mt-1 text-base text-text-muted sm:text-lg">Experimente o fluxo do nosso sistema e marque sua própria consulta!</p>
        </div>
        <button type="button" onClick={() => void showcase.create()} disabled={showcase.creating} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-foreground px-3 py-2 text-label font-semibold text-background dark:bg-background dark:text-foreground shadow-card transition-[scale,opacity] duration-150 hover:opacity-90 active:scale-95 disabled:opacity-60 motion-reduce:transition-none">
          <PlusIcon aria-hidden="true" className="size-5" /> Nova Conversa
        </button>
      </div>

      {showcase.createFailed && (
        <p role="alert" className="mb-2 rounded-xl bg-background p-3 shadow-card">
          Não foi possível iniciar a conversa. Use “Nova Conversa” para tentar de novo.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:h-[min(70vh,48rem)] sm:min-h-0 sm:grid-cols-[minmax(13rem,0.28fr)_minmax(0,1fr)] sm:grid-rows-1">
        <ConversationList items={showcase.items} selectedId={showcase.selected?.id ?? null} onSelect={showcase.select} onHide={showcase.hide} />
        <ConversationPanel selected={showcase.selected} onSend={showcase.send} onRetry={showcase.retry}
          onRefresh={id => void showcase.refresh(id)} onStartNew={() => void showcase.create()} />
      </div>
    </section>
  )
}
