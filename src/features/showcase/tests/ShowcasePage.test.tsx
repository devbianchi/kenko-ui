import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ShowcasePage } from '../pages/ShowcasePage'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'
import { createTestQueryClient } from '../../../test/renderWithProviders'

type Call = { method: string; path: string; body: Record<string, unknown> | undefined }

const menu = {
  type: 'options',
  options: [
    { id: 'opt_schedule', label: 'Agendar uma consulta' },
    { id: 'opt_clinic_info', label: 'Ver informações da clínica' },
    { id: 'opt_appointments', label: 'Ver ou cancelar um agendamento' },
  ],
}
const slot = (id: string, startsAt: string) => ({
  id, startsAt, endsAt: startsAt.replace(':00:00', ':30:00'),
  doctor: { id: 'dr_3', name: 'Dra. Helena' }, room: { id: 'room_3', name: 'Sala 3' },
})
const slotsView = { type: 'slots', searchResult: 'available', slots: [slot('slot_1', '2026-11-20T07:00:00-03:00')] }
const patientForm = {
  type: 'patient_form',
  fields: [{ name: 'name', type: 'text', required: true }, { name: 'birthDate', type: 'date', required: true }],
  selectedSlot: slot('slot_1', '2026-11-20T07:00:00-03:00'),
}
const message = (id: string, text: string) => ({ id, author: 'bot', text, sentAt: '2026-11-10T12:00:00-03:00' })
const greeting = message('msg_1', 'Olá! Sou o assistente Kenko. Como posso ajudar?')

function conversation(revision: number, view: unknown, messages: unknown[] = [], status = 'active') {
  return {
    conversation: { id: 'cv_1', effectiveStatus: status, revision, step: 'menu', attemptId: null },
    messages,
    view,
    availableActions: status === 'active' ? ['exit'] : [],
  }
}

function listOf(status = 'active') {
  return jsonResponse(envelope([{ id: 'cv_1', effectiveStatus: status, lastInteractionAt: '2026-11-10T12:00:00-03:00' }]))
}

/**
 * API falsa do bot: registra cada chamada e responde com handler. Listagem e leitura da conversa
 * têm respostas padrão, que o handler pode substituir.
 */
function fakeApi(handler: (call: Call) => Response | Promise<Response> | undefined, listStatus = 'active') {
  const calls: Call[] = []
  stubFetch((url, init) => {
    const call: Call = {
      method: init?.method ?? 'GET',
      path: url.pathname.replace(/^\/api/, '') + url.search,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }
    calls.push(call)
    const response = handler(call)
    if (response) return response
    if (call.method === 'GET' && call.path.startsWith('/conversations?ids=')) return listOf(listStatus)
    if (call.method === 'GET' && call.path === '/conversations/cv_1') return jsonResponse(conversation(0, menu))
    return jsonResponse({ error: { code: 'ROUTE_NOT_FOUND', message: 'Rota não encontrada.' } }, 404)
  })
  return calls
}

const interactions = (calls: Call[]) => calls.filter(call => call.method === 'POST' && call.path.endsWith('/interactions'))

function renderShowcase() {
  render(<QueryClientProvider client={createTestQueryClient()}><ShowcasePage /></QueryClientProvider>)
  return userEvent.setup()
}

async function startConversation(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))
  await screen.findByRole('article', { name: 'Mensagem do Kenko BOT' })
}

it('começa vazio e cria a conversa com a saudação e o menu vindos da API', async () => {
  const calls = fakeApi(call => (call.method === 'POST' && call.path === '/conversations'
    ? jsonResponse(conversation(0, menu, [greeting]), 201) : undefined))
  const user = renderShowcase()
  expect(screen.getByRole('status')).toHaveTextContent('Inicie uma nova conversa')

  await startConversation(user)

  expect(screen.getByRole('article', { name: 'Mensagem do Kenko BOT' })).toHaveTextContent(greeting.text)
  for (const label of ['Agendar uma consulta', 'Ver informações da clínica', 'Ver ou cancelar um agendamento', 'Sair']) {
    expect(screen.getByRole('button', { name: label })).toBeEnabled()
  }
  const creation = calls.find(call => call.path === '/conversations')
  expect(String(creation?.body?.contactId)).toMatch(/^ui_/)
  expect(await within(screen.getByRole('complementary', { name: 'Conversas' })).findByText('15m')).toBeVisible()
  expect(JSON.parse(localStorage.getItem('kenko:showcase:v1:ids') ?? '[]')).toEqual(['cv_1'])
})

it('envia a opção escolhida com actionId novo e a revisão atual, e registra a entrada do usuário', async () => {
  const especialidades = { type: 'options', options: [{ id: 'sp_3', label: 'Dermatologia' }] }
  const calls = fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, menu, [greeting]), 201)
    if (call.path.endsWith('/interactions')) return jsonResponse(conversation(1, especialidades, [message('msg_2', 'Qual especialidade você procura?')]))
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)

  await user.click(screen.getByRole('button', { name: 'Agendar uma consulta' }))

  expect(await screen.findByRole('button', { name: 'Dermatologia' })).toBeVisible()
  expect(screen.getByRole('article', { name: 'Sua mensagem' })).toHaveTextContent('Agendar uma consulta')
  expect(screen.getAllByRole('article', { name: 'Mensagem do Kenko BOT' })[1]).toHaveTextContent('Qual especialidade você procura?')
  const [sent] = interactions(calls)
  expect(sent.body).toMatchObject({ expectedRevision: 0, input: { type: 'select_option', optionId: 'opt_schedule' } })
  expect(String(sent.body?.actionId)).toMatch(/^act_/)
})

it('conclui o agendamento sem gravar nome nem nascimento na transcrição local', async () => {
  const calls = fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, menu, [greeting]), 201)
    const input = call.body?.input as { type: string } | undefined
    if (input?.type === 'select_option') return jsonResponse(conversation(1, slotsView, [message('msg_2', 'Estes são os horários disponíveis.')]))
    if (input?.type === 'select_slot') return jsonResponse(conversation(2, patientForm, [message('msg_3', 'Informe nome e data de nascimento.')]))
    if (input?.type === 'submit_patient') return jsonResponse(conversation(3, menu, [message('msg_4', 'Consulta confirmada para 20/11 às 07h.')]))
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)
  await user.click(screen.getByRole('button', { name: 'Agendar uma consulta' }))
  await user.click(await screen.findByRole('button', { name: /20\/11 às 07:00 · Dra\. Helena · Sala 3/ }))

  await user.type(await screen.findByLabelText('Nome completo'), 'Ana Silva')
  await user.type(screen.getByLabelText('Data de nascimento'), '1998-04-15')
  await user.click(screen.getByRole('button', { name: 'Confirmar' }))

  expect(await screen.findByText('Consulta confirmada para 20/11 às 07h.')).toBeVisible()
  const submitted = interactions(calls).at(-1)
  expect(submitted?.body).toMatchObject({ expectedRevision: 2, input: { type: 'submit_patient', patient: { name: 'Ana Silva', birthDate: '1998-04-15' } } })
  expect(screen.getAllByRole('article', { name: 'Sua mensagem' }).at(-1)).toHaveTextContent('Dados do paciente informados')
  const stored = localStorage.getItem('kenko:showcase:v1:transcript:cv_1') ?? ''
  expect(stored).toContain('Dados do paciente informados')
  expect(stored).not.toContain('Ana Silva')
  expect(stored).not.toContain('1998-04-15')
})

it('mostra o erro do nome junto do campo, mantém o que foi digitado e não registra a entrada', async () => {
  fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, patientForm, [greeting]), 201)
    if (call.path.endsWith('/interactions')) {
      return jsonResponse({ error: { code: 'INVALID_NAME', message: 'Nome inválido.', fields: { 'patient.name': 'Informe de 1 a 100 caracteres.' } } }, 400)
    }
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)
  await user.type(screen.getByLabelText('Nome completo'), '   x')
  await user.type(screen.getByLabelText('Data de nascimento'), '1998-04-15')
  await user.click(screen.getByRole('button', { name: 'Confirmar' }))

  expect(await screen.findByText('Informe de 1 a 100 caracteres.')).toBeVisible()
  expect(screen.getByLabelText('Nome completo')).toHaveValue('   x')
  expect(screen.getByLabelText('Nome completo')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.queryByRole('article', { name: 'Sua mensagem' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled()
})

it('horário ocupado aplica a nova oferta devolvida pela API e avisa', async () => {
  const novaOferta = { type: 'slots', searchResult: 'available', slots: [slot('slot_2', '2026-11-21T09:00:00-03:00')] }
  fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, slotsView, [greeting]), 201)
    if (call.path.endsWith('/interactions')) {
      return jsonResponse({ error: { code: 'SLOT_UNAVAILABLE', message: 'Horário ocupado.' }, ...conversation(1, novaOferta), result: null }, 409)
    }
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)
  await user.click(screen.getByRole('button', { name: /20\/11 às 07:00/ }))

  expect(await screen.findByRole('button', { name: /21\/11 às 09:00/ })).toBeEnabled()
  expect(screen.queryByRole('button', { name: /20\/11 às 07:00/ })).not.toBeInTheDocument()
  expect(screen.getByText('Este horário acabou de ser ocupado. Escolha outro horário.')).toBeVisible()
})

it('falha de rede deixa a ação pendente e reenvia com o mesmo actionId, conteúdo e revisão', async () => {
  let tentativas = 0
  const calls = fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, menu, [greeting]), 201)
    if (call.path.endsWith('/interactions')) {
      tentativas += 1
      if (tentativas === 1) return Promise.reject(new TypeError('Failed to fetch'))
      return jsonResponse(conversation(1, slotsView, [message('msg_2', 'Estes são os horários disponíveis.')]))
    }
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)
  await user.click(screen.getByRole('button', { name: 'Agendar uma consulta' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível confirmar se a ação foi concluída.')
  expect(screen.getByRole('button', { name: 'Ver informações da clínica' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Reenviar' }))

  expect(await screen.findByRole('button', { name: /20\/11 às 07:00/ })).toBeEnabled()
  const [primeira, reenvio] = interactions(calls)
  expect(reenvio.body).toEqual(primeira.body)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('revisão antiga relê o estado e não reenvia a ação sozinha', async () => {
  const calls = fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, menu, [greeting]), 201)
    if (call.path.endsWith('/interactions')) {
      return jsonResponse({ error: { code: 'STALE_CONVERSATION_STATE', message: 'O estado mudou.' } }, 409)
    }
    if (call.method === 'GET' && call.path === '/conversations/cv_1') return jsonResponse(conversation(3, slotsView))
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)
  await user.click(screen.getByRole('button', { name: 'Agendar uma consulta' }))

  expect(await screen.findByRole('button', { name: /20\/11 às 07:00/ })).toBeEnabled()
  expect(screen.getByText('A conversa mudou em outra tela. Confira as opções e tente de novo.')).toBeVisible()
  expect(interactions(calls)).toHaveLength(1)
  expect(calls.some(call => call.method === 'GET' && call.path === '/conversations/cv_1')).toBe(true)
})

it('criação que falha reaproveita o mesmo contato na nova tentativa', async () => {
  let tentativas = 0
  const calls = fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') {
      tentativas += 1
      return tentativas === 1 ? Promise.reject(new TypeError('Failed to fetch')) : jsonResponse(conversation(0, menu, [greeting]), 200)
    }
    return undefined
  })
  const user = renderShowcase()
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível iniciar a conversa.')

  await startConversation(user)

  const [primeira, segunda] = calls.filter(call => call.path === '/conversations')
  expect(segunda.body?.contactId).toBe(primeira.body?.contactId)
  expect(localStorage.getItem('kenko:showcase:v1:pending-create')).toBeNull()
})

it('ocultar retira a conversa da lista local sem chamar a API', async () => {
  const calls = fakeApi(call => (call.method === 'POST' && call.path === '/conversations'
    ? jsonResponse(conversation(0, menu, [greeting]), 201) : undefined))
  const user = renderShowcase()
  await startConversation(user)
  const antes = calls.filter(call => call.method !== 'GET').length

  const trigger = screen.getByLabelText('Opções da conversa cv_1')
  await user.click(trigger)
  await user.click(within(trigger.closest('li') as HTMLElement).getByRole('menuitem', { name: 'Ocultar conversa' }))

  expect(within(screen.getByRole('complementary', { name: 'Conversas' })).queryAllByRole('listitem')).toHaveLength(0)
  expect(screen.getByRole('status')).toHaveTextContent('Inicie uma nova conversa')
  expect(calls.filter(call => call.method !== 'GET')).toHaveLength(antes)
  expect(JSON.parse(localStorage.getItem('kenko:showcase:v1:hidden') ?? '[]')).toEqual(['cv_1'])
  expect(localStorage.getItem('kenko:showcase:v1:transcript:cv_1')).toContain(greeting.text)
})

it('conversa abandonada desabilita as ações e oferece novo atendimento', async () => {
  fakeApi(call => (call.method === 'POST' && call.path === '/conversations'
    ? jsonResponse(conversation(0, menu, [greeting]), 201) : undefined), 'abandoned')
  const user = renderShowcase()
  await startConversation(user)

  expect(await screen.findByText('Esta conversa ficou inativa por mais de uma hora e não pode continuar.')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Iniciar novo atendimento' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Agendar uma consulta' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
})

it('reabrir a página restaura a transcrição local e relê o estado sem registrar ação', async () => {
  localStorage.setItem('kenko:showcase:v1:ids', JSON.stringify(['cv_1']))
  localStorage.setItem('kenko:showcase:v1:selected', JSON.stringify('cv_1'))
  localStorage.setItem('kenko:showcase:v1:transcript:cv_1', JSON.stringify([
    { key: 'b:msg_1', author: 'bot', text: greeting.text, at: greeting.sentAt },
  ]))
  const calls = fakeApi(() => undefined)
  renderShowcase()

  expect(screen.getByRole('article', { name: 'Mensagem do Kenko BOT' })).toHaveTextContent(greeting.text)
  expect(await screen.findByRole('button', { name: 'Agendar uma consulta' })).toBeEnabled()
  await waitFor(() => expect(calls.some(call => call.method === 'GET' && call.path === '/conversations/cv_1')).toBe(true))
  expect(calls.filter(call => call.method === 'POST')).toHaveLength(0)
})

it('sair encerra a conversa e oferece novo atendimento', async () => {
  const calls = fakeApi(call => {
    if (call.path === '/conversations' && call.method === 'POST') return jsonResponse(conversation(0, menu, [greeting]), 201)
    if (call.path.endsWith('/interactions')) return jsonResponse(conversation(1, { type: 'closed' }, [message('msg_2', 'Até logo!')], 'closed'))
    return undefined
  })
  const user = renderShowcase()
  await startConversation(user)
  await user.click(screen.getByRole('button', { name: 'Sair' }))

  expect(await screen.findByText('Atendimento encerrado.')).toBeVisible()
  expect(screen.getByText('Até logo!')).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  expect(interactions(calls)[0].body).toMatchObject({ input: { type: 'exit' } })
})
