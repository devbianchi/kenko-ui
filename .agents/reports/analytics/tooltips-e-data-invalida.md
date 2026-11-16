## Analytics — tooltips e tela de data inválida
Status: 6/6 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Ponteiro, clique e teclado apresentam desistências e abandonos da etapa, inclusive zero. | src/features/analytics/components/HorizontalBars.tsx:11, src/shared/hooks/useChartTooltip.tsx:7 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:24 | done |
| B2 | Célula informa dia, faixa e contagem. Outra célula atualiza o popup. Saída e Escape o fecham. | src/features/analytics/components/Heatmap.tsx:6, src/shared/hooks/useChartTooltip.tsx:59 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:44 | done |
| B3 | Colunas do Dia e do histograma mantêm a descrição, posição, foco e dispensa do popup. | src/shared/components/ColumnChart.tsx:10 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:65, src/features/day/components/tests/BarCharts.test.tsx:43, :57, :75 | done |
| B4 | Referência impossível, futura, incompleta, fora da faixa ou ambígua abre a tela de erro e preserva a URL. | src/features/analytics/data/analytics.ts:7, src/features/analytics/components/AnalyticsFilter.tsx:9, src/features/analytics/pages/AnalyticsPage.tsx:11 | src/features/analytics/tests/AnalyticsPage.test.tsx:90 | done |
| B5 | O link retorna aos indicadores. O histórico recupera o erro. Uma referência mensal válida implícita mantém sua URL. | src/shared/components/InvalidDate.tsx:4, src/features/analytics/pages/AnalyticsPage.tsx:12, src/features/analytics/data/analytics.ts:7 | src/features/analytics/tests/AnalyticsPage.test.tsx:29, :105, :116 | done |
| B6 | No Dia, a mesma tela exibe o texto original e o link ao Calendário. | src/features/day/pages/DayPage.tsx:130, src/shared/components/InvalidDate.tsx:4 | src/features/day/tests/DayPage.test.tsx:54, :120 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/shared/hooks/useChartTooltip.tsx | hook | Extrai eventos, ancoragem, portal, foco, Escape e transição do gráfico de colunas. |
| src/shared/components/ColumnChart.tsx | shared | Usa o hook para Dia e histograma. |
| src/features/analytics/components/HorizontalBars.tsx | component | Oferece popup nas barras de términos, inclusive nas etapas sem ocorrências. |
| src/features/analytics/components/Heatmap.tsx | component | Oferece popup em cada faixa e dia. |
| src/shared/components/InvalidDate.tsx | shared | Compartilha estrutura visual e recebe instruções e destino da página. |
| src/features/day/pages/DayPage.tsx | page | Usa o cartão compartilhado com o texto do Dia. |
| src/features/analytics/data/analytics.ts | data access | Distingue entrada inicial de referência inválida ou ambígua. |
| src/features/analytics/components/AnalyticsFilter.tsx | component | Atualiza a URL somente ao aplicar o filtro. |
| src/features/analytics/pages/AnalyticsPage.tsx | page | Apresenta o erro com exemplos de semana, mês e ano e retorno para Analytics. |
| src/features/analytics/components/tests/AnalyticsCharts.test.tsx | test | Testa tooltips no DOM, teclado, ponteiro, zero e encerramento. |
| src/features/analytics/tests/AnalyticsPage.test.tsx | test | Testa erro, URL original, parâmetros incompletos, retorno explícito e histórico. |
| .agents/context/contexto-front.md | documentation | Registra os novos comportamentos de Analytics. |
| .agents/reports/analytics/tooltips-e-data-invalida.md | documentation | Registra a alteração posterior ao relatório inicial de Analytics. |

Decisions: uma implementação de popup para os três gráficos; os eventos também funcionam ao focar ou tocar. Alternativa descartada: manter cópias dos manipuladores.
Decisions: URL sem seleção abre a visão inicial; referência mensal isolada continua válida. Parâmetros repetidos de período ou referência abrem a tela de erro. A tela oferece um único caminho de recuperação para /analytics.
Obstacles: as expectativas anteriores de normalização e de title nativo correspondiam à interface substituída. Os testes agora verificam URL intacta, conteúdo acessível e popup visível.
Checks: npm test -- src/features/analytics/components/tests/AnalyticsCharts.test.tsx src/features/day/components/tests/BarCharts.test.tsx → 16/16.
Checks: npm test -- src/features/analytics/tests/AnalyticsPage.test.tsx src/features/day/tests/DayPage.test.tsx → 36/36.
Checks: npm run build → TypeScript e Vite passaram. Lint indisponível no projeto. npm test → 118/118, 13 arquivos. git diff --check → passou.
Outside scope (not fixed): alterações anteriores da própria página de Analytics já presentes na árvore.
Open: nenhum.
