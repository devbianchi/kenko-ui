export function formatDuration(seconds: number | null) {
  if (seconds === null) return '—'
  const rounded = Math.round(seconds)
  return `${Math.floor(rounded / 60)}m${String(rounded % 60).padStart(2, '0')}s`
}
