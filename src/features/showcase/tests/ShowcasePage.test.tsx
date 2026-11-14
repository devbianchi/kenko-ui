import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ShowcasePage } from '../pages/ShowcasePage'

it('starts empty and creates a bot-first conversation without a user greeting', async () => {
  const user = userEvent.setup()
  render(<ShowcasePage />)

  expect(screen.getByRole('status')).toHaveTextContent('Inicie uma nova conversa')
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))

  const message = screen.getByRole('article', { name: 'Mensagem do Kenko BOT' })
  expect(message).toHaveTextContent('Olá!')
  expect(message).toHaveTextContent('Como posso ajudar você hoje?')
  expect(message).toHaveTextContent('rápido: por mensagens simples, você agenda sua consulta')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.queryByText('Olá, tudo bem?')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Agendar uma consulta' })).toBeInTheDocument()
})

it('keeps a large conversation list available in the sidebar', async () => {
  const user = userEvent.setup()
  render(<ShowcasePage />)
  for (let index = 0; index < 12; index += 1) {
    await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))
  }

  expect(within(screen.getByRole('complementary', { name: 'Conversas' })).getAllByRole('listitem')).toHaveLength(12)
})

it('creates identical clickable conversations and keeps bot options inert', async () => {
  const user = userEvent.setup()
  render(<ShowcasePage />)
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))
  const firstMessage = screen.getByRole('article', { name: 'Mensagem do Kenko BOT' }).textContent
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))

  expect(screen.getAllByRole('button', { name: /Kenko BOT/ })).toHaveLength(2)
  expect(screen.getByRole('article', { name: 'Mensagem do Kenko BOT' }).textContent).toBe(firstMessage)
  await user.click(screen.getByRole('button', { name: 'Agendar uma consulta' }))
  expect(screen.getByRole('article', { name: 'Mensagem do Kenko BOT' }).textContent).toBe(firstMessage)
  await user.click(screen.getAllByRole('button', { name: /Kenko BOT/ })[1])
  expect(screen.getByRole('article', { name: 'Mensagem do Kenko BOT' })).toBeVisible()
})

it('deletes only the chosen conversation from its popup and restores the empty state', async () => {
  const user = userEvent.setup()
  render(<ShowcasePage />)
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))
  await user.click(screen.getByRole('button', { name: 'Nova Conversa' }))
  const item = screen.getByLabelText('Opções da conversa 2')
  await user.click(item)
  const menu = within(item.closest('li') as HTMLElement).getByRole('menu')
  await user.click(within(menu).getByRole('menuitem', { name: 'Apagar conversa' }))

  expect(screen.getAllByRole('button', { name: /Kenko BOT/ })).toHaveLength(1)
  expect(screen.queryByLabelText('Opções da conversa 2')).not.toBeInTheDocument()
  const remainingMenuTrigger = screen.getByLabelText('Opções da conversa 1')
  await user.click(remainingMenuTrigger)
  await user.click(within(remainingMenuTrigger.closest('li') as HTMLElement).getByRole('menuitem', { name: 'Apagar conversa' }))
  expect(screen.getByRole('status')).toHaveTextContent('Inicie uma nova conversa')
})
