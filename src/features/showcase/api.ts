import { ApiError } from '../../shared/api/ApiError'
import { getEnveloped, request } from '../../shared/api/client'
import type { ConversationState, ConversationSummary, PendingAction } from './types'

const MAX_IDS_PER_CALL = 50

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Confere a estrutura mínima da resposta de conversa antes de usá-la como estado. */
export function isConversationState(value: unknown): value is ConversationState {
  if (!isRecord(value) || !isRecord(value.conversation) || !isRecord(value.view)) return false
  return typeof value.conversation.id === 'string'
    && typeof value.conversation.revision === 'number'
    && typeof value.view.type === 'string'
    && Array.isArray(value.availableActions)
}

function asConversationState(body: unknown): ConversationState {
  if (isConversationState(body)) return body
  throw new ApiError({ status: 200, code: 'INTERNAL_ERROR', message: 'A API respondeu fora do formato esperado.' })
}

export async function createConversation(contactId: string): Promise<ConversationState> {
  return asConversationState(await request('/conversations', { method: 'POST', body: { contactId } }))
}

export async function getConversation(id: string): Promise<ConversationState> {
  return asConversationState(await request(`/conversations/${id}`))
}

export async function interact(id: string, action: PendingAction): Promise<ConversationState> {
  const body = { actionId: action.actionId, expectedRevision: action.expectedRevision, input: action.input }
  return asConversationState(await request(`/conversations/${id}/interactions`, { method: 'POST', body }))
}

/** Estado efetivo de várias conversas, em lotes de até 50 ids. Ids inexistentes são omitidos pela API. */
export async function listConversations(ids: readonly string[], signal?: AbortSignal) {
  const batches: string[][] = []
  for (let start = 0; start < ids.length; start += MAX_IDS_PER_CALL) batches.push(ids.slice(start, start + MAX_IDS_PER_CALL))
  const responses = await Promise.all(batches.map(batch =>
    getEnveloped<ConversationSummary[]>(`/conversations?ids=${batch.join(',')}`, signal)))
  return {
    evaluatedAt: responses[0]?.meta.evaluatedAt ?? null,
    conversations: responses.flatMap(response => response.data),
  }
}
