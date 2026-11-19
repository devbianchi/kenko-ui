import type { ReactElement } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { homeMock } from '../../../../mocks/home/home'
import { AppLayout } from '../../../shared/layout/AppLayout'
import { HomePage } from '../pages/HomePage'
import type { HomeData, UpcomingAppointment } from '../data/home'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'
import { createTestQueryClient } from '../../../test/renderWithProviders'

const homeData: HomeData = homeMock.data

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-20T12:00:00-03:00'))
})
afterEach(() => vi.useRealTimers())

/** Página sem dados por props: busca na API, aqui substituída por uma resposta com o fixture. */
function renderWithApi(ui: ReactElement, data: HomeData = homeData) {
  const fetchMock = stubFetch(() => jsonResponse(envelope(data)))
  render(<QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>)
  return fetchMock
}

function renderHome(data: HomeData = structuredClone(homeData), route = '/home') {
  return render(<MemoryRouter initialEntries={[route]}><Routes>
    <Route element={<AppLayout />}>
      <Route path="/home" element={<HomePage data={data} />} />
      <Route path="/calendar/2026-11-10" element={<h1>Dia 10 de novembro</h1>} />
      <Route path="/analytics" element={<h1>Indicadores de Analytics</h1>} />
    </Route>
  </Routes></MemoryRouter>)
}

it('não publica rascunhos do ano e restaura campo, URL e dados ao voltar', async () => {
  const user = userEvent.setup()
  function Example() {
    const location = useLocation()
    const navigate = useNavigate()
    return <><HomePage /><output aria-label="URL atual">{location.search}</output>
      <button onClick={() => navigate(-1)}>Voltar</button></>
  }
  renderWithApi(<MemoryRouter initialEntries={['/home?month=2026-11&origin=demo&view=cards']}><Routes>
    <Route element={<AppLayout />}><Route path="/home" element={<Example />} /></Route>
  </Routes></MemoryRouter>)
  await screen.findByLabelText('Mês selecionado: 2026-11')
  await user.click(screen.getByLabelText('Mês e ano'))
  const year = screen.getByRole('spinbutton', { name: 'Ano' })
  await user.clear(year)
  expect(year).toHaveValue(null)
  await user.type(year, '202')
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11&origin=demo&view=cards')
  expect(screen.getByLabelText('Mês selecionado: 2026-11')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled()
  expect(screen.getByRole('alert')).toHaveTextContent('Data inválida')
  await user.clear(year)
  await user.type(year, '2025')
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11&origin=demo&view=cards')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2025-11&origin=demo&view=cards')
  await screen.findByLabelText('Mês selecionado: 2025-11')
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('10')
  expect(screen.getByRole('article', { name: 'Consulta de Ana' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11&origin=demo&view=cards')
  expect(screen.getByRole('spinbutton', { name: 'Ano' })).toHaveValue(2026)
  await screen.findByLabelText('Mês selecionado: 2026-11')
  expect(screen.getByRole('article', { name: 'Consulta de Ana' })).toBeVisible()
})

it.each(['2023-12', '2020-06', '0001-01'])('limita URL histórica %s a janeiro de 2024', month => {
  renderHome(undefined, `/home?month=${month}`)
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Janeiro')
  expect(screen.getByLabelText('Mês selecionado: 2024-01')).toHaveTextContent('jan.2024')
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('10')
  expect(screen.getByRole('article', { name: 'Consulta de Ana' })).toBeVisible()
})

it.each([
  ['2024-01', 'Janeiro', 'jan.2024'],
  ['2024-12', 'Dezembro', 'dez.2024'],
])('preserva período permitido %s recebido pela URL', (month, label, card) => {
  renderHome(undefined, `/home?month=${month}`)
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent(label)
  expect(screen.getByLabelText(`Mês selecionado: ${month}`)).toHaveTextContent(card)
})

it('limita URL pelo mês em Brasília durante a virada UTC', () => {
  vi.setSystemTime(new Date('2026-12-01T01:00:00Z'))
  renderHome(undefined, '/home?month=2026-12')
  expect(screen.getByLabelText('Mês selecionado: 2026-11')).toHaveTextContent('nov.2026')
})

it('grava o mês na URL, preserva outros parâmetros e restaura o período ao voltar', async () => {
  const user = userEvent.setup()
  function Example() {
    const location = useLocation()
    const navigate = useNavigate()
    return <><HomePage /><output aria-label="URL atual">{location.search}</output>
      <button onClick={() => navigate(-1)}>Voltar</button></>
  }
  renderWithApi(<MemoryRouter initialEntries={['/home?month=2026-11&origin=demo']}><Routes>
    <Route element={<AppLayout />}><Route path="/home" element={<Example />} /></Route>
  </Routes></MemoryRouter>)
  await screen.findByLabelText('Mês selecionado: 2026-11')
  await user.click(screen.getByLabelText('Mês e ano'))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Mês' }), '10')
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11&origin=demo')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-10&origin=demo')
  expect(await screen.findByLabelText('Mês selecionado: 2026-10')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(await screen.findByLabelText('Mês selecionado: 2026-11')).toBeVisible()
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro')
})

it('apresenta o resumo do mock e o card de consulta conforme o design', () => {
  renderHome()
  expect(screen.getByRole('heading', { name: 'Olá, Clínica' })).toBeVisible()
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('10')
  expect(screen.getByRole('article', { name: 'Pendentes' })).toHaveTextContent('8')
  expect(screen.getByRole('article', { name: 'Canceladas' })).toHaveTextContent('4')
  expect(screen.getByRole('link', { name: 'Melhor Dia' })).toHaveTextContent('10/11(4 consultas)')
  expect(screen.getByRole('article', { name: 'Hora de pico' })).toHaveTextContent('09:00(+4,4 consultas acima da média)')
  expect(screen.getByRole('article', { name: 'Melhor sala' })).toHaveTextContent('Sala 1(12 consultas)')
  expect(screen.getByRole('link', { name: 'Mediana de atendimento' })).toHaveTextContent('2m30sMelhoria de 15s')
  const appointment = screen.getByRole('article', { name: 'Consulta de Ana' })
  for (const value of ['13:00', 'Sala 2', 'Ana', 'Dermatologia']) expect(appointment).toHaveTextContent(value)
  expect(appointment).not.toHaveTextContent('20/11/2026')
  expect(appointment).not.toHaveTextContent('Dra. Helena')
  expect(within(appointment).queryByRole('link')).not.toBeInTheDocument()
})

it('altera o período visual e mantém os dados do mock', async () => {
  const user = userEvent.setup()
  renderHome()
  await user.click(screen.getByLabelText('Mês e ano'))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Mês' }), '02')
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Ano' }), { target: { value: '2025' } })
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(await screen.findByLabelText('Mês selecionado: 2025-02')).toHaveTextContent('fev.2025')
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Fevereiro 2025')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('10')
  expect(screen.getByRole('link', { name: 'Melhor Dia' })).toHaveTextContent('10/11')
  expect(screen.getByRole('article', { name: 'Consulta de Ana' })).toBeVisible()
  await user.click(screen.getByLabelText('Mês e ano'))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Mês' }), '11')
  await user.click(screen.getByRole('button', { name: 'Aplicar' }))
  expect(await screen.findByLabelText('Mês selecionado: 2025-11')).toHaveTextContent('nov.2025')
})

it.each(['2026-13', 'invalid', '0000-01'])('ignora mês inválido na URL: %s', month => {
  renderHome(undefined, `/home?month=${month}`)
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro')
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('10')
})

it.each(['2026-12', '2027-01'])('limita período futuro da URL ao mês atual: %s', month => {
  renderHome(undefined, `/home?month=${month}`)
  expect(screen.getByLabelText('Mês e ano')).toHaveTextContent('Novembro')
  expect(screen.getByLabelText('Mês selecionado: 2026-11')).toHaveTextContent('nov.2026')
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('10')
})

it.each([
  ['2020-01', '2024-01'],
  ['2026-13', '2026-11'],
  ['wrong', '2026-11'],
])('normaliza mês da URL %s para %s e preserva parâmetros restantes', async (invalidMonth, expectedMonth) => {
  function CurrentPage() {
    const location = useLocation()
    return <><HomePage /><output aria-label="URL atual">{location.search}</output></>
  }
  renderWithApi(<MemoryRouter initialEntries={[`/home?month=${invalidMonth}&origin=demo`]}><Routes>
    <Route element={<AppLayout />}><Route path="/home" element={<CurrentPage />} /></Route>
  </Routes></MemoryRouter>)
  await vi.waitFor(() => expect(screen.getByLabelText('URL atual')).toHaveTextContent(`?month=${expectedMonth}&origin=demo`))
})

it('substitui o mês inválido sem adicionar uma entrada ao histórico', async () => {
  const user = userEvent.setup()
  function CurrentPage() {
    const location = useLocation()
    const navigate = useNavigate()
    return <><HomePage /><output aria-label="URL atual">{location.search}</output>
      <button onClick={() => navigate(-1)}>Voltar</button></>
  }
  renderWithApi(<MemoryRouter initialEntries={['/home?month=2026-11&origin=demo', '/home?month=2020-01&origin=demo']}><Routes>
    <Route element={<AppLayout />}><Route path="/home" element={<CurrentPage />} /></Route>
  </Routes></MemoryRouter>)
  await vi.waitFor(() => expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2024-01&origin=demo'))
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(screen.getByLabelText('URL atual')).toHaveTextContent('?month=2026-11&origin=demo')
})

it.each([
  ['Melhor Dia', 'Dia 10 de novembro'],
  ['Mediana de atendimento', 'Indicadores de Analytics'],
])('navega pelo card %s', async (link, heading) => {
  const user = userEvent.setup()
  renderHome()
  await user.click(screen.getByRole('link', { name: link }))
  expect(screen.getByRole('heading', { name: heading })).toBeVisible()
})

it('mostra as próximas consultas como a API entrega, sem refiltrar pelo relógio do navegador', () => {
  // O navegador está depois do início da primeira consulta: a lista continua a da API, na ordem dela.
  vi.setSystemTime(new Date('2026-11-30T12:00:00-03:00'))
  const base = homeData.upcomingAppointments[0]
  const make = (id: string, startsAt: string): UpcomingAppointment => ({
    ...base, id, startsAt, patient: { id, name: id },
  })
  const appointments = [
    make('primeira', '2026-11-11T01:00:00Z'),
    make('segunda', '2026-11-12T13:00:00-03:00'),
    make('terceira', '2026-11-13T13:00:00-03:00'),
  ]
  renderHome({ ...homeData, upcomingAppointments: appointments })
  const items = within(screen.getByRole('list')).getAllByRole('article')
  expect(items.map(item => item.getAttribute('aria-label'))).toEqual([
    'Consulta de primeira', 'Consulta de segunda', 'Consulta de terceira',
  ])
  expect(items[0]).toHaveTextContent('22:00')
  expect(items[1]).not.toHaveTextContent('Dra. Helena')
})

it('busca na API o mês da URL e mostra os indicadores recebidos', async () => {
  const fetchMock = renderWithApi(<MemoryRouter initialEntries={['/home?month=2026-10']}><Routes>
    <Route element={<AppLayout />}><Route path="/home" element={<HomePage />} /></Route>
  </Routes></MemoryRouter>)

  expect(screen.getByRole('status')).toHaveTextContent('Carregando…')
  expect(await screen.findByRole('article', { name: 'Completas' })).toHaveTextContent('10')
  expect(screen.getByLabelText('Mês selecionado: 2026-10')).toBeVisible()
  expect(String(fetchMock.mock.calls[0]![0])).toBe('http://localhost:8080/api/dashboard?month=2026-10')
})

it('mostra o erro da API e busca de novo pelo botão', async () => {
  const user = userEvent.setup()
  let chamadas = 0
  stubFetch(() => {
    chamadas += 1
    return chamadas === 1
      ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno. Tente novamente.' } }, 500)
      : jsonResponse(envelope(homeData))
  })
  render(<QueryClientProvider client={createTestQueryClient()}><MemoryRouter initialEntries={['/home?month=2026-11']}><Routes>
    <Route element={<AppLayout />}><Route path="/home" element={<HomePage />} /></Route>
  </Routes></MemoryRouter></QueryClientProvider>)

  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.')
  expect(screen.queryByRole('article', { name: 'Completas' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(await screen.findByRole('article', { name: 'Completas' })).toHaveTextContent('10')
})

it('trata ausência de rankings e duração sem trocar zero por ausência', () => {
  renderHome({ ...homeData, appointments: { total: 0, complete: 0, pending: 0, cancelled: 0 },
    bestDay: null, bestRoom: null, peakHour: null,
    attendanceDuration: { statistic: 'median', seconds: null, previousSeconds: null, differenceSeconds: null }, upcomingAppointments: [],
  })
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('0')
  for (const name of ['Melhor Dia', 'Melhor sala', 'Hora de pico']) expect(screen.getByRole('article', { name })).toHaveTextContent('—')
  expect(screen.getByRole('link', { name: 'Mediana de atendimento' })).toHaveTextContent('—Sem comparação com o mês anterior')
  expect(screen.getByText('Nenhuma consulta futura agendada.')).toBeVisible()
})

it.each([
  [15, 'Aumento de 15s em relação ao mês anterior'],
  [0, 'Sem variação em relação ao mês anterior'],
  [null, 'Sem comparação com o mês anterior'],
])('apresenta variação %s e duração zero corretamente', (differenceSeconds, expected) => {
  renderHome({ ...homeData, attendanceDuration: { statistic: 'median', seconds: 0, previousSeconds: 0, differenceSeconds } })
  expect(screen.getByRole('link', { name: 'Mediana de atendimento' })).toHaveTextContent(`0m00s${expected}`)
})
