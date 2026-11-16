import { analyticsMock } from '../../../../mocks/analytics/analytics'
import { formatDuration } from '../../../shared/utils/duration'
import { businessToday } from '../../../shared/utils/month'
import { isValidReference, type PeriodSelection } from '../../../shared/utils/period'

const mockMonth = '2026-10'

export function readAnalyticsPeriod(params: URLSearchParams, today = businessToday()): PeriodSelection | null {
  if (!params.has('period') && !params.has('reference')) {
    return { period: 'month', reference: mockMonth <= today.slice(0, 7) ? mockMonth : today.slice(0, 7) }
  }
  if (params.getAll('period').length > 1 || params.getAll('reference').length > 1) return null
  const period = params.get('period') ?? 'month'
  const reference = params.get('reference') ?? ''
  if ((period === 'week' || period === 'month' || period === 'year') && isValidReference({ period, reference }, today)) {
    return { period, reference }
  }
  return null
}

export function periodTitle({ period, reference }: PeriodSelection) {
  if (period === 'year') return reference
  if (period === 'week') {
    const start = new Date(reference + 'T12:00:00Z')
    start.setUTCDate(start.getUTCDate() - 6)
    const format = (iso: string) => iso.split('-').reverse().join('/')
    return `${format(start.toISOString().slice(0, 10))} a ${format(reference)}`
  }
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(reference + '-01T12:00:00Z'))
  return month[0].toUpperCase() + month.slice(1) + ' ' + reference.slice(0, 4)
}

const funnelLabels = {
  started_scheduling: 'Iniciaram', answered_specialty: 'Triagem', received_slot_result: 'Viram horários',
  selected_slot: 'Escolheram', confirmed: 'Confirmaram',
}
const endingLabels = {
  triage: 'Triagem', slot_selection: 'Escolha de horário', patient_data: 'Dados do paciente', confirmation: 'Confirmação',
}

type Comparison = { difference: number | null; differenceUnit: 'percentage_points' | 'seconds' | 'count' }
type PercentageKpi = Comparison & { percentage: number | null }
type Bucket = { label: string; count: number; fromInclusive: number; toExclusive: number | null }

export type AnalyticsData = {
  kpis: {
    botCompletion: PercentageKpi
    attendanceDuration: Comparison & { seconds: number | null }
    outsideBusinessHours: PercentageKpi
    agendaOccupancy: PercentageKpi
    searchesWithoutSlots: Comparison & { count: number }
  }
  funnel: readonly { stage: keyof typeof funnelLabels; count: number; percentage: number | null }[]
  conversationEndings: readonly { stage: keyof typeof endingLabels; exited: number; abandoned: number }[]
  durationDistribution: { median: number | null; p90: number | null; buckets: readonly Bucket[] }
  conversationHeatmap: { bucketStartHours: readonly number[]; rows: readonly { weekday: number; counts: readonly number[] }[] }
  completionSeries: {
    grouping: 'month_blocks' | 'day' | 'month'
    movingAverageWindow: number
    points: readonly { label: string; percentage: number | null; movingAverage: number | null }[]
  }
  searchesWithoutSlotsBySpecialty: readonly { specialtyId: string; name: string; count: number }[]
}

export function analyticsFor({ period, reference }: PeriodSelection): AnalyticsData | null {
  if (period !== 'month') return null
  const data = analyticsMock.data
  const [year, month] = reference.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const points = data.completionSeries.points.flatMap(point => {
    const [start, end] = point.label.split('–').map(Number)
    if (start > lastDay) return []
    return [{ ...point, label: end > lastDay ? `${String(start).padStart(2, '0')}–${lastDay}` : point.label }]
  })
  return { ...data, completionSeries: { ...data.completionSeries, points } }
}

export function percent(value: number | null, digits = 1) {
  return value === null ? '—' : value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + '%'
}

function difference({ difference: value, differenceUnit }: Comparison) {
  if (value === null) return '—'
  const signed = value.toLocaleString('pt-BR', { signDisplay: 'exceptZero', maximumFractionDigits: 1 })
  return signed + { percentage_points: ' pp', seconds: ' s', count: '' }[differenceUnit]
}

export function kpiCards(kpis: AnalyticsData['kpis']) {
  return [
    { label: 'Conclusão do Bot', value: percent(kpis.botCompletion.percentage, 0), detail: difference(kpis.botCompletion), tone: 'dark' },
    { label: 'Mediana de Atendimento', value: formatDuration(kpis.attendanceDuration.seconds), detail: difference(kpis.attendanceDuration), tone: 'gray' },
    { label: 'Conversas iniciadas fora do expediente', value: percent(kpis.outsideBusinessHours.percentage, 0), detail: difference(kpis.outsideBusinessHours), tone: 'light' },
    { label: 'Ocupação da Agenda', value: percent(kpis.agendaOccupancy.percentage, 0), detail: difference(kpis.agendaOccupancy), tone: 'light' },
    { label: 'Buscas sem Horário', value: kpis.searchesWithoutSlots.count.toLocaleString('pt-BR'), detail: difference(kpis.searchesWithoutSlots), tone: 'primary' },
  ] as const
}

export function histogramColumns({ buckets, median, p90 }: AnalyticsData['durationDistribution']) {
  return buckets.map(bucket => {
    const contains = (seconds: number | null) => seconds !== null && seconds >= bucket.fromInclusive
      && (bucket.toExclusive === null || seconds < bucket.toExclusive)
    const range = bucket.toExclusive === null ? `${bucket.fromInclusive / 60}+ min` : `${bucket.fromInclusive / 60} a menos de ${bucket.toExclusive / 60} min`
    const marks = [contains(median) && 'Mediana', contains(p90) && 'P90'].filter(Boolean)
    return {
      label: bucket.label, count: bucket.count,
      description: [range, `${bucket.count} atendimento(s)`, ...marks].join(' · '),
      fill: contains(p90) ? 'var(--color-tertiary-2)' : contains(median) ? 'var(--color-primary)' : 'var(--color-tertiary)',
    }
  })
}

export function funnelRows(stages: AnalyticsData['funnel']) {
  return stages.map(({ stage, count, percentage }) => ({
    label: funnelLabels[stage], detail: `${count.toLocaleString('pt-BR')} · ${percent(percentage)}`,
    segments: [{ width: percentage ?? 0, color: 'bg-primary' }],
  }))
}

export function endingRows(stages: AnalyticsData['conversationEndings']) {
  const max = Math.max(1, ...stages.map(row => row.exited + row.abandoned))
  return stages.map(({ stage, exited, abandoned }) => ({
    label: endingLabels[stage], description: `Desistiu: ${exited} · Abandonou: ${abandoned}`,
    segments: [{ width: exited / max * 100, color: 'bg-tertiary' }, { width: abandoned / max * 100, color: 'bg-tertiary-2' }],
  }))
}

export function specialtyRows(specialties: AnalyticsData['searchesWithoutSlotsBySpecialty']) {
  const sorted = [...specialties].sort((a, b) => b.count - a.count)
  const max = sorted[0]?.count || 1
  return sorted.map(({ specialtyId, name, count }) => ({
    id: specialtyId, label: name, detail: count.toLocaleString('pt-BR'),
    segments: [{ width: count / max * 100, color: 'bg-secondary' }],
  }))
}
