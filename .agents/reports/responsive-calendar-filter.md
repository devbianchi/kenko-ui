## Responsividade e filtro mensal

Status: 10/10 IDs done. Blocked / not done: nenhum.

### Behavior map

| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Cabeçalho, largura e escala comuns; filtro alinhado à direita na Home e Calendário | src/shared/layout/AppLayout.tsx:8; :33; :36; src/shared/layout/AppHeader.tsx:11; :34 | src/shared/layout/tests/AppLayout.test.tsx:8 | done |
| B2 | Título “Mês | Ano” dentro da moldura da grade do calendário | src/features/calendar/data/calendar.ts:33; src/features/calendar/components/MonthCalendar.tsx:22 | src/features/calendar/tests/CalendarPage.test.tsx:31 | done |
| B3 | Pressionar dia reproduz escala e transição de hover da Home, respeitando movimento reduzido | src/features/calendar/components/MonthCalendar.tsx:35 | src/features/calendar/components/tests/MonthCalendar.test.tsx:20 | done |
| B4 | Resumo da Home e calendário fazem fade-out, substituem conteúdo e fazem fade-in | src/shared/components/MonthTransition.tsx:4; src/features/home/pages/HomePage.tsx:17; src/features/calendar/components/MonthCalendar.tsx:18 | src/shared/components/tests/MonthTransition.test.tsx:5 | done |
| B5 | Rascunho só é confirmado por Aplicar; período inválido exibe erro vermelho, desabilita Aplicar e preserva o valor confirmado | src/shared/components/MonthPicker.tsx:25; :42; :91; :93 | src/shared/components/tests/MonthPicker.test.tsx:13; :34 | done |
| B6 | URL inválida ou fora da faixa é normalizada para o período permitido, preservando query restante e sem criar entrada inválida no histórico | src/shared/layout/AppLayout.tsx:13; :16; :19 | src/features/home/tests/HomePage.test.tsx:158; :169; src/features/calendar/tests/CalendarPage.test.tsx:41 | done |
| B7 | Título do mês reduzido e aproximado dos dias, ainda dentro do painel | src/features/calendar/components/MonthCalendar.tsx:22 | src/features/calendar/tests/CalendarPage.test.tsx:32; build | done |
| B8 | Alerta inválido quebra linhas no popover; campos e botão ficam limitados à largura do formulário | src/shared/components/MonthPicker.tsx:60; :68; :83; :91; :96 | src/shared/components/tests/MonthPicker.test.tsx:34 | done |
| B9 | Painel ocupa a altura disponível e divide as cinco/seis semanas em linhas iguais; tipografia dos dias escala com a viewport | src/features/calendar/components/MonthCalendar.tsx:21; :22; :27; :39; :40 | src/features/calendar/components/tests/MonthCalendar.test.tsx:12; :23; :28; build | done |
| B10 | Conteúdo principal compartilha a largura máxima do cabeçalho | src/shared/layout/AppLayout.tsx:38 | src/shared/layout/tests/AppLayout.test.tsx:20 | done |

### File map

| File | Role | Change |
|------|------|--------|
| src/shared/layout/AppLayout.tsx | shared | Cabeçalho, escala/largura padrão, filtro, normalização e main alinhado ao header |
| src/features/home/pages/HomePage.tsx | page | Usa cabeçalho do layout e anima o resumo mensal |
| src/features/calendar/pages/CalendarPage.tsx | page | Usa filtro do layout compartilhado |
| src/features/calendar/components/MonthCalendar.tsx | component | Título compacto, grade ajustada à altura com 5/6 linhas iguais, transição mensal e clique como na Home |
| src/features/calendar/data/calendar.ts | data access | Formata “Mês | Ano” |
| src/shared/components/MonthPicker.tsx | component | Rascunho, validação, botão Aplicar e popover responsivo com quebra do alerta |
| src/shared/components/MonthTransition.tsx | component | Fade-out/fade-in reutilizável com suporte a movimento reduzido |
| src/features/home/tests/HomePage.test.tsx | test | Aplicação, preservação e normalização de query |
| src/features/calendar/tests/CalendarPage.test.tsx | test | Aplicação, título dentro do painel, limites e normalização de URL |
| src/features/calendar/components/tests/MonthCalendar.test.tsx | test | Animação de clique e comportamentos visíveis da grade |
| src/shared/components/tests/MonthPicker.test.tsx | test | Rascunho, aplicação, limites, bloqueio e alerta dentro do formulário |
| src/shared/components/tests/MonthTransition.test.tsx | test | Fade de saída, substituição e fade de entrada |
| src/shared/layout/tests/AppLayout.test.tsx | test | Cabeçalho único, filtro nas rotas corretas e largura comum do main/header |
| .agents/plans/responsive-calendar-filter.md | documentation | Ledger, decisões e riscos |
| .agents/reports/calendar.md | documentation | Identifica o relatório inicial como histórico e aponta o relatório atualizado |
| .agents/reports/responsive-calendar-filter.md | documentation | Relatório atual e rastreabilidade |

Decisions: Layout controla o cabeçalho e o filtro mensal | remove duplicação entre Home e demais rotas | rejected: manter cabeçalhos independentes por página.

Decisions: Rascunho mês/ano confirma apenas por Aplicar | evita publicar datas parciais e permite corrigir entrada inválida | rejected: confirmar cada campo ao alterar.

Decisions: Período inválido mantém botão visível, desabilitado e acompanhado de alerta vermelho | explica a validação sem permitir envio | rejected: aplicar silenciosamente ou esconder o botão.

Decisions: `MonthTransition` retém o conteúdo durante saída e troca antes da entrada | entrega ambos os fades sem dependência | rejected: somente animação de entrada.

Decisions: URLs presentes fora dos limites usam replace, preservando demais parâmetros | corrige endereço sem adicionar etapa inválida ao histórico | rejected: manter URL malformada e exibir apenas fallback.

Decisions: Título do mês usa `text-section` no mobile e `text-metric` no desktop, com `mb-1` | reduz tamanho e espaço vertical em relação a `text-page`/`mb-3` | rejected: manter a escala anterior.

Decisions: Formulário limita a largura do popover e permite quebra de texto; controles usam largura máxima | evita o alerta vermelho extrapolar o componente | rejected: cortar texto ou manter linha sem quebra.

Decisions: Grade usa altura ligada ao viewport e linhas iguais para 35/42 datas; main compartilha max-width do header | mantém o calendário na primeira página e alinha o conteúdo ao design | rejected: células com altura mínima fixa e conteúdo mais largo que o cabeçalho.

Obstacles: primeira asserção de layout esperava outubro sem parâmetro, mas o fallback da fixture do calendário é novembro | erro no valor esperado do teste | expectativa corrigida em src/shared/layout/tests/AppLayout.test.tsx | spec focado passou.

Obstacles: primeira expectativa para URL `month=invalid` usava outubro, mas o fallback do mock é novembro | erro no valor esperado do teste | expectativa corrigida em src/features/calendar/tests/CalendarPage.test.tsx | spec focado passou.

Checks: specs focados após os refinamentos -> MonthPicker 10/10; CalendarPage 3/3; MonthCalendar 4/4; AppLayout 4/4.

Checks: `npm run build` -> passed; TypeScript e Vite, 384 módulos. Suíte completa -> not run após B7–B10: refinamentos visuais cobertos pelos specs focados. Lint -> not run: não configurado. `git diff --check` -> passed.

Outside scope (not fixed): não inspecionei pixels/rolagem em navegador real; jsdom não mede geometria de viewport. `package.json` e `.agents/plans/calendar.md` já estavam alterados/não rastreados antes da tarefa e foram preservados.

Open: Nenhuma pendência de implementação. Sem commit, push ou merge.
