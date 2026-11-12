## Calendário mensal

> Relatório da implementação inicial. O estado atual do cabeçalho, filtro e transições está documentado em [responsive-calendar-filter.md](responsive-calendar-filter.md).

Status: 6/6 IDs done. Blocked / not done: nenhum.

### Behavior map

| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Grade começa no domingo, cobre 35 ou 42 datas e preserva datas adjacentes reais | src/features/calendar/data/calendar.ts:16; :21 | src/features/calendar/components/tests/MonthCalendar.test.tsx:12; :23; :28 | done |
| B2 | Hoje vem do mock e é identificado; dias futuros do mês continuam presentes | src/features/calendar/components/MonthCalendar.tsx:12; :22; :31 | src/features/calendar/components/tests/MonthCalendar.test.tsx:33 | done |
| B3 | Contagem usa o mock e data ausente vale zero | src/features/calendar/data/calendar.ts:4; src/features/calendar/components/MonthCalendar.tsx:23 | src/features/calendar/tests/CalendarPage.test.tsx:22; src/features/calendar/components/tests/MonthCalendar.test.tsx:18 | done |
| B4 | Datas internas e adjacentes abrem Dia pela data ISO | src/features/calendar/components/MonthCalendar.tsx:30; src/app/router.tsx:15 | src/features/calendar/tests/CalendarPage.test.tsx:40; :47 | done |
| B5 | Filtro na URL, preservação de query, limite janeiro/2024–mês atual, fallback de mock para parâmetro malformado | src/features/calendar/data/calendar.ts:7; src/features/calendar/pages/CalendarPage.tsx:8; :12 | src/features/calendar/tests/CalendarPage.test.tsx:19 | done |
| B6 | Composição reutiliza seletor/cabeçalho, tokens, layout fluido e rótulos acessíveis dos sete dias | src/features/calendar/pages/CalendarPage.tsx:2; :22; src/features/calendar/components/MonthCalendar.tsx:5; :19 | src/features/calendar/components/tests/MonthCalendar.test.tsx:12; npm run build | done |

### File map

| File | Role | Change |
|------|------|--------|
| src/features/calendar/pages/CalendarPage.tsx | page | Cabeçalho da página, mês na URL, seletor compartilhado e fixture |
| src/features/calendar/components/MonthCalendar.tsx | component | Grade mensal reutilizável, links por data, destaque de hoje e contagens |
| src/features/calendar/data/calendar.ts | data access | Leitura/limite do mês, composição de datas, formatação e fixture |
| src/features/calendar/components/tests/MonthCalendar.test.tsx | test | 35/42 dias, datas adjacentes, rótulos da semana, hoje e zero |
| src/features/calendar/tests/CalendarPage.test.tsx | test | Filtro, query preservada, limites, mock e navegação até Dia |
| .agents/plans/calendar.md | documentation | Ledger, decisões e riscos |
| .agents/reports/calendar.md | documentation | Resultado e rastreabilidade da implementação |

Decisions: Gerar a grade em UTC a partir do mês e exibir no mínimo cinco linhas | datas de calendário não sofrem deslocamento de fuso e fevereiro não reduz a composição visual | rejected: dependência de calendário ou grade calculada dentro do JSX.

Decisions: Usar `?month=YYYY-MM` e `MonthPicker` compartilhado | aplica os mesmos limites e comportamento da Home, preservando parâmetros existentes | rejected: estado local separado ou cópia do controle.

Decisions: Datas ausentes mostram zero e todas as células são links para `/calendar/:date` | regra TELA-02 e requisito explícito do placeholder de Dia | rejected: completar dados ou criar detalhes de agenda nesta tela.

Obstacles: primeiro Vitest foi bloqueado por `EPERM` ao renomear temporário fora do workspace | restrição de filesystem do sandbox | execução autorizada fora do sandbox após solicitação; os specs focados passaram. Primeiras asserções apontaram datas/meses de teste incorretos, corrigidos nos próprios casos | `npm test -- src/features/calendar/components/tests/MonthCalendar.test.tsx` 4/4; `npm test -- src/features/calendar/tests/CalendarPage.test.tsx` 3/3.

Checks: `npm test -- src/features/calendar/components/tests/MonthCalendar.test.tsx` -> 4/4 passed.

Checks: `npm test -- src/features/calendar/tests/CalendarPage.test.tsx` -> 3/3 passed.

Checks: `npm run build` -> passed; TypeScript e Vite, 383 módulos. Lint -> not run: não configurado. Full suite -> not run: escopo limitado à feature, conforme skill.

Checks: `git diff --check` -> passed; aviso CRLF/LF do Git não altera o conteúdo.

Outside scope (not fixed): API e totais reais; responsividade/pixels em navegador real não foram validados. `package.json` já estava modificado antes desta tarefa e foi preservado sem edição.

Open: Nenhuma pendência de implementação. Sem commit, push ou merge.
