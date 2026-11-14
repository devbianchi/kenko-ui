## Dimensões dos cards do Calendário
Status: 3/3 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Desktop próximo a 3:2, independente da altura da janela | src/features/calendar/components/MonthCalendar.tsx:35 | scripts/check-calendar-sizing.mjs:81 e :89 | done |
| B2 | Sexta semana cresce o painel sem comprimir cards | src/features/calendar/components/MonthCalendar.tsx:21 | scripts/check-calendar-sizing.mjs:90 | done |
| B3 | Sete colunas sem sobreposição, textos contidos em tela estreita | src/features/calendar/components/MonthCalendar.tsx:35 e :39 | scripts/check-calendar-sizing.mjs:70 e :74 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/calendar/components/MonthCalendar.tsx | component | Altura natural, proporção 3:2, mínimos, largura contida e tipografia independente de vh |
| scripts/check-calendar-sizing.mjs | test | Regressão de geometria em Chrome real, seis cenários, screenshots opcionais |
| .agents/context/contexto-front.md | documentation | Regra de dimensionamento do calendário |
| .agents/plans/calendar-card-sizing.md | documentation | Ledger B1–B3, decisões e risco |
| .agents/reports/calendar-card-sizing.md | documentation | Evidências atuais e mapa código/teste |

Decisions: aspect-3/2 com min-h-16/sm:min-h-24 e w-full | reproduz aproximadamente os cards de 166×112 do asset e protege conteúdo | rejected: dividir altura do viewport entre semanas; máximo adicional redundante com o limite de largura do layout.
Decisions: manter sete colunas no celular e permitir quebra de texto dentro do card | mantém todas as datas acessíveis | rejected: esconder contagens ou alterar navegação.
Obstacles: Chrome sem endpoint (ECONNREFUSED 9228) no ambiente restrito | execução local do navegador indisponível nesse ambiente | executado com permissão ampliada | teste de navegador passou.
Obstacles: mínimo de altura transferia largura pela proporção no celular; depois texto excedia largura interna | restrições intrínsecas de layout | w-full e max-w-full/wrap-break-word em MonthCalendar.tsx; asserções de sobreposição adicionadas | seis cenários passaram sem enfraquecer asserções.
Checks: npm test -- src/features/calendar/components/tests/MonthCalendar.test.tsx src/features/calendar/tests/CalendarPage.test.tsx -> 7/7 passaram; testes existentes preservados.
Checks: node scripts/check-calendar-sizing.mjs -> seis cenários passaram; exige Vite em 5173 e Chrome com --remote-debugging-port=9228; CALENDAR_SCREENSHOT_DIR opcional para PNGs.
Checks: 1360×768 -> 134,44×89,63 px; 1360×1400 -> mesma dimensão; 2720×1536 -> 172×114,66 px; sexto conjunto de semanas mantém 134,44×89,63 px; 390×844 -> 44,84×56 px, textos contidos e colunas sem sobreposição.
Checks: zoom reduzido representado por viewport CSS 2720×1536, equivalente ao espaço de layout de 1360×768 a 50%; não foi acionado o comando de zoom da interface do Chrome.
Checks: inspeção dos PNGs desktop, viewport ampliado e mobile; artefatos em C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/calendar-*.png.
Checks: final npm run build -> passou (TypeScript e Vite, após último ajuste); git diff --check -> passou. Lint indisponível; full suite não executada: mudança restrita ao calendário, sem infraestrutura compartilhada.
Outside scope (not fixed): public/favicon.png apareceu como arquivo não rastreado durante o trabalho; não criado nem alterado nesta tarefa. Sem backend, mudanças de dados, commit, push ou merge.
Open: nenhuma pendência de implementação; rolagem vertical esperada quando o conteúdo excede a janela. Validação de navegador limitada ao Chrome.
