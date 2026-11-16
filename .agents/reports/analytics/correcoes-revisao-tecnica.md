## Correções da revisão técnica de Analytics

Status: 6/6 IDs done. Bloqueios: nenhum.

### Behavior map

| ID | Comportamento | Código | Teste | Status |
|----|---------------|--------|-------|--------|
| B1 (review) | Após clique na célula com 3 conversas e Tab para a de 0, mover o ponteiro sobre a primeira mostra 3 nas coordenadas do ponteiro. Escape mantém o popup fechado ao mover dentro da mesma célula. | src/shared/hooks/useChartTooltip.tsx:35 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:64 | done |
| B2 (review) | Uma faixa com 2 atendimentos tem o dobro da altura de uma faixa com 1. | src/shared/components/ColumnChart.tsx:20 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:98 | done |
| B3 (review) | Na etapa Escolha de horário, 0 desistências e 1 abandono ocupam respectivamente 0% e 50% da escala do mock. | src/features/analytics/data/analytics.ts:123 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:21 | done |
| B4 (review) | Contagens 0, 1, 2 e 3 usam 0%, um terço, dois terços e 100% da escala do mapa. | src/features/analytics/components/Heatmap.tsx:24 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:114 | done |
| B5 (review) | Fevereiro tem quatro blocos em 2025 e cinco em 2024. A sequência termina respectivamente em 22–28 e 29–29. | src/features/analytics/data/analytics.ts:72 | src/features/analytics/tests/AnalyticsPage.test.tsx:86 | done |
| B6 (review) | Dia e mês de negócio passam de novembro para dezembro à meia-noite de Brasília. Em UTC, os dois instantes de teste já são 1º de dezembro. | src/shared/utils/month.ts:7, :11 | src/shared/utils/tests/month.test.ts:6 | done |

### File map

| Arquivo | Papel | Alteração |
|---------|-------|-----------|
| src/shared/hooks/useChartTooltip.tsx | hook | Sincroniza alvo e posição do popup visível no movimento do ponteiro. |
| src/features/analytics/components/tests/AnalyticsCharts.test.tsx | test | Cobre alternância entre teclado e ponteiro, altura das colunas, ordem dos segmentos e intensidades numéricas. |
| src/features/analytics/tests/AnalyticsPage.test.tsx | test | Compara os rótulos de fevereiro em ordem e confere a visibilidade de cada um. |
| src/shared/utils/month.ts | shared | Centraliza o dia de Brasília e deriva dele o mês. |
| src/shared/utils/period.ts | shared | Remove a implementação duplicada da data de negócio do módulo de validação. |
| src/shared/components/MonthPicker.tsx | shared | Obtém a data de negócio da fonte comum. |
| src/features/analytics/data/analytics.ts | data access | Usa a mesma fonte ao validar o período da URL. |
| src/shared/utils/tests/month.test.ts | test | Verifica os limites um milissegundo antes da virada e no instante da virada. |
| .agents/reports/analytics/correcoes-revisao-tecnica.md | documentation | Registra as correções, os testes e as verificações. |

Decisions: reutilizar a função existente que atualiza o alvo e a posição, sob a condição de popup visível, para preservar Escape. A escala dos gráficos e o recorte de fevereiro já atendiam aos requisitos e receberam testes específicos. O formatador do dia e a derivação do mês ficam juntos no utilitário compartilhado existente.

Obstacles: o sandbox bloqueou a renomeação do cache temporário do Vitest (EPERM) na primeira execução de AnalyticsCharts.test.tsx. A execução autorizada completou os nove testes do arquivo.

Checks:
- npm test -- src/features/analytics/components/tests/AnalyticsCharts.test.tsx → 9/9.
- npm test -- src/features/analytics/tests/AnalyticsPage.test.tsx → 18/18.
- npm test -- src/shared/utils/tests/month.test.ts → 2/2.
- npm run build → TypeScript e build de produção passaram.
- npm test → 121/121 em 14 arquivos.
- git diff --check → passou para alterações rastreadas. Lint indisponível no projeto.

Outside scope (not fixed): alterações pré-existentes da implementação inicial e do relatório complementar de Analytics.
Open: nenhum.
