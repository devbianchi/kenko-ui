import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { AppHeader } from '../AppHeader'

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
