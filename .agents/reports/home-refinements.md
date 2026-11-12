## Refinamentos da Home e limite do filtro mensal

> Relatório histórico anterior à revisão RV1/R6. A afirmação de edição por teclado abaixo foi contestada pelo teste de reprodução do Reviewer; os checks registrados aqui não comprovam a correção posterior. O retorno da revisão e a faixa aprovada de 2024-01 ao mês atual estão documentados em [home-year-edit.md](home-year-edit.md), relatório do estado atual. Resultados e decisões originais abaixo são preservados como histórico.

Status: 7/7 IDs done. Blocked / not done: nenhum.

### Behavior map

| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| R1 | Card com horário, sala, paciente e especialidade, sem médico/data visíveis | src/features/home/components/UpcomingAppointments.tsx:6 | src/features/home/tests/HomePage.test.tsx:23; :79 | done |
| R2 | Plus Jakarta 700 e 42dot 600, marca 400 | index.html:10; src/styles.css:3 | Probe visual: pesos computados na Home, Analytics e Showcase | done |
| R3 | Escalas reutilizáveis, layout fluido e responsividade | src/styles.css:3; src/shared/components/DashboardCard.tsx:44 | Probe visual: 1360, 1739, 1280, 768, 390 e 360 px | done |
| R4 | Marca acessível com sublinhado pontilhado em todas as páginas | src/shared/layout/AppHeader.tsx:12 | src/shared/layout/tests/AppHeader.test.tsx:7 + probe visual | done |
| R5 | Heroicons substitui Lucide, com navegação preservada | src/shared/layout/AppHeader.tsx:1; package.json | src/shared/layout/tests/AppHeader.test.tsx:17; npm ls; build | done |
| R6 | Mês por extenso; seleção atualiza período e preserva mock | src/shared/components/MonthPicker.tsx:10; src/features/home/pages/HomePage.tsx:9 | src/shared/components/tests/MonthPicker.test.tsx:13; src/features/home/tests/HomePage.test.tsx:40 | done |
| R7 | Limite até mês atual em Brasília, inclusive URL e mudança de ano | src/shared/utils/month.ts:1; src/shared/components/MonthPicker.tsx:12; src/features/home/data/home.ts:30 | src/shared/components/tests/MonthPicker.test.tsx:37; :65; src/features/home/tests/HomePage.test.tsx:62 | done |

### File map

| File | Role | Change |
|------|------|--------|
| src/shared/components/MonthPicker.tsx | component | Mês em português, popup nativo, Escape, seleção e limites |
| src/shared/components/DashboardCard.tsx | component | Escalas compartilhadas, peso bold nos títulos, ícone Heroicons |
| src/shared/components/PageHeading.tsx | component | Peso bold nas páginas placeholder |
| src/shared/layout/AppHeader.tsx | component | Heroicons, medidas padronizadas, marca pontilhada |
| src/features/home/components/UpcomingAppointments.tsx | component | Quatro campos do PNG, ícone ForwardIcon e medidas da escala |
| src/features/home/pages/HomePage.tsx | page | Filtro visual sem alterar indicadores; escala fluida |
| src/features/home/data/home.ts | shared | Limite de período na URL; remoção de helper não utilizado |
| src/shared/utils/month.ts | shared | Mês atual em America/Sao_Paulo |
| src/shared/components/tests/MonthPicker.test.tsx | test | Seleção, Escape, inválidos, futuros e virada UTC/Brasília |
| src/shared/layout/tests/AppHeader.test.tsx | test | Marca nos dois layouts e navegação |
| src/features/home/tests/HomePage.test.tsx | test | Card do design, mock preservado e URL futura |
| src/styles.css | styles | Tokens de tipografia, espaçamento e contêiner |
| index.html | config | Carregamento 600/700 e pesos globais em Tailwind |
| package.json | config | @heroicons/react 2.2.0; remoção de lucide-react |
| package-lock.json | config | Lock reproduzível das dependências |
| README.md | documentation | Filtro visual limitado ao mês atual |
| .agents/context/contexto-front.md | documentation | Decisões aprovadas de projeção do card e filtro |
| .agents/context/guia-estilizacao.md | documentation | Pesos, escala, logo e biblioteca de ícones |
| .agents/plans/completed/home/home-refinements.md | documentation | Ledger R1–R7 |
| .agents/reports/home-refinements.md | documentation | Relatório atual; substitui conclusões visuais e de filtro do relatório anterior |

Decisions: Tokens semânticos em em e espaçamento Tailwind | preservam proporções aprovadas e eliminam medidas repetidas arbitrárias | rejected: zoom global, CSS próprio por componente.

Decisions: Details/summary, select e input numérico | controles nativos com teclado e Escape, mês por extenso no resumo | rejected: mostrar YYYY-MM no cabeçalho, biblioteca de calendário.

Decisions: Projeção de quatro campos; seleção apenas visual | autorização explícita do usuário | rejected: apagar médico/data do mock, gerar novas métricas por mês.

Decisions: Limite dinâmico pelo mês de Brasília; dezembro do ano anterior ajusta ao máximo ao retornar ao ano atual | impede estado futuro sem impedir histórico | rejected: bloquear dezembro em todos os anos, usar UTC como regra de negócio.

Decisions: Preservado active:scale-100 encontrado no início deste refinamento | alteração existente no arquivo e aprovação visual do usuário | rejected: restaurar .96 sem pedido.

Obstacles: npm no sandbox falhou com ENOTFOUND | rede restrita | instalação autorizada fora do sandbox, sem audit/fund; extração local demorou cerca de oito minutos | npm ls confirmou Heroicons 2.2.0 e ausência de Lucide.

Obstacles: Primeira suíte falhou em importação | Heroicons ainda estava sendo extraído | aguardar arquivos de execução e repetir suíte | 21 testes passaram, restando uma asserção de details.

Obstacles: Teste esperava remoção do select após Escape | details nativo oculta sem remover DOM | asserção corrigida para não visível, mantendo foco no summary | MonthPicker.test.tsx passou.

Obstacles: Primeiro probe encontrou página de erro do navegador | servidor Vite da sessão anterior não estava ativo | iniciar Vite local e aguardar header da aplicação | probe final passou.

Checks: npm test -> 21/22 passed após instalar Heroicons; única falha de asserção details corrigida.

Checks: npm test -- src/shared/components/tests/MonthPicker.test.tsx src/features/home/tests/HomePage.test.tsx -> 18/18 passed, incluindo quatro cenários adicionais do limite temporal. Demais 8 testes já passaram na execução anterior; 26 casos finais verificados entre as execuções.

Checks: npm run build -> passed, inclui TypeScript e produção. Lint -> not run: não configurado. Full suite após correção -> not run: repetidos somente os specs afetados conforme skill.

Checks: Probe Chromium nativo [check-home-refinements.mjs](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/check-home-refinements.mjs) -> passed: quatro campos, pesos 600/700, logo dotted, novembro em português, dezembro desabilitado, mudança para outubro preservando indicadores, URL e responsividade. Capturas desktop e filtro inspecionadas.

Checks: [Resultado visual](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-refinements-result.json); [desktop](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-refined-1360.png); [filtro](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-refined-filter.png); git diff --check -> passed.

Outside scope (not fixed): API, novas métricas por período, configuração de lint, aviso preexistente safe.directory do Git.

Open: Nenhuma pendência. Dados continuam estáticos; a consulta de 20/11/2026 envelhece com o relógio real. Sem commit ou push.
