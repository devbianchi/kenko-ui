## Correções de Calendário e Dia

### Behavior map

| ID | Comportamento | Código | Teste |
|---|---|---|---|
| B1 · RV1 | Voltar durante a troca de mês restaura a visibilidade na Home e no Calendário | src/shared/components/MonthTransition.tsx:17 | src/shared/components/tests/MonthTransition.test.tsx:7, :23, :36 |
| B2 · RV2 | A decisão posterior do usuário substitui o critério decimal da revisão. Completude e ocupação usam o arredondamento original: 1/3 aparece como 33%, 2/3 como 67%, zero com base como 0% e ausência de base como —. | src/features/day/pages/DayPage.tsx:24, :44 | src/features/day/tests/DayPage.test.tsx:15, :25, :34, :58, :71, :78, :85 |
| B3 · RV3 | Escape dispensa o tooltip mesmo quando o ponteiro está na barra e o foco está em outro controle | src/features/day/components/DayCharts.tsx:21 | src/features/day/components/tests/BarCharts.test.tsx:45, :63, :77 |
| B4 · RV4 | Aplicar confirma o período válido. Escape descarta o rascunho. Voltar restaura os campos e os demais parâmetros são preservados. | src/shared/components/MonthPicker.tsx:41, README.md:7, .agents/context/contexto-front.md:97 | src/shared/components/tests/MonthPicker.test.tsx:13, :32, :90 e src/features/calendar/tests/CalendarPage.test.tsx:38 |
| B5 · RV4 | RF-13 e MET-D01–07. A rota determina a data do título, o mock fornece status e totais por sala, o gráfico horário exibe 07h–17h e o resumo agrupa a série ao meio-dia. A tabela mostra ocupação e pico. | src/features/day/pages/DayPage.tsx:12, :44 e src/features/day/components/DayCharts.tsx:33, :82 | src/features/calendar/tests/CalendarPage.test.tsx:28, src/features/day/tests/DayPage.test.tsx:15, :25, :34 e src/features/day/components/tests/BarCharts.test.tsx:6, :28 |

### File map

| Arquivo | Papel | Alteração desta implementação |
|---|---|---|
| src/shared/components/MonthTransition.tsx | component | Recupera a visibilidade quando a seleção retorna ao mês exibido |
| src/features/day/components/DayCharts.tsx | component | Observa Escape durante a exibição do tooltip e remove o listener ao fechar |
| src/features/day/tests/DayPage.test.tsx | test | Exercita arredondamento original, zero e ausência de base |
| README.md | documentation | Descreve filtros, páginas e percentuais do protótipo |
| .agents/context/contexto-front.md | documentation | Consolida a confirmação do filtro e o arredondamento específico do Dia |
| .agents/plans/calendar-day-fixes.md | documentation | Critérios do retorno e decisão final sobre RV2 |
| .agents/reports/calendar-day-fixes.md | documentation | Mapa código/teste da entrega |

Decisões: restaurar as expressões originais de arredondamento e o contrato numérico de CountCard. DayPage.tsx e DashboardCard.tsx coincidem com HEAD local. Aplicar o arredondamento somente à apresentação das duas métricas do Dia.

Escopo da validação: árvore de trabalho local sobre 75119d3. Os testes de navegação devem ser conciliados com o cabeçalho e a navegação entre dias de origin/main ao integrar as branches. A revisão anterior permanece como registro histórico.

Status: B1–B5 implementados e exercitados na base local.
Checks: npm run build e git diff --check passaram. npm test executou 80 casos, com 77 aprovados e 3 falhas em Home/MonthPicker (dois timeouts de 5 s e uma leitura do mês durante a transição). As três specs de Dia, Home e MonthPicker passaram juntas com --maxWorkers=1, 50/50. Todos os casos passaram entre as execuções, mas a execução integral em paralelo apresentou instabilidade. Lint indisponível no projeto.
