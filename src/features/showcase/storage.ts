import type { ConversationState, PendingAction, TranscriptEntry } from './types'
import { isConversationState } from './api'

// Tudo do Showcase no navegador fica sob este prefixo, versionado para permitir mudar o formato.
const PREFIX = 'kenko:showcase:v1:'

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    // JSON corrompido ou storage indisponível: a tela segue sem esse dado.
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(PREFIX + key)
    else localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Cota cheia ou storage bloqueado: perder a cópia local não pode derrubar a conversa.
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function isTranscriptEntry(value: unknown): value is TranscriptEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return typeof entry.key === 'string' && (entry.author === 'bot' || entry.author === 'user')
    && typeof entry.text === 'string' && typeof entry.at === 'string'
}

function isPendingAction(value: unknown): value is PendingAction {
  if (typeof value !== 'object' || value === null) return false
  const action = value as Record<string, unknown>
  return typeof action.actionId === 'string' && typeof action.expectedRevision === 'number'
    && typeof action.label === 'string' && typeof action.input === 'object' && action.input !== null
}

/** Junta entradas novas à transcrição, sem repetir a mesma mensagem (chave do id do bot ou do actionId). */
export function mergeTranscript(current: readonly TranscriptEntry[], incoming: readonly TranscriptEntry[]) {
  const keys = new Set(current.map(entry => entry.key))
  return [...current, ...incoming.filter(entry => !keys.has(entry.key))]
}

export const showcaseStorage = {
  readIds: () => stringList(read('ids')),
  writeIds: (ids: readonly string[]) => write('ids', ids),
  readHidden: () => stringList(read('hidden')),
  writeHidden: (ids: readonly string[]) => write('hidden', ids),
  readSelected: () => {
    const value = read('selected')
    return typeof value === 'string' ? value : null
  },
  writeSelected: (id: string | null) => write('selected', id),
  readTranscript: (id: string) => {
    const value = read(`transcript:${id}`)
    return Array.isArray(value) ? value.filter(isTranscriptEntry) : []
  },
  writeTranscript: (id: string, entries: readonly TranscriptEntry[]) => write(`transcript:${id}`, entries),
  readState: (id: string) => {
    const value = read(`state:${id}`)
    return isConversationState(value) ? value : null
  },
  writeState: (id: string, state: ConversationState) => write(`state:${id}`, { ...state, messages: [] }),
  readPending: (id: string) => {
    const value = read(`pending:${id}`)
    return isPendingAction(value) ? value : null
  },
  writePending: (id: string, action: PendingAction | null) => write(`pending:${id}`, action),
  readPendingCreate: () => {
    const value = read('pending-create')
    return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>).contactId === 'string'
      ? (value as { contactId: string }).contactId
      : null
  },
  writePendingCreate: (contactId: string | null) => write('pending-create', contactId === null ? null : { contactId }),
}
