import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export function MonthTransition({
  value,
  children,
  className = '',
}: {
  value: string
  children: (displayedValue: string, transitioning: boolean) => ReactNode
  className?: string
}) {
  const [displayedValue, setDisplayedValue] = useState(value)
  const [visible, setVisible] = useState(true)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    if (!visible || !entering) return
    // Keep navigation locked for the wrapper's duration-200 opacity transition.
    const timer = window.setTimeout(() => setEntering(false), 200)
    return () => window.clearTimeout(timer)
  }, [visible, entering])

  useEffect(() => {
    if (value === displayedValue) {
      setVisible(true)
      return
    }

    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setVisible(false)
    setEntering(!reducedMotion)
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
      {children(displayedValue, value !== displayedValue || !visible || entering)}
    </div>
  )
}
