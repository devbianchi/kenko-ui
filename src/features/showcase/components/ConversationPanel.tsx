import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { formatTime } from '../format'
import type { Input } from '../types'
import type { useShowcase } from '../useShowcase'
import { ViewControls } from './views/ViewControls'

type Selected = NonNullable<ReturnType<typeof useShowcase>['selected']>

type ConversationPanelProps = {
  selected: Selected | null
  onSend: (id: string, input: Input, label: string) => void
  onRetry: (id: string) => void
  onRefresh: (id: string) => void
  onStartNew: () => void
}

const endedTexts = {
  closed: 'Atendimento encerrado.',
  abandoned: 'Esta conversa ficou inativa por mais de uma hora e não pode continuar.',
  unavailable: 'Esta conversa não existe mais na API. A demonstração pode ter sido recarregada.',
} as const

function Empty() {
  return (
    <div className="flex flex-col items-center gap-3 p-6 text-center text-text-muted motion-safe:animate-pop-in" role="status">
      <ChatBubbleLeftIcon className="size-10" aria-hidden="true" />
      <p>Inicie uma nova conversa para começar o atendimento.</p>
    </div>
  )
}

export function ConversationPanel({ selected, onSend, onRetry, onRefresh, onStartNew }: ConversationPanelProps) {
  if (selected === null) {
    return <section aria-label="Chat da conversa" className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border bg-chat-panel p-4 shadow-card sm:p-6"><Empty /></section>
  }

  const { id, state, transcript, sending, notice, pending } = selected
  const ended = selected.status === 'active' && state?.view.type !== 'closed' ? null : selected.status === 'active' ? 'closed' : selected.status
  // Com uma ação de resultado incerto, nada novo é enviado até reenviar ou atualizar o estado.
  const blocked = sending || pending !== null
  const send = (input: Input, label: string) => onSend(id, input, label)

  return (
    <section aria-label="Chat da conversa" className="flex min-h-[28rem] min-w-0 justify-start overflow-y-auto rounded-2xl border border-border bg-chat-panel p-4 shadow-card sm:p-6 sm:pl-[8%]">
      <div key={id} className="flex w-full max-w-[30rem] flex-col gap-2">
        <ol aria-label="Mensagens" className="grid gap-2">
          {transcript.map(entry => (
            <li key={entry.key} className={entry.author === 'user' ? 'justify-self-end' : ''}>
              <article aria-label={entry.author === 'bot' ? 'Mensagem do Kenko BOT' : 'Sua mensagem'}
                className={`rounded-2xl p-4 shadow-card ${entry.author === 'bot' ? 'bg-background' : 'bg-primary text-background'}`}>
                {entry.author === 'bot' && <p className="mb-1 font-brand text-sm font-normal text-text-muted">KENKO</p>}
                <div className="flex items-end justify-between gap-3 text-[0.95em] leading-[1.35]">
                  <p className="whitespace-pre-line">{entry.text}</p>
                  <time dateTime={entry.at} className="shrink-0 text-label opacity-80">{formatTime(entry.at)}</time>
                </div>
              </article>
            </li>
          ))}
        </ol>

        {sending && <p role="status" className="text-label text-text-muted motion-safe:animate-pulse">Kenko BOT está digitando…</p>}

        {notice && (
          <div role={notice.kind === 'info' ? 'status' : 'alert'} className="rounded-2xl bg-background p-3 shadow-card">
            <p>{notice.text}</p>
            {notice.kind === 'uncertain' && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={sending} onClick={() => onRetry(id)} className="rounded-xl bg-foreground px-3 py-1.5 text-label font-semibold text-background disabled:opacity-60">Reenviar</button>
                <button type="button" disabled={sending} onClick={() => onRefresh(id)} className="rounded-xl border border-border px-3 py-1.5 text-label font-semibold disabled:opacity-60">Atualizar estado</button>
              </div>
            )}
          </div>
        )}

        {ended ? (
          <div className="rounded-2xl bg-background p-3 shadow-card">
            <p>{endedTexts[ended]}</p>
            <button type="button" onClick={onStartNew} className="mt-2 rounded-xl bg-foreground px-3 py-1.5 text-label font-semibold text-background">Iniciar novo atendimento</button>
          </div>
        ) : state && (
          <>
            <ViewControls view={state.view} disabled={blocked} fieldErrors={notice && notice.kind !== 'uncertain' ? notice.fields : undefined} onSend={send} />
            {state.availableActions.includes('exit') && (
              <button type="button" disabled={blocked} onClick={() => send({ type: 'exit' }, 'Sair')}
                className="self-start rounded-xl border border-border px-3 py-1.5 text-label font-semibold disabled:opacity-60">Sair</button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
