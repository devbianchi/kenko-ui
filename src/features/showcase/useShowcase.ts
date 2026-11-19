import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError, NetworkError } from '../../shared/api/ApiError'
import { createConversation, getConversation, interact, isConversationState, listConversations } from './api'
import { elapsedLabel } from './format'
import { mergeTranscript, showcaseStorage as storage } from './storage'
import type { ConversationState, EffectiveStatus, Input, PendingAction, TranscriptEntry } from './types'

export type Notice =
  | { kind: 'info' | 'error'; text: string; fields?: Record<string, string> }
  /** A ação pode ou não ter sido processada: só reenviar a mesma ação ou consultar o estado esclarece. */
  | { kind: 'uncertain'; text: string }

export type ConversationItem = {
  id: string
  status: EffectiveStatus | 'unavailable'
  elapsed: string | null
}

const LIST_REFRESH_MS = 30_000

// Mensagens para recusas da API que pedem só atualizar a tela (o estado é relido por GET).
const REFRESH_NOTICES: Record<string, string> = {
  STALE_CONVERSATION_STATE: 'A conversa mudou em outra tela. Confira as opções e tente de novo.',
  CONVERSATION_CLOSED: 'Esta conversa foi encerrada. Inicie um novo atendimento para continuar.',
  CONVERSATION_ABANDONED: 'Esta conversa ficou inativa por mais de uma hora. Inicie um novo atendimento para continuar.',
  APPOINTMENT_NOT_CANCELLABLE: 'Esta consulta não pode mais ser cancelada.',
  APPOINTMENT_NOT_FOUND: 'Consulta não encontrada nesta conversa.',
  ACTION_ID_CONFLICT: 'Não foi possível concluir a ação. Confira as opções e tente de novo.',
}

const FIELD_ERRORS = new Set(['INVALID_NAME', 'INVALID_BIRTH_DATE'])

function randomId() {
  // randomUUID exige contexto seguro (localhost vale); fora dele, um identificador aleatório simples basta.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

function loadPerConversation<T>(ids: readonly string[], read: (id: string) => T | null) {
  const result: Record<string, T> = {}
  for (const id of ids) {
    const value = read(id)
    if (value !== null) result[id] = value
  }
  return result
}

function without<T>(record: Record<string, T>, id: string) {
  const rest = { ...record }
  delete rest[id]
  return rest
}

export function useShowcase() {
  const [ids, setIds] = useState<string[]>(() => storage.readIds())
  const [hidden, setHidden] = useState<string[]>(() => storage.readHidden())
  const [selectedId, setSelectedId] = useState<string | null>(() => storage.readSelected())
  const [states, setStates] = useState(() => loadPerConversation(storage.readIds(), storage.readState))
  const [transcripts, setTranscripts] = useState(() =>
    loadPerConversation(storage.readIds(), id => storage.readTranscript(id)))
  const [pending, setPending] = useState(() => loadPerConversation(storage.readIds(), storage.readPending))
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [notices, setNotices] = useState<Record<string, Notice>>({})
  const [notFound, setNotFound] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [createFailed, setCreateFailed] = useState(() => storage.readPendingCreate() !== null)
  // Trava síncrona: dois cliques rápidos não podem gerar duas ações com actionIds diferentes.
  const inFlight = useRef(new Set<string>())

  useEffect(() => storage.writeIds(ids), [ids])
  useEffect(() => storage.writeHidden(hidden), [hidden])
  useEffect(() => storage.writeSelected(selectedId), [selectedId])

  const visibleIds = ids.filter(id => !hidden.includes(id))
  const list = useQuery({
    queryKey: ['showcase', 'conversations', visibleIds],
    queryFn: ({ signal }) => listConversations(visibleIds, signal),
    enabled: visibleIds.length > 0,
    // GET não renova atividade: consultar de tempos em tempos só revela abandono calculado pela API.
    refetchInterval: LIST_REFRESH_MS,
  })

  const setNotice = useCallback((id: string, notice: Notice | null) => {
    setNotices(current => (notice === null ? without(current, id) : { ...current, [id]: notice }))
  }, [])

  const setPendingAction = useCallback((id: string, action: PendingAction | null) => {
    storage.writePending(id, action)
    setPending(current => (action === null ? without(current, id) : { ...current, [id]: action }))
  }, [])

  const applyState = useCallback((id: string, state: ConversationState) => {
    setStates(current => {
      // Resposta atrasada de uma revisão anterior não pode voltar a tela para trás.
      const previous = current[id]
      if (previous && previous.conversation.revision > state.conversation.revision) return current
      storage.writeState(id, state)
      return { ...current, [id]: state }
    })
  }, [])

  const appendTranscript = useCallback((id: string, entries: readonly TranscriptEntry[]) => {
    if (entries.length === 0) return
    setTranscripts(current => {
      const merged = mergeTranscript(current[id] ?? [], entries)
      storage.writeTranscript(id, merged)
      return { ...current, [id]: merged }
    })
  }, [])

  /** Aplica uma resposta processada: novo estado, entrada do usuário (se houver) e mensagens do bot. */
  const accept = useCallback((id: string, state: ConversationState, action?: PendingAction) => {
    applyState(id, state)
    const messages = state.messages ?? []
    const entries: TranscriptEntry[] = []
    if (action) {
      entries.push({ key: `u:${action.actionId}`, author: 'user', text: action.label, at: messages[0]?.sentAt ?? new Date().toISOString() })
    }
    for (const message of messages) {
      entries.push({ key: `b:${message.id}`, author: 'bot', text: message.text, at: message.sentAt })
    }
    appendTranscript(id, entries)
    setPendingAction(id, null)
  }, [applyState, appendTranscript, setPendingAction])

  const refresh = useCallback(async (id: string) => {
    try {
      applyState(id, await getConversation(id))
      setNotFound(current => current.filter(item => item !== id))
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONVERSATION_NOT_FOUND') {
        setNotFound(current => (current.includes(id) ? current : [...current, id]))
      }
      // Sem resposta: a tela mantém o último estado conhecido.
    }
  }, [applyState])

  const handleError = useCallback(async (id: string, action: PendingAction, error: unknown) => {
    if (error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE' && isConversationState(error.payload)) {
      // A seleção foi processada como conflito: a nova oferta vem junto e não pode ser descartada.
      accept(id, error.payload, action)
      setNotice(id, { kind: 'info', text: 'Este horário acabou de ser ocupado. Escolha outro horário.' })
      return
    }
    if (error instanceof NetworkError || (error instanceof ApiError && error.status >= 500)) {
      // Falha de rede não prova sucesso nem insucesso: a ação fica pendente para reenvio idêntico.
      setNotice(id, { kind: 'uncertain', text: 'Não foi possível confirmar se a ação foi concluída.' })
      return
    }
    setPendingAction(id, null)
    if (!(error instanceof ApiError)) {
      setNotice(id, { kind: 'error', text: 'Não foi possível concluir a ação.' })
      return
    }
    if (FIELD_ERRORS.has(error.code)) {
      setNotice(id, { kind: 'error', text: error.message, fields: error.fields })
      return
    }
    if (error.code === 'CONVERSATION_NOT_FOUND') {
      setNotFound(current => (current.includes(id) ? current : [...current, id]))
      return
    }
    setNotice(id, { kind: error.status === 409 ? 'info' : 'error', text: REFRESH_NOTICES[error.code] ?? error.message })
    await refresh(id)
  }, [accept, refresh, setNotice, setPendingAction])

  const submit = useCallback(async (id: string, action: PendingAction) => {
    if (inFlight.current.has(id)) return
    inFlight.current.add(id)
    setSending(current => ({ ...current, [id]: true }))
    setPendingAction(id, action)
    setNotice(id, null)
    try {
      accept(id, await interact(id, action), action)
    } catch (error) {
      await handleError(id, action, error)
    } finally {
      inFlight.current.delete(id)
      setSending(current => ({ ...current, [id]: false }))
    }
  }, [accept, handleError, setNotice, setPendingAction])

  /** Ação nova: actionId novo e a revisão do último estado recebido. */
  const send = useCallback((id: string, input: Input, label: string) => {
    const state = states[id]
    if (!state) return
    void submit(id, { actionId: `act_${randomId()}`, expectedRevision: state.conversation.revision, input, label })
  }, [states, submit])

  /** Reenvio após falha: mesmo actionId, mesmo conteúdo e mesma revisão. */
  const retry = useCallback((id: string) => {
    const action = pending[id]
    if (action) void submit(id, action)
  }, [pending, submit])

  const select = useCallback((id: string) => {
    setSelectedId(id)
    void refresh(id)
  }, [refresh])

  /** Nova conversa. Após falha, a próxima tentativa reaproveita o mesmo contato (mesma intenção). */
  const create = useCallback(async () => {
    if (creating) return
    const contactId = storage.readPendingCreate() ?? `ui_${randomId()}`
    storage.writePendingCreate(contactId)
    setCreating(true)
    setCreateFailed(false)
    try {
      const state = await createConversation(contactId)
      storage.writePendingCreate(null)
      const id = state.conversation.id
      setIds(current => [id, ...current.filter(item => item !== id)])
      setHidden(current => current.filter(item => item !== id))
      accept(id, state)
      setSelectedId(id)
    } catch {
      setCreateFailed(true)
    } finally {
      setCreating(false)
    }
  }, [accept, creating])

  /** Ocultar só retira a conversa da lista local: não chama a API nem apaga dados de negócio. */
  const hide = useCallback((id: string) => {
    setHidden(current => (current.includes(id) ? current : [...current, id]))
    if (selectedId === id) setSelectedId(visibleIds.find(item => item !== id) ?? null)
  }, [selectedId, visibleIds])

  // Reabrir a página relê o estado da conversa selecionada, sem registrar atividade. Só na montagem:
  // depois, select() já relê a conversa escolhida.
  const restoredId = useRef(selectedId)
  useEffect(() => {
    if (restoredId.current !== null) void refresh(restoredId.current)
  }, [refresh])

  const summaries = new Map((list.data?.conversations ?? []).map(item => [item.id, item]))
  const evaluatedAt = list.data?.evaluatedAt ?? null

  const statusOf = (id: string): ConversationItem['status'] => {
    if (notFound.includes(id)) return 'unavailable'
    // A listagem omite conversas que não existem mais na API (por exemplo, após recarregar a demonstração).
    if (list.data && !summaries.has(id)) return 'unavailable'
    return summaries.get(id)?.effectiveStatus ?? states[id]?.conversation.effectiveStatus ?? 'active'
  }

  const items: ConversationItem[] = visibleIds.map(id => {
    const summary = summaries.get(id)
    return {
      id,
      status: statusOf(id),
      elapsed: summary && evaluatedAt ? elapsedLabel(summary.lastInteractionAt, evaluatedAt) : null,
    }
  })

  const selected = selectedId !== null && visibleIds.includes(selectedId)
    ? {
        id: selectedId,
        status: statusOf(selectedId),
        state: states[selectedId] ?? null,
        transcript: transcripts[selectedId] ?? [],
        pending: pending[selectedId] ?? null,
        sending: sending[selectedId] ?? false,
        notice: notices[selectedId] ?? null,
      }
    : null

  return { items, selected, creating, createFailed, create, select, hide, send, retry, refresh }
}
