# Kenko — Backend: endpoints, JSON e queries

Especificação técnica da API acadêmica. Complementa o escopo consolidado — escopo-kenko-v2.md e o documento de fluxo e convenções do bot — kenko-bot-api.md.

## 1. Autoridade e limites

As regras funcionais do escopo continuam obrigatórias. A divisão REST, os contratos e a abordagem de comunicação apresentados aqui correspondem ao refinamento aprovado. Exemplos de SQL são exclusivamente conceituais: não definem schema, nomes físicos, SGBD, índices ou estratégia de bloqueio.

Os JSONs contêm exemplos de dados para demonstrar formato, não dados a fixar na aplicação. Valores de negócio, perguntas, alternativas e métricas vêm do banco. Exemplos de seções diferentes não representam necessariamente a mesma população de demonstração.

| Camada | Responsabilidade |
| --- | --- |
| Escopo acadêmico | Regras de negócio, telas, métricas e limites funcionais. |
| Este documento | Rotas, parâmetros, formatos de leitura, limites de analytics e consultas conceituais. |
| Documento do bot | Estado, interações, respostas conversacionais, validação, idempotência e confirmação/cancelamento. |
| Implementação posterior | Linguagem, framework, schema físico, contratos internos e mecanismo de integridade. |

A API não inclui autenticação, CRUD de dados auxiliares, pesquisa global de pacientes, relatórios genéricos, exportação, exclusão de conversas ou edição de reservas pelo painel.

## 2. Convenções de comunicação

### 2.1 Formatos

- Prefixo: `/api`; corpos e respostas em JSON; campos em `camelCase`.
- Identificadores são opacos. Os exemplos `cv_1`, `slot_1` etc. não impõem formato físico.
- Datas: `YYYY-MM-DD`; meses: `YYYY-MM`; instantes: ISO 8601 com deslocamento.
- Datas e cálculos de negócio usam `America/Sao_Paulo`.
- Durações são números em segundos; percentuais usam escala 0–100.
- Ausência de base numérica: `null`; contagem sem ocorrências: `0`; coleção vazia: `[]` ou mapa vazio conforme o contrato.
- O frontend apresenta `null` como “—”. Não enviar esse símbolo em propriedades numéricas.
- Preservar precisão no cálculo; arredondar apenas na apresentação, conforme o escopo.

### 2.2 Contexto da resposta e limites temporais

`meta` é somente um agrupamento de contexto; não é um mecanismo especial do HTTP. Para leituras dependentes do relógio, contém `evaluatedAt` e o fuso. O backend captura o instante uma vez por requisição e o utiliza em todos os cálculos da resposta. Ele não é um parâmetro para o usuário simular o passado.

Não devolver contexto redundante sem uso. Em particular, o calendário recebe o intervalo visível do frontend e não devolve `gridStart` nem `gridEndExclusive`. O backend não escolhe quantas linhas a grade possui.

Analytics devolve o período resolvido e o período anterior porque a interface pode exibi-los e porque variam conforme o filtro. Intervalos são de início incluído e fim excluído: `instante >= início AND instante < fim`.

| Filtro | Parâmetro `reference` | Interpretação |
| --- | --- | --- |
| `week` | `2026-11-10` | Sete datas, de 04/11 a 10/11, com pontos diários. |
| `month` | `2026-10` | Mês indicado; blocos 1–7, 8–14, 15–21, 22–28, 29–fim. |
| `year` | `2026` | Ano corrente: janeiro até o mês atual; ano anterior: doze meses. |

Para a agenda, períodos selecionados incluem a capacidade futura desses períodos. Eventos conversacionais considerados são os já existentes até `evaluatedAt`. O período do ano corrente termina no início do mês seguinte ao atual; mês selecionado termina no início do mês seguinte. A comparação usa intervalo imediatamente anterior de mesma duração, não necessariamente mês anterior de calendário. A semana de sete dias do filtro é distinta da semana domingo–sábado usada na seleção de horários pelo bot.

Conversas são incluídas pela data de início; seus resultados posteriores conhecidos permanecem no mesmo grupo. Buscas sem horário usam seu próprio instante. Agendamentos usam a data marcada.

### 2.3 Leituras não executam ações

Nenhum `GET` avança etapa, cria interação, atualiza atividade, registra busca sem horário, cancela ou confirma reserva. Reabrir chat e atualizar dashboard não impedem abandono. A busca funcional é executada pelo processamento de uma interação do paciente, não ao reexibir uma resposta.

Esse limite corresponde à semântica de leitura do HTTP: RFC 9110 — HTTP Semantics, seção 9.2.1 (métodos seguros).

### 2.4 Erros

| Código HTTP | Uso |
| --- | --- |
| 200 | Leitura/interação processada; uma lista vazia também é sucesso. |
| 201 | Conversa criada. |
| 400 | JSON, parâmetro, formato de data ou intervalo malformado. |
| 404 | Recurso inexistente ou agendamento que não pertence à conversa informada. |
| 409 | Conflito de estado: revisão antiga, horário ocupado, conversa fechada/abandonada ou reserva não cancelável. |
| 422 | Entrada compreensível, mas inválida: opção incompatível, nome vazio ou nascimento futuro. |

Exemplo completo de erro na seção 4.8. O backend não aceita estado, preço, médico, sala ou paciente arbitrário como substitutos dos vínculos que já conhece.

## 3. Endpoints

### 3.1 Catálogo

| Método | Rota | Classe | Responsabilidade |
| --- | --- | --- | --- |
| GET | `/api/clinic` | Recurso individual | Clínica, expediente e especialidades. |
| GET | `/api/dashboard?month=2026-11` | Agregado | Home e próximas consultas. |
| GET | `/api/calendar?startDate=2026-09-27&endDateExclusive=2026-11-01` | Agregado por data | Totais do intervalo de datas visível na grade definida pelo frontend. |
| GET | `/api/calendar/days/2026-11-10` | Agregado diário | Status, horários, manhã/tarde e salas. |
| GET | `/api/analytics?period=month&reference=2026-10` | Agregado | Os KPIs e gráficos aprovados de Analytics. |
| POST | `/api/conversations` | Criação | Nova conversa, boas-vindas e menu. |
| GET | `/api/conversations?ids=cv_1,cv_2` | Listagem delimitada | Estado e atividade de conversas conhecidas pelo navegador. |
| GET | `/api/conversations/{id}` | Recurso individual | Estado efetivo e interface atual; sem transcrição ou mensagens novas. |
| POST | `/api/conversations/{id}/interactions` | Comando | Escolha, dados do paciente, cancelamento ou saída. |
| GET | `/api/conversations/{id}/appointments` | Listagem delimitada | Reservas originadas naquela conversa. |

Não criar um endpoint por cartão. Não é necessário endpoint público individual de reserva: a listagem da conversa fornece seus dados. A existência de uma entidade no banco não exige um CRUD público.

### 3.2 Clínica

**Finalidade:** menu de informações e identificação da clínica. **Contrato:** `GET /api/clinic`, sem parâmetros. **JSON:** seção 4.1.

**Origem:** cadastro da clínica, expediente e especialidades. **Regras:** Seg–Sex 07h–18h, Sáb 09h–13h, domingo fechado; abertura incluída, fechamento excluído. O bot funciona fora do expediente.

**Observações:** uma clínica na demonstração; não introduzir seleção de clínicas nem gestão desses dados. O fluxo do bot pode reutilizar a mesma função interna de leitura sem fazer uma chamada HTTP à própria API.

### 3.3 Home

**Finalidade:** todos os cartões da Home. **Contrato:** `GET /api/dashboard`, com `month` obrigatório `YYYY-MM`. **JSON:** seção 4.2.

**Origem:** reservas/horários para totais; agrupamentos por dia, hora e sala; conversas e primeira confirmação para mediana; paciente/médico/especialidade para próximas consultas. **Queries:** 5.2–5.5 e 5.7.

**Regras:** rankings incluem canceladas; ocupação e duração têm bases próprias. Próximas consultas são até cinco pendentes com início futuro, a partir do relógio atual, independentemente do mês selecionado. Consulta em andamento ainda pode ser pendente, mas não é uma próxima consulta.

**Limite:** não retorna a lista completa de reservas do mês ou conversas individuais usadas na mediana. Ranking sem registros retorna `null`.

### 3.4 Calendário: intervalo definido pelo frontend

**Finalidade:** contagens de todas as datas visíveis, inclusive meses vizinhos. **Contrato:** `GET /api/calendar?startDate=YYYY-MM-DD&endDateExclusive=YYYY-MM-DD`. Ambos são obrigatórios; início deve ser anterior ao fim. As datas são interpretadas à meia-noite no fuso do sistema. **JSON:** seção 4.3.

O frontend monta a grade e escolhe se há cinco ou seis linhas. Por exemplo, uma grade de 27/09 a 31/10 envia início 27/09 e fim exclusivo 01/11. Se desenhar mais uma semana, envia o novo fim. O backend apenas consulta o intervalo recebido.

**Origem:** reservas agrupadas pela data local de início dos horários. **Regras:** canceladas entram; dias sem ocorrências têm zero; total coincide com Dia. **Query:** 5.2 com agrupamento por data.

**Observações:** não há parâmetro `month` nessa rota, nem `gridStart`/`gridEndExclusive` na resposta. Mês selecionado, ordem de células e esmaecimento são apresentação do frontend. `today` vem do relógio do sistema para destacar a data correta.

### 3.5 Dia e informações por sala

**Finalidade:** toda a página Dia. **Contrato:** `GET /api/calendar/days/{date}`, data válida `YYYY-MM-DD`. **JSON:** seção 4.4.

**Origem:** reservas, horários e salas. **Regras:** total = status somados = consultas por sala = calendário; canceladas entram nas distribuições; ocupação por contagem de horários, excluindo reservas canceladas; corte manhã/tarde às 12h. Empates usam hora mais cedo.

**Observações:** incluir salas do cadastro mesmo com zero consultas; sem capacidade na data, ocupação é `null`. Não retorna nomes de pacientes por sala nem cria uma tela de detalhe. Capacidade e consultas devem ser agregadas separadamente antes de unir resultados, evitando multiplicação de linhas. **Queries:** 5.2–5.4.

### 3.6 Analytics e seus limites

**Finalidade:** cinco KPIs e seis gráficos aprovados. **Contrato:** `GET /api/analytics`, `period` em `week`, `month`, `year` e `reference` correspondente à seção 2.2. **JSON:** seção 4.5. **Queries:** 5.3 e 5.6–5.11.

| Incluído | Excluído |
| --- | --- |
| Conclusão, mediana, fora do expediente, ocupação e buscas. | Indicadores arbitrários solicitados pelo frontend. |
| Funil, términos, histograma, heatmap, série e buscas por especialidade. | Construtor de relatórios, SQL enviado pelo cliente ou agrupamento por qualquer coluna. |
| Semana, mês e ano; período anterior. | Filtros novos por paciente, médico ou sala nesta página. |
| Numeradores, denominadores, unidades e limites de período. | Transcrições, pacientes individuais ou detalhamento de pessoas por barra. |
| Queries sobre registros reais. | Exportação, novas telas ou alterações de estado. |

Um endpoint não significa uma query gigante. O backend pode usar consultas pequenas com os mesmos limites e instante de avaliação. Não criar endpoints individuais para cada gráfico sem necessidade posterior demonstrada.

**Regras essenciais:**

- Conversas distintas no numerador e denominador de conclusão; limite de 100%, sem corte artificial.
- Mediana e histograma: uma duração por conversa, até a primeira confirmação.
- Coorte pela data de início; não cortar eventos posteriores na data final do filtro. Considerar resultados conhecidos até `evaluatedAt`.
- Consulta cancelada depois preserva a confirmação e sua duração.
- Busca sem resultado conta em Viram horários; cada ocorrência conta no KPI de buscas.
- Saídas no menu não entram nas quatro barras de término; abandono é calculado.
- Heatmap com 7 × 12 células, incluindo zeros.
- Média móvel das três posições correntes/anteriores, ignorando `null` dentro da janela; não buscar pontos mais antigos para completar três valores.
- Datas de consultas, inícios de conversas e instantes de buscas não são filtros intercambiáveis.

**Comparação:** valor anterior zero não equivale à ausência de dados. Diferença só é calculada quando as duas bases permitem a métrica; caso contrário, `null`. Contagem atual sem ocorrência continua zero. Para uma contagem anterior sem nenhum registro, não presumir se o período foi demonstrado com atividade zero ou simplesmente não foi populado: o tratamento visual “sem histórico” deve usar as evidências do período disponíveis no banco, sem inventar preenchimento.

### 3.7 Conversas e agendamentos

**Criação e comandos:** contratos completos no documento do bot — kenko-bot-api.md, que é a referência para os corpos do POST.

**Listagem:** `GET /api/conversations?ids=cv_1,cv_2`. O navegador guarda os IDs criados e os itens ocultos; a API devolve estado e atividade reais somente dos IDs informados. `ids` obrigatório, sem listar todo o banco quando ausente. Até 50 IDs por chamada; dividir listas maiores. IDs inexistentes podem ser omitidos da coleção. **JSON:** 4.6.

**Individual:** `GET /api/conversations/{id}` retorna estado efetivo, `view` e ações disponíveis; não gera nova mensagem, não registra interação e não renova atividade. Sua estrutura está no documento do bot.

**Reservas:** `GET /api/conversations/{id}/appointments`, sem filtro global de paciente. Retorna todas as reservas da origem indicada, incluindo históricas, com `canCancel` derivado. **JSON:** 4.7. **Query:** 5.5. Não atualizar atividade ao listar. Uma ação conversacional de abrir essa lista registra interação e pode incluir diretamente os mesmos registros em `view`, dispensando outro GET.

Os IDs enviados pelo navegador não são autenticação. A demonstração é aberta; a restrição implementada é a origem da reserva dentro da conversa, verificada no backend, sem adicionar login.

## 4. Exemplos JSON

### 4.1 Clínica — GET /api/clinic

```json
{
  "data": {
    "id": "clinic_1",
    "name": "Clínica Demonstração",
    "address": "Rua de Exemplo, 100",
    "phone": "1100000000",
    "openingHours": [
      {"weekdays": [1, 2, 3, 4, 5], "opensAt": "07:00", "closesAt": "18:00"},
      {"weekdays": [6], "opensAt": "09:00", "closesAt": "13:00"},
      {"weekdays": [0], "closed": true}
    ],
    "specialties": [
      {"id": "sp_1", "name": "Clínico geral"},
      {"id": "sp_2", "name": "Dermatologia"},
      {"id": "sp_3", "name": "Ortopedia"},
      {"id": "sp_4", "name": "Cardiologia"}
    ]
  }
}
```

Convenção dos dias: 0 é domingo, 1 segunda, até 6 sábado. Não é necessário `meta` para esse cadastro estático.

### 4.2 Home — GET /api/dashboard?month=2026-11

```json
{
  "meta": {
    "timezone": "America/Sao_Paulo",
    "evaluatedAt": "2026-11-10T12:15:00-03:00"
  },
  "data": {
    "clinic": {"id": "clinic_1", "name": "Clínica Demonstração"},
    "appointments": {"total": 22, "complete": 10, "pending": 8, "cancelled": 4},
    "bestDay": {"date": "2026-11-10", "appointmentCount": 4},
    "peakHour": {
      "hour": 9,
      "appointmentCount": 6,
      "otherBusinessHoursAverage": 1.6,
      "aboveAverage": 4.4
    },
    "bestRoom": {"id": "room_1", "name": "Sala 1", "appointmentCount": 12},
    "attendanceDuration": {
      "statistic": "median", "seconds": 150,
      "previousSeconds": 165, "differenceSeconds": -15
    },
    "upcomingAppointments": [
      {
        "id": "ap_90", "status": "pending",
        "startsAt": "2026-11-10T13:00:00-03:00",
        "endsAt": "2026-11-10T13:30:00-03:00",
        "patient": {"id": "pt_20", "name": "Ana"},
        "specialty": {"id": "sp_2", "name": "Dermatologia"},
        "doctor": {"id": "dr_2", "name": "Dra. Helena"},
        "room": {"id": "room_2", "name": "Sala 2"}
      }
    ]
  }
}
```

A coleção contém até cinco registros, não necessariamente cinco. `bestDay`, `peakHour` e `bestRoom` podem ser `null` sem consultas.

### 4.3 Calendário — intervalo visível enviado na requisição

```http
GET /api/calendar?startDate=2026-09-27&endDateExclusive=2026-11-01
```

```json
{
  "data": {
    "today": "2026-11-10",
    "missingDateTotal": 0,
    "countsByDate": {
      "2026-09-30": 2,
      "2026-10-01": 3,
      "2026-10-27": 4
    }
  }
}
```

Todas as datas visíveis ausentes do mapa têm zero consultas. O frontend já conhece início e fim porque os enviou; não precisa recebê-los novamente. “Fim exclusivo” significa que 01/11 não entra nessa consulta. Nenhuma decisão de layout pertence ao backend.

### 4.4 Dia — GET /api/calendar/days/2026-11-10

```json
{
  "meta": {"timezone": "America/Sao_Paulo", "evaluatedAt": "2026-11-10T12:15:00-03:00"},
  "data": {
    "date": "2026-11-10",
    "summary": {"total": 4, "complete": 2, "pending": 1, "cancelled": 1, "completionPercentage": 50},
    "appointmentsByHour": {
      "hours": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
      "counts": [0,0,0,0,0,0,0,0,0,2,1,0,0,1,0,0,0,0,0,0,0,0,0,0]
    },
    "appointmentsByDayPeriod": {"morning": 3, "afternoon": 1},
    "rooms": [
      {"id": "room_1", "name": "Sala 1", "appointmentCount": 3, "cancelledCount": 1, "totalSlots": 4, "occupiedSlots": 2, "occupancyPercentage": 50, "peakHour": 9},
      {"id": "room_2", "name": "Sala 2", "appointmentCount": 1, "cancelledCount": 0, "totalSlots": 2, "occupiedSlots": 1, "occupancyPercentage": 50, "peakHour": 13}
    ]
  }
}
```

### 4.5 Analytics — GET /api/analytics?period=month&reference=2026-10

```json
{
  "meta": {
    "timezone": "America/Sao_Paulo",
    "evaluatedAt": "2026-11-10T12:15:00-03:00",
    "period": {"type": "month", "reference": "2026-10", "start": "2026-10-01T00:00:00-03:00", "endExclusive": "2026-11-01T00:00:00-03:00"},
    "previousPeriod": {"start": "2026-08-31T00:00:00-03:00", "endExclusive": "2026-10-01T00:00:00-03:00"}
  },
  "data": {
    "kpis": {
      "botCompletion": {"percentage": 50, "confirmedConversations": 4, "schedulingConversations": 8, "previousValue": 40, "difference": 10, "differenceUnit": "percentage_points"},
      "attendanceDuration": {"statistic": "median", "seconds": 150, "sampleSize": 4, "previousValue": 180, "difference": -30, "differenceUnit": "seconds"},
      "outsideBusinessHours": {"percentage": 30, "outsideConversations": 3, "startedConversations": 10, "previousValue": null, "difference": null, "differenceUnit": "percentage_points"},
      "agendaOccupancy": {"percentage": 50, "occupiedSlots": 10, "totalSlots": 20, "previousValue": 45, "difference": 5, "differenceUnit": "percentage_points"},
      "searchesWithoutSlots": {"count": 3, "previousValue": 2, "difference": 1, "differenceUnit": "count"}
    },
    "funnel": [
      {"stage": "started_scheduling", "count": 8, "percentage": 100},
      {"stage": "answered_specialty", "count": 7, "percentage": 87.5},
      {"stage": "received_slot_result", "count": 6, "percentage": 75},
      {"stage": "selected_slot", "count": 5, "percentage": 62.5},
      {"stage": "confirmed", "count": 4, "percentage": 50}
    ],
    "conversationEndings": [
      {"stage": "triage", "exited": 1, "abandoned": 1},
      {"stage": "slot_selection", "exited": 0, "abandoned": 1},
      {"stage": "patient_data", "exited": 1, "abandoned": 0},
      {"stage": "confirmation", "exited": 0, "abandoned": 0}
    ],
    "durationDistribution": {
      "unit": "seconds", "sampleSize": 4, "median": 150, "p90": 240,
      "buckets": [
        {"label": "1", "fromInclusive": 0, "toExclusive": 60, "count": 0},
        {"label": "2", "fromInclusive": 60, "toExclusive": 120, "count": 1},
        {"label": "3", "fromInclusive": 120, "toExclusive": 180, "count": 1},
        {"label": "4", "fromInclusive": 180, "toExclusive": 240, "count": 1},
        {"label": "5", "fromInclusive": 240, "toExclusive": 300, "count": 1},
        {"label": "6", "fromInclusive": 300, "toExclusive": 360, "count": 0},
        {"label": "7", "fromInclusive": 360, "toExclusive": 420, "count": 0},
        {"label": "8", "fromInclusive": 420, "toExclusive": 480, "count": 0},
        {"label": "9", "fromInclusive": 480, "toExclusive": 540, "count": 0},
        {"label": "10", "fromInclusive": 540, "toExclusive": 600, "count": 0},
        {"label": "10+", "fromInclusive": 600, "toExclusive": null, "count": 0}
      ]
    },
    "conversationHeatmap": {
      "bucketStartHours": [0,2,4,6,8,10,12,14,16,18,20,22],
      "rows": [
        {"weekday": 1, "counts": [1,0,0,0,2,0,0,0,0,0,0,0]},
        {"weekday": 2, "counts": [1,0,0,0,3,0,0,0,0,0,0,0]},
        {"weekday": 3, "counts": [1,0,0,0,2,0,0,0,0,0,0,0]},
        {"weekday": 4, "counts": [0,0,0,0,0,0,0,0,0,0,0,0]},
        {"weekday": 5, "counts": [0,0,0,0,0,0,0,0,0,0,0,0]},
        {"weekday": 6, "counts": [0,0,0,0,0,0,0,0,0,0,0,0]},
        {"weekday": 0, "counts": [0,0,0,0,0,0,0,0,0,0,0,0]}
      ]
    },
    "completionSeries": {
      "grouping": "month_blocks", "movingAverageWindow": 3,
      "points": [
        {"label": "01–07", "started": 2, "confirmed": 1, "percentage": 50, "movingAverage": 50},
        {"label": "08–14", "started": 2, "confirmed": 1, "percentage": 50, "movingAverage": 50},
        {"label": "15–21", "started": 1, "confirmed": 0, "percentage": 0, "movingAverage": 33.3333333333},
        {"label": "22–28", "started": 2, "confirmed": 1, "percentage": 50, "movingAverage": 33.3333333333},
        {"label": "29–31", "started": 1, "confirmed": 1, "percentage": 100, "movingAverage": 50}
      ]
    },
    "searchesWithoutSlotsBySpecialty": [
      {"specialtyId": "sp_2", "name": "Dermatologia", "count": 2},
      {"specialtyId": "sp_3", "name": "Ortopedia", "count": 1}
    ]
  }
}
```

### 4.6 Lista de conversas — GET /api/conversations?ids=cv_1,cv_2

```json
{
  "meta": {"timezone": "America/Sao_Paulo", "evaluatedAt": "2026-11-10T12:15:00-03:00"},
  "data": [
    {"id": "cv_1", "effectiveStatus": "active", "lastInteractionAt": "2026-11-10T12:01:00-03:00"},
    {"id": "cv_2", "effectiveStatus": "abandoned", "lastInteractionAt": "2026-11-10T09:00:00-03:00"}
  ]
}
```

### 4.7 Reservas da conversa — GET /api/conversations/cv_1/appointments

```json
{
  "meta": {"timezone": "America/Sao_Paulo", "evaluatedAt": "2026-11-10T12:15:00-03:00"},
  "data": [
    {
      "id": "ap_101", "status": "pending", "canCancel": true,
      "patient": {"id": "pt_1", "name": "Ana Silva"},
      "specialty": {"id": "sp_2", "name": "Dermatologia"},
      "doctor": {"id": "dr_2", "name": "Dra. Helena"},
      "room": {"id": "room_1", "name": "Sala 1"},
      "startsAt": "2026-11-11T09:00:00-03:00",
      "endsAt": "2026-11-11T09:30:00-03:00"
    }
  ]
}
```

`canCancel` exige também conversa efetivamente ativa. Reservas completas/canceladas nunca são canceláveis. O POST sempre revalida, mesmo que o GET tenha informado `true`.

### 4.8 Erro

```json
{
  "error": {
    "code": "INVALID_PERIOD",
    "message": "Para period=month, reference deve usar YYYY-MM.",
    "fields": {"reference": "Formato inválido."}
  }
}
```

## 5. Queries conceituais

### 5.1 Convenções dos exemplos

`Reservas`, `Horarios`, `Conversas`, `Eventos`, `Buscas`, `Expediente`, `Salas` e `Medicos` são relações lógicas ilustrativas. Não são nomes de tabelas aprovados. `DATA_LOCAL`, `SEGUNDOS_ENTRE`, `HORAS_DO_EXPEDIENTE_NO_PERIODO` etc. são pseudofunções explicativas. A SQL deve ser adaptada depois, usando parâmetros e os relacionamentos reais do schema.

Datas locais são sempre obtidas em `America/Sao_Paulo`. `:agora` é capturado uma vez por requisição. As expressões de cancelamento, encerramento e última interação representam fatos recuperáveis, não colunas obrigatórias.

### 5.2 Status, totais e calendário

```sql
WITH ConsultasClassificadas AS (
    SELECT reserva.identificador, horario.sala, horario.inicio,
           CASE WHEN reserva.cancelada THEN 'cancelled'
                WHEN :agora >= horario.fim THEN 'complete'
                ELSE 'pending' END AS status
    FROM Reservas reserva
    JOIN Horarios horario ON horario.identificador = reserva.horario
    WHERE horario.inicio >= :inicio AND horario.inicio < :fim
)
SELECT COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END), 0) AS completas,
       COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pendentes,
       COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) AS canceladas
FROM ConsultasClassificadas;
```

Para calendário, agrupar a mesma base por `DATA_LOCAL(inicio)` usando o intervalo enviado pelo frontend. Para melhor dia, ordenar por quantidade decrescente e data crescente. Por hora, usar `HORA_LOCAL(inicio)`; por sala, o vínculo do horário. Nenhuma dessas contagens exclui canceladas.

### 5.3 Ocupação sem multiplicação por histórico

```sql
SELECT horario.sala,
       COUNT(*) AS horarios_totais,
       SUM(CASE WHEN EXISTS (
           SELECT 1 FROM Reservas reserva
           WHERE reserva.horario = horario.identificador
             AND NOT reserva.cancelada
       ) THEN 1 ELSE 0 END) AS horarios_ocupados
FROM Horarios horario
WHERE horario.inicio >= :inicio AND horario.inicio < :fim
GROUP BY horario.sala;
```

Ocupação = `100 × ocupados / totais`, ou `null` sem capacidade. O mesmo horário pode ter reservas canceladas antigas; `EXISTS` evita contá-lo mais de uma vez. Para ocupação geral, usar a mesma base sem agrupar por sala. Não fazer média simples dos percentuais de salas: dividir a soma dos ocupados pela soma dos totais.

### 5.4 Pico, média das outras horas e salas

```sql
WITH Contagens AS (
    SELECT HORA_LOCAL(horario.inicio) AS hora, COUNT(*) AS consultas
    FROM Reservas reserva
    JOIN Horarios horario ON horario.identificador = reserva.horario
    WHERE horario.inicio >= :inicio AND horario.inicio < :fim
    GROUP BY HORA_LOCAL(horario.inicio)
), Serie AS (
    SELECT grade.hora, COALESCE(contagens.consultas, 0) AS consultas
    FROM HORAS_DO_EXPEDIENTE_NO_PERIODO(:inicio, :fim) grade
    LEFT JOIN Contagens contagens ON contagens.hora = grade.hora
)
SELECT * FROM Serie ORDER BY consultas DESC, hora ASC;
```

Primeira linha é o pico; média usa as outras horas, incluindo zeros. A grade lógica contém cada faixa horária elegível uma vez, não uma repetição por dia. Ela deriva do expediente; não é tabela nova obrigatória. Sem consultas, retornar pico `null`, não escolher uma hora arbitrária de valor zero.

Para Dia: agrupar consultas por sala, calcular pico de cada sala e unir à capacidade calculada separadamente. Partir do cadastro de salas para preservar linhas sem consultas. Resumo manhã/tarde usa `hora < 12` e `hora >= 12`.

### 5.5 Listagens de reservas

```sql
SELECT reserva, horario, paciente, medico, especialidade, sala
FROM Reservas reserva
JOIN Horarios horario ON horario.identificador = reserva.horario
JOIN Pacientes paciente ON paciente.identificador = reserva.paciente
JOIN Medicos medico ON medico.identificador = horario.medico
JOIN Especialidades especialidade ON especialidade.identificador = medico.especialidade
JOIN Salas sala ON sala.identificador = horario.sala
WHERE reserva.conversa_origem = :conversa
ORDER BY horario.inicio, reserva.identificador;
```

Para próximas consultas da Home, a base não é limitada a uma conversa: filtrar `NOT cancelada AND horario.inicio > :agora`, ordenar por início e limitar a cinco. Não filtrar pelo mês histórico da Home. Para o chat, nunca retirar o filtro da conversa de origem.

### 5.6 Coorte de conversas, funil e conclusão

```sql
WITH Coorte AS (
    SELECT identificador, inicio FROM Conversas
    WHERE inicio >= :inicio AND inicio < :fim AND inicio <= :agora
), Marcos AS (
    SELECT conversa.identificador,
        MAX(CASE WHEN evento.tipo = 'STARTED_SCHEDULING' THEN 1 ELSE 0 END) AS iniciou,
        MAX(CASE WHEN evento.tipo = 'ANSWERED_SPECIALTY' THEN 1 ELSE 0 END) AS triagem,
        MAX(CASE WHEN evento.tipo = 'SLOT_SEARCH_RESULT' THEN 1 ELSE 0 END) AS viu,
        MAX(CASE WHEN evento.tipo = 'SELECTED_SLOT' THEN 1 ELSE 0 END) AS escolheu,
        MAX(CASE WHEN evento.tipo = 'APPOINTMENT_CONFIRMED' THEN 1 ELSE 0 END) AS confirmou
    FROM Coorte conversa
    LEFT JOIN Eventos evento ON evento.conversa = conversa.identificador
                            AND evento.instante <= :agora
    GROUP BY conversa.identificador
)
SELECT SUM(iniciou), SUM(triagem), SUM(viu), SUM(escolheu), SUM(confirmou)
FROM Marcos WHERE iniciou = 1;
```

Normalizar somas vazias para zero. `SLOT_SEARCH_RESULT` inclui ausência de opções. Cada conversa entra no máximo uma vez em cada marco. Conclusão é `100 × confirmou / iniciou`, ou `null` se nenhuma iniciou. Não filtrar eventos pela data final da coorte: uma confirmação no mês seguinte ainda pertence ao grupo de início da conversa.

### 5.7 Primeira confirmação, mediana e P90

```sql
WITH PrimeiraConfirmacao AS (
    SELECT conversa, MIN(instante) AS primeira
    FROM Eventos
    WHERE tipo = 'APPOINTMENT_CONFIRMED' AND instante <= :agora
    GROUP BY conversa
), Duracoes AS (
    SELECT conversa.identificador,
           SEGUNDOS_ENTRE(conversa.inicio, confirmacao.primeira) AS segundos
    FROM Conversas conversa
    JOIN PrimeiraConfirmacao confirmacao ON confirmacao.conversa = conversa.identificador
    WHERE conversa.inicio >= :inicio AND conversa.inicio < :fim
), Ordenadas AS (
    SELECT segundos,
           ROW_NUMBER() OVER (ORDER BY segundos) AS posicao,
           COUNT(*) OVER () AS quantidade
    FROM Duracoes
)
SELECT * FROM Ordenadas;
```

Mediana é o valor central; para N par, a média dos dois centrais. P90 usa posição `ceil(0,90 × N)` contando a partir de 1. Histograma agrupa `[0,60)`, `[60,120)`, até `[540,600)` e `[600,+infinito)`. Sem amostras, estatísticas `null` e contagens das faixas zero. Essas operações podem ser implementadas em queries apropriadas ao banco escolhido; não exigem colunas de métricas prontas.

### 5.8 Estado efetivo e términos

```sql
SELECT conversa.identificador,
       CASE WHEN conversa.encerrada_explicitamente THEN conversa.etapa_de_saida
            ELSE conversa.etapa_atual END AS etapa_de_termino,
       CASE WHEN conversa.encerrada_explicitamente THEN 'exited'
            WHEN :agora > conversa.ultima_interacao + INTERVALO_DE_UMA_HORA THEN 'abandoned'
            ELSE 'active' END AS situacao
FROM Conversas conversa
WHERE conversa.inicio >= :inicio AND conversa.inicio < :fim;
```

Agrupar somente situações exited/abandoned e etapas triage, slot_selection, patient_data, confirmation. Menu é excluído. Última interação pode ser obtida por agregação dos registros. Não persistir abandono nem considerar um GET como atividade.

### 5.9 Fora do expediente e heatmap

```sql
SELECT COUNT(*) AS iniciadas,
       SUM(CASE WHEN NOT EXISTS (
           SELECT 1 FROM Expediente expediente
           WHERE expediente.dia_semana = DIA_DA_SEMANA_LOCAL(conversa.inicio)
             AND HORA_LOCAL_COMPLETA(conversa.inicio) >= expediente.abertura
             AND HORA_LOCAL_COMPLETA(conversa.inicio) < expediente.fechamento
       ) THEN 1 ELSE 0 END) AS fora
FROM Conversas conversa
WHERE conversa.inicio >= :inicio AND conversa.inicio < :fim;
```

```sql
SELECT DIA_DA_SEMANA_LOCAL(inicio) AS dia,
       FLOOR(HORA_LOCAL(inicio) / 2) AS faixa,
       COUNT(*) AS quantidade
FROM Conversas
WHERE inicio >= :inicio AND inicio < :fim
GROUP BY DIA_DA_SEMANA_LOCAL(inicio), FLOOR(HORA_LOCAL(inicio) / 2);
```

Preencher as combinações ausentes com zero apenas representa ausência de registros; não cria valores fictícios. O denominador de fora do expediente é todas as conversas iniciadas, não somente as de agendamento.

### 5.10 Buscas sem horário

```sql
SELECT especialidade, COUNT(*) AS quantidade
FROM Buscas
WHERE resultado = 'NO_SLOTS'
  AND instante >= :inicio AND instante < :fim
GROUP BY especialidade
ORDER BY quantidade DESC;
```

Não usar `COUNT(DISTINCT conversa)`. Soma das especialidades coincide com o KPI. Repetição de uma mesma requisição HTTP não produz outra ocorrência; uma nova busca efetiva do paciente pode produzir.

### 5.11 Série e média móvel

Agrupar a coorte da query 5.6 pelo início da conversa em dia/bloco/mês; aplicar a mesma fórmula de conclusão por grupo; completar grupos vazios antes da janela.

```sql
SELECT bloco, percentual,
       AVG(percentual) OVER (
           ORDER BY ordem
           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ) AS media_movel
FROM SerieComTodosOsBlocos;
```

`percentual` é NULL sem base. A média usa somente valores calculáveis dentro das três posições. Não ponderar a linha móvel pela quantidade de conversas: é média dos percentuais, conforme o escopo. KPI total continua sendo razão dos totais, não média da série.

## 6. Verificação de integração

- Todas as respostas são derivadas do banco; exemplos não entram como constantes de negócio.
- GETs não alteram conversa, atividade ou eventos de busca.
- O frontend escolhe o intervalo da grade e não recebe decisões de layout do backend.
- Calendário, Dia e soma por sala conciliam por data.
- Ocupação não multiplica horários com reservas históricas.
- Analytics preserva bases temporais distintas e semântica de NULL/zero.
- API de conversas não oferece listagem irrestrita ou pesquisa de pacientes por nome.
- Contratos de escrita seguem o documento do bot; schema físico continua reservado à modelagem.
