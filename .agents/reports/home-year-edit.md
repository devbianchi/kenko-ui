## Retorno da revisão da Home — RV1/R6 e faixa histórica

Status: 7/7 IDs done. Blocked / not done: nenhum.

### Behavior map

| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | RV1/R6: limpar e digitar 2025, confirmar por Tab/Enter; rascunho não publica mudanças | src/shared/components/MonthPicker.tsx:24; :34; :98 | src/shared/components/tests/MonthPicker.test.tsx:73 (Reviewer intacto); :13 | done |
| B2 | Vazio/parcial, 2023, futuro e inválidos restauram ano confirmado sem alterar URL/dados | src/shared/components/MonthPicker.tsx:34 | src/shared/components/tests/MonthPicker.test.tsx:30; src/features/home/tests/HomePage.test.tsx:23 | done |
| B3 | Janeiro/dezembro de 2024 aceitos; dezembro anterior ajusta ao mês atual ao mudar ano | src/shared/utils/month.ts:1; src/shared/components/MonthPicker.tsx:25; :41 | src/shared/components/tests/MonthPicker.test.tsx:49; :116 | done |
| B4 | URL válida antiga limita a 2024-01; futura ao mês atual; malformada preserva fallback | src/features/home/data/home.ts:30 | src/features/home/tests/HomePage.test.tsx:58; :66; :132; :138 | done |
| B5 | Limite atual considera Brasília na virada de mês UTC | src/shared/utils/month.ts:3; src/features/home/data/home.ts:32 | src/shared/components/tests/MonthPicker.test.tsx:147; src/features/home/tests/HomePage.test.tsx:75 | done |
| B6 | RV2: preservar parâmetros, Voltar e sincronização do campo; mocks/próximas independentes | src/shared/components/MonthPicker.tsx:30; src/features/home/pages/HomePage.tsx:18 (preservado) | src/features/home/tests/HomePage.test.tsx:23; :81 (Reviewer intacto); :115 | done |
| B7 | Regressão funcional de R1–R5: projeção, acessibilidade, navegação e estrutura preservadas | src/features/home/pages/HomePage.tsx:9; componentes compartilhados preservados | src/features/home/tests/HomePage.test.tsx:98; src/shared/components/tests/DashboardCard.test.tsx:7; src/shared/layout/tests/AppHeader.test.tsx:7; src/shared/layout/tests/AppLayout.test.tsx:7 | done |

### File map

| File | Role | Change |
|------|------|--------|
| src/shared/components/MonthPicker.tsx | component | Rascunho local; validação em blur/Enter; mínimo 2024; sincronização externa |
| src/shared/utils/month.ts | shared | Constante MIN_SELECTABLE_MONTH = 2024-01; relógio de Brasília preservado |
| src/features/home/data/home.ts | shared | Limite inferior na leitura de período da URL |
| src/shared/components/tests/MonthPicker.test.tsx | test | Reprodução preservada; casos de edição, rejeição, Enter e limites inferiores |
| src/features/home/tests/HomePage.test.tsx | test | URL durante rascunho, confirmação, Voltar, limites e virada; teste RV2 preservado |
| .agents/context/contexto-front.md | documentation | Faixa aprovada e comportamento de conclusão/rascunho |
| .agents/plans/completed/home/home-refinements.md | documentation | Ledger B1–B7 do retorno, origem review/plan e decisões |
| .agents/reports/home-refinements.md | documentation | Aviso de histórico anterior a RV1 e referência ao relatório atual |
| .agents/reports/home-year-edit.md | documentation | Evidência atual do retorno da revisão |
| README.md | documentation | Faixa inclusiva e operação do campo de ano |

Decisions: Faixa inclusiva 2024-01 até mês atual em America/Sao_Paulo | confirmação explícita do usuário após conflito no pedido | rejected: janeiro/2025, anos anteriores a 2024.

Decisions: Manter input numérico e design existentes, com rascunho textual local | corrige edição real sem trocar componente ou dependência | rejected: publicar cada tecla, seletor de anos novo.

Decisions: Tab/perda de foco/Enter confirmam; inválidos restauram último ano confirmado | URL contém somente períodos válidos | rejected: publicar vazio/parcial, converter inválido em outro ano válido.

Decisions: Escape conserva fechamento e retorno de foco; a perda de foco conclui a edição | mantém fluxo existente sem nova regra de cancelamento | rejected: alterar sem pedido o comportamento de fechamento.

Decisions: Estado local sincroniza quando o período externo muda; confirmações sem alteração não chamam onChange | Voltar restaura o campo e não cria entradas intermediárias de histórico | rejected: estado local desconectado da URL.

Decisions: Ajustar testes anteriores de fireEvent para concluir com blur antes da asserção | o contrato agora distingue digitação de confirmação | rejected: remover asserções de rejeição ou modificar a reprodução do Reviewer.

Obstacles: Reprodução inicial falhou com esperado 2025, recebido 2026 | input rejeitava vazio e publicava/rejeitava cada tecla | MonthPicker.tsx mantém rascunho e confirma no fim | o mesmo teste passou sem alterações.

Checks: npm test -- src/shared/components/tests/MonthPicker.test.tsx -t "permite substituir o ano digitando após limpar o campo" -> antes da correção, 1 failed; 3 testes fora do filtro. Nenhum teste foi marcado skip no código.

Checks: npm test -- src/shared/components/tests/MonthPicker.test.tsx -> 13/13 passed, incluindo reprodução do Reviewer intacta.

Checks: npm test -- src/features/home/tests/HomePage.test.tsx src/shared/components/tests/DashboardCard.test.tsx src/shared/layout/tests/AppHeader.test.tsx src/shared/layout/tests/AppLayout.test.tsx -> 31/31 passed em 4 specs. Total: 44 testes passaram nas execuções focadas.

Checks: npm run build -> passed; TypeScript e Vite, 380 módulos. Lint -> not run: não configurado. Full suite como comando integral -> not run: verificações focadas conforme skill, sem alteração de setup ou infraestrutura transversal. git diff --check -> passed.

Checks: Comparação com baseline da entrada -> HomePage.tsx, avisos históricos em .agents/plans/completed/home/home.md e .agents/reports/home.md e blocos dos dois testes do Reviewer preservados sem alterações. Evidência local: C:/Users/Pichau/.codex/visualizations/2026/11/12/01a1cd94-e59e-71f3-b31d-1cab02546348/home-review-baseline.json.

Outside scope (not fixed): backend, outras páginas, métricas reais, reavaliação da fidelidade visual aprovada e validação nativa em múltiplos navegadores. Nenhuma alteração de classes/estilos do seletor. Testes de comportamento executados em jsdom, sem alegar comprovação visual.

Open: Nenhuma pendência de implementação deste retorno. Revisão independente posterior não foi executada nesta sessão de Implementer. Sem commit, push ou merge.
