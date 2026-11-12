export const MIN_SELECTABLE_MONTH = '2024-01'

export function currentBusinessMonth() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
  }).format(new Date())
}
