import { useEffect, useId, useRef, useState } from 'react'
import type { FocusEvent, MouseEvent, PointerEvent } from 'react'
import { createPortal } from 'react-dom'

type TargetKey = number | string

export function useChartTooltip() {
  const id = useId()
  const pointerPress = useRef(false)
  const [visible, setVisible] = useState(false)
  const [activeKey, setActiveKey] = useState<TargetKey | null>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (!visible) return
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setVisible(false)
    }
    document.addEventListener('keydown', dismissOnEscape)
    return () => document.removeEventListener('keydown', dismissOnEscape)
  }, [visible])

  function show(key: TargetKey, left: number, top: number) {
    setActiveKey(key)
    setPosition({ left, top })
    setVisible(true)
  }

  function triggerProps(key: TargetKey) {
    return {
      tabIndex: 0,
      'aria-describedby': visible && activeKey === key ? id : undefined,
      onPointerEnter: (event: PointerEvent) => show(key, event.clientX, event.clientY),
      onPointerMove: (event: PointerEvent) => {
        if (visible) show(key, event.clientX, event.clientY)
      },
      onPointerLeave: () => {
        pointerPress.current = false
        setVisible(false)
      },
      onPointerDown: (event: PointerEvent) => {
        pointerPress.current = true
        show(key, event.clientX, event.clientY)
      },
      onPointerUp: () => { pointerPress.current = false },
      onPointerCancel: () => { pointerPress.current = false },
      onClick: (event: MouseEvent) => {
        if (event.detail > 0) show(key, event.clientX, event.clientY)
      },
      onFocus: (event: FocusEvent) => {
        if (pointerPress.current) return
        const bounds = event.currentTarget.getBoundingClientRect()
        show(key, bounds.left + bounds.width / 2, bounds.top)
      },
      onBlur: () => setVisible(false),
    }
  }

  function renderTooltip(key: TargetKey, description: string) {
    if (activeKey !== key) return null
    return createPortal(
      <div id={id} role="tooltip" aria-hidden={!visible} className={`pointer-events-none fixed z-10 -mt-3 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-3 py-2 max-w-full font-body text-sm font-semibold text-background shadow-card transition-opacity duration-150 ease-out motion-reduce:transition-none starting:opacity-0 ${visible ? 'opacity-100' : 'opacity-0'}`} style={position}>
        {description}
      </div>, document.body,
    )
  }

  return { triggerProps, renderTooltip }
}
