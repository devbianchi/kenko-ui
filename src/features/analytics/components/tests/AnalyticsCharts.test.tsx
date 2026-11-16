import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { analyticsMock } from '../../../../../mocks/analytics/analytics'
import { AnalyticsCharts } from '../AnalyticsCharts'
import { CompletionChart } from '../CompletionChart'

const data = analyticsMock.data
const card = (name: string) => within(screen.getByRole('article', { name }))

it('escala funil e términos de acordo com cada etapa', () => {
  render(<AnalyticsCharts data={data} />)
  const funnel = card('Funil de Conversão')
  const triage = funnel.getAllByRole('listitem')[1]
  expect(triage).toHaveTextContent('7 · 87,5%')
  expect(triage.querySelector('[aria-hidden] span')).toHaveStyle({ width: '87.5%' })
  const endings = card('Onde as Conversas Terminam')
  const stacked = endings.getByRole('img', { name: 'Triagem — Desistiu: 1 · Abandonou: 1' }).children
  expect(stacked[0]).toHaveStyle({ width: '50%' })
  expect(stacked[1]).toHaveStyle({ width: '50%' })
  const slotSelection = endings.getByRole('img', { name: 'Escolha de horário — Desistiu: 0 · Abandonou: 1' }).children
  expect(slotSelection).toHaveLength(1)
  expect(slotSelection[0]).toHaveStyle({ width: '50%' })
  const patientData = endings.getByRole('img', { name: 'Dados do paciente — Desistiu: 1 · Abandonou: 0' }).children
  expect(patientData).toHaveLength(1)
  expect(patientData[0]).toHaveStyle({ width: '50%' })
  expect(endings.getByRole('img', { name: 'Confirmação — Desistiu: 0 · Abandonou: 0' })).toBeEmptyDOMElement()
})

it('mostra os términos por ponteiro e teclado, inclusive quando a etapa tem zero', async () => {
  const user = userEvent.setup()
  render(<AnalyticsCharts data={data} />)
  const endings = card('Onde as Conversas Terminam')
  const first = endings.getByRole('img', { name: /^Triagem/ })
  const last = endings.getByRole('img', { name: /^Confirmação/ })
  expect(first).not.toHaveAttribute('title')
  await user.tab()
  expect(first).toHaveFocus()
  expect(first).toHaveAccessibleDescription('Desistiu: 1 · Abandonou: 1')
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  await user.pointer({ target: last, keys: '[MouseLeft]', coords: { x: 124, y: 80 } })
  const tooltip = screen.getByRole('tooltip')
  expect(tooltip).toHaveTextContent('Desistiu: 0 · Abandonou: 0')
  expect(tooltip).toHaveStyle({ left: '124px', top: '80px' })
  await user.unhover(last)
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
})

it('mostra o horário e a contagem da célula apontada ou focada, inclusive zero', async () => {
  const user = userEvent.setup()
  render(<AnalyticsCharts data={data} />)
  const cell = (name: string) => screen.getByRole('cell', { name })
  const tuesday = cell('Ter, 8h–10h: 3')
  const sunday = cell('Dom, 22h–24h: 0')
  expect(tuesday).not.toHaveAttribute('title')
  await user.hover(tuesday)
  expect(tuesday).toHaveAccessibleDescription('Ter, 8h–10h: 3')
  await user.hover(sunday)
  expect(screen.getByRole('tooltip')).toHaveTextContent('Dom, 22h–24h: 0')
  await user.unhover(sunday)
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  await user.click(tuesday)
  await user.tab()
  expect(cell('Ter, 10h–12h: 0')).toHaveFocus()
  expect(screen.getByRole('tooltip')).toHaveTextContent('Ter, 10h–12h: 0')
  await user.pointer({ target: tuesday, coords: { x: 87, y: 31 } })
  expect(screen.getByRole('tooltip')).toHaveTextContent('Ter, 8h–10h: 3')
  expect(screen.getByRole('tooltip')).toHaveStyle({ left: '87px', top: '31px' })
  expect(tuesday).toHaveAccessibleDescription('Ter, 8h–10h: 3')
  await user.keyboard('{Escape}')
  await user.pointer({ target: tuesday, coords: { x: 88, y: 32 } })
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
})

it('destaca as faixas da mediana e P90 incluindo o limite aberto de dez minutos', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<AnalyticsCharts data={data} />)
  const histogram = card('Duração do Atendimento')
  expect(histogram.getByRole('img').querySelectorAll('rect')).toHaveLength(11)
  expect(histogram.getByText('2m30s')).toBeVisible()
  expect(histogram.getByText('4m00s')).toBeVisible()
  const median = histogram.getByLabelText('2 a menos de 3 min · 3 atendimento(s) · Mediana')
  expect(median).toHaveAttribute('fill', 'var(--color-primary)')
  expect(histogram.getByLabelText('4 a menos de 5 min · 1 atendimento(s) · P90')).toHaveAttribute('fill', 'var(--color-tertiary-2)')
  await user.hover(median)
  expect(screen.getByRole('tooltip')).toHaveTextContent('2 a menos de 3 min · 3 atendimento(s) · Mediana')
  const buckets = data.durationDistribution.buckets.map(b => ({ ...b, count: b.label === '10+' ? 1 : 0 }))
  rerender(<AnalyticsCharts data={{ ...data, durationDistribution: { buckets, median: 600, p90: 600 } }} />)
  expect(histogram.getByLabelText('10+ min · 1 atendimento(s) · Mediana · P90')).toHaveAttribute('fill', 'var(--color-tertiary-2)')
  expect(histogram.getByLabelText('9 a menos de 10 min · 0 atendimento(s)')).toHaveAttribute('fill', 'transparent')
})

it('dimensiona as colunas do histograma pela contagem de cada faixa', () => {
  const distribution = data.durationDistribution
  const buckets = distribution.buckets.map(bucket => ({
    ...bucket,
    count: bucket.label === '3' ? 2 : 1,
  }))
  render(<AnalyticsCharts data={{ ...data, durationDistribution: { ...distribution, buckets } }} />)
  const histogram = card('Duração do Atendimento')
  const single = histogram.getByLabelText('1 a menos de 2 min · 1 atendimento(s)')
  const double = histogram.getByLabelText('2 a menos de 3 min · 2 atendimento(s) · Mediana')
  const singleHeight = Number(single.getAttribute('height'))
  expect(singleHeight).toBeGreaterThan(0)
  expect(Number(double.getAttribute('height'))).toBeCloseTo(singleHeight * 2)
})

it('mostra as 84 células e aumenta a intensidade com as contagens', () => {
  render(<AnalyticsCharts data={data} />)
  const map = within(screen.getByRole('table'))
  expect(map.getAllByRole('cell')).toHaveLength(84)
  expect(map.getAllByRole('rowheader').map(th => th.textContent)).toEqual(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'])
  const cell = (name: string) => map.getByRole('cell', { name })
  expect(cell('Seg, 0h–2h: 1')).toBeVisible()
  function intensity(name: string) {
    const percentage = cell(name).style.backgroundColor.match(/([\d.]+)%/)
    return Number(percentage?.[1])
  }
  expect(intensity('Dom, 22h–24h: 0')).toBe(0)
  expect(intensity('Seg, 0h–2h: 1')).toBeCloseTo(100 / 3)
  expect(intensity('Seg, 8h–10h: 2')).toBeCloseTo(200 / 3)
  expect(intensity('Ter, 8h–10h: 3')).toBe(100)
})

it('traça a conclusão e a média fornecidas, com zero e lacunas independentes', () => {
  const { rerender } = render(<CompletionChart points={data.completionSeries.points} />)
  const paths = () => screen.getByRole('img').querySelectorAll('path')
  expect(paths()[0]).toHaveAttribute('d', 'M0,60 L150,60 L300,120 L450,60 L600,0')
  expect(screen.getByText('15–21 · Conclusão: 0,0% · Média móvel: 33,3%')).toBeInTheDocument()
  rerender(<CompletionChart points={[
    { label: 'A', percentage: 0, movingAverage: null }, { label: 'B', percentage: null, movingAverage: 0 },
    { label: 'C', percentage: 100, movingAverage: 50 },
  ]} />)
  expect(paths()[0]).toHaveAttribute('d', 'M0,120 M600,0')
  expect(paths()[1]).toHaveAttribute('d', 'M300,120 L600,60')
  expect(screen.getByText('B · Conclusão: — · Média móvel: 0,0%')).toBeInTheDocument()
  rerender(<CompletionChart points={[{ label: 'A', percentage: 25, movingAverage: 25 }]} />)
  expect(screen.getByRole('img').querySelector('circle')).toHaveAttribute('cx', '300')
})

it('ordena especialidades e dimensiona as barras pela maior contagem', () => {
  render(<AnalyticsCharts data={{ ...data, searchesWithoutSlotsBySpecialty: [...data.searchesWithoutSlotsBySpecialty].reverse() }} />)
  const items = card('Buscas sem Horário por Especialidade').getAllByRole('listitem')
  expect(items.map(item => item.textContent)).toEqual(['Dermatologia2', 'Ortopedia1'])
  expect(items[1].querySelector('[aria-hidden] span')).toHaveStyle({ width: '50%' })
  const total = items.reduce((sum, item) => sum + Number(item.lastElementChild?.textContent), 0)
  expect(total).toBe(data.kpis.searchesWithoutSlots.count)
})

it('aceita coleções vazias e estatísticas sem base', () => {
  render(<AnalyticsCharts data={{ ...data, funnel: [], conversationEndings: [], searchesWithoutSlotsBySpecialty: [],
    durationDistribution: { median: null, p90: null, buckets: [] }, conversationHeatmap: { rows: [], bucketStartHours: [] },
    completionSeries: { ...data.completionSeries, points: [] },
  }} />)
  expect(screen.getAllByText('Sem dados no período.')).toHaveLength(6)
  expect(card('Duração do Atendimento').getAllByText('—')).toHaveLength(2)
})
