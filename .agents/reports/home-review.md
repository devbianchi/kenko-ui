## Review: Home — comportamento e manutenção

Verdict: do not approve — R6 tem falha reproduzida na edição do ano por teclado.

Escopo: working tree da Home, componentes compartilhados afetados, mocks, dependências e documentação. Fidelidade visual excluída por aprovação explícita do usuário. Lidos os planos e os relatórios de ambas as etapas. As exceções do protótipo registradas no contexto (§4) prevalecem: métricas estáticas ao filtrar e quatro campos visíveis nas consultas.

### Must fix

- **[P2] RV1 / R6 — edição do ano** — `src/shared/components/MonthPicker.tsx:78`: o input controlado rejeita imediatamente o estado vazio. Apagar `2026` restaura `2026`; digitar `2025` em seguida não substitui o valor. Os testes anteriores usavam `fireEvent.change` com o ano completo, encobrindo a interação real. Reprodução em `src/shared/components/tests/MonthPicker.test.tsx:13`: `user.clear`, `user.type('2025')`, Tab; esperado 2025, recebido 2026. A alegação de seleção por teclado em R6 não está integralmente atendida.
- Opção recomendada: manter texto de edição local e validar/confirmar ao concluir a entrada, preservando os limites de R7. Alternativa: seletor de anos, com decisão explícita sobre a faixa histórica. Não corrigido na produção: muda comportamento, vedado à revisão pela seção 5 da skill Reviewer. O teste falhando permanece como evidência e critério de retorno.

### Behavior map (verified)

Paths de testes abaixo relativos a `src/`; linhas correspondem ao estado desta revisão.

| ID | Comportamento | Código | Teste | Verificado |
|---|---|---|---|---|
| B1 | Clínica, contagens, rankings e mediana do mock | features/home/pages/HomePage.tsx:30 | features/home/tests/HomePage.test.tsx:40 | passou |
| B2 / R6 | Período visual preserva mock; URL e Voltar | features/home/pages/HomePage.tsx:18 | features/home/tests/HomePage.test.tsx:23, :57, :73 | passou; edição por teclado falha em RV1 |
| B3 | Melhor Dia e mediana navegam | features/home/pages/HomePage.tsx:40 | features/home/tests/HomePage.test.tsx:86 | passou |
| B4 / R1 | Até cinco pendentes futuras, ordenadas, Brasília, quatro campos e vazio | features/home/data/home.ts:53; features/home/components/UpcomingAppointments.tsx:6 | features/home/tests/HomePage.test.tsx:40, :96, :128 | passou |
| B5 | Zero, null e variações | features/home/data/home.ts:40; features/home/pages/HomePage.tsx:40 | features/home/tests/HomePage.test.tsx:135, :146; shared/components/tests/DashboardCard.test.tsx:7 | passou |
| B6 | Semântica e link por teclado | shared/components/DashboardCard.tsx:21 | shared/components/tests/DashboardCard.test.tsx:15 | passou; filtro em RV1 |
| B8 | Home com/sem barra final tem um main e navegação; Analytics sem filtro | shared/layout/AppLayout.tsx:4 | shared/layout/tests/AppLayout.test.tsx:7 | passou |
| B12 | Clínica e consulta em 20/11, relógio real | mocks/home/home.ts:3; features/home/pages/HomePage.tsx:51 | features/home/tests/HomePage.test.tsx:40, :128 | passou |
| R4 / R5 | Marca acessível, navegação e Heroicons | shared/layout/AppHeader.tsx:1 | shared/layout/tests/AppHeader.test.tsx:7, :17; build | passou na parte funcional |
| R7 | Inválidos, futuros, ano anterior e virada em Brasília | shared/components/MonthPicker.tsx:54; shared/utils/month.ts:1; features/home/data/home.ts:30 | shared/components/tests/MonthPicker.test.tsx:28, :52, :80; features/home/tests/HomePage.test.tsx:73, :79 | passou |
| B7, B9–B11, B13, R2–R3 | Apresentação e estilos | tokens, layout e cards | aprovação visual anterior do usuário | não reavaliados visualmente |

Missing from implementer ledger: RV1 explicita a edição intermediária por teclado necessária a R6; RV2 explicita persistência dos demais parâmetros e restauração por Voltar, decorrentes do filtro mantido na URL.

### Tests added (by me)

- `src/shared/components/tests/MonthPicker.test.tsx:13` — RV1/R6 — apagar e redigitar ano — falha no código atual: esperado 2025, recebido 2026.
- `src/features/home/tests/HomePage.test.tsx:23` — RV2/R6 — URL contém mês escolhido, preserva `origin=demo`, Voltar restaura mês e seletor — passou; mutation check registrado abaixo.

### Refactor log (fixed by me)

- `src/features/home/pages/HomePage.tsx:14` — alias `summary`, optional chaining e fallbacks redundantes → acesso direto a `data` e destructuring dos rankings. `HomeData` exige os objetos e contagens; default já resolve prop ausente. Comportamento preservado: TypeScript/build passaram; todos os testes da Home passaram.
- `.agents/plans/completed/home/home.md:3` — referências obsoletas sem aviso → identificação explícita da etapa histórica e ligação aos refinamentos; corrigi `.100` para `1` em B10 conforme relatório atual e código. Apenas documentação.
- `.agents/reports/home.md:3` — conclusão de consulta vencida em 10/11 e referência a `home.css` → aviso de que são históricas, com fixture atual e migração B12/B13. Preservados os resultados dos checks originais, sem atribuí-los ao estado atual. Apenas documentação.

### Tradeoffs

- Mock único em todos os meses: garante demonstração estável e está aprovado; não representa agregação mensal. Integração futura precisa substituir essa decisão; Melhor Dia continua apontando à data real do mock, mesmo sob outro mês.
- `details`/`summary`, select e number nativos: dispensam dependência de calendário; não garantem edição intermediária correta em input controlado (RV1). Corrigir edição sem permitir publicar períodos inválidos/futuros.
- Relógio consultado no render: exclui consultas vencidas quando renderiza; não atualiza sozinho uma aba ociosa. Não classificado como bug nesta etapa: contexto não exige periodicidade de atualização. README deve ser entendido nesse limite.
- Tipos de apresentação isolam o protótipo dos contratos futuros; não validam respostas externas. Não há rede/backend a validar nesta entrega.

### Checks

- `npm run build` — passou, inclui TypeScript e Vite (380 módulos).
- `npm test` — 5 arquivos; 27 testes passaram, 1 falhou: RV1, adicionado nesta revisão. Nenhum teste existente falhou.
- Lint — indisponível, não configurado.
- `git diff --check` — passou também após restaurar as mutações.
- Mutation checks — oito alterações temporárias detectadas pelos testes correspondentes: perder outros parâmetros da URL; aceitar ano 0000; aceitar URL futura; incluir início igual a agora; converter contagem zero em ausência; aceitar ano zero no input; aceitar mês futuro; usar UTC em vez de Brasília. Cada execução focada falhou na asserção esperada. Arquivos restaurados byte a byte e `git diff` comparado com o estado anterior de cada mutação. RV1 já falha sem mutação.
- Evidência: `C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1d061-47c0-7a80-b672-516713d770e7/review-mutations.json`. O detector automático reconhecia somente `AssertionError`/`TestingLibraryElementError`; cinco casos foram marcados `UNCONFIRMED`, mas a inspeção dos logs confirmou falhas de matchers jest-dom (`Error: expect(element)`), não falhas de infraestrutura.

Not verified: pixels/layout (fora do pedido), API/backend (fora da etapa), comportamento nativo em múltiplos navegadores e artefatos visuais históricos. Testes executados em jsdom; não apresentados como verificação visual.

### Return list

- **RV1 / R6:** permitir limpar e digitar outro ano válido; teste em `MonthPicker.test.tsx:13` deve passar. Preservar rejeição de ano inválido/futuro, meses futuros e ajuste ao retornar ao ano corrente (R7). Atualizar relatório R6 com a evidência de teclado real.

Sound: navegação, projeção estática aprovada, seleção de próximas consultas e limites temporais cobertos passaram; bloqueio restante é a edição do ano.
