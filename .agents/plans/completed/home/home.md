# Home — ledger de implementação

> Histórico da implementação inicial. Para o comportamento final do filtro e dos cards, consultar [refinamentos](home-refinements.md) e o contexto do frontend. As referências abaixo a `home.css`, input mensal, ausência de fixture e consulta em 10/11 descrevem etapas substituídas; não são o inventário atual.

Objetivo: reproduzir a composição de Home.png com o mock local e componentes reutilizáveis, respeitando as regras do painel.

## Comportamentos

| ID | Resultado observável | Verificação prevista |
|---|---|---|
| B1 | Novembro mostra clínica, contagens, rankings, mediana e diferença do mock, sem copiar os números do PNG. | HomePage.test.tsx: apresenta o resumo do mock |
| B2 | Filtro mensal altera mês/ano; mês sem fixture informa indisponibilidade sem inventar indicadores; retorno restaura novembro; próximas consultas independem do filtro. Query inválida usa novembro. | HomePage.test.tsx: filtra mês e preserva próximas; ignora mês inválido |
| B3 | Melhor Dia abre sua data; mediana abre Analytics; sala e consultas não oferecem destinos inexistentes. | HomePage.test.tsx: navega para dia e analytics |
| B4 | Lista apenas cinco pendentes estritamente futuras, ordenadas; mostra data fora de hoje, horário, sala, paciente, especialidade e médico; lista vazia tem mensagem. | HomePage.test.tsx: ordena e limita próximas; mostra estado vazio |
| B5 | Estatísticas null mostram —, contagem zero continua zero; variação positiva/negativa/zero/null tem texto correspondente sem melhoria inventada. | HomePage.test.tsx: trata ausência e variação |
| B6 | Componentes de card compartilham composição, preservam semântica de artigo/link e navegação por teclado; filtro tem rótulo acessível. | DashboardCard.test.tsx; MonthPicker.test.tsx |
| B7 | Composição desktop segue PNG; mobile não transborda; cards centrais têm hover suave e bounce ao pressionar, laterais não; reduced-motion desliga animações. | Verificação em navegador real com asserções de geometria, estilos e screenshots; complementar aos testes de componentes. |
| B8 | /home e /home/ têm um único cabeçalho com filtro e um main; demais rotas preservam o cabeçalho sem filtro da Home. Descoberto na revisão do diff. | AppLayout.test.tsx: mantém um cabeçalho e um conteúdo principal |

## Arquivos e responsabilidades

- src/shared/components/DashboardCard.tsx: superfície compartilhada e variações de contagem/indicador.
- src/shared/components/MonthPicker.tsx: controle mensal nativo e acessível.
- src/features/home/data/home.ts: tipos de apresentação, fixture mensal e seleção de próximas consultas.
- src/features/home/components/UpcomingAppointments.tsx: lista de consultas e estado vazio.
- src/features/home/pages/HomePage.tsx e home.css: composição e estilos específicos.
- src/shared/layout/AppHeader.tsx: slot de controles fora do link de marca.
- src/shared/layout/AppLayout.tsx: largura da Home conforme referência, preservando demais rotas.
- src/styles.css: superfícies, movimento, estados e tokens reutilizáveis.
- testes colocados em tests/ das unidades; relatório em .agents/reports/home.md.

## Decisões

## Ajustes solicitados após validação do usuário

| ID | Resultado observável | Verificação |
|---|---|---|
| B9 | Em 1360×768 e viewport útil de 1360×650, coluna lateral completa e quatro indicadores em linha, com proporções fluidas do PNG. | Probe visual em navegador, desktop e mobile |
| B10 | Cards centrais crescem para 1.02 no hover e retornam a 1 pressionados, sem keyframes; laterais continuam estáticos. | Probe de estilos computados |
| B11 | Mensagem vazia centralizada vertical e horizontalmente, inclusive após migrar as superfícies. | Probe com relógio posterior à fixture |
| B12 | Mock mostra Clínica e consulta futura em 20/11/2026, mantendo relógio real. | HomePage.test.tsx com novos instantes e nome |
| B13 | Toda apresentação usa utilitários Tailwind; styles.css contém apenas import e @theme de tokens. | Inspeção de fontes + build + suíte existente |

Decisão adicional: dimensões desktop em em, com base fluida proporcional à largura; nenhum zoom/transform no layout. Fontes, superfícies e estados migrados para Tailwind. Mock estático atualizado, sem gerador de datas.

- Fixture de novembro de 2026, conforme comentário do mock; outros meses sem fixture mostram indisponibilidade, não agregados inventados.
- Relógio real para próximas consultas. Mock de 10/11 já vencido; cenários futuros são exercitados nos testes com relógio controlado.
- Cards informativos continuam artigos: resposta visual ao ponteiro não cria ação ou foco artificial.
- Reuso baseado em Home, Dia e Analytics: superfície, contagem e indicador; sem biblioteca nova.
- Preservar layout e dimensões existentes das outras páginas; Home possui cabeçalho com filtro em slot reutilizável.

## Riscos

- Fontes Google dependem de rede; fallback local permanece.
- PNG não é especificação de comportamento: usar Mediana, incluir médico/data e remover ícones sem destino conforme contexto.
- jsdom não comprova fidelidade visual; verificar também navegador real.

Estado inicial: git status limpo; alterações anteriores de tokens/logotipo já pertencem à base.
