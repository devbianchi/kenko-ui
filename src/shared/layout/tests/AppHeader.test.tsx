import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { AppHeader } from '../AppHeader'

it.each([false, true])('mantém a marca acessível no cabeçalho com showcase=%s', showcase => {
  render(<MemoryRouter><AppHeader showcase={showcase} /></MemoryRouter>)
  const brand = screen.getByRole('link', { name: 'Kenko, página inicial' })
  expect(brand).toHaveTextContent('KENKO')
  expect(brand).toHaveTextContent('ケンコ')
  expect(brand).toHaveAttribute('href', '/home')
  if (showcase) expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  else expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible()
})

it('navega para Analytics e atualiza o link ativo após o clique', async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/home']}>
      <AppHeader />
      <Routes>
        <Route path="/home" element={<h1>Resumo mensal</h1>} />
        <Route path="/analytics" element={<h1>Indicadores do atendimento</h1>} />
      </Routes>
    </MemoryRouter>,
  )

  const navigation = within(screen.getByRole('navigation', { name: 'Navegação principal' }))
  const homeLink = navigation.getByRole('link', { name: 'Início' })
  const analyticsLink = navigation.getByRole('link', { name: 'Analytics' })

  expect(screen.getByRole('heading', { name: 'Resumo mensal' })).toBeVisible()
  expect(homeLink).toHaveAttribute('aria-current', 'page')
  expect(analyticsLink).not.toHaveAttribute('aria-current')

  await user.click(analyticsLink)

  expect(screen.getByRole('heading', { name: 'Indicadores do atendimento' })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Resumo mensal' })).not.toBeInTheDocument()
  expect(analyticsLink).toHaveAttribute('aria-current', 'page')
  expect(homeLink).not.toHaveAttribute('aria-current')
})

afterEach(() => {
  delete document.documentElement.dataset.theme
})

it.each([null, 'inválido'])('abre em modo claro com preferência %s', preference => {
  if (preference !== null) localStorage.setItem('kenko-theme', preference)
  render(<MemoryRouter><AppHeader /></MemoryRouter>)
  expect(screen.getByRole('button', { name: 'Ativar modo escuro' })).toBeVisible()
  expect(document.documentElement).toHaveAttribute('data-theme', 'light')
})

it('alterna o tema e mantém a escolha ao navegar e reabrir o Showcase', async () => {
  const user = userEvent.setup()
  const first = render(<MemoryRouter><AppHeader /></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: 'Ativar modo escuro' }))
  await user.click(screen.getByRole('link', { name: 'Analytics' }))
  expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute('aria-current', 'page')
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  first.unmount()

  render(<MemoryRouter initialEntries={['/showcase']}><AppHeader showcase /></MemoryRouter>)
  const sun = screen.getByRole('button', { name: 'Ativar modo claro' })
  expect(sun).toBeVisible()
  sun.focus()
  await user.keyboard('{Enter}')
  expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  expect(localStorage.getItem('kenko-theme')).toBe('light')
})

it('mantém o controle funcional com armazenamento bloqueado', async () => {
  const user = userEvent.setup()
  const deny = () => { throw new DOMException('Acesso negado', 'SecurityError') }
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(deny)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(deny)
  render(<MemoryRouter><AppHeader /></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: 'Ativar modo escuro' }))
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeVisible()
})
