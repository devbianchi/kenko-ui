import { ArrowUturnLeftIcon, ChatBubbleLeftIcon, EllipsisHorizontalIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { criarConversaMock } from '../../../../mocks/showcase/criar_conversa_response'

type Conversation = { id: number }

const options = criarConversaMock.view.options
const messageTime = '16:50'

export function ShowcasePage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [nextId, setNextId] = useState(1)

  function createConversation() {
    const conversation = { id: nextId }
    setNextId(current => current + 1)
    setConversations(current => [conversation, ...current])
    setSelectedId(conversation.id)
  }

  function deleteConversation(id: number) {
    setConversations(current => {
      const remaining = current.filter(conversation => conversation.id !== id)
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? null)
      return remaining
    })
  }

  const selected = conversations.find(conversation => conversation.id === selectedId)

  return (
    <section aria-labelledby="showcase-title" className="mx-auto max-w-dashboard-header">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="showcase-title" className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Showcase</h1>
          <p className="mt-1 text-base text-text-muted sm:text-lg">Experimente o fluxo do nosso sistema e marque sua própria consulta!</p>
        </div>
        <button type="button" onClick={createConversation} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-foreground px-3 py-2 text-label font-semibold text-background shadow-card transition-[scale,opacity] duration-150 hover:opacity-90 active:scale-95 motion-reduce:transition-none">
          <PlusIcon aria-hidden="true" className="size-5" /> Nova Conversa
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:h-[min(70vh,48rem)] sm:min-h-0 sm:grid-cols-[minmax(13rem,0.28fr)_minmax(0,1fr)] sm:grid-rows-1">
        <aside aria-label="Conversas" className="flex h-[min(35vh,24rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-card sm:h-full sm:p-4">
          <h2 className="mb-3 flex items-center gap-2 px-1 font-heading text-section font-semibold"><ChatBubbleLeftIcon className="size-6" aria-hidden="true" /> Conversas</h2>
          <ul className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pr-1">
            {conversations.map(conversation => (
              <li key={conversation.id} className={`group relative flex items-center rounded-xl shadow-card transition-[scale,box-shadow] duration-150 hover:shadow-card-hover motion-reduce:transition-none ${selectedId === conversation.id ? 'bg-chat-panel' : 'bg-background'}`}>
                <button type="button" onClick={() => setSelectedId(conversation.id)} aria-current={selectedId === conversation.id ? 'true' : undefined} className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-chat-panel">
                  <span aria-label="Kenko BOT" className="grid size-7 shrink-0 place-items-center rounded-full bg-bot-avatar font-brand text-lg font-normal text-background">K</span>
                  <span className="truncate font-heading font-semibold">Kenko BOT</span>
                  <span className="ml-auto pr-1 text-label text-text-muted">1m</span>
                </button>
                <details className="group/menu relative mr-1 shrink-0">
                  <summary aria-label={`Opções da conversa ${conversation.id}`} className="grid size-7 cursor-pointer list-none place-items-center rounded-full text-text-muted hover:bg-border [&::-webkit-details-marker]:hidden"><EllipsisHorizontalIcon className="size-4" aria-hidden="true" /></summary>
                  <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 origin-top-right rounded-xl border border-border bg-background p-1 shadow-card motion-safe:group-open/menu:animate-pop-in">
                    <button role="menuitem" type="button" onClick={() => deleteConversation(conversation.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-label text-red-800 transition-colors hover:bg-red-50 motion-reduce:transition-none"><TrashIcon className="size-4" aria-hidden="true" /> Apagar conversa</button>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </aside>

        <section aria-label="Chat da conversa" className={`flex min-h-[28rem] items-center rounded-2xl border border-border bg-chat-panel p-4 shadow-card sm:p-6 ${selected ? 'justify-start sm:pl-[8%]' : 'justify-center'}`}>
          {selected ? (
            <div key={selected.id} className="flex w-full max-w-[30rem] flex-col gap-2 motion-safe:animate-pop-in">
              <article className="rounded-2xl bg-background p-4 shadow-card sm:p-5" aria-label="Mensagem do Kenko BOT">
                <p className="mb-1 font-brand text-sm font-normal text-text-muted">KENKO</p>
                <p className="font-sans text-[0.95em] leading-[1.35] text-foreground"><strong>Olá! 👋<br />Eu sou o assistente virtual Kenko!</strong><br />Estou aqui para tornar o seu atendimento mais rápido: por mensagens simples, você agenda sua consulta sem precisar esperar na fila.</p>
                <p className="mt-4 font-sans text-[0.95em] leading-[1.35] text-foreground"><strong>Como funciona:</strong> eu faço algumas perguntas, você responde selecionando a opção, e no final eu mostro os horários disponíveis para você escolher. Pode apertar a tecla de sair a qualquer momento.</p>
                <div className="mt-4 flex items-end justify-between gap-2 font-sans text-[0.95em] leading-[1.35]"><strong>Como posso ajudar você hoje?</strong><time className="shrink-0 text-label text-text-muted">{messageTime}</time></div>
              </article>
              {options.map(option => <button key={option.label} type="button" className="flex w-full items-center gap-2 rounded-2xl bg-background px-3 py-3 text-left font-heading text-body font-semibold shadow-card transition-[scale,box-shadow] duration-150 hover:scale-[1.01] hover:shadow-card-hover active:scale-100 motion-reduce:transition-none"><ArrowUturnLeftIcon className="size-5 shrink-0" aria-hidden="true" /><span className="underline decoration-primary decoration-dotted decoration-2 underline-offset-4">{option.label}</span></button>)}
              <button type="button" className="flex w-full items-center gap-2 rounded-2xl bg-background px-3 py-3 text-left font-heading text-body font-semibold shadow-card transition-[scale,box-shadow] duration-150 hover:scale-[1.01] hover:shadow-card-hover active:scale-100 motion-reduce:transition-none"><ArrowUturnLeftIcon className="size-5 shrink-0" aria-hidden="true" /><span className="underline decoration-primary decoration-dotted decoration-2 underline-offset-4">Sair</span></button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-text-muted motion-safe:animate-pop-in" role="status">
              <ChatBubbleLeftIcon className="size-10" aria-hidden="true" />
              <p>Inicie uma nova conversa para começar o atendimento.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
