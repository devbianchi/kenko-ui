## F2 — Calendário com a API
Status: 6/6 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Pede à API o intervalo visível da grade: primeira célula até o dia seguinte à última, em meses de 35 e de 42 células | src/features/calendar/data/calendar.ts:44; src/features/calendar/api.ts:7 | src/features/calendar/tests/CalendarPage.test.tsx:88 | done |
| B2 | O dia de hoje destacado vem da API, não do relógio do navegador | src/features/calendar/pages/CalendarPage.tsx:17 | src/features/calendar/tests/CalendarPage.test.tsx:99 | done |
| B3 | Erro da API aparece no lugar da grade | src/features/calendar/pages/CalendarPage.tsx:17 | src/features/calendar/tests/CalendarPage.test.tsx:106 | done |
| B4 | Mês ausente ou malformado usa o mês atual de Brasília; fora da faixa é limitado | src/features/calendar/data/calendar.ts:12 | src/features/calendar/tests/CalendarPage.test.tsx:46 | done |
| B5 | Trocar de mês mantém a grade anterior até chegar a nova | src/features/calendar/api.ts:13 | src/features/calendar/tests/CalendarPage.test.tsx:46 | done |
| B6 | Selecionar uma data abre o Dia (inclusive data de mês vizinho) | src/features/calendar/components/MonthCalendar.tsx (sem mudança) | src/features/calendar/tests/CalendarPage.test.tsx:35, :73, :81 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/calendar/api.ts | data access | novo: useCalendar |
| src/features/calendar/data/calendar.ts | data access | tipo CalendarData, getVisibleRange; remove calendarData; fallback do mês |
| src/features/calendar/pages/CalendarPage.tsx | page | busca na API e usa QueryState |
| src/features/calendar/tests/CalendarPage.test.tsx | test | API substituída; intervalo, hoje do servidor e erro |
| src/features/day/tests/DayPage.test.tsx | test | provider e API para o retorno ao Calendário |
| src/shared/layout/tests/AppLayout.test.tsx | test | relógio fixo e resposta do calendário |

Decisions: calcular o fim exclusivo a partir da última célula da própria grade | reaproveita getVisibleCalendarDates e garante a mesma regra de 5 ou 6 semanas | rejected: extrair o addDays do Dia, que trabalha com Date e tem outro uso
Obstacles: AppLayout.test.tsx dependia do mês do mock para o título "Novembro | 2026" | o mês padrão passou a ser o atual | relógio fixo no teste | verified by: suíte completa
Obstacles: DayPage.test.tsx falhou com "No QueryClient set" ao voltar ao Calendário | o Calendário passou a buscar dados | provider e API substituída no helper | verified by: suíte completa
Checks: spec src/features/calendar e src/shared/layout -> 25 passed. Final: tsc -b -> ok; full suite -> 153 passed (17 files); lint -> not run: não configurado
Outside scope (not fixed): testes rodados com NODE_OPTIONS=--no-experimental-webstorage (Node 26 nesta máquina)
Open: F3 a F5
