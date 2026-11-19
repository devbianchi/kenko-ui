## F3 — Dia com a API
Status: 8/8 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Sem dados por props, o Dia busca `GET /calendar/days/{date}` com a data da rota | src/features/day/pages/DayPage.tsx:157, :163; src/features/day/api.ts:6 | src/features/day/tests/DayPage.test.tsx:191 | done |
| B2 | Completude, ocupação e manhã/tarde vêm da API, sem recálculo a partir das contagens | src/features/day/pages/DayPage.tsx:95, :125; src/features/day/components/DayPeriodChart.tsx:2 | src/features/day/tests/DayPage.test.tsx:199; src/features/day/components/tests/BarCharts.test.tsx:28 | done |
| B3 | Percentuais da API são arredondados ao inteiro na tela; sem base (null) mostram "—" | src/features/day/pages/DayPage.tsx:56 | src/features/day/tests/DayPage.test.tsx:144, :158, :165, :172 | done |
| B4 | Data recusada pela API mostra a tela de data inválida | src/features/day/pages/DayPage.tsx:157 | src/features/day/tests/DayPage.test.tsx:213 | done |
| B5 | Erro da API mostra o alerta e busca de novo pelo botão | src/features/day/pages/DayPage.tsx:157 | src/features/day/tests/DayPage.test.tsx:219 | done |
| B6 | Avançar pela seta busca o dia seguinte na API | src/features/day/pages/DayPage.tsx:157 | src/features/day/tests/DayPage.test.tsx:233 | done |
| B7 | Data inválida para o painel continua recusada antes de chamar a API | src/features/day/pages/DayPage.tsx:163 | src/features/day/tests/DayPage.test.tsx:126 | done |
| B8 | O Calendário abre o Dia com os dados da API | src/features/day/pages/DayPage.tsx:168 | src/features/calendar/tests/CalendarPage.test.tsx:35 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/day/api.ts | data access | novo: useDay |
| src/features/day/pages/DayPage.tsx | page | tipos do contrato; percentuais e período da API; carregador |
| src/features/day/components/DayPeriodChart.tsx | component | recebe manhã e tarde prontos |
| src/features/day/tests/DayPage.test.tsx | test | percentuais do servidor; caminho com API |
| src/features/day/components/tests/BarCharts.test.tsx | test | gráfico de período com valores prontos |
| src/features/calendar/tests/CalendarPage.test.tsx | test | resposta do Dia para a rota do Dia |

Decisions: sem dados anteriores ao trocar de dia | manter o dia anterior durante a animação mostraria o título de uma data com os números de outra | rejected: keepPreviousData, como em Home e Calendário
Decisions: corte manhã/tarde passa a ser do servidor | o contrato já entrega appointmentsByDayPeriod, testado no backend (corte às 12h) | rejected: manter o agrupamento no cliente
Checks: spec src/features/day e src/features/calendar -> 45 passed. Final: tsc -b -> ok; full suite -> 158 passed (17 files); lint -> not run: não configurado
Outside scope (not fixed): o gráfico por hora continua mostrando 07h a 17h, decisão do protótipo; o contexto (§4, Dia) diz que a integração deveria usar o expediente efetivo da clínica, o que exige GET /api/clinic e muda a apresentação. Testes rodados com NODE_OPTIONS=--no-experimental-webstorage.
Open: F4 e F5; decisão sobre o expediente no gráfico por hora
