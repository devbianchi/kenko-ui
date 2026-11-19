import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { homeMock } from '../../../../mocks/home/home'
import { HomePage } from '../../../features/home/pages/HomePage'
import { CalendarPage } from '../../../features/calendar/pages/CalendarPage'
import { AppLayout } from '../AppLayout'
import { envelope, jsonResponse, stubFetch } from '../../../test/http'
import { createTestQueryClient } from '../../../test/renderWithProviders'

it.each(['/home', '/home/', '/calendar', '/analytics'])('mantém um cabeçalho e um conteúdo principal em %s', async path => {
  stubFetch(() => jsonResponse(envelope(homeMock.data)))
  render(<QueryClientProvider client={createTestQueryClient()}><MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<AppLayout />}>
      <Route path="/home" element={<HomePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/analytics" element={<h1>Analytics</h1>} />
    </Route>
  </Routes></MemoryRouter></QueryClientProvider>)

  expect(screen.getAllByRole('navigation', { name: 'Navegação principal' })).toHaveLength(1)
  expect(screen.getAllByRole('main')).toHaveLength(1)
  expect(screen.getByRole('banner')).toHaveClass('max-w-dashboard-header')
  expect(screen.getByRole('main')).toHaveClass('max-w-dashboard-header')
  if (path.startsWith('/home') || path === '/calendar') {
    expect(screen.getByLabelText('Mês e ano')).toBeVisible()
    if (path.startsWith('/home')) expect(await screen.findByRole('heading', { name: 'Olá, Clínica' })).toBeVisible()
    else expect(screen.getByRole('heading', { name: 'Novembro | 2026' })).toBeVisible()
  } else {
    expect(screen.queryByLabelText('Mês e ano')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  }
  expect(screen.getByRole('banner')).toHaveClass('mx-auto')
})
