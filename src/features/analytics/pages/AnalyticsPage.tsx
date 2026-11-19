import { useSearchParams } from 'react-router'
import { DashboardCard } from '../../../shared/components/DashboardCard'
import { InvalidDate } from '../../../shared/components/InvalidDate'
import { QueryState } from '../../../shared/components/QueryState'
import type { PeriodSelection } from '../../../shared/utils/period'
import { useAnalytics } from '../api'
import { AnalyticsCharts } from '../components/AnalyticsCharts'
import { kpiCards, periodTitle, readAnalyticsPeriod } from '../data/analytics'

function InvalidPeriod() {
  return <InvalidDate message="Confira a referência do período que você quer consultar em Analytics."
    returnTo="/analytics" returnLabel="Voltar para Analytics">
    <li>Segue o formato do período escolhido: semana (2024-01-07), mês (2024-01) ou ano (2024).</li>
    <li>É uma data válida entre janeiro de 2024 e o período atual em Brasília.</li>
  </InvalidDate>
}

function AnalyticsContent({ selection }: { selection: PeriodSelection }) {
  const query = useAnalytics(selection)

  return <div className="space-y-4">
    <header>
      <h1 className="font-heading text-metric leading-tight font-bold tracking-tight sm:text-page">Analytics – {periodTitle(selection)}</h1>
      <p className="mt-1">Entenda como o atendimento e a demanda evoluem ao longo do tempo.</p>
    </header>
    <QueryState query={query} invalid={<InvalidPeriod />}>
      {data => <>
        <section aria-label="Indicadores do período" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {kpiCards(data.kpis).map(card => <DashboardCard key={card.label} label={card.label} tone={card.tone}
            motion={false} className="flex min-h-32 flex-col items-center justify-center px-3 py-4 text-center max-sm:last:col-span-2">
            <h2 className="text-[0.8em] leading-tight">{card.label}</h2>
            <p className="my-1 text-[clamp(1.85em,3vw,2.9em)] leading-none font-bold tabular-nums">{card.value}</p>
            <p className="text-[0.8em]"><span className="sr-only">Variação sobre o período anterior: </span>{card.detail}</p>
          </DashboardCard>)}
        </section>
        <AnalyticsCharts data={data} />
      </>}
    </QueryState>
  </div>
}

export function AnalyticsPage() {
  const [params] = useSearchParams()
  const selection = readAnalyticsPeriod(params)
  // A validação local evita chamar a API com um período que o painel não permite.
  if (!selection) return <InvalidPeriod />
  return <AnalyticsContent selection={selection} />
}
