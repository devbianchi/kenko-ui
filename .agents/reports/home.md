## Home com mocks e componentes reutilizáveis

> Relatório histórico da primeira implementação, não do estado final. [Refinamentos](home-refinements.md) substituem filtro, projeção dos cards, estilos e biblioteca de ícones. A fixture atual foi movida para 20/11/2026 (B12 no plano); a conclusão abaixo sobre a consulta vencida em 10/11 não descreve mais o mock. `home.css` foi removido na migração para Tailwind (B13). Checks abaixo registram apenas aquela etapa.

Status: 8/8 IDs done. Blocked / not done: nenhum.

### Behavior map

| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Clínica, contagens, rankings, mediana e diferença do mock | src/features/home/pages/HomePage.tsx:10 | src/features/home/tests/HomePage.test.tsx:23 | done |
| B2 | Mês/ano na URL; fixture ausente, retorno e query inválida; próximas independentes | src/features/home/pages/HomePage.tsx:11; src/features/home/data/home.ts:29 | src/features/home/tests/HomePage.test.tsx:39; :52 | done |
| B3 | Melhor Dia e mediana navegam; cards sem destino permanecem artigos | src/features/home/pages/HomePage.tsx:44; src/shared/components/DashboardCard.tsx:13 | src/features/home/tests/HomePage.test.tsx:58; src/shared/components/tests/DashboardCard.test.tsx:15 | done |
| B4 | Até cinco pendentes futuras ordenadas, data em Brasília, dados completos e estado vazio | src/features/home/data/home.ts:54; src/features/home/components/UpcomingAppointments.tsx:6 | src/features/home/tests/HomePage.test.tsx:68; :98 | done |
| B5 | Zero preservado; null como —; variações negativa, positiva, zero e null | src/features/home/data/home.ts:41; src/features/home/pages/HomePage.tsx:44 | src/features/home/tests/HomePage.test.tsx:23; :105; :116 | done |
| B6 | Cards sem ações artificiais; links por teclado; filtro acessível | src/shared/components/DashboardCard.tsx:13; src/shared/components/MonthPicker.tsx:4 | src/shared/components/tests/DashboardCard.test.tsx:7; :15; src/shared/components/tests/MonthPicker.test.tsx:6 | done |
| B7 | Composição, fontes, hover/bounce, laterais estáticas, reduced-motion e responsividade | src/features/home/pages/home.css:1; src/styles.css:81 | Testes de componentes B6 + [check-home.mjs:57](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/check-home.mjs:57), navegador real | done |
| B8 | Cabeçalho único em /home e /home/; layout das demais rotas preservado | src/shared/layout/AppLayout.tsx:4 | src/shared/layout/tests/AppLayout.test.tsx:7 | done |

### File map

| File | Role | Change |
|------|------|--------|
| src/features/home/pages/HomePage.tsx | page | Composição, filtro mensal e indicadores |
| src/features/home/pages/home.css | styles | Proporções do PNG e adaptação por largura |
| src/features/home/data/home.ts | shared | Tipos de apresentação, fixture e seletores/formatação |
| src/features/home/components/UpcomingAppointments.tsx | component | Lista, dados de consulta e estado vazio |
| src/features/home/tests/HomePage.test.tsx | test | 13 cenários de apresentação, filtros, navegação e limites |
| src/shared/components/DashboardCard.tsx | component | Superfície, contagem e indicador reutilizáveis |
| src/shared/components/MonthPicker.tsx | component | Input mensal nativo controlado |
| src/shared/components/tests/DashboardCard.test.tsx | test | Semântica, zero/null e navegação por teclado |
| src/shared/components/tests/MonthPicker.test.tsx | test | Mudança de mês/ano e limpeza rejeitada |
| src/shared/layout/AppHeader.tsx | component | Slot actions separado do link da marca |
| src/shared/layout/AppLayout.tsx | shared | Home com largura própria; match aceita barra final |
| src/shared/layout/tests/AppLayout.test.tsx | test | 3 cenários de integração entre layout e páginas |
| src/styles.css | styles | Tokens de sombra, foco, superfícies, movimento e largura mínima |
| README.md | documentation | Estado atual e limites dos mocks |
| .agents/context/contexto-front.md | documentation | Estado técnico atualizado da Home |
| .agents/plans/completed/home/home.md | documentation | Ledger, responsabilidades, decisões e riscos |
| .agents/reports/home.md | documentation | Mapa código/teste, checks e evidências |

Decisions: Composição de Home.png, superfícies também observadas em Dia.png e Analytics.png | reuso já aplicado na Home | rejected: componentes exclusivos duplicados, biblioteca nova.

Decisions: Resumo de novembro/2026; meses sem fixture informam indisponibilidade | mock único sem agregados inventados | rejected: repetir os números em outros meses, simular backend.

Decisions: Próximas consultas seguem relógio real e Brasília | regra aprovada do contexto | rejected: alterar datas da fixture, congelar relógio da aplicação. Relógio controlado somente em testes e no navegador de verificação.

Decisions: Mediana, médico/data e links apenas para destinos aprovados | requisitos prevalecem sobre detalhes ilustrativos | rejected: rótulo Média, ícones de detalhes sem tela, inventar cinco pacientes ou carrossel.

Decisions: Input month nativo | seleção de mês/ano e teclado sem dependência | rejected: calendário customizado sem necessidade. Idioma do controle nativo acompanha navegador/sistema.

Obstacles: Chrome headless no sandbox encerrou com GPU process isn't usable | restrição do ambiente | execução headless fora do sandbox em perfil temporário isolado | verificado por check-home.mjs.

Obstacles: FontFaceSet.check inicialmente false para 42dot Sans | unicode-ranges sobrepostos, inclusive subconjuntos não solicitados pela página | carregar explicitamente os glifos usados antes da asserção no probe | quatro fontes confirmadas carregadas; nenhuma alteração de fonte na aplicação.

Obstacles: Invoke-WebRequest para Google Fonts falhou com host não conhecido no sandbox | rede do ambiente | inspeção no navegador autorizado | quatro famílias carregadas.

Obstacles: Probe inicialmente comparou scrollWidth com innerWidth | barra vertical ocupa 15px | comparar com clientWidth no probe | larguras 1280/768/390/360 verificadas.

Obstacles: Overflow real a 360px após corrigir probe | body tinha min-width:360px, maior que a largura útil com scrollbar | min-width:320px em src/styles.css:49 | probe final passou.

Obstacles: Cor secundária da consulta sobrescrita | ordem de carregamento entre CSS da feature e superfície global | seletor específico em home.css | cor computada rgba(41, 54, 50, 0.6) confirmada.

Checks: npm test -- src/shared/components/tests/DashboardCard.test.tsx src/shared/components/tests/MonthPicker.test.tsx -> 2 arquivos, 3 testes passed.

Checks: npm test -- src/features/home/tests/HomePage.test.tsx src/shared/layout/tests/AppHeader.test.tsx -> 2 arquivos, 14 testes passed.

Checks: npm test -- src/shared/layout/tests/AppLayout.test.tsx -> 1 arquivo, 3 testes passed. Total das execuções focadas: 20 testes.

Checks: node C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/check-home.mjs -> passed; Chrome com Vite local, sem dependências novas. Desktop 1739×1024; coluna lateral 248px; indicador de duração com largura dupla; fontes, hover, press, reduced-motion, cor secundária, ausência de exceções e overflow verificados.

Checks: Capturas inspecionadas: [desktop com relógio real](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-desktop.png), [desktop com relógio do teste](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-desktop-with-appointment.png), [mobile com relógio do teste](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-mobile.png). [Resultado do probe](C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-visual-result.json).

Checks: Final: npm run build -> passed, inclui tsc -b e Vite. Repetido somente após correção de /home/. Lint -> not run: não configurado. Full suite -> not run como comando integral: specs afetadas executadas, sem mudanças em setup ou estado compartilhado. git diff --check -> passed.

Outside scope (not fixed): API/backend, novas fixtures mensais, implementação de Dia/Analytics, configuração de lint e aviso preexistente safe.directory do Git.

Open: Nenhum item de implementação. Consulta do mock em 10/11/2026 já passou; tela real mostra o estado vazio. Fontes continuam dependentes de Google Fonts com fallback existente. Sem commit, branch ou push.
