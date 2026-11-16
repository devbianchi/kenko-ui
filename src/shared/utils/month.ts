export const MIN_SELECTABLE_MONTH = '2024-01'

const businessDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function businessToday() {
  return businessDateFormatter.format(new Date())
}

export function currentBusinessMonth() {
  return businessToday().slice(0, 7)
}
