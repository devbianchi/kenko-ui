import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  // Testes de rede trocam o fetch global (src/test/http.ts); restoreMocks não desfaz stubGlobal.
  vi.unstubAllGlobals()
})
