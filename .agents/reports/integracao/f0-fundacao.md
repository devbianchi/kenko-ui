## F0 — Fundação da integração com a API
Status: 14/14 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | URL base vem de VITE_API_URL; ausente ou vazia usa `http://localhost:8080/api`; barra final removida | src/shared/api/config.ts:4 | src/shared/api/tests/client.test.ts:8, :13 | done |
| B2 | Leitura devolve só `data` do envelope `{meta, data}` | src/shared/api/client.ts:116 | src/shared/api/tests/client.test.ts:19 | done |
| B3 | Leitura que precisa do contexto devolve `meta` e `data` | src/shared/api/client.ts:99 | src/shared/api/tests/client.test.ts:24 | done |
| B4 | GET sem Content-Type (evita preflight); POST com corpo JSON e Content-Type | src/shared/api/client.ts:76 | src/shared/api/tests/client.test.ts:31, :41 | done |
| B5 | Envelope de erro vira ApiError com status, código, mensagem, campos e X-Request-Id | src/shared/api/client.ts:53 | src/shared/api/tests/client.test.ts:51 | done |
| B6 | 409 SLOT_UNAVAILABLE preserva conversation, messages, view e availableActions em payload | src/shared/api/client.ts:66 | src/shared/api/tests/client.test.ts:72 | done |
| B7 | Erro sem JSON (proxy, 502, 503 vazio) vira INTERNAL_ERROR ou SERVICE_UNAVAILABLE pelo status | src/shared/api/client.ts:44 | src/shared/api/tests/client.test.ts:99 | done |
| B8 | Resposta 200 fora do envelope é recusada | src/shared/api/client.ts:99 | src/shared/api/tests/client.test.ts:107 | done |
| B9 | Sem resposta vira NetworkError; cancelamento (AbortError) é repassado | src/shared/api/client.ts:87, :88 | src/shared/api/tests/client.test.ts:112, :117 | done |
| B10 | Códigos de parâmetro inválido e indisponibilidade são reconhecidos, e só eles | src/shared/api/ApiError.ts:50, :55 | src/shared/api/tests/client.test.ts:124, :132 | done |
| B11 | Consultas não repetem 4xx; repetem 5xx e rede até duas vezes; cliente novo por chamada | src/shared/api/queryClient.ts:7, :13 | src/shared/api/tests/queryClient.test.ts:6, :11, :18 | done |
| B12 | QueryState: carregando, depois dados | src/shared/components/QueryState.tsx:16 | src/shared/components/tests/QueryState.test.tsx:23 | done |
| B13 | QueryState: parâmetro recusado mostra a tela da página; sem ela, erro genérico | src/shared/components/QueryState.tsx:21 | src/shared/components/tests/QueryState.test.tsx:32, :40 | done |
| B14 | QueryState: erro de servidor com mensagem e código para suporte; API fora do ar; "Tentar novamente" refaz a consulta | src/shared/components/QueryState.tsx:26, :36 | src/shared/components/tests/QueryState.test.tsx:47, :61, :68 | done |

### File map
| File | Role | Change |
|------|------|--------|
| .env.example | config | novo: VITE_API_URL |
| src/vite-env.d.ts | config | novo: tipos de import.meta.env |
| vite.config.ts | config | porta 5173 fixa (strictPort) |
| package.json, package-lock.json | config | dependência @tanstack/react-query |
| src/shared/api/config.ts | data access | novo: URL base |
| src/shared/api/ApiError.ts | data access | novo: ApiError, NetworkError e classificações |
| src/shared/api/client.ts | data access | novo: request, getEnveloped, getData |
| src/shared/api/queryClient.ts | shared | novo: política de nova tentativa e factory |
| src/shared/components/QueryState.tsx | component | novo: carregamento, dados e erro |
| src/main.tsx | shared | QueryClientProvider |
| src/test/http.ts | test | novo: stubFetch, jsonResponse, envelope |
| src/test/renderWithProviders.tsx | test | novo: TanStack Query e roteador em memória |
| src/test/setup.ts | test | desfaz stubGlobal após cada teste |
| src/shared/api/tests/client.test.ts, queryClient.test.ts | test | novos |
| src/shared/components/tests/QueryState.test.tsx | test | novo |
| README.md, AGENTS.md, .agents/context/contexto-front.md | documentation | etapa de integração, execução com a API, testes sem rede |
| .agents/context/completo/kenko-backend-api.md, mocks/README.md | documentation | autoridade do contrato; remove missingDateTotal |
| .agents/plans/integracao-api.md | documentation | novo: plano F0 a F5 |

Decisions: tipos de `data` confiados ao contrato, sem validação em runtime | sem Zod no projeto; o cliente valida o envelope e o erro, que são estrutura comum | rejected: validar cada endpoint com Zod (nova dependência e esquema duplicado do contrato)
Decisions: QueryState recebe a tela de parâmetro inválido pronta da página | as instruções da InvalidDate variam por página | rejected: QueryState montar a InvalidDate (acoplaria textos de cada página)
Decisions: queryKeys e hooks por página ficam para F1 a F4 | não há consumidor nesta etapa | rejected: criar agora sem uso
Obstacles: `npx vitest run` falhou em todos os testes, inclusive os antigos, com `localStorage` indefinido | Node 26 nesta máquina expõe um localStorage experimental que encobre o do jsdom (o projeto foi validado com Node 24) | nenhuma mudança no projeto; testes rodados com `NODE_OPTIONS=--no-experimental-webstorage`, documentado no README | verified by: AppHeader.test.tsx 7/7 com a flag
Checks: spec runs src/shared/api -> 17 passed; QueryState.test.tsx -> 6 passed. Final: `npm run build` (tsc -b strict + vite build) -> ok; full suite -> 148 passed (17 files); lint -> not run: não configurado
Outside scope (not fixed): o repositório não tem `.nvmrc`; o README recomenda Node 22.12+ ou 24
Open: F1 a F4 (páginas) e F5 (Showcase), conforme .agents/plans/integracao-api.md
