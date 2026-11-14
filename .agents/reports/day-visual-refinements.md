## Ajustes visuais e de interação do Dia
Status: 4/4 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Degradê contínuo com cantos arredondados no cabeçalho | src/features/day/pages/DayPage.tsx:62 | scripts/check-day-refinements.mjs:67 | done |
| B2 | Popup com contagem exata, zero, foco, Escape e posição acima do cursor | src/features/day/components/DayCharts.tsx:37 | src/features/day/components/tests/BarCharts.test.tsx:36 e :54; scripts/check-day-refinements.mjs:82 | done |
| B3 | Somente linha de dados sob cursor recebe escala, sem sombras; card e cabeçalho imóveis | src/features/day/pages/DayPage.tsx:57 e :71 | scripts/check-day-refinements.mjs:70 | done |
| B4 | Fade de entrada/saída de 150ms; movimento reduzido desativa animação | src/features/day/components/DayCharts.tsx:37 | scripts/check-day-refinements.mjs:96 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/day/pages/DayPage.tsx | page | Recorte arredondado do cabeçalho, card estático, escala nas linhas sem sombra |
| src/features/day/components/DayCharts.tsx | component | Popup em portal, posição do cursor, foco/Escape, fade; área transparente para hover em zero |
| src/features/day/components/tests/BarCharts.test.tsx | test | Popup e teclado; asserções de title substituídas por conteúdo acessível e ausência de title |
| scripts/check-day-refinements.mjs | test | Geometria do popup, movimento, sombras, cabeçalho, fade e movimento reduzido no Chrome |
| .agents/context/contexto-front.md | documentation | Comportamentos finais aprovados para Dia |
| .agents/plans/day-visual-refinements.md | documentation | Ledger B1–B4 incluindo ajustes pedidos durante a implementação |
| .agents/reports/day-visual-refinements.md | documentation | Mapa código/teste e evidências finais |

Decisions: clip-path arredondado no tr | recorta fundo sem segmentar o degradê | rejected: degradê repetido por célula.
Decisions: motion=false no card; linhas com escala 1.02 e nenhuma sombra | pedido atualizado do usuário | rejected: animar tabela inteira ou sombrear células.
Decisions: portal no body, coordenadas clientX/clientY | mantém popup acima do cursor sem herdar escala do card | rejected: popup no canto ou coordenadas locais afetadas pelo hover do pai.
Decisions: manter última contagem montada com opacity e aria-hidden durante saída | fade sem temporizadores e sem expor tooltip fechado à acessibilidade | rejected: desmontagem imediata, que impediria fade out.
Obstacles: teste de posicionamento detectou deslocamento provocado pela escala do card | coordenadas locais | portal em DayCharts.tsx | geometria passou antes/depois de mover o mouse.
Obstacles: teste inicial de movimento reduzido esperava duration=0s | transition-none altera transition-property, podendo conservar duration declarada | corrigida asserção para property=none | teste Chrome passou.
Checks: npm test -- src/features/day/components/tests/BarCharts.test.tsx src/features/day/tests/DayPage.test.tsx -> 9/9 passaram. Após mudanças no popup, spec BarCharts executada novamente -> 5/5 passaram; testes da página não repetidos sem mudança funcional correspondente.
Checks: node scripts/check-day-refinements.mjs -> passou; Vite em 5173, Chrome headless com depuração em 9228; DAY_SCREENSHOT_DIR opcional para captura. Cabeçalho inset(0px round 8px), linha scale=1.02, card/cabeçalho sem escala, linha sem sombra; popup acima do cursor acompanha movimento; opacidade intermediária verificada na entrada e saída; movimento reduzido desativa transição.
Checks: screenshot inspecionado em C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/day-refinements.png.
Checks: final npm run build -> passou (TypeScript e Vite); git diff --check -> passou. Lint indisponível. Full suite não executada: alteração restrita ao Dia, sem infraestrutura compartilhada.
Outside scope (not fixed): filtro preexistente de horários 7–17 preservado; demais páginas, dados e rotas não alterados. Sem commit, push ou merge.
Open: nenhuma pendência de implementação; verificação visual em Chrome desktop, sem alegar cobertura de outros navegadores.
