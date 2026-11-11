# Mocks do frontend

Os valores destes mocks foram extraídos dos exemplos JSON em `docs/kenko-backend-api.md` e `docs/kenko-bot-api.md`. Os campos mantidos preservam os nomes e valores de origem; os tipos exportados são derivados das constantes (`typeof`).

## Pastas

- `home`: resumo mensal e próximas consultas.
- `calendar`: contagens por data para a grade mensal.
- `day`: resumo, distribuição por hora/período e salas de um dia.
- `analytics`: KPIs, funil e séries analíticas.
- `showcase`: respostas usadas para as telas do Showcase.
- `shared`: dados da clínica e listas de conversas reaproveitados por telas/fluxos.

Home e Showcase reutilizam o nome da clínica de `shared/clinica.ts`, pois os contratos apresentam os mesmos dados da clínica.

## Tipagem provisória

Os documentos não declaram interfaces ou aliases TypeScript temporários. Por isso, os tipos exportados aqui são inferidos dos exemplos JSON, sem acrescentar campos ou escolher tipos de domínio não documentados. Datas e horários permanecem strings como no JSON. Os exemplos não determinam valores de produção: as imagens em `public/assets` serviram apenas para mapear telas e dados visíveis.

## Relatório inline: limpeza aplicada

Itens removidos por não contribuírem para reproduzir os designs atuais em `public/assets`:

- Arquivos de payload de entrada em `showcase/requests/` e a pasta vazia.
- `showcase/estado_logico.ts`, estado interno da conversa sem representação visual.
- `shared/erro_response.ts` e `shared/reservas_da_conversa.ts`, respostas sem estado correspondente nos designs fornecidos.
- Nas respostas de Showcase: `id`, `effectiveStatus`, `revision`, `step`, `attemptId`, `availableActions` e `result`; os objetos `conversation` vazios após essa remoção também foram retirados.
- Em `shared/clinica.ts`: `id`, `address`, `phone`, `openingHours` e `specialties`; ficou apenas o nome usado no cabeçalho, compartilhado com Home e Showcase.
- `calendar.data.missingDateTotal`, que não possui componente na grade.
- Metadados `meta` em Home, Dia e Analytics. O gráfico do Dia mantém todas as horas de 0h a 23h e as contagens correspondentes do exemplo original.

Esta nota registra a limpeza realizada. Os valores que permaneceram foram preservados dos exemplos documentados.
