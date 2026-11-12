# Mocks do frontend

Fixtures visuais simplificados para composição das telas. Não representam contratos completos da API nem valores fixos de aceitação. Os tipos exportados derivam das constantes (typeof/as const): descrevem esses exemplos, não os tipos gerais da integração.

Origem: exemplos da [API, §4](../.agents/context/completo/kenko-backend-api.md#4-exemplos-json) e do [bot, §5–6](../.agents/context/completo/kenko-bot-api.md#5-exemplos-json-caminho-completo-de-agendamento). Campos mantidos preservam nomes e valores dos exemplos, exceto os ajustes visuais autorizados: clínica chamada “Clínica” e consulta da Home em 20/11/2026 às 13h. Na integração, consultar o contrato da operação e as regras do [contexto](../.agents/context/contexto-front.md).

## Catálogo

| Área | Fixture | Conteúdo |
| --- | --- | --- |
| Home | [home.ts](home/home.ts) | Resumo mensal e próximas consultas. |
| Calendário | [calendario.ts](calendar/calendario.ts) | Contagens por data. |
| Dia | [dia.ts](day/dia.ts) | Resumo, distribuições e salas. |
| Analytics | [analytics.ts](analytics/analytics.ts) | KPIs, funil e séries. |
| Compartilhado | [clinica.ts](shared/clinica.ts) | Nome da clínica, reutilizado por Home e Showcase. |
| Compartilhado | [lista_de_conversas.ts](shared/lista_de_conversas.ts) | Estado/atividade das conversas. |
| Showcase | [criar_conversa_response.ts](showcase/criar_conversa_response.ts) | Apresentação inicial. |

### Cenários do Showcase

- [abandono_historico_e_ocultacao_response](showcase/extras/abandono_historico_e_ocultacao_response.ts)
- [abrir_lista_de_agendamentos_response](showcase/extras/abrir_lista_de_agendamentos_response.ts)
- [cancelar_reserva_pendente_response](showcase/extras/cancelar_reserva_pendente_response.ts)
- [escolher_agendar_response](showcase/extras/escolher_agendar_response.ts)
- [escolher_horario_response](showcase/extras/escolher_horario_response.ts)
- [informacoes_da_clinica_response](showcase/extras/informacoes_da_clinica_response.ts)
- [informar_paciente_e_confirmar_response](showcase/extras/informar_paciente_e_confirmar_response.ts)
- [ler_estado_sem_registrar_atividade_response](showcase/extras/ler_estado_sem_registrar_atividade_response.ts)
- [primeira_consulta_e_resultado_da_busca_response](showcase/extras/primeira_consulta_e_resultado_da_busca_response.ts)
- [responder_especialidade_response](showcase/extras/responder_especialidade_response.ts)
- [sair_response](showcase/extras/sair_response.ts)
- [sem_horarios_response](showcase/extras/sem_horarios_response.ts)
- [validacao_por_etapa_response](showcase/extras/validacao_por_etapa_response.ts)

## Simplificações

- Showcase não mantém IDs, effectiveStatus, revision, step, attemptId, availableActions ou result; objetos conversation vazios foram removidos. Isso inclui IDs necessários a escolhas e deduplicação na integração.
- shared/clinica.ts conserva apenas o nome. Endereço, telefone, expediente e especialidades continuam necessários ao fluxo de informações da clínica.
- Calendário omite missingDateTotal; datas ausentes no mapa representam zero conforme o contrato.
- Home, Dia e Analytics omitem meta. O Dia conserva as 24 horas e as contagens originais.
- Payloads de entrada, estado interno, erro genérico e listagem independente de reservas não têm fixtures próprios. Os contratos completos continuam nos complementos técnicos; a ausência de um cenário não elimina o requisito.

O conjunto serve à apresentação, não simula todas as transições ou garantias do bot. Não preencher lacunas de contrato por inferência dos fixtures nem usar sua existência como evidência de funcionalidade implementada.
