import type { Slot } from './types'

const zone = 'America/Sao_Paulo'
const timeFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: zone, hour: '2-digit', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: zone, day: '2-digit', month: '2-digit' })
const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: zone, weekday: 'short' })

export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso))
}

/** "20/11 às 07:00", no fuso de negócio. */
export function formatDayTime(iso: string) {
  const date = new Date(iso)
  return `${dayFormat.format(date)} às ${timeFormat.format(date)}`
}

export function formatSlot(slot: Slot) {
  const weekday = weekdayFormat.format(new Date(slot.startsAt)).replace('.', '')
  return `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${formatDayTime(slot.startsAt)}`
}

/** Tempo desde a última interação real, medido no relógio da API (evaluatedAt), não no do navegador. */
export function elapsedLabel(lastInteractionAt: string, evaluatedAt: string) {
  const minutes = Math.floor((Date.parse(evaluatedAt) - Date.parse(lastInteractionAt)) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h`
  return `${Math.floor(minutes / (24 * 60))}d`
}
