# Kenko — Escopo V2 dedicado ao frontend

## 1. Propósito, autoridade e consulta

Este documento consolida o contexto funcional necessário para planejar, desenvolver e revisar **exclusivamente o frontend** da aplicação acadêmica Kenko. É uma referência independente de requisitos e comportamentos, não um plano de implementação. Não modifica o escopo V2 nem introduz funcionalidades ou decisões arquiteturais.

O Kenko oferece atendimento automatizado por menus: o visitante realiza uma triagem simplificada, consulta horários e agenda consultas no Showcase. Home, Calendário, Dia e Analytics apresentam a agenda e os indicadores. O bot é determinístico, executado no backend, sem inteligência artificial ou interpretação livre de mensagens. A demonstração é aberta, sem login.

Os dados podem ser fictícios, mas as operações são reais: disponibilidade, confirmação, cancelamento e indicadores usam os registros da aplicação. O frontend apresenta resultados e envia escolhas; não substitui o bot nem o banco.

### 1.1 Fontes e precedência

| Referência | Papel |
| --- | --- |
| [Escopo V2 original](./completo/escopo-kenko-v2.md) | Autoridade para funcionalidades, regras, telas, métricas e limites. Preservado sem edição. |
| [Complemento da API](./completo/kenko-backend-api.md) | Decisões já aprovadas de comunicação, parâmetros e consumo de dados, incorporadas aqui somente quando afetam o frontend. |
| [Complemento do bot](./completo/kenko-bot-api.md) | Decisões já aprovadas sobre interações, estado, validação, repetição e recuperação, consolidadas neste documento. |
| [Mocks do projeto](../../mocks/README.md) | Referência dos formatos de resposta e exemplos disponíveis. Os payloads não são repetidos neste documento. |
| [Referências visuais](../public/assets/) | Estrutura visual e tipos de informação; números, datas, textos de preenchimento e proporções ilustrativas não são resultados obrigatórios. |

As regras funcionais prevalecem sobre comportamentos apenas ilustrados. Os mocks não transformam valores de exemplo em requisitos nem substituem a origem real dos dados. O README dos mocks registra reduções feitas para reproduzir os designs; ausência de um campo ou cenário nesses exemplos não revoga regras de integração, estado ou negócio preservadas aqui.

Os identificadores originais `RF`, `RN`, `TELA`, `DAD`, `MET` e `VAL` são mantidos para rastreabilidade. Menções ao backend descrevem dependências observáveis do frontend, não tarefas de implementação dessa camada.

### 1.2 Mapa de consulta

| Necessidade | Seções |
| --- | --- |
| Entender o produto e seus limites | 1–3 |
| Implementar interações e estados do Showcase | 4–5 e 8 |
| Entender conteúdo, filtros e navegação de cada página | 6 |
| Entender os dados e sua autoridade | 3 e 7 |
| Consultar integração e localizar os mocks | 8 e 10 |
| Interpretar e apresentar indicadores | 9 |
| Planejar verificações e revisar fidelidade ao escopo | 11 |
| Distinguir requisitos de decisões abertas | 12 |
| Resolver terminologia | 13 |

### 1.3 Objetivos funcionais preservados

- **OBJ-01:** permitir agendamentos pelo bot.
- **OBJ-02:** demonstrar integração efetiva entre interface, bot no backend, API própria e banco.
- **OBJ-03:** representar a agenda por período, dia e sala com consistência entre telas.
- **OBJ-04:** apresentar atendimento, conversão e demanda com dados do banco, sem indicadores fixos.
- **OBJ-05:** permitir conversas independentes e várias operações na mesma conversa para o mesmo paciente.

## 2. Limites e participantes

### 2.1 Dentro do escopo

- Bot no backend, com perguntas, opções, textos e transições no banco.
- Showcase que inicia automaticamente o atendimento e permite criar conversas.
- Triagem com duas perguntas: especialidade e primeira consulta/retorno nessa especialidade.
- Oferta e escolha de horários previamente cadastrados, com distribuição semanal definida.
- Identificação do paciente ao final do caminho de agendamento, com nome e nascimento.
- Confirmação de reserva com proteção contra concorrência.
- Consulta e cancelamento apenas dos agendamentos feitos na conversa atual.
- Informações da clínica lidas do banco.
- Retorno ao menu após tarefas, saída voluntária e abandono após uma hora calculado por query.
- Home, Calendário, Dia e Analytics com dados reproduzíveis a partir do banco.
- Histórico textual em `localStorage` e ação de ocultar conversas da lista.
- Consumo de dados de demonstração previamente inseridos no banco; não há interface de preparação desses dados.

### 2.2 Fora do escopo

- WhatsApp, canais externos e sistema externo de agendamento.
- Inteligência artificial, compreensão livre de linguagem e geração livre de respostas.
- Login de paciente ou do painel: a demonstração inteira é aberta.
- Gerente e médico como usuários com fluxos próprios.
- Cadastro de disponibilidade por médico, aprovação ou recusa de horários por profissionais.
- Telas ou endpoints de gestão de médicos, salas, especialidades, horários e demais dados auxiliares.
- Vários pacientes na mesma conversa.
- Controle de presença, prontuário e contabilização de faltas.
- Criar, editar ou remarcar agendamentos diretamente no painel.
- Tela adicional de detalhe de consulta, deduzida apenas dos ícones dos protótipos.
- Retomada de conversa abandonada e exclusão de dados de negócio pela lista de conversas.

### 2.3 Participantes e conceitos

| Participante/conceito  | Responsabilidade                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Visitante              | Opera o Showcase, cria conversas e consulta o painel aberto.                                                          |
| Contato simulado       | Identificador/número gerado no frontend para cada Nova Conversa, desde o início do atendimento.                       |
| Paciente               | Pessoa para quem as consultas são marcadas, com nome e nascimento. Quem opera pode estar agendando para outra pessoa. |
| Bot                    | Conduz o fluxo no backend, lê o roteiro e registra interações e resultados.                                           |
| Módulo de agendamento  | Consulta disponibilidade, confirma e cancela reservas no banco próprio.                                               |

O número gerado não exige telefone real. Nome é um atributo simples, não único: não identifica sozinho um paciente nem autoriza localizar reservas de outras conversas. Cada paciente pertence a exatamente um contato. Uma nova conversa gera um novo contato e, quando ocorrer a identificação, um novo cadastro de paciente, mesmo que nome e nascimento coincidam com registros anteriores. Não há reaproveitamento de pacientes entre conversas. Antes da identificação, o contato e a conversa existem sem cadastro de paciente.

## 3. Responsabilidades e origem dos dados

### 3.1 Fronteira do frontend

| Responsabilidade do frontend | Autoridade consumida |
| --- | --- |
| Apresentar páginas, navegação, filtros, dados e indicadores. | API fornece leituras e agregações derivadas do banco. |
| Gerar contato simulado para Nova Conversa. | Backend inicia a conversa e impede duplicação de atendimento ativo por contato. |
| Exibir digitação, mensagens, controles e resultados; enviar opções e dados solicitados. | Backend conduz o roteiro, valida o passo e executa operações. |
| Guardar transcrição, IDs de conversas conhecidas e itens ocultos no navegador. | API fornece estado efetivo e instantes reais; transcrição não determina validade das ações. |
| Mostrar confirmação/cancelamento somente conforme o resultado real. | Backend revalida disponibilidade, vínculo da reserva, paciente e estado da conversa. |
| Interpretar e formatar indicadores conforme a seção 9. | Banco e API são a fonte dos cálculos; contadores locais não substituem agregações. |

A comunicação aprovada é HTTP REST com JSON, por requisição/resposta comum, sem WebSocket ou streaming. O painel consome agregados por tela. O bot recebe ações em um endpoint de interações e devolve a interface atual; o frontend não decide sozinho as transições.

GETs são somente leitura: não avançam etapas, executam novas buscas funcionais, registram mensagens ou renovam a atividade da conversa. “Bot digitando...” é animação local e não altera o estado.


### 3.2 Persistência

**RN-01 — Dados de negócio no banco.** Toda informação de negócio exibida no frontend é derivada do banco, inclusive dashboards, analytics, disponibilidade e informações da clínica. As métricas são calculadas por queries. Não usar valores fixos, números aleatórios ou contadores mantidos exclusivamente no navegador.

Dados fictícios podem ser inseridos no banco. Depois de inseridos, obedecem às mesmas relações e regras dos dados produzidos durante a demonstração. Não é necessário reproduzir as contagens das imagens.

**RN-02 — Histórico textual local.** A transcrição do Showcase fica em `localStorage`. O banco não guarda a transcrição das mensagens trocadas. Essa exceção não transfere ao navegador a autoridade sobre estado, disponibilidade, reservas ou analytics.

O banco mantém fatos estruturados: autor e instante das interações, respostas, etapas alcançadas, buscas e resultados. Nome e nascimento são dados estruturados do paciente. Apagar o histórico local não apaga esses registros. Não há requisito de sincronizar a transcrição entre dispositivos.

**RN-03 — Roteiro fixo no banco.** Perguntas, opções, textos do bot e destinos dos passos ficam em tabelas previamente preenchidas. O roteiro não será alterado durante o uso da aplicação. Não haverá editor, versionamento ou tratamento de mudanças de perguntas em conversas em andamento. Esse conteúdo é distinto da transcrição de uma conversa.

Logotipo, estilos e rótulos comuns de interface não são indicadores de negócio. O conteúdo do roteiro e as informações apresentadas como dados da clínica seguem as regras de persistência.

## 4. Regras de negócio

### 4.1 Conversas e identidade

| ID | Regra |
| --- | --- |
| RN-04 | Nova Conversa cria um contato simulado novo e uma conversa independente; não encerra automaticamente as anteriores. |
| RN-05 | Há no máximo uma conversa efetivamente ativa por contato. Interações simultâneas do mesmo contato não criam atendimentos duplicados. |
| RN-06 | Cada conversa atende no máximo um paciente, vinculado exclusivamente ao contato dessa conversa. Nova conversa não reaproveita cadastro de paciente. Para outra pessoa, deve ser oferecida nova conversa. |
| RN-07 | O bot envia automaticamente a primeira mensagem e o menu. O paciente navega por opções; não precisa digitar um “oi”. |
| RN-08 | Nome e nascimento são solicitados depois da triagem e da escolha de horário. São entradas estruturadas, não conversa livre interpretada pelo bot. |
| RN-09 | Nome não é único. Consultar/cancelar utiliza os vínculos com a conversa atual, sem busca global de paciente por nome. |
| RN-10 | Concluir uma tarefa não encerra a conversa. O bot retorna ao menu para novas operações. |
| RN-11 | Sair encerra imediatamente a conversa e o bot envia uma mensagem de adeus, sem esperar outra resposta. A outra forma de término é abandono após uma hora de inatividade. |
| RN-12 | Respostas, resultados, confirmações e cancelamentos são preservados apesar do retorno ao menu. |

Uma conversa pode originar vários agendamentos do mesmo paciente; a relação conversa/agendamento não é de um para um. As reservas posteriores dessa conversa continuam vinculadas ao paciente identificado nela. Em uma nova conversa, cria-se um novo paciente quando seus dados forem solicitados, sem procurar ou reaproveitar cadastros anteriores.

Confirmação de agendamento é resultado de tarefa. Encerramento da conversa é ciclo de vida. Esses conceitos não devem compartilhar um único marcador que elimine a distinção.

### 4.2 Triagem

**RF-01 — Duas perguntas:**

1. Especialidade procurada.
2. Primeira consulta ou retorno nessa especialidade.

Não há terceira pergunta de rotina, avaliação ou outro tipo. As respostas devem ser preservadas por tentativa, inclusive se a mesma conversa iniciar outro agendamento.

Os designs representam Clínico geral, Dermatologia, Ortopedia e Cardiologia. As opções oferecidas vêm do banco; não se exige outra taxonomia de “tipo de consulta”. Não foi estabelecida mudança de duração ou oferta em função de primeira consulta/retorno.

### 4.3 Horários e reservas

| ID | Regra |
| --- | --- |
| RN-13 | Cada horário tem início e fim próprios, médico e sala previamente definidos. Não há duração global fixa. |
| RN-14 | Cada médico tem uma especialidade; uma especialidade pode ter vários médicos. |
| RN-15 | Dados auxiliares são cadastrados por queries, sem gestão pela aplicação. |
| RN-16 | Horário com reserva não cancelada não é ofertado novamente. Visualizá-lo não garante disponibilidade até confirmar. |
| RN-17 | Banco e operação de confirmação impedem duas reservas não canceladas para o mesmo horário. Em conflito, a segunda tentativa é recusada e o bot oferece novas opções. |
| RN-18 | Somente consultas pendentes da conversa atual podem ser canceladas. Consultas completas não podem ser canceladas; canceladas permanecem como histórico. Cancelar preserva o registro e libera o horário quando ainda puder ser apresentado para nova reserva. |
| RN-19 | Horários reservados não são apagados: continuam compondo a capacidade total. |
| RN-20 | O bot só apresenta confirmação depois da reserva efetivamente persistida. |
| RN-21 | Sem disponibilidade, registra a busca, informa o resultado e pergunta se o paciente quer continuar; não encerra automaticamente. |

**RF-02 — Apresentação de até três horários.** Mostrar até dois horários da semana atual em dias diferentes e até um da próxima semana, o mais próximo disponível dessa semana, em ordem cronológica. Todos devem ser livres, futuros e compatíveis com a especialidade.

Para selecionar horários, a semana vai de domingo a sábado, no fuso `America/Sao_Paulo`. A próxima semana começa no domingo seguinte. Os blocos do gráfico mensal têm agrupamento próprio, definido na seção 9.9.

A seleção respeita semanas e dias. Se não houver disponibilidade para completar as três opções, mostrar menos, sem preencher as posições faltantes com outros dias/períodos que violem essa distribuição. Ausência total aplica RN-21; apresentar uma ou duas opções não conta como busca sem horário. Não há prioridade de negócio adicional entre opções igualmente elegíveis; sua ordenação estável é detalhe de implementação. “Oferta de horários” significa apenas apresentar opções de agendamento, sem preços, descontos ou promoções.

### 4.4 Status e contagens

**RN-22 — Status derivado, nesta ordem:**

1. **Cancelada:** houve cancelamento.
2. **Completa:** não cancelada e o instante atual é igual ou posterior ao fim do horário da consulta.
3. **Pendente:** demais casos.

Cancelamento prevalece sobre passagem do tempo. Completa não comprova comparecimento. **Falta não é registrada nem contabilizada.** Não existe ação de marcar presença, falta ou conclusão manual. Uma consulta das 10h às 10h30 torna-se completa às 10h30, se não cancelada. Todas as datas, comparações temporais e apresentações usam o horário de Brasília (`America/Sao_Paulo`), independentemente do fuso do servidor.

**RN-23 — Contagens incluem canceladas.** Totais, calendário, rankings de dia/hora/sala, distribuições e tabela por sala incluem canceladas. Ocupação usa somente reservas não canceladas e é uma métrica diferente.

## 5. Fluxos e ciclo de vida

### 5.1 RF-03 — Nova conversa

1. Visitante aciona Nova Conversa.
2. Frontend gera contato e sistema inicia a conversa.
3. Interface apresenta animação estilizada como “Bot digitando...”.
4. Backend fornece boas-vindas e menu, sem esperar texto do paciente.
5. Escolhas são enviadas ao backend e registradas.

Menu inicial: Agendar uma consulta; Ver informações da clínica; Ver ou cancelar um agendamento; Sair.

A animação é apresentação, não mensagem do paciente nem uso de IA. O início da conversa é registrado para duração, abandono e mapa de calor.

### 5.2 RF-04 — Agendar

1. Escolher Agendar, qualificando a conversa para o funil.
2. Responder especialidade e primeira consulta/retorno.
3. Consultar horários conforme RF-02 e registrar o resultado.
4. Escolher um horário.
5. Informar nome e nascimento quando necessária a identificação do paciente.
6. Na primeira identificação, criar um paciente exclusivo do contato dessa conversa; nas reservas seguintes da mesma conversa, usar esse vínculo. Não buscar pacientes de outras conversas.
7. Revalidar disponibilidade e criar o agendamento.
8. Apresentar confirmação e preservar seu instante e resultado.
9. Retornar ao menu para novas operações.

Na primeira reserva, o envio válido de nome e nascimento conclui o agendamento após a revalidação e persistência; não há tela adicional de confirmação. Nas reservas seguintes da mesma conversa, a seleção válida do horário confirma usando o paciente já identificado, sem solicitar novamente seus dados. A etapa técnica de confirmação pode ser breve e sem espera interativa; a existência de sua barra em Analytics não exige criar uma tela nova.

Uma segunda tentativa não apaga respostas, busca ou confirmação da primeira. O roteiro permanece fixo, e os resultados de cada tentativa são preservados.

### 5.3 RF-05 — Concorrência

Duas conversas podem visualizar o mesmo horário, mas somente uma confirmação o reserva. A segunda recebe recusa e nova consulta de disponibilidade. A integridade não pode depender apenas de um botão desabilitado no frontend.

Se a nova busca não tiver resultados, aplicar RF-06; se não permitir a distribuição semanal completa, mostrar menos opções conforme RF-02.

### 5.4 RF-06 — Busca sem horário

Registrar ocorrência com conversa, especialidade e momento; informar ausência; perguntar se deseja continuar. Continuar permite voltar ao menu; Sair encerra; inatividade aplica abandono.

Cada busca efetivamente realizada sem resultado conta uma ocorrência, inclusive repetições na mesma conversa e especialidade. Reexibir o mesmo resultado não é nova busca.

Para o funil, a busca sem resultado **conta em Viram horários**. Deve permanecer distinguível da busca com opções para sustentar o indicador próprio de indisponibilidade.

### 5.5 RF-07 — Consultar/cancelar

O bot acessa apenas os agendamentos feitos durante a conversa atual. O vínculo de origem é obrigatório. Não há pesquisa global por nome, nascimento ou contato anterior.

Havendo várias reservas, deve ser possível identificar a reserva à qual a operação se refere. Cancelar registra o fato, preserva o agendamento, libera o horário, informa o resultado e retorna ao menu.

Uma nova conversa não acessa reservas anteriores por igualdade de nome e não reaproveita o paciente anterior. Não criar recuperação de reservas antigas. Consultas completas não podem ser canceladas; a operação só aceita consultas pendentes da conversa atual. A consulta do histórico não transforma uma reserva completa ou cancelada em cancelável.

### 5.6 RF-08 — Informações da clínica

Ler do banco nome, endereço, telefone, expediente e especialidades atendidas. Após apresentar, retornar ao menu.

Expediente: **segunda a sexta, 07h–18h; sábado, 09h–13h; domingo fechado**. Pode estar na entidade clínica ou em estrutura vinculada a ela.

O instante de abertura está dentro do expediente, e o de fechamento está fora: nos dias úteis, 07h está dentro e 18h está fora; no sábado, 09h está dentro e 13h está fora. A classificação usa `America/Sao_Paulo`.

Nome, endereço e telefone fictícios são preenchidos na preparação do banco, não hardcoded na interface. O bot pode ser usado fora do expediente; essa informação não bloqueia atendimento.

### 5.7 RF-09 — Sair

Sair está disponível durante o fluxo e encerra imediatamente a conversa, com motivo, instante e etapa. O bot envia uma mensagem de adeus; essa mensagem não reabre o fluxo nem exige resposta. Antes da confirmação, Sair interrompe a tentativa sem criar reserva. Depois dela, não cancela automaticamente o agendamento nem apaga o sucesso anterior.

### 5.8 RF-10 — Abandono e retorno

Conversa não encerrada cuja última interação ultrapasse uma hora de inatividade é tratada como abandonada por query. **Abandono não é estado persistido e não exige rotina periódica de atualização.**

Persistem-se início, interações, passos, respostas e eventual encerramento explícito. Leituras, analytics e validação de ações aplicam a mesma regra de estado efetivo.

Não há retomada. Ao retornar após abandono, inicia-se nova conversa do zero. A antiga não é reaberta e seus registros permanecem para análises. Ignorá-la no fluxo não significa excluí-la das métricas.

### 5.9 Estados efetivos e resultados

| Situação | Representação funcional |
| --- | --- |
| Em andamento | Sem encerramento explícito e dentro do limite de inatividade. |
| Encerrada por Sair | Encerramento imediato persistido, com motivo, instante e etapa; bot envia adeus. |
| Abandonada | Condição calculada: sem encerramento explícito e inatividade superior a uma hora. |
| Agendamento confirmado/cancelado | Resultado de tarefa persistido, sem encerrar conversa. |
| Informações consultadas | Tarefa concluída, seguida de menu. |
| Busca sem horário | Evento analítico, seguido de convite para continuar. |
| Conversa oculta | Retirada da lista visual, sem término ou exclusão dos dados. |

Para términos, recupera-se a etapa em que a conversa estava ao sair ou ultrapassar o limite. Não é necessário guardar um marcador específico de abandono.

## 6. Telas, navegação e filtros

### 6.1 Elementos comuns

Painel aberto e somente leitura, com navegação Home, Analytics e Calendário. Dia pertence à área Calendário. Showcase é rota separada. O ícone de saída pode ser removido ou levar ao Showcase, sem logout.

Links exigidos: dia do Calendário → página Dia; Melhor Dia → página Dia correspondente; indicador de duração da Home → Analytics. Os demais ícones de link sem destino são removidos; não justificam novas telas.

### 6.2 TELA-01 — Home

**RF-11 — Resumo mensal.** A Home tem filtro próprio, semelhante ao de Analytics, mas permite selecionar apenas o mês de referência, identificado por mês e ano. Os indicadores mensais seguem essa seleção. Analytics mantém os modos semana, mês e ano. Próximas Consultas continua sendo a lista futura a partir de agora, independentemente do mês histórico selecionado.

| Elemento | Conteúdo |
| --- | --- |
| Período/saudação | Mês e ano; identificação da clínica conforme os dados aplicáveis. |
| Status | Completas, pendentes e canceladas no período. |
| Melhor Dia | Data com mais consultas e quantidade, incluindo canceladas. |
| Hora de pico | Hora de maior contagem, total e diferença acima da média dos outros horários. |
| Melhor sala | Sala com mais consultas e quantidade, incluindo canceladas. |
| Duração do atendimento | Mediana, com variação temporal; não média aritmética. |
| Próximas Consultas | Até cinco pendentes futuras, ordenadas cronologicamente, em qualquer dia. |

Próximas consultas mostram horário, sala, paciente, especialidade e médico; mostram data quando não forem hoje. Partem de agora, sem se limitar ao mês histórico dos outros cartões.

O rótulo da duração deve comunicar mediana, por exemplo “Tempo mediano de atendimento”. O título antigo do protótipo não altera a estatística escolhida.

### 6.3 TELA-02 — Calendário

**RF-12 — Agenda mensal.** Grade de domingo a sábado, com data e total de consultas. Segue o mês selecionado, sem modos semana/ano de Analytics.

O frontend determina as datas visíveis da grade, inclusive dias de meses adjacentes, e chama `GET /api/calendar?startDate=YYYY-MM-DD&endDateExclusive=YYYY-MM-DD`. O início é incluído e o fim excluído. Exemplo: grade de 27/09 a 31/10 envia 27/09 e 01/11. O backend retorna contagens por data, sem determinar cinco/seis linhas nem devolver `gridStart`/`gridEndExclusive`. Datas ausentes do mapa de contagens representam zero conforme o contrato. O mês continua sendo o filtro visual; os parâmetros da API são o intervalo desenhado pelo frontend.

Hoje aparece destacado; somente dias fora do mês exibido ficam esmaecidos. Dias futuros do próprio mês não são esmaecidos apenas por serem futuros. Dias adjacentes representam suas datas reais. Selecionar uma data abre Dia.

O total da célula coincide com o total da página Dia e inclui canceladas.

### 6.4 TELA-03 — Dia

**RF-13 — Detalhamento da data.** Sem filtro próprio, apresenta total, canceladas, completas, pendentes, taxa de completude, consultas por hora, resumo manhã/tarde e tabela por sala com consultas, canceladas entre parênteses, ocupação e pico.

O corte manhã/tarde é **12h**. Contagens incluem canceladas; ocupação exclui reservas canceladas. O eixo ilustrativo de 9h a 20h não define o expediente nem autoriza omitir horários cadastrados, como os das 7h nos dias úteis.

### 6.5 TELA-04 — Analytics

**RF-14 — Análise temporal.** Possui filtro completo de **semana, mês e ano**, governando indicadores e visualizações:

- Conclusão do Bot, mediana de duração, conversas iniciadas fora do expediente, ocupação e buscas sem horário.
- Funil de conversão e términos por desistência/abandono.
- Histograma de duração com mediana e P90.
- Mapa de calor dos inícios de conversas.
- Série temporal de conclusão com média móvel.
- Buscas sem horário por especialidade.

O indicador ilustrado como “Mensagens Fora do Expediente” mede **conversas iniciadas fora do expediente**, não mensagens. Rótulo ou descrição deve explicitar a unidade correta.

Todos os KPIs e gráficos desta tela são atendidos por `GET /api/analytics?period=week|month|year&reference=...`, com parâmetros na seção 8 e exemplos nos mocks indicados na seção 10. O endpoint não recebe SQL, agrupamentos ou indicadores arbitrários; não expõe pacientes individuais, transcrições, exportações ou novas telas de detalhamento. Os dados da resposta compartilham o mesmo período e instante de avaliação.

### 6.6 TELA-05 — Showcase

**RF-15 — Demonstração funcional.** Apresenta logotipo, descrição, Nova Conversa, lista de conversas do visitante e chat. A lista mostra tempo desde a última interação; mensagens distinguem bot/paciente e mostram horário.

Primeira mensagem e menu são automáticos, com animação de digitação. Navegação por botões; nome e nascimento são coletados quando solicitados. Não é exigido texto livre para iniciar.

O menu de três pontos oferece **Ocultar conversa**, retirando o item da lista sem excluir dados, alterar analytics ou cancelar reservas. Não foi solicitada tela de recuperação de itens ocultos ou exclusão definitiva.

Texto do histórico permanece no navegador. Estado efetivo e validade das ações vêm do backend. Abrir item abandonado não permite retomada. Agendamentos feitos aqui pertencem ao mesmo banco do painel e aparecem nas leituras correspondentes.

### 6.7 Complementos de consumo por página

- **Home:** rankings sem consultas podem ser ausentes (`null`), sem inventar melhor dia, hora ou sala. Uma consulta em andamento pode ser pendente, mas não entra em Próximas Consultas: a lista exige início futuro.
- **Dia:** apresentar também salas cadastradas sem consultas. Sem capacidade na data, ocupação não tem base e aparece como “—”. A resposta não oferece nomes de pacientes por sala nem autoriza uma tela de detalhe.
- **Analytics:** o mapa de calor cobre os sete dias e as doze faixas, incluindo células com zero. Os filtros não incluem paciente, médico ou sala; não há exportação, exploração de pessoas por barra ou construtor de relatórios.
- **Showcase:** a lista é delimitada às conversas conhecidas pelo navegador. Abrir a lista de reservas de uma conversa sem agendamentos apresenta coleção vazia e permite voltar ao menu. Reservas completas e canceladas são consultáveis, mas não canceláveis.

## 7. Dados e relações relevantes à interface

Esta seção descreve conceitos consumidos pelo frontend, sem definir schema de banco ou repetir formatos dos mocks.

| IDs originais | Conceito | Contexto necessário ao frontend |
| --- | --- | --- |
| DAD-01–02 | Clínica e expediente | Nome, endereço, telefone, especialidades e expediente; identificação da clínica, informações no bot e interpretação de horários. Há uma clínica na demonstração, sem seletor de clínicas. |
| DAD-03 | Especialidade | Identificação e nome; opções de triagem, disponibilidade, próximas consultas e buscas sem horário. |
| DAD-04 | Médico | Identificação e nome; cada médico tem uma especialidade. Médico é vinculado ao horário, sem seleção separada no bot. |
| DAD-05 | Sala | Identificação e número/nome; horários, cartões, próximas consultas e tabela do Dia. |
| DAD-06 | Horário | Identificação, início, fim, médico e sala. Unidade de oferta e capacidade, sem duração global fixa. |
| DAD-07–08 | Roteiro e opções | Perguntas, textos, rótulos e escolhas vêm do backend. Não existe editor nem versionamento do roteiro no frontend. |
| DAD-09 | Contato simulado | Gerado para cada nova conversa; não exige telefone real e não é login. |
| DAD-10 | Paciente | Nome não único e nascimento. Identificado após a escolha do horário e exclusivo da conversa/contato. Não exige CPF, e-mail ou senha. |
| DAD-11 | Conversa | Identificação, início, última interação, estado efetivo e passo atual. Pode conter várias tarefas e reservas, para um único paciente. |
| DAD-12–14 | Respostas, interações e tentativas | Fatos mantidos pelo backend para reconstruir o fluxo e os indicadores. Não são inferidos das bolhas do chat nem do passo atual isolado. |
| DAD-15 | Agendamento | Reserva com paciente, horário, origem na conversa, confirmação e eventual cancelamento. Status derivado e elegibilidade de cancelamento vêm das regras/API. |
| DAD-16 | Busca sem horário | Cada ocorrência tem especialidade e instante próprios; reexibir resultado não cria uma ocorrência. |

Um horário pode ter várias reservas canceladas históricas, mas no máximo uma não cancelada. Total histórico de reservas e ocupação não são intercambiáveis. Nome e nascimento iguais em conversas diferentes não permitem mesclar pacientes ou acessar reservas antigas.

Retornar ao menu, iniciar outra tentativa, encerrar, abandonar, ocultar ou apagar transcrição local não elimina os fatos anteriores. A origem da reserva continua obrigatória mesmo que o frontend conheça seu identificador.

Os dados de demonstração usam relógio real e podem envelhecer: pendentes tornam-se completas e próximas consultas podem se esvaziar. Não há data artificial congelada nem obrigação de gerar dados pelo frontend. Clínica, especialidades, médicos, salas, horários, roteiro e históricos são preparados no banco. A preparação original prevê pelo menos seis salas para os exemplos, sem justificar quantidade fixa de linhas na interface. Não compensar falta de dados com valores inventados.

## 8. Integração e comportamento de consumo

Esta seção registra somente convenções já aprovadas que afetam a interface. Os formatos e exemplos de resposta ficam nos mocks da seção 10; não são duplicados aqui.

### 8.1 Comunicação, tempo e apresentação

- API sob `/api`, JSON e campos em `camelCase`; identificadores opacos, sem inferir significado de seus exemplos.
- Datas em `YYYY-MM-DD`, meses em `YYYY-MM`, instantes ISO 8601 com deslocamento. Negócio e apresentação usam `America/Sao_Paulo`.
- Durações numéricas em segundos e percentuais de 0 a 100. `null` numérico aparece como “—”; zero é um valor válido. Coleções vazias são resultados válidos.
- Contexto temporal, quando fornecido, informa o fuso e o instante único de avaliação da resposta. Não é um mecanismo para o usuário simular o passado. Não é obrigatório em todos os cadastros/respostas.
- Intervalos incluem o início e excluem o fim. Calendário não devolve limites de grade já enviados pelo frontend.
- As agregações consideram eventos conhecidos no instante de avaliação. Resultados de conversas permanecem associados à data de início, mesmo quando posteriores ao fim do período selecionado.

### 8.2 Leituras e parâmetros por contexto

| Contexto | Operação aprovada | Parâmetros e limites de consumo |
| --- | --- | --- |
| Clínica | `GET /api/clinic` | Sem parâmetros; informações da única clínica. |
| Home | `GET /api/dashboard?month=YYYY-MM` | Mês obrigatório; agregados mensais e próximas consultas a partir de agora. Não devolve todas as reservas do mês. |
| Calendário | `GET /api/calendar?startDate=YYYY-MM-DD&endDateExclusive=YYYY-MM-DD` | Ambos obrigatórios, início anterior ao fim; intervalo visível decidido pelo frontend. Não usa parâmetro `month`. |
| Dia | `GET /api/calendar/days/{date}` | Data válida `YYYY-MM-DD`; agregado da página inteira. |
| Analytics | `GET /api/analytics?period=...&reference=...` | Apenas `week`, `month` ou `year`, com referência correspondente abaixo. |
| Criar conversa | `POST /api/conversations` | Contato novo gerado no frontend; criação inicia boas-vindas/menu. |
| Lista de conversas | `GET /api/conversations?ids=...` | IDs conhecidos no navegador; parâmetro obrigatório, até 50 IDs por chamada, dividindo listas maiores. IDs inexistentes podem ser omitidos. Não há listagem global por omissão do filtro. |
| Recuperar conversa | `GET /api/conversations/{id}` | Estado efetivo e controles atuais, sem transcrição nem mensagens novas. |
| Ação do bot | `POST /api/conversations/{id}/interactions` | Escolhas, dados solicitados, cancelamento ou saída, conforme o estado atual. |
| Reservas da conversa | `GET /api/conversations/{id}/appointments` | Todas as reservas daquela origem, inclusive históricas. Abrir reservas pelo bot pode já devolver os dados, dispensando GET adicional. |

Os IDs conhecidos não são autenticação. A demonstração continua aberta; o backend valida a origem da reserva na conversa. Não há endpoint por cartão ou CRUD público genérico para o frontend conduzir o agendamento.

| Filtro de Analytics | Referência | Período e série |
| --- | --- | --- |
| `week` | `YYYY-MM-DD` | Sete datas terminando na referência, com pontos diários; por exemplo, 10/11 abrange 04/11–10/11. Não é a semana domingo–sábado da oferta do bot. |
| `month` | `YYYY-MM` | Mês indicado, até o início do seguinte; blocos definidos em MET-A10. |
| `year` | `YYYY` | Ano corrente de janeiro até o fim do mês atual; anos anteriores com os doze meses; pontos mensais. |

A capacidade futura dentro do período selecionado integra as métricas de agenda. Período anterior tem a mesma duração do atual e termina no seu início, sem obrigação de coincidir com mês de calendário. Períodos resolvidos retornados por Analytics podem ser apresentados pela interface.

### 8.3 Controles do bot e ações

O frontend renderiza os controles atuais fornecidos pelo backend e envia a escolha correspondente. As representações previstas são opções, horários, formulário do paciente, reservas, informações da clínica e conversa encerrada. Não se interpreta HTML retornado nem uma linguagem arbitrária de telas.

- Menu, especialidade, primeira consulta/retorno e continuação usam a opção recebida. Não fixar IDs ou rótulos ilustrativos como roteiro local.
- Seleção de horário usa uma opção oferecida naquela tentativa. Médico e sala pertencem ao horário; não há seleção separada nem bloqueio temporário de disponibilidade aprovado.
- Formulário coleta nome e nascimento da pessoa atendida, ambos obrigatórios. Nome não pode ser vazio; nascimento deve ser válido e não futuro. A validação do backend continua obrigatória.
- Cancelamento usa a reserva da conversa atual no contexto da consulta de reservas. A elegibilidade recebida exige conversa ativa e reserva pendente; a escrita revalida mesmo que a leitura a tenha permitido.
- Sair é ação global durante o fluxo e produz despedida imediata. Uma conversa fechada não aceita continuação.
- A lista de reservas permite voltar ao menu, inclusive quando vazia. Isso não autoriza um botão genérico de voltar e editar perguntas anteriores.
- Informações da clínica podem ser apresentadas junto às opções do menu; concluir essa tarefa não encerra a conversa.
- Ausência de horários oferece Continuar, que retorna ao menu, e Sair. Continuar não executa nova busca até uma nova tentativa efetiva.

As mensagens novas de ações são acrescentadas à transcrição local, distinguindo autor e horário. Reabrir a conversa reexibe essa transcrição e recupera o estado atual por GET; o backend não reconstrói mensagens apagadas. Uma seleção recuperada pode já estar indisponível, pois GET não refaz a busca nem garante reserva.

### 8.4 Repetição, revisão e concorrência

Cada ação efetiva usa um novo `actionId` e a `expectedRevision` do último estado recebido. Reenvio da mesma ação mantém identificador, conteúdo e revisão original. A mesma chave com conteúdo diferente é conflito. Reenvio legítimo não duplica reserva, busca, evento, avanço ou atividade.

O frontend evita duplicar bolhas usando os identificadores de mensagens e não aplica um estado antigo sobre uma revisão mais nova já conhecida; recupera o estado por GET quando necessário. Revisão não substitui estado efetivo: uma conversa pode abandonar sem mudança da revisão persistida.

Ao repetir criação após falha de rede, reutilizar o contato daquela intenção de criação: o backend recupera a conversa existente sem novas boas-vindas ou atividade. Uma intenção realmente nova de Nova Conversa gera outro contato.

Uma ação diferente baseada em revisão antiga é recusada e exige atualização da conversa. Isso difere da repetição legítima de uma ação já processada. Nenhum desses mecanismos substitui a validação real de disponibilidade na confirmação.

### 8.5 Resultados vazios, erros e recuperação

| Situação/HTTP | Efeito esperado na interface |
| --- | --- |
| `200` | Leitura ou interação processada; coleção vazia também é sucesso. |
| `201` | Conversa criada; renderizar boas-vindas e menu automaticamente. |
| `400` | Requisição, data, parâmetro ou intervalo malformado; não interpretar como ausência de dados de negócio. |
| `404` | Recurso inexistente ou reserva que não pertence à conversa informada; não oferecer acesso por nome ou outra conversa. |
| `409`, revisão antiga | Recuperar a conversa por GET e apresentar a etapa atual, sem avançar com opção obsoleta. |
| `409`, horário ocupado | Não mostrar confirmação. Apresentar conflito e novas opções/estado retornados; se vier uma interface de recuperação junto ao erro, não descartá-la pelo status HTTP. Ausência total ou parcial segue RF-02 e RF-06. |
| `409`, conversa encerrada/abandonada | Impedir continuação e permitir novo atendimento com novo contato, sem reabrir o anterior. |
| `409`, reserva não cancelável | Não apresentar cancelamento como concluído nem liberar visualmente o horário como se houvesse sucesso. |
| `422` | Entrada compreensível, mas inválida; não avançar etapa nem tratar como busca/reserva realizada. |

Os erros podem informar mensagem e campos inválidos; revisão antiga é identificada por `STALE_CONVERSATION_STATE` e abandono por `CONVERSATION_ABANDONED`. O escopo não estabelece um componente visual específico para erros nem política automática de tentativas.

“Bot digitando...” pode acompanhar a espera HTTP, sem atraso artificial exigido no backend. Falha de rede não é confirmação de sucesso ou de insucesso da reserva: eventual reenvio respeita a mesma ação, conforme a seção 8.4.

### 8.6 Persistência local e atividade

O navegador mantém transcrição em `localStorage`, IDs conhecidos e itens ocultos. A lista mostra tempo desde a última interação informada pela API, não desde a abertura da tela. Abrir, recarregar, animar ou reenviar ação idempotente não renova atividade.

Abandono ocorre quando a inatividade é **superior** a uma hora, não no limite exato de uma hora. O frontend respeita a avaliação da API; não cria processo de persistência de abandono. Retorno após abandono inicia outra conversa, sem reaproveitar paciente.

Ocultar só retira o item da lista local. Não chama exclusão de conversa, não encerra atendimento, não cancela reservas nem altera métricas. Não se exige sincronização entre dispositivos ou recuperação de transcrição apagada.

## 9. Métricas e regras de cálculo

### 9.1 Convenções gerais

- Agenda usa a data/hora do atendimento, não a data de criação da reserva.
- Indicadores de conversas — conclusão, funil, duração, términos, início fora do expediente e mapa de calor — agrupam a conversa pela data de início. Seus resultados e marcos permanecem nesse grupo, mesmo que ocorram em outro período. Exemplo: conversa iniciada em 31/10 e confirmada em 01/11 contribui para outubro, inclusive na duração e na conclusão.
- Buscas sem horário usam o instante de cada ocorrência, independentemente da data de início da conversa. Reservas continuam usando a data marcada para a consulta.
- Contagens de consultas incluem canceladas; ocupação é calculada separadamente.
- Total do dia = completas + pendentes + canceladas = soma das consultas por sala = número no calendário.
- Empates: data/hora mais cedo ou menor número de sala, conforme o ranking.
- Variações: pontos percentuais para percentuais, segundos para duração e valor absoluto para contagens.
- Comparação com período imediatamente anterior de mesma duração. Sem dados nele, mostrar “—” e omitir melhoria/piora.
- Sete dias comparam com os sete anteriores; um intervalo de 31 dias compara com os 31 anteriores. Os intervalos de comparação não precisam coincidir com meses de calendário.
- Usar “Melhoria”/“Piora” quando a interpretação favorável/desfavorável for aplicável. Não presumir que aumento de conversas fora do expediente seja favorável ou desfavorável.
- Mesmos dados, filtros e referência temporal devem reproduzir o cálculo. Indicadores dependentes do relógio podem mudar sem novos registros.

**KPIs de duração usam mediana**, assim como o valor central do histograma. Cada conversa com confirmação contribui com uma duração: do início até a primeira confirmação. Não calcular média aritmética sob o rótulo de mediana. O histograma também apresenta P90.

Os cálculos preservam a precisão; arredondar apenas na apresentação. Exibir percentuais com uma casa decimal, contagens inteiras e durações em minutos e segundos. Contagens sem ocorrências mostram zero; mediana, P90 e percentuais sem população/base mostram “—”. Dez conversas que tentaram agendar e nenhuma confirmação resultam em 0%; nenhuma conversa que tentou agendar resulta em “—”. Um denominador zero não pode produzir um percentual numérico.

### 9.2 Home

| ID | Indicador | Cálculo e dados |
| --- | --- | --- |
| MET-H01 | Completas | Contagem mensal classificada como completa, com agendamento, cancelamento e horário. |
| MET-H02 | Pendentes | Contagem mensal classificada como pendente, na mesma base. |
| MET-H03 | Canceladas | Agendamentos cancelados cujos horários pertencem ao mês. |
| MET-H04 | Melhor Dia | Data de maior contagem mensal, incluindo canceladas, e quantidade. |
| MET-H05 | Hora de pico | Hora de maior contagem, incluindo canceladas; total e diferença acima da média dos demais horários. |
| MET-H06 | Melhor sala | Sala de maior contagem mensal, incluindo canceladas, e quantidade. |
| MET-H07 | Mediana de atendimento | Mediana do tempo do início até a primeira confirmação, uma duração por conversa com agendamento confirmado, agrupada pelo mês de início. |
| MET-H08 | Próximas Consultas | Até cinco pendentes futuras a partir de agora, em ordem, com horário, sala, paciente, especialidade e médico; data quando não for hoje. |

Hora de pico apresenta, por exemplo, “500 consultas (+41 acima da média)”. A diferença é `contagem da hora de pico − média das contagens dos outros horários`, não variação temporal. Os outros horários considerados são os do expediente da clínica, excluindo a hora de pico, incluindo horas do expediente com zero consultas. Horas em que a clínica está fechada não entram nessa média.

### 9.3 Calendário e Dia

| ID | Indicador | Cálculo |
| --- | --- | --- |
| MET-C01 | Consultas por dia | Todas as reservas da data do horário, inclusive canceladas. |
| MET-D01 | Total e status | Total da data e contagens por status derivado. |
| MET-D02 | Taxa de Completude | `100 × completas ÷ total do dia`, com canceladas e pendentes no denominador. |
| MET-D03 | Consultas por Horário | Quantidade por hora de início, incluindo canceladas. |
| MET-D04 | Manhã/Tarde | Consultas antes de 12h na manhã e a partir de 12h na tarde, incluindo canceladas. |
| MET-D05 | Consultas por sala | Todas as reservas da sala na data e subconjunto cancelado entre parênteses. |
| MET-D06 | Ocupação por sala | `100 × horários com reserva não cancelada ÷ horários totais da sala na data`. |
| MET-D07 | Pico por sala | Hora com mais consultas da sala na data, incluindo canceladas. |

Ocupação é **por contagem, não por minutos**, mesmo com durações diferentes. Um horário ocupado conta uma vez; cancelamentos históricos não aumentam sua ocupação quando reservado novamente. Horários futuros do período integram a capacidade total.

### 9.4 Analytics — KPIs

| ID | Indicador | Definição |
| --- | --- | --- |
| MET-A01 | Conclusão do Bot | `100 × conversas que confirmaram pelo menos um agendamento ÷ conversas que iniciaram agendamento`. Cada conversa conta uma vez em cada conjunto. Consultar reservas/informações, por si só, não entra. |
| MET-A02 | Mediana de atendimento | Mediana da duração do início até a primeira confirmação, uma duração por conversa que confirmou agendamento; usa o período de início e não espera Sair. |
| MET-A03 | Conversas fora do expediente | `100 × conversas iniciadas fora do expediente ÷ total de conversas iniciadas` no período. |
| MET-A04 | Ocupação da Agenda | `100 × horários com agendamento não cancelado ÷ horários totais` no período. |
| MET-A05 | Buscas sem Horário | Contagem de ocorrências de busca sem resultado, inclusive repetidas na mesma conversa. |

MET-A03 usa início de conversa, não quantidade de mensagens nem cliques. O expediente consultado é Seg–Sex 07h–18h, Sáb 09h–13h, domingo fechado.

MET-A01 usa **conversas distintas** no numerador e denominador, garantindo resultado entre 0% e 100% quando há base para cálculo. Duas ou mais reservas na mesma conversa continuam contando como uma conversa que conseguiu agendar. Essa definição corresponde à linha Confirmaram do funil, sob o mesmo recorte. Não obter esse limite cortando artificialmente uma razão maior que 100%.

Cancelar depois não apaga o fato de confirmação. O cancelamento afeta status e ocupação. Uma conversa inicialmente informativa que depois escolhe Agendar passa a compor a população correspondente; não considerar apenas a primeira opção do menu.

### 9.5 MET-A06 — Funil de conversão

Cada linha conta **conversas distintas**, sem multiplicação por tentativas. Percentual = `100 × quantidade da linha ÷ Iniciaram`.

| Linha | Condição |
| --- | --- |
| Iniciaram | Escolheu Agendar em algum momento. Conversas apenas informativas ou de consulta/cancelamento ficam fora. |
| Triagem | Respondeu à especialidade; o marco não exige ter concluído as duas perguntas. |
| Viram horários | Recebeu o resultado da busca, inclusive sem disponibilidade. |
| Escolheram | Selecionou horário. |
| Confirmaram | Houve criação de pelo menos um agendamento. |

“Viram horários” inclui resposta sem opções por decisão do projeto. A existência de lista não pode ser o único critério dessa linha.

### 9.6 MET-A07 — Onde as Conversas Terminam

Separar desistência por Sair e abandono calculado nas etapas Triagem, Escolha de horário, Dados do paciente e Confirmação. Usar a etapa em que a conversa estava ao sair ou ficar inativa.

Retorno ao menu não é término, e confirmar não encerra. As quatro barras contam somente saídas e abandonos ocorridos durante uma tentativa de agendamento, na etapa atual. Saídas e abandonos no menu permanecem registrados, mas não entram nessas barras. Não acrescentar uma barra para o menu nem atribuir sua saída à última confirmação. Sair continua encerrando imediatamente com mensagem de adeus, independentemente de entrar no gráfico.

### 9.7 MET-A08 — Duração

Mesma população de conversas com confirmação de MET-A02, agrupada pela data de início. Cada conversa contribui uma vez, com a duração do início até a primeira confirmação, mesmo se continuar ou fizer outras reservas. Se confirmar aos dois e aos cinco minutos, a duração usada é dois minutos.

O histograma usa intervalos de um minuto: barra 1 para durações de zero até menos de um minuto, barra 2 para um até menos de dois minutos, e assim por diante até a barra 10 para nove até menos de dez minutos. A barra final “10+” contém dez minutos ou mais. A legenda explicita as faixas, sem sobreposição. Apresentar mediana e P90.

Para P90, ordenar as durações em ordem crescente e selecionar a posição `ceil(0,90 × N)`, contando posições a partir de 1, sendo N a quantidade de conversas da população. Com dez conversas, usar a nona menor duração. Sem conversas, apresentar “—”.

Desistências/abandonos sem confirmação e tarefas exclusivamente informativas não entram. Se houve confirmação e depois Sair/abandono ou cancelamento da reserva, o fato de sucesso e a duração até a primeira confirmação permanecem. Todas as confirmações continuam registradas; as posteriores apenas não geram amostras adicionais de duração.

### 9.8 MET-A09 — Mapa de calor

Contar inícios de conversas por dia da semana e faixa de horário. Cobrir **24 horas em 12 faixas de duas horas**, inclusive fora do expediente. Mais conversas significam maior intensidade visual.

### 9.9 MET-A10 — Evolução da conclusão

Usa a fórmula de MET-A01 e acompanha o filtro:

| Filtro | Agrupamento |
| --- | --- |
| Mês | Blocos de dias 1–7, 8–14, 15–21, 22–28 e 29–fim, quando existir o último bloco. |
| Semana | Últimos sete dias, com pontos diários. |
| Ano | Janeiro até o mês atual no ano corrente; os doze meses para anos anteriores, com pontos mensais. |

Não manter oito semanas fixas. Os quatro ou cinco blocos mensais são rotulados pelas datas e não precisam coincidir com semanas de domingo a sábado. Título e eixos comunicam a granularidade atual.

A média móvel é a média aritmética dos percentuais dos últimos três pontos, incluindo o atual: três dias no filtro semanal, três blocos no mensal ou três meses no anual. No início da série, usar os pontos disponíveis. Percentuais sem base são “—”, não zero; não entram como valores numéricos na média. Se não houver nenhum percentual calculável na janela, mostrar “—”. Essa linha suaviza a série e não altera a mediana usada nos indicadores de duração.

### 9.10 MET-A11 — Buscas por especialidade

Agrupar ocorrências sem disponibilidade pela especialidade, em ordem decrescente. A soma deve coincidir com MET-A05 no mesmo período. Três buscas na mesma conversa contam três ocorrências. Representa procura sem oferta, não falta de demanda nem falta do paciente à consulta.

### 9.11 Matriz de rastreabilidade

| Dados | Funcionalidades/indicadores sustentados |
| --- | --- |
| Reserva, cancelamento, horário e sala | Status, calendário, Dia, rankings, próximas consultas e ocupação. |
| Paciente, médico e especialidade | Identificação e cartões de próximas consultas; filtro de disponibilidade. |
| Início e primeira confirmação | Uma duração por conversa para mediana da Home, MET-A02 e MET-A08, no grupo de início; independente de Sair e de confirmações posteriores. |
| Escolha de Agendar e marcos | MET-A01 e MET-A06, mesmo após outra ação inicial. |
| Início de conversa e expediente | MET-A03 e MET-A09, sem contar mensagens como unidade. |
| Última atividade e passo | Abandono calculado e MET-A07. |
| Todos os horários, inclusive ocupados | Denominador de MET-A04 e MET-D06. |
| Cada ocorrência de busca | MET-A05 e MET-A11, com soma conciliável. |

Ocultar conversa não altera nenhuma dessas bases. Valores ilustrativos das imagens não são testes de aceitação dos cálculos.

### 9.12 Complementos de interpretação dos contratos

A janela da média móvel contém a posição atual e as duas anteriores. Ignorar percentuais sem base dentro dessa janela não autoriza buscar pontos mais antigos para completar três valores numéricos.

Valor anterior zero não equivale a ausência de histórico. Diferença só existe quando as duas bases permitem a métrica. Para contagens, a interface não presume que um período sem registros foi preenchido com atividade zero: usa as evidências fornecidas pelo backend para distinguir falta de histórico. Sem base de comparação, exibe “—” e omite melhoria/piora.

As fórmulas são referência para interpretação e revisão; não transferem ao frontend a responsabilidade de reconstruir analytics usando transcrições, cliques ou dados incompletos das páginas.

## 10. Referências aos mocks e rastreabilidade por área

Os formatos de resposta utilizados no projeto permanecem documentados nos arquivos abaixo. Este documento não repete payloads, tipos ou catálogos de propriedades. Os exemplos são consultados junto às regras de comportamento; valores ilustrativos não são resultados fixos de aceitação.

| Área | Referência de formato/exemplo | Requisitos principais |
| --- | --- | --- |
| Home | [home.ts](../mocks/home/home.ts) | TELA-01, RF-11, MET-H01–08 |
| Calendário | [calendario.ts](../mocks/calendar/calendario.ts) | TELA-02, RF-12, MET-C01 |
| Dia | [dia.ts](../mocks/day/dia.ts) | TELA-03, RF-13, MET-D01–07 |
| Analytics | [analytics.ts](../mocks/analytics/analytics.ts) | TELA-04, RF-14, MET-A01–11 |
| Identificação da clínica | [clinica.ts](../mocks/shared/clinica.ts) | DAD-01, TELA-01 e TELA-05 |
| Lista de conversas | [lista_de_conversas.ts](../mocks/shared/lista_de_conversas.ts) | TELA-05, RF-15 |
| Início do Showcase | [criar_conversa_response.ts](../mocks/showcase/criar_conversa_response.ts) | RF-03, RN-04–07 |

### 10.1 Cenários do Showcase

| Cenário | Referência |
| --- | --- |
| Escolher Agendar | [escolher_agendar_response.ts](../mocks/showcase/extras/escolher_agendar_response.ts) |
| Responder especialidade | [responder_especialidade_response.ts](../mocks/showcase/extras/responder_especialidade_response.ts) |
| Responder primeira consulta/retorno e receber horários | [primeira_consulta_e_resultado_da_busca_response.ts](../mocks/showcase/extras/primeira_consulta_e_resultado_da_busca_response.ts) |
| Selecionar horário | [escolher_horario_response.ts](../mocks/showcase/extras/escolher_horario_response.ts) |
| Informar paciente e confirmar | [informar_paciente_e_confirmar_response.ts](../mocks/showcase/extras/informar_paciente_e_confirmar_response.ts) |
| Ler estado sem atividade | [ler_estado_sem_registrar_atividade_response.ts](../mocks/showcase/extras/ler_estado_sem_registrar_atividade_response.ts) |
| Consultar reservas | [abrir_lista_de_agendamentos_response.ts](../mocks/showcase/extras/abrir_lista_de_agendamentos_response.ts) |
| Cancelar reserva | [cancelar_reserva_pendente_response.ts](../mocks/showcase/extras/cancelar_reserva_pendente_response.ts) |
| Informações da clínica | [informacoes_da_clinica_response.ts](../mocks/showcase/extras/informacoes_da_clinica_response.ts) |
| Sem disponibilidade | [sem_horarios_response.ts](../mocks/showcase/extras/sem_horarios_response.ts) |
| Sair | [sair_response.ts](../mocks/showcase/extras/sair_response.ts) |
| Revisão/validação | [validacao_por_etapa_response.ts](../mocks/showcase/extras/validacao_por_etapa_response.ts) |
| Abandono, histórico e ocultação | [abandono_historico_e_ocultacao_response.ts](../mocks/showcase/extras/abandono_historico_e_ocultacao_response.ts) |

A matriz é um índice de contexto, não uma sequência de implementação. A existência de um mock não esgota os cenários obrigatórios: reservas seguintes, concorrência, cancelamento inelegível, resultados vazios e limites temporais continuam sujeitos às regras e verificações deste documento.

## 11. Critérios de aceitação e revisão do frontend

Os cenários originais são preservados abaixo porque definem resultados observáveis e dependências da interface. Verificações sobre persistência, concorrência ou queries são de integração com a API; não exigem implementar banco ou backend no frontend. A fidelidade visual dos mocks, isoladamente, não comprova essas operações.

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

Revisar também que não foram acrescentados WhatsApp, IA, secretária, login, gestão de auxiliares ou telas sem requisito; que consultas médicas, tarefas e conversas não foram confundidas; e que as convenções de tempo, agrupamento e estatística foram aplicadas de forma consistente em todas as telas.

## 12. Requisitos estabelecidos e decisões de implementação

São obrigatórios: bot no backend; roteiro fixo no banco; HTTP REST/JSON com requisição e resposta comum; endpoints aprovados; histórico textual em `localStorage`; ausência de login; abandono calculado; regras de identidade e reserva; filtros, fórmulas e convenções de apresentação descritos aqui.

Este documento não estabelece biblioteca de componentes, gráficos, formulários ou estado, estratégia de cache, divisão de arquivos, organização arquitetural, hospedagem ou tecnologia de backend/banco. Escolhas já existentes no repositório devem ser consideradas na execução, sem transformar este escopo funcional em prescrição de arquitetura nova.

Detalhes de apresentação não especificados, como componentes de carregamento/erro e disposição responsiva, não autorizam alterar regras, criar páginas ou acrescentar operações. Não há periodicidade obrigatória de atualização, política de repetição automática ou layout de erro definidos no escopo original.

Também não são requisitos: SQL executável, schema físico, índices, mecanismo de bloqueio ou rotinas de preparação do banco no frontend. As garantias observáveis correspondentes — origem real dos dados, reserva única, estado válido e resultados consistentes — permanecem obrigatórias na integração.

## 13. Glossário

| Termo | Significado |
| --- | --- |
| Agendamento | Reserva de horário para paciente, com origem e confirmação identificáveis. |
| Atendimento do bot | Interação automatizada com várias tarefas possíveis na mesma conversa. |
| Contato simulado | Identificador criado para nova conversa, sem telefone real obrigatório. |
| Paciente | Pessoa atendida, nome não único e nascimento; no máximo uma por conversa. |
| Tentativa | Percurso de Agendar até seu resultado, distinguível de outros na mesma conversa. |
| Completa | Consulta não cancelada cujo instante de término foi atingido; não comprova presença. |
| Encerrada | Conversa terminada explicitamente por Sair. |
| Abandonada | Inatividade superior a uma hora, calculada por query, sem retomada. |
| Oculta | Conversa retirada da lista, sem apagar dados ou mudar estado de negócio. |
| Horário | Unidade com início, fim, médico e sala, livre ou ocupada. |
| Ocupação | Horários com reserva não cancelada sobre horários totais, por contagem. |
| Histórico textual | Transcrição local, não fonte de analytics. |
| Roteiro | Perguntas, opções, textos e transições no banco. |
| Showcase | Tela do bot dentro da aplicação. |
| Mediana | Valor central das durações, usado nos KPIs e histograma. |
| P90 | Duração na posição ceil(0,90 × N) da lista crescente de N durações até a primeira confirmação. |
| Taxa de Completude | Completas sobre total de consultas da data, incluindo canceladas no denominador. |
| Conclusão do Bot | Conversas que confirmaram ao menos um agendamento sobre conversas que iniciaram agendamento; entre 0% e 100% quando há base. |
| pp | Pontos percentuais, para diferenças entre percentuais. |
