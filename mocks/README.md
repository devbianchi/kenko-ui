# Mocks do frontend

Os valores destes mocks foram extraídos dos exemplos JSON em `docs/kenko-backend-api.md` e `docs/kenko-bot-api.md`. Cada constante mantém os nomes e valores do contrato de origem; o tipo exportado em cada arquivo é derivado da própria constante (`typeof`).

## Pastas

- `home`: resumo mensal e próximas consultas.
- `calendar`: contagens por data para a grade mensal.
- `day`: resumo, distribuição por hora/período e salas de um dia.
- `analytics`: KPIs, funil e séries analíticas.
- `showcase`: requisições e respostas do fluxo conversacional.
- `shared`: dados da clínica, listas de conversas, reservas e erros reaproveitados por telas/fluxos.

O objeto da clínica em `showcase/informacoes_da_clinica_response.ts` reutiliza `shared/clinica.ts`, pois os dois contratos apresentam os mesmos dados da clínica.

## Tipagem provisória

Os documentos não declaram interfaces ou aliases TypeScript temporários. Por isso, os tipos exportados aqui são inferidos dos exemplos JSON, sem acrescentar campos ou escolher tipos de domínio não documentados. Datas e horários permanecem strings como no JSON. Os exemplos não determinam valores de produção: as imagens em `public/assets` serviram apenas para mapear telas e dados visíveis.
