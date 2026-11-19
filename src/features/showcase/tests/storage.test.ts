import { expect, it } from 'vitest'
import { mergeTranscript, showcaseStorage } from '../storage'

it('ignora dados corrompidos no localStorage em vez de quebrar a tela', () => {
  localStorage.setItem('kenko:showcase:v1:ids', '{não é json')
  localStorage.setItem('kenko:showcase:v1:transcript:cv_1', JSON.stringify([{ key: 1 }, { key: 'b:1', author: 'bot', text: 'oi', at: 'x' }]))
  expect(showcaseStorage.readIds()).toEqual([])
  expect(showcaseStorage.readTranscript('cv_1')).toEqual([{ key: 'b:1', author: 'bot', text: 'oi', at: 'x' }])
})

it('não repete a mesma mensagem ao juntar a transcrição', () => {
  const atual = [{ key: 'b:msg_1', author: 'bot' as const, text: 'Olá', at: 'a' }]
  const novas = [{ key: 'b:msg_1', author: 'bot' as const, text: 'Olá', at: 'a' }, { key: 'u:act_1', author: 'user' as const, text: 'Agendar', at: 'b' }]
  expect(mergeTranscript(atual, novas).map(entry => entry.key)).toEqual(['b:msg_1', 'u:act_1'])
})

it('guarda e apaga a criação pendente, que reaproveita o contato após falha', () => {
  showcaseStorage.writePendingCreate('ui_123')
  expect(showcaseStorage.readPendingCreate()).toBe('ui_123')
  showcaseStorage.writePendingCreate(null)
  expect(showcaseStorage.readPendingCreate()).toBeNull()
})
