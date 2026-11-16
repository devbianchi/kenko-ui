import type { ReactNode } from 'react'
import { DashboardCard } from '../../../shared/components/DashboardCard'
import { ColumnChart } from '../../../shared/components/ColumnChart'
import { formatDuration } from '../../../shared/utils/duration'
import { endingRows, funnelRows, histogramColumns, specialtyRows, type AnalyticsData } from '../data/analytics'
import { CompletionChart } from './CompletionChart'
import { Heatmap } from './Heatmap'
import { HorizontalBars } from './HorizontalBars'

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <DashboardCard label={title} motion={false} className="p-4 sm:p-5">
    <h2 className="font-heading text-[0.95em] font-semibold">{title}</h2>
    <p className="mb-3 text-[0.8em] text-text-muted">{subtitle}</p>
    {children}
  </DashboardCard>
}

const asymmetricRow = 'grid gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]'
const granularity = { month_blocks: 'Bloco do Mês', day: 'Dia', month: 'Mês' }

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const distribution = data.durationDistribution
  const series = data.completionSeries
  return <section aria-label="Gráficos de Analytics" className="grid gap-4">
    <div className={asymmetricRow}>
      <ChartCard title="Funil de Conversão" subtitle="Quantas conversas chegam a cada etapa">
        <HorizontalBars rows={funnelRows(data.funnel)} />
      </ChartCard>
      <ChartCard title="Onde as Conversas Terminam" subtitle="Desistências e abandonos por etapa">
        <HorizontalBars rows={endingRows(data.conversationEndings)} />
        <div className="mt-3 flex gap-4 text-xs text-text-muted">
          <span><i aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-xs bg-tertiary" />Desistiu</span>
          <span><i aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-xs bg-tertiary-2" />Abandonou</span>
        </div>
      </ChartCard>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <ChartCard title="Duração do Atendimento" subtitle="Do início da conversa à primeira confirmação, em minutos">
        {distribution.buckets.length
          ? <ColumnChart points={histogramColumns(distribution)} label="Distribuição das durações em minutos" histogram />
          : <p className="text-label text-text-muted">Sem dados no período.</p>}
        <dl className="mt-3 flex gap-6">
          {([['Mediana', distribution.median], ['P90 (percentil 90)', distribution.p90]] as const).map(([label, seconds]) => (
            <div key={label} className="flex flex-col-reverse"><dt className="text-label font-semibold">{label}</dt>
              <dd className="text-metric leading-tight font-semibold">{formatDuration(seconds)}</dd>
            </div>
          ))}
        </dl>
      </ChartCard>
      <ChartCard title="Quando Procuram a Clínica" subtitle="Início de conversas por dia e faixa de horário">
        <Heatmap {...data.conversationHeatmap} />
      </ChartCard>
    </div>
    <div className={asymmetricRow}>
      <ChartCard title={`Taxa de Conclusão por ${granularity[series.grouping]}`} subtitle={`Linha fina: conclusão. Linha grossa: média móvel de ${series.movingAverageWindow} períodos.`}>
        <CompletionChart points={series.points} />
      </ChartCard>
      <ChartCard title="Buscas sem Horário por Especialidade" subtitle="Buscas que não encontraram horário disponível">
        <HorizontalBars rows={specialtyRows(data.searchesWithoutSlotsBySpecialty)} />
      </ChartCard>
    </div>
  </section>
}
