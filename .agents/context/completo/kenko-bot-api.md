# Kenko — Fluxo, contratos e convenções do bot

Complemento do escopo acadêmico — escopo-kenko-v2.md e da especificação de endpoints, JSON e queries — kenko-backend-api.md. A abordagem recomendada foi aprovada: bot no backend, HTTP comum e um endpoint de interações, com responsabilidades internas separadas.

## 1. Requisitos e decisões técnicas

| Requisito funcional estabelecido | Convenção técnica adotada |
| --- | --- |
| Bot no backend, determinístico, sem WhatsApp/IA. | Processamento por etapas em funções internas; HTTP com requisição/resposta, sem streaming ou WebSocket. |
| Roteiro fixo no banco. | Perguntas, opções e textos lidos do roteiro; backend retorna um dos tipos limitados de `view`. |
| Contato novo por conversa e paciente exclusivo. | POST de criação recebe contato gerado no frontend; primeira identificação cria paciente, sem busca global. |
| Estado e eventos no banco, transcrição local. | Resposta retorna mensagens novas; GET retorna interface atual sem gerar mensagens ou atividade. |
| Uma conversa pode fazer várias reservas. | Identificar tentativas e preservar todos os resultados; nova tarefa não sobrescreve a anterior. |
| Confirmação efetiva e proteção contra dupla reserva. | Envio dos dados do paciente conclui a primeira reserva; transação garante consistência. |
| Controle contra repetição/estado antigo. | `actionId` por ação e `expectedRevision` por estado observado. |

Os nomes de propriedades do JSON são contratos de comunicação; não determinam colunas ou tabelas. A implementação física da revisão, deduplicação e integridade pertence à equipe do banco/backend.

## 2. Alternativas consideradas e limites

| Abordagem | Vantagens | Limitações | Situação |
| --- | --- | --- | --- |
| POST único de interações | Centraliza estado, validação, eventos e respostas; frontend simples. | Precisa de funções internas organizadas para não virar um manipulador enorme. | Adotada. |
| Endpoints por etapa/operação | Operações explícitas e contratos menores por rota. | Mais rotas e validações; risco de caminhos sem eventos analíticos. | Alternativa não adotada; não implementar em paralelo. |
| Frontend conduz fluxo com CRUDs genéricos | Útil para formulários tradicionais. | Desloca condução do bot para frontend e permite contornar etapas. | Incompatível com a escolha atual. |

Não criar endpoints públicos adicionais de paciente, reserva ou busca para que o frontend coordene o fluxo. Essas capacidades existem como funções internas.

Não incluir botão genérico “Voltar” para editar perguntas anteriores. O fluxo tem Sair, retorno ao menu após tarefas e opção de continuar após indisponibilidade. Um retorno arbitrário precisaria de aprovação específica e regras de invalidação de escolhas; não integra o contrato vigente.

## 3. Organização interna

```text
POST de interação
  → localizar conversa e ação já processada
  → calcular estado efetivo e validar revisão
  → validar entrada para o passo atual
  → executar função do passo
      → ler roteiro
      → consultar horários
      → criar/vincular paciente
      → confirmar/cancelar reserva
  → persistir resultado, eventos e nova etapa
  → montar mensagens novas, view e ações disponíveis
```

Não é necessária biblioteca de chatbot, serviço separado ou ferramenta de workflow. Uma máquina de estados simples, com transições e funções nomeadas, é suficiente. Os textos e opções vêm do banco; a execução de ações como confirmar reserva continua sendo código do backend.

### 3.1 Estado lógico

```json
{
  "id": "cv_1",
  "contactId": "contact_1",
  "effectiveStatus": "active",
  "revision": 4,
  "step": "patient_data",
  "attemptId": "attempt_1",
  "patientId": null,
  "context": {
    "specialtyId": "sp_2",
    "visitKind": "first_visit",
    "selectedSlotId": "slot_501"
  }
}
```

Esse é um exemplo de estado interno, não necessariamente a resposta pública integral nem uma coluna JSON no banco.

- `step`: etapa atual; o cliente não determina a próxima etapa.
- `revision`: versão numérica do estado conversacional, incrementada ao processar mudanças. Não é versionamento do roteiro.
- `attemptId`: distingue tentativas de agendamento da mesma conversa.
- `context`: escolhas da tentativa atual; limpar para nova tentativa não apaga seus registros históricos.
- `effectiveStatus`: active, closed ou abandoned; abandono é derivado e não persistido.
- `patientId`: vinculado exclusivamente ao contato/conversa, depois da identificação.

### 3.2 Passos e etapas analíticas

| Passo técnico | Conteúdo/ação | Etapa analítica |
| --- | --- | --- |
| menu | Agendar, informações, reservas e Sair. | Fora das quatro barras de términos. |
| specialty | Escolher especialidade. | Triagem. |
| visit_kind | Primeira consulta ou retorno. | Triagem; responder especialidade já alcança o marco Triagem do funil. |
| slot_selection | Escolher entre os horários retornados. | Escolha de horário. |
| continue_after_no_slots | Informar ausência e oferecer continuar/Sair. | Escolha de horário até voltar ao menu. |
| patient_data | Informar nome e nascimento na primeira reserva. | Dados do paciente. |
| confirmation | Operação interna de criação da reserva. | Confirmação; pode não existir espera interativa nessa etapa. |
| appointments | Ver reservas da conversa e cancelar pendentes. | Tarefa fora das quatro etapas de agendamento. |
| clinic_information | Ler informações e voltar ao menu. | Tarefa fora das quatro etapas de agendamento. |
| closed | Exibir despedida, sem continuar. | Preservar a etapa anterior de saída, não usar closed como barra. |

O gráfico não exige criar uma tela de confirmação. Como a confirmação é imediata após o envio válido, sua barra de abandono pode ser zero. Funil e estados não são inferidos do texto exibido: vêm dos eventos e passos estruturados.

## 4. Contrato de interação

### 4.1 Rotas

```http
POST /api/conversations
GET /api/conversations/{conversationId}
POST /api/conversations/{conversationId}/interactions
```

As listagens de conversas e agendamentos são especificadas no documento da API. Requisições usam `Content-Type: application/json`.

### 4.2 Requisição de ação

```json
{
  "actionId": "act_2",
  "expectedRevision": 1,
  "input": {"type": "select_option", "optionId": "opt_dermatology"}
}
```

| Tipo de input | Campos | Uso |
| --- | --- | --- |
| select_option | optionId | Menu, especialidade, primeira consulta/retorno e continuar. |
| select_slot | slotId | Horário apresentado naquela tentativa. |
| submit_patient | patient.name, patient.birthDate | Identificação estruturada para a primeira reserva. |
| cancel_appointment | appointmentId | Cancelar pendente da conversa atual, no contexto de consulta de reservas. |
| exit | Nenhum adicional | Encerrar imediatamente e responder adeus. |

`actionId` é novo para cada ação efetiva e mantido em reenvios da mesma ação. `expectedRevision` vem da última resposta. IDs, estado e horários são validados no backend; campos extras enviados não autorizam trocar médico, sala, paciente ou especialidade fora do fluxo.

### 4.3 Resposta

- `conversation`: estado público mínimo — id, effectiveStatus, revision, step, attemptId.
- `messages`: mensagens novas do bot retornadas pelo processamento de ação; frontend adiciona à transcrição local. O frontend também registra as entradas do usuário nessa transcrição, distinguindo autor e horário.
- `view`: controles/dados atuais para renderização.
- `availableActions`: ações globais, como exit, permitidas agora.
- `result`: resultado estruturado de confirmação/cancelamento, quando existir.

Tipos suficientes de `view`: options, slots, patient_form, appointments, clinic_information e closed. Não retornar HTML nem criar uma linguagem de telas arbitrária. Rótulos vêm do roteiro e dados de negócio do banco.

O frontend pode exibir “Bot digitando...” enquanto espera o HTTP. A animação não é interação do paciente, não renova atividade e não exige atraso artificial no backend.

## 5. Exemplos JSON: caminho completo de agendamento

Os exemplos abaixo formam uma sequência com revisões 0–5. Textos são ilustrativos; produção usa o roteiro cadastrado.

### 5.1 Criar conversa — POST /api/conversations

Requisição:

```json
{"contactId": "contact_1"}
```

Resposta 201:

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 0, "step": "menu", "attemptId": null},
  "messages": [{"id": "msg_1", "author": "bot", "text": "Olá! Sou o assistente Kenko. Como posso ajudar?", "sentAt": "2026-11-10T12:00:00-03:00"}],
  "view": {"type": "options", "options": [
    {"id": "opt_schedule", "label": "Agendar uma consulta"},
    {"id": "opt_clinic_info", "label": "Ver informações da clínica"},
    {"id": "opt_appointments", "label": "Ver ou cancelar um agendamento"}
  ]},
  "availableActions": ["exit"]
}
```

Nova Conversa gera novo contato no frontend. Ainda não há paciente. Repetir criação com o mesmo contato por falha de rede não cria uma segunda conversa nem duplica as boas-vindas; retornar a existente, sem renovar sua atividade. Uma intenção nova de criar conversa usa contato novo.

### 5.2 Escolher Agendar — POST /api/conversations/cv_1/interactions

```json
{"actionId": "act_1", "expectedRevision": 0, "input": {"type": "select_option", "optionId": "opt_schedule"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 1, "step": "specialty", "attemptId": "attempt_1"},
  "messages": [{"id": "msg_2", "author": "bot", "text": "Qual especialidade procura?", "sentAt": "2026-11-10T12:00:10-03:00"}],
  "view": {"type": "options", "options": [
    {"id": "opt_general", "label": "Clínico geral", "specialtyId": "sp_1"},
    {"id": "opt_dermatology", "label": "Dermatologia", "specialtyId": "sp_2"},
    {"id": "opt_orthopedics", "label": "Ortopedia", "specialtyId": "sp_3"},
    {"id": "opt_cardiology", "label": "Cardiologia", "specialtyId": "sp_4"}
  ]},
  "availableActions": ["exit"]
}
```

Criar tentativa lógica e registrar STARTED_SCHEDULING. Uma conversa que anteriormente só consultou informações passa a pertencer ao funil quando escolhe essa opção.

### 5.3 Responder especialidade

```json
{"actionId": "act_2", "expectedRevision": 1, "input": {"type": "select_option", "optionId": "opt_dermatology"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 2, "step": "visit_kind", "attemptId": "attempt_1"},
  "messages": [{"id": "msg_3", "author": "bot", "text": "É primeira consulta ou retorno em Dermatologia?", "sentAt": "2026-11-10T12:00:20-03:00"}],
  "view": {"type": "options", "options": [
    {"id": "opt_first_visit", "label": "Primeira consulta"},
    {"id": "opt_return", "label": "Retorno"}
  ]},
  "availableActions": ["exit"]
}
```

Registrar resposta e ANSWERED_SPECIALTY. O marco Triagem do funil já foi atingido, embora reste a segunda pergunta.

### 5.4 Primeira consulta e resultado da busca

```json
{"actionId": "act_3", "expectedRevision": 2, "input": {"type": "select_option", "optionId": "opt_first_visit"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 3, "step": "slot_selection", "attemptId": "attempt_1"},
  "messages": [{"id": "msg_4", "author": "bot", "text": "Estes são os horários disponíveis.", "sentAt": "2026-11-10T12:00:30-03:00"}],
  "view": {"type": "slots", "searchResult": "available", "slots": [
    {"id": "slot_501", "startsAt": "2026-11-11T09:00:00-03:00", "endsAt": "2026-11-11T09:30:00-03:00", "doctor": {"id": "dr_2", "name": "Dra. Helena"}, "room": {"id": "room_1", "name": "Sala 1"}},
    {"id": "slot_502", "startsAt": "2026-11-12T10:00:00-03:00", "endsAt": "2026-11-12T10:30:00-03:00", "doctor": {"id": "dr_2", "name": "Dra. Helena"}, "room": {"id": "room_2", "name": "Sala 2"}},
    {"id": "slot_503", "startsAt": "2026-11-16T07:00:00-03:00", "endsAt": "2026-11-16T07:30:00-03:00", "doctor": {"id": "dr_3", "name": "Dr. Paulo"}, "room": {"id": "room_1", "name": "Sala 1"}}
  ]},
  "availableActions": ["exit"]
}
```

Registrar resposta e SLOT_SEARCH_RESULT. Não introduzir pergunta de rotina/avaliação ou seleção separada de médico. Especialidade restringe médicos; médico e sala estão vinculados ao horário. Primeira consulta/retorno não altera duração ou disponibilidade sem regra adicional aprovada.

### 5.5 Escolher horário

```json
{"actionId": "act_4", "expectedRevision": 3, "input": {"type": "select_slot", "slotId": "slot_501"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 4, "step": "patient_data", "attemptId": "attempt_1"},
  "messages": [{"id": "msg_5", "author": "bot", "text": "Informe nome e data de nascimento de quem será atendido.", "sentAt": "2026-11-10T12:00:40-03:00"}],
  "view": {
    "type": "patient_form",
    "fields": [{"name": "name", "type": "text", "required": true}, {"name": "birthDate", "type": "date", "required": true}],
    "selectedSlot": {"id": "slot_501", "startsAt": "2026-11-11T09:00:00-03:00", "endsAt": "2026-11-11T09:30:00-03:00"}
  },
  "availableActions": ["exit"]
}
```

Validar opção da tentativa, início futuro e disponibilidade já na seleção; a escolha pode ser rejeitada se o horário não estiver mais disponível. Registrar SELECTED_SLOT para uma seleção válida. A seleção não reserva o horário nem garante que continuará livre até confirmar, quando a disponibilidade é revalidada. Não existe bloqueio temporário de disponibilidade aprovado.

### 5.6 Informar paciente e confirmar

```json
{
  "actionId": "act_5",
  "expectedRevision": 4,
  "input": {"type": "submit_patient", "patient": {"name": "Ana Silva", "birthDate": "1998-04-15"}}
}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 5, "step": "menu", "attemptId": null},
  "messages": [
    {"id": "msg_6", "author": "bot", "text": "Consulta confirmada para 11/11 às 09h.", "sentAt": "2026-11-10T12:01:00-03:00"},
    {"id": "msg_7", "author": "bot", "text": "Posso ajudar em mais alguma coisa?", "sentAt": "2026-11-10T12:01:00-03:00"}
  ],
  "view": {"type": "options", "options": [
    {"id": "opt_schedule", "label": "Agendar uma consulta"},
    {"id": "opt_clinic_info", "label": "Ver informações da clínica"},
    {"id": "opt_appointments", "label": "Ver ou cancelar um agendamento"}
  ]},
  "availableActions": ["exit"],
  "result": {"type": "appointment_confirmed", "appointment": {
    "id": "ap_101", "conversationId": "cv_1", "patientId": "pt_1", "slotId": "slot_501", "status": "pending",
    "confirmedAt": "2026-11-10T12:01:00-03:00", "startsAt": "2026-11-11T09:00:00-03:00", "endsAt": "2026-11-11T09:30:00-03:00"
  }}
}
```

Criar paciente exclusivo desse contato e reserva em operação consistente; registrar APPOINTMENT_CONFIRMED e voltar ao menu. Enviar dados válidos conclui a primeira reserva, sem tela extra de confirmação. Duração para analytics: 60 segundos. Não esperar Sair.

### 5.7 Reservas seguintes

Nova tentativa na mesma conversa responde novamente à triagem, busca e seleciona horário. Como há paciente identificado, a seleção válida do horário conclui a nova reserva com esse vínculo, sem pedir nome/nascimento novamente. Não há troca de paciente nessa conversa. Confirmar novamente preserva o primeiro instante de confirmação usado na mediana; a taxa de conclusão conta essa conversa apenas uma vez.

## 6. Exemplos dos outros caminhos

### 6.1 Ler estado sem registrar atividade — GET /api/conversations/cv_1

```json
{
  "conversation": {
    "id": "cv_1", "effectiveStatus": "active", "revision": 5, "step": "menu", "attemptId": null,
    "startedAt": "2026-11-10T12:00:00-03:00", "lastInteractionAt": "2026-11-10T12:01:00-03:00"
  },
  "view": {"type": "options", "options": [
    {"id": "opt_schedule", "label": "Agendar uma consulta"},
    {"id": "opt_clinic_info", "label": "Ver informações da clínica"},
    {"id": "opt_appointments", "label": "Ver ou cancelar um agendamento"}
  ]},
  "availableActions": ["exit"]
}
```

Não há mensagens novas. O frontend reexibe a transcrição local e renderiza o estado atual. Se o passo é seleção de horários, GET reexibe a seleção já obtida, sem executar outra busca funcional. Ela pode ter ficado indisponível; a escrita revalida. GET não deve mudar o fluxo silenciosamente.

### 6.2 Abrir lista de agendamentos

```json
{"actionId": "act_6", "expectedRevision": 5, "input": {"type": "select_option", "optionId": "opt_appointments"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 6, "step": "appointments", "attemptId": null},
  "messages": [{"id": "msg_8", "author": "bot", "text": "Estes são os agendamentos desta conversa.", "sentAt": "2026-11-10T12:01:30-03:00"}],
  "view": {"type": "appointments", "appointments": [
    {"id": "ap_101", "status": "pending", "canCancel": true, "startsAt": "2026-11-11T09:00:00-03:00", "endsAt": "2026-11-11T09:30:00-03:00", "patient": {"id": "pt_1", "name": "Ana Silva"}, "doctor": {"id": "dr_2", "name": "Dra. Helena"}, "specialty": {"id": "sp_2", "name": "Dermatologia"}, "room": {"id": "room_1", "name": "Sala 1"}}
  ], "options": [{"id": "opt_menu", "label": "Voltar ao menu"}]},
  "availableActions": ["exit"]
}
```

O botão de menu conclui a consulta de reservas; não é o recurso genérico de editar passos anteriores. Listar uma conversa vazia retorna appointments vazio e permite voltar ao menu. Reservas completas/canceladas podem ser vistas, mas têm canCancel false.

### 6.3 Cancelar reserva pendente

```json
{"actionId": "act_7", "expectedRevision": 6, "input": {"type": "cancel_appointment", "appointmentId": "ap_101"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "active", "revision": 7, "step": "menu", "attemptId": null},
  "messages": [{"id": "msg_9", "author": "bot", "text": "Agendamento cancelado.", "sentAt": "2026-11-10T12:02:00-03:00"}],
  "view": {"type": "options", "options": [
    {"id": "opt_schedule", "label": "Agendar uma consulta"},
    {"id": "opt_clinic_info", "label": "Ver informações da clínica"},
    {"id": "opt_appointments", "label": "Ver ou cancelar um agendamento"}
  ]},
  "availableActions": ["exit"],
  "result": {"type": "appointment_cancelled", "appointmentId": "ap_101"}
}
```

Validar origem, status pendente e conversa ativa no backend. Não confiar em canCancel recebido anteriormente. Preservar reserva cancelada, liberar horário quando ainda futuro, registrar resultado e voltar ao menu. Cancelar não apaga confirmação nem altera a primeira duração. Reserva completa é recusada, sem cancelamento ou liberação de horário.

### 6.4 Informações da clínica

A opção `opt_clinic_info` usa o mesmo POST de interações. Retorna dados da clínica do contrato GET /clinic, mensagem de apresentação e opções de menu, sem encerrar.

Exemplo independente:

```json
{"actionId": "act_info", "expectedRevision": 0, "input": {"type": "select_option", "optionId": "opt_clinic_info"}}
```

```json
{
  "conversation": {"id": "cv_info", "effectiveStatus": "active", "revision": 1, "step": "menu", "attemptId": null},
  "messages": [{"id": "msg_info", "author": "bot", "text": "Veja as informações da clínica.", "sentAt": "2026-11-10T12:05:00-03:00"}],
  "view": {
    "type": "clinic_information",
    "clinic": {
      "id": "clinic_1", "name": "Clínica Demonstração", "address": "Rua de Exemplo, 100", "phone": "1100000000",
      "openingHours": [{"weekdays": [1,2,3,4,5], "opensAt": "07:00", "closesAt": "18:00"}, {"weekdays": [6], "opensAt": "09:00", "closesAt": "13:00"}, {"weekdays": [0], "closed": true}],
      "specialties": [{"id": "sp_1", "name": "Clínico geral"}, {"id": "sp_2", "name": "Dermatologia"}, {"id": "sp_3", "name": "Ortopedia"}, {"id": "sp_4", "name": "Cardiologia"}]
    },
    "options": [{"id": "opt_schedule", "label": "Agendar uma consulta"}, {"id": "opt_clinic_info", "label": "Ver informações da clínica"}, {"id": "opt_appointments", "label": "Ver ou cancelar um agendamento"}]
  },
  "availableActions": ["exit"]
}
```

### 6.5 Sem horários

Resultado da resposta de triagem em outra conversa:

```json
{
  "conversation": {"id": "cv_3", "effectiveStatus": "active", "revision": 3, "step": "continue_after_no_slots", "attemptId": "attempt_3"},
  "messages": [{"id": "msg_20", "author": "bot", "text": "Não encontrei horários disponíveis. Deseja continuar?", "sentAt": "2026-11-10T12:10:00-03:00"}],
  "view": {"type": "options", "searchResult": "no_slots", "options": [{"id": "opt_continue", "label": "Continuar"}]},
  "availableActions": ["exit"]
}
```

Registrar SLOT_SEARCH_RESULT e uma ocorrência NO_SLOTS. Conta em Viram horários. `opt_continue` retorna ao menu, sem criar nova busca até a próxima tentativa efetiva. Uma ou duas opções válidas são resultado available, não no_slots.

### 6.6 Sair

Continuação da sequência de cancelamento:

```json
{"actionId": "act_8", "expectedRevision": 7, "input": {"type": "exit"}}
```

```json
{
  "conversation": {"id": "cv_1", "effectiveStatus": "closed", "revision": 8, "step": "closed", "attemptId": null},
  "messages": [{"id": "msg_10", "author": "bot", "text": "Até logo!", "sentAt": "2026-11-10T12:03:00-03:00"}],
  "view": {"type": "closed"},
  "availableActions": []
}
```

Preservar instante e passo anterior de saída antes de trocar step por closed. Não cancelar reservas existentes. Sair no menu não entra no gráfico de perdas durante agendamento.

## 7. Afunilamento e queries conceituais do fluxo

```text
especialidade escolhida
 → médicos dessa especialidade
 → horários desses médicos com médico/sala já definidos
 → início futuro e ausência de reserva não cancelada
 → até dois dias distintos da semana atual
 → até um horário mais próximo da próxima semana
```

Semana domingo–sábado em America/Sao_Paulo. Mostrar menos quando não houver três opções. Não buscar paciente antigo, não pedir médico como terceira pergunta e não alterar disponibilidade em função de primeira consulta/retorno.

SQL ilustrativa, sem nomes físicos obrigatórios:

```sql
SELECT horario, medico, sala
FROM Horarios horario
JOIN Medicos medico ON medico.identificador = horario.medico
JOIN Salas sala ON sala.identificador = horario.sala
WHERE medico.especialidade = :especialidade
  AND horario.inicio > :agora
  AND horario.inicio < :fim_da_proxima_semana
  AND NOT EXISTS (
      SELECT 1 FROM Reservas reserva
      WHERE reserva.horario = horario.identificador AND NOT reserva.cancelada
  )
ORDER BY horario.inicio, horario.identificador;
```

Sobre os registros elegíveis, escolher os mais próximos respeitando a distribuição de semanas/dias. Identificador estável resolve igualdade de instante como ordenação técnica, sem prioridade clínica. Não preencher posições faltantes com horários fora dessa distribuição.

Uma busca vazia significa ausência dentro do intervalo consultado; ela não afirma que jamais existirá disponibilidade em semanas posteriores. Reexibir essa seleção por GET não executa outra busca nem cria novo evento. Guardar/reconstruir os IDs da seleção pertence ao estado estruturado, não à transcrição.

## 8. Validações, estado antigo e repetição

### 8.1 Validação por etapa

Verificar existência e origem da opção, compatibilidade com o passo, horário pertencente à tentativa/especialidade, nome não vazio, nascimento válido e não futuro, paciente exclusivo, reserva da conversa e status efetivo. O cliente não envia próximo passo ou patientId para substituir o vínculo conhecido.

Erro por revisão antiga, HTTP 409:

```json
{"error": {"code": "STALE_CONVERSATION_STATE", "message": "A conversa mudou. Atualize a etapa atual.", "currentRevision": 5}}
```

O frontend consulta GET /conversations/{id}. Uma opção inválida retorna 422 sem avançar ou criar busca/reserva. Não tratar reenvios inválidos como eventos válidos de triagem.

### 8.2 Idempotência

Persistir o identificador da ação e seu resultado estruturado, com unicidade lógica por conversa. A mesma actionId com o mesmo conteúdo não executa novamente, não duplica busca/reserva, não avança estado e não renova atividade. A mesma actionId com conteúdo diferente é conflito, não uma ação nova.

Verificar ação já processada antes de rejeitar sua revisão antiga: o reenvio legítimo traz a revisão original. Resultados de duas requisições concorrentes com a mesma chave também precisam ser únicos, não somente reenvios sequenciais.

Não é necessário guardar o JSON textual inteiro ou a transcrição para deduplicar. Guardar resultado e referências estruturadas. IDs de mensagens permitem ao frontend evitar duplicar bolhas em reenvios. A recuperação de um resultado anterior não autoriza aplicar estado antigo sobre um mais novo: o cliente preserva a maior revisão conhecida e consulta o GET quando necessário. O estado efetivo pode mudar por inatividade sem mudar a revisão persistida; não usar revisão como substituta da verificação de abandono.

Revisão controla conflitos entre ações diferentes baseadas na mesma tela. Idempotência controla repetição da mesma ação. Nenhuma delas substitui a integridade da reserva do horário.

## 9. Confirmação e cancelamento transacionais

```text
Iniciar transação
  1. Identificar ação já processada ou proteger sua unicidade.
  2. Validar conversa ativa, revisão e passo.
  3. Revalidar o horário escolhido, início futuro e disponibilidade.
  4. Garantir que não existe outra reserva não cancelada.
  5. Criar paciente exclusivo se necessário.
  6. Criar reserva vinculada à conversa, paciente e horário.
  7. Registrar confirmação e fatos do fluxo.
  8. Atualizar passo/revisão e retornar logicamente ao menu.
  9. Registrar o resultado estruturado da ação.
Confirmar transação
Somente então devolver sucesso
```

Restrição, bloqueio ou combinação dependem do SGBD. Consultar livre e inserir depois sem proteção não atende ao requisito. Em falha, não pode restar reserva sem confirmação correspondente, confirmação sem reserva ou paciente duplicado pelo reenvio.

Se outro atendimento reservou o horário, recusar a seleção ou confirmação, sem devolver sucesso. Informar conflito, consultar novas opções e devolver estado atualizado para escolha. Essa busca efetiva registra seus próprios resultados; repetir a mesma ação não a repete. A resposta de conflito pode usar 409 com `error` e o estado/view de recuperação; o frontend não descarta a view por ser erro. Se a recuperação exigir novo registro, persistir esse resultado e revisão de forma consistente.

Cancelar também exige validar conversa, origem, revisão e status dentro da operação consistente. Registrar cancelamento sem apagar a reserva e retornar menu. Consultas completas são recusadas; já canceladas não são canceladas novamente como nova operação. A reexecução da mesma actionId devolve o resultado anterior sem alterar dados.

## 10. Abandono, histórico e ocultação

Antes de uma nova ação: se fechada, recusar continuação; se não fechada e `agora > última interação + 1 hora`, tratar como abandonada e recusar; caso contrário, processar. O relógio usa America/Sao_Paulo. Não gravar estado de abandono nem criar rotina que o atualize.

```json
{"error": {"code": "CONVERSATION_ABANDONED", "message": "Esta conversa terminou por inatividade. Inicie uma nova conversa."}}
```

O frontend inicia outra conversa com novo contato; não reabre a antiga. Seu paciente não é reaproveitado. Resultados antigos permanecem nas métricas.

GETs, atualizações automáticas, animação e reenvios idempotentes não são novas interações. Uma mensagem de adeus não reabre conversa. A lista usa última interação do banco, não o instante em que o visitante abriu a tela.

Transcrição e itens ocultos ficam no navegador. Ocultar só retira a conversa da lista, sem API de exclusão e sem alterar atividade, reservas ou analytics. Não há sincronização entre dispositivos nem recuperação obrigatória de texto apagado. Backend mantém estado, escolhas e evidências analíticas mesmo sem transcrição local.

## 11. Eventos e rastreabilidade

| Fato estruturado | Uso |
| --- | --- |
| Criação/início e última interação | Coorte temporal, heatmap, fora do expediente e abandono. |
| STARTED_SCHEDULING | Entrada da conversa no funil, mesmo se começou com informação. |
| ANSWERED_SPECIALTY | Marco Triagem; preservar também primeira consulta/retorno. |
| SLOT_SEARCH_RESULT | Marco Viram horários com ou sem opções. |
| Ocorrência NO_SLOTS | KPI e distribuição por especialidade no instante da busca. |
| SELECTED_SLOT | Marco Escolheram; não equivale a reserva. |
| APPOINTMENT_CONFIRMED | Confirmaram, taxa e primeira duração; cancelamento posterior não apaga. |
| Cancelamento | Status/ocupação e resultado da tarefa, mantendo histórico. |
| Saída com passo anterior | Gráfico de términos quando ocorreu durante agendamento. |

Esses nomes são identificadores semânticos do contrato técnico; não obrigam uma tabela por evento. Cada conversa conta uma vez por marco e sucesso; várias tentativas não inflacionam a taxa. Preservar marcos e resultados em vez de depender apenas do passo atual.

## 12. Verificação

- Criar conversa responde automaticamente; paciente só é criado na identificação.
- Mesmo contato reenviado não cria conversa duplicada; nova intenção usa contato novo.
- actionId repetida não duplica reserva, busca ou mensagem local.
- Duas ações diferentes com revisão antiga não avançam ambas o mesmo estado.
- Nome igual em outra conversa não reaproveita cadastro.
- Segunda reserva usa paciente da conversa e não altera sua primeira duração.
- GET não executa busca, não gera mensagem e não impede abandono.
- Busca sem opções registra ocorrência e alcança Viram horários; resultado parcial não conta como vazio.
- Seleção e confirmação revalidam disponibilidade; duas conversas não reservam o mesmo horário.
- Cancelamento verifica origem e bloqueia completas; Sair não cancela reservas.
- Retorno ao menu e consulta de informações não encerram; Sair envia adeus imediatamente.
- Abandono permanece calculado e sem retomada.
- As alternativas não adotadas e o botão genérico Voltar não viram requisitos por constarem deste documento.
