import { ChatBubbleLeftIcon, EllipsisHorizontalIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import type { ConversationItem } from '../useShowcase'

const statusLabels = { active: null, closed: 'Encerrada', abandoned: 'Abandonada', unavailable: 'Indisponível' } as const

type ConversationListProps = {
  items: readonly ConversationItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onHide: (id: string) => void
}

export function ConversationList({ items, selectedId, onSelect, onHide }: ConversationListProps) {
  return (
    <aside aria-label="Conversas" className="flex h-[min(35vh,24rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-card sm:h-full sm:p-4">
      <h2 className="mb-3 flex items-center gap-2 px-1 font-heading text-section font-semibold"><ChatBubbleLeftIcon className="size-6" aria-hidden="true" /> Conversas</h2>
      <ul className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pr-1">
        {items.map(item => {
          const status = statusLabels[item.status]
          return (
            <li key={item.id} className={`group relative flex items-center rounded-xl shadow-card transition-[scale,box-shadow] duration-150 hover:shadow-card-hover motion-reduce:transition-none ${selectedId === item.id ? 'bg-chat-panel' : 'bg-background'}`}>
              <button type="button" onClick={() => onSelect(item.id)} aria-current={selectedId === item.id ? 'true' : undefined} className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-chat-panel">
                <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-bot-avatar font-brand text-lg font-normal text-avatar-ink">K</span>
                <span className="min-w-0 truncate font-heading font-semibold">Kenko BOT</span>
                {status && <span className="shrink-0 text-label text-text-muted">· {status}</span>}
                {item.elapsed && <span className="ml-auto pr-1 text-label text-text-muted">{item.elapsed}</span>}
              </button>
              <details className="group/menu relative mr-1 shrink-0">
                <summary aria-label={`Opções da conversa ${item.id}`} className="grid size-7 cursor-pointer list-none place-items-center rounded-full text-text-muted hover:bg-border [&::-webkit-details-marker]:hidden"><EllipsisHorizontalIcon className="size-4" aria-hidden="true" /></summary>
                <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 origin-top-right rounded-xl border border-border bg-background p-1 shadow-card motion-safe:group-open/menu:animate-pop-in">
                  <button role="menuitem" type="button" onClick={() => onHide(item.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-label transition-colors hover:bg-chat-panel motion-reduce:transition-none"><EyeSlashIcon className="size-4" aria-hidden="true" /> Ocultar conversa</button>
                </div>
              </details>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
