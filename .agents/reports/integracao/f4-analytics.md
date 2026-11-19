## F4 — Analytics com a API
Status: 8/8 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Sem filtro na URL, abre o mês atual de Brasília e busca `GET /analytics?period=month&reference` | src/features/analytics/data/analytics.ts:7; src/features/analytics/api.ts:7 | src/features/analytics/tests/AnalyticsPage.test.tsx:39 | done |
| B2 | Mês, semana e ano buscam cada período na API e mostram os indicadores (antes, semana e ano ficavam sem dados) | src/features/analytics/pages/AnalyticsPage.tsx:18 | src/features/analytics/tests/AnalyticsPage.test.tsx:67 | done |
| B3 | Trocar de período mantém os dados anteriores até chegarem os novos; o histórico restaura o período | src/features/analytics/api.ts:11 | src/features/analytics/tests/AnalyticsPage.test.tsx:67, :167 | done |
| B4 | Título e pontos da série seguem a API: `month_blocks`, `daily` e `monthly` | src/features/analytics/data/analytics.ts:56; src/features/analytics/components/AnalyticsCharts.tsx:19 | src/features/analytics/tests/AnalyticsPage.test.tsx:103 | done |
| B5 | Período inválido para o painel mostra a orientação sem chamar a API | src/features/analytics/pages/AnalyticsPage.tsx:46 | src/features/analytics/tests/AnalyticsPage.test.tsx:130 | done |
| B6 | Período recusado pela API (ex.: FUTURE_PERIOD) mostra a mesma orientação | src/features/analytics/pages/AnalyticsPage.tsx:26 | src/features/analytics/tests/AnalyticsPage.test.tsx:146 | done |
| B7 | Erro da API mostra o alerta e busca de novo pelo botão | src/features/analytics/pages/AnalyticsPage.tsx:26 | src/features/analytics/tests/AnalyticsPage.test.tsx:154 | done |
| B8 | Cards arredondam só na apresentação e preservam zero e ausência de base | src/features/analytics/data/analytics.ts (kpiCards, sem mudança) | src/features/analytics/tests/AnalyticsPage.test.tsx:56 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/analytics/api.ts | data access | novo: useAnalytics |
| src/features/analytics/data/analytics.ts | data access | padrão no mês atual; grouping e pontos do contrato; remove analyticsFor |
| src/features/analytics/pages/AnalyticsPage.tsx | page | busca na API com QueryState; orientação de período em InvalidPeriod |
| src/features/analytics/components/AnalyticsCharts.tsx | component | rótulos de daily e monthly |
| src/features/analytics/components/CompletionChart.tsx | component | recebe só rótulo, conclusão e média móvel |
| src/features/analytics/tests/AnalyticsPage.test.tsx | test | reescrito para a API substituída |

Decisions: remover o recorte de blocos do mês no cliente | a API gera os blocos de cada mês (29–fim só quando o mês tem esse dia), com teste no backend | rejected: manter o recorte como segunda checagem
Decisions: CompletionChart pede só os campos que desenha | evita exigir contagens que o gráfico não usa | rejected: completar os pontos dos testes com started e confirmed
Checks: spec src/features/analytics -> 30 passed. Final: tsc -b -> ok; full suite -> 161 passed (17 files); lint -> not run: não configurado
Outside scope (not fixed): testes rodados com NODE_OPTIONS=--no-experimental-webstorage (Node 26 nesta máquina)
Open: F5 (Showcase)
