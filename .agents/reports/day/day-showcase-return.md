## Dia e Showcase

Status: 6/6 comportamentos concluídos.

### Behavior map

| ID | Comportamento | Código | Teste |
|---|---|---|---|
| B1 | Cartão exclusivo para datas rejeitadas e retorno ao Calendário. Controle positivo com painel completo. | src/features/day/pages/DayPage.tsx:127 | src/features/day/tests/DayPage.test.tsx:120 e scripts/check-day-showcase.mjs:75 |
| B2 | Setas bloqueadas durante saída e entrada. Percentuais inteiros, inclusive zero. | src/features/day/pages/DayPage.tsx:60 e src/shared/components/MonthTransition.tsx | src/features/day/tests/DayPage.test.tsx, casos de avanço e retorno, limites, completude e ocupação |
| B3 | Clique inicial, repetição em outra altura, clique após Escape, movimento do ponteiro e foco por Tab. | src/features/day/components/HourlyAppointmentsChart.tsx:57 | src/features/day/components/tests/BarCharts.test.tsx:43 e scripts/check-day-showcase.mjs:86 |
| B4 | Cabeçalho expande e recolhe nos dois sentidos, tolera inversão e respeita movimento reduzido e navegação por Tab. | src/shared/layout/AppHeader.tsx:15 | scripts/check-day-showcase.mjs:102 e src/shared/layout/tests/AppHeader.test.tsx |
| B5 | Lista local, seleção por identidade e exclusão da conversa ativa, inativa ou última. Painel vazio ou mensagem e opções do mock. | src/features/showcase/pages/ShowcasePage.tsx:18 | src/features/showcase/tests/ShowcasePage.test.tsx:72 e testes existentes de criação, troca e exclusão |
| B6 | Botão de retorno com escala 1,02 no hover e 1 ao pressionar. | src/features/day/pages/DayPage.tsx:142 | scripts/check-day-showcase.mjs:78 |

### File map

| Arquivo | Papel | Alteração |
|---|---|---|
| src/features/day/pages/DayPage.tsx | página | Validação da rota antecede a transição. Cartão do asset com link para /calendar. |
| src/features/day/components/DayCharts.tsx | componente | Conteúdo distribuído entre os três arquivos abaixo. |
| src/features/day/components/HourlyAppointmentsChart.tsx | componente | Série horária, portal e distinção entre foco por ponteiro e por teclado. |
| src/features/day/components/DayPeriodChart.tsx | componente | Agregação e gráfico de manhã e tarde. |
| src/features/day/components/hourlySeries.ts | dados | Tipo da série e alinhamento de horas e contagens usado pelos dois gráficos. |
| src/features/day/tests/DayPage.test.tsx | teste | Casos de rejeição, rota de retorno, regiões acessíveis e apresentação das setas em testes distintos. |
| src/features/day/components/tests/BarCharts.test.tsx | teste | Imports dedicados e reabertura ao clicar após Escape. |
| src/shared/layout/AppHeader.tsx | componente | Transição de 400 ms com ease-in-out. |
| src/features/showcase/pages/ShowcasePage.tsx | página | Estado local e callbacks de criação, seleção e exclusão. |
| src/features/showcase/components/ConversationList.tsx | componente | Itens selecionáveis e menu Apagar conversa. |
| src/features/showcase/components/ConversationPanel.tsx | componente | Estado vazio, mensagem inicial, 16:50 e opções demonstrativas. |
| src/features/showcase/tests/ShowcasePage.test.tsx | teste | Identidade por aria-current ao apagar uma conversa inativa, horários fixos. |
| scripts/check-day-showcase.mjs | teste | Gestos reais de ponteiro, Tab, Escape, retorno e medidas da transição no Chrome. |
| README.md | documentação | Estado atual do Showcase. |
| .agents/context/contexto-front.md | documentação | Rota inválida, âncoras do popup e Showcase local. |
| .agents/plans/day-showcase-return.md | documentação | Plano com mapa da revisão e ajuste do botão. |
| .agents/reports/day-showcase-return.md | documentação | Evidências da entrega. |

Decisões: referência visual `public/assets/Data Inválida.png`. A validação antecede a montagem do painel para impedir a exibição de dados inclusive durante navegação para um dia rejeitado. O foco gerado por uma pressão de ponteiro conserva sua âncora. O foco por teclado usa o centro superior da barra. A transição de 400 ms com ease-in-out ficou no contêiner de navegação do cabeçalho. Popup com fade próprio de 150 ms e setas com o bloqueio de entrada da revisão.

Obstáculos: o primeiro teste de exclusão inativa encontrava três menus no jsdom. A busca agora ocorre dentro do item escolhido. A primeira medição do cabeçalho no servidor de desenvolvimento perdeu a referência do menu. O roteiro completo foi executado sobre a build de produção.

Verificação em Chrome desktop: no botão da página inválida, hover 1,02, active 1 e retorno para /calendar. Na barra das 09h, clique a 85% e 15% da altura, repetição após Escape e foco por Tab verificaram a geometria do popup. No cabeçalho, ida, volta, inversão e movimento reduzido passaram em 1360 e 390 px. Em desktop, a navegação mediu 197 → 70 → 0 px enquanto a marca cresceu de 802 para 1013 px. Na tela estreita a marca subiu de 83 para 20 px. O espaço após o recolhimento mediu zero nas duas larguras. Tab excluiu a navegação recolhida.

Checks: `npm run build` passou com TypeScript e Vite. `git diff --check` passou. Lint indisponível no projeto.

Suíte final: `npm test -- --maxWorkers=1` passou com 92 de 92 testes em 11 arquivos. As três regressões de data e a regressão de clique registradas na revisão passaram. O teste adicional de exclusão inativa manteve a identificação da conversa ativa por aria-current.

Open: nenhuma pendência de implementação.
