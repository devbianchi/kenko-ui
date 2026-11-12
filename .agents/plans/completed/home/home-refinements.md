# Refinamentos visuais da Home

Objetivo: aplicar os seis ajustes solicitados preservando as proporções aprovadas em 1360×768.

## Retorno da revisão — edição e faixa histórica (estado atual)

Objetivo: corrigir RV1/R6 sem alterar o design e aceitar somente 2024-01 até o mês atual em Brasília. Janeiro de 2024 confirmado explicitamente pelo usuário, resolvendo a menção contraditória a 2025 no pedido inicial.

| ID | Comportamento e origem | Teste previsto |
|---|---|---|
| B1 | (review RV1, plan R6) Limpar 2026, digitar 2025 e Tab confirma 2025; rascunho vazio/parcial não chama onChange. | MonthPicker.test.tsx: reprodução do Reviewer intacta; rascunho e Enter |
| B2 | (plan R7) Na conclusão, rejeitar 2023, futuro, vazio, parcial e inválido; restaurar ano confirmado, sem mudar URL/dados. | MonthPicker.test.tsx: rejeição na conclusão; HomePage.test.tsx: URL durante edição |
| B3 | (plan R7) Aceitar janeiro e dezembro de 2024; de dezembro anterior para ano atual, ajustar mês se necessário. | MonthPicker.test.tsx: limites inferiores e ajuste existente |
| B4 | (plan R7) URL válida abaixo de 2024-01 limita a 2024-01; futura limita ao mês atual; malformada mantém fallback existente. | HomePage.test.tsx: URLs antigas, futuras e malformadas |
| B5 | (plan R7) Limite superior usa America/Sao_Paulo, inclusive virada de mês UTC/Brasília. | MonthPicker.test.tsx: virada existente; HomePage.test.tsx: URL na virada |
| B6 | (review RV2, plan R6) Preservar demais parâmetros e Voltar; confirmar ano cria só um período, Voltar restaura campo; mocks/próximas permanecem independentes. | HomePage.test.tsx: teste do Reviewer intacto e edição do ano/Voltar |
| B7 | (plan R1–R5) Preservar projeção dos cards, acessibilidade, navegação, marca e Heroicons; fidelidade visual aprovada não será reavaliada. | HomePage.test.tsx, DashboardCard.test.tsx, AppHeader.test.tsx, AppLayout.test.tsx; build |

Arquivos: MonthPicker mantém rascunho local e confirma em blur/Enter; shared/utils/month centraliza o limite inferior; home/data limita URL; testes colocados nas unidades; contexto/plano/relatório e README registram a decisão. HomePage e testes de reprodução/URL do Reviewer permanecem preservados.

Decisão: input numérico existente com estado local, sem dependências ou controles visuais novos. Tab, blur e Enter concluem a edição; Escape mantém o fechamento/foco existente (a transferência de foco conclui a edição). Rascunho é sincronizado quando o período externo muda.

Risco: testes antigos que enviavam ano completo por fireEvent precisam concluir a edição antes de afirmar publicação; nenhuma asserção de resultado/rejeição será removida. Relatórios anteriores serão marcados como históricos, sem reaproveitar seus checks como evidência atual.

Estado inicial: working tree já contém implementação e revisão não commitadas; preservar alterações fora deste retorno. Sem commit/push/merge.

## Ledger de refinamentos anteriores (referência)

| ID | Comportamento | Teste |
|---|---|---|
| R1 | Consulta mostra apenas horário, sala, paciente e especialidade, conforme PNG; sem médico/data visíveis. | HomePage.test.tsx: card conforme design e ordenação |
| R2 | Plus Jakarta usa 700 e 42dot usa 600; fontes da marca mantêm seus pesos próprios. | Probe visual de estilos computados em Home e Analytics |
| R3 | Escalas de tipografia e espaçamento reutilizáveis substituem medidas ad hoc, sem perder responsividade. | Probe visual 1360, 1739, 768 e 390; build |
| R4 | KENKO tem sublinhado pontilhado em todas as páginas. | AppHeader.test.tsx + probe em Home, Analytics e Showcase |
| R5 | Ícones de Heroicons substituem Lucide, incluindo navegação acessível. | AppHeader.test.tsx, build e inspeção de dependências |
| R6 | Filtro exibe mês por extenso em português; seleção de mês/ano atualiza URL e card azul, mantendo indicadores e próximas consultas do mock. | MonthPicker.test.tsx e HomePage.test.tsx: troca de mês, ano e teclado |
| R7 | Apenas períodos até o mês atual em Brasília; bloqueia ano/mês futuro, limita URL e ajusta dezembro de ano anterior ao voltar ao ano atual. | MonthPicker.test.tsx e HomePage.test.tsx: limites, rejeição sem alteração e virada UTC/Brasília |

Decisões: details/summary com select nativo de mês e campo numérico de ano, apresentação em português e fechamento por Escape; tipos e dados completos preservados no mock, projeção visual reduzida conforme pedido. Esta decisão substitui a exibição de médico/data e a indisponibilidade por mês da implementação anterior apenas no protótipo Home.

Arquivos: componentes compartilhados de cards/filtro/cabeçalho, Home e lista de consultas, tokens Tailwind, fontes globais, testes colocados junto das unidades, package.json/lock e documentação.

Estado inicial: mudanças anteriores da própria tarefa ainda no working tree. DashboardCard recebeu formatação e active:scale-100 fora da última edição do agente; preservar esse estado, sem restaurar .96.

Riscos: controle nativo depende do navegador; manter entrada acessível por teclado. Mudança de mês não representa agregação ou integração real.
