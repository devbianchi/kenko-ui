import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { HomePage } from '../../../features/home/pages/HomePage'
import { AppLayout } from '../AppLayout'

it.each(['/home', '/home/', '/analytics'])('mantém um cabeçalho e um conteúdo principal em %s', path => {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<AppLayout />}>
      <Route path="/home" element={<HomePage />} />
      <Route path="/analytics" element={<h1>Analytics</h1>} />
    </Route>
  </Routes></MemoryRouter>)

  expect(screen.getAllByRole('navigation', { name: 'Navegação principal' })).toHaveLength(1)
  expect(screen.getAllByRole('main')).toHaveLength(1)
  if (path.startsWith('/home')) {
    expect(screen.getByLabelText('Mês e ano')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Olá, Clínica' })).toBeVisible()
  } else {
    expect(screen.queryByLabelText('Mês e ano')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  }
})
