import { ChatBubbleLeftIcon, EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'

export type Conversation = { id: number }

type ConversationListProps = {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (id: number) => void
  onDelete: (id: number) => void
}

export function ConversationList({ conversations, selectedId, onSelect, onDelete }: ConversationListProps) {
  return (
    <aside aria-label="Conversas" className="flex h-[min(35vh,24rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-card sm:h-full sm:p-4">
      <h2 className="mb-3 flex items-center gap-2 px-1 font-heading text-section font-semibold"><ChatBubbleLeftIcon className="size-6" aria-hidden="true" /> Conversas</h2>
      <ul className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pr-1">
        {conversations.map(conversation => (
          <li key={conversation.id} className={`group relative flex items-center rounded-xl shadow-card transition-[scale,box-shadow] duration-150 hover:shadow-card-hover motion-reduce:transition-none ${selectedId === conversation.id ? 'bg-chat-panel' : 'bg-background'}`}>
            <button type="button" onClick={() => onSelect(conversation.id)} aria-current={selectedId === conversation.id ? 'true' : undefined} className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-chat-panel">
              <span aria-label="Kenko BOT" className="grid size-7 shrink-0 place-items-center rounded-full bg-bot-avatar font-brand text-lg font-normal text-avatar-ink">K</span>
              <span className="truncate font-heading font-semibold">Kenko BOT</span>
              <span className="ml-auto pr-1 text-label text-text-muted">1m</span>
            </button>
            <details className="group/menu relative mr-1 shrink-0">
              <summary aria-label={`Opções da conversa ${conversation.id}`} className="grid size-7 cursor-pointer list-none place-items-center rounded-full text-text-muted hover:bg-border [&::-webkit-details-marker]:hidden"><EllipsisHorizontalIcon className="size-4" aria-hidden="true" /></summary>
              <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 origin-top-right rounded-xl border border-border bg-background p-1 shadow-card motion-safe:group-open/menu:animate-pop-in">
                <button role="menuitem" type="button" onClick={() => onDelete(conversation.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-label text-red-800 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950 motion-reduce:transition-none"><TrashIcon className="size-4" aria-hidden="true" /> Apagar conversa</button>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </aside>
  )
}
