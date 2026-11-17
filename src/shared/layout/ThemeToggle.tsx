import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useLayoutEffect, useState } from 'react'

const preferenceKey = 'kenko-theme'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(preferenceKey) === 'dark'
    } catch {
      return false
    }
  })

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = dark ? 'dark' : 'light'
    const chrome = document.querySelector('meta[name="theme-color"]')
    chrome?.setAttribute('content', getComputedStyle(root).getPropertyValue('--color-background').trim())
  }, [dark])

  function toggleTheme() {
    setDark(!dark)
    try {
      localStorage.setItem(preferenceKey, dark ? 'light' : 'dark')
    } catch {
      // O tema continua disponível na sessão quando o navegador bloqueia o storage.
    }
  }

  const Icon = dark ? SunIcon : MoonIcon
  const label = dark ? 'Ativar modo claro' : 'Ativar modo escuro'
  return (
    <button type="button" aria-label={label} title={label} onClick={toggleTheme}
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-theme-button text-theme-icon motion-safe:transition-[scale,opacity] motion-safe:duration-150 hover:opacity-90 motion-safe:hover:scale-102 motion-safe:active:scale-95">
      <Icon aria-hidden="true" className="size-6" />
    </button>
  )
}
