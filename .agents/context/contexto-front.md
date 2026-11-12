# Kenko — Contexto do frontend

## 1. Produto, autoridade e consulta

O Kenko é uma aplicação acadêmica de atendimento e agendamento para uma clínica. No Showcase, o visitante usa um bot determinístico por menus, executado no backend, sem IA ou interpretação livre de mensagens. Home, Calendário, Dia e Analytics apresentam agenda e indicadores. A demonstração é aberta, sem login, e o painel é somente leitura.

Este é o contexto principal para planejamento, implementação e revisão do frontend. Consolida os comportamentos necessários às tarefas comuns; não é plano de implementação. Objetivos OBJ-01–05: agendar pelo bot, integrar interface/API/banco, apresentar agenda consistente, calcular indicadores com registros reais e permitir conversas independentes com várias operações para o mesmo paciente.

### Autoridade e manutenção

- [Escopo completo](completo/escopo-kenko-v2.md): regras funcionais, métricas e critérios originais; os IDs abaixo preservam sua rastreabilidade.
- [API](completo/kenko-backend-api.md) e [bot](completo/kenko-bot-api.md): contratos externos e detalhes técnicos, consultados por seção conforme a tarefa.
- [Guia de estilização](guia-estilizacao.md) e [PNGs](../../public/assets/): apresentação visual; regras funcionais prevalecem sobre comportamentos apenas ilustrados.
- [README](../../README.md), código e configuração: estrutura e estado técnico atual. Código incompleto não revoga requisitos aprovados.
- [Mocks](../../mocks/README.md): fixtures visuais simplificados, não contratos completos nem valores fixos de aceitação.

Mudanças aprovadas devem ser incorporadas neste resumo, no assunto afetado; quando alterarem contratos, atualizar também o complemento correspondente. O escopo completo preserva a base original. Havendo diferença, uma decisão posterior explicitamente aprovada e registrada aqui prevalece sobre essa base; divergências sem decisão são reportadas, não resolvidas por preferência do agente.

Decisões aprovadas na consolidação: seleção de horário já revalida disponibilidade e pode ser rejeitada; frontend registra as entradas do usuário na transcrição; Analytics não permite ano futuro. A receita visual padrão de degradê está no guia. As regras abaixo já incorporam essas decisões.

### Leitura progressiva

Leia esta introdução e as seções afetadas, sem carregar todos os complementos:

- Visual: página (§4), guia e PNG correspondente.
- Showcase: regras (§3), fluxo (§5) e integração (§7).
- Indicadores: página (§4) e métricas (§6).
- Integração: §7 e apenas a seção do contrato da operação.
- Revisão: requisitos afetados e critérios correspondentes em §8.

### Etapa atual: protótipo com mocks

A entrega atual é um protótipo funcional com dados estáticos. Implementar e testar componentes, navegação, interações e estados visíveis usando os mocks locais. As regras de domínio abaixo orientam a UI; contratos e garantias de API/banco descrevem a integração futura, não dependências nem critérios de execução desta etapa. Não criar backend, servidor simulado, testes de banco ou infraestrutura de rede para validar o protótipo. Os dados estáticos são autorizados nesta etapa e não comprovam persistência ou integração real.

## 2. Base técnica e limites

A base usa React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7 em Data Mode e Lucide React, organizada por feature. Estrutura, rotas e comandos estão no README; scripts e versões efetivas estão no package.json. As páginas ainda são placeholders, sem integração de negócio. Reutilizar a organização existente não significa adotar seu comportamento incompleto como requisito.

Biblioteca de gráficos, formulários, estado/cache, hospedagem e organização adicional continuam decisões de implementação, conforme a tarefa. Lint ainda não está configurado; quando solicitado pelas skills, registrar essa limitação sem alegar execução. A infraestrutura de testes está descrita abaixo.

Fora do escopo: WhatsApp/canais externos; IA; login; fluxos próprios de gerente/médico; gestão de médicos, salas, especialidades, horários ou roteiro; aprovação de horários por profissionais; vários pacientes na mesma conversa; presença, faltas e prontuário; criação, edição ou remarcação pelo painel; detalhe de consulta deduzido de ícones; retomada de conversa abandonada e exclusão de negócio pela lista de conversas. Não há interface de preparação dos dados.

### Testes de UI: ferramentas e organização

Vitest 4 executa os testes usando a configuração Vite existente; jsdom fornece o DOM. React Testing Library renderiza os componentes, user-event simula ações e jest-dom oferece asserções sobre o DOM. @testing-library/dom é a dependência compartilhada das ferramentas. Cobertura opcional usa o provider V8 da mesma versão de Vitest. Usar Node 22.12+ ou Node 24; ambiente validado com Node 24.13.0. Instalação reproduzível: npm ci.

Comandos no [README](../../README.md#testes). Configuração: [vitest.config.ts](../../vitest.config.ts); setup comum: [src/test/setup.ts](../../src/test/setup.ts). Os testes importam it/describe/expect/vi do Vitest explicitamente. O setup carrega jest-dom e limpa DOM e storage após cada teste; mocks são limpos/restaurados pela configuração. A build verifica também o TypeScript dos testes.

- Testes de uma feature: src/features/<feature>/tests/<Unidade>.test.tsx, próximos às páginas, hooks e componentes verificados. Se houver uma pasta components com responsabilidade própria, seus testes ficam em components/tests/.
- Componentes compartilhados: src/shared/components/tests/<Componente>.test.tsx. Componentes de layout permanecem onde estão, com testes em src/shared/layout/tests/; não movê-los só para seguir o nome components.
- Usar .test.tsx quando houver JSX e .test.ts para lógica sem JSX. O runner descobre src/**/tests/**/*.test.{ts,tsx}; criar pastas apenas quando houver testes.
- src/test/ contém somente preparação global e, se necessários, utilitários compartilhados. Fixtures específicas ficam junto do teste; reutilizar mocks/ quando os dados forem adequados ao cenário, sem acoplar asserções a todos os números ilustrativos.
- Verificar comportamentos observáveis: conteúdo acessível, estado antes/depois da ação, navegação, entradas e resultados vazios relevantes. Preferir getByRole/getByLabelText, userEvent.setup() e await nas interações; findBy para mudanças assíncronas. Evitar snapshots extensos, classes Tailwind e detalhes internos como contrato do teste.
- Instanciar dados e providers por teste. Usar MemoryRouter para navegação local. Não compartilhar estado mutável nem fazer chamadas reais de rede; não instalar MSW, E2E ou serviços enquanto o escopo não exigir.
- Cobertura informa lacunas, sem percentual mínimo nesta etapa. Inclui arquivos de aplicação ainda não testados, excluindo testes, setup, declarações e bootstrap. O relatório HTML fica em coverage/index.html, ignorado pelo Git. Cobertura não comprova fidelidade visual; jsdom não valida layout/pixels de navegador.

Exemplo funcional: [AppHeader.test.tsx](../../src/shared/layout/tests/AppHeader.test.tsx), que verifica navegação e link ativo com clique real simulado. As skills mantêm a divisão de checks entre implementação e revisão; não repetir a suíte completa apenas para gerar evidência duplicada.

## 3. Regras transversais

### Dados e responsabilidades — RN-01–03, DAD-01–16

Dados de negócio e indicadores vêm da API e do banco, inclusive clínica, roteiro, disponibilidade e agregações. Dados fictícios podem ser preparados no banco, mas operações são reais. Não substituir resultados por números fixos/aleatórios ou contadores locais. Logotipo, estilos e rótulos comuns da interface não são dados de negócio.

O backend conduz passos e valida escolhas; o frontend renderiza os controles recebidos. Perguntas, opções, textos e transições do roteiro são fixos no banco, sem editor ou versionamento durante o uso. A transcrição textual fica em localStorage; o backend guarda fatos estruturados, vínculos, respostas, eventos e instantes, não a transcrição. Apagá-la não apaga os fatos nem exige recuperação ou sincronização entre dispositivos.

Há uma clínica, sem seletor. Especialidade classifica médicos; cada médico tem uma especialidade. Cada horário possui início, fim, médico e sala, sem duração global fixa. Médico/sala não são escolhas separadas no bot. Salas e demais dados auxiliares são previamente cadastrados por queries. A preparação prevê ao menos seis salas para os exemplos, sem fixar o número de linhas da interface.

Dados de demonstração usam relógio real e envelhecem; pendentes podem tornar-se completas e próximas consultas podem esvaziar. Não há data congelada ou gerador obrigatório no frontend.

### Identidade e preservação — RN-04–12

Nova Conversa gera novo contato simulado, sem exigir telefone real; cria conversa independente e não encerra anteriores. Há no máximo uma conversa efetivamente ativa por contato, inclusive sob concorrência.

Cada conversa atende no máximo um paciente, exclusivo desse contato. Nome não é único. Nome e nascimento iguais em outra conversa não autorizam reutilizar paciente ou consultar reservas anteriores. Antes da identificação há contato/conversa, mas não paciente. Para outra pessoa, oferecer nova conversa.

Uma conversa pode fazer várias reservas para seu paciente. Tentativas, respostas e resultados anteriores são preservados ao iniciar outra tarefa, retornar ao menu, sair, abandonar, ocultar ou apagar a transcrição. Confirmação é resultado de tarefa; não encerra a conversa.

### Horários, status e contagens — RN-13–23

Horário com reserva não cancelada não é ofertado. Selecionar já revalida disponibilidade e pode ser recusado; não bloqueia nem reserva temporariamente. Confirmar revalida novamente e persiste antes de informar sucesso. Banco/operação impedem duas reservas não canceladas para o mesmo horário. Canceladas históricas podem coexistir; horários reservados não são apagados da capacidade.

Status derivado, nesta ordem: cancelada se houve cancelamento; completa se não cancelada e agora é igual ou posterior ao fim; pendente nos demais casos. Completa não comprova presença. Uma consulta em andamento ainda é pendente. Não há conclusão manual ou contabilização de faltas.

Somente pendentes originadas na conversa atual podem ser canceladas, com conversa ativa. Cancelamento preserva histórico e libera o horário para nova oferta quando ainda futuro. Completas/canceladas são consultáveis, não canceláveis.

Totais, rankings e distribuições incluem canceladas; ocupação exclui reservas canceladas. Total do dia = completas + pendentes + canceladas = soma por sala = célula do calendário, sob a mesma referência temporal.

## 4. Páginas e navegação

Painel: Home, Analytics e Calendário; Dia pertence ao Calendário. Showcase é separado. O ícone de saída pode ser removido ou levar ao Showcase, sem logout. Links exigidos: data no Calendário → Dia; Melhor Dia → Dia correspondente; duração da Home → Analytics. Remover outros ícones sem destino definido, sem criar telas novas.

### Home — TELA-01, RF-11

Filtro próprio de mês/ano, sem modos semana/ano. Exibir completas, pendentes, canceladas, melhor dia, hora de pico, melhor sala, mediana de atendimento e variação. Rankings sem consultas são null, sem inventar vencedores. O título de duração deve dizer mediana, não média.

Próximas Consultas: até cinco pendentes com início estritamente futuro, ordenadas cronologicamente a partir de agora, independentemente do mês filtrado. Mostrar horário, sala, paciente, especialidade e médico; incluir data quando não for hoje.

### Calendário — TELA-02, RF-12

Grade mensal de domingo a sábado. O frontend escolhe as datas visíveis, incluindo meses adjacentes, e envia início incluído/fim excluído à API. Não há modos semana/ano. Datas ausentes do mapa contam zero. API não escolhe cinco/seis linhas nem devolve limites de grade.

Destacar hoje; esmaecer somente dias fora do mês, não os futuros do próprio mês. Datas adjacentes representam suas datas reais. Selecionar data abre Dia. Exemplo: grade 27/09–31/10 envia 27/09 e 01/11 como fim exclusivo.

### Dia — TELA-03, RF-13

Sem filtro próprio. Exibir total/status, taxa de completude, consultas por hora, manhã/tarde e tabela por sala: consultas, canceladas entre parênteses, ocupação e pico. Manhã é antes de 12h; tarde é a partir de 12h. Incluir salas cadastradas sem consultas; ocupação sem capacidade é “—”. Não omitir horas cadastradas porque o PNG ilustra 9h–20h. Não há pacientes por sala ou tela extra de detalhe.

### Analytics — TELA-04, RF-14

Filtro semana/mês/ano governa cinco KPIs e seis gráficos definidos em §6. Não permitir ano futuro. Não há filtros por paciente/médico/sala, exportação, exploração de pessoas por barra ou construtor de relatórios.

Usar “conversas iniciadas fora do expediente”, não o rótulo ilustrativo “Mensagens Fora do Expediente”. Títulos/eixos da série acompanham a granularidade do filtro, sem oito semanas fixas.

### Showcase — TELA-05, RF-15

Logotipo, descrição, Nova Conversa, lista de conversas conhecidas pelo navegador e chat. Lista mostra tempo desde última interação real; mensagens distinguem bot/paciente e mostram horário. Botões conduzem o roteiro; formulário coleta identificação quando solicitado.

Menu de três pontos oferece Ocultar conversa: retira da lista local sem excluir negócio, encerrar conversa, cancelar reserva ou alterar analytics. Não há tela de recuperação de itens ocultos. Fluxo e persistência estão em §5 e §7.

## 5. Fluxo do Showcase

### Início e agendamento — RF-01–04

Nova Conversa gera contato e inicia atendimento; exibir digitação e boas-vindas/menu automáticos, sem exigir “oi”. Menu: Agendar; informações da clínica; ver/cancelar agendamentos; Sair. Digitação é apresentação local, sem atividade de negócio.

Agendar inicia tentativa e qualifica a conversa para o funil. Triagem tem exatamente duas perguntas: especialidade e primeira consulta/retorno nessa especialidade. Preservar respostas por tentativa. Opções vêm do banco; referências visuais incluem Clínico geral, Dermatologia, Ortopedia e Cardiologia. Não há terceira pergunta de rotina/avaliação ou mudança de duração/oferta por primeira consulta/retorno.

Ofertar até três horários livres, futuros e compatíveis com a especialidade: até dois em dias diferentes da semana atual e até um, o mais próximo disponível, da próxima semana; ordenar cronologicamente. Semana domingo–sábado em America/Sao_Paulo. Mostrar menos quando necessário, sem completar fora dessa distribuição. Uma/duas opções não são busca sem horário. Não há preços, descontos ou prioridade clínica adicional; desempate estável é técnico.

Seleção revalida disponibilidade. Na primeira reserva, coletar nome não vazio e nascimento válido/não futuro após escolher horário. Envio válido conclui reserva após validação/persistência, sem tela extra de confirmação. Nas seguintes, refazer triagem e seleção; a seleção válida confirma com o paciente já identificado, sem pedir os dados novamente. Após sucesso, informar confirmação e retornar ao menu.

### Concorrência e indisponibilidade — RF-05–06

Duas conversas podem visualizar um horário, mas só uma confirma. Seleção ou confirmação recusada por indisponibilidade não produz sucesso; apresentar conflito e nova oferta. Revalidar ao selecionar não elimina a revalidação ao confirmar.

Busca totalmente vazia registra ocorrência por conversa/especialidade/instante, informa ausência e oferece Continuar (menu) ou Sair. Continuar não executa nova busca até nova tentativa. Reexibir resultado não cria ocorrência; cada nova busca efetiva vazia conta, inclusive na mesma conversa. Resultado vazio alcança “Viram horários” no funil.

### Consultar, cancelar e informações — RF-07–08

Listar apenas reservas originadas na conversa, inclusive completas/canceladas. Identificar cada reserva quando houver várias. Lista vazia permite voltar ao menu. Cancelar elegível informa resultado e retorna ao menu. Não há recuperação global por nome/nascimento ou contato anterior, nem botão genérico para editar passos anteriores.

Informações da clínica vêm do banco: nome, endereço, telefone, expediente e especialidades; apresentar e retornar ao menu. Expediente: Seg–Sex 07h–18h, sábado 09h–13h, domingo fechado. Abertura incluída e fechamento excluído. Bot funciona também fora do expediente.

### Término — RF-09–10

Sair é global durante o fluxo, encerra imediatamente e envia adeus, preservando motivo, instante e etapa anterior. Antes da confirmação, não cria reserva; depois, não cancela nem apaga sucesso.

Abandono é calculado quando não há encerramento explícito e inatividade é superior a uma hora, não no limite exato. Não persistir abandono ou criar rotina de atualização. Não há retomada: novo atendimento usa novo contato. Abrir, recarregar, animar e reenviar ação idempotente não renovam atividade. Estado efetivo vem da API mesmo quando a revisão persistida não mudou.

## 6. Métricas e apresentação

As fórmulas orientam interpretação e revisão; a API calcula os agregados. Não reconstruir analytics por transcrição, cliques ou dados incompletos das páginas.

### Tempo, bases e formatação

Usar America/Sao_Paulo para negócio e apresentação. Intervalos incluem início e excluem fim. Agenda usa data/hora da consulta; métricas de conversa usam início da conversa, incluindo marcos/resultados posteriores conhecidos; buscas sem horário usam instante da ocorrência. Confirmação em novembro de conversa iniciada em outubro permanece no grupo de outubro.

Filtros de Analytics: semana = sete datas terminando na referência; mês = mês indicado; ano corrente = janeiro até fim do mês atual, anteriores = doze meses. Não permitir ano futuro. Capacidade futura dentro do período entra na ocupação. Comparação usa período imediatamente anterior de mesma duração, não necessariamente mês de calendário.

Percentuais 0–100, exibidos com uma casa decimal; contagens inteiras; durações em minutos/segundos. Preservar precisão até apresentação. Zero é valor válido; estatística sem base é null (“—”), nunca zero artificial. Coleções vazias são válidas. Variação usa pontos percentuais, segundos ou contagem absoluta conforme a unidade. Usar melhoria/piora somente quando houver sentido favorável definido; aumento fora do expediente não tem interpretação favorável presumida. Tratamento específico de difference null será definido posteriormente; não inferir diferença ou base de comparação no cliente.

Empates em rankings: data/hora mais cedo ou menor número de sala. Mesmos dados/filtros/instante explicam resultados; indicadores dependentes do relógio podem mudar sem novos registros.

### Agenda — MET-H01–08, MET-C01, MET-D01–07

- Home: contagens mensais por status; melhor dia/sala por quantidade incluindo canceladas. Pico = hora com maior contagem; diferença acima da média = contagem do pico menos média das outras horas do expediente, incluindo zeros, sem horas fechadas. Não é variação temporal. Mediana mensal usa início da conversa; próximas consultas seguem §4.
- Calendário: total de reservas por data do horário, incluindo canceladas.
- Dia: completude = 100 × completas / total (inclui pendentes/canceladas no denominador). Distribuições por hora de início, manhã/tarde e sala incluem canceladas. Pico por sala usa a maior contagem horária.
- Ocupação geral/por sala = 100 × horários com reserva não cancelada / horários totais no período/data. É por contagem, não minutos; não multiplicar por cancelamentos históricos. Sem capacidade, null. Não fazer média simples dos percentuais das salas.

### Analytics — MET-A01–11

| ID | Indicador | Regra |
| --- | --- | --- |
| MET-A01 | Conclusão do Bot | 100 × conversas com ao menos uma confirmação / conversas que escolheram Agendar. Conversas distintas; informativas não entram até escolherem Agendar. Sem denominador, null; com tentativas e nenhum sucesso, 0%. |
| MET-A02 | Mediana de atendimento | Uma duração por conversa: início até primeira confirmação; não espera Sair. Cancelamento posterior não apaga o sucesso/duração. Também usada em MET-H07. |
| MET-A03 | Fora do expediente | 100 × conversas iniciadas fora do expediente / todas as iniciadas. Usa limites de §5, não quantidade de mensagens. |
| MET-A04 | Ocupação | Fórmula de agenda acima, considerando capacidade do período. |
| MET-A05 | Buscas sem Horário | Ocorrências vazias, incluindo repetições efetivas na mesma conversa. |
| MET-A06 | Funil | Conversas distintas por marco: escolheu Agendar; respondeu especialidade (não exige ambas as perguntas); recebeu busca, mesmo vazia; escolheu horário; confirmou. Percentual de cada linha sobre Iniciaram. |
| MET-A07 | Onde terminam | Separar Sair/abandono em Triagem, Escolha de horário, Dados do paciente e Confirmação. Usar etapa atual de término durante tentativa. Saída no menu permanece registrada, mas fora das quatro barras. Não atribuir à última confirmação. |
| MET-A08 | Histograma | Mesma população de MET-A02. Faixas de um minuto: barra 1 = [0,60), …, barra 10 = [540,600), “10+” = 600 segundos ou mais. Mostrar mediana/P90; sem amostras, estatísticas null e contagens zero. |
| MET-A09 | Mapa de calor | Inícios por dia da semana e 12 faixas de duas horas, cobrindo 24h; 7 × 12 células inclusive zeros. Intensidade cresce com contagem. |
| MET-A10 | Evolução da conclusão | Fórmula de MET-A01 por dia (semana), blocos 1–7, 8–14, 15–21, 22–28, 29–fim (mês), ou mês (ano). Rotular blocos por datas. |
| MET-A11 | Buscas por especialidade | Ocorrências vazias em ordem decrescente; soma igual a MET-A05. Não mede faltas de pacientes. |

Mediana com N par é média dos dois valores centrais. P90 é posição ceil(0,90 × N) da lista crescente, contando desde 1. Com dez amostras, usar a nona. Segunda confirmação não cria amostra extra nem multiplica conversas no funil.

Média móvel de MET-A10: média aritmética dos percentuais da posição atual e duas anteriores; no início, usar posições disponíveis. Ignorar null dentro dessa janela sem buscar pontos mais antigos; janela sem percentual calculável é null. Não ponderar por número de conversas. KPI total é razão dos totais, não média da série.

## 7. Integração e referências pontuais

HTTP REST/JSON sob /api, camelCase, IDs opacos; sem WebSocket/streaming. Datas YYYY-MM-DD, meses YYYY-MM, instantes ISO 8601 com deslocamento, durações em segundos. Contexto temporal da resposta usa um instante único; não permite simular livremente o passado. GET não avança fluxo, gera mensagens, refaz busca funcional ou renova atividade.

### Contratos por tarefa

- Painel: [API §3–4](completo/kenko-backend-api.md#3-endpoints), endpoint/exemplo da página. Clínica: GET /api/clinic; Home: GET /api/dashboard?month=YYYY-MM; Calendário: GET /api/calendar?startDate=YYYY-MM-DD&endDateExclusive=YYYY-MM-DD (ambos obrigatórios, início anterior ao fim); Dia: GET /api/calendar/days/{date}; Analytics: GET /api/analytics?period=week|month|year&reference=..., referência YYYY-MM-DD / YYYY-MM / YYYY. Sem endpoint por cartão ou consulta arbitrária.
- Conversas: [API §3.7](completo/kenko-backend-api.md#37-conversas-e-agendamentos), GET /api/conversations?ids=... (obrigatório, até 50/chamada; dividir listas maiores; inexistentes podem ser omitidas) e GET /api/conversations/{id}/appointments (todas as reservas da origem). IDs conhecidos não são autenticação; backend valida vínculo.
- Bot: [§4–6](completo/kenko-bot-api.md#4-contrato-de-interação), POST /api/conversations, GET /api/conversations/{id} e POST /api/conversations/{id}/interactions. Consultar §8–10 somente para validação, repetição, concorrência e término.

Os fixtures e cenários disponíveis estão no README dos mocks. Para integrar, usar contratos completos; tipos derivados de constantes visuais não definem tipos da API.

### Controles, histórico e repetição

Renderizar view fornecida: opções, horários, formulário, reservas, informações ou encerrada; não interpretar HTML ou linguagem arbitrária de telas. Enviar opções/horários do contexto atual, sem fixar IDs/roteiro no cliente. Sair é ação global; elegibilidade de cancelamento recebida é revalidada na escrita.

Frontend registra entradas do usuário na transcrição local e acrescenta mensagens do bot recebidas, distinguindo autor/horário. Guarda também IDs conhecidos e itens ocultos. Reabrir usa transcrição local mais GET do estado; GET não reconstrói texto apagado e pode reexibir oferta que já ficou indisponível.

Cada ação nova usa actionId novo e expectedRevision do último estado. Reenvio mantém ID, conteúdo e revisão originais, sem duplicar reserva, busca, bolha, avanço ou atividade. Mesma chave/conteúdo diferente é conflito. Evitar duplicação de mensagens por ID; preservar a maior revisão conhecida e recuperar estado por GET quando necessário. Revisão não substitui estado efetivo.

Repetir criação após falha usa o contato da mesma intenção; nova intenção de Nova Conversa usa outro. Falha de rede não prova sucesso/insucesso de reserva. Não há política de tentativas automáticas ou periodicidade de atualização obrigatória.

### Erros e estados vazios

200 inclui leitura/interação e coleção vazia; 201 cria conversa. 400 indica requisição/data/parâmetro malformado, não ausência de negócio; 404 indica recurso inexistente ou reserva de outra origem; 422 indica entrada inválida, sem avançar etapa ou criar busca/reserva.

409 por revisão antiga (STALE_CONVERSATION_STATE) exige GET; por indisponibilidade, mostrar conflito e nova oferta, sem descartar view de recuperação retornada; por encerramento/abandono (CONVERSATION_ABANDONED), impedir continuação e permitir novo atendimento; por reserva inelegível, não mostrar cancelamento concluído. Layout de erro/carregamento e responsividade são decisões de apresentação, sem criar funcionalidades.

## 8. Verificação e rastreabilidade

Selecione os critérios afetados, sem transformar toda tarefa em teste integral do sistema. Verificações de banco, concorrência e queries são de integração; não atribuem implementação do backend ao frontend. As skills definem execução e distribuição dos checks.

| ID | Cenário | Resultado verificável |
| --- | --- | --- |
| VAL-01 | Criar duas conversas. | Contatos distintos, conversas independentes, sem desistência global automática. |
| VAL-02 | Iniciar atendimento. | Animação e boas-vindas/menu automáticos, sem primeiro texto do paciente. |
| VAL-03 | Fazer triagem. | Duas perguntas definidas; nenhuma pergunta extra de rotina/avaliação. |
| VAL-04 | Buscar com capacidade suficiente. | Dois horários em dias distintos da semana atual e o mais próximo da seguinte, em ordem. |
| VAL-05 | Confirmar reserva. | Registro no banco com origem, paciente e horário; confirmação; retorno ao menu. |
| VAL-06 | Agendar novamente. | Mesmo paciente da conversa; fatos anteriores preservados. |
| VAL-07 | Disputar horário. | Só uma reserva não cancelada; outra tentativa recusada com nova oferta. |
| VAL-08 | Acessar reserva de outra conversa. | Backend não aceita por igualdade de nome ou mera referência enviada pela interface. |
| VAL-09 | Cancelar reserva elegível. | Registro preservado, horário liberado, resultado informado e menu reapresentado. |
| VAL-10 | Sair após confirmar. | Encerramento imediato com mensagem de adeus, sem cancelar reserva nem apagar confirmação. |
| VAL-11 | Buscar sem horário duas vezes. | Duas ocorrências; convite para continuar; uma conversa em Viram horários. |
| VAL-12 | Inatividade maior que uma hora. | Abandono calculado sem gravar estado; respostas/etapas preservadas. |
| VAL-13 | Retornar após abandono. | Nova conversa do zero; nenhuma reabertura da antiga. |
| VAL-14 | Ocultar conversa. | Retirada da lista sem apagar dados, cancelar reservas ou alterar métricas. |
| VAL-15 | Limpar histórico local. | Persistência de negócio e evidências analíticas preservadas. |
| VAL-16 | Consultar cancelada após a data. | Continua cancelada, não completa. |
| VAL-17 | Revisar completas. | Consulta não cancelada fica completa no instante de término, pelo relógio de Brasília, sem indicador de faltas. |
| VAL-18 | Comparar calendário, Dia e salas. | Totais iguais por data, incluindo canceladas. |
| VAL-19 | Conferir ocupação. | Contagem de horários com reservas não canceladas sobre capacidade; não minutos ou total histórico de reservas. |
| VAL-20 | Conferir duração. | Uma duração por conversa até a primeira confirmação; confirmações aos dois e cinco minutos contribuem apenas com dois minutos. KPI usa mediana, não tempo até Sair. |
| VAL-21 | Iniciar fora do expediente. | Atendimento permitido; conversa conta no percentual e no mapa de 24h. |
| VAL-22 | Filtrar Analytics. | Semana/mês/ano afetam indicadores e série diária/semanal/mensal. |
| VAL-23 | Abrir Home/Calendário. | Home com filtro apenas mensal; calendário mensal, hoje destacado, dias externos esmaecidos. |
| VAL-24 | Ver consulta futura em outro dia. | Incluída nas cinco próximas com data, paciente, especialidade, médico, horário e sala. |
| VAL-25 | Acessar a demonstração. | Sem login; painel de leitura e Showcase separado. |
| VAL-26 | Reproduzir indicador. | Mesmo banco, filtros e referência temporal explicam o resultado, sem hardcoding. |
| VAL-27 | Somar buscas por especialidade. | Soma igual ao KPI no mesmo recorte. |
| VAL-28 | Funil e conclusão com várias reservas na mesma conversa. | Uma conversa por marco; numerador da conclusão conta essa conversa uma vez, e a taxa não ultrapassa 100%. |
| VAL-29 | Informar os mesmos dados em outra conversa. | Novo contato e novo paciente; nenhum cadastro ou agendamento anterior é reaproveitado. |
| VAL-30 | Tentar cancelar consulta completa. | Operação recusada pelo backend, sem alterar reserva ou liberar horário por cancelamento. |
| VAL-31 | Encontrar menos de três opções na distribuição semanal. | Mostra somente as disponíveis, sem completar fora da distribuição nem contar resultado parcial como busca sem horário. |
| VAL-32 | Sair ou abandonar no menu após tarefa. | Término preservado, sem inclusão nas quatro barras de perdas durante o agendamento; Sair envia adeus imediatamente. |
| VAL-33 | Conversa iniciada em outubro confirma em novembro. | Conversa, resultado, marcos e duração permanecem no grupo de outubro; busca sem horário conta no instante da busca e consulta médica na data marcada. |
| VAL-34 | Iniciar exatamente na abertura/fechamento. | 07h dentro e 18h fora nos dias úteis; 09h dentro e 13h fora no sábado, usando America/Sao_Paulo. |
| VAL-35 | Conferir série e média móvel. | Blocos mensais pelas datas definidas; média dos três últimos pontos calculáveis dentro da janela, sem converter ausência de base em zero. |
| VAL-36 | Conferir histograma/P90. | Duração de dez minutos entra em “10+”, não na barra 10; com dez amostras, P90 é a nona menor duração. |
| VAL-37 | Conferir ausência de dados e arredondamento. | Contagens vazias são zero; estatísticas sem base são “—”; percentuais exibidos com uma casa decimal, sem arredondar antes do cálculo. |
| VAL-38 | Exibir calendário com cinco ou seis linhas. | Frontend envia o intervalo visível; API retorna contagens sem determinar o layout ou devolver limites de grade. |
| VAL-39 | Recarregar chat ou dashboards por GET. | Nenhum avanço, nova busca, mensagem ou renovação de atividade; abandono continua ocorrendo. |
| VAL-40 | Reenviar uma interação após falha de rede. | Mesma actionId não duplica reserva ou busca; ação com revisão antiga não avança estado indevidamente. |
| VAL-41 | Concluir primeira e segunda reservas. | Primeira confirma no envio válido dos dados; seguinte confirma na seleção válida com o paciente da conversa, sem tela extra. |
| VAL-42 | Verificar limites de Analytics. | Resposta contém apenas indicadores aprovados e contexto útil, sem registros pessoais, transcrições ou consulta arbitrária. |
