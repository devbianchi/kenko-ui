## Modo escuro nas cinco páginas
Status: 3/3 IDs done. Bloqueados ou pendentes: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Preferência ausente ou inválida abre em modo claro com lua | src/shared/layout/ThemeToggle.tsx:9 | src/shared/layout/tests/AppHeader.test.tsx:50 | done |
| B2 | Clique alterna para escuro com sol, navegação e recarga preservam a escolha, Enter volta ao claro | src/shared/layout/ThemeToggle.tsx:15, src/shared/layout/AppHeader.tsx:37, src/styles.css:72 | src/shared/layout/tests/AppHeader.test.tsx:57 | done |
| B3 | Leitura e gravação bloqueadas permitem alternar durante o uso | src/shared/layout/ThemeToggle.tsx:10 e 26 | src/shared/layout/tests/AppHeader.test.tsx:75 | done |

### File map
| File | Role | Change |
|------|------|--------|
| index.html | config | Controles nativos herdam o esquema do documento |
| src/styles.css | styles | Paleta, degradê, contraste e sombras por tema |
| src/shared/layout/ThemeToggle.tsx | component | Botão, ícones, persistência e cor do navegador |
| src/shared/layout/AppHeader.tsx | component | Controle ao lado da marca, filtro à direita |
| src/shared/layout/tests/AppHeader.test.tsx | test | Preferência inicial, navegação, teclado e armazenamento bloqueado |
| src/shared/components/DashboardCard.tsx | component | Texto escuro nas superfícies cinzas |
| src/shared/components/MonthPicker.tsx | component | Contraste do filtro, alerta e botão desabilitado |
| src/features/home/pages/HomePage.tsx | page | Sombra do card do mês |
| src/features/showcase/pages/ShowcasePage.tsx | page | Superfície do botão Nova Conversa |
| src/features/showcase/components/ConversationList.tsx | component | Contraste do avatar e da ação de apagar |
| .agents/reports/modo-escuro.md | documentation | Registro da implementação e verificações |

Decisions: claro na primeira visita e preferência explícita em localStorage | preserva a apresentação inicial e a escolha nas visitas seguintes | alternativa descartada: seleção automática pelo sistema. Tokens globais e cabeçalho compartilhado | as cinco rotas já compartilham essa estrutura | alternativa descartada: estado e estilos por página.

Obstacles: Tailwind incorporou o valor literal da sombra na primeira build | src/styles.css referencia variáveis resolvidas pelo navegador | Edge confirmou as camadas pretas de 40% e 28% nas cinco rotas. O isolamento de rede impediu a primeira medição | prévia local e Edge foram executados no mesmo contexto para concluir o teste.

Checks: npm test -- src/shared/layout/tests/AppHeader.test.tsx → 7/7. npm run build → TypeScript e Vite aprovados. Lint indisponível, sem script configurado. npm test → 125/125 em 14 arquivos. Edge headless → Home, Calendário, Dia, Analytics e Showcase a 320 e 1440 px com fundo #212F3B, mesma sombra computada em um card de cada rota e controle visível dentro da largura. Fontes externas desativadas nessa medição.

Outside scope (not fixed): imagens fornecidas em public/assets/dark_mode já estavam sem rastreamento no Git.
Open: nenhum.
