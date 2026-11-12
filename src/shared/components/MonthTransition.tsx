import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export function MonthTransition({
  value,
  children,
  className = '',
}: {
  value: string
  children: (displayedValue: string) => ReactNode
  className?: string
}) {
  const [displayedValue, setDisplayedValue] = useState(value)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (value === displayedValue) return

    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setVisible(false)
    let enterTimer: number | undefined
    const exitTimer = window.setTimeout(() => {
      setDisplayedValue(value)
      if (reducedMotion) {
        setVisible(true)
        return
      }
      enterTimer = window.setTimeout(() => setVisible(true), 20)
    }, reducedMotion ? 0 : 150)

    return () => {
      window.clearTimeout(exitTimer)
      if (enterTimer !== undefined) window.clearTimeout(enterTimer)
    }
  }, [value])

  return (
    <div className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}>
      {children(displayedValue)}
    </div>
  )
}
