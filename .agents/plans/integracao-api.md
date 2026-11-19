# Plano: integração com a Kenko API

Objetivo: as páginas consumirem a API real (`kenko-api`), sem quebrar os testes existentes e respeitando as regras do contexto (§3, §5, §7): GET nunca avança fluxo, transcrição só em `localStorage`, falha de rede não prova sucesso, reenvio com o mesmo `actionId`.

Contrato autoritativo: `docs/endpoint/README.md` do repositório `kenko-api`. O `requests.http` de lá percorre o fluxo completo do bot.

Decisões aprovadas: URL por `VITE_API_URL`; TanStack Query para leituras; painéis antes do Showcase; o backend devolve a saudação quando a criação de conversa é repetida com o mesmo contato.

## Etapas

| Etapa | Entrega | Depende de |
|---|---|---|
| F0 | Fundação: `VITE_API_URL`, cliente HTTP, TanStack Query, `QueryState`, utilitários de teste | — |
| F1 | Home | F0 |
| F2 | Calendário | F0 |
| F3 | Dia | F0 |
| F4 | Analytics | F0 |
| F5 | Showcase (bot) | F0 e a saudação no replay, no backend |

## Padrão das páginas (F1 a F4)

- Hook `useXxx` em `features/<feature>/api.ts`, com `useQuery`, chave por parâmetro e `placeholderData: keepPreviousData` quando a URL troca de período.
- Container fino + conteúdo por props: páginas que já recebem `data` nos testes continuam aceitando; sem `data`, um carregador com o hook busca e entrega ao mesmo conteúdo.
- Erros de parâmetro (`INVALID_*`, `FUTURE_PERIOD`, `MISSING_PARAMETER`) mostram a tela de data inválida da página, por `QueryState`.
- Tipos escritos à mão a partir do contrato. Usar os campos que o servidor já calcula, em vez de recalcular no cliente.

| Etapa | Endpoint | Mudanças principais |
|---|---|---|
| F1 Home | `GET /dashboard?month` | Fallback do mês passa a ser o mês atual; remove o refiltro de próximas consultas por `new Date()` (o servidor já entrega até 5 futuras). |
| F2 Calendário | `GET /calendar?startDate&endDateExclusive` | Intervalo = primeira célula da grade até o dia seguinte à última; `today` vem do servidor. |
| F3 Dia | `GET /calendar/days/{date}` | Usa `completionPercentage`, `occupancyPercentage` e `appointmentsByDayPeriod` do servidor. |
| F4 Analytics | `GET /analytics?period&reference` | Semana e ano passam a funcionar; `grouping` é `daily`, `month_blocks` ou `monthly`; padrão é o mês atual. |

## F5 Showcase

- Estado por conversa em reducer (não TanStack Query); `localStorage` versionado `kenko:showcase:v1:*` com ids conhecidos, ocultos, selecionado, transcrição por conversa (deduplicada pelo id da mensagem do bot), último estado e a criação pendente.
- Criação: `contactId` novo por intenção, gravado antes do POST e reaproveitado se a criação falhar.
- Ações: `actionId` novo por ação, `expectedRevision` da última resposta, uma requisição em voo por conversa; falha de rede mantém a ação pendente para reenvio com o mesmo `actionId`.
- Renderização por `view.type` (`options`, `slots`, `patient_form`, `appointments`, `clinic_information`, `closed`); Sair vem de `availableActions`.
- Erros por código: `SLOT_UNAVAILABLE` aplica a view de recuperação; `STALE_CONVERSATION_STATE` atualiza por GET sem reenviar; encerrada ou abandonada desabilita a entrada e oferece novo atendimento; erros de campo aparecem no formulário.
- Lista atualizada por `GET /conversations?ids=` (lotes de 50) a cada 30 s com a aba visível; conversa inexistente fica "indisponível".

## Verificação

`npm run build` e `npm test` em cada etapa (lint não configurado). Manual: API com `db:seed` em `localhost:8080`, front em `localhost:5173`; cada página com dados reais, troca de período, API parada (erro com "Tentar novamente") e parâmetro inválido.
