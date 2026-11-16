## Página de Analytics
Status: 10/10 IDs done. Blocked / not done: nenhum no protótipo mensal.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Outubro abre com cinco KPIs e seis gráficos. Percentuais nos cards são inteiros e deltas mantêm a unidade recebida. | src/features/analytics/pages/AnalyticsPage.tsx:6, src/features/analytics/data/analytics.ts:83 | src/features/analytics/tests/AnalyticsPage.test.tsx:29, :45 | done |
| B2 | Rascunho até Aplicar. Mesma fixture em todos os meses, blocos válidos em fevereiro, aviso de semana/ano, URL e histórico preservados. | src/features/analytics/components/AnalyticsFilter.tsx:7, src/features/analytics/data/analytics.ts:16, :60 | src/features/analytics/tests/AnalyticsPage.test.tsx:56, :83 | done |
| B3 | Referência inválida ou futura na URL volta ao padrão. Ano futuro no formulário mantém a seleção anterior. Escape descarta o rascunho. | src/shared/utils/period.ts:13, src/features/analytics/data/analytics.ts:7, src/shared/components/MonthPicker.tsx:23 | src/features/analytics/tests/AnalyticsPage.test.tsx:90, :96 | done |
| B4 | Funil mostra contagem e percentual por etapa. Términos empilham desistências e abandonos na mesma escala. | src/features/analytics/data/analytics.ts:107, :114, src/features/analytics/components/HorizontalBars.tsx:9 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:11 | done |
| B5 | Histograma preserva os limites das 11 faixas, inclusive 600 s, quantidades e marcadores de mediana/P90. | src/features/analytics/data/analytics.ts:93, src/shared/components/ColumnChart.tsx:6 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:24 | done |
| B6 | Mapa usa 7 dias × 12 faixas, inclusive madrugada e zero. Maior contagem recebe cor mais escura. | src/features/analytics/components/Heatmap.tsx:5 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:42 | done |
| B7 | Série e média móvel usam os percentuais e rótulos recebidos. Zero chega ao eixo e null interrompe apenas a respectiva linha. | src/features/analytics/components/CompletionChart.tsx:11, :26 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:54 | done |
| B8 | Ranking decrescente de buscas com barras proporcionais. Contagens correspondem ao KPI. | src/features/analytics/data/analytics.ts:122, src/features/analytics/components/HorizontalBars.tsx:9 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:70 | done |
| B9 | Coleções vazias exibem mensagem. Estatísticas sem base e diferenças ausentes exibem travessão. Zero continua numérico. | src/features/analytics/components/AnalyticsCharts.tsx:21, src/features/analytics/data/analytics.ts:73, :77 | src/features/analytics/components/tests/AnalyticsCharts.test.tsx:79, src/features/analytics/tests/AnalyticsPage.test.tsx:45 | done |
| B10 | Filtro mensal da Home/Calendário conserva Aplicar e limites. Dia conserva horário de expediente, zeros, ponteiro e teclado no gráfico. | src/shared/components/MonthPicker.tsx:13, src/features/day/components/HourlyAppointmentsChart.tsx:4, src/shared/components/ColumnChart.tsx:6 | src/shared/components/tests/MonthPicker.test.tsx:13, src/features/day/components/tests/BarCharts.test.tsx:7, :43, :75 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/analytics/pages/AnalyticsPage.tsx | page | Substitui placeholder pelo cabeçalho, cinco cards e painel de gráficos. |
| src/features/analytics/data/analytics.ts | data access | Seleciona o mock e transforma agregados em dados de apresentação. |
| src/features/analytics/components/AnalyticsFilter.tsx | component | Liga o seletor à URL e ao histórico. |
| src/features/analytics/components/AnalyticsCharts.tsx | component | Agrupa seis gráficos nos cartões do dashboard. |
| src/features/analytics/components/HorizontalBars.tsx | component | Desenha as barras do funil, dos términos e das buscas por especialidade. |
| src/features/analytics/components/Heatmap.tsx | component | Tabela acessível de frequências por dia e hora. |
| src/features/analytics/components/CompletionChart.tsx | component | Séries SVG com rótulos e valores acessíveis. |
| src/features/analytics/components/tests/AnalyticsCharts.test.tsx | test | Seis testes de conteúdo, geometria, limites e estados vazios. |
| src/features/analytics/tests/AnalyticsPage.test.tsx | test | Nove casos de navegação, indicadores, arredondamento e referências. |
| src/shared/components/ColumnChart.tsx | shared | Extrai as colunas SVG interativas do Dia para o histograma. |
| src/shared/components/DashboardCard.tsx | shared | Acrescenta o tom cinza do KPI de duração. |
| src/shared/components/MonthPicker.tsx | shared | Expõe o seletor de período e mantém a interface mensal. |
| src/shared/layout/AppLayout.tsx | shared | Monta o filtro na rota de Analytics. |
| src/shared/utils/period.ts | shared | Limites de semana, mês e ano pelo calendário de Brasília. |
| src/shared/utils/duration.ts | shared | Recebe o formatador de duração da Home. |
| src/features/day/components/HourlyAppointmentsChart.tsx | component | Prepara a série horária para as colunas compartilhadas. |
| src/features/home/data/home.ts | data access | Move o formatador de duração para o utilitário comum. |
| src/features/home/pages/HomePage.tsx | page | Importa o formatador compartilhado. |
| README.md | documentation | Descreve os filtros e os dados do protótipo. |
| .agents/context/contexto-front.md | documentation | Registra o comportamento mensal e a precisão dos KPIs. |
| .agents/reports/analytics/analytics.md | documentation | Mapeia comportamentos, arquivos e verificações. |

Decisions: reutilizar o mock de outubro em todos os meses conforme solicitado durante a implementação. O último bloco é limitado ao fim do mês e desaparece em fevereiro com 28 dias. Semana e ano exibem indisponibilidade por falta de agregados nessa granularidade. Alternativa descartada: fabricar séries semanais ou anuais.
Decisions: percentuais inteiros apenas nos KPIs. Os gráficos mantêm uma casa decimal. Mediana, P90, média móvel e diferenças vêm da fixture. A comparação ausente usa travessão.
Decisions: reutilizar DashboardCard, filtro de período, formatação de duração e colunas com tooltip/foco. As demais visualizações usam HTML/SVG e tokens existentes, sem dependências novas.
Obstacles: Vitest no sandbox falhou com EPERM ao renomear o cache temporário. As execuções autorizadas fora do sandbox passaram.
Obstacles: a captura direta do Edge não gerou PNG e o Vite do sandbox não respondeu ao navegador externo. A sessão local isolada via DevTools e Vite no mesmo ambiente permitiu a conferência. A medição considera a largura útil sem a barra de rolagem.
Obstacles: a primeira renderização desktop quebrou a linha de KPIs e o filtro aberto ultrapassou a borda esquerda a 320 px. Correções em src/features/analytics/pages/AnalyticsPage.tsx e src/shared/components/MonthPicker.tsx. Captura final com cinco cards alinhados no desktop e formulário entre x=80 e x=290 no celular de 320 px.
Checks: npm test -- src/shared/components/tests/MonthPicker.test.tsx → 11/11. npm test -- src/features/day/components/tests/BarCharts.test.tsx → 8/8. npm test -- src/features/analytics/components/tests/AnalyticsCharts.test.tsx → 6/6. npm test -- src/features/analytics/tests/AnalyticsPage.test.tsx → 9/9.
Checks: npm run build → TypeScript e Vite passaram. Lint indisponível (projeto sem configuração). npm test → 107/107 em 13 arquivos. git diff --check → passou.
Checks: Edge headless a 1739, 390 e 320 px → 11 cartões e 84 células, seletor dentro da janela e largura do conteúdo igual à largura do viewport.
Outside scope (not fixed): agregações semanais e anuais reais dependem de dados adicionais. Integração com API fora do escopo solicitado.
Open: nenhum.
