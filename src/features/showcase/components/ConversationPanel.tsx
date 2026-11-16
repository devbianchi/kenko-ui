import { ArrowUturnLeftIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { criarConversaMock } from '../../../../mocks/showcase/criar_conversa_response'

const options = [...criarConversaMock.view.options, { label: 'Sair' }]
const messageTime = '16:50'

export function ConversationPanel({ selectedId }: { selectedId: number | null }) {
  return (
    <section aria-label="Chat da conversa" className={`flex min-h-[28rem] items-center rounded-2xl border border-border bg-chat-panel p-4 shadow-card sm:p-6 ${selectedId !== null ? 'justify-start sm:pl-[8%]' : 'justify-center'}`}>
      {selectedId !== null ? (
        <div key={selectedId} className="flex w-full max-w-[30rem] flex-col gap-2 motion-safe:animate-pop-in">
          <article className="rounded-2xl bg-background p-4 shadow-card sm:p-5" aria-label="Mensagem do Kenko BOT">
            <p className="mb-1 font-brand text-sm font-normal text-text-muted">KENKO</p>
            <p className="font-sans text-[0.95em] leading-[1.35] text-foreground"><strong>Olá! 👋<br />Eu sou o assistente virtual Kenko!</strong><br />Estou aqui para tornar o seu atendimento mais rápido: por mensagens simples, você agenda sua consulta sem precisar esperar na fila.</p>
            <p className="mt-4 font-sans text-[0.95em] leading-[1.35] text-foreground"><strong>Como funciona:</strong> eu faço algumas perguntas, você responde selecionando a opção, e no final eu mostro os horários disponíveis para você escolher. Pode apertar a tecla de sair a qualquer momento.</p>
            <div className="mt-4 flex items-end justify-between gap-2 font-sans text-[0.95em] leading-[1.35]"><strong>Como posso ajudar você hoje?</strong><time className="shrink-0 text-label text-text-muted">{messageTime}</time></div>
          </article>
          {options.map(option => <button key={option.label} type="button" className="flex w-full items-center gap-2 rounded-2xl bg-background px-3 py-3 text-left font-heading text-body font-semibold shadow-card transition-[scale,box-shadow] duration-150 hover:scale-[1.01] hover:shadow-card-hover active:scale-100 motion-reduce:transition-none"><ArrowUturnLeftIcon className="size-5 shrink-0" aria-hidden="true" /><span className="underline decoration-primary decoration-dotted decoration-2 underline-offset-4">{option.label}</span></button>)}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center text-text-muted motion-safe:animate-pop-in" role="status">
          <ChatBubbleLeftIcon className="size-10" aria-hidden="true" />
          <p>Inicie uma nova conversa para começar o atendimento.</p>
        </div>
      )}
    </section>
  )
}
