# Revisão funcional — Calendário e Dia

**Veredito: não aprovar ainda.** Escopo: `f45258b..75119d3`, incluindo o filtro, o layout e a transição compartilhados com a Home. Árvore limpa na entrada. A fidelidade visual já foi aprovada; não foi reavaliada. O favicon não faz parte do parecer funcional.

## Problemas para o implementer

| ID | Problema e reprodução | Evidência |
|---|---|---|
| RV1 · P1 | **Voltar durante a troca de mês pode deixar a grade invisível por tempo indeterminado.** Outubro → novembro → outubro antes dos 150 ms cancela o timer. O efeito encontra o mês já exibido e retorna sem restaurar a opacidade. A URL está certa, mas o conteúdo continua em `opacity-0` mesmo depois de esgotar todos os timers. Também afeta o card mensal da Home. | `src/shared/components/MonthTransition.tsx:17`, `:33`; `src/shared/components/tests/MonthTransition.test.tsx:7` (dois cenários). O teste original só exercitava uma transição completa. |
| RV2 · P2 | **Dia perde precisão na completude e na ocupação.** Uma completa em três consultas mostra `33%` em vez de `33,3%`. Dois slots ocupados em três mostram `67%` em vez de `66,7%`. As bases estão corretas; as duas chamadas a `Math.round` eliminam a casa decimal exigida por §6/VAL-37. Os testes preexistentes com `50%` não detectavam a perda e também precisam acompanhar a apresentação de `50,0%`. | `src/features/day/pages/DayPage.tsx:24`, `:44`; `src/features/day/tests/DayPage.test.tsx:71`, `:78`. Manter `—` sem base e zero quando a base é positiva. |
| RV3 · P2 | **Escape só chega à barra se ela estiver com foco.** Abrir o tooltip por hover enquanto outro elemento mantém o foco e pressionar Escape deixa o popup aberto. O relatório de Dia B2 declara Escape para o popup; o teste anterior só cobria Escape depois de Tab para a barra. | `src/features/day/components/DayCharts.tsx` (`onKeyDown` no `rect`); `src/features/day/components/tests/BarCharts.test.tsx` (caso “fecha com Escape o popup aberto pelo ponteiro”). |
| RV4 · documentação | **As fontes ativas divergem sobre o filtro compartilhado.** O contexto (§4/Home) e o `README.md:7` dizem que Tab/blur confirmam, inválidos restauram o ano e o contexto manda ajustar dezembro ao voltar ao ano atual. O plano `responsive-calendar-filter.md` B5, o relatório e `src/shared/components/MonthPicker.tsx:41` descrevem/aplicam confirmação por formulário; blur mantém o rascunho, e dezembro futuro bloqueia Aplicar até o usuário corrigir. O `README.md:3` também chama Calendário e Dia de placeholders. | `src/shared/components/tests/MonthPicker.test.tsx:13` verifica que dezembro futuro não confirma, nem por submit, e novembro confirma quando escolhido. Consolidar o contrato reconhecido no contexto e README. Não restaurar o fluxo antigo com base somente no texto desatualizado. |

## Planos, relatórios e código

Na tabela, arquivos de testes correspondem às features/componentes de mesmo nome em `src/`. “Histórico” identifica evidência da etapa original, não uma execução desta revisão.

| Documento / IDs | Implementação e teste conferidos | Resultado |
|---|---|---|
| `calendar.md` B1–B3 | `calendar/data/calendar.ts:16`, `MonthCalendar.tsx:27`; `MonthCalendar.test.tsx:12`, `:24`, `:29`, `:34`, `:40` | Grade de 35/42 datas, domingo–sábado, adjacentes, hoje da fixture, contagem e zero. Acrescentei bissexto e virada de ano com primeira/última datas e unicidade. |
| `calendar.md` B4–B5 | `MonthCalendar.tsx:33`, `CalendarPage.tsx:7`, `AppLayout.tsx:16`; `CalendarPage.test.tsx:28`, `:38`, `:65`, `:72` | Navegação interna/adjacente e mês canônico com parâmetros preservados. Dois testes originais falhavam por esperar títulos `Dia YYYY-MM-DD` do placeholder; corrigidos mantendo a data exata como asserção. |
| `calendar.md` B6; `responsive-calendar-filter.md` B1–B3, B5–B8, B10 | `AppLayout.tsx:13`, `MonthPicker.tsx:26`, `MonthCalendar.tsx:22`; `AppLayout.test.tsx:8`, `CalendarPage.test.tsx:38`, `MonthPicker.test.tsx:13`, testes de URL e Voltar em `HomePage.test.tsx` | Estrutura, rotas, título, aplicar, rejeição e histórico têm testes. Estilo e geometria fora do pedido. Divergência documental em RV4. |
| `responsive-calendar-filter.md` B4 | `MonthTransition.tsx:16`; `MonthTransition.test.tsx:7`, `:23`, `:36` | Troca simples e movimento reduzido cobertos; interrupção falha (RV1). O “done” não abrangia o retorno rápido de mês. |
| `responsive-calendar-filter.md` B9; `calendar-card-sizing.md` B1–B3 | `MonthCalendar.tsx:21`, `:35`; `scripts/check-calendar-sizing.mjs` | A regra de preencher a altura da janela foi substituída por proporção/altura natural; sinalizei isso no plano e relatório antigos. Probes de geometria históricos, não repetidos. |
| `day-visual-refinements.md` B1–B4 | `DayPage.tsx:57`, `DayCharts.tsx` (portal e eventos), `BarCharts.test.tsx:45`, `:63`; `scripts/check-day-refinements.mjs` | Hover, zero, foco, saída/blur cobertos; falta Escape com foco externo (RV3). Aparência e fade históricos, não repetidos. |
| Dia funcional — fora do ledger de refinamentos | `DayPage.tsx:12`, `:22`, `:27`; `DayCharts.tsx` (série horária e agrupamento por período); `DayPage.test.tsx:15`, `:25`, `:34`, `:48`, `:53`, `:58`; `BarCharts.test.tsx:6`, `:28`, `:35` | Datas, status, slots, salas sem capacidade, hora de pico, agrupamento ao meio-dia e vazio têm evidência. A implementação base `c0fd3bc` não tem plano/relatório funcional correspondente em `.agents/`; o “4/4” posterior é de refinamentos, não de RF-13, MET-D01–07 ou VAL-37. RV2 evidencia a lacuna. |

## Decisões confirmadas e manutenção

- **Mock do Dia:** a mesma fixture para todas as datas é intencional até integrar a API. O título acompanha a rota; o total da célula e o do resumo podem divergir. Teste de navegação verifica 01/10 com 3 consultas na célula e 4 no resumo estático. Não é bug do protótipo; VAL-18 volta a ser exigível na integração. Decisão registrada no contexto §4/Dia.
- **Gráfico horário:** o recorte básico de 07:00 a 17:00 é intencional. Teste explicita inclusão de 7/17 e exclusão de 6/18. Não se pediu calendário de expediente por data. O agrupamento manhã/tarde usa a série recebida inteira; no mock os valores fora do expediente são zero. Na integração, usar recortes e agregados coerentes da API.
- **Manutenibilidade:** `AppLayout.tsx:4` conhece os módulos de dados de duas features; `readCalendarMonth` e `readHomeMonth` repetem formato e limites, e as páginas repetem a leitura. A diferença necessária é o fallback da fixture. Ao alterar essa regra, extrair uma função pura compartilhada com fallback explícito. Não feito aqui: atravessa features e modifica `features/home/data/home.ts`, fora do diff. Nenhuma dependência nova é necessária.
- **Testes e organização:** o teste original do Dia prometia “qualquer data” mas exercitava apenas a data da fixture. Corrigi o nome e verifiquei a decisão em outra data pela rota real. Mantive históricos anteriores; corrigi o inventário técnico no contexto e a indicação de B9 substituído. Os requisitos de comportamento em conflito ficaram explícitos em RV4.

## Verificação

- `npm run build`: passou (TypeScript dos testes e da aplicação; Vite, 386 módulos). Lint indisponível: não configurado. `git diff --check`: passou. Sem chamadas à API nem reavaliação de design.
- Prova dos testes adicionados/reforçados: **14 mutações temporárias detectadas**, cada uma com execução focada e restauração byte a byte e do diff. Casos: validação de data impossível; data bissexta; completude sem base; limites reais da grade; movimento reduzido; submit inválido; limites inferior/superior na URL; validação de ano futuro; saída do ponteiro; Escape com a barra focada; divisão no meio-dia; destino do link para Dia; horas básicas da clínica. As reproduções dos defeitos já falham sem mutar o código. `MonthTransition.test.tsx:5` também restaura timers após falhas.
- `calendar/data/calendar.ts:5`: removido apenas o `export` da constante de fallback, sem consumidor externo no repositório; a regra de normalização não mudou. Nenhuma correção comportamental aplicada pela revisão.
- A suíte foi reexecutada porque a confirmação do usuário mudou duas expectativas da revisão e porque os testes de navegação ainda esperavam a página antiga. As contagens abaixo referem-se ao estado final, não às etapas intermediárias.
- `npm test` (reporter JSON): **74 passaram, 5 falharam, 79 no total**, em dez arquivos. As cinco falhas são exclusivamente os testes novos de RV1 (2: esperado `opacity-100`, recebido `opacity-0`), RV2 (2: esperados `33,3%`/`66,7%`, recebidos `33%`/`67%`) e RV3 (1: tooltip com `aria-hidden=false` após Escape). Os dois casos de navegação que antes esperavam títulos de placeholder passaram com a página real. Os testes que falham foram mantidos como critérios de correção.

## Retorno ao implementer

1. **RV1:** garantir conteúdo visível tanto após conclusão quanto após cancelamento/reversão da troca; preservar movimento reduzido e a URL/histórico.
2. **RV2:** formatar ambos os percentuais em pt-BR com uma casa decimal, preservando zero e ausência de base; alinhar os testes antigos de percentuais inteiros.
3. **RV3:** enquanto o popup estiver aberto, permitir que Escape o dispense inclusive quando aberto pelo ponteiro com foco em outro elemento; preservar foco, hover, blur e associação acessível.
4. **RV4:** alinhar documentação ativa ao contrato do filtro, distinguir o estado de protótipo das demais rotas e complementar a rastreabilidade funcional de Dia. Os dois limites intencionais esclarecidos nesta revisão não requerem correção de produto.
