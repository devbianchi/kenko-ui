import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { CountCard, MetricCard } from '../DashboardCard'

it('preserva zero e ausência nos cards de contagem sem criar ações', () => {
  render(<><CountCard label="Completas" value={0} /><CountCard label="Pendentes" value={null} /></>)
  expect(screen.getByRole('article', { name: 'Completas' })).toHaveTextContent('0')
  expect(screen.getByRole('article', { name: 'Pendentes' })).toHaveTextContent('—')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

it('abre o destino do indicador pelo teclado e mantém informação sem destino como artigo', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><Routes>
    <Route path="/" element={<>
      <MetricCard title="Melhor Dia" value="10/11" detail="4 consultas" to="/calendar/2026-11-10" />
      <MetricCard title="Melhor sala" value="Sala 1" detail="12 consultas" />
    </>} />
    <Route path="/calendar/:date" element={<h1>Dia selecionado</h1>} />
  </Routes></MemoryRouter>)
  expect(screen.getByRole('article', { name: 'Melhor sala' })).toHaveTextContent('Sala 1')
  await user.tab()
  expect(screen.getByRole('link', { name: 'Melhor Dia' })).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(screen.getByRole('heading', { name: 'Dia selecionado' })).toBeVisible()
})
